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

const consumeMpByLevel = [
  66, 160, 208, 276, 364, 493, 703, 759, 801,
  921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
] as const;
const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;
const fixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;
const skillFactorBase = 0.3407 * 8 + 2.075;
const skillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;
const frameMs = 1000 / 60;

export type Role3UltimateTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
};

export const Role3UltimateTuning = {
  mpScale: 22998 / 25958,
  mpFactor: 1.2,
  guardDurationMs: 2_200,
  secondStageDurationMs: 700,
  projectileCount: 10,
  ringRadius: 100,
  travelMs: 300,
  zznhHurtAddMultiplier: 1.3,
} as const;

const guardTuning = {
  actionName: 'hit12_1', assetKey: SkillProjectileEffectKeys.role3TmcHit12_1,
  sourceSymbol: 'Role3Bullet12_1', runtimeName: 'Role3Bullet12_1',
  offsetX: 0, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
  width: 160, height: 190, lifetimeMs: 2_200, damage: 0,
  attackKind: 'physics', knockbackX: 0, knockbackY: 0,
  hitIntervalFrames: 999, maxHits: 0,
} as const satisfies ProjectileTuning;

const stabTuning = {
  actionName: 'hit12', assetKey: SkillProjectileEffectKeys.role3TmcHit12_2,
  sourceSymbol: 'Role3Bullet12_2', runtimeName: 'Role3Bullet12_2',
  offsetX: 0, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
  width: 72, height: 120, lifetimeMs: 600, damage: 0,
  attackKind: 'physics', knockbackX: 0, knockbackY: 0,
  hitIntervalFrames: 999, maxHits: 1,
} as const satisfies ProjectileTuning;

export function getRole3TmcMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  return Math.floor(consumeMpByLevel[index] * Role3UltimateTuning.mpFactor * Role3UltimateTuning.mpScale);
}

export function calculateRole3TmcDamage(level: number, power: number): number {
  const index = clampLevel(level) - 1;
  const fixed = skillFixedDamage[index] * fixedDamageCount[index] * 1.075;
  const powerPart = (skillFactorBase + skillFactorPerLevel * index) * 6201 / 6782 * Math.max(0, power);
  return Math.floor(1.22 * (fixed + powerPart) / 10) * 1.165;
}

export function requestRole3UltimateSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  targets: readonly Role3UltimateTarget[];
  random?: () => number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 3) return undefined;
  const slot = findSlot(params.input, params.previousInput);
  if (slot === undefined) return undefined;
  const binding = params.skill.loadout.slots[slot];
  if (!binding || binding.skillName !== 'tmc') return undefined;
  const runtime = params.skill.role3Runtime;
  if (runtime.ultimate?.stage === 'guard' && runtime.ultimate.slotIndex === slot) {
    const mpBefore = params.skill.mp;
    const projectiles = spawnStabRing(
      params.projectiles,
      runtime.ultimate.spawnPoint,
      runtime.ultimate.skillLevel,
      runtime.ultimate.sourcePower,
      runtime.ultimate.damageMultiplier,
      params.targets,
      params.random,
    );
    runtime.ultimate.stage = 'released';
    runtime.actionRemainingMs = Role3UltimateTuning.secondStageDurationMs;
    runtime.ultimateGuardRemainingMs = Role3UltimateTuning.secondStageDurationMs;
    params.combat.role3DamageReduction = Math.min(runtime.sdLevel, 8) * 0.01;
    params.combat.role3KnockbackImmune = true;
    params.skill.lastResult = 'tmc second stage';
    return {
      skillName: 'tmc', slotIndex: slot, actionName: 'hit12',
      projectile: projectiles[0]!, mpBefore, mpAfter: mpBefore, mpCost: 0, reentered: true,
    };
  }
  if (params.combat.state !== 'ready' || params.normalAttack.activeAttack || runtime.actionRemainingMs > 0) {
    params.skill.lastResult = 'tmc attacking';
    return undefined;
  }
  const cost = getRole3TmcMpCost(binding);
  if (params.skill.mp < cost) {
    params.skill.lastResult = `tmc mp ${params.skill.mp}/${cost}`;
    return undefined;
  }
  const before = params.skill.mp;
  params.skill.mp -= cost;
  const point: ProjectileSpawnPoint = {
    sourceId: params.combat.id, x: params.movement.x, y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const guard = spawnProjectileFromTuning(params.projectiles, point, 'role3-tmc-hit12-1', 'role3-tmc-hit12-1', guardTuning);
  params.projectiles.projectiles.push(guard);
  runtime.ultimate = {
    stage: 'guard', slotIndex: slot, spawnPoint: point,
    skillLevel: binding.level, sourcePower: params.sourcePower,
    damageMultiplier: consumeRole3NextDamageMultiplier(runtime),
  };
  runtime.actionRemainingMs = Role3UltimateTuning.guardDurationMs;
  runtime.ultimateGuardRemainingMs = Role3UltimateTuning.guardDurationMs;
  params.combat.role3DamageReduction = Math.min(runtime.sdLevel, 8) * 0.01;
  params.combat.role3KnockbackImmune = true;
  params.skill.lastResult = `tmc guard mp ${params.skill.mp}`;
  return {
    skillName: 'tmc', slotIndex: slot, actionName: 'hit12', projectile: guard,
    mpBefore: before, mpAfter: params.skill.mp, mpCost: cost, reentered: false,
  };
}

function spawnStabRing(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  power: number,
  queuedMultiplier: number,
  targets: readonly Role3UltimateTarget[],
  random: (() => number) | undefined,
): ProjectileModel[] {
  const living = targets.filter((target) => target.isAlive);
  const roll = (random ?? Math.random)();
  const target = living.length > 0
    ? living[Math.min(living.length - 1, Math.floor(roll * living.length))]!
    : { id: 'fallback', x: point.x + 1, y: point.y + 300, isAlive: true };
  const boosted = queuedMultiplier > 1;
  const damageMultiplier = queuedMultiplier * (boosted ? Role3UltimateTuning.zznhHurtAddMultiplier : 1);
  const damage = calculateRole3TmcDamage(level, power) * damageMultiplier;
  const travelFrames = Role3UltimateTuning.travelMs / frameMs;
  const projectiles: ProjectileModel[] = [];
  for (let index = 0; index < Role3UltimateTuning.projectileCount; index += 1) {
    const angle = 2 * Math.PI * index / Role3UltimateTuning.projectileCount;
    const projectile = spawnProjectileFromTuning(system, point, 'role3-tmc-hit12-2', `role3-tmc-hit12-2-${index}`, stabTuning);
    projectile.x = point.x + Math.sin(angle) * Role3UltimateTuning.ringRadius;
    projectile.y = point.y - Math.cos(angle) * Role3UltimateTuning.ringRadius;
    projectile.velocityX = (target.x - projectile.x) / travelFrames;
    projectile.velocityY = (target.y - projectile.y) / travelFrames;
    projectile.trackingTargetId = target.id;
    projectile.damage = damage;
    system.projectiles.push(projectile);
    projectiles.push(projectile);
  }
  return projectiles;
}

function findSlot(input: PlayerInputState, previous: PlayerInputState | undefined): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slot) => pressed && !(previous?.skillSlots[slot] ?? false));
  return index >= 0 ? index : undefined;
}

function clampLevel(level: number): number {
  return Math.min(18, Math.max(1, Math.floor(level)));
}
