export type LevelUnlockProgress = {
  unlockedStage: 1 | 2;
  unlockedLevel: 1 | 2 | 3;
};

export type LevelLifecyclePhase = 'playing' | 'failure-pending' | 'failed' | 'cleared';

export type LevelBounds = Readonly<{
  left: number;
  right: number;
  top: number;
  bottom: number;
}>;

export type LevelPlayerExitIntent = Readonly<{
  bounds: LevelBounds;
  upPressed: boolean;
  eligible: boolean;
}>;

export type LevelCompletionAttempt = Readonly<{
  exitAvailable: boolean;
  exitBounds: LevelBounds;
  players: readonly LevelPlayerExitIntent[];
}>;

export type LevelCompletionStrategy = (attempt: LevelCompletionAttempt) => boolean;

export type LevelLifecycleConfig = Readonly<{
  playerCount: 1 | 2;
  unlockProgress: LevelUnlockProgress;
  unlockTarget: LevelUnlockProgress;
  failureDelayMs?: number;
  completionStrategy?: LevelCompletionStrategy;
}>;

export const DefaultLevelFailureDelayMs = 2_500;

export class LevelLifecycle {
  public phase: LevelLifecyclePhase = 'playing';
  public failureDelayRemainingMs = 0;
  public unlockProgress: LevelUnlockProgress;
  public readonly playerCount: 1 | 2;

  private readonly unlockTarget: LevelUnlockProgress;
  private readonly failureDelayMs: number;
  private readonly completionStrategy: LevelCompletionStrategy;

  public constructor(config: LevelLifecycleConfig) {
    this.playerCount = config.playerCount;
    this.unlockProgress = sanitizeLevelUnlockProgress(config.unlockProgress);
    this.unlockTarget = sanitizeLevelUnlockProgress(config.unlockTarget);
    this.failureDelayMs = Math.max(0, config.failureDelayMs ?? DefaultLevelFailureDelayMs);
    this.completionStrategy = config.completionStrategy ?? isDefaultLevelCompletionAttemptSatisfied;
  }

  public updatePartyFailure(alivePlayerCount: number, deltaMs: number): LevelLifecyclePhase {
    if (this.phase === 'failed' || this.phase === 'cleared') return this.phase;

    if (alivePlayerCount > 0) {
      if (this.phase === 'failure-pending') {
        this.phase = 'playing';
        this.failureDelayRemainingMs = 0;
      }
      return this.phase;
    }

    if (this.phase === 'playing') {
      this.phase = 'failure-pending';
      this.failureDelayRemainingMs = this.failureDelayMs;
      return this.phase;
    }

    this.failureDelayRemainingMs = Math.max(
      0,
      this.failureDelayRemainingMs - Math.max(0, deltaMs),
    );
    if (this.failureDelayRemainingMs === 0) this.phase = 'failed';
    return this.phase;
  }

  public tryComplete(attempt: LevelCompletionAttempt): boolean {
    if (this.phase !== 'playing' || !this.completionStrategy(attempt)) return false;
    this.phase = 'cleared';
    this.failureDelayRemainingMs = 0;
    this.unlockProgress = advanceLevelUnlockProgress(
      this.unlockProgress,
      this.unlockTarget.unlockedStage,
      this.unlockTarget.unlockedLevel,
    );
    return true;
  }
}

export function isDefaultLevelCompletionAttemptSatisfied(
  attempt: LevelCompletionAttempt,
): boolean {
  return attempt.exitAvailable && attempt.players.some((player) => (
    player.eligible
    && player.upPressed
    && doLevelBoundsOverlap(player.bounds, attempt.exitBounds)
  ));
}

export function doLevelBoundsOverlap(a: LevelBounds, b: LevelBounds): boolean {
  return a.right >= b.left
    && a.left <= b.right
    && a.bottom >= b.top
    && a.top <= b.bottom;
}

export function createDefaultLevelUnlockProgress(): LevelUnlockProgress {
  return { unlockedStage: 1, unlockedLevel: 1 };
}

export function sanitizeLevelUnlockProgress(value: unknown): LevelUnlockProgress {
  if (typeof value !== 'object' || value === null) return createDefaultLevelUnlockProgress();
  const stage = (value as { unlockedStage?: unknown }).unlockedStage;
  const level = (value as { unlockedLevel?: unknown }).unlockedLevel;
  if (stage === 2) {
    return { unlockedStage: 2, unlockedLevel: level === 3 ? 3 : level === 2 ? 2 : 1 };
  }
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
