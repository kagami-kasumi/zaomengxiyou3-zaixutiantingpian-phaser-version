import { clampSkillLevel as clampLevel, clampSkillLevelOrZero as clampLevelOrZero } from './SkillMathUtils';
import { findJustPressedSkillSlot } from './SkillInputUtils';
import { SkillMpByLevel, SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel, Role1DamageFinalMultiplier } from './SkillTuning';
import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from './HeroCombatSystem';
import {
  lockHeroMovementForSkill,
  type HeroMovementModel,
} from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel, SkillBinding } from './HeroSkillSystem';
import type { PlayerInputState } from './InputSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';


const hmzLianZhan = [
  34, 95, 192, 253, 318, 444, 524, 687, 876,
  1091, 1219, 1480, 1770, 2092, 2444, 2831, 3058, 3500,
] as const;
const hmzZaDi = [
  209, 573, 1151, 1523, 1912, 2666, 3149, 4126, 5258,
  6551, 7323, 8884, 10623, 12551, 14671, 16992, 18350, 21006,
] as const;
const fixedDamage = [
  34, 95, 192, 253, 318, 444, 524, 687, 876,
  1091, 1219, 1480, 1770, 2092, 2444, 2831, 3058, 3500,
] as const;

const hmzLianZhanFactorBase = 0.3407;
const hmzLianZhanFactorPerLevel = 0.0135 * 10;
const hmzZaDiFactorBase = 2.075;
const hmzZaDiFactorPerLevel = 0.075 * 10;

export type Role1FinisherSkillRuntime = {
  hmzLevel: number;
  hyjjLevel: number;
  actionRemainingMs: number;
  hyjjTargetCursor: number;
};

export type Role1FinisherTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
};

export const Role1FinisherSkillTuning = {
  hmzMpFactor: 1,
  hyjjMpFactor: 1.1,
  hmzActionMs: 1_640,
  hmzHit10_4ActiveAfterMs: 520,
  hmzGravitySuspendMs: 640,
  hyjjActionMs: 680,
  hyjjExplosionIntervalMs: 1_200,
  hyjjExplosionCount: 4,
} as const;

const hmzLianZhanProjectileTuning = {
  actionName: 'hit10_2',
  assetKey: SkillProjectileEffectKeys.role1HmzHit10_2,
  sourceSymbol: 'Role1Bullet10_2',
  runtimeName: 'Role1Bullet10_2',
  offsetX: 150,
  offsetY: -35,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 250,
  height: 160,
  lifetimeMs: Role1FinisherSkillTuning.hmzHit10_4ActiveAfterMs,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 1,
  knockbackY: 0,
  hitIntervalFrames: 3,
  maxHits: 100,
} as const satisfies ProjectileTuning;

const hmzZaDiProjectileTuning = {
  actionName: 'hit10_4',
  assetKey: SkillProjectileEffectKeys.role1HmzHit10_4,
  sourceSymbol: 'Role1Bullet10_4',
  runtimeName: 'Role1Bullet10_4',
  offsetX: 0,
  offsetY: 40,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 260,
  height: 170,
  lifetimeMs: 500,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 13,
  knockbackY: -15,
  hitIntervalFrames: 999,
  maxHits: 100,
} as const satisfies ProjectileTuning;

const hyjjExplosionProjectileTuning = {
  actionName: 'hit12',
  assetKey: SkillProjectileEffectKeys.role1HyjjHit12,
  sourceSymbol: 'Role1Bullet12',
  runtimeName: 'Role1Bullet12',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 220,
  height: 180,
  lifetimeMs: 520,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 5,
  maxHits: 15,
} as const satisfies ProjectileTuning;

const hyjjCastVisualTuning = {
  actionName: 'hit12_1',
  assetKey: SkillProjectileEffectKeys.role1HyjjHit12_1,
  sourceSymbol: 'Role1Bullet12_1_1',
  runtimeName: 'Role1Bullet12_1_1',
  offsetX: 21,
  offsetY: -10,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 96,
  height: 120,
  lifetimeMs: Role1FinisherSkillTuning.hyjjActionMs,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 0,
} as const satisfies ProjectileTuning;

export function createRole1FinisherSkillRuntime(): Role1FinisherSkillRuntime {
  return {
    hmzLevel: 0,
    hyjjLevel: 0,
    actionRemainingMs: 0,
    hyjjTargetCursor: 0,
  };
}

export function syncRole1FinisherLearnedSkills(
  runtime: Role1FinisherSkillRuntime,
  learned: { hmzLevel: number; hyjjLevel: number },
): void {
  runtime.hmzLevel = clampLevelOrZero(learned.hmzLevel);
  runtime.hyjjLevel = clampLevelOrZero(learned.hyjjLevel);
}

export function updateRole1FinisherRuntime(
  runtime: Role1FinisherSkillRuntime,
  deltaMs: number,
): void {
  runtime.actionRemainingMs = Math.max(0, runtime.actionRemainingMs - Math.max(0, deltaMs));
}

export function getRole1HmzMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1FinisherSkillTuning.hmzMpFactor);
}

export function getRole1HyjjMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1FinisherSkillTuning.hyjjMpFactor);
}

export function calculateRole1HmzLianZhanDamage(skillLevel: number, sourcePower: number): number {
  const levelIndex = clampLevel(skillLevel) - 1;
  const fixedPart = hmzLianZhan[levelIndex] * SkillFixedDamageCount[levelIndex] * 1.1;
  const powerPart = (hmzLianZhanFactorBase + hmzLianZhanFactorPerLevel * levelIndex)
    * Math.max(0, sourcePower);
  return 1.1 * (fixedPart + powerPart) * Role1DamageFinalMultiplier;
}

export function calculateRole1HmzZaDiDamage(skillLevel: number, sourcePower: number): number {
  const levelIndex = clampLevel(skillLevel) - 1;
  const fixedPart = hmzZaDi[levelIndex] * SkillFixedDamageCount[levelIndex] * 1.05;
  const powerPart = (hmzZaDiFactorBase + hmzZaDiFactorPerLevel * levelIndex)
    * Math.max(0, sourcePower);
  return 1.1 * (fixedPart + powerPart) * Role1DamageFinalMultiplier;
}

export function calculateRole1HyjjDamage(skillLevel: number, sourcePower: number): number {
  const levelIndex = clampLevel(skillLevel) - 1;
  const skillFixedDamage = fixedDamage[levelIndex] * 8 + hmzZaDi[levelIndex];
  const fixedPart = skillFixedDamage * SkillFixedDamageCount[levelIndex];
  const powerPart = (SkillFactorBase + SkillFactorPerLevel * levelIndex)
    * Math.max(0, sourcePower);
  return 0.9 * (fixedPart + powerPart) / 15 * Role1DamageFinalMultiplier;
}

export function requestRole1FinisherSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  targets: readonly Role1FinisherTarget[];
  timeMs: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 1) return undefined;
  const slotIndex = findJustPressedSkillSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (binding?.skillName !== 'hmz' && binding?.skillName !== 'hyjj') return undefined;
  if (
    params.combat.state !== 'ready'
    || params.normalAttack.activeAttack
    || params.skill.role1Runtime.actionRemainingMs > 0
    || params.skill.role1ShadowRuntime.actionRemainingMs > 0
    || params.skill.role1FinisherRuntime.actionRemainingMs > 0
  ) {
    params.skill.lastResult = `role1 ${binding.skillName}: attacking`;
    return undefined;
  }
  if (binding.skillName === 'hyjj' && !params.movement.grounded) {
    params.skill.lastResult = 'hyjj ground';
    return undefined;
  }
  return binding.skillName === 'hmz'
    ? castHmz(params, { ...binding, skillName: 'hmz' }, slotIndex)
    : castHyjj(params, { ...binding, skillName: 'hyjj' }, slotIndex);
}

function castHmz(
  params: Parameters<typeof requestRole1FinisherSkillFromInput>[0],
  binding: SkillBinding & { skillName: 'hmz' },
  slotIndex: number,
): HeroSkillCastEvent | undefined {
  const level = params.skill.role1FinisherRuntime.hmzLevel || clampLevel(binding.level);
  const mpCost = getRole1HmzMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `hmz mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role1FinisherRuntime.actionRemainingMs = Role1FinisherSkillTuning.hmzActionMs;
  params.skill.role1Runtime.actionRemainingMs = Role1FinisherSkillTuning.hmzActionMs;
  lockHeroMovementForSkill(
    params.movement,
    params.timeMs,
    Role1FinisherSkillTuning.hmzGravitySuspendMs,
    true,
  );
  const point = createSpawnPoint(params.combat, params.movement);
  const lianZhan = spawnProjectileFromTuning(
    params.projectiles,
    point,
    'role1-hmz-hit10-2',
    'role1-hmz-hit10-2',
    hmzLianZhanProjectileTuning,
  );
  lianZhan.damage = calculateRole1HmzLianZhanDamage(level, params.sourcePower);
  const zaDi = spawnProjectileFromTuning(
    params.projectiles,
    point,
    'role1-hmz-hit10-4',
    'role1-hmz-hit10-4',
    hmzZaDiProjectileTuning,
  );
  zaDi.damage = calculateRole1HmzZaDiDamage(level, params.sourcePower);
  zaDi.activeAfterMs = Role1FinisherSkillTuning.hmzHit10_4ActiveAfterMs;
  params.projectiles.projectiles.push(lianZhan, zaDi);
  params.skill.lastResult = `hmz mp ${params.skill.mp}`;
  return {
    skillName: 'hmz',
    slotIndex,
    actionName: 'hit10',
    projectile: lianZhan,
    spawnedProjectiles: [lianZhan, zaDi],
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function castHyjj(
  params: Parameters<typeof requestRole1FinisherSkillFromInput>[0],
  binding: SkillBinding & { skillName: 'hyjj' },
  slotIndex: number,
): HeroSkillCastEvent | undefined {
  const level = params.skill.role1FinisherRuntime.hyjjLevel || clampLevel(binding.level);
  const mpCost = getRole1HyjjMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `hyjj mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const target = pickHyjjTarget(params.skill.role1FinisherRuntime, params.movement, params.targets);
  if (!target) {
    params.skill.lastResult = 'hyjj target';
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role1FinisherRuntime.actionRemainingMs = Role1FinisherSkillTuning.hyjjActionMs;
  params.skill.role1Runtime.actionRemainingMs = Role1FinisherSkillTuning.hyjjActionMs;
  lockHeroMovementForSkill(params.movement, params.timeMs, Role1FinisherSkillTuning.hyjjActionMs, false);
  const spawned = spawnHyjjProjectiles(params, target, level);
  params.projectiles.projectiles.push(...spawned);
  params.skill.lastResult = `hyjj target:${target.id} mp ${params.skill.mp}`;
  return {
    skillName: 'hyjj',
    slotIndex,
    actionName: 'hit12',
    projectile: spawned[0],
    spawnedProjectiles: spawned,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function spawnHyjjProjectiles(
  params: Parameters<typeof requestRole1FinisherSkillFromInput>[0],
  target: Role1FinisherTarget,
  level: number,
): ProjectileModel[] {
  const point = createSpawnPoint(params.combat, params.movement);
  const castVisual = spawnProjectileFromTuning(
    params.projectiles,
    point,
    'role1-hyjj-hit12-1',
    'role1-hyjj-hit12-1',
    hyjjCastVisualTuning,
  );
  castVisual.visualOnly = true;
  castVisual.destroyWhenSourceHurt = false;
  const damage = calculateRole1HyjjDamage(level, params.sourcePower);
  const explosions: ProjectileModel[] = [];
  for (let i = 0; i < Role1FinisherSkillTuning.hyjjExplosionCount; i++) {
    const explosion = spawnProjectileFromTuning(
      params.projectiles,
      { sourceId: params.combat.id, x: target.x, y: target.y, facingX: params.movement.facingX },
      'role1-hyjj-hit12',
      `role1-hyjj-hit12-${i + 1}`,
      hyjjExplosionProjectileTuning,
    );
    explosion.damage = damage;
    explosion.activeAfterMs = i * Role1FinisherSkillTuning.hyjjExplosionIntervalMs;
    explosion.destroyWhenSourceHurt = false;
    explosions.push(explosion);
  }
  return [explosions[0], ...explosions.slice(1), castVisual];
}

export function pickHyjjTarget(
  runtime: Role1FinisherSkillRuntime,
  movement: HeroMovementModel,
  targets: readonly Role1FinisherTarget[],
): Role1FinisherTarget | undefined {
  const facingTargets = targets.filter((target) =>
    target.isAlive && (movement.facingX < 0 ? target.x < movement.x : target.x > movement.x),
  );
  if (facingTargets.length === 0) return undefined;
  const target = facingTargets[runtime.hyjjTargetCursor % facingTargets.length];
  runtime.hyjjTargetCursor = (runtime.hyjjTargetCursor + 1) % facingTargets.length;
  return target;
}

function createSpawnPoint(
  combat: HeroCombatModel,
  movement: HeroMovementModel,
): ProjectileSpawnPoint {
  return {
    sourceId: combat.id,
    x: movement.x,
    y: movement.y,
    facingX: movement.facingX,
  };
}







