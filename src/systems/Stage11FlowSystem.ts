export type LevelUnlockProgress = {
  unlockedStage: 1 | 2;
  unlockedLevel: 1 | 2 | 3;
};

export type Stage11FlowPhase = 'playing' | 'failure-pending' | 'failed' | 'cleared';

export type Stage11FlowModel = {
  phase: Stage11FlowPhase;
  playerCount: 1 | 2;
  failureDelayRemainingMs: number;
  unlockProgress: LevelUnlockProgress;
};

export const Stage11FailureDelayMs = 2_500;

export function createDefaultLevelUnlockProgress(): LevelUnlockProgress {
  return { unlockedStage: 1, unlockedLevel: 1 };
}

export function createStage11Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage11FlowModel {
  return {
    phase: 'playing',
    playerCount,
    failureDelayRemainingMs: 0,
    unlockProgress: sanitizeLevelUnlockProgress(unlockProgress),
  };
}

export function updateStage11PartyFailure(
  model: Stage11FlowModel,
  alivePlayerCount: number,
  deltaMs: number,
): Stage11FlowPhase {
  if (model.phase === 'failed' || model.phase === 'cleared') return model.phase;

  if (alivePlayerCount > 0) {
    if (model.phase === 'failure-pending') {
      model.phase = 'playing';
      model.failureDelayRemainingMs = 0;
    }
    return model.phase;
  }

  if (model.phase === 'playing') {
    model.phase = 'failure-pending';
    model.failureDelayRemainingMs = Stage11FailureDelayMs;
    return model.phase;
  }

  model.failureDelayRemainingMs = Math.max(
    0,
    model.failureDelayRemainingMs - Math.max(0, deltaMs),
  );
  if (model.failureDelayRemainingMs === 0) model.phase = 'failed';
  return model.phase;
}

export function completeStage11(model: Stage11FlowModel): boolean {
  if (model.phase === 'cleared' || model.phase === 'failed') return false;
  model.phase = 'cleared';
  model.failureDelayRemainingMs = 0;
  model.unlockProgress = advanceLevelUnlockProgress(model.unlockProgress, 1, 2);
  return true;
}

export function sanitizeLevelUnlockProgress(value: unknown): LevelUnlockProgress {
  if (typeof value !== 'object' || value === null) return createDefaultLevelUnlockProgress();
  const stage = (value as { unlockedStage?: unknown }).unlockedStage;
  const level = (value as { unlockedLevel?: unknown }).unlockedLevel;
  if (stage === 2) return { unlockedStage: 2, unlockedLevel: 1 };
  return { unlockedStage: 1, unlockedLevel: level === 3 ? 3 : level === 2 ? 2 : 1 };
}

export function advanceLevelUnlockProgress(
  progress: LevelUnlockProgress,
  unlockedStage: LevelUnlockProgress['unlockedStage'],
  unlockedLevel: LevelUnlockProgress['unlockedLevel'],
): LevelUnlockProgress {
  const current = sanitizeLevelUnlockProgress(progress);
  if (current.unlockedStage > unlockedStage) return current;
  if (current.unlockedStage === unlockedStage && current.unlockedLevel >= unlockedLevel) return current;
  return sanitizeLevelUnlockProgress({ unlockedStage, unlockedLevel });
}
