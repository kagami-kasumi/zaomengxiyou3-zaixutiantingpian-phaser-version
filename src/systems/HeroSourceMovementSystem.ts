import profiles from '../assets/hero-motion-profiles.json';
import type { HeroMovementModel } from './HeroMovementSystem';
import { stepPetGroundMotion, type PetGroundMotion, type PetGroundWall } from './PetGroundMovementSystem';
import { toDragonSourceCoordinate as twip } from './PetDragonCollisionSystem';

export type HeroSourceMovementInput = Readonly<{
  hostFps: number;
  profile: Readonly<{ walk: number; run: number; gravity: number; jump: number }>;
  walls: readonly PetGroundWall[];
  screenLeft: number;
  screenRight: number;
}>;

export function heroSourceMovementProfile(heroId: number) {
  const profile = profiles.profiles.find(row => row.heroId === heroId);
  if (!profile) throw new Error(`No verified ordinary hero motion profile: ${heroId}`);
  return profile;
}

/** A live root projection, not a copied position. Tween keeps this reference
 * when the hero dies or detaches; scene exit cancels the coordinate controller.
 */
export function heroMovementRoot(movement: Pick<HeroMovementModel, 'x' | 'y'>) {
  return {
    get x() { return movement.x; },
    set x(value: number) { movement.x = value; },
    get y() { return movement.y - profiles.collision.height / 2; },
    set y(value: number) { movement.y = value + profiles.collision.height / 2; },
  };
}

/** Called by the existing movement owner once per source host step. The public
 * velocity stays px/s for existing skill/knockback consumers; only the adapter
 * exposes px/host-step to the shared original static-wall integrator.
 */
export function stepHeroSourceMovement(hero: HeroMovementModel, direction: -1 | 0 | 1,
  input: HeroSourceMovementInput): void {
  const fps = input.hostFps;
  if (!(fps > 0)) throw new Error('Hero source host fps must be positive');
  const root = heroMovementRoot(hero);
  const speed = hero.runningDirection !== 0 ? input.profile.run : input.profile.walk;
  // Ordinary setStatic owns the no-input horizontal stop, not screen clamping.
  if (direction === 0) hero.velocityX = 0;
  const motion: PetGroundMotion = {
    get x() { return root.x; }, set x(value) { root.x = value; },
    get y() { return root.y; }, set y(value) { root.y = value; },
    get velocityX() { return hero.velocityX / fps; },
    set velocityX(value) { hero.velocityX = value * fps; },
    get velocityY() { return hero.velocityY / fps; },
    set velocityY(value) { hero.velocityY = value * fps; },
    direction, standingOn: hero.currentPlatformId,
  };
  const collision = profiles.collision;
  const contact = stepPetGroundMotion(motion, {
    speed, gravity: input.profile.gravity,
    collision: { width: collision.width, height: collision.height,
      registration: { x: -collision.x, y: -collision.y } },
    walls: input.walls, attacking: false, hurt: false, mayMoveDuringGroundAttack: true,
  });
  root.x = twip(Math.min(input.screenRight, Math.max(input.screenLeft, root.x)));
  hero.currentPlatformId = motion.standingOn;
  hero.grounded = contact.landed;
  if (contact.landed) hero.jumpCount = 0;
}
