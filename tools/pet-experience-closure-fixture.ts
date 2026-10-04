import { getActivePet } from '../src/systems/PetRosterSystem';
import { getMonsterRewardConfig } from '../src/systems/MonsterDefeatRewardSystem';

// Existing movement/lifecycle fixtures do not own progression or save models.
// XP has separate actual-party coverage in monster-experience-runtime-tests/browser.
export const petExperienceClosureFixture = {
  // Numeric-only closure fixtures keep their original optional owner step.
  // Actual Phaser display integration is verified by pet-passive-render/formal.
  passiveDisplay: { ownerStep: (member: any) => member.combat.stepPetBuffs?.(), petSignal() {} },
  // These closure fixtures exercise migrated family Sessions only. The real
  // compatibility adapter clears/no-ops for them; 255 tests its actual owners.
  compatibilityPets: { update(_member: unknown, roster: Parameters<typeof getActivePet>[0] | undefined) {
    const pet = roster && getActivePet(roster);
    if (pet && !['dragon', 'turtle', 'monkey', 'horse'].includes(pet.species)) {
      throw new Error('Session-only closure fixture cannot stand in for a compatibility owner');
    }
  } },
  getActivePet, getMonsterRewardConfig, options: {}, experience: { bind() {} },
};
export const petExperienceClosureBindings =
  'const {getActivePet,getMonsterRewardConfig,options,experience,passiveDisplay,compatibilityPets}=experienceDependencies;\n';
