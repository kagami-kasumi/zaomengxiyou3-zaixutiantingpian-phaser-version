// boundary: Stage 1-2 bridge adapts Phaser views, input, flow, and shared combat;
// it does not own combat stats, attack windows, damage, protection, or death rules.
import Phaser from 'phaser';
import { createInputSystem, type PlayerInputState } from '../../systems/InputSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
  type LevelHeroMovementRuntime,
} from '../../systems/LevelHeroMovementSystem';
import {
  createStage12Flow,
  defeatStage12Enemy,
  touchStage12StopPoint,
  tryCompleteStage12,
  updateStage12PartyFailure,
  updateStage12Spawners,
  type Stage12Enemy,
  type Stage12FlowModel,
} from '../../systems/Stage12FlowSystem';
import {
  STAGE12_GROUND_PLATFORM_ID,
  STAGE12_GROUND_TOP_Y,
  stage12TransferDoor,
} from '../../systems/Stage12Layout';
import {
  getStage12CameraScrollX,
  getStage12TravelRight,
  hasReachedStage12StopPoint,
  stage12MovementPlatforms,
  STAGE12_SCREEN_LEFT_X,
} from '../../systems/Stage12TraversalSystem';
import { loadGame, type SaveStorage } from '../../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../../systems/Stage11FlowSystem';
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
import { createStage12FbEnterBridge, type Stage12FbEnterHandle } from './Stage12FbEnterBridge';

type PlayerRuntime = {
  view: Phaser.GameObjects.Image;
  combat: Stage1CombatPlayer;
};

type EnemyRuntime = {
  model: Stage12Enemy;
  combat: Stage1CombatEnemy;
  body: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
};

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
  transferDoor: Phaser.GameObjects.Image,
  fbEnterImage: Phaser.GameObjects.Image,
): Stage12GameplayHandle {
  const flow = createStage12Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const combatRuntime = createStage1CombatRuntime();
  const players: PlayerRuntime[] = playerViews.map((view, index) => ({
    view,
    combat: createStage1CombatPlayer(index === 0 ? 'p1' : 'p2'),
  }));
  const movementRuntime = createLevelHeroMovementRuntime(playerViews.map((view) => ({
    x: view.x,
    y: STAGE12_GROUND_TOP_Y,
    width: view.displayWidth,
    currentPlatformId: STAGE12_GROUND_PLATFORM_ID,
  })));
  const enemies = new Map<string, EnemyRuntime>();
  const fbEnter: Stage12FbEnterHandle = createStage12FbEnterBridge(
    scene,
    fbEnterImage,
    playerViews,
  );
  const status = scene.add.text(18, 51, '', {
    color: '#dce8ff', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
  }).setScrollFactor(0).setDepth(100);
  let reportedResult: Stage12GameplayResult | undefined;

  const update = (deltaMs: number): Stage12GameplayResult | undefined => {
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
    if (fbEnter.update(
      deltaMs,
      [state.p1, state.p2],
      players.map((player) => player.combat.combat.state !== 'dead'),
    )) {
      reportedResult = 'fb-entered';
      return reportedResult;
    }
    activateReachedStopPoint(flow, players);
    for (const enemy of updateStage12Spawners(flow, deltaMs)) {
      enemies.set(enemy.id, createEnemyView(scene, enemy));
    }
    updateEnemyCombat(
      players,
      [state.p1, state.p2],
      movementRuntime,
      enemies,
      flow,
      combatRuntime,
      scene.time.now,
      deltaMs,
    );

    const phase = updateStage12PartyFailure(
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
      return Math.abs(player.view.x - stage12TransferDoor.x) <= 125 && playerInput.up;
    });
    if (tryCompleteStage12(flow, doorUsed, doorUsed)) {
      reportedResult = 'cleared';
      return reportedResult;
    }

    followParty(scene, players, flow);
    updateStatus(status, flow, players);
    return undefined;
  };

  return {
    flow,
    update,
    destroy: () => {
      status.destroy();
      fbEnter.destroy();
      for (const enemy of enemies.values()) destroyEnemyView(enemy);
      enemies.clear();
    },
  };
}

function updatePlayers(
  players: PlayerRuntime[],
  movementRuntime: LevelHeroMovementRuntime,
  inputs: readonly PlayerInputState[],
  flow: Stage12FlowModel,
  cameraScrollX: number,
  timeMs: number,
  deltaMs: number,
): void {
  updateLevelHeroMovementRuntime(
    movementRuntime,
    inputs,
    players.map((player) => player.combat.combat.state !== 'dead'),
    (_index, movement) => ({
      platforms: stage12MovementPlatforms,
      bounds: {
        left: cameraScrollX + STAGE12_SCREEN_LEFT_X - movement.width / 2,
        right: getStage12TravelRight(flow.nextStopPointIdx) + movement.width / 2,
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
        left: cameraScrollX + STAGE12_SCREEN_LEFT_X - member.movement.width / 2,
        right: getStage12TravelRight(flow.nextStopPointIdx) + member.movement.width / 2,
      },
      timeMs,
      deltaMs,
    });
  });
  movementRuntime.members.forEach((member, index) => {
    players[index]?.view.setPosition(member.movement.x, member.movement.y);
  });
}

function activateReachedStopPoint(flow: Stage12FlowModel, players: readonly PlayerRuntime[]): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...players
    .filter((player) => player.combat.combat.state !== 'dead')
    .map((player) => player.view.x), 0);
  if (hasReachedStage12StopPoint(frontX, nextIdx)) touchStage12StopPoint(flow, nextIdx);
}

function updateEnemyCombat(
  players: PlayerRuntime[],
  inputs: readonly PlayerInputState[],
  movementRuntime: LevelHeroMovementRuntime,
  enemies: Map<string, EnemyRuntime>,
  flow: Stage12FlowModel,
  runtime: Stage1CombatRuntime,
  timeMs: number,
  deltaMs: number,
): void {
  for (const enemy of enemies.values()) {
    updateStage1Enemy({
      enemy: enemy.combat,
      targets: players.map((player) => ({
        slot: player.combat.slot,
        x: player.view.x,
        alive: player.combat.combat.state !== 'dead',
      })),
      deltaMs,
    });
    syncEnemyView(enemy);
    resolveStage1EnemyAttack({
      runtime,
      enemy: enemy.combat,
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
      enemies: [...enemies.values()].map((enemy) => enemy.combat),
      timeMs,
    });
  });
  for (const [id, enemy] of enemies) {
    syncEnemyView(enemy);
    if (enemy.combat.phase !== 'dead') continue;
    defeatStage12Enemy(flow, id);
    destroyEnemyView(enemy);
    enemies.delete(id);
  }
  players.forEach(syncPlayerFeedback);
}

function createEnemyView(scene: Phaser.Scene, enemy: Stage12Enemy): EnemyRuntime {
  const color = enemy.enemyType === 2 ? 0x8f63d8
    : enemy.enemyType === 4 ? 0xd86b63
      : enemy.enemyType === 7 ? 0x6cbf73 : 0x5ca8d8;
  const radius = enemy.isBoss ? 28 : 18;
  const groundCenterY = STAGE12_GROUND_TOP_Y - radius;
  const body = scene.add.circle(enemy.x, groundCenterY, radius, color)
    .setStrokeStyle(2, 0x1a2130).setDepth(18);
  const label = scene.add.text(enemy.x, groundCenterY, `M${enemy.enemyType}`, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: enemy.isBoss ? '14px' : '11px',
  }).setOrigin(0.5).setDepth(19);
  return {
    model: enemy,
    combat: createStage1CombatEnemy({
      id: enemy.id,
      enemyType: enemy.enemyType,
      x: enemy.x,
      y: groundCenterY,
    }),
    body,
    label,
  };
}

function syncEnemyView(enemy: EnemyRuntime): void {
  enemy.body.x = enemy.combat.x;
  enemy.label.x = enemy.combat.x;
  enemy.label.setText(`M${enemy.model.enemyType}${enemy.combat.phase === 'windup' ? ' !' : enemy.combat.phase === 'active' ? ' *' : ''}`);
  const color = enemy.combat.phase === 'windup' ? 0xffd166
    : enemy.combat.phase === 'active' ? 0xff5d5d
      : enemy.combat.phase === 'hurt' ? 0xffffff : enemy.model.enemyType === 2 ? 0x8f63d8
        : enemy.model.enemyType === 4 ? 0xd86b63 : enemy.model.enemyType === 7 ? 0x6cbf73 : 0x5ca8d8;
  enemy.body.setFillStyle(color);
}

function syncPlayerFeedback(player: PlayerRuntime): void {
  if (player.combat.combat.state === 'dead') player.view.setTint(0x555555);
  else if (player.combat.combat.state === 'hurt') player.view.setTint(0xff8888);
  else if (player.combat.normalAttack.activeAttack) player.view.setTint(0xffdf80);
  else player.view.clearTint();
}

function destroyEnemyView(enemy: EnemyRuntime): void {
  enemy.body.destroy();
  enemy.label.destroy();
}

function followParty(
  scene: Phaser.Scene,
  players: readonly PlayerRuntime[],
  flow: Stage12FlowModel,
): void {
  const living = players.filter((player) => player.combat.combat.state !== 'dead');
  if (living.length === 0) return;
  const frontX = Math.max(...living.map((player) => player.view.x));
  scene.cameras.main.scrollX = getStage12CameraScrollX(frontX, flow.nextStopPointIdx);
}

function updateStatus(
  status: Phaser.GameObjects.Text,
  flow: Stage12FlowModel,
  players: readonly PlayerRuntime[],
): void {
  const wave = flow.activeStopPointIdx === undefined
    ? flow.doorVisible ? '普通门已开启：到门前按上' : `前往停点 ${Number(flow.nextStopPointIdx) + 1}/5`
    : `停点 ${flow.activeStopPointIdx + 1}/5`;
  const hp = players.map((player, index) => {
    const combat = player.combat.combat;
    const cause = player.combat.deathReason ? ` ${player.combat.deathReason}` : '';
    return `P${index + 1} HP ${Math.ceil(combat.hp)}/${combat.maxHp}${cause}`;
  }).join(' · ');
  status.setText(`${wave} · 场上 ${flow.aliveEnemies.size} · 已击败 ${flow.defeatedCount}/46 · ${hp}`);
}

function readUnlockProgress() {
  const storage = getBrowserStorage();
  return storage
    ? loadGame(storage)?.levelUnlockProgress ?? createDefaultLevelUnlockProgress()
    : createDefaultLevelUnlockProgress();
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
