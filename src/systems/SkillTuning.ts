export const SkillMpByLevel = [
  66, 160, 208, 276, 364, 493, 703, 759, 801,
  921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
] as const;

export const SkillFixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;

export const SkillFactorBase = 0.3407 * 8 + 2.075;
export const SkillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;

export const Role1DamageFinalMultiplier = 1.27;
