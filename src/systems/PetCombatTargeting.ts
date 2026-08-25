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

  nearestTarget(
    origin: PetCombatPoint | undefined,
    targets: readonly PetSkillTarget[],
  ): Readonly<PetSkillTarget> | undefined {
    const living = this.livingTargets(targets);
    if (!origin || living.length < 2) return living[0];

    let nearest = living[0]!;
    let nearestDistance = this.distance(origin, nearest);
    for (let index = 1; index < living.length; index += 1) {
      const candidate = living[index]!;
      const candidateDistance = this.distance(origin, candidate);
      if (candidateDistance < nearestDistance) {
        nearest = candidate;
        nearestDistance = candidateDistance;
      }
    }
    return nearest;
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
