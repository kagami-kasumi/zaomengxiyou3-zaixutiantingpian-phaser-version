export type StageUnlockProgress = Readonly<{
  unlockedStage: number;
  unlockedLevel: number;
}>;

export type StageEntryAccessMode = 'testing-open' | 'progression';

// Keep this open while stages are reproduced independently. Saved progression
// continues to advance and can be enforced later by switching this one value.
export const stageEntryAccessMode: StageEntryAccessMode = 'testing-open';

export function canEnterStage(
  progress: StageUnlockProgress,
  requiredStage: number,
  requiredLevel: number,
  accessMode: StageEntryAccessMode = stageEntryAccessMode,
): boolean {
  return accessMode === 'testing-open'
    || progress.unlockedStage > requiredStage
    || (progress.unlockedStage === requiredStage && progress.unlockedLevel >= requiredLevel);
}
