import { clampSkillLevel as clampLevel } from './SkillMathUtils';
import { findJustPressedSkillSlot } from './SkillInputUtils';
import { SkillMpByLevel, SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel } from './SkillTuning';
import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from './HeroCombatSystem';
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
import { consumeRole3NextDamageMultiplier } from './Role3ControlSkillSystem';


const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;

const rjDefenseByLevel = [10, 30, 50, 90, 180, 300, 350, 400, 420, 450] as const;

export type Role3ShieldTier = 0 | 1 | 2 | 3;

export type Role3SkillRuntimeModel = {
  shieldTier: Role3ShieldTier;
  shieldRemainingMs: number;
  sdLevel: number;
  rjLevel: number;
  defenseBonus: number;
  actionRemainingMs: number;
  nextDamageMultiplier: number;
  pullEffects: Role3PullEffect[];
  sspLevel: number;
  mobility?: Role3MobilityEffect;
  ultimate?: Role3UltimateState;
  ultimateGuardRemainingMs: number;
};

export type Role3PullTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
  isImmune: boolean;
  setPosition(x: number, y: number): void;
  setSuspended(suspended: boolean): void;
};

export type Role3PullEffect = {
  target: Role3PullTarget;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  elapsedMs: number;
  durationMs: number;
};

export type Role3MobilityEffect = {
  kind: 'dgq' | 'xgq';
  movement: HeroMovementModel;
  spawnPoint: ProjectileSpawnPoint;
  skillLevel: number;
  sourcePower: number;
  damageMultiplier: number;
  elapsedMs: number;
  durationMs: number;
  damageSpawned: boolean;
};

export type Role3UltimateState = {
  stage: 'guard' | 'released';
  slotIndex: number;
  spawnPoint: ProjectileSpawnPoint;
  skillLevel: number;
  sourcePower: number;
  damageMultiplier: number;
};

export const Role3DefenseTuning = {
  mpScale: 22998 / 25958,
  djMpFactor: 0.6,
  sdMpFactor: 0.5,
  shieldDurationMs: 10_000,
  djActionMs: 650,
  sdActionMs: 800,
} as const;

const role3DjProjectileTuning = {
  actionName: 'hit4',
  assetKey: SkillProjectileEffectKeys.role3DjHit4,
  sourceSymbol: 'Role3Bullet4',
  runtimeName: 'Role3Bullet4',
  offsetX: 35,
  offsetY: -55,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 190,
  height: 130,
  lifetimeMs: 460,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 7,
  knockbackY: -3,
  hitIntervalFrames: 999,
  maxHits: 2,
} as const satisfies ProjectileTuning;

const role3SdEffectTuning = {
  actionName: 'hit5',
  assetKey: SkillProjectileEffectKeys.role3SdHit5,
  sourceSymbol: 'Role3Bullet5',
  runtimeName: 'Role3Bullet5',
  offsetX: 70,
  offsetY: -110,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 130,
  height: 150,
  lifetimeMs: 520,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 0,
} as const satisfies ProjectileTuning;

export function createRole3SkillRuntime(): Role3SkillRuntimeModel {
  return {
    shieldTier: 0,
    shieldRemainingMs: 0,
    sdLevel: 0,
    rjLevel: 0,
    defenseBonus: 0,
    actionRemainingMs: 0,
    nextDamageMultiplier: 1,
    pullEffects: [],
    sspLevel: 0,
    mobility: undefined,
    ultimate: undefined,
    ultimateGuardRemainingMs: 0,
  };
}

export function getRole3SkillMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, SkillMpByLevel.length) - 1;
  const factor = binding.skillName === 'dj'
    ? Role3DefenseTuning.djMpFactor
    : Role3DefenseTuning.sdMpFactor;
  return Math.floor(SkillMpByLevel[levelIndex] * factor * Role3DefenseTuning.mpScale);
}

export function calculateRole3DjDamage(skillLevel: number, sourcePower: number): number {
  const levelIndex = clampLevel(skillLevel, skillFixedDamage.length) - 1;
  const fixedPart = skillFixedDamage[levelIndex] * SkillFixedDamageCount[levelIndex] * 1.1;
  const powerPart = (SkillFactorBase + SkillFactorPerLevel * levelIndex)
    * 6201 / 6782 * Math.max(0, sourcePower);
  return Math.floor(0.6 * (fixedPart + powerPart) / 2) * 1.165;
}

export function syncRole3DefenseState(
  runtime: Role3SkillRuntimeModel,
  combat: HeroCombatModel,
  rjLevel: number,
): void {
  runtime.rjLevel = Math.min(10, Math.max(0, Math.floor(rjLevel)));
  runtime.defenseBonus = runtime.rjLevel > 0
    ? rjDefenseByLevel[runtime.rjLevel - 1]
    : 0;
  combat.role3DefenseBonus = runtime.defenseBonus;
  const defending = runtime.shieldTier > 0 || runtime.ultimateGuardRemainingMs > 0;
  combat.role3DamageReduction = defending
    ? Math.min(runtime.sdLevel, 8) * 0.01
    : 0;
  combat.role3KnockbackImmune = defending;
}

export function updateRole3DefenseRuntime(
  runtime: Role3SkillRuntimeModel,
  combat: HeroCombatModel,
  deltaMs: number,
): void {
  const elapsed = Math.max(0, deltaMs);
  runtime.actionRemainingMs = Math.max(0, runtime.actionRemainingMs - elapsed);
  runtime.ultimateGuardRemainingMs = Math.max(0, runtime.ultimateGuardRemainingMs - elapsed);
  if (runtime.ultimateGuardRemainingMs === 0) runtime.ultimate = undefined;
  if (runtime.shieldTier > 0) {
    runtime.shieldRemainingMs = Math.max(0, runtime.shieldRemainingMs - elapsed);
    if (runtime.shieldRemainingMs === 0) runtime.shieldTier = 0;
  }
  syncRole3DefenseState(runtime, combat, runtime.rjLevel);
}

export function tryRole3RjHealOnHit(params: {
  runtime: Role3SkillRuntimeModel;
  combat: HeroCombatModel;
  sourcePower: number;
  random?: () => number;
}): number {
  if (params.runtime.rjLevel <= 0 || params.combat.state === 'dead') return 0;
  const chance = 0.1 + params.runtime.rjLevel * 0.005;
  if ((params.random ?? Math.random)() > chance) return 0;
  const heal = Math.max(0, params.sourcePower) * 0.2;
  const hpBefore = params.combat.hp;
  params.combat.hp = Math.min(params.combat.maxHp, params.combat.hp + heal);
  return params.combat.hp - hpBefore;
}

export function requestRole3DefenseSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
}): HeroSkillCastEvent | undefined {
  const slotIndex = findJustPressedSkillSlot(params.input, params.previousInput);
  if (slotIndex === undefined || params.normalAttack.heroId !== 3) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (!binding || (binding.skillName !== 'dj' && binding.skillName !== 'sd')) return undefined;
  const runtime = params.skill.role3Runtime;
  if (params.combat.state !== 'ready' || params.normalAttack.activeAttack || runtime.actionRemainingMs > 0) {
    params.skill.lastResult = `slot ${slotIndex}: attacking`;
    return undefined;
  }
  const mpCost = getRole3SkillMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `slot ${slotIndex}: mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  const spawnPoint: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = binding.skillName === 'dj'
    ? spawnRole3Dj(params.projectiles, spawnPoint, binding.level, params.sourcePower)
    : spawnRole3Sd(params.projectiles, spawnPoint, params.skill.role3Runtime, binding.level);
  if (binding.skillName === 'dj') {
    projectile.damage *= consumeRole3NextDamageMultiplier(runtime);
  }
  runtime.actionRemainingMs = binding.skillName === 'dj'
    ? Role3DefenseTuning.djActionMs
    : Role3DefenseTuning.sdActionMs;
  params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}`;

  return {
    skillName: binding.skillName,
    slotIndex,
    actionName: binding.skillName === 'dj' ? 'hit4' : 'hit5',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function spawnRole3Dj(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  level: number,
  sourcePower: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system, spawnPoint, 'role3-dj-hit4', 'role3-dj-hit4', role3DjProjectileTuning,
  );
  projectile.damage = calculateRole3DjDamage(level, sourcePower);
  system.projectiles.push(projectile);
  return projectile;
}

function spawnRole3Sd(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  runtime: Role3SkillRuntimeModel,
  level: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system, spawnPoint, 'role3-sd-hit5', 'role3-sd-hit5', role3SdEffectTuning,
  );
  system.projectiles.push(projectile);
  runtime.shieldTier = (runtime.shieldTier % 3 + 1) as Role3ShieldTier;
  runtime.shieldRemainingMs = Role3DefenseTuning.shieldDurationMs;
  runtime.sdLevel = clampLevel(level, 18);
  return projectile;
}





