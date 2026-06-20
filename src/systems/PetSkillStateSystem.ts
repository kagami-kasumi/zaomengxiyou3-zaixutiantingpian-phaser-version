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
    turtle3Sybh: {
      cooldownMs: 0,
    },
    turtle4Xwaoyi: {
      cooldownMs: 0,
      ultimateRemainingMs: 0,
      sldFreeCastTimersMs: [],
      lastCombo: {
        sldFreeCasts: 0,
        txljRefreshed: false,
        sybhSustained: false,
      },
    },
    ufo1Pms: {
      cooldownMs: 0,
    },
    ufo2Ss: {
      cooldownMs: 0,
    },
    ufo3Kmsk: {
      cooldownMs: 0,
      risingMs: 0,
      risingTotalMs: 0,
    },
    tiger1Hy: {
      cooldownMs: 0,
    },
    tiger2Sxhz: {
      cooldownMs: 0,
      lastHeal: 0,
    },
    tiger3Hsqj: {
      cooldownMs: 0,
    },
    tiger4Bhaoyi: {
      cooldownMs: 0,
      lastCombo: { hyFreeCast: false, sxhzFreeCast: false, hsqjFreeCast: false },
      comboStep: 0,
      comboStepElapsedMs: 0,
      emittedSteps: [],
      attackBoostReady: false,
    },
    phoenix1Np: {
      cooldownMs: 0,
      transformationRemainingMs: 0,
      pendingFullHeal: false,
      damageTakenMultiplier: 1,
      hurtActionImmune: false,
    },
    phoenix2Bshn: { cooldownMs: 0 },
    phoenix3Dhly: { cooldownMs: 0 },
    phoenix4Zqaoyi: { cooldownMs: 0, fireImbueActive: false },
    rabbit1Yg: { releaseReady: false, cooldownMs: 0 },
    rabbit2Jf: { cooldownMs: 0, activeRemainingMs: 0, attackRate: 0.7, dodgeBonusRate: 0 },
    rabbit3Bs: { cooldownMs: 0 },
    rabbit4Ysaoyi: { cooldownMs: 0, activeRemainingMs: 0, healTickAccumulatorMs: 0, lastPetHeal: 0, lastOwnerHeal: 0 },
    mouse1Sc: { cooldownMs: 0 },
    mouse4Hxfb: { cooldownMs: 0 },
    mouse4Zsaoyi: { cooldownMs: 0, comboStep: 0, comboStepElapsedMs: 0, emittedSteps: [] },
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
