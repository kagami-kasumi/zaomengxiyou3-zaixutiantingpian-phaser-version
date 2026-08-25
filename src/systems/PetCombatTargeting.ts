import type { PetSkillTarget } from './PetTypes';

export type PetCombatPoint = Readonly<{
  x: number;
  y: number;
}>;

export class PetCombatTargeting {
  livingTargets(targets: readonly PetSkillTarget[]): readonly Readonly<PetSkillTarget>[] {
    return targets
      .filter((target) => target.isAlive)
      .map((target) => Object.freeze({ ...target }));
  }

  orderedFirstTarget(
    origin: PetCombatPoint,
    orderedTargets: readonly PetSkillTarget[],
    searchRange: number,
  ): Readonly<PetSkillTarget> | undefined {
    if (!Number.isFinite(searchRange) || searchRange < 0) {
      throw new Error(`Pet combat search range must be finite and non-negative: ${searchRange}`);
    }
    return this.livingTargets(orderedTargets)
      .find((target) => this.distance(origin, target) <= searchRange);
  }

  distance(from: PetCombatPoint, to: PetCombatPoint): number {
    return Math.hypot(to.x - from.x, to.y - from.y);
  }

  facing(
    from: PetCombatPoint,
    to: PetCombatPoint,
    fallback: -1 | 1,
  ): -1 | 1 {
    if (to.x < from.x) return -1;
    if (to.x > from.x) return 1;
    return fallback;
  }
}
