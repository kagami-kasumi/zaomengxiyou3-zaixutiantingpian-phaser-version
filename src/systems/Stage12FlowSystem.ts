import {
  stage12SpawnPoints,
  stage12StopPoints,
  type Stage12SpawnPoint,
} from './Stage12Layout';
import {
  DefaultLevelFailureDelayMs,
  LevelLifecycle,
  createDefaultLevelUnlockProgress,
  type LevelUnlockProgress,
} from './LevelLifecycleSystem';
import { getStage1EnemyConfig } from './Stage1CombatSystem';

export type Stage12FlowPhase = import('./LevelLifecycleSystem').LevelLifecyclePhase;

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

export class Stage12FlowModel extends LevelLifecycle {
  public nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined = 0;
  public activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  public activeSpawners: Stage12Spawner[] = [];
  public aliveEnemies = new Map<string, Stage12Enemy>();
  public defeatedCount = 0;
  public doorVisible = false;
  public nextEnemyId = 1;

  public constructor(playerCount: 1 | 2, unlockProgress: LevelUnlockProgress) {
    super({
      playerCount,
      unlockProgress,
      unlockTarget: { unlockedStage: 1, unlockedLevel: 3 },
    });
  }
}

export const Stage12FailureDelayMs = DefaultLevelFailureDelayMs;

export function createStage12Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage12FlowModel {
  return new Stage12FlowModel(playerCount, unlockProgress);
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

function createEnemy(model: Stage12FlowModel, point: Stage12SpawnPoint): Stage12Enemy {
  const enemyType = point.enemyType;
  return {
    id: `stage12-enemy-${model.nextEnemyId++}`,
    enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx,
    x: point.x,
    y: point.y,
    maxHp: getStage1EnemyConfig(enemyType).maxHp,
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
