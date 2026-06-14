import { PetTuning } from './PetTuning';
import { addPetExperience, resetPetSkillsByLevel } from './PetProgressionSystem';
import { getCurrentPet } from './PetRosterSystem';
import type {
  MonsterExperienceShareResult,
  PetConsumableFillName,
  PetConsumableResult,
  PetRoster,
  PetSkillRandomSource,
} from './PetTypes';
export function isPetConsumableFillName(fillName: string): fillName is PetConsumableFillName {
  return fillName === 'wphhd' || fillName === 'wpcsd' || fillName === 'djyys' || fillName === 'cwjnxld';
}

export function usePetConsumable(
  roster: PetRoster,
  fillName: PetConsumableFillName,
  random: PetSkillRandomSource = Math.random,
): PetConsumableResult {
  const pet = getCurrentPet(roster);
  if (!pet) {
    const message = '没有出战宠物，不能使用宠物道具';
    roster.message = message;
    return { ok: false, shouldConsume: false, message };
  }

  if (fillName === 'wpcsd') {
    const before = pet.lifetime;
    pet.lifetime = Math.min(100, pet.lifetime + PetTuning.petLifetimeRecover);
    const message = `${pet.displayName} 寿命 ${before}->${pet.lifetime}`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet };
  }

  if (fillName === 'wphhd') {
    pet.hp = pet.maxHp;
    pet.mp = pet.maxMp;
    pet.lifetime = Math.max(1, pet.lifetime);
    const message = `${pet.displayName} 状态已恢复`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet };
  }

  if (fillName === 'djyys') {
    const experience = addPetExperience(pet, PetTuning.petExperienceStoneExp);
    const message = experience.levelsGained > 0
      ? `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp} Lv.${experience.levelBefore}->${experience.levelAfter}`
      : `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp}`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet, experience };
  }

  const skillReset = resetPetSkillsByLevel(pet, random);
  roster.message = skillReset.message;
  return {
    ok: true,
    shouldConsume: true,
    message: skillReset.message,
    pet,
    skillReset,
  };
}

export function awardMonsterExperienceWithCurrentPet(
  roster: PetRoster,
  monsterExperience: number,
): MonsterExperienceShareResult {
  const activePet = getCurrentPet(roster);
  const normalizedExperience = Math.max(0, Math.floor(monsterExperience));
  if (!activePet) {
    return {
      heroExperience: normalizedExperience,
      petExperience: 0,
    };
  }

  const sharedExperience = Math.floor(normalizedExperience * 0.6);
  const petResult = addPetExperience(activePet, sharedExperience);
  roster.message = petResult.levelsGained > 0
    ? `${activePet.displayName} 获得 ${sharedExperience} 经验 Lv.${petResult.levelBefore}->${petResult.levelAfter}`
    : `${activePet.displayName} 获得 ${sharedExperience} 经验`;

  return {
    heroExperience: sharedExperience,
    petExperience: sharedExperience,
    petResult,
  };
}


