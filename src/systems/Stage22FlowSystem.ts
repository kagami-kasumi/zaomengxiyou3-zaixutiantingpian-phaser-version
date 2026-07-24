import { getStage1EnemyConfig } from './Stage1CombatSystem';
import {
  stage22SpawnPoints,
  stage22StopPoints,
  type Stage22SpawnPoint,
} from './Stage22Layout';

export type Stage22FlowPhase = 'playing' | 'awaiting-boss' | 'failure-pending' | 'failed';
export type Stage22OrdinaryEnemyType = Exclude<Stage22SpawnPoint['enemyType'], 16>;

export type Stage22Enemy = Readonly<{
  id: string;
  enemyType: Stage22OrdinaryEnemyType;
  spawnPointId: string;
  stopPointIdx: 0 | 1 | 2 | 3;
  x: number;
  y: number;
  maxHp: number;
  isBoss: false;
  isFlying: false;
}>;

type Stage22Spawner = {
  point: Stage22SpawnPoint;
  remaining: number;
  nextSpawnMs: number;
  ready: boolean;
};

export type Stage22FlowModel = {
  phase: Stage22FlowPhase;
  playerCount: 1 | 2;
  maxMonstersOnScreen: 6 | 8;
  failureDelayRemainingMs: number;
  nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  activeSpawners: Stage22Spawner[];
  aliveEnemies: Map<string, Stage22Enemy>;
  defeatedCount: number;
  generatedCount: number;
  nextEnemyId: number;
};

export const Stage22FailureDelayMs = 2_500;
export const Stage22ConfiguredEnemyCount = 54;
export const Stage22OrdinaryEnemyCount = 53;

export function createStage22Flow(playerCount: 1 | 2): Stage22FlowModel {
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
    nextEnemyId: 1,
  };
}

export function touchStage22StopPoint(model: Stage22FlowModel, stopPointIdx: number): boolean {
  if (model.phase !== 'playing' || model.activeStopPointIdx !== undefined) return false;
  if (model.nextStopPointIdx !== stopPointIdx) return false;
  const stopPoint = stage22StopPoints.find((point) => point.idx === stopPointIdx);
  if (!stopPoint) return false;
  model.activeStopPointIdx = stopPoint.idx;
  model.activeSpawners = stage22SpawnPoints
    .filter((point) => point.stopPointIdx === stopPoint.idx)
    .map((point) => ({
      point,
      remaining: point.totalNum,
      nextSpawnMs: (point.delay + point.interval) * 1_000,
      ready: false,
    }));
  return true;
}

export function updateStage22Spawners(model: Stage22FlowModel, deltaMs: number): readonly Stage22Enemy[] {
  if (model.phase !== 'playing' || model.activeStopPointIdx === undefined) return [];
  const elapsedMs = Math.max(0, deltaMs);
  for (const spawner of model.activeSpawners) {
    if (spawner.remaining === 0 || spawner.ready) continue;
    spawner.nextSpawnMs -= elapsedMs;
    if (spawner.nextSpawnMs <= 0) spawner.ready = true;
  }

  const spawned: Stage22Enemy[] = [];
  for (const spawner of model.activeSpawners) {
    if (!spawner.ready || model.aliveEnemies.size >= model.maxMonstersOnScreen) continue;
    if (spawner.point.enemyType === 16) {
      model.phase = 'awaiting-boss';
      model.activeSpawners = [];
      model.nextStopPointIdx = undefined;
      return spawned;
    }
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

export function defeatStage22Enemy(model: Stage22FlowModel, enemyId: string): boolean {
  if (!model.aliveEnemies.delete(enemyId)) return false;
  model.defeatedCount += 1;
  finishActiveStopPointIfCleared(model);
  return true;
}

export function updateStage22PartyFailure(
  model: Stage22FlowModel,
  alivePlayerCount: number,
  deltaMs: number,
): Stage22FlowPhase {
  if (model.phase === 'failed') return model.phase;
  if (alivePlayerCount > 0) {
    if (model.phase === 'failure-pending') {
      model.phase = 'playing';
      model.failureDelayRemainingMs = 0;
    }
    return model.phase;
  }
  if (model.phase !== 'failure-pending') {
    model.phase = 'failure-pending';
    model.failureDelayRemainingMs = Stage22FailureDelayMs;
    return model.phase;
  }
  model.failureDelayRemainingMs = Math.max(0, model.failureDelayRemainingMs - Math.max(0, deltaMs));
  if (model.failureDelayRemainingMs === 0) model.phase = 'failed';
  return model.phase;
}

function createEnemy(model: Stage22FlowModel, point: Stage22SpawnPoint): Stage22Enemy {
  const enemyType = point.enemyType as Stage22OrdinaryEnemyType;
  return {
    id: `stage22-enemy-${model.nextEnemyId++}`,
    enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx as 0 | 1 | 2 | 3,
    x: point.x,
    y: point.y,
    maxHp: getStage1EnemyConfig(enemyType).maxHp,
    isBoss: false,
    isFlying: false,
  };
}

function finishActiveStopPointIfCleared(model: Stage22FlowModel): void {
  const activeIdx = model.activeStopPointIdx;
  if (activeIdx === undefined || activeIdx === 4) return;
  const allGenerated = model.activeSpawners.every((spawner) => spawner.remaining === 0);
  if (!allGenerated || model.aliveEnemies.size > 0) return;
  model.activeSpawners = [];
  model.activeStopPointIdx = undefined;
  model.nextStopPointIdx = (activeIdx + 1) as 1 | 2 | 3 | 4;
}
