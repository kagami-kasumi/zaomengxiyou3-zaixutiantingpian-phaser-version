import type { SkillBinding } from './HeroSkillSystem';
import {
  role5ConsumeMpByLevel,
  role5FixedDamageCount,
  role5HmzLianZhan,
  role5HmzZaDi,
  Role5SkillTuning,
  role5SkillFactorBase,
  role5SkillFactorPerLevel,
} from './Role5SkillTuning';
import type {
  Role5CompanionSkillName,
  Role5SkillRuntime,
  Role5SpearSkillName,
  Role5StatusSkillName,
  Role5SwordSkillName,
} from './Role5SkillTypes';

export function isRole5SpearSkillName(skillName: string): skillName is Role5SpearSkillName {
  return skillName === 'xlc' || skillName === 'lxuanj' || skillName === 'xkjz';
}

export function isRole5StatusSkillName(skillName: string): skillName is Role5StatusSkillName {
  return skillName === 'yyb' || skillName === 'tlj';
}

export function isRole5SwordSkillName(skillName: string): skillName is Role5SwordSkillName {
  return skillName === 'pkz' || skillName === 'lxj' || skillName === 'mlsz';
}

export function isRole5CompanionSkillName(skillName: string): skillName is Role5CompanionSkillName {
  return skillName === 'lysh' || skillName === 'jrjl';
}

export function getRole5SpearSkillMpCost(binding: SkillBinding): number {
  if (!isRole5SpearSkillName(binding.skillName)) return 0;
  const levelIndex = clampRole5SkillLevel(binding.level) - 1;
  return Math.floor(role5ConsumeMpByLevel[levelIndex] * Role5SkillTuning.mpFactors[binding.skillName]);
}

export function getRole5StatusSkillMpCost(binding: SkillBinding): number {
  if (!isRole5StatusSkillName(binding.skillName)) return 0;
  const levelIndex = clampRole5SkillLevel(binding.level) - 1;
  return Math.floor(role5ConsumeMpByLevel[levelIndex] * Role5SkillTuning.mpFactors[binding.skillName]);
}

export function getRole5SwordSkillMpCost(binding: SkillBinding): number {
  if (!isRole5SwordSkillName(binding.skillName)) return 0;
  const levelIndex = clampRole5SkillLevel(binding.level) - 1;
  return Math.floor(role5ConsumeMpByLevel[levelIndex] * Role5SkillTuning.mpFactors[binding.skillName]);
}

export function getRole5CompanionSkillMpCost(binding: SkillBinding): number {
  if (!isRole5CompanionSkillName(binding.skillName)) return 0;
  const levelIndex = clampRole5SkillLevel(binding.level) - 1;
  return Math.floor(role5ConsumeMpByLevel[levelIndex] * Role5SkillTuning.mpFactors[binding.skillName]);
}

export function getRole5YybStatusDurationMs(level: number): number {
  return Role5SkillTuning.skill4timeSeconds[clampRole5SkillLevel(level) - 1] * 1_000;
}

export function getRole5LoongSwordDamageMultiplier(
  runtime: Role5SkillRuntime,
  jrjlLevel = 0,
): number {
  if (runtime.loongSwordRemainingMs <= 0 || runtime.loongSwordLevel <= 0) return 1;
  const lxjMultiplier = 1.09 + runtime.loongSwordLevel * 0.008;
  const jrjlMultiplier = jrjlLevel > 0 ? 1.045 + jrjlLevel * 0.0036 : 1;
  return lxjMultiplier * jrjlMultiplier;
}

export function calculateRole5SpearSkillDamage(
  skillName: Role5SpearSkillName,
  level: number,
  sourcePower: number,
): number {
  const base = calculateRole5BaseDamage(level, sourcePower);
  const coefficient = skillName === 'xlc' ? 0.6 : skillName === 'lxuanj' ? 0.7 / 5 : 0.8 / 7;
  return coefficient * base * Role5SkillTuning.finalDamageScale;
}

export function calculateRole5SwordSkillDamage(
  skillName: Exclude<Role5SwordSkillName, 'lxj'>,
  level: number,
  sourcePower: number,
  runtime?: Role5SkillRuntime,
  jrjlLevel = 0,
): number {
  const coefficient = skillName === 'pkz' ? 0.62 : 1;
  return calculateRole5BaseDamage(level, sourcePower) * coefficient * Role5SkillTuning.finalDamageScale *
    (runtime ? getRole5LoongSwordDamageMultiplier(runtime, jrjlLevel) : 1);
}

export function calculateRole5CompanionArrowDamage(
  skillName: Role5CompanionSkillName,
  level: number,
  sourcePower: number,
  runtime?: Role5SkillRuntime,
): number {
  const coefficient = skillName === 'lysh' ? 1.1 : 0.7;
  return calculateRole5BaseDamage(level, sourcePower) * coefficient * Role5SkillTuning.finalDamageScale *
    (skillName === 'lysh' && runtime ? getRole5LoongSwordDamageMultiplier(runtime) : 1);
}

export function clampRole5SkillLevel(level: number): number {
  return Math.min(Math.max(Math.floor(level), 1), role5ConsumeMpByLevel.length);
}

function calculateRole5BaseDamage(level: number, sourcePower: number): number {
  const index = clampRole5SkillLevel(level) - 1;
  const fixedDamage = (role5HmzLianZhan[index] * 8 + role5HmzZaDi[index]) * role5FixedDamageCount[index];
  const skillPower = (role5SkillFactorBase + role5SkillFactorPerLevel * index) * sourcePower;
  return fixedDamage + skillPower;
}
