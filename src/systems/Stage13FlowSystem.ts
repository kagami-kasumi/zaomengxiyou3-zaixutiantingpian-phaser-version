import {
  stage13SpawnPoints,
  stage13StopPoints,
  type Stage13SpawnPoint,
} from './Stage13Layout';
import {
  DefaultLevelFailureDelayMs,
  LevelLifecycle,
  createDefaultLevelUnlockProgress,
  type LevelUnlockProgress,
} from './LevelLifecycleSystem';
import { getStage1EnemyConfig } from './Stage1CombatSystem';

export type Stage13FlowPhase = import('./LevelLifecycleSystem').LevelLifecyclePhase;
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

export class Stage13FlowModel extends LevelLifecycle {
  public readonly maxMonstersOnScreen: 6 | 8;
  public nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined = 0;
  public activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  public activeSpawners: Stage13Spawner[] = [];
  public aliveEnemies = new Map<string, Stage13Enemy>();
  public defeatedCount = 0;
  public generatedCount = 0;
  public doorVisible = false;
  public nextEnemyId = 1;

  public constructor(playerCount: 1 | 2, unlockProgress: LevelUnlockProgress) {
    super({
      playerCount,
      unlockProgress,
      unlockTarget: { unlockedStage: 2, unlockedLevel: 1 },
    });
    this.maxMonstersOnScreen = playerCount === 1 ? 6 : 8;
  }
}

export const Stage13FailureDelayMs = DefaultLevelFailureDelayMs;

export function createStage13Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage13FlowModel {
  return new Stage13FlowModel(playerCount, unlockProgress);
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

function createEnemy(model: Stage13FlowModel, point: Stage13SpawnPoint): Stage13Enemy {
  return {
    id: `stage13-enemy-${model.nextEnemyId++}`,
    enemyType: point.enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx,
    x: point.x,
    y: point.y,
    maxHp: getStage1EnemyConfig(point.enemyType).maxHp,
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
