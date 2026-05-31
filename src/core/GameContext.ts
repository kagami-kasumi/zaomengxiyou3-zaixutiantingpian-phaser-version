import type { PlayerSlot } from '../systems/InputSystem';

export type GameContext<
  TPlayer extends { slot: PlayerSlot },
  TMonster30,
  TBossArena,
  TProjectileSystem,
  TDropSystem,
  TPetRoster,
  TCapturablePetTarget,
> = {
  players(): readonly TPlayer[];
  monster30s(): readonly TMonster30[];
  bossArena(): TBossArena;
  projectileSystem(): TProjectileSystem;
  dropSystem(): TDropSystem;
  petRoster(): TPetRoster;
  capturablePetTargets(): readonly TCapturablePetTarget[];
};

export function createGameContext<
  TPlayer extends { slot: PlayerSlot },
  TMonster30,
  TBossArena,
  TProjectileSystem,
  TDropSystem,
  TPetRoster,
  TCapturablePetTarget,
>(
  context: GameContext<
    TPlayer,
    TMonster30,
    TBossArena,
    TProjectileSystem,
    TDropSystem,
    TPetRoster,
    TCapturablePetTarget
  >,
): GameContext<
  TPlayer,
  TMonster30,
  TBossArena,
  TProjectileSystem,
  TDropSystem,
  TPetRoster,
  TCapturablePetTarget
> {
  return context;
}

export function findPlayerBySlot<TPlayer extends { slot: PlayerSlot }>(
  context: Pick<GameContext<TPlayer, unknown, unknown, unknown, unknown, unknown, unknown>, 'players'>,
  slot: PlayerSlot,
): TPlayer | undefined {
  return context.players().find((player) => player.slot === slot);
}
