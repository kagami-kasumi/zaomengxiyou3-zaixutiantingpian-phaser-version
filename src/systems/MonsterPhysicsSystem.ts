import type { MovementPlatform } from './HeroMovementSystem';

export type MonsterMotionMode = 'grounded' | 'flying';

export type MonsterPhysicsModel = {
  motionMode: MonsterMotionMode;
  y: number;
  height: number;
  velocityY: number;
  grounded: boolean;
  currentPlatformId?: string;
};

export const MonsterPhysicsTuning = {
  gravity: 2_400,
  terminalVelocity: 1_200,
} as const;

export function createMonsterPhysics(params: {
  y: number;
  height: number;
  motionMode?: MonsterMotionMode;
}): MonsterPhysicsModel {
  const motionMode = params.motionMode ?? 'grounded';
  return {
    motionMode,
    y: params.y,
    height: params.height,
    velocityY: 0,
    grounded: motionMode === 'flying',
  };
}

export function updateMonsterPhysics(
  model: MonsterPhysicsModel,
  x: number,
  platforms: readonly MovementPlatform[],
  deltaMs: number,
): void {
  if (model.motionMode === 'flying') return;

  const deltaSeconds = Math.max(0, deltaMs) / 1_000;
  const previousBottom = model.y + model.height / 2;
  model.velocityY = Math.min(
    MonsterPhysicsTuning.terminalVelocity,
    model.velocityY + MonsterPhysicsTuning.gravity * deltaSeconds,
  );
  const nextY = model.y + model.velocityY * deltaSeconds;
  const nextBottom = nextY + model.height / 2;
  const landing = findLandingPlatform(x, previousBottom, nextBottom, platforms);

  if (landing) {
    model.y = landing.top - model.height / 2;
    model.velocityY = 0;
    model.grounded = true;
    model.currentPlatformId = landing.id;
    return;
  }

  model.y = nextY;
  model.grounded = false;
  model.currentPlatformId = undefined;
}

function findLandingPlatform(
  x: number,
  previousBottom: number,
  nextBottom: number,
  platforms: readonly MovementPlatform[],
): MovementPlatform | undefined {
  return platforms
    .filter((platform) =>
      x >= platform.left &&
      x <= platform.right &&
      platform.top >= previousBottom - 0.5 &&
      platform.top <= nextBottom + 0.5,
    )
    .sort((left, right) => left.top - right.top)[0];
}
