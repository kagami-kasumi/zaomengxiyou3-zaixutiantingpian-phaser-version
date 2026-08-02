// boundary: Stage 1-2 submits level input/environment/monster targets to HeroPartyRuntime;
// it keeps encounter waves and the not-yet-migrated monster runtime only.
import Phaser from 'phaser';
import { createInputSystem } from '../../systems/InputSystem';
import {
  createStage12Flow,
  defeatStage12Enemy,
  touchStage12StopPoint,
  updateStage12Spawners,
  type Stage12Enemy,
  type Stage12FlowModel,
} from '../../systems/Stage12FlowSystem';
import {
  STAGE12_GROUND_PLATFORM_ID,
  STAGE12_GROUND_TOP_Y,
} from '../../systems/Stage12Layout';
import type { TransferDoorView } from '../TransferDoorView';
import {
  getStage12CameraScrollX,
  getStage12TravelRight,
  hasReachedStage12StopPoint,
  stage12MovementPlatforms,
  STAGE12_SCREEN_LEFT_X,
} from '../../systems/Stage12TraversalSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../../systems/Stage11FlowSystem';
import {
  createStage1CombatEnemy,
  updateStage1Enemy,
  type Stage1CombatEnemy,
} from '../../systems/Stage1CombatSystem';
import { createStage12FbEnterBridge, type Stage12FbEnterHandle } from './Stage12FbEnterBridge';
import {
  createMonsterPhysics,
  updateMonsterPhysics,
  type MonsterPhysicsModel,
} from '../../systems/MonsterPhysicsSystem';
import { createStage1RewardBridge, type Stage1RewardBridge } from '../stage1/Stage1RewardBridge';
import { createStage1CombatHudBridge } from '../stage1/Stage1CombatHudBridge';
import { createStage1CombatEnemyHudSnapshot } from '../../systems/Stage1CombatHudSystem';
import { createHeroPartyRuntime, type HeroPartyRuntime } from '../HeroPartyRuntimeBridge';
import {
  createStage12MonsterView,
  destroyStage12MonsterView,
  readStage12AttackGeometry,
  updateStage12MonsterView,
  type Stage12AttackGeometryRegistry,
  type Stage12MonsterView,
} from './Stage12MonsterVisualBridge';

type EnemyRuntime = {
  model: Stage12Enemy;
  combat: Stage1CombatEnemy;
  view: Stage12MonsterView;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

type HeroSnapshots = ReturnType<HeroPartyRuntime['snapshots']>;

export type Stage12GameplayResult = 'failed' | 'cleared' | 'fb-entered';

export type Stage12GameplayHandle = Readonly<{
  flow: Stage12FlowModel;
  update: (deltaMs: number) => Stage12GameplayResult | undefined;
  destroy: () => void;
}>;

export function createStage12Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: TransferDoorView,
  fbEnterImage: Phaser.GameObjects.Image,
): Stage12GameplayHandle {
  const flow = createStage12Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const heroes = createHeroPartyRuntime(scene, playerViews, {
    groundY: STAGE12_GROUND_TOP_Y,
    groundPlatformId: STAGE12_GROUND_PLATFORM_ID,
  });
  const enemies = new Map<string, EnemyRuntime>();
  const monsterGeometry = readStage12AttackGeometry(scene);
  const fbEnter: Stage12FbEnterHandle = createStage12FbEnterBridge(
    scene,
    fbEnterImage,
    playerViews,
  );
  const rewards: Stage1RewardBridge = createStage1RewardBridge(
    scene,
    heroes.rewardPlayers(),
    stage12MovementPlatforms,
  );
  const hud = createStage1CombatHudBridge(
    scene,
    heroes.hudSnapshots,
    () => [...enemies.values()].map((enemy, index) =>
      createStage1CombatEnemyHudSnapshot(enemy.combat, index)),
  );
  const status = scene.add.text(18, 51, '', {
    color: '#dce8ff', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
  }).setScrollFactor(0).setDepth(100).setVisible(false);
  let reportedResult: Stage12GameplayResult | undefined;

  const update = (deltaMs: number): Stage12GameplayResult | undefined => {
    if (reportedResult) return undefined;
    const state = input.read();
    heroes.update({
      inputs: [state.p1, state.p2],
      timeMs: scene.time.now,
      deltaMs,
      environmentFor: (_index, movement) => ({
        platforms: stage12MovementPlatforms,
        bounds: {
          left: scene.cameras.main.scrollX + STAGE12_SCREEN_LEFT_X - movement.width / 2,
          right: getStage12TravelRight(flow.nextStopPointIdx) + movement.width / 2,
        },
      }),
    });
    const heroSnapshots = heroes.snapshots();
    if (fbEnter.update(
      deltaMs,
      [state.p1, state.p2],
      heroSnapshots.map((hero) => hero.alive),
    )) {
      reportedResult = 'fb-entered';
      return reportedResult;
    }
    activateReachedStopPoint(flow, heroSnapshots);
    for (const enemy of updateStage12Spawners(flow, deltaMs)) {
      enemies.set(enemy.id, createEnemyView(scene, enemy, monsterGeometry));
    }
    updateEnemyCombat(scene, heroes, enemies, flow, scene.time.now, deltaMs, rewards);
    rewards.update(deltaMs);
    hud.update(deltaMs);
    const settledHeroSnapshots = heroes.snapshots();

    const phase = flow.updatePartyFailure(
      settledHeroSnapshots.filter((hero) => hero.alive).length,
      deltaMs,
    );
    transferDoor.setAvailable(flow.doorVisible);
    if (phase === 'failed') {
      reportedResult = 'failed';
      return reportedResult;
    }

    if (flow.tryComplete(transferDoor.createCompletionAttempt(
      settledHeroSnapshots.map((hero, index) => ({
        view: hero.view,
        input: index === 0 ? state.p1 : state.p2,
        eligible: hero.alive,
      })),
    ))) {
      reportedResult = 'cleared';
      return reportedResult;
    }

    followParty(scene, settledHeroSnapshots, flow);
    updateStatus(status, flow, settledHeroSnapshots, rewards.getSummary());
    return undefined;
  };

  return {
    flow,
    update,
    destroy: () => {
      status.destroy();
      fbEnter.destroy();
      rewards.destroy();
      hud.destroy();
      heroes.destroy();
      for (const enemy of enemies.values()) destroyEnemyView(enemy);
      enemies.clear();
    },
  };
}

function activateReachedStopPoint(flow: Stage12FlowModel, heroes: HeroSnapshots): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...heroes.filter((hero) => hero.alive).map((hero) => hero.x), 0);
  if (hasReachedStage12StopPoint(frontX, nextIdx)) touchStage12StopPoint(flow, nextIdx);
}

function updateEnemyCombat(
  scene: Phaser.Scene,
  heroes: HeroPartyRuntime,
  enemies: Map<string, EnemyRuntime>,
  flow: Stage12FlowModel,
  timeMs: number,
  deltaMs: number,
  rewards: Stage1RewardBridge,
): void {
  for (const enemy of enemies.values()) {
    updateMonsterPhysics(enemy.physics, enemy.combat.x, stage12MovementPlatforms, deltaMs);
    enemy.combat.y = enemy.physics.y;
    updateStage1Enemy({
      enemy: enemy.combat,
      targets: heroes.snapshots(),
      deltaMs,
    });
    syncEnemyView(scene, enemy, deltaMs);
    heroes.resolveEnemyAttack(enemy.combat, timeMs);
  }
  heroes.resolveAttacks([...enemies.values()].map((enemy) => enemy.combat), timeMs);
  for (const [id, enemy] of enemies) {
    const visualComplete = syncEnemyView(scene, enemy, 0);
    if (enemy.combat.phase !== 'dead') continue;
    if (!enemy.defeatReported) {
      rewards.onMonsterDefeated(enemy.combat);
      defeatStage12Enemy(flow, id);
      enemy.defeatReported = true;
    }
    if (!visualComplete) continue;
    destroyEnemyView(enemy);
    enemies.delete(id);
  }
}

function createEnemyView(
  scene: Phaser.Scene,
  enemy: Stage12Enemy,
  geometry: Stage12AttackGeometryRegistry,
): EnemyRuntime {
  const physics = createMonsterPhysics({ y: enemy.y, height: 100 });
  return {
    model: enemy,
    combat: createStage1CombatEnemy({
      id: enemy.id,
      enemyType: enemy.enemyType,
      x: enemy.x,
      y: physics.y,
    }),
    view: createStage12MonsterView(scene, enemy.enemyType, enemy.x, physics.y, geometry),
    physics,
    defeatReported: false,
  };
}

function syncEnemyView(scene: Phaser.Scene, enemy: EnemyRuntime, deltaMs: number): boolean {
  return updateStage12MonsterView(scene, enemy.view, enemy.combat, deltaMs);
}

function destroyEnemyView(enemy: EnemyRuntime): void {
  destroyStage12MonsterView(enemy.view);
}

function followParty(scene: Phaser.Scene, heroes: HeroSnapshots, flow: Stage12FlowModel): void {
  const living = heroes.filter((hero) => hero.alive);
  if (living.length === 0) return;
  const frontX = Math.max(...living.map((hero) => hero.x));
  scene.cameras.main.scrollX = getStage12CameraScrollX(frontX, flow.nextStopPointIdx);
}

function updateStatus(
  status: Phaser.GameObjects.Text,
  flow: Stage12FlowModel,
  heroes: HeroSnapshots,
  rewardSummary: string,
): void {
  const wave = flow.activeStopPointIdx === undefined
    ? flow.doorVisible ? '普通门已开启：到门前按上' : `前往停点 ${Number(flow.nextStopPointIdx) + 1}/5`
    : `停点 ${flow.activeStopPointIdx + 1}/5`;
  const hp = heroes.map((hero, index) => {
    const cause = hero.deathReason ? ` ${hero.deathReason}` : '';
    return `P${index + 1} HP ${Math.ceil(hero.hp)}/${hero.maxHp} MP ${hero.mp}/${hero.maxMp}${cause}`;
  }).join(' · ');
  status.setText(`${wave} · 场上 ${flow.aliveEnemies.size} · 已击败 ${flow.defeatedCount}/46 · ${hp} · ${rewardSummary}`);
}

function readUnlockProgress() {
  const storage = getBrowserStorage();
  return storage
    ? loadActiveGame(storage)?.levelUnlockProgress ?? createDefaultLevelUnlockProgress()
    : createDefaultLevelUnlockProgress();
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
