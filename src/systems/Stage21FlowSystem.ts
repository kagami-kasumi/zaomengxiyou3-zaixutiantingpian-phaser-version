import {
  stage21SpawnPoints,
  stage21StopPoints,
  type Stage21SpawnPoint,
} from './Stage21Layout';
import {
  DefaultLevelFailureDelayMs,
  LevelLifecycle,
  createDefaultLevelUnlockProgress,
  type LevelUnlockProgress,
} from './LevelLifecycleSystem';
import { getStage1EnemyConfig } from './Stage1CombatSystem';

export type Stage21FlowPhase = import('./LevelLifecycleSystem').LevelLifecyclePhase;
export type Stage21EnemyType = Stage21SpawnPoint['enemyType'];

export type Stage21Enemy = Readonly<{
  id: string;
  enemyType: Stage21EnemyType;
  spawnPointId: string;
  stopPointIdx: Stage21SpawnPoint['stopPointIdx'];
  x: number;
  y: number;
  maxHp: number;
  isBoss: boolean;
  isFlying: false;
}>;

type Stage21Spawner = {
  point: Stage21SpawnPoint;
  remaining: number;
  nextSpawnMs: number;
  ready: boolean;
};

export class Stage21FlowModel extends LevelLifecycle {
  public readonly maxMonstersOnScreen: 6 | 8;
  public nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined = 0;
  public activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  public activeSpawners: Stage21Spawner[] = [];
  public aliveEnemies = new Map<string, Stage21Enemy>();
  public defeatedCount = 0;
  public generatedCount = 0;
  public doorVisible = false;
  public nextEnemyId = 1;

  public constructor(playerCount: 1 | 2, unlockProgress: LevelUnlockProgress) {
    super({
      playerCount,
      unlockProgress,
      unlockTarget: { unlockedStage: 2, unlockedLevel: 2 },
    });
    this.maxMonstersOnScreen = playerCount === 1 ? 6 : 8;
  }
}

export const Stage21FailureDelayMs = DefaultLevelFailureDelayMs;

export function createStage21Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage21FlowModel {
  return new Stage21FlowModel(playerCount, unlockProgress);
}

export function touchStage21StopPoint(model: Stage21FlowModel, stopPointIdx: number): boolean {
  if (model.phase !== 'playing' || model.activeStopPointIdx !== undefined) return false;
  if (model.nextStopPointIdx !== stopPointIdx) return false;
  const stopPoint = stage21StopPoints.find((point) => point.idx === stopPointIdx);
  if (!stopPoint) return false;
  model.activeStopPointIdx = stopPoint.idx;
  model.activeSpawners = stage21SpawnPoints
    .filter((point) => point.stopPointIdx === stopPoint.idx)
    .map((point) => ({
      point,
      remaining: point.totalNum,
      nextSpawnMs: (point.delay + point.interval) * 1_000,
      ready: false,
    }));
  return true;
}

export function updateStage21Spawners(model: Stage21FlowModel, deltaMs: number): readonly Stage21Enemy[] {
  if (model.phase === 'failed' || model.phase === 'cleared') return [];
  if (model.activeStopPointIdx === undefined) return [];

  const elapsedMs = Math.max(0, deltaMs);
  for (const spawner of model.activeSpawners) {
    if (spawner.remaining === 0 || spawner.ready) continue;
    spawner.nextSpawnMs -= elapsedMs;
    if (spawner.nextSpawnMs <= 0) spawner.ready = true;
  }

  const spawned: Stage21Enemy[] = [];
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

export function defeatStage21Enemy(model: Stage21FlowModel, enemyId: string): boolean {
  const enemy = model.aliveEnemies.get(enemyId);
  if (!enemy) return false;
  model.aliveEnemies.delete(enemyId);
  model.defeatedCount += 1;
  if (enemy.enemyType === 6) model.doorVisible = true;
  finishActiveStopPointIfCleared(model);
  return true;
}

function createEnemy(model: Stage21FlowModel, point: Stage21SpawnPoint): Stage21Enemy {
  return {
    id: `stage21-enemy-${model.nextEnemyId++}`,
    enemyType: point.enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx,
    x: point.x,
    y: point.y,
    maxHp: getStage1EnemyConfig(point.enemyType).maxHp,
    isBoss: point.enemyType === 6,
    isFlying: false,
  };
}

function finishActiveStopPointIfCleared(model: Stage21FlowModel): void {
  const activeIdx = model.activeStopPointIdx;
  if (activeIdx === undefined) return;
  const allGenerated = model.activeSpawners.every((spawner) => spawner.remaining === 0);
  if (!allGenerated || model.aliveEnemies.size > 0) return;
  model.activeSpawners = [];
  model.activeStopPointIdx = undefined;
  model.nextStopPointIdx = activeIdx === 4 ? undefined : (activeIdx + 1) as 1 | 2 | 3 | 4;
}
