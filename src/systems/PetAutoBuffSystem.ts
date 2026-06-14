import { PetTuning } from './PetTuning';
import type {
  PetAutoBuffEffectState,
  PetAutoBuffOwnerStats,
  PetAutoBuffState,
  PetAutoBuffUpdateResult,
  PetRoster,
  PetState,
} from './PetTypes';

function getActivePet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive && pet.lifetime > 0);
}

export function updatePetAutoBuffs(params: {
  roster: PetRoster;
  ownerStats: PetAutoBuffOwnerStats;
  deltaMs: number;
}): PetAutoBuffUpdateResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return {
      triggered: false,
      expired: false,
      message: 'No active pet',
    };
  }

  const state = ensurePetAutoBuffState(pet);
  const deltaMs = Math.max(0, params.deltaMs);
  let expired = false;

  if (updateActivePetAutoBuffEffect(params.roster, pet, state.sxkb, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.fsnl, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.smjc, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.mfjc, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.gjjc, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.fyjc, params.ownerStats, deltaMs)) {
    expired = true;
  }

  state.sxkb.counterMs = Math.max(0, state.sxkb.counterMs - deltaMs);
  state.fsnl.counterMs = Math.max(0, state.fsnl.counterMs - deltaMs);
  state.smjc.counterMs = Math.max(0, state.smjc.counterMs - deltaMs);
  state.mfjc.counterMs = Math.max(0, state.mfjc.counterMs - deltaMs);
  state.gjjc.counterMs = Math.max(0, state.gjjc.counterMs - deltaMs);
  state.fyjc.counterMs = Math.max(0, state.fyjc.counterMs - deltaMs);

  const sxkbResult = tryTriggerPetSxkbAutoBuff(params.roster, pet, state);
  if (sxkbResult) {
    return {
      ...sxkbResult,
      expired,
    };
  }

  const fsnlResult = tryTriggerPetFsnlAutoBuff(params.roster, pet, state);
  if (fsnlResult) {
    return {
      ...fsnlResult,
      expired,
    };
  }

  const smjcResult = tryTriggerPetSmjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (smjcResult) {
    return {
      ...smjcResult,
      expired,
    };
  }

  const mfjcResult = tryTriggerPetMfjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (mfjcResult) {
    return {
      ...mfjcResult,
      expired,
    };
  }

  const gjjcResult = tryTriggerPetGjjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (gjjcResult) {
    return {
      ...gjjcResult,
      expired,
    };
  }

  const fyjcResult = tryTriggerPetFyjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (fyjcResult) {
    return {
      ...fyjcResult,
      expired,
    };
  }

  return {
    triggered: false,
    expired,
    message: state.lastResult,
    pet,
  };
}


function createPetAutoBuffState(): PetAutoBuffState {
  return {
    sxkb: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    fsnl: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    smjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    mfjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    gjjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    fyjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    lastResult: 'pet auto buff ready',
  };
}

function ensurePetAutoBuffState(pet: PetState): PetAutoBuffState {
  pet.autoBuffState ??= createPetAutoBuffState();
  const initialCounterMs = petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames);
  pet.autoBuffState.sxkb ??= { counterMs: initialCounterMs };
  pet.autoBuffState.fsnl ??= { counterMs: initialCounterMs };
  pet.autoBuffState.smjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.mfjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.gjjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.fyjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.lastResult ??= 'pet auto buff ready';
  return pet.autoBuffState;
}

function updateActivePetAutoBuffEffect(
  roster: PetRoster,
  pet: PetState,
  effect: PetAutoBuffEffectState,
  ownerStats: PetAutoBuffOwnerStats,
  deltaMs: number,
): boolean {
  const active = effect.active;
  if (!active) {
    return false;
  }

  active.remainingMs -= deltaMs;
  if (active.remainingMs > 0) {
    return false;
  }

  const state = ensurePetAutoBuffState(pet);
  if (active.kind === 'sxkb') {
    const bonusCritRate = active.bonusCritRate ?? 0;
    pet.critBonusRate = Math.max(0, (pet.critBonusRate ?? 0) - bonusCritRate);
    const message = `${pet.displayName} sxkb expired -${(bonusCritRate * 100).toFixed(2)}% crit`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'fsnl') {
    const bonusSkillDamage = active.bonusSkillDamage ?? 0;
    pet.skillDamageBonus = Math.max(0, (pet.skillDamageBonus ?? 0) - bonusSkillDamage);
    const message = `${pet.displayName} fsnl expired -${bonusSkillDamage.toFixed(1)} skill damage`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'smjc') {
    const bonusMaxHp = active.bonusMaxHp ?? 0;
    const ratio = ownerStats.maxHp > 0 ? ownerStats.hp / ownerStats.maxHp : 0;
    ownerStats.maxHp = Math.max(1, ownerStats.maxHp - bonusMaxHp);
    ownerStats.hp = Math.min(ownerStats.maxHp, ownerStats.maxHp * ratio);
    const message = `${pet.displayName} smjc expired -${bonusMaxHp.toFixed(1)} maxHp`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'mfjc') {
    const bonusMaxMp = active.bonusMaxMp ?? 0;
    const ratio = ownerStats.maxMp > 0 ? ownerStats.mp / ownerStats.maxMp : 0;
    ownerStats.maxMp = Math.max(1, ownerStats.maxMp - bonusMaxMp);
    ownerStats.mp = Math.min(ownerStats.maxMp, ownerStats.maxMp * ratio);
    const message = `${pet.displayName} mfjc expired -${bonusMaxMp.toFixed(1)} maxMp`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'fyjc') {
    const bonusDefense = active.bonusDefense ?? 0;
    ownerStats.defense -= bonusDefense;
    const message = `${pet.displayName} fyjc expired -${bonusDefense.toFixed(1)} defense`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  const bonusPower = active.bonusPower ?? 0;
  ownerStats.power -= bonusPower;
  const message = `${pet.displayName} gjjc expired -${bonusPower.toFixed(1)} power`;
  effect.active = undefined;
  state.lastResult = message;
  roster.message = message;
  return true;
}

function tryTriggerPetSxkbAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
): PetAutoBuffUpdateResult | undefined {
  const sxkb = state.sxkb;
  if (sxkb.active || sxkb.counterMs > 0 || !pet.skills.includes('sxkb')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffSxkbMpCost) {
    const message = `${pet.displayName} sxkb MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusCritRate = calculatePetSxkbCritBonusRate(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffSxkbMpCost);
  pet.critBonusRate = (pet.critBonusRate ?? 0) + bonusCritRate;
  sxkb.active = {
    kind: 'sxkb',
    bonusCritRate,
    totalMs,
    remainingMs: totalMs,
  };
  sxkb.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffSxkbRetriggerFrames);

  const message = `${pet.displayName} sxkb +${(bonusCritRate * 100).toFixed(2)}% crit`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusCritRate,
  };
}

function tryTriggerPetFsnlAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
): PetAutoBuffUpdateResult | undefined {
  const fsnl = state.fsnl;
  if (fsnl.active || fsnl.counterMs > 0 || !pet.skills.includes('fsnl')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffFsnlMpCost) {
    const message = `${pet.displayName} fsnl MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusSkillDamage = calculatePetFsnlSkillDamageBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffFsnlMpCost);
  pet.skillDamageBonus = (pet.skillDamageBonus ?? 0) + bonusSkillDamage;
  fsnl.active = {
    kind: 'fsnl',
    bonusSkillDamage,
    totalMs,
    remainingMs: totalMs,
  };
  fsnl.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffFsnlRetriggerFrames);

  const message = `${pet.displayName} fsnl +${bonusSkillDamage.toFixed(1)} skill damage`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusSkillDamage,
  };
}

function tryTriggerPetSmjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const smjc = state.smjc;
  if (smjc.active || smjc.counterMs > 0 || !pet.skills.includes('smjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffSmjcMpCost) {
    const message = `${pet.displayName} smjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusMaxHp = calculatePetSmjcMaxHpBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  const ratio = ownerStats.maxHp > 0 ? ownerStats.hp / ownerStats.maxHp : 0;
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffSmjcMpCost);
  ownerStats.maxHp += bonusMaxHp;
  ownerStats.hp = Math.min(ownerStats.maxHp, ownerStats.maxHp * ratio);
  smjc.active = {
    kind: 'smjc',
    bonusMaxHp,
    totalMs,
    remainingMs: totalMs,
  };
  smjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffSmjcRetriggerFrames);

  const message = `${pet.displayName} smjc +${bonusMaxHp.toFixed(1)} maxHp`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusMaxHp,
  };
}

function tryTriggerPetMfjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const mfjc = state.mfjc;
  if (mfjc.active || mfjc.counterMs > 0 || !pet.skills.includes('mfjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffMfjcMpCost) {
    const message = `${pet.displayName} mfjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusMaxMp = calculatePetMfjcMaxMpBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  const ratio = ownerStats.maxMp > 0 ? ownerStats.mp / ownerStats.maxMp : 0;
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffMfjcMpCost);
  ownerStats.maxMp += bonusMaxMp;
  ownerStats.mp = Math.min(ownerStats.maxMp, ownerStats.maxMp * ratio);
  mfjc.active = {
    kind: 'mfjc',
    bonusMaxMp,
    totalMs,
    remainingMs: totalMs,
  };
  mfjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffMfjcRetriggerFrames);

  const message = `${pet.displayName} mfjc +${bonusMaxMp.toFixed(1)} maxMp`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusMaxMp,
  };
}

function tryTriggerPetGjjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const gjjc = state.gjjc;
  if (gjjc.active || gjjc.counterMs > 0 || !pet.skills.includes('gjjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffGjjcMpCost) {
    const message = `${pet.displayName} gjjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusPower = calculatePetGjjcPowerBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffGjjcMpCost);
  ownerStats.power += bonusPower;
  gjjc.active = {
    kind: 'gjjc',
    bonusPower,
    totalMs,
    remainingMs: totalMs,
  };
  gjjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffGjjcRetriggerFrames);

  const message = `${pet.displayName} gjjc +${bonusPower.toFixed(1)} power`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusPower,
  };
}

function tryTriggerPetFyjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const fyjc = state.fyjc;
  if (fyjc.active || fyjc.counterMs > 0 || !pet.skills.includes('fyjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffFyjcMpCost) {
    const message = `${pet.displayName} fyjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusDefense = calculatePetFyjcDefenseBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffFyjcMpCost);
  ownerStats.defense += bonusDefense;
  fyjc.active = {
    kind: 'fyjc',
    bonusDefense,
    totalMs,
    remainingMs: totalMs,
  };
  fyjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffFyjcRetriggerFrames);

  const message = `${pet.displayName} fyjc +${bonusDefense.toFixed(1)} defense`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusDefense,
  };
}

function calculatePetSxkbCritBonusRate(pet: PetState): number {
  return pet.form * 0.07 * pet.technique * 0.27 * 1.05;
}

function calculatePetFsnlSkillDamageBonus(pet: PetState): number {
  return pet.form * 30 * pet.technique * 1.05;
}



function calculatePetSmjcMaxHpBonus(pet: PetState): number {
  return pet.form * 70 * pet.technique * 1.05;
}

function calculatePetMfjcMaxMpBonus(pet: PetState): number {
  return pet.form * 70 * pet.technique * 1.05;
}

function calculatePetGjjcPowerBonus(pet: PetState): number {
  return pet.form * 6 * pet.technique * 1.05;
}

function calculatePetFyjcDefenseBonus(pet: PetState): number {
  return pet.form * 5 * pet.technique * 1.05;
}

function calculatePetAutoBuffDurationMs(pet: PetState): number {
  const seconds = (30 + pet.form * 5) * pet.warpower / 2 * 0.6;
  return Math.max(0, seconds * 1000);
}

function petAutoBuffFramesToMs(frames: number): number {
  return Math.max(0, frames * PetTuning.autoBuffFrameMs);
}
