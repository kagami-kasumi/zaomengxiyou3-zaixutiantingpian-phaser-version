import { PetTuning } from './PetTuning';
import type { PetState, PetSkillRandomSource } from './PetTypes';

export function calculatePetSkillDamage(
  pet: PetState,
  multiplier: number,
  random: PetSkillRandomSource = Math.random,
): number {
  const baseDamage = pet.atk * multiplier + Math.max(0, pet.skillDamageBonus ?? 0);
  return calculatePetSkillDamageFromBase(baseDamage, pet, random);
}

export function calculatePetSkillDamageFromBase(
  baseDamage: number,
  pet: PetState,
  random: PetSkillRandomSource = Math.random,
): number {
  const critRate = Math.max(0, Math.min(1, pet.critBonusRate ?? 0));
  if (critRate <= 0) {
    return baseDamage;
  }

  return random() <= critRate ? baseDamage * PetTuning.petSkillCritDamageMultiplier : baseDamage;
}

