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
}>;

export class PetGroundSessionMovement {
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
    this.velocity.direction = this.runtime.x > x ? -1 : 1;
    this.runtime.facingX = this.velocity.direction;
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

  step(environment: PetGroundEnvironment, speed: number, action: string | undefined): boolean {
    const motion = { ...this.runtime, ...this.velocity };
    const result = stepPetGroundMotion(motion, {
      speed, gravity: this.definition.gravity, collision: this.definition.collision,
      walls: environment.walls, attacking: this.isAttacking(action), hurt: action === 'hurt',
      mayMoveDuringGroundAttack: action === undefined || !this.definition.immobileGroundActions.includes(action),
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
