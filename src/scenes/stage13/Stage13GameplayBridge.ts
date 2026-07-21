import Phaser from 'phaser';
import { createInputSystem, type PlayerInputState } from '../../systems/InputSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
  type LevelHeroMovementRuntime,
} from '../../systems/LevelHeroMovementSystem';
import { loadGame, type SaveStorage } from '../../systems/SaveSystem';
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

type PlayerRuntime = {
  view: Phaser.GameObjects.Image;
  hp: number;
  attackCooldownMs: number;
  damageCooldownMs: number;
};

type MonsterRuntime = {
  model: Stage13Enemy;
  hp: number;
  body: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  contactCooldownMs: number;
};

export type Stage13GameplayHandle = Readonly<{
  flow: Stage13FlowModel;
  update: (deltaMs: number) => 'failed' | 'cleared' | undefined;
  destroy: () => void;
}>;

const playerAttackRange = 170;
const playerAttackDamage = 500;

export function createStage13Gameplay(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
  playerViews: readonly Phaser.GameObjects.Image[],
  transferDoor: Phaser.GameObjects.Image,
): Stage13GameplayHandle {
  const flow = createStage13Flow(playerCount, readUnlockProgress());
  const input = createInputSystem(scene);
  const players: PlayerRuntime[] = playerViews.map((view) => ({
    view, hp: 8, attackCooldownMs: 0, damageCooldownMs: 0,
  }));
  const movementRuntime = createLevelHeroMovementRuntime(playerViews.map((view) => ({
    x: view.x,
    y: STAGE13_GROUND_TOP_Y,
    width: view.displayWidth,
    currentPlatformId: STAGE13_GROUND_PLATFORM_ID,
  })));
  const monsters = new Map<string, MonsterRuntime>();
  const status = scene.add.text(18, 51, '', {
    color: '#dce8ff', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
  }).setScrollFactor(0).setDepth(100);
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
    updateMonsterCombat(players, [state.p1, state.p2], monsters, flow, deltaMs);

    const phase = updateStage13PartyFailure(
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
      return Math.abs(player.view.x - stage13TransferDoor.x) <= 125 && playerInput.up;
    });
    if (tryCompleteStage13(flow, doorUsed, doorUsed)) {
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
  players.forEach((player) => {
    player.attackCooldownMs = Math.max(0, player.attackCooldownMs - deltaMs);
    player.damageCooldownMs = Math.max(0, player.damageCooldownMs - deltaMs);
  });
  updateLevelHeroMovementRuntime(
    movementRuntime,
    inputs,
    players.map((player) => player.hp > 0),
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
    players[index]?.view.setPosition(member.movement.x, member.movement.y);
  });
}

function activateReachedStopPoint(flow: Stage13FlowModel, players: readonly PlayerRuntime[]): void {
  const nextIdx = flow.nextStopPointIdx;
  if (nextIdx === undefined || flow.activeStopPointIdx !== undefined) return;
  const frontX = Math.max(...players.filter((player) => player.hp > 0).map((player) => player.view.x), 0);
  if (hasReachedStage13StopPoint(frontX, nextIdx)) touchStage13StopPoint(flow, nextIdx);
}

function updateMonsterCombat(
  players: PlayerRuntime[],
  inputs: readonly PlayerInputState[],
  monsters: Map<string, MonsterRuntime>,
  flow: Stage13FlowModel,
  deltaMs: number,
): void {
  for (const [id, monster] of monsters) {
    monster.contactCooldownMs = Math.max(0, monster.contactCooldownMs - deltaMs);
    const target = nearestLivingPlayer(monster.body.x, players);
    if (target) {
      const distance = target.view.x - monster.body.x;
      const speed = monster.model.isFlying ? 46 : monster.model.isBoss ? 28 : 34;
      monster.body.x += Math.sign(distance) * Math.min(Math.abs(distance), speed * deltaMs / 1_000);
      monster.label.x = monster.body.x;
      if (Math.abs(distance) < 46 && monster.contactCooldownMs === 0 && target.damageCooldownMs === 0) {
        target.hp = Math.max(0, target.hp - 1);
        target.damageCooldownMs = 700;
        target.view.setTint(target.hp === 0 ? 0x555555 : 0xffaaaa);
        monster.contactCooldownMs = 900;
      }
    }

    for (let index = 0; index < players.length; index += 1) {
      const player = players[index];
      if (player.hp <= 0 || !inputs[index]?.attack || player.attackCooldownMs > 0) continue;
      if (Math.abs(player.view.x - monster.body.x) > playerAttackRange) continue;
      player.attackCooldownMs = 240;
      monster.hp -= playerAttackDamage;
      monster.body.setFillStyle(monster.hp > 0 ? 0xffb067 : 0x666666);
      if (monster.hp <= 0) {
        defeatStage13Enemy(flow, id);
        destroyMonsterView(monster);
        monsters.delete(id);
      }
      break;
    }
  }
}

function createMonsterView(scene: Phaser.Scene, monster: Stage13Enemy): MonsterRuntime {
  const color = monster.enemyType === 5 ? 0xd86b63
    : monster.enemyType === 30 ? 0xc58be2
      : monster.enemyType === 3 ? 0x8f63d8
        : monster.enemyType === 7 ? 0x6cbf73 : 0x5ca8d8;
  const radius = monster.isBoss ? 36 : monster.isFlying ? 15 : 18;
  const centerY = monster.isFlying ? monster.y : STAGE13_GROUND_TOP_Y - radius;
  const body = scene.add.circle(monster.x, centerY, radius, color)
    .setStrokeStyle(2, 0x1a2130).setDepth(18);
  const label = scene.add.text(monster.x, centerY, `M${monster.enemyType}`, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: monster.isBoss ? '14px' : '11px',
  }).setOrigin(0.5).setDepth(19);
  return { model: monster, hp: monster.maxHp, body, label, contactCooldownMs: 0 };
}

function destroyMonsterView(monster: MonsterRuntime): void {
  monster.body.destroy();
  monster.label.destroy();
}

function nearestLivingPlayer(x: number, players: readonly PlayerRuntime[]): PlayerRuntime | undefined {
  return players
    .filter((player) => player.hp > 0)
    .sort((left, right) => Math.abs(left.view.x - x) - Math.abs(right.view.x - x))[0];
}

function followParty(scene: Phaser.Scene, players: readonly PlayerRuntime[], flow: Stage13FlowModel): void {
  const living = players.filter((player) => player.hp > 0);
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
): void {
  const wave = flow.doorVisible
    ? '巨灵神已败：普通门开启，门前按上'
    : flow.activeStopPointIdx === undefined
      ? `前往停点 ${Number(flow.nextStopPointIdx) + 1}/5`
      : `停点 ${flow.activeStopPointIdx + 1}/5`;
  const hp = players.map((player, index) => `P${index + 1} HP ${player.hp}/8`).join(' · ');
  status.setText(
    `${wave} · 场上 ${flow.aliveEnemies.size}/${flow.maxMonstersOnScreen} · 已生成 ${flow.generatedCount}/105 · 已击败 ${flow.defeatedCount} · ${hp}`,
  );
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
