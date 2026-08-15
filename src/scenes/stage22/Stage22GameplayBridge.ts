// boundary: Stage 2-2 submits level input/environment/monster targets to HeroPartyRuntime;
// it keeps fire hazards, encounter waves, QA, and the not-yet-migrated monster runtime only.
import Phaser from 'phaser';
import { createInputSystem } from '../../systems/InputSystem';
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
import {
  createStage22FireHazards,
  updateStage22FireHazards,
  type Stage22FireHazardModel,
} from '../../systems/Stage22FireHazardSystem';
import {
  createStage22Flow,
  defeatStage22Enemy,
  touchStage22StopPoint,
  updateStage22Spawners,
  type Stage22Enemy,
  type Stage22FlowModel,
} from '../../systems/Stage22FlowSystem';
import {
  STAGE22_GROUND_PLATFORM_ID,
  STAGE22_GROUND_TOP_Y,
} from '../../systems/Stage22Layout';
import type { TransferDoorView } from '../TransferDoorView';
import {
  getStage22CameraScrollX,
  getStage22TravelRight,
  hasReachedStage22StopPoint,
  stage22MovementPlatforms,
  STAGE22_SCREEN_LEFT_X,
} from '../../systems/Stage22TraversalSystem';
import type { Stage22QaOptions } from '../../systems/Stage22EntrySystem';
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
} from '../stage21/Stage21MonsterVisualBridge';
import {
  isStage21MonsterAttackAction,
  Stage21MonsterVisualProvenance,
} from '../../systems/Stage21MonsterVisualSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import { createDefaultLevelUnlockProgress } from '../../systems/Stage11FlowSystem';
import {
  createMonster16View,
  destroyMonster16View,
  readMonster16AttackGeometry,
  updateMonster16View,
  type Monster16AttackGeometryRegistry,
  type Monster16View,
} from './Stage22Monster16VisualBridge';
import {
  isMonster16AttackAction,
  Monster16BodyHeight,
  Monster16VisualTickMs,
} from '../../systems/Stage22Monster16VisualSystem';
import { hasVisibleStage22FirePixel } from './Stage22DevGameplayBridge';

type MonsterRuntime = {
  combat: Stage1CombatEnemy;
  view: Stage21MonsterView | Monster16View;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

type HeroSnapshots = ReturnType<HeroPartyRuntime['snapshots']>;

export type Stage22GameplayHandle = Readonly<{
  flow: Stage22FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

export function createStage22Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: TransferDoorView,
  fireViews: readonly Phaser.GameObjects.Image[],
  updateFireViews: (hazards: readonly Stage22FireHazardModel[]) => void,
  qa: Stage22QaOptions = {},
): Stage22GameplayHandle {
  const flow = createStage22Flow(
    playerCount,
    readUnlockProgress(),
  );
  const input = createInputSystem(scene);
  const heroes = createHeroPartyRuntime(scene, playerViews, {
    groundY: STAGE22_GROUND_TOP_Y,
    groundPlatformId: STAGE22_GROUND_PLATFORM_ID,
  });
  if (qa.failParty) {
    heroes.applyEnvironmentHits(heroes.snapshots().map((hero) => ({
      target: hero.slot,
      damage: hero.hp,
      knockbackX: 0,
      bounds: { left: STAGE22_SCREEN_LEFT_X, right: getStage22TravelRight(undefined) },
      deathReason: 'movement-trap',
    })));
  }
  const monsters = new Map<string, MonsterRuntime>();
  const attackGeometry = readStage21AttackGeometry(scene);
  const monster16Geometry = readMonster16AttackGeometry(scene);
  if (qa.bossState === 'door') {
    flow.doorVisible = true;
    flow.nextStopPointIdx = undefined;
  } else if (qa.bossState) {
    flow.nextStopPointIdx = undefined;
    const showcaseEnemy: Stage22Enemy = {
      id: 'stage22-qa-monster16',
      enemyType: 16,
      spawnPointId: 'stage22-qa-monster16',
      stopPointIdx: 4,
      x: 480,
      y: STAGE22_GROUND_TOP_Y - Monster16BodyHeight / 2,
      maxHp: 24_189,
      isBoss: true,
      isFlying: false,
    };
    const showcase = createMonsterView(scene, showcaseEnemy, attackGeometry, monster16Geometry);
    configureMonster16Showcase(showcase.combat, qa.bossState, qa.bossFacing ?? -1);
    updateMonsterView(
      scene,
      showcase,
      (qa.bossTick ?? defaultShowcaseTick(qa.bossState)) * Monster16VisualTickMs + 0.001,
    );
    monsters.set(showcaseEnemy.id, showcase);
  }
  const hazards = createStage22FireHazards();
  const rewards: Stage1RewardBridge = createStage1RewardBridge(
    scene,
    heroes.rewardPlayers(),
    stage22MovementPlatforms,
  );
  const hud = createStage1CombatHudBridge(
    scene,
    heroes.hudSnapshots,
    () => [...monsters.values()].map((monster, index) =>
      createStage1CombatEnemyHudSnapshot(monster.combat, index)),
  );
  let reportedResult: 'failed' | 'cleared' | undefined;

  return {
    flow,
    update: (deltaMs) => {
      if (reportedResult) return undefined;
      const state = input.read();
      const inputs = [state.p1, state.p2];
      heroes.update({
        inputs,
        timeMs: scene.time.now,
        deltaMs,
        monsterTargets: [...monsters.values()].map((monster) => monster.combat),
        environmentFor: (_index, movement) => ({
          platforms: stage22MovementPlatforms,
          bounds: {
            left: scene.cameras.main.scrollX + STAGE22_SCREEN_LEFT_X - movement.width / 2,
            right: getStage22TravelRight(flow.nextStopPointIdx) + movement.width / 2,
          },
        }),
      });
      activateReachedStopPoint(flow, heroes.snapshots());
      for (const enemy of updateStage22Spawners(flow, qa.fastClear ? Math.max(deltaMs, 2_000) : deltaMs)) {
        monsters.set(enemy.id, createMonsterView(scene, enemy, attackGeometry, monster16Geometry));
      }
      if (qa.fastClear) clearQaMonsters(flow, monsters);
      updateFire(
        scene,
        heroes,
        hazards,
        fireViews,
        updateFireViews,
        deltaMs,
        Boolean(qa.fastClear || qa.noDamage),
      );
      updateMonsterCombat(
        scene,
        heroes,
        monsters,
        flow,
        scene.time.now,
        deltaMs,
        rewards,
        Boolean(qa.fastClear || qa.noDamage),
        Boolean(qa.bossState && qa.bossState !== 'door'),
      );
      rewards.update(deltaMs);
      hud.update(deltaMs);
      const heroSnapshots = heroes.snapshots();
      if (flow.updatePartyFailure(
        heroSnapshots.filter((hero) => hero.alive).length,
        deltaMs,
      ) === 'failed') {
        reportedResult = 'failed';
        return 'failed';
      }
      transferDoor.setAvailable(flow.doorVisible);
      if (flow.tryComplete(transferDoor.createCompletionAttempt(
        heroSnapshots.map((hero, index) => ({
          view: hero.view,
          input: inputs[index] ?? inputs[0]!,
          eligible: hero.alive,
        })),
      ))) {
        reportedResult = 'cleared';
        return 'cleared';
      }
      followParty(scene, heroSnapshots, flow);
      return undefined;
    },
    destroy: () => {
      rewards.destroy();
      hud.destroy();
      heroes.destroy();
      for (const monster of monsters.values()) destroyMonster(monster);
      monsters.clear();
    },
  };
}

function activateReachedStopPoint(flow: Stage22FlowModel, heroes: HeroSnapshots): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...heroes.filter((hero) => hero.alive).map((hero) => hero.x), 0);
  if (hasReachedStage22StopPoint(frontX, nextIdx)) touchStage22StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  scene: Phaser.Scene,
  heroes: HeroPartyRuntime,
  monsters: Map<string, MonsterRuntime>,
  flow: Stage22FlowModel,
  timeMs: number,
  deltaMs: number,
  rewards: Stage1RewardBridge,
  ignoreEnemyDamage: boolean,
  freezeBossShowcase: boolean,
): void {
  for (const monster of monsters.values()) {
    if (freezeBossShowcase && monster.combat.id === 'stage22-qa-monster16') continue;
    updateMonsterPhysics(monster.physics, monster.combat.x, stage22MovementPlatforms, deltaMs);
    monster.combat.y = monster.physics.y;
    const waitingForVisual = monster.combat.phase === 'recovery'
      && isMonsterAttackVisual(monster)
      && !monster.view.visual.completed;
    if (!waitingForVisual) {
      updateStage1Enemy({
        enemy: monster.combat,
        targets: heroes.snapshots(),
        deltaMs,
      });
    }
    updateMonsterView(scene, monster, deltaMs);
    if (!ignoreEnemyDamage) {
      heroes.resolveEnemyAttack(monster.combat, timeMs);
    }
  }
  heroes.resolveAttacks([...monsters.values()].map((monster) => monster.combat), timeMs);
  for (const [id, monster] of monsters) {
    updateMonsterView(scene, monster, 0);
    if (monster.combat.phase !== 'dead') continue;
    if (!monster.defeatReported) {
      rewards.onMonsterDefeated(monster.combat);
      defeatStage22Enemy(flow, id);
      monster.defeatReported = true;
    }
    if (!monster.view.visual.completed) continue;
    destroyMonster(monster);
    monsters.delete(id);
  }
}

function createMonsterView(
  scene: Phaser.Scene,
  enemy: Stage22Enemy,
  geometry: AttackGeometryRegistry,
  monster16Geometry: Monster16AttackGeometryRegistry,
): MonsterRuntime {
  if (enemy.enemyType === 16) {
    const physics = createMonsterPhysics({
      y: enemy.y,
      height: Monster16BodyHeight,
      motionMode: 'grounded',
    });
    return {
      combat: createStage1CombatEnemy({
        id: enemy.id,
        enemyType: 16,
        x: enemy.x,
        y: physics.y,
      }),
      view: createMonster16View(scene, enemy.x, physics.y, monster16Geometry),
      physics,
      defeatReported: false,
    };
  }
  const physics = createMonsterPhysics({
    y: enemy.y,
    height: Stage21MonsterVisualProvenance[enemy.enemyType].height,
    motionMode: 'grounded',
  });
  return {
    combat: createStage1CombatEnemy({
      id: enemy.id,
      enemyType: enemy.enemyType,
      x: enemy.x,
      y: physics.y,
    }),
    view: createStage21MonsterView(scene, enemy.enemyType, enemy.x, physics.y, geometry),
    physics,
    defeatReported: false,
  };
}

function updateFire(
  scene: Phaser.Scene,
  heroes: HeroPartyRuntime,
  hazards: Stage22FireHazardModel[],
  _views: readonly Phaser.GameObjects.Image[],
  updateViews: (hazards: readonly Stage22FireHazardModel[]) => void,
  deltaMs: number,
  ignoreDamage: boolean,
): void {
  const snapshots = heroes.snapshots();
  const hits = updateStage22FireHazards(
    hazards,
    snapshots.map((hero) => ({
      slot: hero.slot,
      x: hero.x,
      y: hero.y,
      width: hero.view.displayWidth,
      height: hero.view.displayHeight,
      facingX: hero.facingX,
      alive: hero.alive,
      isYourFather: false,
    })),
    deltaMs,
    (hazard, target) => hasVisibleStage22FirePixel(scene, hazard, target),
  );
  updateViews(hazards);
  if (ignoreDamage) return;
  heroes.applyEnvironmentHits(hits.map((hit) => ({
    target: hit.target,
    damage: hit.damage,
    knockbackX: hit.knockbackX,
    bounds: { left: STAGE22_SCREEN_LEFT_X, right: getStage22TravelRight(undefined) },
    deathReason: 'movement-trap',
  })));
}

function clearQaMonsters(flow: Stage22FlowModel, monsters: Map<string, MonsterRuntime>): void {
  for (const [id, monster] of monsters) {
    defeatStage22Enemy(flow, id);
    destroyMonster(monster);
    monsters.delete(id);
  }
}

function configureMonster16Showcase(
  combat: Stage1CombatEnemy,
  state: Exclude<NonNullable<Stage22QaOptions['bossState']>, 'door'>,
  facingX: -1 | 1,
): void {
  combat.facingX = facingX;
  if (state === 'walk') {
    combat.phase = 'approach';
    return;
  }
  if (state === 'wait') {
    combat.phase = 'recovery';
    combat.phaseRemainingMs = Number.POSITIVE_INFINITY;
    return;
  }
  if (state === 'hurt' || state === 'dead') {
    combat.phase = state;
    combat.phaseRemainingMs = Number.POSITIVE_INFINITY;
    return;
  }
  const attack = state === 'hit1'
    ? { attackKind: 'physics' as const, damage: 185, attackRange: 150 }
    : state === 'hit2'
      ? { attackKind: 'magic' as const, damage: 68, attackRange: 200 }
      : state === 'hit3'
        ? { attackKind: 'magic' as const, damage: 47.6, attackRange: 800 }
        : { attackKind: 'magic' as const, damage: 57.6, attackRange: 800 };
  combat.attackSerial = 1;
  combat.phase = 'windup';
  combat.phaseRemainingMs = Number.POSITIVE_INFINITY;
  combat.activeAttack = {
    attackId: `stage22-qa-${state}`,
    actionName: state,
    ...attack,
  };
}

function defaultShowcaseTick(
  state: Exclude<NonNullable<Stage22QaOptions['bossState']>, 'door'>,
): number {
  if (state === 'dead') return 15;
  if (state === 'hit1') return 4;
  if (state === 'hit2') return 9;
  if (state === 'hit3') return 13;
  if (state === 'hit4') return 9;
  return 8;
}

function destroyMonster(monster: MonsterRuntime): void {
  if (monster.combat.enemyType === 16) destroyMonster16View(monster.view as Monster16View);
  else destroyStage21MonsterView(monster.view as Stage21MonsterView);
}

function updateMonsterView(
  scene: Phaser.Scene,
  monster: MonsterRuntime,
  deltaMs: number,
): void {
  if (monster.combat.enemyType === 16) {
    updateMonster16View(scene, monster.view as Monster16View, monster.combat, deltaMs);
  } else {
    updateStage21MonsterView(scene, monster.view as Stage21MonsterView, monster.combat, deltaMs);
  }
}

function isMonsterAttackVisual(monster: MonsterRuntime): boolean {
  return monster.combat.enemyType === 16
    ? isMonster16AttackAction((monster.view as Monster16View).visual.action)
    : isStage21MonsterAttackAction((monster.view as Stage21MonsterView).visual.action);
}

function followParty(scene: Phaser.Scene, heroes: HeroSnapshots, flow: Stage22FlowModel): void {
  const living = heroes.filter((hero) => hero.alive);
  if (living.length === 0) return;
  scene.cameras.main.scrollX = getStage22CameraScrollX(
    Math.max(...living.map((hero) => hero.x)),
    flow.nextStopPointIdx,
  );
}

function getBrowserStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function readUnlockProgress() {
  const storage = getBrowserStorage();
  return storage
    ? loadActiveGame(storage)?.levelUnlockProgress ?? createDefaultLevelUnlockProgress()
    : createDefaultLevelUnlockProgress();
}
