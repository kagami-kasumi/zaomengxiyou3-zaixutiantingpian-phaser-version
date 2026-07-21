import {
  stage13SpawnPoints,
  stage13StopPoints,
  type Stage13SpawnPoint,
} from './Stage13Layout';
import {
  advanceLevelUnlockProgress,
  createDefaultLevelUnlockProgress,
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';

export type Stage13FlowPhase = 'playing' | 'failure-pending' | 'failed' | 'cleared';
export type Stage13EnemyType = Stage13SpawnPoint['enemyType'];

export type Stage13Enemy = Readonly<{
  id: string;
  enemyType: Stage13EnemyType;
  spawnPointId: string;
  stopPointIdx: Stage13SpawnPoint['stopPointIdx'];
  x: number;
  y: number;
  maxHp: number;
  isBoss: boolean;
  isFlying: boolean;
}>;

type Stage13Spawner = {
  point: Stage13SpawnPoint;
  remaining: number;
  nextSpawnMs: number;
  ready: boolean;
};

export type Stage13FlowModel = {
  phase: Stage13FlowPhase;
  playerCount: 1 | 2;
  maxMonstersOnScreen: 6 | 8;
  failureDelayRemainingMs: number;
  nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  activeSpawners: Stage13Spawner[];
  aliveEnemies: Map<string, Stage13Enemy>;
  defeatedCount: number;
  generatedCount: number;
  doorVisible: boolean;
  unlockProgress: LevelUnlockProgress;
  nextEnemyId: number;
};

export const Stage13FailureDelayMs = 2_500;

const monsterMaxHp: Record<Stage13EnemyType, number> = {
  3: 400,
  5: 2_788,
  7: 200,
  8: 300,
  30: 150,
};

export function createStage13Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage13FlowModel {
  return {
    phase: 'playing',
    playerCount,
    maxMonstersOnScreen: playerCount === 1 ? 6 : 8,
    failureDelayRemainingMs: 0,
    nextStopPointIdx: 0,
    activeStopPointIdx: undefined,
    activeSpawners: [],
    aliveEnemies: new Map(),
    defeatedCount: 0,
    generatedCount: 0,
    doorVisible: false,
    unlockProgress: sanitizeLevelUnlockProgress(unlockProgress),
    nextEnemyId: 1,
  };
}

export function touchStage13StopPoint(model: Stage13FlowModel, stopPointIdx: number): boolean {
  if (model.phase !== 'playing' || model.activeStopPointIdx !== undefined) return false;
  if (model.nextStopPointIdx !== stopPointIdx) return false;
  const stopPoint = stage13StopPoints.find((point) => point.idx === stopPointIdx);
  if (!stopPoint) return false;
  model.activeStopPointIdx = stopPoint.idx;
  model.activeSpawners = stage13SpawnPoints
    .filter((point) => point.stopPointIdx === stopPoint.idx)
    .map((point) => ({
      point,
      remaining: point.totalNum,
      nextSpawnMs: (point.delay + point.interval) * 1_000,
      ready: false,
    }));
  return true;
}

export function updateStage13Spawners(model: Stage13FlowModel, deltaMs: number): readonly Stage13Enemy[] {
  if (model.phase === 'failed' || model.phase === 'cleared') return [];
  if (model.activeStopPointIdx === undefined) return [];

  const elapsedMs = Math.max(0, deltaMs);
  for (const spawner of model.activeSpawners) {
    if (spawner.remaining === 0 || spawner.ready) continue;
    spawner.nextSpawnMs -= elapsedMs;
    if (spawner.nextSpawnMs <= 0) spawner.ready = true;
  }

  const spawned: Stage13Enemy[] = [];
  for (const spawner of model.activeSpawners) {
    if (!spawner.ready || model.aliveEnemies.size >= model.maxMonstersOnScreen) continue;
    const enemy = createEnemy(model, spawner.point);
    model.aliveEnemies.set(enemy.id, enemy);
    spawned.push(enemy);
    model.generatedCount += 1;
    spawner.remaining -= 1;
    spawner.ready = false;
    spawner.nextSpawnMs = spawner.point.interval * 1_000;
  }
  finishActiveStopPointIfCleared(model);
  return spawned;
}

export function defeatStage13Enemy(model: Stage13FlowModel, enemyId: string): boolean {
  const enemy = model.aliveEnemies.get(enemyId);
  if (!enemy) return false;
  model.aliveEnemies.delete(enemyId);
  model.defeatedCount += 1;
  if (enemy.enemyType === 5) model.doorVisible = true;
  finishActiveStopPointIfCleared(model);
  return true;
}

export function updateStage13PartyFailure(
  model: Stage13FlowModel,
  alivePlayerCount: number,
  deltaMs: number,
): Stage13FlowPhase {
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
    model.failureDelayRemainingMs = Stage13FailureDelayMs;
    return model.phase;
  }
  model.failureDelayRemainingMs = Math.max(0, model.failureDelayRemainingMs - Math.max(0, deltaMs));
  if (model.failureDelayRemainingMs === 0) model.phase = 'failed';
  return model.phase;
}

export function tryCompleteStage13(
  model: Stage13FlowModel,
  playerInsideDoor: boolean,
  upPressed: boolean,
): boolean {
  if (model.phase !== 'playing' || !model.doorVisible || !playerInsideDoor || !upPressed) return false;
  model.phase = 'cleared';
  model.failureDelayRemainingMs = 0;
  model.unlockProgress = advanceLevelUnlockProgress(model.unlockProgress, 2, 1);
  return true;
}

function createEnemy(model: Stage13FlowModel, point: Stage13SpawnPoint): Stage13Enemy {
  return {
    id: `stage13-enemy-${model.nextEnemyId++}`,
    enemyType: point.enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx,
    x: point.x,
    y: point.y,
    maxHp: monsterMaxHp[point.enemyType],
    isBoss: point.enemyType === 5,
    isFlying: point.enemyType === 30,
  };
}

function finishActiveStopPointIfCleared(model: Stage13FlowModel): void {
  const activeIdx = model.activeStopPointIdx;
  if (activeIdx === undefined) return;
  const allGenerated = model.activeSpawners.every((spawner) => spawner.remaining === 0);
  if (!allGenerated || model.aliveEnemies.size > 0) return;
  model.activeSpawners = [];
  model.activeStopPointIdx = undefined;
  model.nextStopPointIdx = activeIdx === 4 ? undefined : (activeIdx + 1) as 1 | 2 | 3 | 4;
}
