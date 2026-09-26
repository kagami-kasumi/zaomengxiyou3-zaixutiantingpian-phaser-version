import truth from '../assets/pet-horse-aoyi.json';
import { toDragonSourceCoordinate } from './PetDragonCollisionSystem';

export type HorseAoyiMotion = {
  speedX: number; speedY: number; distance: number; targetId?: string;
};

export function createHorseAoyiMotion(targetId?: string): HorseAoyiMotion {
  return { speedX: truth.speed[0]!, speedY: truth.speed[1]!, distance: truth.distance, targetId };
}

/** EnemyMoveBullet runs this after BaseBullet.step, even if that call destroyed the image. */
export function advanceHorseAoyiMotion(
  projectile: { x: number; y: number; isExpired: boolean }, motion: HorseAoyiMotion,
  target: Readonly<{ x: number; y: number; alive: boolean }> | undefined,
): void {
  if (motion.targetId) {
    if (!target?.alive) motion.targetId = undefined;
    else if (!projectile.isExpired) {
      motion.speedX = projectile.x > target.x ? -truth.horizontalTrackingSpeed : truth.horizontalTrackingSpeed;
      motion.speedY = projectile.y > target.y + truth.targetYOffset ? -truth.trackingSpeed : truth.trackingSpeed;
    }
  }
  motion.speedY = Math.min(motion.speedY, truth.maxDownwardSpeed);
  projectile.x = toDragonSourceCoordinate(projectile.x + motion.speedX);
  projectile.y = toDragonSourceCoordinate(projectile.y + motion.speedY);
  motion.speedX += truth.acceleration[0]!;
  motion.speedY += truth.acceleration[1]!;
  // AS3 distance is int; subtraction coerces the result after post-move acceleration.
  motion.distance = (motion.distance - Math.hypot(motion.speedX, motion.speedY)) | 0;
  if (motion.distance <= 0) projectile.isExpired = true;
}
