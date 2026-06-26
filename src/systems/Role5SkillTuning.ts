import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { ProjectileModel, ProjectileTuning } from './ProjectileSystem';

export const role5ConsumeMpByLevel = [
  66, 160, 208, 276, 364, 493, 703, 759, 801,
  921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
] as const;

export const role5HmzLianZhan = [
  34, 95, 192, 253, 318, 444, 524, 687, 876,
  1091, 1219, 1480, 1770, 2092, 2444, 2831, 3058, 3500,
] as const;

export const role5HmzZaDi = [
  209, 573, 1151, 1523, 1912, 2666, 3149, 4126, 5258,
  6551, 7323, 8884, 10623, 12551, 14671, 16992, 18350, 21006,
] as const;

export const role5FixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;

export const role5SkillFactorBase = 0.3407 * 8 + 2.075;
export const role5SkillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;

export const Role5SkillTuning = {
  consumeMpByLevel: role5ConsumeMpByLevel,
  mpFactors: {
    xlc: 0.5,
    lxuanj: 0.6,
    xkjz: 0.72,
    yyb: 0.55,
    tlj: 0.72,
    pkz: 0.62,
    lxj: 0.6,
    mlsz: 1,
    lysh: 1.1,
    jrjl: 0.7,
  },
  skill4timeSeconds: [
    12.7, 13.6, 14.2, 14.5, 14.7, 15.5, 15.1, 15.2, 15.5,
    15.7, 18.5, 16.8, 18.1, 19.6, 18.1, 18.2, 19.2, 18.5,
  ],
  xlcDurationMs: 666,
  xlcDashVelocityX: 3_500,
  lxuanjDurationMs: 966,
  xkjzDurationMs: 800,
  yybDurationMs: 650,
  tljDurationMs: 900,
  pkzDurationMs: 1_050,
  lxjDurationMs: 760,
  mlszDurationMs: 1_260,
  lyshCreateDurationMs: 760,
  lyshShootDurationMs: 860,
  jrjlDurationMs: 760,
  lyshArrowChargeMs: 500,
  jrjlArrowChargeMs: 600,
  lyshArrowCount: 4,
  jrjlArrowCount: 3,
  finalDamageScale: 1.21,
} as const;

export const role5XlcTuning: ProjectileTuning = {
  actionName: 'hit6',
  assetKey: SkillProjectileEffectKeys.role5XlcHit6,
  sourceSymbol: 'sword_xlc',
  runtimeName: 'sword_xlc',
  offsetX: 35,
  offsetY: 52,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 150,
  height: 96,
  lifetimeMs: Role5SkillTuning.xlcDurationMs,
  damage: 0,
  attackKind: 'physics',
  knockbackX: -1,
  knockbackY: -1,
  hitIntervalFrames: 999,
  maxHits: 999,
};

export const role5LxuanjTuning: ProjectileTuning = {
  actionName: 'hit7_1',
  assetKey: SkillProjectileEffectKeys.role5LxuanjHit7_1,
  sourceSymbol: 'sword_lxuanj1',
  runtimeName: 'sword_lxuanj1',
  offsetX: 188,
  offsetY: -97,
  speedX: 36,
  speedY: 0,
  distance: 999,
  width: 210,
  height: 118,
  lifetimeMs: Role5SkillTuning.lxuanjDurationMs,
  damage: 0,
  attackKind: 'physics',
  knockbackX: -2,
  knockbackY: 0,
  hitIntervalFrames: 4,
  maxHits: 999,
};

export const role5XkjzTuning: ProjectileTuning = {
  actionName: 'hit10',
  assetKey: SkillProjectileEffectKeys.role5XkjzHit10,
  sourceSymbol: 'sword_xkjz',
  runtimeName: 'sword_xkjz',
  offsetX: 486,
  offsetY: -465,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 320,
  height: 260,
  lifetimeMs: Role5SkillTuning.xkjzDurationMs,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: -2,
  hitIntervalFrames: 9,
  maxHits: 999,
};

export const role5YybTuning: ProjectileTuning = {
  actionName: 'hit9',
  assetKey: SkillProjectileEffectKeys.role5YybHit9,
  sourceSymbol: 'Role5Bullet9',
  runtimeName: 'Role5Bullet9',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 96,
  height: 128,
  lifetimeMs: Role5SkillTuning.yybDurationMs,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
};

export const role5TljTuning: ProjectileTuning = {
  actionName: 'hit11',
  assetKey: SkillProjectileEffectKeys.role5TljHit11,
  sourceSymbol: 'role5_tlj',
  runtimeName: 'role5_tlj',
  offsetX: 90,
  offsetY: -30,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 130,
  lifetimeMs: Role5SkillTuning.tljDurationMs,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 6,
  maxHits: 1,
};

export const role5PkzTunings: readonly (ProjectileTuning & { variant: ProjectileModel['variant'] })[] = [
  createPkzTuning('role5-pkz-hit24-1', SkillProjectileEffectKeys.role5PkzHit24_1, 'hit24_1', 'swordskill2_1', 190, -90, 220, 150, 520, -2),
  createPkzTuning('role5-pkz-hit24-2', SkillProjectileEffectKeys.role5PkzHit24_2, 'hit24_2', 'swordskill2_2', 215, -120, 245, 165, 620, -2),
  createPkzTuning('role5-pkz-hit24-3', SkillProjectileEffectKeys.role5PkzHit24_3, 'hit24_3', 'swordskill2_3', 240, -110, 270, 175, 560, -3),
];

export const role5LxjTuning: ProjectileTuning = {
  actionName: 'hit26',
  assetKey: SkillProjectileEffectKeys.role5LxjHit26,
  sourceSymbol: 'swordskill4',
  runtimeName: 'swordskill4',
  offsetX: 0,
  offsetY: -90,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 170,
  height: 210,
  lifetimeMs: Role5SkillTuning.lxjDurationMs,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
};

export const role5MlszTunings: readonly (
  ProjectileTuning & { variant: ProjectileModel['variant']; enhancedVariant: ProjectileModel['variant'] }
)[] = [
  createMlszTuning('role5-mlsz-hit29-1', 'role5-mlsz-hit29-1-enhanced', 'sword_mlsz1', 120, -165),
  createMlszTuning('role5-mlsz-hit29-2', 'role5-mlsz-hit29-2-enhanced', 'sword_mlsz2', 185, -205),
  createMlszTuning('role5-mlsz-hit29-3', 'role5-mlsz-hit29-3-enhanced', 'sword_mlsz3', 250, -245),
  createMlszTuning('role5-mlsz-hit29-4', 'role5-mlsz-hit29-4-enhanced', 'sword_mlsz4', 315, -205),
  createMlszTuning('role5-mlsz-hit29-5', 'role5-mlsz-hit29-5-enhanced', 'sword_mlsz5', 380, -165),
];

export const role5LyshCompanionTuning: ProjectileTuning = {
  actionName: 'hit27_1',
  assetKey: SkillProjectileEffectKeys.role5LyshCompanion,
  sourceSymbol: 'swordskill5_3',
  runtimeName: 'swordskill5_3',
  offsetX: 0,
  offsetY: -80,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 150,
  height: 140,
  lifetimeMs: 30_000,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
};

export const role5LyshShotTuning: ProjectileTuning = {
  actionName: 'hit27_3',
  assetKey: SkillProjectileEffectKeys.role5LyshShot,
  sourceSymbol: 'swordskill5_2',
  runtimeName: 'swordskill5_2',
  offsetX: 120,
  offsetY: -80,
  speedX: 22,
  speedY: 0,
  distance: 2_000,
  width: 130,
  height: 86,
  lifetimeMs: 4_000,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: -2,
  hitIntervalFrames: 6,
  maxHits: 999,
};

export const role5JrjlCompanionTuning: ProjectileTuning = {
  actionName: 'hit28',
  assetKey: SkillProjectileEffectKeys.role5JrjlCompanion,
  sourceSymbol: 'sword_jrjlsf',
  runtimeName: 'sword_jrjlsf',
  offsetX: 0,
  offsetY: -110,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 150,
  height: 150,
  lifetimeMs: 30_000,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
};

export const role5JrjlShotTuning: ProjectileTuning = {
  actionName: 'hit30',
  assetKey: SkillProjectileEffectKeys.role5JrjlShot,
  sourceSymbol: 'sword_jrjljq',
  runtimeName: 'sword_jrjljq',
  offsetX: 150,
  offsetY: -95,
  speedX: 60,
  speedY: 0,
  distance: 2_000,
  width: 135,
  height: 88,
  lifetimeMs: 4_000,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: -2,
  hitIntervalFrames: 6,
  maxHits: 999,
};

function createPkzTuning(
  variant: ProjectileModel['variant'],
  assetKey: string,
  actionName: string,
  sourceSymbol: string,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  lifetimeMs: number,
  knockbackY: number,
): ProjectileTuning & { variant: ProjectileModel['variant'] } {
  return {
    variant,
    actionName,
    assetKey,
    sourceSymbol,
    runtimeName: sourceSymbol,
    offsetX,
    offsetY,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width,
    height,
    lifetimeMs,
    damage: 0,
    attackKind: 'physics',
    knockbackX: 0,
    knockbackY,
    hitIntervalFrames: 6,
    maxHits: 999,
  };
}

function createMlszTuning(
  variant: ProjectileModel['variant'],
  enhancedVariant: ProjectileModel['variant'],
  sourceSymbol: string,
  offsetX: number,
  offsetY: number,
): ProjectileTuning & { variant: ProjectileModel['variant']; enhancedVariant: ProjectileModel['variant'] } {
  return {
    variant,
    enhancedVariant,
    actionName: 'hit29',
    assetKey: SkillProjectileEffectKeys.role5MlszHit29,
    sourceSymbol,
    runtimeName: sourceSymbol,
    offsetX,
    offsetY,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width: 170,
    height: 190,
    lifetimeMs: 540,
    damage: 0,
    attackKind: 'physics',
    knockbackX: 0,
    knockbackY: -3,
    hitIntervalFrames: 6,
    maxHits: 999,
  };
}
