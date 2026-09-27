import { getActivePet } from '../src/systems/PetRosterSystem';
import { getMonsterRewardConfig } from '../src/systems/MonsterDefeatRewardSystem';

// Existing movement/lifecycle fixtures do not own progression or save models.
// XP has separate actual-party coverage in monster-experience-runtime-tests/browser.
export const petExperienceClosureFixture = {
  getActivePet, getMonsterRewardConfig, options: {}, experience: { bind() {} },
};
export const petExperienceClosureBindings =
  'const {getActivePet,getMonsterRewardConfig,options,experience}=experienceDependencies;\n';
