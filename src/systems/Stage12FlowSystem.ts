import {
  stage12SpawnPoints,
  stage12StopPoints,
  type Stage12SpawnPoint,
} from './Stage12Layout';
import {
  advanceLevelUnlockProgress,
  createDefaultLevelUnlockProgress,
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';

export type Stage12FlowPhase = 'playing' | 'failure-pending' | 'failed' | 'cleared';

export type Stage12EnemyType = Stage12SpawnPoint['enemyType'];

export type Stage12Enemy = Readonly<{
  id: string;
  enemyType: Stage12EnemyType;
  spawnPointId: string;
  stopPointIdx: Stage12SpawnPoint['stopPointIdx'];
  x: number;
  y: number;
  maxHp: number;
  isBoss: boolean;
}>;

type Stage12Spawner = {
  point: Stage12SpawnPoint;
  remaining: number;
  nextSpawnMs: number;
};

export type Stage12FlowModel = {
  phase: Stage12FlowPhase;
  playerCount: 1 | 2;
  failureDelayRemainingMs: number;
  nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  activeSpawners: Stage12Spawner[];
  aliveEnemies: Map<string, Stage12Enemy>;
  defeatedCount: number;
  doorVisible: boolean;
  unlockProgress: LevelUnlockProgress;
  nextEnemyId: number;
};

export const Stage12FailureDelayMs = 2_500;

const monsterMaxHp: Record<Stage12EnemyType, number> = {
  2: 1_500,
  4: 1_481,
  7: 300,
  8: 260,
};

export function createStage12Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage12FlowModel {
  return {
    phase: 'playing',
    playerCount,
    failureDelayRemainingMs: 0,
    nextStopPointIdx: 0,
    activeStopPointIdx: undefined,
    activeSpawners: [],
    aliveEnemies: new Map(),
    defeatedCount: 0,
    doorVisible: false,
    unlockProgress: sanitizeLevelUnlockProgress(unlockProgress),
    nextEnemyId: 1,
  };
}

export function touchStage12StopPoint(
  model: Stage12FlowModel,
  stopPointIdx: number,
): boolean {
  if (model.phase !== 'playing' || model.activeStopPointIdx !== undefined) return false;
  if (model.nextStopPointIdx !== stopPointIdx) return false;
  const stopPoint = stage12StopPoints.find((point) => point.idx === stopPointIdx);
  if (!stopPoint) return false;

  model.activeStopPointIdx = stopPoint.idx;
  model.activeSpawners = stage12SpawnPoints
    .filter((point) => point.stopPointIdx === stopPoint.idx)
    .map((point) => ({
      point,
      remaining: point.totalNum,
      nextSpawnMs: (point.delay + point.interval) * 1_000,
    }));
  return true;
}

export function updateStage12Spawners(
  model: Stage12FlowModel,
  deltaMs: number,
): readonly Stage12Enemy[] {
  if (model.phase === 'failed' || model.phase === 'cleared') return [];
  if (model.activeStopPointIdx === undefined) return [];

  const spawned: Stage12Enemy[] = [];
  const elapsedMs = Math.max(0, deltaMs);
  for (const spawner of model.activeSpawners) {
    spawner.nextSpawnMs -= elapsedMs;
    while (spawner.remaining > 0 && spawner.nextSpawnMs <= 0) {
      const enemy = createEnemy(model, spawner.point);
      model.aliveEnemies.set(enemy.id, enemy);
      spawned.push(enemy);
      spawner.remaining -= 1;
      spawner.nextSpawnMs += spawner.point.interval * 1_000;
    }
  }
  finishActiveStopPointIfCleared(model);
  return spawned;
}

export function defeatStage12Enemy(model: Stage12FlowModel, enemyId: string): boolean {
  if (!model.aliveEnemies.delete(enemyId)) return false;
  model.defeatedCount += 1;
  finishActiveStopPointIfCleared(model);
  return true;
}

export function updateStage12PartyFailure(
  model: Stage12FlowModel,
  alivePlayerCount: number,
  deltaMs: number,
): Stage12FlowPhase {
  if (model.phase === 'failed' || model.phase === 'cleared') return model.phase;
  if (alivePlayerCount > 0) {
    if (model.phase === 'failure-pending') {
      model.phase = 'playing';
      model.failureDelayRemainingMs = 0;
    }
    return model.phase;
  }
  if (model.phase === 'playing') {
    model.phase = 'failure-pending';
    model.failureDelayRemainingMs = Stage12FailureDelayMs;
    return model.phase;
  }
  model.failureDelayRemainingMs = Math.max(
    0,
    model.failureDelayRemainingMs - Math.max(0, deltaMs),
  );
  if (model.failureDelayRemainingMs === 0) model.phase = 'failed';
  return model.phase;
}

export function tryCompleteStage12(
  model: Stage12FlowModel,
  playerInsideDoor: boolean,
  upPressed: boolean,
): boolean {
  if (model.phase !== 'playing' || !model.doorVisible || !playerInsideDoor || !upPressed) {
    return false;
  }
  model.phase = 'cleared';
  model.failureDelayRemainingMs = 0;
  model.unlockProgress = advanceLevelUnlockProgress(model.unlockProgress, 1, 3);
  return true;
}

function createEnemy(model: Stage12FlowModel, point: Stage12SpawnPoint): Stage12Enemy {
  const enemyType = point.enemyType;
  return {
    id: `stage12-enemy-${model.nextEnemyId++}`,
    enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx,
    x: point.x,
    y: point.y,
    maxHp: monsterMaxHp[enemyType],
    isBoss: enemyType === 2 || enemyType === 4,
  };
}

function finishActiveStopPointIfCleared(model: Stage12FlowModel): void {
  const activeIdx = model.activeStopPointIdx;
  if (activeIdx === undefined) return;
  const allGenerated = model.activeSpawners.every((spawner) => spawner.remaining === 0);
  if (!allGenerated || model.aliveEnemies.size > 0) return;

  model.activeSpawners = [];
  model.activeStopPointIdx = undefined;
  if (activeIdx === 4) {
    model.nextStopPointIdx = undefined;
    model.doorVisible = true;
  } else {
    model.nextStopPointIdx = (activeIdx + 1) as 1 | 2 | 3 | 4;
  }
}
