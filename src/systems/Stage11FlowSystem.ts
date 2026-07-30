import {
  DefaultLevelFailureDelayMs,
  LevelLifecycle,
  createDefaultLevelUnlockProgress,
  type LevelUnlockProgress,
} from './LevelLifecycleSystem';

export {
  advanceLevelUnlockProgress,
  createDefaultLevelUnlockProgress,
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './LevelLifecycleSystem';

export type Stage11FlowPhase = import('./LevelLifecycleSystem').LevelLifecyclePhase;

export class Stage11FlowModel extends LevelLifecycle {
  public constructor(playerCount: 1 | 2, unlockProgress: LevelUnlockProgress) {
    super({
      playerCount,
      unlockProgress,
      unlockTarget: { unlockedStage: 1, unlockedLevel: 2 },
    });
  }
}

export const Stage11FailureDelayMs = DefaultLevelFailureDelayMs;

export function createStage11Flow(
  playerCount: 1 | 2,
  unlockProgress = createDefaultLevelUnlockProgress(),
): Stage11FlowModel {
  return new Stage11FlowModel(playerCount, unlockProgress);
}
