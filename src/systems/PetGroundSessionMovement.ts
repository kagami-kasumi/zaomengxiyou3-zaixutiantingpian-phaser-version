import { PetGroundOwnerAnchors } from '../assets/PetGroundEnvironmentAssets';
import { stepPetGroundMotion, type PetGroundCollision, type PetGroundMotion } from './PetGroundMovementSystem';
import type { PetGroundEnvironment } from '../assets/PetGroundEnvironmentAssets';
import type { PetOwnerSnapshot, PetRuntimeModel } from './PetTypes';

/** Shape/action facts only. Session owns scheduling, motion and AI for roots and summons. */
export type PetGroundMovementDefinition = Readonly<{
  collision: PetGroundCollision;
  gravity: number;
  jumpPower: number;
  attackRate: number;
  attackActions: readonly string[];
  immobileGroundActions: readonly string[];
  speedByAction?: Readonly<Record<string, number>>;
  enterVelocityByAction?: Readonly<Record<string, Readonly<{ x: number; y: number }>>>;
}>;

export class PetGroundSessionMovement {
  suppressTurning = false;
  private recoil: { initialX: number; elapsedMs: number } | undefined;
  private velocity = { velocityX: 0, velocityY: 0, direction: 0 as -1 | 0 | 1,
    standingOn: undefined as string | undefined };

  constructor(private readonly runtime: PetRuntimeModel, readonly definition: PetGroundMovementDefinition) {}

  snapshot(): Readonly<PetGroundMotion> { return Object.freeze({ ...this.runtime, ...this.velocity }); }

  setStatic(): void {
    this.velocity.direction = 0;
    this.velocity.velocityX = 0;
    this.runtime.state = 'idle';
  }

  turnTo(x: number): void {
    if (this.suppressTurning) return;
    this.velocity.direction = this.runtime.x > x ? -1 : 1;
    this.runtime.facingX = this.velocity.direction;
  }

  face(direction: -1 | 1): void {
    if (this.suppressTurning) return;
    this.velocity.direction = direction;
    this.runtime.facingX = direction;
  }

  followOwner(owner: PetOwnerSnapshot): boolean {
    if (Math.hypot(this.runtime.x - owner.x, this.runtime.y - owner.y) > 640) {
      this.turnTo(owner.x);
      return false;
    }
    this.setStatic();
    return true;
  }

  isAttacking(action: string | undefined): boolean {
    return action !== undefined && this.definition.attackActions.includes(action);
  }

  applyEnterVelocity(action: string | undefined): void {
    const velocity = this.definition.enterVelocityByAction?.[action ?? ''];
    if (velocity) {
      this.velocity.velocityX = velocity.x;
      this.velocity.velocityY = velocity.y;
    }
  }

  adjustVertical(owner: PetOwnerSnapshot, environment: PetGroundEnvironment): void {
    if (this.runtime.y - owner.y > 300) {
      if (this.velocity.velocityY >= 0) this.velocity.velocityY = this.definition.jumpPower;
    } else if (owner.y - this.runtime.y > 50
      && environment.walls.find((wall) => wall.id === this.velocity.standingOn)?.through) {
      this.runtime.y += 20;
    }
  }

  warp(owner: PetOwnerSnapshot): void {
    if (Math.hypot(this.runtime.x - owner.x, this.runtime.y - owner.y) < 1000) return;
    this.runtime.x = owner.x;
    this.runtime.y = owner.y + PetGroundOwnerAnchors.warpOffsetY;
    this.runtime.state = 'warp';
  }

  applyKnockback(value: Readonly<{ x: number; y: number }>): void {
    this.velocity.velocityX = value.x * 2;
    this.velocity.velocityY = value.y;
    this.velocity.direction = value.x < 0 ? -1 : 1;
    this.recoil = { initialX: value.x * 2, elapsedMs: 0 };
  }

  step(environment: PetGroundEnvironment, speed: number, action: string | undefined, suppressMove = false, deltaMs = 1000 / 24): boolean {
    if (this.recoil) {
      const t = Math.min(1, this.recoil.elapsedMs / 400);
      this.velocity.velocityX = this.recoil.initialX * (0.2 + 0.8 * (1 - t) ** 3);
      this.recoil.elapsedMs += deltaMs;
      if (t === 1) this.recoil = undefined;
    }
    const motion = { ...this.runtime, ...this.velocity };
    const result = stepPetGroundMotion(motion, {
      speed: this.definition.speedByAction?.[action ?? ''] ?? speed,
      gravity: this.definition.gravity, collision: this.definition.collision,
      walls: environment.walls, attacking: this.isAttacking(action), hurt: action === 'hurt',
      mayMoveDuringGroundAttack: action === undefined || !this.definition.immobileGroundActions.includes(action),
      suppressMove,
    });
    this.runtime.x = motion.x;
    this.runtime.y = motion.y;
    this.velocity = { velocityX: motion.velocityX, velocityY: motion.velocityY,
      direction: motion.direction, standingOn: motion.standingOn };
    if (result.landed && !this.isAttacking(action) && action !== 'hurt') {
      this.runtime.state = motion.direction === 0 ? 'idle' : 'follow';
      return true;
    }
    return false;
  }
}
