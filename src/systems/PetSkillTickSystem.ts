import { createPetSkillState } from './PetSkillStateSystem';
import { getActivePet } from './PetRosterSystem';
import type { PetRoster, PetSkillState, PetState } from './PetTypes';
export function markActivePetSkillTriggered(roster: PetRoster): boolean {
  const pet = getActivePet(roster);
  if (!pet) {
    roster.message = 'No active pet skill trigger';
    return false;
  }

  const state = ensurePetSkillState(pet);
  if (pet.species === 'monkey' && pet.form === 2) {
    state.monkey2Xj.releaseReady = true;
  } else if (pet.species === 'monkey' && pet.form === 3) {
    state.monkey3Lj.releaseReady = true;
  } else if (pet.species === 'horse' && pet.form === 2) {
    state.horse2Bd.releaseReady = true;
  } else {
    state.monkey1Xj.releaseReady = true;
  }
  roster.message = `${pet.displayName} skill trigger ready`;
  return true;
}

export function updatePetSkillState(roster: PetRoster, deltaMs: number): void {
  for (const pet of roster.pets) {
    const state = pet.skillState;
    if (!state) {
      continue;
    }

    state.monkey1Xj.cooldownMs = Math.max(0, state.monkey1Xj.cooldownMs - Math.max(0, deltaMs));
    state.monkey2Lj.cooldownMs = Math.max(0, state.monkey2Lj.cooldownMs - Math.max(0, deltaMs));
    state.monkey2Xj.cooldownMs = Math.max(0, state.monkey2Xj.cooldownMs - Math.max(0, deltaMs));
    state.monkey3Lyq.cooldownMs = Math.max(0, state.monkey3Lyq.cooldownMs - Math.max(0, deltaMs));
    state.monkey3Xj.cooldownMs = Math.max(0, state.monkey3Xj.cooldownMs - Math.max(0, deltaMs));
    state.monkey3Lj.cooldownMs = Math.max(0, state.monkey3Lj.cooldownMs - Math.max(0, deltaMs));
    state.monkey4Jgaoyi.cooldownMs = Math.max(0, state.monkey4Jgaoyi.cooldownMs - Math.max(0, deltaMs));
    state.horse1Sp.cooldownMs = Math.max(0, state.horse1Sp.cooldownMs - Math.max(0, deltaMs));
    state.horse2Bd.cooldownMs = Math.max(0, state.horse2Bd.cooldownMs - Math.max(0, deltaMs));
    state.horse3Bz.cooldownMs = Math.max(0, state.horse3Bz.cooldownMs - Math.max(0, deltaMs));
    state.horse4Tmaoyi.cooldownMs = Math.max(0, state.horse4Tmaoyi.cooldownMs - Math.max(0, deltaMs));
    state.dragon1Fs.cooldownMs = Math.max(0, state.dragon1Fs.cooldownMs - Math.max(0, deltaMs));
    state.dragon1Fs.cloneRemainingMs = Math.max(0, state.dragon1Fs.cloneRemainingMs - Math.max(0, deltaMs));
    state.dragon2Sdcc.cooldownMs = Math.max(0, state.dragon2Sdcc.cooldownMs - Math.max(0, deltaMs));
    state.dragon3Ltwj.cooldownMs = Math.max(0, state.dragon3Ltwj.cooldownMs - Math.max(0, deltaMs));
    state.dragon4Qlaoyi.cooldownMs = Math.max(0, state.dragon4Qlaoyi.cooldownMs - Math.max(0, deltaMs));
    state.turtle1Sld.cooldownMs = Math.max(0, state.turtle1Sld.cooldownMs - Math.max(0, deltaMs));
    state.turtle2Txlj.cooldownMs = Math.max(0, state.turtle2Txlj.cooldownMs - Math.max(0, deltaMs));
    state.turtle2Txlj.linkRemainingMs = Math.max(0, state.turtle2Txlj.linkRemainingMs - Math.max(0, deltaMs));
  }
}

function ensurePetSkillState(pet: PetState): PetSkillState {
  pet.skillState ??= createPetSkillState();
  return pet.skillState;
}
