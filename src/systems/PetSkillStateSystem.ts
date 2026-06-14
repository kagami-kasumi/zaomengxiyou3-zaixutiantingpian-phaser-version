import type { PetDragon4QlaoyiComboState, PetSkillState } from './PetTypes';

export function createPetSkillState(): PetSkillState {
  return {
    monkey1Xj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey2Lj: {
      cooldownMs: 0,
    },
    monkey2Xj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey3Lyq: {
      cooldownMs: 0,
    },
    monkey3Xj: {
      cooldownMs: 0,
    },
    monkey3Lj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey4Jgaoyi: {
      cooldownMs: 0,
    },
    horse1Sp: {
      cooldownMs: 0,
    },
    horse2Bd: {
      releaseReady: false,
      cooldownMs: 0,
    },
    horse3Bz: {
      cooldownMs: 0,
    },
    horse4Tmaoyi: {
      cooldownMs: 0,
    },
    dragon1Fs: {
      cooldownMs: 0,
      cloneRemainingMs: 0,
    },
    dragon2Sdcc: {
      cooldownMs: 0,
      lastHealOnHit: 0,
    },
    dragon3Ltwj: {
      cooldownMs: 0,
      lastHealOnHit: 0,
    },
    dragon4Qlaoyi: {
      cooldownMs: 0,
      lastCombo: createEmptyPetDragon4QlaoyiComboState(),
    },
    turtle1Sld: {
      cooldownMs: 0,
      lastHeal: 0,
      lastOwnerHeal: 0,
    },
    turtle2Txlj: {
      cooldownMs: 0,
      linkRemainingMs: 0,
      lastOwnerDamageRedirect: 0,
      lastOwnerDamageAfterRedirect: 0,
      lastOwnerHealBoost: 0,
      lastPetHeal: 0,
    },
    lastResult: 'pet skill ready',
  };
}

function createEmptyPetDragon4QlaoyiComboState(): PetDragon4QlaoyiComboState {
  return {
    cloneCombo: false,
    sdccCombo: false,
    ltwjCombo: false,
  };
}
