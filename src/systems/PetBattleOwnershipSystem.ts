import type { PlayerSlot } from './InputSystem';
import type { Monster30Model } from './Monster30System';
import { awardMonsterExperienceWithCurrentPet } from './PetConsumableSystem';
import type { PlayerPetRosters } from './PetOwnershipSystem';
import { addPetExperience } from './PetProgressionSystem';
import { getActivePet } from './PetRosterSystem';
import { markActivePetSkillTriggered } from './PetSkillTickSystem';
import { applyPetTurtleTxljOwnerDamage } from './PetTurtleSkillSystem';
import type { MonsterExperienceShareResult } from './PetTypes';

export type PetExperienceTarget =
  | { kind: 'hero'; ownerSlot: PlayerSlot }
  | { kind: 'pet'; ownerSlot: PlayerSlot; petId: string };

export type OwnedMonsterExperienceAward = {
  ownerSlot: PlayerSlot;
  experience: number;
};

export function applyOwnedPetDamageRedirect(
  rosters: PlayerPetRosters,
  ownerSlot: PlayerSlot,
  incomingDamage: number,
): number {
  return applyPetTurtleTxljOwnerDamage(
    rosters[ownerSlot],
    incomingDamage,
  ).ownerDamage;
}

export function markOwnedPetSkillTriggered(
  rosters: PlayerPetRosters,
  ownerSlot: PlayerSlot,
): boolean {
  return markActivePetSkillTriggered(rosters[ownerSlot]);
}

export function claimMonsterExperienceForCurrentTarget(
  monster: Monster30Model,
  fallbackOwner?: PlayerSlot,
): OwnedMonsterExperienceAward | undefined {
  if (monster.experienceAwardedTo || monster.experience <= 0) return undefined;
  const ownerSlot = monster.targetSlot ?? fallbackOwner;
  if (!ownerSlot) return undefined;
  monster.experienceAwardedTo = ownerSlot;
  return { ownerSlot, experience: monster.experience };
}

export function awardMonsterExperienceByTarget(
  rosters: PlayerPetRosters,
  target: PetExperienceTarget,
  monsterExperience: number,
): MonsterExperienceShareResult {
  const roster = rosters[target.ownerSlot];
  const normalizedExperience = Math.max(0, Math.floor(monsterExperience));
  if (target.kind === 'hero') {
    return awardMonsterExperienceWithCurrentPet(roster, normalizedExperience);
  }

  const pet = roster.pets.find((candidate) => candidate.id === target.petId)
    ?? getActivePet(roster);
  if (!pet) {
    return { heroExperience: 0, petExperience: 0 };
  }
  const petResult = addPetExperience(pet, normalizedExperience);
  roster.message = `${pet.displayName} 获得 ${normalizedExperience} 经验`;
  return {
    heroExperience: 0,
    petExperience: normalizedExperience,
    petResult,
  };
}
