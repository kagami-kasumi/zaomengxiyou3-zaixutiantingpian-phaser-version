// boundary: Stage 1-3 bridge adapts Phaser views, input, flow, and shared combat;
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
  createStage13Flow,
  defeatStage13Enemy,
  touchStage13StopPoint,
  tryCompleteStage13,
  updateStage13PartyFailure,
  updateStage13Spawners,
  type Stage13Enemy,
  type Stage13FlowModel,
} from '../../systems/Stage13FlowSystem';
import {
  STAGE13_GROUND_PLATFORM_ID,
  STAGE13_GROUND_TOP_Y,
  stage13TransferDoor,
} from '../../systems/Stage13Layout';
import {
  getStage13CameraScrollX,
  getStage13TravelRight,
  hasReachedStage13StopPoint,
  stage13MovementPlatforms,
  STAGE13_SCREEN_LEFT_X,
} from '../../systems/Stage13TraversalSystem';
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

type PlayerRuntime = {
  view: Phaser.GameObjects.Image;
  combat: Stage1CombatPlayer;
};

type MonsterRuntime = {
  model: Stage13Enemy;
  combat: Stage1CombatEnemy;
  body: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  physics: MonsterPhysicsModel;
};

export type Stage13GameplayHandle = Readonly<{
  flow: Stage13FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

export function createStage13Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: Phaser.GameObjects.Image,
): Stage13GameplayHandle {
  const flow = createStage13Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const combatRuntime = createStage1CombatRuntime();
  const players: PlayerRuntime[] = playerViews.map((view, index) => ({
    view,
    combat: createStage1CombatPlayer(index === 0 ? 'p1' : 'p2'),
  }));
  const movementRuntime = createLevelHeroMovementRuntime(playerViews.map((view) => ({
    x: view.x,
    y: STAGE13_GROUND_TOP_Y,
    width: view.displayWidth,
    currentPlatformId: STAGE13_GROUND_PLATFORM_ID,
  })));
  const monsters = new Map<string, MonsterRuntime>();
  const rewards: Stage1RewardBridge = createStage1RewardBridge(scene, players, stage13MovementPlatforms);
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
    for (const monster of updateStage13Spawners(flow, deltaMs)) {
      monsters.set(monster.id, createMonsterView(scene, monster));
    }
    updateMonsterCombat(
      players,
      [state.p1, state.p2],
      movementRuntime,
      monsters,
      flow,
      combatRuntime,
      scene.time.now,
      deltaMs,
      rewards,
    );
    rewards.update(deltaMs);
    hud.update(deltaMs);

    const phase = updateStage13PartyFailure(
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
      return Math.abs(player.view.x - stage13TransferDoor.x) <= 125 && playerInput.up;
    });
    if (tryCompleteStage13(flow, doorUsed, doorUsed)) {
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
  flow: Stage13FlowModel,
  cameraScrollX: number,
  timeMs: number,
  deltaMs: number,
): void {
  updateLevelHeroMovementRuntime(
    movementRuntime,
    inputs,
    players.map((player) => player.combat.combat.state !== 'dead'),
    (_index, movement) => ({
      platforms: stage13MovementPlatforms,
      bounds: {
        left: cameraScrollX + STAGE13_SCREEN_LEFT_X - movement.width / 2,
        right: getStage13TravelRight(flow.nextStopPointIdx) + movement.width / 2,
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
        left: cameraScrollX + STAGE13_SCREEN_LEFT_X - member.movement.width / 2,
        right: getStage13TravelRight(flow.nextStopPointIdx) + member.movement.width / 2,
      },
      timeMs,
      deltaMs,
    });
  });
  movementRuntime.members.forEach((member, index) => {
    players[index]?.view.setPosition(member.movement.x, member.movement.y);
  });
}

function activateReachedStopPoint(flow: Stage13FlowModel, players: readonly PlayerRuntime[]): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...players
    .filter((player) => player.combat.combat.state !== 'dead')
    .map((player) => player.view.x), 0);
  if (hasReachedStage13StopPoint(frontX, nextIdx)) touchStage13StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  players: PlayerRuntime[],
  inputs: readonly PlayerInputState[],
  movementRuntime: LevelHeroMovementRuntime,
  monsters: Map<string, MonsterRuntime>,
  flow: Stage13FlowModel,
  runtime: Stage1CombatRuntime,
  timeMs: number,
  deltaMs: number,
  rewards: Stage1RewardBridge,
): void {
  for (const monster of monsters.values()) {
    updateMonsterPhysics(monster.physics, monster.combat.x, stage13MovementPlatforms, deltaMs);
    monster.combat.y = monster.physics.y;
    updateStage1Enemy({
      enemy: monster.combat,
      targets: players.map((player) => ({
        slot: player.combat.slot,
        x: player.view.x,
        alive: player.combat.combat.state !== 'dead',
      })),
      deltaMs,
    });
    syncMonsterView(monster);
    resolveStage1EnemyAttack({
      runtime,
      enemy: monster.combat,
      players: players.map((player) => ({ player: player.combat, x: player.view.x })),
      timeMs,
    });
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
    syncMonsterView(monster);
    if (monster.combat.phase !== 'dead') continue;
    rewards.onMonsterDefeated(monster.combat);
    defeatStage13Enemy(flow, id);
    destroyMonsterView(monster);
    monsters.delete(id);
  }
  players.forEach(syncPlayerFeedback);
}

function createMonsterView(scene: Phaser.Scene, monster: Stage13Enemy): MonsterRuntime {
  const color = monster.enemyType === 5 ? 0xd86b63
    : monster.enemyType === 30 ? 0xc58be2
      : monster.enemyType === 3 ? 0x8f63d8
        : monster.enemyType === 7 ? 0x6cbf73 : 0x5ca8d8;
  const radius = monster.isBoss ? 36 : monster.isFlying ? 15 : 18;
  const physics = createMonsterPhysics({
    y: monster.y,
    height: radius * 2,
    motionMode: monster.isFlying ? 'flying' : 'grounded',
  });
  const body = scene.add.circle(monster.x, physics.y, radius, color)
    .setStrokeStyle(2, 0x1a2130).setDepth(18);
  const label = scene.add.text(monster.x, physics.y, `M${monster.enemyType}`, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: monster.isBoss ? '14px' : '11px',
  }).setOrigin(0.5).setDepth(19);
  return {
    model: monster,
    combat: createStage1CombatEnemy({
      id: monster.id,
      enemyType: monster.enemyType,
      x: monster.x,
      y: physics.y,
    }),
    body,
    label,
    physics,
  };
}

function syncMonsterView(monster: MonsterRuntime): void {
  monster.body.x = monster.combat.x;
  monster.body.y = monster.combat.y;
  monster.label.x = monster.combat.x;
  monster.label.y = monster.combat.y;
  monster.label.setText(`M${monster.model.enemyType}${monster.combat.phase === 'windup' ? ' !' : monster.combat.phase === 'active' ? ' *' : ''}`);
  const color = monster.combat.phase === 'windup' ? 0xffd166
    : monster.combat.phase === 'active' ? 0xff5d5d
      : monster.combat.phase === 'hurt' ? 0xffffff : monster.model.enemyType === 5 ? 0xd86b63
        : monster.model.enemyType === 30 ? 0xc58be2
          : monster.model.enemyType === 3 ? 0x8f63d8
            : monster.model.enemyType === 7 ? 0x6cbf73 : 0x5ca8d8;
  monster.body.setFillStyle(color);
}

function syncPlayerFeedback(player: PlayerRuntime): void {
  if (player.combat.combat.state === 'dead') player.view.setTint(0x555555);
  else if (player.combat.combat.state === 'hurt') player.view.setTint(0xff8888);
  else if (player.combat.normalAttack.activeAttack) player.view.setTint(0xffdf80);
  else player.view.clearTint();
}

function destroyMonsterView(monster: MonsterRuntime): void {
  monster.body.destroy();
  monster.label.destroy();
}

function followParty(scene: Phaser.Scene, players: readonly PlayerRuntime[], flow: Stage13FlowModel): void {
  const living = players.filter((player) => player.combat.combat.state !== 'dead');
  if (living.length === 0) return;
  scene.cameras.main.scrollX = getStage13CameraScrollX(
    Math.max(...living.map((player) => player.view.x)),
    flow.nextStopPointIdx,
  );
}

function updateStatus(
  status: Phaser.GameObjects.Text,
  flow: Stage13FlowModel,
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
