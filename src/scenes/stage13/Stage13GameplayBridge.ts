// boundary: Stage 1-3 submits level input/environment/monster targets to HeroPartyRuntime;
// it keeps encounter waves and the not-yet-migrated monster runtime only.
import Phaser from 'phaser';
import { createInputSystem } from '../../systems/InputSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../../systems/Stage11FlowSystem';
import {
  createStage13Flow,
  defeatStage13Enemy,
  touchStage13StopPoint,
  updateStage13Spawners,
  type Stage13Enemy,
  type Stage13FlowModel,
} from '../../systems/Stage13FlowSystem';
import {
  STAGE13_GROUND_PLATFORM_ID,
  STAGE13_GROUND_TOP_Y,
} from '../../systems/Stage13Layout';
import type { TransferDoorView } from '../TransferDoorView';
import {
  getStage13CameraScrollX,
  getStage13TravelRight,
  hasReachedStage13StopPoint,
  stage13MovementPlatforms,
  STAGE13_SCREEN_LEFT_X,
} from '../../systems/Stage13TraversalSystem';
import {
  createStage1CombatEnemy,
  updateStage1Enemy,
  type Stage1CombatEnemy,
} from '../../systems/Stage1CombatSystem';
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
  createStage13MonsterView,
  destroyStage13MonsterView,
  readStage13MonsterGeometry,
  updateStage13MonsterView,
  type Stage13MonsterGeometryRegistry,
  type Stage13MonsterView,
} from './Stage13MonsterVisualBridge';

type MonsterRuntime = {
  combat: Stage1CombatEnemy;
  view: Stage13MonsterView;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

type HeroSnapshots = ReturnType<HeroPartyRuntime['snapshots']>;

export type Stage13GameplayHandle = Readonly<{
  flow: Stage13FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

export function createStage13Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: TransferDoorView,
): Stage13GameplayHandle {
  const flow = createStage13Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const heroes = createHeroPartyRuntime(scene, playerViews, {
    groundY: STAGE13_GROUND_TOP_Y,
    groundPlatformId: STAGE13_GROUND_PLATFORM_ID,
  });
  const monsters = new Map<string, MonsterRuntime>();
  const monsterGeometry = readStage13MonsterGeometry(scene);
  const rewards: Stage1RewardBridge = createStage1RewardBridge(
    scene,
    heroes.rewardPlayers(),
    stage13MovementPlatforms,
  );
  const hud = createStage1CombatHudBridge(
    scene,
    heroes.hudSnapshots,
    () => [...monsters.values()].map((monster, index) =>
      createStage1CombatEnemyHudSnapshot(monster.combat, index)),
  );
  const status = scene.add.text(18, 51, '', {
    color: '#dce8ff', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
  }).setScrollFactor(0).setDepth(100).setVisible(false);
  let reportedResult: 'failed' | 'cleared' | undefined;

  const update = (deltaMs: number): 'failed' | 'cleared' | undefined => {
    if (reportedResult) return undefined;
    const state = input.read();
    heroes.update({
      inputs: [state.p1, state.p2],
      timeMs: scene.time.now,
      deltaMs,
      monsterTargets: [...monsters.values()].map((monster) => monster.combat),
      environmentFor: (_index, movement) => ({
        platforms: stage13MovementPlatforms,
        bounds: {
          left: scene.cameras.main.scrollX + STAGE13_SCREEN_LEFT_X - movement.width / 2,
          right: getStage13TravelRight(flow.nextStopPointIdx) + movement.width / 2,
        },
      }),
    });
    const heroSnapshots = heroes.snapshots();
    activateReachedStopPoint(flow, heroSnapshots);
    for (const monster of updateStage13Spawners(flow, deltaMs)) {
      monsters.set(monster.id, createMonsterView(scene, monster, monsterGeometry));
    }
    updateMonsterCombat(
      scene,
      heroes,
      monsters,
      flow,
      scene.time.now,
      deltaMs,
      rewards,
    );
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
      rewards.destroy();
      hud.destroy();
      heroes.destroy();
      for (const monster of monsters.values()) destroyMonsterView(monster);
      monsters.clear();
    },
  };
}

function activateReachedStopPoint(flow: Stage13FlowModel, heroes: HeroSnapshots): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...heroes.filter((hero) => hero.alive).map((hero) => hero.x), 0);
  if (hasReachedStage13StopPoint(frontX, nextIdx)) touchStage13StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  scene: Phaser.Scene,
  heroes: HeroPartyRuntime,
  monsters: Map<string, MonsterRuntime>,
  flow: Stage13FlowModel,
  timeMs: number,
  deltaMs: number,
  rewards: Stage1RewardBridge,
): void {
  for (const monster of monsters.values()) {
    updateMonsterPhysics(monster.physics, monster.combat.x, stage13MovementPlatforms, deltaMs);
    monster.combat.y = monster.physics.y;
    updateStage1Enemy({
      enemy: monster.combat,
      targets: heroes.snapshots(),
      deltaMs,
    });
    syncMonsterView(scene, monster, deltaMs);
    heroes.resolveEnemyAttack(monster.combat, timeMs);
  }
  heroes.resolveAttacks([...monsters.values()].map((monster) => monster.combat), timeMs);
  for (const [id, monster] of monsters) {
    const visualComplete = syncMonsterView(scene, monster, 0);
    if (monster.combat.phase !== 'dead') continue;
    if (!monster.defeatReported) {
      rewards.onMonsterDefeated(monster.combat);
      defeatStage13Enemy(flow, id);
      monster.defeatReported = true;
    }
    if (!visualComplete) continue;
    destroyMonsterView(monster);
    monsters.delete(id);
  }
}

function createMonsterView(
  scene: Phaser.Scene,
  monster: Stage13Enemy,
  geometry: Stage13MonsterGeometryRegistry,
): MonsterRuntime {
  const physics = createMonsterPhysics({
    y: monster.y,
    height: monster.isBoss ? 130 : monster.isFlying ? 42 : 100,
    motionMode: monster.isFlying ? 'flying' : 'grounded',
  });
  return {
    combat: createStage1CombatEnemy({
      id: monster.id,
      enemyType: monster.enemyType,
      x: monster.x,
      y: physics.y,
    }),
    view: createStage13MonsterView(scene, monster.enemyType, monster.x, physics.y, geometry),
    physics,
    defeatReported: false,
  };
}

function syncMonsterView(
  scene: Phaser.Scene,
  monster: MonsterRuntime,
  deltaMs: number,
): boolean {
  return updateStage13MonsterView(scene, monster.view, monster.combat, deltaMs);
}

function destroyMonsterView(monster: MonsterRuntime): void {
  destroyStage13MonsterView(monster.view);
}

function followParty(scene: Phaser.Scene, heroes: HeroSnapshots, flow: Stage13FlowModel): void {
  const living = heroes.filter((hero) => hero.alive);
  if (living.length === 0) return;
  scene.cameras.main.scrollX = getStage13CameraScrollX(
    Math.max(...living.map((hero) => hero.x)),
    flow.nextStopPointIdx,
  );
}

function updateStatus(
  status: Phaser.GameObjects.Text,
  flow: Stage13FlowModel,
  heroes: HeroSnapshots,
  rewardSummary: string,
): void {
  const wave = flow.doorVisible
    ? '巨灵神已败：普通门开启，门前按上'
    : flow.activeStopPointIdx === undefined
      ? `前往停点 ${Number(flow.nextStopPointIdx) + 1}/5`
      : `停点 ${flow.activeStopPointIdx + 1}/5`;
  const hp = heroes.map((hero, index) => {
    const cause = hero.deathReason ? ` ${hero.deathReason}` : '';
    return `P${index + 1} HP ${Math.ceil(hero.hp)}/${hero.maxHp} MP ${hero.mp}/${hero.maxMp}${cause}`;
  }).join(' · ');
  status.setText(
    `${wave} · 场上 ${flow.aliveEnemies.size}/${flow.maxMonstersOnScreen} · 已生成 ${flow.generatedCount}/105 · 已击败 ${flow.defeatedCount} · ${hp} · ${rewardSummary}`,
  );
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
