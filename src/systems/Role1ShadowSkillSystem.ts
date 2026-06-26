import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel, SkillBinding } from './HeroSkillSystem';
import type { PlayerInputState } from './InputSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSystemModel,
  type ProjectileTuning,
  type ProjectileVariant,
} from './ProjectileSystem';

const consumeMpByLevel = [
  66, 160, 208, 276, 364, 493, 703, 759, 801,
  921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
] as const;
const fixedDamage = [
  34, 95, 192, 253, 318, 444, 524, 687, 876,
  1091, 1219, 1480, 1770, 2092, 2444, 2831, 3058, 3500,
] as const;
const extraFixedDamage = [
  209, 573, 1151, 1523, 1912, 2666, 3149, 4126, 5258,
  6551, 7323, 8884, 10623, 12551, 14671, 16992, 18350, 21006,
] as const;
const fixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;
const skillFactorBase = 0.3407 * 8 + 2.075;
const skillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;

export type Role1ShadowSkillRuntime = {
  qsezLevel: number;
  zzLevel: number;
  actionRemainingMs: number;
  shadows: Role1ShadowModel[];
  shadowSerial: number;
};

export type Role1ShadowModel = {
  id: string;
  sourceId: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  qsezLevel: number;
  remainingMs: number;
};

export type Role1ShadowTarget = {
  id: string;
  x: number;
  y: number;
  isBoss: boolean;
  isAlive: boolean;
};

export const Role1ShadowSkillTuning = {
  qsezMpFactor: 0.6,
  zzMpFactor: 0.75,
  qsezActionMs: 1_250,
  zzActionMs: 620,
  qsezDashSpeed: 900,
  qsezHitRangeX: 220,
  qsezHitRangeY: 140,
  shadowLifetimeMs: 3_000,
  shadowSpawnSpreadX: 150,
  shadowZzDamageMultiplier: 0.437,
} as const;

const qsezProjectileTuning = {
  actionName: 'hit13',
  assetKey: SkillProjectileEffectKeys.role1QsezHit13,
  sourceSymbol: 'Role1Bullet13',
  runtimeName: 'Role1Bullet13',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 170,
  height: 130,
  lifetimeMs: 420,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const satisfies ProjectileTuning;

const zzFirstProjectileTuning = {
  actionName: 'hit14',
  assetKey: SkillProjectileEffectKeys.role1ZzHit14_1,
  sourceSymbol: 'Role1Bullet14_1',
  runtimeName: 'Role1Bullet14_1',
  offsetX: 0,
  offsetY: -85,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 160,
  lifetimeMs: 420,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 20,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const satisfies ProjectileTuning;

const zzSecondProjectileTuning = {
  ...zzFirstProjectileTuning,
  assetKey: SkillProjectileEffectKeys.role1ZzHit14_2,
  sourceSymbol: 'Role1Bullet14_2',
  runtimeName: 'Role1Bullet14_2',
  offsetX: 145,
  offsetY: -60,
} as const satisfies ProjectileTuning;

export function createRole1ShadowSkillRuntime(): Role1ShadowSkillRuntime {
  return {
    qsezLevel: 0,
    zzLevel: 0,
    actionRemainingMs: 0,
    shadows: [],
    shadowSerial: 0,
  };
}

export function syncRole1ShadowLearnedSkills(
  runtime: Role1ShadowSkillRuntime,
  learned: { qsezLevel: number; zzLevel: number },
): void {
  runtime.qsezLevel = clampLevelOrZero(learned.qsezLevel, 18);
  runtime.zzLevel = clampLevelOrZero(learned.zzLevel, 18);
}

export function updateRole1ShadowRuntime(
  runtime: Role1ShadowSkillRuntime,
  deltaMs: number,
): void {
  const safeDelta = Math.max(0, deltaMs);
  runtime.actionRemainingMs = Math.max(0, runtime.actionRemainingMs - safeDelta);
  for (const shadow of runtime.shadows) {
    shadow.remainingMs -= safeDelta;
  }
  runtime.shadows = runtime.shadows.filter((shadow) => shadow.remainingMs > 0);
}

export function getRole1QsezMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, consumeMpByLevel.length) - 1;
  return Math.floor(consumeMpByLevel[levelIndex] * Role1ShadowSkillTuning.qsezMpFactor);
}

export function getRole1ZzMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, consumeMpByLevel.length) - 1;
  return Math.floor(consumeMpByLevel[levelIndex] * Role1ShadowSkillTuning.zzMpFactor);
}

export function calculateRole1QsezDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1ShadowSkillDamage(skillLevel, sourcePower, 0.25, 1);
}

export function calculateRole1ZzDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1ShadowSkillDamage(skillLevel, sourcePower, 0.84, 1);
}

export function calculateRole1ShadowZzDamage(qsezLevel: number, sourcePower: number): number {
  return calculateRole1ShadowSkillDamage(qsezLevel, sourcePower, 0.25, 1)
    * Role1ShadowSkillTuning.shadowZzDamageMultiplier;
}

export function requestRole1ShadowSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  targets: readonly Role1ShadowTarget[];
  random?: () => number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 1) return undefined;
  const slotIndex = findJustPressedSkillSlot(params.input, params.previousInput);
  const binding = slotIndex === undefined ? undefined : params.skill.loadout.slots[slotIndex];
  if (binding?.skillName !== 'qsez' && binding?.skillName !== 'zz') return undefined;
  const runtime = params.skill.role1ShadowRuntime;
  if (
    params.combat.state !== 'ready'
    || params.normalAttack.activeAttack
    || params.skill.role1Runtime.actionRemainingMs > 0
    || runtime.actionRemainingMs > 0
  ) {
    params.skill.lastResult = `role1 ${binding.skillName}: attacking`;
    return undefined;
  }
  return binding.skillName === 'qsez'
    ? castQsez(params, binding, slotIndex!)
    : castZz(params, binding, slotIndex!);
}

function castQsez(
  params: Parameters<typeof requestRole1ShadowSkillFromInput>[0],
  binding: SkillBinding,
  slotIndex: number,
): HeroSkillCastEvent | undefined {
  const mpCost = getRole1QsezMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `qsez mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role1ShadowRuntime.actionRemainingMs = Role1ShadowSkillTuning.qsezActionMs;
  params.skill.role1Runtime.actionRemainingMs = Role1ShadowSkillTuning.qsezActionMs;
  params.movement.velocityX = params.movement.facingX * Role1ShadowSkillTuning.qsezDashSpeed;
  const target = findRole1QsezTarget(params.movement, params.targets);
  const projectile = spawnRole1ShadowProjectile(
    params.projectiles,
    params.combat,
    target?.x ?? params.movement.x + params.movement.facingX * Role1ShadowSkillTuning.qsezHitRangeX,
    target?.y ?? params.movement.y,
    params.movement.facingX,
    'role1-qsez-hit13',
    'role1-qsez-hit13',
    qsezProjectileTuning,
  );
  projectile.damage = target ? calculateRole1QsezDamage(binding.level, params.sourcePower) : 0;
  params.projectiles.projectiles.push(projectile);
  if (target) {
    spawnRole1ShadowsFromQsezHit(
      params.skill.role1ShadowRuntime,
      params.combat.id,
      target,
      params.movement.facingX,
      binding.level,
      params.random ?? Math.random,
    );
  }
  params.skill.lastResult = `qsez ${target ? 'hit' : 'dash'} mp ${params.skill.mp}`;
  return {
    skillName: 'qsez',
    slotIndex,
    actionName: 'hit13',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function castZz(
  params: Parameters<typeof requestRole1ShadowSkillFromInput>[0],
  binding: SkillBinding,
  slotIndex: number,
): HeroSkillCastEvent | undefined {
  const mpCost = getRole1ZzMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `zz mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role1ShadowRuntime.actionRemainingMs = Role1ShadowSkillTuning.zzActionMs;
  params.skill.role1Runtime.actionRemainingMs = Role1ShadowSkillTuning.zzActionMs;
  const damage = calculateRole1ZzDamage(binding.level, params.sourcePower);
  const first = spawnZzProjectile(params, params.movement.x, params.movement.y, 'role1-zz-hit14-1', zzFirstProjectileTuning, damage);
  const second = spawnZzProjectile(params, params.movement.x, params.movement.y, 'role1-zz-hit14-2', zzSecondProjectileTuning, damage);
  const shadowProjectiles = spawnRole1ShadowZzProjectiles(params, params.sourcePower);
  const spawnedProjectiles = [first, second, ...shadowProjectiles];
  params.projectiles.projectiles.push(...spawnedProjectiles);
  params.skill.role1ShadowRuntime.shadows = [];
  params.skill.lastResult = `zz shadows:${shadowProjectiles.length / 2} mp ${params.skill.mp}`;
  return {
    skillName: 'zz',
    slotIndex,
    actionName: 'hit14',
    projectile: first,
    spawnedProjectiles,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: shadowProjectiles.length > 0,
  };
}

export function getRole1QsezShadowCount(isBoss: boolean, random: () => number): number {
  return (isBoss ? 4 : 1) + (random() <= 0.5 ? 1 : 0);
}

export function spawnRole1ShadowsFromQsezHit(
  runtime: Role1ShadowSkillRuntime,
  sourceId: string,
  target: Role1ShadowTarget,
  facingX: -1 | 1,
  qsezLevel: number,
  random: () => number,
): readonly Role1ShadowModel[] {
  const count = getRole1QsezShadowCount(target.isBoss, random);
  const spawned: Role1ShadowModel[] = [];
  for (let i = 0; i < count; i++) {
    runtime.shadowSerial += 1;
    const shadow = {
      id: `${sourceId}-shadow-${runtime.shadowSerial}`,
      sourceId,
      x: target.x + (random() - 0.5) * Role1ShadowSkillTuning.shadowSpawnSpreadX,
      y: target.y,
      facingX,
      qsezLevel,
      remainingMs: Role1ShadowSkillTuning.shadowLifetimeMs,
    };
    runtime.shadows.push(shadow);
    spawned.push(shadow);
  }
  return spawned;
}

function spawnRole1ShadowZzProjectiles(
  params: Parameters<typeof requestRole1ShadowSkillFromInput>[0],
  sourcePower: number,
): ProjectileModel[] {
  return params.skill.role1ShadowRuntime.shadows.flatMap((shadow) => {
    const damage = calculateRole1ShadowZzDamage(shadow.qsezLevel, sourcePower);
    return [
      spawnZzProjectile(params, shadow.x, shadow.y, 'role1-shadow-zz-hit14-1', zzFirstProjectileTuning, damage),
      spawnZzProjectile(params, shadow.x, shadow.y, 'role1-shadow-zz-hit14-2', {
        ...zzSecondProjectileTuning,
        actionName: 'hit14_1',
      }, damage),
    ];
  });
}

function findRole1QsezTarget(
  movement: HeroMovementModel,
  targets: readonly Role1ShadowTarget[],
): Role1ShadowTarget | undefined {
  return targets.find((target) => {
    if (!target.isAlive) return false;
    const dx = target.x - movement.x;
    return Math.sign(dx || movement.facingX) === movement.facingX
      && Math.abs(dx) <= Role1ShadowSkillTuning.qsezHitRangeX
      && Math.abs(target.y - movement.y) <= Role1ShadowSkillTuning.qsezHitRangeY;
  });
}

function spawnZzProjectile(
  params: Parameters<typeof requestRole1ShadowSkillFromInput>[0],
  x: number,
  y: number,
  variant: 'role1-zz-hit14-1' | 'role1-zz-hit14-2' | 'role1-shadow-zz-hit14-1' | 'role1-shadow-zz-hit14-2',
  tuning: ProjectileTuning,
  damage: number,
): ProjectileModel {
  const projectile = spawnRole1ShadowProjectile(
    params.projectiles,
    params.combat,
    x,
    y,
    params.movement.facingX,
    variant,
    variant,
    tuning,
  );
  projectile.damage = damage;
  return projectile;
}

function spawnRole1ShadowProjectile(
  system: ProjectileSystemModel,
  combat: HeroCombatModel,
  x: number,
  y: number,
  facingX: -1 | 1,
  variant: ProjectileVariant,
  attackSlug: string,
  tuning: ProjectileTuning,
): ProjectileModel {
  return spawnProjectileFromTuning(system, { sourceId: combat.id, x, y, facingX }, variant, attackSlug, tuning);
}

function calculateRole1ShadowSkillDamage(
  skillLevel: number,
  sourcePower: number,
  multiplier: number,
  divisor: number,
): number {
  const levelIndex = clampLevel(skillLevel, fixedDamage.length) - 1;
  const fixedPart = (fixedDamage[levelIndex] * 8 + extraFixedDamage[levelIndex]) * fixedDamageCount[levelIndex];
  const powerPart = (skillFactorBase + skillFactorPerLevel * levelIndex) * Math.max(0, sourcePower);
  return Math.floor(multiplier * (fixedPart + powerPart) / divisor) * 1.27;
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
