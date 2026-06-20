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
    state.turtle3Sybh.cooldownMs = Math.max(0, state.turtle3Sybh.cooldownMs - Math.max(0, deltaMs));
    state.turtle4Xwaoyi.cooldownMs = Math.max(0, state.turtle4Xwaoyi.cooldownMs - Math.max(0, deltaMs));
    state.turtle4Xwaoyi.ultimateRemainingMs = Math.max(0, state.turtle4Xwaoyi.ultimateRemainingMs - Math.max(0, deltaMs));
    state.turtle4Xwaoyi.sldFreeCastTimersMs = state.turtle4Xwaoyi.sldFreeCastTimersMs
      .map((timerMs) => Math.max(0, timerMs - Math.max(0, deltaMs)));
    state.ufo1Pms.cooldownMs = Math.max(0, state.ufo1Pms.cooldownMs - Math.max(0, deltaMs));
    state.ufo2Ss.cooldownMs = Math.max(0, state.ufo2Ss.cooldownMs - Math.max(0, deltaMs));
    state.ufo3Kmsk.cooldownMs = Math.max(0, state.ufo3Kmsk.cooldownMs - Math.max(0, deltaMs));
    if (state.ufo3Kmsk.risingMs > 0) {
      state.ufo3Kmsk.risingMs = Math.max(0, state.ufo3Kmsk.risingMs - Math.max(0, deltaMs));
    }
    state.tiger1Hy.cooldownMs = Math.max(0, state.tiger1Hy.cooldownMs - Math.max(0, deltaMs));
    state.tiger2Sxhz.cooldownMs = Math.max(0, state.tiger2Sxhz.cooldownMs - Math.max(0, deltaMs));
    state.tiger3Hsqj.cooldownMs = Math.max(0, state.tiger3Hsqj.cooldownMs - Math.max(0, deltaMs));
    state.tiger4Bhaoyi.cooldownMs = Math.max(0, state.tiger4Bhaoyi.cooldownMs - Math.max(0, deltaMs));
    state.phoenix1Np.cooldownMs = Math.max(0, state.phoenix1Np.cooldownMs - Math.max(0, deltaMs));
    const phoenixNpBefore = state.phoenix1Np.transformationRemainingMs;
    state.phoenix1Np.transformationRemainingMs = Math.max(0, phoenixNpBefore - Math.max(0, deltaMs));
    if (phoenixNpBefore > 0 && state.phoenix1Np.transformationRemainingMs === 0) {
      if (state.phoenix1Np.pendingFullHeal && pet.hp > 0) {
        pet.hp = pet.maxHp;
      }
      state.phoenix1Np.pendingFullHeal = false;
      state.phoenix1Np.damageTakenMultiplier = 1;
      state.phoenix1Np.hurtActionImmune = false;
    }
    state.phoenix2Bshn.cooldownMs = Math.max(0, state.phoenix2Bshn.cooldownMs - Math.max(0, deltaMs));
    state.phoenix3Dhly.cooldownMs = Math.max(0, state.phoenix3Dhly.cooldownMs - Math.max(0, deltaMs));
    state.phoenix4Zqaoyi.cooldownMs = Math.max(0, state.phoenix4Zqaoyi.cooldownMs - Math.max(0, deltaMs));
    state.rabbit1Yg.cooldownMs = Math.max(0, state.rabbit1Yg.cooldownMs - Math.max(0, deltaMs));
    state.rabbit2Jf.cooldownMs = Math.max(0, state.rabbit2Jf.cooldownMs - Math.max(0, deltaMs));
    state.rabbit3Bs.cooldownMs = Math.max(0, state.rabbit3Bs.cooldownMs - Math.max(0, deltaMs));
    state.rabbit4Ysaoyi.cooldownMs = Math.max(0, state.rabbit4Ysaoyi.cooldownMs - Math.max(0, deltaMs));
    state.mouse1Sc.cooldownMs = Math.max(0, state.mouse1Sc.cooldownMs - Math.max(0, deltaMs));
    state.mouse4Hxfb.cooldownMs = Math.max(0, state.mouse4Hxfb.cooldownMs - Math.max(0, deltaMs));
    state.mouse4Zsaoyi.cooldownMs = Math.max(0, state.mouse4Zsaoyi.cooldownMs - Math.max(0, deltaMs));
  }
}

function ensurePetSkillState(pet: PetState): PetSkillState {
  pet.skillState ??= createPetSkillState();
  return pet.skillState;
}
