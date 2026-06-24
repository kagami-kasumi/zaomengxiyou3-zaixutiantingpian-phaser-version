import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { AttackKind } from './CombatSystem';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel, SkillBinding } from './HeroSkillSystem';
import type { PlayerInputState } from './InputSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';

const consumeMpByLevel = [
  66, 160, 208, 276, 364, 493, 703, 759, 801,
  921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
] as const;
const hmzLianZhan = [
  34, 95, 192, 253, 318, 444, 524, 687, 876,
  1091, 1219, 1480, 1770, 2092, 2444, 2831, 3058, 3500,
] as const;
const hmzZaDi = [
  209, 573, 1151, 1523, 1912, 2666, 3149, 4126, 5258,
  6551, 7323, 8884, 10623, 12551, 14671, 16992, 18350, 21006,
] as const;
const fixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;
const skillFactorBase = 0.3407 * 8 + 2.075;
const skillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;

export type Role1SkillRuntimeModel = {
  actionRemainingMs: number;
  slzLevel: number;
  sxLevel: number;
  lifeStealPercent: number;
  critBonusPercent: number;
};

export const Role1BasicSkillTuning = {
  slzMpFactor: 0.55,
  slzActionMs: 650,
} as const;

const slzProjectileTuning = {
  actionName: 'hit6',
  assetKey: SkillProjectileEffectKeys.role1SlzHit6,
  sourceSymbol: 'Role1Bullet6',
  runtimeName: 'Role1Bullet6',
  offsetX: 30,
  offsetY: 40,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 170,
  height: 150,
  lifetimeMs: 460,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 5,
  knockbackY: -20,
  hitIntervalFrames: 999,
  maxHits: 99,
} as const satisfies ProjectileTuning;

export function createRole1SkillRuntime(): Role1SkillRuntimeModel {
  return {
    actionRemainingMs: 0,
    slzLevel: 0,
    sxLevel: 0,
    lifeStealPercent: 0,
    critBonusPercent: 0,
  };
}

export function updateRole1BasicRuntime(
  runtime: Role1SkillRuntimeModel,
  deltaMs: number,
): void {
  runtime.actionRemainingMs = Math.max(0, runtime.actionRemainingMs - Math.max(0, deltaMs));
}

export function syncRole1LearnedSkills(
  runtime: Role1SkillRuntimeModel,
  learned: { slzLevel: number; sxLevel: number },
): void {
  runtime.slzLevel = clampLevelOrZero(learned.slzLevel, 18);
  runtime.sxLevel = clampLevelOrZero(learned.sxLevel, 9);
  runtime.lifeStealPercent = runtime.sxLevel > 0
    ? 0.8 + (runtime.sxLevel - 1) / 10
    : 0;
  runtime.critBonusPercent = runtime.sxLevel > 0
    ? 3 + Math.round(runtime.sxLevel)
    : 0;
}

export function getRole1SlzMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, consumeMpByLevel.length) - 1;
  return Math.floor(consumeMpByLevel[levelIndex] * Role1BasicSkillTuning.slzMpFactor);
}

export function calculateRole1SlzDamage(skillLevel: number, sourcePower: number): number {
  const levelIndex = clampLevel(skillLevel, hmzLianZhan.length) - 1;
  const skillFixedDamage = hmzLianZhan[levelIndex] * 8 + hmzZaDi[levelIndex];
  const fixedPart = skillFixedDamage * fixedDamageCount[levelIndex];
  const powerPart = (skillFactorBase + skillFactorPerLevel * levelIndex)
    * Math.max(0, sourcePower);
  return Math.floor(0.6 * (fixedPart + powerPart)) * 1.27;
}

export function isRole1SlzComboRequested(params: {
  heroId: number;
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
}): boolean {
  const level = params.skill.role1Runtime.slzLevel;
  if (params.heroId !== 1 || level <= 0) return false;
  const justPressed = params.input.attack && !(params.previousInput?.attack ?? false)
    || params.input.up && !(params.previousInput?.up ?? false);
  return params.input.attack && params.input.up && justPressed
    && params.skill.mp >= getRole1SlzMpCost({ skillName: 'slz', level });
}

export function requestRole1BasicSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 1) return undefined;
  const combo = isRole1SlzComboRequested({
    heroId: params.normalAttack.heroId,
    skill: params.skill,
    input: params.input,
    previousInput: params.previousInput,
  });
  const slotIndex = findJustPressedSkillSlot(params.input, params.previousInput);
  const binding = slotIndex === undefined ? undefined : params.skill.loadout.slots[slotIndex];
  if (!combo && binding?.skillName !== 'slz') return undefined;
  if (
    params.combat.state !== 'ready'
    || params.normalAttack.activeAttack
    || params.skill.role1Runtime.actionRemainingMs > 0
  ) {
    params.skill.lastResult = 'role1 slz: attacking';
    return undefined;
  }
  const level = combo ? params.skill.role1Runtime.slzLevel : binding!.level;
  const mpCost = getRole1SlzMpCost({ skillName: 'slz', level });
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `slz mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.slzActionMs;
  const spawnPoint: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = spawnProjectileFromTuning(
    params.projectiles,
    spawnPoint,
    'role1-slz-hit6',
    'role1-slz-hit6',
    slzProjectileTuning,
  );
  projectile.damage = calculateRole1SlzDamage(level, params.sourcePower);
  params.projectiles.projectiles.push(projectile);
  params.skill.lastResult = `slz${combo ? '-combo' : ''} mp ${params.skill.mp}`;
  return {
    skillName: 'slz',
    slotIndex: combo ? -1 : slotIndex!,
    actionName: 'hit6',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: combo,
  };
}

export function tryRole1SxLifeSteal(params: {
  runtime: Role1SkillRuntimeModel;
  combat: HeroCombatModel;
  actualDamage: number;
  attackKind: AttackKind;
}): number {
  if (
    params.runtime.sxLevel <= 0
    || params.combat.state === 'dead'
    || params.attackKind !== 'physics'
  ) return 0;
  const heal = Math.floor(Math.max(0, params.actualDamage) * params.runtime.lifeStealPercent / 100);
  const hpBefore = params.combat.hp;
  params.combat.hp = Math.min(params.combat.maxHp, params.combat.hp + heal);
  return params.combat.hp - hpBefore;
}

function findJustPressedSkillSlot(
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slotIndex) =>
    pressed && !(previousInput?.skillSlots[slotIndex] ?? false)
  );
  return index >= 0 ? index : undefined;
}

function clampLevel(level: number, max: number): number {
  return Math.min(max, Math.max(1, Math.floor(level)));
}

function clampLevelOrZero(level: number, max: number): number {
  return level > 0 ? clampLevel(level, max) : 0;
}
