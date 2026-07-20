export type Stage12UnlockProgress = Readonly<{
  unlockedStage: number;
  unlockedLevel: number;
}>;

export type Stage12PlayerCount = 1 | 2;

export function canEnterStage12(progress: Stage12UnlockProgress): boolean {
  return progress.unlockedStage > 1
    || (progress.unlockedStage === 1 && progress.unlockedLevel >= 2);
}

export function normalizeStage12PlayerCount(value: unknown): Stage12PlayerCount {
  return value === 2 ? 2 : 1;
}
