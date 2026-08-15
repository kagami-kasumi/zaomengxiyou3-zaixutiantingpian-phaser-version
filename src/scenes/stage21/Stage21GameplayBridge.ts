// boundary: Stage 2-1 submits level input/environment/monster targets to HeroPartyRuntime;
// it keeps ice hazards, encounter waves, QA, and the not-yet-migrated monster runtime only.
import Phaser from 'phaser';
import { createInputSystem } from '../../systems/InputSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../../systems/Stage11FlowSystem';
import {
  createStage21Flow,
  defeatStage21Enemy,
  touchStage21StopPoint,
  updateStage21Spawners,
  type Stage21Enemy,
  type Stage21FlowModel,
} from '../../systems/Stage21FlowSystem';
import {
  STAGE21_GROUND_PLATFORM_ID,
  STAGE21_GROUND_TOP_Y,
} from '../../systems/Stage21Layout';
import type { TransferDoorView } from '../TransferDoorView';
import {
  getStage21CameraScrollX,
  getStage21TravelRight,
  hasReachedStage21StopPoint,
  stage21MovementPlatforms,
  STAGE21_SCREEN_LEFT_X,
} from '../../systems/Stage21TraversalSystem';
import {
  createStage21IceHazards,
  updateStage21IceHazards,
  type Stage21IceHazardModel,
} from '../../systems/Stage21IceHazardSystem';
import type { Stage21QaOptions } from '../../systems/Stage21EntrySystem';
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
  createStage21MonsterView,
  destroyStage21MonsterView,
  readStage21AttackGeometry,
  updateStage21MonsterView,
  type AttackGeometryRegistry,
  type Stage21MonsterView,
} from './Stage21MonsterVisualBridge';
import {
  isStage21MonsterAttackAction,
  Stage21MonsterVisualProvenance,
} from '../../systems/Stage21MonsterVisualSystem';

type MonsterRuntime = {
  combat: Stage1CombatEnemy;
  view: Stage21MonsterView;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

type HeroSnapshots = ReturnType<HeroPartyRuntime['snapshots']>;

export type Stage21GameplayHandle = Readonly<{
  flow: Stage21FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

export function createStage21Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: TransferDoorView,
  iceViews: readonly Phaser.GameObjects.Image[],
  qa: Stage21QaOptions = {},
): Stage21GameplayHandle {
  const flow = createStage21Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const heroes = createHeroPartyRuntime(scene, playerViews, {
    groundY: STAGE21_GROUND_TOP_Y,
    groundPlatformId: STAGE21_GROUND_PLATFORM_ID,
  });
  const monsters = new Map<string, MonsterRuntime>();
  const attackGeometry = readStage21AttackGeometry(scene);
  if (qa.showcase && qa.holdEnemyType) {
    const showcase = createMonsterView(scene, {
      id: 'stage21-qa-showcase',
      enemyType: qa.holdEnemyType,
      spawnPointId: 'stage21-qa-showcase',
      stopPointIdx: 0,
      x: qa.role1ShadowTarget ? 280 : 410,
      y: STAGE21_GROUND_TOP_Y - Stage21MonsterVisualProvenance[qa.holdEnemyType].height / 2,
      maxHp: 1,
      isBoss: qa.holdEnemyType === 6,
      isFlying: false,
    }, attackGeometry);
    if (qa.forcedEnemyState) {
      showcase.combat.phase = qa.forcedEnemyState;
      showcase.combat.phaseRemainingMs = qa.forcedEnemyState === 'hurt'
        ? Number.POSITIVE_INFINITY
        : 0;
    }
    monsters.set(showcase.combat.id, showcase);
  }
  const iceHazards = createStage21IceHazards();
  const rewards: Stage1RewardBridge = createStage1RewardBridge(
    scene,
    heroes.rewardPlayers(),
    stage21MovementPlatforms,
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
        platforms: stage21MovementPlatforms,
        bounds: {
          left: scene.cameras.main.scrollX + STAGE21_SCREEN_LEFT_X - movement.width / 2,
          right: getStage21TravelRight(flow.nextStopPointIdx) + movement.width / 2,
        },
      }),
    });
    const heroSnapshots = heroes.snapshots();
    activateReachedStopPoint(flow, heroSnapshots);
    for (const monster of updateStage21Spawners(flow, qa.fastClear ? Math.max(deltaMs, 2_000) : deltaMs)) {
      const runtime = createMonsterView(scene, monster, attackGeometry);
      if (monster.enemyType === qa.holdEnemyType && qa.forcedEnemyState) {
        runtime.combat.phase = qa.forcedEnemyState;
        runtime.combat.phaseRemainingMs = qa.forcedEnemyState === 'hurt'
          ? Number.POSITIVE_INFINITY
          : 0;
      }
      monsters.set(monster.id, runtime);
    }
    if (qa.fastClear) clearStage21QaMonsters(flow, monsters, qa.holdEnemyType);
    updateIceHazards(heroes, iceHazards, iceViews, deltaMs, Boolean(qa.fastClear || qa.noDamage));
    updateMonsterCombat(
      scene,
      heroes,
      monsters,
      flow,
      scene.time.now,
      deltaMs,
      rewards,
      Boolean(qa.fastClear || qa.noDamage),
      qa,
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

function activateReachedStopPoint(flow: Stage21FlowModel, heroes: HeroSnapshots): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...heroes.filter((hero) => hero.alive).map((hero) => hero.x), 0);
  if (hasReachedStage21StopPoint(frontX, nextIdx)) touchStage21StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  scene: Phaser.Scene,
  heroes: HeroPartyRuntime,
  monsters: Map<string, MonsterRuntime>,
  flow: Stage21FlowModel,
  timeMs: number,
  deltaMs: number,
  rewards: Stage1RewardBridge,
  ignoreEnemyDamage: boolean,
  qa: Stage21QaOptions,
): void {
  for (const monster of monsters.values()) {
    updateMonsterPhysics(monster.physics, monster.combat.x, stage21MovementPlatforms, deltaMs);
    monster.combat.y = monster.physics.y;
    const holdRecoveryForVisual = monster.combat.phase === 'recovery'
      && isStage21MonsterAttackAction(monster.view.visual.action)
      && !monster.view.visual.completed;
    if (!holdRecoveryForVisual) {
      updateStage1Enemy({
        enemy: monster.combat,
        targets: heroes.snapshots(),
        deltaMs,
      });
    }
    const freezeForcedDeadFrame = monster.combat.enemyType === qa.holdEnemyType
      && qa.forcedEnemyState === 'dead'
      && monster.view.visual.action === 'dead'
      && monster.view.visual.actionTick >= 4;
    if (!freezeForcedDeadFrame) syncMonsterView(scene, monster, deltaMs);
    if (!ignoreEnemyDamage) {
      heroes.resolveEnemyAttack(monster.combat, timeMs);
    }
  }
  heroes.resolveAttacks([...monsters.values()].map((monster) => monster.combat), timeMs);
  for (const [id, monster] of monsters) {
    syncMonsterView(scene, monster, 0);
    if (monster.combat.phase !== 'dead') continue;
    if (!monster.defeatReported) {
      rewards.onMonsterDefeated(monster.combat);
      defeatStage21Enemy(flow, id);
      monster.defeatReported = true;
    }
    if (monster.combat.enemyType === qa.holdEnemyType && qa.forcedEnemyState === 'dead') continue;
    if (!monster.view.visual.completed) continue;
    destroyMonsterView(monster);
    monsters.delete(id);
  }
}

function createMonsterView(
  scene: Phaser.Scene,
  monster: Stage21Enemy,
  attackGeometry: AttackGeometryRegistry,
): MonsterRuntime {
  const provenance = Stage21MonsterVisualProvenance[monster.enemyType];
  const physics = createMonsterPhysics({
    y: monster.y,
    height: provenance.height,
    motionMode: 'grounded',
  });
  return {
    combat: createStage1CombatEnemy({
      id: monster.id,
      enemyType: monster.enemyType,
      x: monster.x,
      y: physics.y,
    }),
    view: createStage21MonsterView(
      scene,
      monster.enemyType,
      monster.x,
      physics.y,
      attackGeometry,
    ),
    physics,
    defeatReported: false,
  };
}

function syncMonsterView(
  scene: Phaser.Scene,
  monster: MonsterRuntime,
  deltaMs: number,
): void {
  updateStage21MonsterView(scene, monster.view, monster.combat, deltaMs);
}

function destroyMonsterView(monster: MonsterRuntime): void {
  destroyStage21MonsterView(monster.view);
}

function followParty(scene: Phaser.Scene, heroes: HeroSnapshots, flow: Stage21FlowModel): void {
  const living = heroes.filter((hero) => hero.alive);
  if (living.length === 0) return;
  scene.cameras.main.scrollX = getStage21CameraScrollX(
    Math.max(...living.map((hero) => hero.x)),
    flow.nextStopPointIdx,
  );
}

function updateStatus(
  status: Phaser.GameObjects.Text,
  flow: Stage21FlowModel,
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
    `${wave} · 场上 ${flow.aliveEnemies.size}/${flow.maxMonstersOnScreen} · 已生成 ${flow.generatedCount}/53 · 已击败 ${flow.defeatedCount} · ${hp} · ${rewardSummary}`,
  );
}

function updateIceHazards(
  heroes: HeroPartyRuntime,
  hazards: Stage21IceHazardModel[],
  views: readonly Phaser.GameObjects.Image[],
  deltaMs: number,
  ignoreDamage = false,
): void {
  const snapshots = heroes.snapshots();
  const hits = updateStage21IceHazards(hazards, snapshots.map((hero) => ({
    slot: hero.slot,
    x: hero.x,
    y: hero.y,
    width: hero.view.displayWidth,
    height: hero.view.displayHeight,
    facingX: hero.facingX,
    alive: hero.alive,
  })), deltaMs);
  hazards.forEach((hazard, index) => {
    const view = views[index];
    if (view) view.setTexture(`stage.stage2-1.ice-thorn.frame-${String(hazard.frame).padStart(2, '0')}`);
  });
  if (ignoreDamage) return;
  heroes.applyEnvironmentHits(hits.map((hit) => ({
    target: hit.target,
    damage: hit.damage,
    knockbackX: hit.knockbackX,
    bounds: { left: STAGE21_SCREEN_LEFT_X, right: getStage21TravelRight(undefined) },
    deathReason: 'movement-trap',
  })));
}

function clearStage21QaMonsters(
  flow: Stage21FlowModel,
  monsters: Map<string, MonsterRuntime>,
  holdEnemyType?: Stage21Enemy['enemyType'],
): void {
  for (const [id, monster] of monsters) {
    if (monster.combat.enemyType === holdEnemyType) continue;
    defeatStage21Enemy(flow, id);
    destroyMonsterView(monster);
    monsters.delete(id);
  }
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
