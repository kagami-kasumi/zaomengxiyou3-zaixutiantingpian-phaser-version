import { clampSkillLevel as clampLevel } from './SkillMathUtils';
import { findJustPressedSkillSlot as findSlot } from './SkillInputUtils';
import { SkillMpByLevel, SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel } from './SkillTuning';
import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import { applyHeroMagicShield, type HeroCombatModel } from './HeroCombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
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
  34, 95, 192, 253, 318, 444, 524, 687, 876, 1091, 1219, 1480, 1770,
  2092, 2444, 2831, 3058, 3500,
] as const;
const hmzZaDi = [
  209, 573, 1151, 1523, 1912, 2666, 3149, 4126, 5258, 6551, 7323, 8884,
  10623, 12551, 14671, 16992, 18350, 21006,
] as const;
export const Role4PoisonTuning = {
  mpScale: 26483 / 25958,
  zqMpFactor: 0.5,
  jdzMpFactor: 0.82,
  poisonDurationMs: 5_000,
  poisonTickMs: 1_000,
  poisonBombStackThreshold: 2,
  poisonBombHealRate: 0.15,
  poisonBombShieldMultiplier: 1.252,
  poisonBombShieldMs: 6_600,
  speedEffectMs: 3_000,
  actionMs: 900,
} as const;

export type Role4PoisonState = {
  stacks: number;
  remainingMs: number;
  tickCarryMs: number;
  damagePerSecond: number;
};

export type Role4PoisonSkillRuntime = {
  actionRemainingMs: number;
  mdsLevel: number;
  mbyjLevel: number;
  speedEffectRemainingMs: number;
  poisonByTarget: Record<string, Role4PoisonState>;
};

export type Role4PoisonTarget = {
  id: string;
  isAlive: boolean;
  applyDamage: (amount: number) => number;
};

export type Role4PoisonDamageEvent = {
  targetId: string;
  source: 'poison' | 'poison-bomb';
  amount: number;
  killed: boolean;
};

export function createRole4PoisonSkillRuntime(): Role4PoisonSkillRuntime {
  return {
    actionRemainingMs: 0,
    mdsLevel: 0,
    mbyjLevel: 1,
    speedEffectRemainingMs: 0,
    poisonByTarget: {},
  };
}

export function getRole4PoisonMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  const factor = binding.skillName === 'zq'
    ? Role4PoisonTuning.zqMpFactor
    : Role4PoisonTuning.jdzMpFactor;
  return Math.floor(SkillMpByLevel[index] * factor * Role4PoisonTuning.mpScale);
}

export function calculateRole4ZqDamage(
  level: number,
  sourcePower: number,
  weaponMode: 'shovel' | 'arrow',
): number {
  return 0.4 * calculateSkillBase(level, sourcePower) /
    (weaponMode === 'shovel' ? 2 : 1) * 1.154;
}

export function calculateRole4JdzDamage(level: number, sourcePower: number): number {
  return 0.7 * calculateSkillBase(level, sourcePower) / 60 * 1.154;
}

export function calculateRole4PoisonDamagePerSecond(level: number, sourcePower: number): number {
  return 0.2 * calculateSkillBase(level, sourcePower) / 5 * 1.8;
}

export function calculateRole4MdsBombDamage(params: {
  mdsLevel: number;
  mbyjLevel: number;
  sourcePower: number;
}): number {
  const index = clampLevel(params.mbyjLevel) - 1;
  const mdsIndex = clampLevel(params.mdsLevel) - 1;
  const fixed = getSkillFixedDamage(index) * SkillFixedDamageCount[index] * 1.05;
  const power = (SkillFactorBase + SkillFactorPerLevel * index) * 6201 / 5658 *
    Math.max(0, params.sourcePower);
  return 0.525 * (fixed + power) * 0.86 *
    (0.6 + 121 / 3655 * mdsIndex) * 1.525;
}

export function requestRole4PoisonSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 4) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (binding?.skillName !== 'zq' && binding?.skillName !== 'jdz') return undefined;
  const runtime = params.skill.role4Runtime;
  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    runtime.actionRemainingMs > 0
  ) {
    params.skill.lastResult = `role4 ${binding.skillName}: attacking`;
    return undefined;
  }
  if (binding.skillName === 'jdz' && !params.movement.grounded) {
    params.skill.lastResult = 'jdz requires ground';
    return undefined;
  }
  const mpCost = getRole4PoisonMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  runtime.actionRemainingMs = Role4PoisonTuning.actionMs;
  const point: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = binding.skillName === 'zq'
    ? castZq(params.projectiles, point, binding.level, params.sourcePower, params.normalAttack.weaponMode)
    : castJdz(params.projectiles, point, binding.level, params.sourcePower);
  params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}`;
  return {
    skillName: binding.skillName,
    slotIndex,
    actionName: binding.skillName === 'zq' ? 'hit4' : 'hit7',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function applyRole4PoisonProjectileHit(params: {
  runtime: Role4PoisonSkillRuntime;
  projectile: ProjectileModel;
  target: Role4PoisonTarget;
  hero: HeroCombatModel;
  sourcePower: number;
}): Role4PoisonDamageEvent | undefined {
  const poison = params.projectile.role4Poison;
  if (!poison || !params.target.isAlive) return undefined;
  return applyRole4PoisonStack({
    runtime: params.runtime,
    target: params.target,
    hero: params.hero,
    sourcePower: params.sourcePower,
    level: poison.level,
    durationMs: poison.durationMs,
    damagePerSecond: poison.damagePerSecond,
  });
}

export function applyRole4PoisonStack(params: {
  runtime: Role4PoisonSkillRuntime;
  target: Role4PoisonTarget;
  hero: HeroCombatModel;
  sourcePower: number;
  level: number;
  durationMs: number;
  damagePerSecond?: number;
}): Role4PoisonDamageEvent | undefined {
  if (!params.target.isAlive) return undefined;
  const state = params.runtime.poisonByTarget[params.target.id] ?? {
    stacks: 0,
    remainingMs: 0,
    tickCarryMs: 0,
    damagePerSecond: 0,
  };
  state.stacks += 1;
  state.remainingMs = Math.max(0, params.durationMs);
  state.damagePerSecond = Math.max(
    state.damagePerSecond,
    params.damagePerSecond ?? calculateRole4PoisonDamagePerSecond(params.level, params.sourcePower),
  );
  params.runtime.poisonByTarget[params.target.id] = state;
  if (
    params.runtime.mdsLevel <= 0 ||
    state.stacks <= Role4PoisonTuning.poisonBombStackThreshold
  ) return undefined;
  const amount = calculateRole4MdsBombDamage({
    mdsLevel: params.runtime.mdsLevel,
    mbyjLevel: params.runtime.mbyjLevel,
    sourcePower: params.sourcePower,
  });
  const applied = params.target.applyDamage(amount);
  const heal = Math.ceil(params.hero.maxHp * Role4PoisonTuning.poisonBombHealRate);
  params.hero.hp = Math.min(params.hero.maxHp, params.hero.hp + heal);
  applyHeroMagicShield(params.hero, {
    kind: 'role4Mds',
    sourceName: 'mds',
    initialAmount: heal * Role4PoisonTuning.poisonBombShieldMultiplier,
    remainingAmount: heal * Role4PoisonTuning.poisonBombShieldMultiplier,
    totalMs: Role4PoisonTuning.poisonBombShieldMs,
    remainingMs: Role4PoisonTuning.poisonBombShieldMs,
  });
  params.runtime.speedEffectRemainingMs = Role4PoisonTuning.speedEffectMs;
  return {
    targetId: params.target.id,
    source: 'poison-bomb',
    amount: applied,
    killed: !params.target.isAlive,
  };
}

export function updateRole4PoisonSkillRuntime(params: {
  runtime: Role4PoisonSkillRuntime;
  targets: readonly Role4PoisonTarget[];
  deltaMs: number;
}): Role4PoisonDamageEvent[] {
  const delta = Math.max(0, params.deltaMs);
  params.runtime.actionRemainingMs = Math.max(0, params.runtime.actionRemainingMs - delta);
  params.runtime.speedEffectRemainingMs = Math.max(0, params.runtime.speedEffectRemainingMs - delta);
  const targets = new Map(params.targets.map((target) => [target.id, target]));
  const events: Role4PoisonDamageEvent[] = [];
  for (const [targetId, poison] of Object.entries(params.runtime.poisonByTarget)) {
    const target = targets.get(targetId);
    if (!target?.isAlive) {
      delete params.runtime.poisonByTarget[targetId];
      continue;
    }
    const activeMs = Math.min(delta, poison.remainingMs);
    poison.remainingMs -= delta;
    poison.tickCarryMs += activeMs;
    while (poison.tickCarryMs >= Role4PoisonTuning.poisonTickMs && target.isAlive) {
      poison.tickCarryMs -= Role4PoisonTuning.poisonTickMs;
      const applied = target.applyDamage(poison.damagePerSecond);
      events.push({ targetId, source: 'poison', amount: applied, killed: !target.isAlive });
    }
    if (poison.remainingMs <= 0 || !target.isAlive) delete params.runtime.poisonByTarget[targetId];
  }
  return events;
}

function castZq(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  power: number,
  weaponMode: HeroNormalAttackModel['weaponMode'],
): ProjectileModel {
  const arrow = weaponMode === 'arrow';
  const projectile = spawnProjectileFromTuning(
    system,
    point,
    arrow ? 'role4-zq-arrow-hit4' : 'role4-zq-shovel-hit4',
    arrow ? 'role4-zq-arrow-hit4' : 'role4-zq-shovel-hit4',
    arrow ? zqArrowTuning : zqShovelTuning,
  );
  projectile.damage = calculateRole4ZqDamage(level, power, arrow ? 'arrow' : 'shovel');
  projectile.role4Poison = createPoisonPayload('zq', level, power);
  system.projectiles.push(projectile);
  return projectile;
}

function castJdz(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  power: number,
): ProjectileModel {
  const prelude = spawnProjectileFromTuning(
    system, point, 'role4-jdz-hit7-1', 'role4-jdz-hit7-1', jdzPreludeTuning,
  );
  const damageProjectiles = [0, -40, 40].map((extraOffset, index) => {
    const projectile = spawnProjectileFromTuning(
      system,
      point,
      'role4-jdz-hit7-2',
      `role4-jdz-hit7-2-${index + 1}`,
      { ...jdzDamageTuning, offsetX: jdzDamageTuning.offsetX + extraOffset },
    );
    projectile.damage = calculateRole4JdzDamage(level, power);
    projectile.role4Poison = createPoisonPayload('jdz', level, power);
    return projectile;
  });
  system.projectiles.push(prelude, ...damageProjectiles);
  return damageProjectiles[0];
}

function createPoisonPayload(skillName: 'zq' | 'jdz', level: number, power: number) {
  return {
    skillName,
    level: clampLevel(level),
    durationMs: Role4PoisonTuning.poisonDurationMs,
    damagePerSecond: calculateRole4PoisonDamagePerSecond(level, power),
  } as const;
}

const zqShovelTuning = {
  actionName: 'hit4', assetKey: SkillProjectileEffectKeys.role4ZqShovelHit4,
  sourceSymbol: 'Role4Bullet4', runtimeName: 'Role4Bullet4', offsetX: 245,
  offsetY: -110, speedX: 0, speedY: 0, distance: undefined, width: 300,
  height: 190, lifetimeMs: 760, damage: 0, attackKind: 'magic', knockbackX: 5,
  knockbackY: -3, hitIntervalFrames: 12, maxHits: 2,
} as const satisfies ProjectileTuning;

const zqArrowTuning = {
  actionName: 'hit4Arrow', assetKey: SkillProjectileEffectKeys.role4ZqArrowHit4,
  sourceSymbol: 'Role4BulletArrow4', runtimeName: 'Role4BulletArrow4', offsetX: 30,
  offsetY: 0, speedX: 0, speedY: 0, distance: undefined, width: 190,
  height: 150, lifetimeMs: 480, damage: 0, attackKind: 'magic', knockbackX: 5,
  knockbackY: -3, hitIntervalFrames: 999, maxHits: 1,
} as const satisfies ProjectileTuning;

const jdzPreludeTuning = {
  actionName: 'hit7_1', assetKey: SkillProjectileEffectKeys.role4JdzHit7_1,
  sourceSymbol: 'Role4Bullet7_1', runtimeName: 'Role4Bullet7_1', offsetX: 155,
  offsetY: -50, speedX: 0, speedY: 0, distance: undefined, width: 230,
  height: 180, lifetimeMs: 560, damage: 0, attackKind: 'magic', knockbackX: 0,
  knockbackY: -2, hitIntervalFrames: 999, maxHits: 0,
} as const satisfies ProjectileTuning;

const jdzDamageTuning = {
  actionName: 'hit7', assetKey: SkillProjectileEffectKeys.role4JdzHit7_2,
  sourceSymbol: 'Role4Bullet7_2', runtimeName: 'Role4Bullet7_2', offsetX: 150,
  offsetY: -70, speedX: 0, speedY: 0, distance: undefined, width: 180,
  height: 160, lifetimeMs: 1_200, damage: 0, attackKind: 'magic', knockbackX: 0,
  knockbackY: -2, hitIntervalFrames: 10, maxHits: 20,
} as const satisfies ProjectileTuning;

function calculateSkillBase(level: number, sourcePower: number): number {
  const index = clampLevel(level) - 1;
  return getSkillFixedDamage(index) * SkillFixedDamageCount[index] +
    (SkillFactorBase + SkillFactorPerLevel * index) * 6201 / 5658 * Math.max(0, sourcePower);
}

function getSkillFixedDamage(index: number): number {
  return hmzLianZhan[index] * 8 + hmzZaDi[index];
}





