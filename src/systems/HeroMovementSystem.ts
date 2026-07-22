import type { AxisDirection, PlayerInputState } from './InputSystem';

export type HeroMovementState = 'wait' | 'walk' | 'run' | 'jump1' | 'jump2' | 'jump3';
export type MovementPlatformKind = 'solid' | 'through';

export type MovementPlatform = {
  id: string;
  kind: MovementPlatformKind;
  left: number;
  right: number;
  top: number;
};

export type HeroMovementBounds = {
  left: number;
  right: number;
  bottom?: number;
};

export type HeroMovementModel = {
  x: number;
  y: number;
  width: number;
  velocityX: number;
  velocityY: number;
  facingX: -1 | 1;
  grounded: boolean;
  jumpCount: 0 | 1 | 2;
  state: HeroMovementState;
  currentPlatformId?: string;
  lastDirectionTap?: AxisDirection;
  lastDirectionTapAtMs?: number;
  runningDirection: AxisDirection;
  ignoredPlatformId?: string;
  dropThroughUntilMs: number;
  skillMovementLockedUntilMs: number;
  skillGravitySuspendedUntilMs: number;
};

export const HeroMovementTuning = {
  walkSpeed: 360,
  runSpeed: 600,
  jumpVelocity: -1300,
  gravity: 5400,
  doubleTapWindowMs: 500,
  dropThroughDurationMs: 180,
  dropThroughOffsetY: 20,
} as const;

export function createHeroMovement(
  x: number,
  y: number,
  width = 48,
): HeroMovementModel {
  return {
    x,
    y,
    width,
    velocityX: 0,
    velocityY: 0,
    facingX: 1,
    grounded: true,
    jumpCount: 0,
    state: 'wait',
    runningDirection: 0,
    dropThroughUntilMs: 0,
    skillMovementLockedUntilMs: 0,
    skillGravitySuspendedUntilMs: 0,
  };
}

export function updateHeroMovement(
  hero: HeroMovementModel,
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
  platforms: readonly MovementPlatform[],
  bounds: HeroMovementBounds,
  timeMs: number,
  deltaMs: number,
): void {
  if (timeMs < hero.skillMovementLockedUntilMs) {
    hero.velocityX = 0;
    if (timeMs < hero.skillGravitySuspendedUntilMs) hero.velocityY = 0;
    hero.state = 'wait';
    return;
  }
  updateRunIntent(hero, input, previousInput, timeMs);
  applyJumpIntent(hero, input, previousInput, platforms, timeMs);

  const deltaSeconds = deltaMs / 1000;
  const previousBottomY = hero.y;
  const movementSpeed = hero.runningDirection !== 0 ? HeroMovementTuning.runSpeed : HeroMovementTuning.walkSpeed;

  hero.velocityX = input.moveX * movementSpeed;
  hero.x += hero.velocityX * deltaSeconds;
  keepHeroInsideBounds(hero, bounds);

  if (!hero.grounded) {
    hero.velocityY += HeroMovementTuning.gravity * deltaSeconds;
    hero.y += hero.velocityY * deltaSeconds;
  }

  landOnPlatformIfNeeded(hero, platforms, previousBottomY, timeMs);
  updateMovementState(hero, input);
}

export function lockHeroMovementForSkill(
  hero: HeroMovementModel,
  timeMs: number,
  durationMs: number,
  suspendGravity: boolean,
): void {
  hero.velocityX = 0;
  hero.skillMovementLockedUntilMs = Math.max(hero.skillMovementLockedUntilMs, timeMs + durationMs);
  if (suspendGravity) {
    hero.velocityY = 0;
    hero.skillGravitySuspendedUntilMs = Math.max(
      hero.skillGravitySuspendedUntilMs,
      timeMs + durationMs,
    );
  }
}

function keepHeroInsideBounds(hero: HeroMovementModel, bounds: HeroMovementBounds): void {
  const minX = bounds.left + hero.width / 2;
  const maxX = bounds.right - hero.width / 2;
  const clampedX = Math.min(Math.max(hero.x, minX), maxX);

  if (clampedX !== hero.x) {
    hero.x = clampedX;
    hero.velocityX = 0;
  }

  if (bounds.bottom !== undefined && hero.y > bounds.bottom) {
    hero.y = bounds.bottom;
    hero.velocityY = 0;
    hero.grounded = true;
    hero.jumpCount = 0;
    hero.state = 'wait';
  }
}

function updateRunIntent(
  hero: HeroMovementModel,
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
  timeMs: number,
): void {
  const previousMoveX = previousInput?.moveX ?? 0;
  const justPressedDirection = input.moveX !== 0 && previousMoveX !== input.moveX;

  if (justPressedDirection) {
    const repeatedSameDirection = hero.lastDirectionTap === input.moveX;
    const insideWindow = hero.lastDirectionTapAtMs !== undefined &&
      timeMs - hero.lastDirectionTapAtMs < HeroMovementTuning.doubleTapWindowMs;

    hero.runningDirection = repeatedSameDirection && insideWindow ? input.moveX : 0;
    hero.lastDirectionTap = input.moveX;
    hero.lastDirectionTapAtMs = timeMs;
  }

  if (input.moveX === 0 || input.moveX !== hero.runningDirection) {
    hero.runningDirection = 0;
  }

  if (input.moveX !== 0) {
    hero.facingX = input.moveX;
  }
}

function applyJumpIntent(
  hero: HeroMovementModel,
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
  platforms: readonly MovementPlatform[],
  timeMs: number,
): void {
  const justPressedJump = input.jump && !(previousInput?.jump ?? false);

  if (!justPressedJump) {
    return;
  }

  const currentPlatform = hero.currentPlatformId
    ? platforms.find((platform) => platform.id === hero.currentPlatformId)
    : undefined;

  if (input.down && hero.grounded && currentPlatform?.kind === 'through') {
    hero.ignoredPlatformId = currentPlatform.id;
    hero.dropThroughUntilMs = timeMs + HeroMovementTuning.dropThroughDurationMs;
    hero.currentPlatformId = undefined;
    hero.grounded = false;
    hero.jumpCount = 1;
    hero.state = 'jump1';
    hero.y += HeroMovementTuning.dropThroughOffsetY;
    hero.velocityY = 0;
    return;
  }

  if (hero.jumpCount >= 2) {
    return;
  }

  hero.grounded = false;
  hero.currentPlatformId = undefined;
  hero.jumpCount = hero.jumpCount === 0 ? 1 : 2;
  hero.velocityY = HeroMovementTuning.jumpVelocity;
  hero.state = hero.jumpCount === 1 ? 'jump1' : 'jump2';
}

function landOnPlatformIfNeeded(
  hero: HeroMovementModel,
  platforms: readonly MovementPlatform[],
  previousBottomY: number,
  timeMs: number,
): void {
  if (hero.velocityY < 0) {
    return;
  }

  for (const platform of platforms) {
    if (
      platform.id === hero.ignoredPlatformId &&
      timeMs < hero.dropThroughUntilMs
    ) {
      continue;
    }

    const overlapsHorizontally =
      hero.x + hero.width / 2 > platform.left &&
      hero.x - hero.width / 2 < platform.right;
    const crossedPlatformTop = previousBottomY <= platform.top && hero.y >= platform.top;

    if (!overlapsHorizontally || !crossedPlatformTop) {
      continue;
    }

    hero.y = platform.top;
    hero.velocityY = 0;
    hero.grounded = true;
    hero.jumpCount = 0;
    hero.currentPlatformId = platform.id;

    if (hero.ignoredPlatformId === platform.id) {
      hero.ignoredPlatformId = undefined;
      hero.dropThroughUntilMs = 0;
    }
    return;
  }

  hero.grounded = false;
  hero.currentPlatformId = undefined;
}

function updateMovementState(hero: HeroMovementModel, input: PlayerInputState): void {
  if (!hero.grounded) {
    if (hero.jumpCount === 2) {
      hero.state = 'jump2';
      return;
    }

    hero.state = hero.velocityY < 0 ? 'jump1' : 'jump3';
    return;
  }

  if (input.moveX === 0) {
    hero.state = 'wait';
    return;
  }

  hero.state = hero.runningDirection !== 0 ? 'run' : 'walk';
}
