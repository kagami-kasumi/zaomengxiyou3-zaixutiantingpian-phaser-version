import type { LevelCompletionAttempt } from '../src/systems/LevelLifecycleSystem';

export function createTestLevelCompletionAttempt(options: Readonly<{
  exitAvailable?: boolean;
  inside?: boolean;
  upPressed?: boolean;
  eligible?: boolean;
}> = {}): LevelCompletionAttempt {
  const inside = options.inside ?? true;
  return {
    exitAvailable: options.exitAvailable ?? true,
    exitBounds: { left: 100, right: 200, top: 100, bottom: 240 },
    players: [{
      bounds: inside
        ? { left: 130, right: 170, top: 160, bottom: 260 }
        : { left: 0, right: 40, top: 160, bottom: 260 },
      upPressed: options.upPressed ?? true,
      eligible: options.eligible ?? true,
    }],
  };
}
