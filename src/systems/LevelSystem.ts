import type { Monster3Model } from './Monster3System';
import { createMonster3, isMonster3Removed } from './Monster3System';
import {
  STAGE11_WORLD_HEIGHT,
  STAGE11_WORLD_WIDTH,
  stage11TransferDoor,
} from './Stage11Layout';

export type BossArenaState = 'inactive' | 'active' | 'cleared';

export type TransferDoor = {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
};

export type BossArenaModel = {
  state: BossArenaState;
  boss?: Monster3Model;
  door: TransferDoor;
  triggerZone: { x: number; y: number; width: number; height: number };
  arenaBounds: { left: number; right: number; top: number; bottom: number };
};

export const TransferDoorCollisionTolerance = 1;

export function createBossArena(): BossArenaModel {
  const door = stage11TransferDoor.bounds;
  return {
    state: 'inactive',
    door: {
      x: door.left,
      y: door.top,
      width: door.right - door.left,
      height: door.bottom - door.top,
      visible: false,
    },
    triggerZone: { x: 0, y: 470, width: STAGE11_WORLD_WIDTH, height: 1 },
    arenaBounds: { left: 0, right: STAGE11_WORLD_WIDTH, top: 0, bottom: 590 },
  };
}

export function checkBossArenaTrigger(
  arena: BossArenaModel,
  _playerX: number,
  playerY: number,
): boolean {
  if (arena.state !== 'inactive') {
    return false;
  }

  return playerY <= arena.triggerZone.y;
}

export function activateBossArena(arena: BossArenaModel): Monster3Model {
  arena.state = 'active';
  arena.boss = createMonster3(750, 350);
  return arena.boss;
}

export function tryClearArena(
  arena: BossArenaModel,
  playerX: number,
  playerY: number,
  upPressed: boolean,
): boolean {
  if (arena.state !== 'active') {
    return false;
  }

  if (!arena.door.visible) {
    return false;
  }

  if (!upPressed) {
    return false;
  }

  const inDoorX = playerX >= arena.door.x - TransferDoorCollisionTolerance &&
    playerX <= arena.door.x + arena.door.width + TransferDoorCollisionTolerance;
  const inDoorY = playerY >= arena.door.y - TransferDoorCollisionTolerance &&
    playerY <= arena.door.y + arena.door.height + TransferDoorCollisionTolerance;

  if (inDoorX && inDoorY) {
    arena.state = 'cleared';
    return true;
  }

  return false;
}

export function revealTransferDoor(arena: BossArenaModel): void {
  arena.door.visible = true;
}

export function isBossDead(monster: Monster3Model): boolean {
  return monster.state === 'dead' || isMonster3Removed(monster);
}

// ── Vertical climb model ──

export type StopPointDef = {
  y: number;
  cleared: boolean;
  waveSpawned: boolean;
  waveHadActiveMonsters: boolean;
};

export type VerticalClimbTuning = {
  worldWidth: number;
  worldHeight: number;
  spawnIntervalMs: number;
  singlePlayerSpawnCount: number;
  duoPlayerSpawnCount: number;
  bossTriggerY: number;
  bossCameraPlayerScreenRatio: number;
  bossCameraTweenMs: number;
  stopPoints: StopPointDef[];
  cloudLayers: readonly { parallaxSpeed: number; count: number }[];
};

export const defaultClimbTuning: VerticalClimbTuning = {
  worldWidth: STAGE11_WORLD_WIDTH,
  worldHeight: STAGE11_WORLD_HEIGHT,
  spawnIntervalMs: 10_000,
  singlePlayerSpawnCount: 2,
  duoPlayerSpawnCount: 4,
  bossTriggerY: 470,
  // StageListener11 moves the player to y=-1950 while tweening gameSence.y
  // to 2370, leaving the player at screen y=420 in the original 590px view.
  bossCameraPlayerScreenRatio: 420 / 590,
  bossCameraTweenMs: 2_000,
  stopPoints: [
    { y: 2000, cleared: false, waveSpawned: false, waveHadActiveMonsters: false },
    { y: 1500, cleared: false, waveSpawned: false, waveHadActiveMonsters: false },
    { y: 1000, cleared: false, waveSpawned: false, waveHadActiveMonsters: false },
    { y: 500, cleared: false, waveSpawned: false, waveHadActiveMonsters: false },
  ],
  cloudLayers: [
    { parallaxSpeed: 0.12, count: 6 },
    { parallaxSpeed: 0.25, count: 4 },
    { parallaxSpeed: 0.45, count: 3 },
  ],
};

export type VerticalClimbState = {
  cameraY: number;
  targetCameraY: number;
  spawnTimerMs: number;
  stopPoints: StopPointDef[];
  activeStopIndex: number;
  bossTriggered: boolean;
  bossArenaActivated: boolean;
  bossCameraTweenRemainingMs: number;
  cloudScrolls: number[];
};

export function createVerticalClimbState(viewportHeight: number): VerticalClimbState {
  const maxCameraY = defaultClimbTuning.worldHeight - viewportHeight;
  return {
    cameraY: maxCameraY,
    targetCameraY: maxCameraY,
    spawnTimerMs: 0,
    stopPoints: defaultClimbTuning.stopPoints.map((sp) => ({
      y: sp.y,
      cleared: sp.cleared,
      waveSpawned: sp.waveSpawned,
      waveHadActiveMonsters: sp.waveHadActiveMonsters,
    })),
    activeStopIndex: -1,
    bossTriggered: false,
    bossArenaActivated: false,
    bossCameraTweenRemainingMs: 0,
    cloudScrolls: defaultClimbTuning.cloudLayers.map(() => 0),
  };
}

export function updateVerticalClimbCamera(
  state: VerticalClimbState,
  playerMinY: number,
  deltaMs: number,
  viewportHeight: number,
): void {
  if (!state.bossTriggered) {
    const playerScreenRatio = playerMinY <= defaultClimbTuning.bossTriggerY
      ? defaultClimbTuning.bossCameraPlayerScreenRatio
      : 0.4;
    const desiredCameraY = playerMinY - viewportHeight * playerScreenRatio;

    const retainedStop = state.stopPoints[state.activeStopIndex];
    const stopIdx = retainedStop && !retainedStop.cleared
      ? state.activeStopIndex
      : findActiveStopPoint(state, playerMinY);
    if (stopIdx >= 0) {
      state.activeStopIndex = stopIdx;
    } else {
      state.activeStopIndex = -1;
    }
    // Stop points gate wave/boss progression, not visibility. A living player who
    // climbs ahead must remain visible even while enemies from that stop survive.
    state.targetCameraY = desiredCameraY;
  }

  const maxCameraY = defaultClimbTuning.worldHeight - viewportHeight;
  state.targetCameraY = Math.max(0, Math.min(state.targetCameraY, maxCameraY));

  if (state.bossTriggered && state.bossCameraTweenRemainingMs > 0) {
    const tweenStep = Math.min(deltaMs / state.bossCameraTweenRemainingMs, 1);
    state.cameraY += (state.targetCameraY - state.cameraY) * tweenStep;
    state.bossCameraTweenRemainingMs = Math.max(
      state.bossCameraTweenRemainingMs - deltaMs,
      0,
    );
  } else {
    const lerpSpeed = 4.5;
    state.cameraY += (state.targetCameraY - state.cameraY) *
      Math.min(lerpSpeed * (deltaMs / 1000), 1);
  }
  state.cameraY = Math.max(0, Math.min(state.cameraY, maxCameraY));
}

export function findActiveStopPoint(
  state: VerticalClimbState,
  playerMinY: number,
): number {
  for (let i = 0; i < state.stopPoints.length; i += 1) {
    if (!state.stopPoints[i].cleared && playerMinY <= state.stopPoints[i].y) {
      return i;
    }
  }
  return -1;
}

export function updateVerticalClimbSpawn(
  state: VerticalClimbState,
  deltaMs: number,
  activeMonsterCount: number,
  alivePlayerCount: number,
): boolean {
  if (state.bossTriggered || alivePlayerCount === 0) {
    return false;
  }

  if (state.activeStopIndex >= 0) {
    const stopPoint = state.stopPoints[state.activeStopIndex];

    if (!stopPoint.waveSpawned) {
      stopPoint.waveSpawned = true;
      state.spawnTimerMs = defaultClimbTuning.spawnIntervalMs;
      return true;
    }

    if (activeMonsterCount > 0) {
      stopPoint.waveHadActiveMonsters = true;
      return false;
    }

    if (!stopPoint.waveHadActiveMonsters) {
      return false;
    }

    stopPoint.cleared = true;
    state.activeStopIndex = -1;
    return false;
  }

  if (activeMonsterCount > 0) {
    state.spawnTimerMs = defaultClimbTuning.spawnIntervalMs;
    return false;
  }

  state.spawnTimerMs -= deltaMs;
  if (state.spawnTimerMs > 0) {
    return false;
  }

  state.spawnTimerMs = defaultClimbTuning.spawnIntervalMs;
  return true;
}

export function markStopPointWaveSpawned(
  state: VerticalClimbState,
  stopIndex: number,
  spawnedCount: number,
): void {
  const stopPoint = state.stopPoints[stopIndex];
  if (!stopPoint) {
    return;
  }

  if (spawnedCount > 0) {
    stopPoint.waveHadActiveMonsters = true;
  }
}

export function getSpawnCount(playerCount: number): number {
  return playerCount === 1
    ? defaultClimbTuning.singlePlayerSpawnCount
    : defaultClimbTuning.duoPlayerSpawnCount;
}

export function getSpawnPosition(
  heroX: number,
  heroY: number,
  random: () => number,
): { x: number; y: number } {
  const x = heroX + (random() - 0.5) * 300;
  const y = heroY - (100 + random() * 200);
  return { x, y };
}

export function isBossZoneTriggered(
  state: VerticalClimbState,
  playerMinY: number,
): boolean {
  if (state.bossTriggered) {
    return false;
  }
  return playerMinY <= defaultClimbTuning.bossTriggerY;
}

export function markBossTriggered(state: VerticalClimbState): void {
  state.bossTriggered = true;
  state.bossArenaActivated = true;
  state.bossCameraTweenRemainingMs = defaultClimbTuning.bossCameraTweenMs;
}

export function updateCloudScrolls(
  state: VerticalClimbState,
  cameraDelta: number,
): void {
  for (let i = 0; i < state.cloudScrolls.length; i += 1) {
    state.cloudScrolls[i] += cameraDelta * defaultClimbTuning.cloudLayers[i].parallaxSpeed;
  }
}
