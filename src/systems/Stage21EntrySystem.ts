import { canEnterStage, type StageEntryAccessMode, type StageUnlockProgress } from './StageEntryAccessSystem';

export type Stage21PlayerCount = 1 | 2;

export function canEnterStage21(progress: StageUnlockProgress, accessMode?: StageEntryAccessMode): boolean {
  return canEnterStage(progress, 2, 1, accessMode);
}

export function normalizeStage21PlayerCount(value: unknown): Stage21PlayerCount {
  return value === 2 ? 2 : 1;
}
