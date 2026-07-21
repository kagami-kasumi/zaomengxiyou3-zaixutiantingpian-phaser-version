import {
  canEnterStage,
  type StageEntryAccessMode,
  type StageUnlockProgress,
} from './StageEntryAccessSystem';

export type Stage12UnlockProgress = StageUnlockProgress;

export type Stage12PlayerCount = 1 | 2;

export function canEnterStage12(
  progress: Stage12UnlockProgress,
  accessMode?: StageEntryAccessMode,
): boolean {
  return canEnterStage(progress, 1, 2, accessMode);
}

export function normalizeStage12PlayerCount(value: unknown): Stage12PlayerCount {
  return value === 2 ? 2 : 1;
}
