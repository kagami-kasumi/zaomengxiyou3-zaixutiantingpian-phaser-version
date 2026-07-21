import {
  createHeroMovement,
  updateHeroMovement,
  type HeroMovementBounds,
  type HeroMovementModel,
  type MovementPlatform,
} from './HeroMovementSystem';
import type { PlayerInputState } from './InputSystem';

export type LevelHeroMovementMember = {
  movement: HeroMovementModel;
  previousInput?: PlayerInputState;
};

export type LevelHeroMovementRuntime = {
  members: LevelHeroMovementMember[];
};

export type LevelHeroMovementSpawn = Readonly<{
  x: number;
  y: number;
  width: number;
  currentPlatformId?: string;
}>;

export type LevelHeroMovementEnvironment = Readonly<{
  platforms: readonly MovementPlatform[];
  bounds: HeroMovementBounds;
}>;

export function createLevelHeroMovementRuntime(
  spawns: readonly LevelHeroMovementSpawn[],
): LevelHeroMovementRuntime {
  return {
    members: spawns.map((spawn) => {
      const movement = createHeroMovement(spawn.x, spawn.y, spawn.width);
      movement.currentPlatformId = spawn.currentPlatformId;
      return { movement };
    }),
  };
}

export function updateLevelHeroMovementRuntime(
  runtime: LevelHeroMovementRuntime,
  inputs: readonly PlayerInputState[],
  enabled: readonly boolean[],
  environmentFor: (index: number, movement: HeroMovementModel) => LevelHeroMovementEnvironment,
  timeMs: number,
  deltaMs: number,
): void {
  runtime.members.forEach((member, index) => {
    const input = inputs[index];
    if (!input || !enabled[index]) return;
    const environment = environmentFor(index, member.movement);
    updateHeroMovement(
      member.movement,
      input,
      member.previousInput,
      environment.platforms,
      environment.bounds,
      timeMs,
      deltaMs,
    );
    member.previousInput = input;
  });
}
