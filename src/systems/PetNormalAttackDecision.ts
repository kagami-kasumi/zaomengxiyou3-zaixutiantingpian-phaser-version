import type { PetBehaviorAction, PetBehaviorContext } from './PetBehavior';

/** Per-behavior decision throttle; not an animation clock or skill cooldown owner. */
export class PetNormalAttackDecision {
  private remainingMs = 0;

  select(context: PetBehaviorContext, attackRate: number): PetBehaviorAction | undefined {
    if (!context.target || this.remainingMs > 0) return undefined;
    this.remainingMs = 1_000;
    if (context.random() <= attackRate) return { type: 'basic-attack' };
    context.emit({ type: context.random() < 0.3 ? 'wait' : 'chase' });
    return undefined;
  }

  update(deltaMs: number): void {
    this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
  }

  reset(): void {
    this.remainingMs = 0;
  }
}
