import Phaser from 'phaser';
import { createInputSystem, type PlayerInputState } from '../../systems/InputSystem';
import {
  createHeroMovement,
  updateHeroMovement,
  type HeroMovementModel,
} from '../../systems/HeroMovementSystem';
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
import { createStage12FbEnterBridge, type Stage12FbEnterHandle } from './Stage12FbEnterBridge';

type PlayerRuntime = {
  view: Phaser.GameObjects.Image;
  movement: HeroMovementModel;
  previousInput?: PlayerInputState;
  hp: number;
  attackCooldownMs: number;
};

type EnemyRuntime = {
  model: Stage12Enemy;
  hp: number;
  body: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  contactCooldownMs: number;
};

export type Stage12GameplayResult = 'failed' | 'cleared' | 'fb-entered';

export type Stage12GameplayHandle = Readonly<{
  flow: Stage12FlowModel;
  update: (deltaMs: number) => Stage12GameplayResult | undefined;
  destroy: () => void;
}>;

const playerAttackRange = 165;
const playerAttackDamage = 500;

export function createStage12Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: Phaser.GameObjects.Image,
  fbEnterImage: Phaser.GameObjects.Image,
): Stage12GameplayHandle {
  const flow = createStage12Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const players: PlayerRuntime[] = playerViews.map((view) => {
    const movement = createHeroMovement(view.x, STAGE12_GROUND_TOP_Y, view.displayWidth);
    movement.currentPlatformId = STAGE12_GROUND_PLATFORM_ID;
    return { view, movement, hp: 5, attackCooldownMs: 0 };
  });
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
    updatePlayers(players, [state.p1, state.p2], flow, scene.cameras.main.scrollX, scene.time.now, deltaMs);
    if (fbEnter.update(
      deltaMs,
      [state.p1, state.p2],
      players.map((player) => player.hp > 0),
    )) {
      reportedResult = 'fb-entered';
      return reportedResult;
    }
    activateReachedStopPoint(flow, players);
    for (const enemy of updateStage12Spawners(flow, deltaMs)) {
      enemies.set(enemy.id, createEnemyView(scene, enemy));
    }
    updateEnemyCombat(players, [state.p1, state.p2], enemies, flow, deltaMs);

    const phase = updateStage12PartyFailure(
      flow,
      players.filter((player) => player.hp > 0).length,
      deltaMs,
    );
    transferDoor.setVisible(flow.doorVisible);
    if (phase === 'failed') {
      reportedResult = 'failed';
      return reportedResult;
    }

    const doorUsed = players.some((player, index) => {
      if (player.hp <= 0) return false;
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
  inputs: readonly PlayerInputState[],
  flow: Stage12FlowModel,
  cameraScrollX: number,
  timeMs: number,
  deltaMs: number,
): void {
  players.forEach((player, index) => {
    if (player.hp <= 0) return;
    player.attackCooldownMs = Math.max(0, player.attackCooldownMs - deltaMs);
    const input = inputs[index];
    updateHeroMovement(
      player.movement,
      input,
      player.previousInput,
      stage12MovementPlatforms,
      {
        left: cameraScrollX + STAGE12_SCREEN_LEFT_X - player.movement.width / 2,
        right: getStage12TravelRight(flow.nextStopPointIdx) + player.movement.width / 2,
      },
      timeMs,
      deltaMs,
    );
    player.previousInput = input;
    player.view.setPosition(player.movement.x, player.movement.y);
  });
}

function activateReachedStopPoint(flow: Stage12FlowModel, players: readonly PlayerRuntime[]): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...players.filter((player) => player.hp > 0).map((player) => player.view.x), 0);
  if (hasReachedStage12StopPoint(frontX, nextIdx)) touchStage12StopPoint(flow, nextIdx);
}

function updateEnemyCombat(
  players: PlayerRuntime[],
  inputs: readonly PlayerInputState[],
  enemies: Map<string, EnemyRuntime>,
  flow: Stage12FlowModel,
  deltaMs: number,
): void {
  for (const [id, enemy] of enemies) {
    enemy.contactCooldownMs = Math.max(0, enemy.contactCooldownMs - deltaMs);
    const target = nearestLivingPlayer(enemy.body.x, players);
    if (target) {
      const distance = target.view.x - enemy.body.x;
      enemy.body.x += Math.sign(distance) * Math.min(Math.abs(distance), 34 * deltaMs / 1_000);
      enemy.label.x = enemy.body.x;
      if (Math.abs(distance) < 42 && enemy.contactCooldownMs === 0) {
        target.hp = Math.max(0, target.hp - 1);
        target.view.setTint(target.hp === 0 ? 0x555555 : 0xffaaaa);
        enemy.contactCooldownMs = 900;
      }
    }

    for (let index = 0; index < players.length; index += 1) {
      const player = players[index];
      const state = inputs[index];
      if (player.hp <= 0 || !state.attack || player.attackCooldownMs > 0) continue;
      if (Math.abs(player.view.x - enemy.body.x) > playerAttackRange) continue;
      player.attackCooldownMs = 240;
      enemy.hp -= playerAttackDamage;
      enemy.body.setFillStyle(enemy.hp > 0 ? 0xffb067 : 0x666666);
      if (enemy.hp <= 0) {
        defeatStage12Enemy(flow, id);
        destroyEnemyView(enemy);
        enemies.delete(id);
      }
      break;
    }
  }
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
  return { model: enemy, hp: enemy.maxHp, body, label, contactCooldownMs: 0 };
}

function destroyEnemyView(enemy: EnemyRuntime): void {
  enemy.body.destroy();
  enemy.label.destroy();
}

function nearestLivingPlayer(x: number, players: readonly PlayerRuntime[]): PlayerRuntime | undefined {
  return players
    .filter((player) => player.hp > 0)
    .sort((left, right) => Math.abs(left.view.x - x) - Math.abs(right.view.x - x))[0];
}

function followParty(
  scene: Phaser.Scene,
  players: readonly PlayerRuntime[],
  flow: Stage12FlowModel,
): void {
  const living = players.filter((player) => player.hp > 0);
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
  const hp = players.map((player, index) => `P${index + 1} HP ${player.hp}/5`).join(' · ');
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
