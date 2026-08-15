// boundary: Stage 1-2 owns encounter waves only; shared entity runtimes own heroes and monsters.
import Phaser from 'phaser';
import { createInputSystem } from '../../systems/InputSystem';
import {
  createStage12Flow,
  defeatStage12Enemy,
  touchStage12StopPoint,
  updateStage12Spawners,
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
import { getStage1EnemyConfig } from '../../systems/Stage1CombatSystem';
import { createStage12FbEnterBridge, type Stage12FbEnterHandle } from './Stage12FbEnterBridge';
import { createStage1RewardBridge, type Stage1RewardBridge } from '../stage1/Stage1RewardBridge';
import { createStage1CombatHudBridge } from '../stage1/Stage1CombatHudBridge';
import { createHeroPartyRuntime, type HeroPartyRuntime } from '../HeroPartyRuntimeBridge';
import {
  createStage12MonsterView,
  destroyStage12MonsterView,
  readStage12AttackGeometry,
  updateStage12MonsterView,
  type Stage12MonsterView,
} from './Stage12MonsterVisualBridge';
import { createMonsterRuntimeRegistry } from '../MonsterRuntimeRegistryBridge';

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
  const monsters = createMonsterRuntimeRegistry<Stage12MonsterView>({
    scene,
    platforms: stage12MovementPlatforms,
    views: {
      create: (owner, monster) => createStage12MonsterView(
        owner,
        monster.monsterDefinitionId as 2 | 4 | 7 | 8,
        monster.x,
        monster.y,
        monsterGeometry,
      ),
      update: updateStage12MonsterView,
      destroy: destroyStage12MonsterView,
    },
    onDefeated: (enemy) => {
      rewards.onMonsterDefeated(enemy);
      defeatStage12Enemy(flow, enemy.id);
    },
  });
  const hud = createStage1CombatHudBridge(
    scene,
    heroes.hudSnapshots,
    () => monsters.snapshots().map((monster, spawnOrder) => {
      const config = getStage1EnemyConfig(monster.monsterDefinitionId);
      return {
        enemyId: monster.id,
        displayName: config.displayName,
        hp: monster.hp,
        maxHp: monster.maxHp,
        spawnOrder,
        isBoss: config.isBoss,
      };
    }),
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
      monsterTargets: monsters.combatTargets(),
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
    monsters.spawn(updateStage12Spawners(flow, deltaMs).map((enemy) => ({
      encounterId: `stage-1-2-stop-${enemy.stopPointIdx}`,
      spawnId: enemy.id,
      monsterDefinitionId: enemy.enemyType,
      x: enemy.x,
      y: enemy.y,
    })));
    monsters.update(heroes, scene.time.now, deltaMs);
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
      monsters.destroy();
    },
  };
}

function activateReachedStopPoint(flow: Stage12FlowModel, heroes: HeroSnapshots): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...heroes.filter((hero) => hero.alive).map((hero) => hero.x), 0);
  if (hasReachedStage12StopPoint(frontX, nextIdx)) touchStage12StopPoint(flow, nextIdx);
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
