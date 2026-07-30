import type {
  LevelBounds,
  LevelCompletionAttempt,
} from '../systems/LevelLifecycleSystem';

type BoundsSource = Readonly<{
  getBounds: () => LevelBounds;
}>;

export type LevelExitPlayerView = Readonly<{
  view: BoundsSource;
  upPressed: boolean;
  eligible: boolean;
}>;

export function createLevelCompletionAttempt(
  exitAvailable: boolean,
  exitView: BoundsSource,
  players: readonly LevelExitPlayerView[],
): LevelCompletionAttempt {
  return {
    exitAvailable,
    exitBounds: readBounds(exitView),
    players: players.map((player) => ({
      bounds: readBounds(player.view),
      upPressed: player.upPressed,
      eligible: player.eligible,
    })),
  };
}

function readBounds(source: BoundsSource): LevelBounds {
  const bounds = source.getBounds();
  return {
    left: bounds.left,
    right: bounds.right,
    top: bounds.top,
    bottom: bounds.bottom,
  };
}
