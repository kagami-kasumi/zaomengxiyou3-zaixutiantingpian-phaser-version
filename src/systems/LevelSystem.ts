import type { Monster3Model } from './Monster3System';
import { createMonster3, isMonster3Removed } from './Monster3System';

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

export function createBossArena(): BossArenaModel {
  return {
    state: 'inactive',
    door: {
      x: 410,
      y: 260,
      width: 120,
      height: 140,
      visible: false,
    },
    triggerZone: { x: 0, y: 180, width: 940, height: 1 },
    arenaBounds: { left: 0, right: 940, top: 40, bottom: 590 },
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
  arena.boss = createMonster3(470, 120);
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

  const inDoorX = playerX >= arena.door.x &&
    playerX <= arena.door.x + arena.door.width;
  const inDoorY = playerY >= arena.door.y &&
    playerY <= arena.door.y + arena.door.height;

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
  stopPoints: StopPointDef[];
  cloudLayers: readonly { parallaxSpeed: number; count: number }[];
};

export const defaultClimbTuning: VerticalClimbTuning = {
  worldWidth: 940,
  worldHeight: 2500,
  spawnIntervalMs: 6000,
  singlePlayerSpawnCount: 2,
  duoPlayerSpawnCount: 4,
  bossTriggerY: 180,
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
    cloudScrolls: defaultClimbTuning.cloudLayers.map(() => 0),
  };
}

export function updateVerticalClimbCamera(
  state: VerticalClimbState,
  playerMinY: number,
  deltaMs: number,
  viewportHeight: number,
): void {
  if (state.bossTriggered) {
    return;
  }

  const desiredCameraY = playerMinY - viewportHeight * 0.4;

  const stopIdx = findActiveStopPoint(state, playerMinY);
  if (stopIdx >= 0) {
    const stopY = state.stopPoints[stopIdx].y;
    state.targetCameraY = Math.max(desiredCameraY, stopY - viewportHeight + 80);
    state.activeStopIndex = stopIdx;
  } else {
    state.activeStopIndex = -1;
    state.targetCameraY = Math.max(
      desiredCameraY,
      defaultClimbTuning.bossTriggerY - viewportHeight + 80,
    );
  }

  const maxCameraY = defaultClimbTuning.worldHeight - viewportHeight;
  state.targetCameraY = Math.max(0, Math.min(state.targetCameraY, maxCameraY));

  const lerpSpeed = 4.5;
  state.cameraY += (state.targetCameraY - state.cameraY) * Math.min(lerpSpeed * (deltaMs / 1000), 1);
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
}

export function updateCloudScrolls(
  state: VerticalClimbState,
  cameraDelta: number,
): void {
  for (let i = 0; i < state.cloudScrolls.length; i += 1) {
    state.cloudScrolls[i] += cameraDelta * defaultClimbTuning.cloudLayers[i].parallaxSpeed;
  }
}
