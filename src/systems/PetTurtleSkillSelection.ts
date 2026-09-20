import type { PetBehaviorContext } from './PetBehavior';

/** BasePet.myIntelligence order, including branches delivered by A3/B. */
export function selectPetTurtleSkill(context: PetBehaviorContext) {
  if (!context.target || context.targetAcquiredThisFrame) return undefined;
  const pet = context.pet;
  const distance = Math.hypot(context.runtime.x - context.target.x, context.runtime.y - context.target.y);
  const candidates = [
    { skill: 'sld', state: pet.skillState?.turtle1Sld, form: 1, mp: 20, gate: distance >= 50 && distance <= 200 },
    { skill: 'txlj', state: pet.skillState?.turtle2Txlj, form: 2, mp: 20, gate: true },
    { skill: 'sybh', state: pet.skillState?.turtle3Sybh, form: 3, mp: 20, gate: true },
    { skill: 'xwaoyi', state: pet.skillState?.turtle4Xwaoyi, form: 4, mp: 30, gate: true },
  ] as const;
  return candidates.find(candidate => pet.form >= candidate.form && candidate.gate
    && pet.skills.includes(candidate.skill) && pet.mp >= candidate.mp
    && (candidate.state?.cooldownMs ?? Infinity) <= 1e-7)?.skill;
}
