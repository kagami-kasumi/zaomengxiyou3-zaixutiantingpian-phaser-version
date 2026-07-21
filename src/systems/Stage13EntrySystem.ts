import { canEnterStage, type StageEntryAccessMode, type StageUnlockProgress } from './StageEntryAccessSystem';

export type Stage13PlayerCount = 1 | 2;

export function canEnterStage13(progress: StageUnlockProgress, accessMode?: StageEntryAccessMode): boolean {
  return canEnterStage(progress, 1, 3, accessMode);
}

export function normalizeStage13PlayerCount(value: unknown): Stage13PlayerCount {
  return value === 2 ? 2 : 1;
}
