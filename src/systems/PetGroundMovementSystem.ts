export type PetGroundCollision = Readonly<{
  width: number;
  height: number;
  registration: Readonly<{ x: number; y: number }>;
}>;

export type PetGroundWall = Readonly<{
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  through?: boolean;
  throughDown?: boolean;
  throughUp?: boolean;
  /** Source instance is a Wall, whose tolerance includes its (zero here) wall speed and actor speed. */
  usesWallTolerance: boolean;
}>;

export type PetGroundMotion = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  direction: -1 | 0 | 1;
  standingOn?: string;
};

/** BaseObject's non-flying, static axis-aligned wall path, one original host tick.
 * Slopes and moving walls require their own source geometry; never approximate them here.
 */
export function stepPetGroundMotion(
  motion: PetGroundMotion,
  input: Readonly<{
    speed: number;
    gravity: number;
    collision: PetGroundCollision;
    walls: readonly PetGroundWall[];
    attacking: boolean;
    hurt: boolean;
    mayMoveDuringGroundAttack: boolean;
  }>,
): Readonly<{ landed: boolean; hitHead: boolean; hitSide: boolean }> {
  const { collision } = input;
  const wasStanding = motion.standingOn !== undefined;
  if (!input.hurt) motion.velocityX = motion.direction * input.speed;
  if (wasStanding && input.attacking && !input.mayMoveDuringGroundAttack) motion.velocityX = 0;
  motion.standingOn = undefined;
  let landed = false;
  let hitHead = false;
  let hitSide = false;
  for (const wall of input.walls) {
    const current = bounds(motion, collision);
    const next = { left: current.left + motion.velocityX, right: current.right + motion.velocityX,
      top: current.top + motion.velocityY, bottom: current.bottom + motion.velocityY };
    if (!(next.left < wall.right && next.right > wall.left && next.top < wall.bottom && next.bottom > wall.top)) continue;
    // Source uses real registered bounds for intersection, but half-height for
    // getBottom and snapping. Preserve that distinction, including the 0.1 gap.
    const tolerance = 8 + (wall.usesWallTolerance ? Math.abs(motion.velocityY) : 0);
    if (motion.velocityY > 0 && motion.y + collision.height / 2 <= wall.top + tolerance && !wall.throughDown
      && (wall.through || (current.right > wall.left && current.left < wall.right))) {
      motion.y = wall.top - 0.1 - collision.height / 2;
      motion.velocityY = 0;
      motion.standingOn = wall.id;
      landed = true;
    }
    if (wall.through || wall.throughUp) continue;
    if (motion.velocityY <= 0 && current.top > wall.bottom) {
      motion.y = wall.bottom + 0.1 + collision.height / 2;
      motion.velocityY = 0;
      hitHead = true;
    }
    if (motion.velocityX <= 0 && current.left >= wall.right
      && next.left <= wall.right && next.right >= wall.left && motion.y + collision.height / 2 > wall.top + 5) {
      motion.x = wall.right + 2 + collision.width / 2;
      motion.velocityX = 0;
      hitSide = true;
    }
    if (motion.velocityX >= 0 && current.left <= wall.left
      && next.right >= wall.left && next.left <= wall.right && motion.y + collision.height / 2 > wall.top + 5) {
      motion.x = wall.left - 2 - collision.width / 2;
      motion.velocityX = 0;
      hitSide = true;
    }
  }
  // The recovered BaseObject.isWalkOrRun() returns true; wait alone must not
  // discard an existing direction. setStatic is the operation that clears it.
  motion.x += motion.velocityX;
  motion.y += motion.velocityY;
  motion.velocityY += input.gravity;
  return { landed, hitHead, hitSide };
}

function bounds(motion: PetGroundMotion, collision: PetGroundCollision) {
  return { left: motion.x - collision.registration.x,
    right: motion.x - collision.registration.x + collision.width,
    top: motion.y - collision.registration.y,
    bottom: motion.y - collision.registration.y + collision.height };
}
