import profiles from '../assets/monster-knockback-profiles.json';
import { toDragonSourceCoordinate as twip } from './PetDragonCollisionSystem';
import { stepPetGroundMotion, type PetGroundMotion, type PetGroundWall } from './PetGroundMovementSystem';

export type MonsterKnockbackProfile = (typeof profiles.profiles)[number];
export type MonsterKnockbackMotion = PetGroundMotion & {
  action: string;
  head: boolean;
  wallLeft: boolean;
  wallRight: boolean;
  tween?: { initialX: number; startedAtMs: number };
};

export function getMonsterKnockbackProfile(monsterId: number, stage: number, level: number): MonsterKnockbackProfile {
  const profile = profiles.profiles.find(row => row.monsterId === monsterId && row.stage === stage && row.level === level);
  if (!profile) throw new Error(`Unverified monster movement profile ${monsterId}/${stage}-${level}`);
  return profile;
}

export function createMonsterKnockbackMotion(profile: MonsterKnockbackProfile, x: number, y: number): MonsterKnockbackMotion {
  return { x: twip(x), y: twip(y), velocityX: profile.profile.initialVx, velocityY: profile.profile.initialVy,
    direction: 0, action: 'wait', head: false, wallLeft: false, wallRight: false };
}

/** Successful source entry, including zero damage/vector. Boundary early return preserves an old tween. */
export function applyMonsterKnockback(motion: MonsterKnockbackMotion, x: number, y: number,
  timeMs: number, screenX: number): void {
  motion.direction = x < 0 ? -1 : 1;
  motion.velocityY = y;
  if ((x < 0 && screenX < 20) || (x >= 0 && screenX > 920)) {
    motion.velocityX = 0;
    return;
  }
  motion.velocityX = x * 2;
  motion.tween = { initialX: motion.velocityX, startedAtMs: timeMs };
}

/** One source host step. Point speeds stay pixels/step; tween time stays milliseconds. */
export function stepMonsterKnockback(motion: MonsterKnockbackMotion, profile: MonsterKnockbackProfile,
  input: Readonly<{ timeMs: number; walls: readonly PetGroundWall[]; worldX: number; worldY: number; frozen?: boolean }>): void {
  if (motion.tween) {
    const t = Math.max(0, Math.min(1, (input.timeMs - motion.tween.startedAtMs) / 400));
    // Preserve TweenLite's start + ratio * change evaluation order: algebraic
    // rearrangement can cross a Sprite twip boundary, especially at negative x.
    const easedTime = t - 1;
    const ratio = easedTime * easedTime * easedTime + 1;
    motion.velocityX = motion.tween.initialX + ratio * (motion.tween.initialX * 0.2 - motion.tween.initialX);
    if (t === 1) motion.tween = undefined;
  }
  const flags = movementFlags(profile, motion.action);
  if (!flags.beAttacking) {
    if (motion.direction) motion.velocityX = profile.profile.horizontalSpeed * motion.direction;
    if (flags.cannotMove) motion.velocityX = motion.velocityY = 0;
  }
  const body = profile.profile.collider;
  if (!profile.profile.flying) {
    const contact = stepPetGroundMotion(motion, {
      speed: profile.profile.horizontalSpeed, gravity: profile.profile.gravity,
      collision: { width: body.width, height: body.height, registration: { x: -body.x, y: -body.y } },
      walls: input.walls, attacking: flags.attacking, hurt: flags.beAttacking,
      mayMoveDuringGroundAttack: true, walkOrRun: flags.walkOrRun, suppressMove: input.frozen,
    });
    motion.head = contact.hitHead; motion.wallLeft = contact.hitLeft; motion.wallRight = contact.hitRight;
    if (contact.landed && !flags.attacking && !flags.beAttacking) motion.action = motion.direction ? 'walk' : 'wait';
  } else {
    const nextLeft = motion.x + input.worldX + body.x + motion.velocityX;
    const nextRight = nextLeft + body.width;
    const mayMove = (nextLeft > 20 && nextRight < 920)
      || (motion.velocityX < 0 && nextRight > 920) || (motion.velocityX > 0 && nextLeft < 20);
    if (mayMove && !input.frozen) {
      motion.x = twip(motion.x + motion.velocityX);
      motion.y = twip(motion.y + motion.velocityY);
      motion.velocityY += profile.profile.gravity;
    }
  }
  // BaseMonster.checkOver runs before its flying suffix, even when move was frozen.
  if (motion.y >= 3000) motion.y = 300;
  if (profile.profile.flying) {
    if (flags.beAttacking) motion.velocityY *= 0.8;
    if (Math.abs(motion.velocityY) > 4) motion.velocityY *= 0.7;
    if (motion.y >= 800) motion.y = 200;
    const screenY = motion.y + input.worldY;
    if (screenY > 300) motion.y = twip(300 - input.worldY);
    else if (screenY < 0) motion.y = twip(-input.worldY);
  }
}

function movementFlags(profile: MonsterKnockbackProfile, action: string) {
  const known = profile.predicates[action as keyof typeof profile.predicates];
  if (known) return known;
  // Original BaseObject.isBeAttacking and BaseMonster.isWalkOrRun method contracts.
  return { attacking: false, cannotMove: false,
    beAttacking: ['hurt_1', 'hurt_2', 'hurt_3', 'afterHurt'].includes(action),
    walkOrRun: action === 'walk' || action === 'run' };
}
