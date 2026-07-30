import { getStage1EnemyConfig } from './Stage1CombatSystem';
import {
  DefaultLevelFailureDelayMs,
  LevelLifecycle,
  createDefaultLevelUnlockProgress,
  type LevelUnlockProgress,
} from './LevelLifecycleSystem';
import {
  stage22SpawnPoints,
  stage22StopPoints,
  type Stage22SpawnPoint,
} from './Stage22Layout';

export type Stage22FlowPhase = import('./LevelLifecycleSystem').LevelLifecyclePhase;
export type Stage22EncounterPhase = 'waves' | 'boss';

export type Stage22Enemy = Readonly<{
  id: string;
  enemyType: Stage22SpawnPoint['enemyType'];
  spawnPointId: string;
  stopPointIdx: Stage22SpawnPoint['stopPointIdx'];
  x: number;
  y: number;
  maxHp: number;
  isBoss: boolean;
  isFlying: false;
}>;

type Stage22Spawner = {
  point: Stage22SpawnPoint;
  remaining: number;
  nextSpawnMs: number;
  ready: boolean;
};

export class Stage22FlowModel extends LevelLifecycle {
  public readonly maxMonstersOnScreen: 6 | 8;
  public encounterPhase: Stage22EncounterPhase = 'waves';
  public nextStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined = 0;
  public activeStopPointIdx: 0 | 1 | 2 | 3 | 4 | undefined;
  public activeSpawners: Stage22Spawner[] = [];
  public aliveEnemies = new Map<string, Stage22Enemy>();
  public defeatedCount = 0;
  public generatedCount = 0;
  public doorVisible = false;
  public nextEnemyId = 1;

  public constructor(playerCount: 1 | 2, unlockProgress: LevelUnlockProgress) {
    super({
      playerCount,
      unlockProgress,
      unlockTarget: { unlockedStage: 2, unlockedLevel: 3 },
    });
    this.maxMonstersOnScreen = playerCount === 1 ? 6 : 8;
  }
}

export const Stage22FailureDelayMs = DefaultLevelFailureDelayMs;
export const Stage22ConfiguredEnemyCount = 54;
export const Stage22OrdinaryEnemyCount = 53;

export function createStage22Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage22FlowModel {
  return new Stage22FlowModel(playerCount, unlockProgress);
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
  if (model.phase !== 'playing' || model.encounterPhase === 'boss' || model.activeStopPointIdx === undefined) return [];
  const elapsedMs = Math.max(0, deltaMs);
  for (const spawner of model.activeSpawners) {
    if (spawner.remaining === 0 || spawner.ready) continue;
    spawner.nextSpawnMs -= elapsedMs;
    if (spawner.nextSpawnMs <= 0) spawner.ready = true;
  }

  const spawned: Stage22Enemy[] = [];
  for (const spawner of model.activeSpawners) {
    if (!spawner.ready || model.aliveEnemies.size >= model.maxMonstersOnScreen) continue;
    const enemy = createEnemy(model, spawner.point);
    model.aliveEnemies.set(enemy.id, enemy);
    spawned.push(enemy);
    model.generatedCount += 1;
    spawner.remaining -= 1;
    spawner.ready = false;
    spawner.nextSpawnMs = spawner.point.interval * 1_000;
    if (enemy.isBoss) model.encounterPhase = 'boss';
  }
  finishActiveStopPointIfCleared(model);
  return spawned;
}

export function defeatStage22Enemy(model: Stage22FlowModel, enemyId: string): boolean {
  const enemy = model.aliveEnemies.get(enemyId);
  if (!enemy) return false;
  model.aliveEnemies.delete(enemyId);
  model.defeatedCount += 1;
  if (enemy.isBoss) {
    model.doorVisible = true;
    model.encounterPhase = 'waves';
    model.activeSpawners = [];
    model.activeStopPointIdx = undefined;
    model.nextStopPointIdx = undefined;
  }
  finishActiveStopPointIfCleared(model);
  return true;
}

function createEnemy(model: Stage22FlowModel, point: Stage22SpawnPoint): Stage22Enemy {
  return {
    id: `stage22-enemy-${model.nextEnemyId++}`,
    enemyType: point.enemyType,
    spawnPointId: point.id,
    stopPointIdx: point.stopPointIdx,
    x: point.x,
    y: point.y,
    maxHp: getStage1EnemyConfig(point.enemyType).maxHp,
    isBoss: point.enemyType === 16,
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
