// boundary: Stage 2-1 bridge adapts Phaser views, input, flow, hazards, and shared combat;
// it does not own combat stats, attack windows, damage, protection, or death rules.
import Phaser from 'phaser';
import { createInputSystem, type PlayerInputState } from '../../systems/InputSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
  type LevelHeroMovementRuntime,
} from '../../systems/LevelHeroMovementSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../../systems/Stage11FlowSystem';
import {
  createStage21Flow,
  defeatStage21Enemy,
  touchStage21StopPoint,
  tryCompleteStage21,
  updateStage21PartyFailure,
  updateStage21Spawners,
  type Stage21Enemy,
  type Stage21FlowModel,
} from '../../systems/Stage21FlowSystem';
import {
  STAGE21_GROUND_PLATFORM_ID,
  STAGE21_GROUND_TOP_Y,
  stage21TransferDoor,
} from '../../systems/Stage21Layout';
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
} from './Stage21MonsterVisualBridge';
import {
  isStage21MonsterAttackAction,
  Stage21MonsterVisualProvenance,
} from '../../systems/Stage21MonsterVisualSystem';

type PlayerRuntime = {
  view: Phaser.GameObjects.Image;
  combat: Stage1CombatPlayer;
};

type MonsterRuntime = {
  combat: Stage1CombatEnemy;
  view: Stage21MonsterView;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

export type Stage21GameplayHandle = Readonly<{
  flow: Stage21FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

export function createStage21Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: Phaser.GameObjects.Image,
  iceViews: readonly Phaser.GameObjects.Image[],
  qa: Stage21QaOptions = {},
): Stage21GameplayHandle {
  const flow = createStage21Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const combatRuntime = createStage1CombatRuntime();
  const players: PlayerRuntime[] = playerViews.map((view, index) => ({
    view,
    combat: createStage1CombatPlayer(index === 0 ? 'p1' : 'p2'),
  }));
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
  const movementRuntime = createLevelHeroMovementRuntime(playerViews.map((view) => ({
    x: view.x,
    y: STAGE21_GROUND_TOP_Y,
    width: view.displayWidth,
    currentPlatformId: STAGE21_GROUND_PLATFORM_ID,
  })));
  const monsters = new Map<string, MonsterRuntime>();
  const attackGeometry = readStage21AttackGeometry(scene);
  if (qa.showcase && qa.holdEnemyType) {
    const showcase = createMonsterView(scene, {
      id: 'stage21-qa-showcase',
      enemyType: qa.holdEnemyType,
      spawnPointId: 'stage21-qa-showcase',
      stopPointIdx: 0,
      x: 410,
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
  const rewards: Stage1RewardBridge = createStage1RewardBridge(scene, players, stage21MovementPlatforms);
  const hud = createStage1CombatHudBridge(
    scene,
    () => players.map((player) => createStage1CombatPlayerHudSnapshot(player.combat)),
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
    updatePlayers(
      players,
      movementRuntime,
      [state.p1, state.p2],
      flow,
      scene.cameras.main.scrollX,
      scene.time.now,
      deltaMs,
    );
    activateReachedStopPoint(flow, players);
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
    updateIceHazards(players, movementRuntime, iceHazards, iceViews, deltaMs, Boolean(qa.fastClear || qa.noDamage));
    updateMonsterCombat(
      scene,
      players,
      [state.p1, state.p2],
      movementRuntime,
      monsters,
      flow,
      combatRuntime,
      scene.time.now,
      deltaMs,
      rewards,
      Boolean(qa.fastClear || qa.noDamage),
      qa,
    );
    rewards.update(deltaMs);
    hud.update(deltaMs);

    const phase = updateStage21PartyFailure(
      flow,
      players.filter((player) => player.combat.combat.state !== 'dead').length,
      deltaMs,
    );
    transferDoor.setVisible(flow.doorVisible);
    if (phase === 'failed') {
      reportedResult = 'failed';
      return reportedResult;
    }

    const doorUsed = players.some((player, index) => {
      if (player.combat.combat.state === 'dead') return false;
      const playerInput = index === 0 ? state.p1 : state.p2;
      return Math.abs(player.view.x - stage21TransferDoor.x) <= 125 && playerInput.up;
    });
    if (tryCompleteStage21(flow, doorUsed, doorUsed)) {
      reportedResult = 'cleared';
      return reportedResult;
    }

    followParty(scene, players, flow);
    updateStatus(status, flow, players, rewards.getSummary());
    return undefined;
  };

  return {
    flow,
    update,
    destroy: () => {
      scene.events.off(FormalSkillsUpdatedEvent, syncSkills);
      status.destroy();
      rewards.destroy();
      hud.destroy();
      for (const monster of monsters.values()) destroyMonsterView(monster);
      monsters.clear();
    },
  };
}

function updatePlayers(
  players: PlayerRuntime[],
  movementRuntime: LevelHeroMovementRuntime,
  inputs: readonly PlayerInputState[],
  flow: Stage21FlowModel,
  cameraScrollX: number,
  timeMs: number,
  deltaMs: number,
): void {
  updateLevelHeroMovementRuntime(
    movementRuntime,
    inputs,
    players.map((player) => player.combat.combat.state !== 'dead'),
    (_index, movement) => ({
      platforms: stage21MovementPlatforms,
      bounds: {
        left: cameraScrollX + STAGE21_SCREEN_LEFT_X - movement.width / 2,
        right: getStage21TravelRight(flow.nextStopPointIdx) + movement.width / 2,
      },
    }),
    timeMs,
    deltaMs,
  );
  movementRuntime.members.forEach((member, index) => {
    const player = players[index];
    const input = inputs[index];
    if (!player || !input || player.combat.combat.state === 'dead') return;
    updateStage1CombatPlayer({
      player: player.combat,
      input,
      movement: member.movement,
      bounds: {
        left: cameraScrollX + STAGE21_SCREEN_LEFT_X - member.movement.width / 2,
        right: getStage21TravelRight(flow.nextStopPointIdx) + member.movement.width / 2,
      },
      timeMs,
      deltaMs,
    });
  });
  movementRuntime.members.forEach((member, index) => {
    players[index]?.view.setPosition(member.movement.x, member.movement.y);
  });
}

function activateReachedStopPoint(flow: Stage21FlowModel, players: readonly PlayerRuntime[]): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...players
    .filter((player) => player.combat.combat.state !== 'dead')
    .map((player) => player.view.x), 0);
  if (hasReachedStage21StopPoint(frontX, nextIdx)) touchStage21StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  scene: Phaser.Scene,
  players: PlayerRuntime[],
  inputs: readonly PlayerInputState[],
  movementRuntime: LevelHeroMovementRuntime,
  monsters: Map<string, MonsterRuntime>,
  flow: Stage21FlowModel,
  runtime: Stage1CombatRuntime,
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
        targets: players.map((player) => ({
          slot: player.combat.slot,
          x: player.view.x,
          alive: player.combat.combat.state !== 'dead',
        })),
        deltaMs,
      });
    }
    const freezeForcedDeadFrame = monster.combat.enemyType === qa.holdEnemyType
      && qa.forcedEnemyState === 'dead'
      && monster.view.visual.action === 'dead'
      && monster.view.visual.actionTick >= 4;
    if (!freezeForcedDeadFrame) syncMonsterView(scene, monster, deltaMs);
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
    const movement = movementRuntime.members[index]?.movement;
    if (!movement || !inputs[index]) return;
    resolveStage1HeroAttack({
      runtime,
      player: player.combat,
      movement,
      enemies: [...monsters.values()].map((monster) => monster.combat),
      timeMs,
    });
  });
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
  players.forEach(syncPlayerFeedback);
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

function syncPlayerFeedback(player: PlayerRuntime): void {
  if (player.combat.combat.state === 'dead') player.view.setTint(0x555555);
  else if (player.combat.combat.state === 'hurt') player.view.setTint(0xff8888);
  else if (player.combat.normalAttack.activeAttack) player.view.setTint(0xffdf80);
  else player.view.clearTint();
}

function destroyMonsterView(monster: MonsterRuntime): void {
  destroyStage21MonsterView(monster.view);
}

function followParty(scene: Phaser.Scene, players: readonly PlayerRuntime[], flow: Stage21FlowModel): void {
  const living = players.filter((player) => player.combat.combat.state !== 'dead');
  if (living.length === 0) return;
  scene.cameras.main.scrollX = getStage21CameraScrollX(
    Math.max(...living.map((player) => player.view.x)),
    flow.nextStopPointIdx,
  );
}

function updateStatus(
  status: Phaser.GameObjects.Text,
  flow: Stage21FlowModel,
  players: readonly PlayerRuntime[],
  rewardSummary: string,
): void {
  const wave = flow.doorVisible
    ? '巨灵神已败：普通门开启，门前按上'
    : flow.activeStopPointIdx === undefined
      ? `前往停点 ${Number(flow.nextStopPointIdx) + 1}/5`
      : `停点 ${flow.activeStopPointIdx + 1}/5`;
  const hp = players.map((player, index) => {
    const combat = player.combat.combat;
    const cause = player.combat.deathReason ? ` ${player.combat.deathReason}` : '';
    return `P${index + 1} HP ${Math.ceil(combat.hp)}/${combat.maxHp} MP ${player.combat.mp}/${player.combat.maxMp}${cause}`;
  }).join(' · ');
  status.setText(
    `${wave} · 场上 ${flow.aliveEnemies.size}/${flow.maxMonstersOnScreen} · 已生成 ${flow.generatedCount}/53 · 已击败 ${flow.defeatedCount} · ${hp} · ${rewardSummary}`,
  );
}

function updateIceHazards(
  players: PlayerRuntime[],
  movementRuntime: LevelHeroMovementRuntime,
  hazards: Stage21IceHazardModel[],
  views: readonly Phaser.GameObjects.Image[],
  deltaMs: number,
  ignoreDamage = false,
): void {
  const hits = updateStage21IceHazards(hazards, players.map((player, index) => ({
    slot: player.combat.slot,
    x: player.view.x,
    y: player.view.y,
    width: player.view.displayWidth,
    height: player.view.displayHeight,
    facingX: movementRuntime.members[index]?.movement.facingX ?? 1,
    alive: player.combat.combat.state !== 'dead',
  })), deltaMs);
  hazards.forEach((hazard, index) => {
    const view = views[index];
    if (view) view.setTexture(`stage.stage2-1.ice-thorn.frame-${String(hazard.frame).padStart(2, '0')}`);
  });
  if (ignoreDamage) return;
  for (const hit of hits) {
    const index = players.findIndex((player) => player.combat.slot === hit.target);
    const player = players[index];
    const movement = movementRuntime.members[index]?.movement;
    if (!player || !movement || player.combat.combat.state === 'dead') continue;
    player.combat.combat.hp = Math.max(0, player.combat.combat.hp - hit.damage);
    movement.x = Math.min(
      Math.max(movement.x + hit.knockbackX, STAGE21_SCREEN_LEFT_X),
      getStage21TravelRight(undefined),
    );
    if (player.combat.combat.hp === 0) {
      player.combat.combat.state = 'dead';
      player.combat.deathReason = 'movement-trap';
    } else {
      player.combat.combat.state = 'hurt';
    }
  }
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
