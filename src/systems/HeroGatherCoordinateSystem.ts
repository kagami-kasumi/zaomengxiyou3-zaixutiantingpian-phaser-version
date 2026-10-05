import { toDragonSourceCoordinate as twip } from './PetDragonCollisionSystem';
import type { HeroPartyRuntimeModel } from './HeroPartyRuntimeSystem';
import { heroMovementRoot } from './HeroSourceMovementSystem';

type Coordinate = { x: number; y: number };
type Tween = {
  target: Coordinate;
  endX: number;
  endY: number;
  startTime: number;
  start?: Coordinate;
};

/** Monster2.doHi2 / original TweenMax, bounded to x/y and one-second easeOut.
 * References are the actual movement owner, including after an actor detaches.
 * World exit is the sole cancellation boundary; death is not cancellation.
 * Absolute seconds preserve the source root-time subtraction order.
 */
export class HeroGatherCoordinateSystem {
  private readonly active = new Map<Coordinate, Tween>();
  private readonly pending = new Map<Coordinate, Tween>();
  private time = 0;
  private pausedAt?: number;
  private disposed = false;

  request(target: Coordinate, endX: number, endY: number): void {
    if (this.disposed) return;
    this.pending.set(target, { target, endX, endY, startTime: this.time });
  }

  advance(timeSeconds: number): void {
    if (this.disposed) return;
    this.time = timeSeconds;
    if (this.pausedAt !== undefined) return;
    // AUTO overwrite initializes the newest x/y tween before the older one can
    // write in this render. Capture the live position, never the request pose.
    for (const [target, tween] of this.pending) {
      if (timeSeconds <= tween.startTime) continue;
      tween.start = { x: target.x, y: target.y };
      this.active.set(target, tween);
      this.pending.delete(target);
    }
    for (const [target, tween] of this.active) {
      const elapsed = Math.min(1, Math.max(0, timeSeconds - tween.startTime));
      const ratio = 1 - (1 - elapsed) * (1 - elapsed);
      const start = tween.start!;
      target.x = twip(start.x + (tween.endX - start.x) * ratio);
      target.y = twip(start.y + (tween.endY - start.y) * ratio);
      if (elapsed === 1) this.active.delete(target);
    }
  }

  pause(): void {
    if (!this.disposed && this.pausedAt === undefined) this.pausedAt = this.time;
  }

  resume(): void {
    if (this.disposed || this.pausedAt === undefined) return;
    const duration = this.time - this.pausedAt;
    for (const tween of [...this.active.values(), ...this.pending.values()]) tween.startTime += duration;
    this.pausedAt = undefined;
  }

  destroy(): void {
    this.disposed = true;
    this.active.clear();
    this.pending.clear();
  }

  snapshot() {
    return { time: this.time, paused: this.pausedAt !== undefined, disposed: this.disposed,
      active: this.active.size, pending: this.pending.size };
  }
}

/** Formal party port. Stable root projections refer to the existing movement
 * objects. Only a new request filters dead heroes; an existing tween survives.
 */
export function createHeroPartyGatherControl(party: HeroPartyRuntimeModel) {
  const controller = new HeroGatherCoordinateSystem();
  const targets = party.members.map(member => ({ member, root: heroMovementRoot(member.movement) }));
  return {
    advance: (timeSeconds: number) => controller.advance(timeSeconds),
    request: (rootTarget: Coordinate, slots?: readonly ('p1' | 'p2')[]) => {
      if (party.destroyed) return;
      for (const { member, root } of targets) {
        if (member.combat.combat.state === 'dead' || (slots && !slots.includes(member.combat.slot))) continue;
        controller.request(root, rootTarget.x, rootTarget.y);
      }
    },
    pause: () => controller.pause(),
    resume: () => controller.resume(),
    destroy: () => controller.destroy(),
    snapshot: () => controller.snapshot(),
  };
}
