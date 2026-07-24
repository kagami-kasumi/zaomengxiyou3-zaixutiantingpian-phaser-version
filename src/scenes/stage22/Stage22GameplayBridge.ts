// boundary: Stage 2-2 formal bridge adapts Phaser views to the already-closed
// shared movement, combat, reward, HUD, Monster9/10/19 visuals, flow, and fire owners.
import Phaser from 'phaser';
import { createInputSystem, type PlayerInputState } from '../../systems/InputSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
  type LevelHeroMovementRuntime,
} from '../../systems/LevelHeroMovementSystem';
import {
  createStage1CombatEnemy,
  createStage1CombatPlayer,
  createStage1CombatRuntime,
  resolveStage1EnemyAttack,
  resolveStage1HeroAttack,
  updateStage1CombatPlayer,
  updateStage1Enemy,
  type Stage1CombatEnemy,
  type Stage1CombatPlayer,
  type Stage1CombatRuntime,
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
  tryCompleteStage22,
  updateStage22PartyFailure,
  updateStage22Spawners,
  type Stage22Enemy,
  type Stage22FlowModel,
} from '../../systems/Stage22FlowSystem';
import {
  STAGE22_GROUND_PLATFORM_ID,
  STAGE22_GROUND_TOP_Y,
  stage22TransferDoor,
} from '../../systems/Stage22Layout';
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
import {
  createStage1CombatEnemyHudSnapshot,
  createStage1CombatPlayerHudSnapshot,
} from '../../systems/Stage1CombatHudSystem';
import {
  FormalSkillsUpdatedEvent,
  readFormalSkillRuntime,
  type FormalSkillsUpdatedPayload,
} from '../feature-ui/FormalSkillRuntimeBridge';
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

type PlayerRuntime = { view: Phaser.GameObjects.Image; combat: Stage1CombatPlayer };
type MonsterRuntime = {
  combat: Stage1CombatEnemy;
  view: Stage21MonsterView | Monster16View;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

export type Stage22GameplayHandle = Readonly<{
  flow: Stage22FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

export function createStage22Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: Phaser.GameObjects.Image,
  fireViews: readonly Phaser.GameObjects.Image[],
  updateFireViews: (hazards: readonly Stage22FireHazardModel[]) => void,
  qa: Stage22QaOptions = {},
): Stage22GameplayHandle {
  const flow = createStage22Flow(
    playerCount,
    readUnlockProgress(),
  );
  const input = createInputSystem(scene);
  const combatRuntime = createStage1CombatRuntime();
  const players: PlayerRuntime[] = playerViews.map((view, index) => ({
    view,
    combat: createStage1CombatPlayer(index === 0 ? 'p1' : 'p2'),
  }));
  if (qa.failParty) {
    players.forEach((player) => {
      player.combat.combat.hp = 0;
      player.combat.combat.state = 'dead';
      player.combat.deathReason = 'movement-trap';
    });
  }
  const restoredSkills = readFormalSkillRuntime(getBrowserStorage());
  players.forEach((player, index) => {
    const source = index === 0 ? restoredSkills?.player1 : restoredSkills?.player2;
    if (source) player.combat.skill.loadout = source.skillLoadout;
  });
  const syncSkills = (payload: FormalSkillsUpdatedPayload) => {
    const player = players.find((candidate) => candidate.combat.slot === payload.owner);
    if (player) player.combat.skill.loadout = payload.skillLoadout;
  };
  scene.events.on(FormalSkillsUpdatedEvent, syncSkills);
  const movement = createLevelHeroMovementRuntime(playerViews.map((view) => ({
    x: view.x,
    y: STAGE22_GROUND_TOP_Y,
    width: view.displayWidth,
    currentPlatformId: STAGE22_GROUND_PLATFORM_ID,
  })));
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
  const rewards: Stage1RewardBridge = createStage1RewardBridge(scene, players, stage22MovementPlatforms);
  const hud = createStage1CombatHudBridge(
    scene,
    () => players.map((player) => createStage1CombatPlayerHudSnapshot(player.combat)),
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
      updatePlayers(players, movement, inputs, flow, scene.cameras.main.scrollX, scene.time.now, deltaMs);
      activateReachedStopPoint(flow, players);
      for (const enemy of updateStage22Spawners(flow, qa.fastClear ? Math.max(deltaMs, 2_000) : deltaMs)) {
        monsters.set(enemy.id, createMonsterView(scene, enemy, attackGeometry, monster16Geometry));
      }
      if (qa.fastClear) clearQaMonsters(flow, monsters);
      updateFire(
        scene,
        players,
        movement,
        hazards,
        fireViews,
        updateFireViews,
        deltaMs,
        Boolean(qa.fastClear || qa.noDamage),
      );
      updateMonsterCombat(
        scene,
        players,
        inputs,
        movement,
        monsters,
        flow,
        combatRuntime,
        scene.time.now,
        deltaMs,
        rewards,
        Boolean(qa.fastClear || qa.noDamage),
        Boolean(qa.bossState && qa.bossState !== 'door'),
      );
      rewards.update(deltaMs);
      hud.update(deltaMs);
      if (updateStage22PartyFailure(
        flow,
        players.filter((player) => player.combat.combat.state !== 'dead').length,
        deltaMs,
      ) === 'failed') {
        reportedResult = 'failed';
        return 'failed';
      }
      transferDoor.setVisible(flow.doorVisible);
      const doorUsed = players.some((player, index) => {
        const playerInput = inputs[index];
        return player.combat.combat.state !== 'dead'
          && Boolean(playerInput?.up)
          && Math.abs(player.view.x - stage22TransferDoor.x) <= 125;
      });
      if (tryCompleteStage22(flow, doorUsed, doorUsed)) {
        reportedResult = 'cleared';
        return 'cleared';
      }
      followParty(scene, players, flow);
      return undefined;
    },
    destroy: () => {
      scene.events.off(FormalSkillsUpdatedEvent, syncSkills);
      rewards.destroy();
      hud.destroy();
      for (const monster of monsters.values()) destroyMonster(monster);
      monsters.clear();
    },
  };
}

function updatePlayers(
  players: PlayerRuntime[],
  movement: LevelHeroMovementRuntime,
  inputs: readonly PlayerInputState[],
  flow: Stage22FlowModel,
  cameraScrollX: number,
  timeMs: number,
  deltaMs: number,
): void {
  updateLevelHeroMovementRuntime(
    movement,
    inputs,
    players.map((player) => player.combat.combat.state !== 'dead'),
    (_index, member) => ({
      platforms: stage22MovementPlatforms,
      bounds: {
        left: cameraScrollX + STAGE22_SCREEN_LEFT_X - member.width / 2,
        right: getStage22TravelRight(flow.nextStopPointIdx) + member.width / 2,
      },
    }),
    timeMs,
    deltaMs,
  );
  movement.members.forEach((member, index) => {
    const player = players[index];
    const input = inputs[index];
    if (!player || !input || player.combat.combat.state === 'dead') return;
    updateStage1CombatPlayer({
      player: player.combat,
      input,
      movement: member.movement,
      bounds: {
        left: cameraScrollX + STAGE22_SCREEN_LEFT_X - member.movement.width / 2,
        right: getStage22TravelRight(flow.nextStopPointIdx) + member.movement.width / 2,
      },
      timeMs,
      deltaMs,
    });
    player.view.setPosition(member.movement.x, member.movement.y);
  });
}

function activateReachedStopPoint(flow: Stage22FlowModel, players: readonly PlayerRuntime[]): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...players
    .filter((player) => player.combat.combat.state !== 'dead')
    .map((player) => player.view.x), 0);
  if (hasReachedStage22StopPoint(frontX, nextIdx)) touchStage22StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  scene: Phaser.Scene,
  players: PlayerRuntime[],
  inputs: readonly PlayerInputState[],
  movement: LevelHeroMovementRuntime,
  monsters: Map<string, MonsterRuntime>,
  flow: Stage22FlowModel,
  runtime: Stage1CombatRuntime,
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
        targets: players.map((player) => ({
          slot: player.combat.slot,
          x: player.view.x,
          alive: player.combat.combat.state !== 'dead',
        })),
        deltaMs,
      });
    }
    updateMonsterView(scene, monster, deltaMs);
    if (!ignoreEnemyDamage) {
      resolveStage1EnemyAttack({
        runtime,
        enemy: monster.combat,
        players: players.map((player) => ({ player: player.combat, x: player.view.x })),
        timeMs,
      });
    }
  }
  players.forEach((player, index) => {
    const member = movement.members[index]?.movement;
    const input = inputs[index];
    if (!member || !input) return;
    resolveStage1HeroAttack({
      runtime,
      player: player.combat,
      movement: member,
      enemies: [...monsters.values()].map((monster) => monster.combat),
      timeMs,
    });
  });
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
  players.forEach(syncPlayerFeedback);
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
  players: PlayerRuntime[],
  movement: LevelHeroMovementRuntime,
  hazards: Stage22FireHazardModel[],
  _views: readonly Phaser.GameObjects.Image[],
  updateViews: (hazards: readonly Stage22FireHazardModel[]) => void,
  deltaMs: number,
  ignoreDamage: boolean,
): void {
  const hits = updateStage22FireHazards(
    hazards,
    players.map((player, index) => ({
      slot: player.combat.slot,
      x: player.view.x,
      y: player.view.y,
      width: player.view.displayWidth,
      height: player.view.displayHeight,
      facingX: movement.members[index]?.movement.facingX ?? 1,
      alive: player.combat.combat.state !== 'dead',
      isYourFather: false,
    })),
    deltaMs,
    (hazard, target) => hasVisibleStage22FirePixel(scene, hazard, target),
  );
  updateViews(hazards);
  if (ignoreDamage) return;
  for (const hit of hits) {
    const index = players.findIndex((player) => player.combat.slot === hit.target);
    const player = players[index];
    const member = movement.members[index]?.movement;
    if (!player || !member || player.combat.combat.state === 'dead') continue;
    player.combat.combat.hp = Math.max(0, player.combat.combat.hp - hit.damage);
    member.x = Phaser.Math.Clamp(
      member.x + hit.knockbackX,
      STAGE22_SCREEN_LEFT_X,
      getStage22TravelRight(undefined),
    );
    player.combat.combat.state = player.combat.combat.hp === 0 ? 'dead' : 'hurt';
    if (player.combat.combat.hp === 0) player.combat.deathReason = 'movement-trap';
  }
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

function syncPlayerFeedback(player: PlayerRuntime): void {
  if (player.combat.combat.state === 'dead') player.view.setTint(0x555555);
  else if (player.combat.combat.state === 'hurt') player.view.setTint(0xff8888);
  else if (player.combat.normalAttack.activeAttack) player.view.setTint(0xffdf80);
  else player.view.clearTint();
}

function followParty(scene: Phaser.Scene, players: readonly PlayerRuntime[], flow: Stage22FlowModel): void {
  const living = players.filter((player) => player.combat.combat.state !== 'dead');
  if (living.length === 0) return;
  scene.cameras.main.scrollX = getStage22CameraScrollX(
    Math.max(...living.map((player) => player.view.x)),
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
