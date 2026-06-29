import { clampSkillLevel as clampLevel } from './SkillMathUtils';
import { findJustPressedSkillSlot as findSlot } from './SkillInputUtils';
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
import type { Role3SkillRuntimeModel } from './Role3DefenseSkillSystem';


const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;

const frameMs = 1000 / 60;

export const Role3MobilityTuning = {
  mpScale: 22998 / 25958,
  dgqMpFactor: 0.4,
  xgqMpFactor: 0.7,
  dgqSpeedPerFrame: 15,
  dgqDurationMs: 420,
  xgqDamageDelayMs: 300,
  xgqDurationMs: 900,
} as const;

const dgqTuning = {
  actionName: 'hit10', assetKey: SkillProjectileEffectKeys.role3DgqHit10,
  sourceSymbol: 'Role3Bullet10', runtimeName: 'Role3Bullet10',
  offsetX: 55, offsetY: -25, speedX: 0, speedY: 0, distance: undefined,
  width: 210, height: 140, lifetimeMs: 520, damage: 0,
  attackKind: 'magic', knockbackX: 15, knockbackY: -2,
  hitIntervalFrames: 7, maxHits: 5,
} as const satisfies ProjectileTuning;

const xgqCastTuning = {
  actionName: 'hit11', assetKey: SkillProjectileEffectKeys.role3XgqHit11Cast,
  sourceSymbol: 'Role3_hit11', runtimeName: 'Role3_hit11',
  offsetX: 0, offsetY: -50, speedX: 0, speedY: 0, distance: undefined,
  width: 100, height: 120, lifetimeMs: 320, damage: 0,
  attackKind: 'magic', knockbackX: 0, knockbackY: 0,
  hitIntervalFrames: 999, maxHits: 0,
} as const satisfies ProjectileTuning;

const xgqDamageTuning = {
  actionName: 'hit11', assetKey: SkillProjectileEffectKeys.role3XgqHit11,
  sourceSymbol: 'Role3Bullet11', runtimeName: 'Role3Bullet11',
  offsetX: 135, offsetY: -90, speedX: 0, speedY: 0, distance: undefined,
  width: 230, height: 170, lifetimeMs: 560, damage: 0,
  attackKind: 'magic', knockbackX: 0, knockbackY: 0,
  hitIntervalFrames: 7, maxHits: 4,
} as const satisfies ProjectileTuning;

export function getRole3MobilityMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  const factor = binding.skillName === 'dgq'
    ? Role3MobilityTuning.dgqMpFactor
    : Role3MobilityTuning.xgqMpFactor;
  return Math.floor(SkillMpByLevel[index] * factor * Role3MobilityTuning.mpScale);
}

export function calculateRole3DgqDamage(level: number, power: number): number {
  return calculateDamage(level, power, 0.45, 1, 5);
}

export function calculateRole3XgqDamage(level: number, power: number): number {
  return calculateDamage(level, power, 0.7, 1.05, 4);
}

export function isRole3XgqHidden(runtime: Role3SkillRuntimeModel): boolean {
  return runtime.mobility?.kind === 'xgq';
}

export function updateRole3Mobility(
  runtime: Role3SkillRuntimeModel,
  projectiles: ProjectileSystemModel,
  deltaMs: number,
): ProjectileModel[] {
  const effect = runtime.mobility;
  if (!effect) return [];
  const elapsed = Math.max(0, deltaMs);
  effect.elapsedMs += elapsed;
  const spawned: ProjectileModel[] = [];
  if (effect.kind === 'dgq') {
    effect.movement.x += effect.spawnPoint.facingX
      * Role3MobilityTuning.dgqSpeedPerFrame * (elapsed / frameMs);
    effect.movement.velocityX = 0;
  } else if (!effect.damageSpawned && effect.elapsedMs >= Role3MobilityTuning.xgqDamageDelayMs) {
    const projectile = spawnProjectileFromTuning(
      projectiles, effect.spawnPoint, 'role3-xgq-hit11', 'role3-xgq-hit11', xgqDamageTuning,
    );
    projectile.damage = calculateRole3XgqDamage(effect.skillLevel, effect.sourcePower)
      * effect.damageMultiplier;
    projectiles.projectiles.push(projectile);
    effect.damageSpawned = true;
    spawned.push(projectile);
  }
  if (effect.elapsedMs >= effect.durationMs) {
    effect.movement.velocityX = 0;
    runtime.mobility = undefined;
  }
  return spawned;
}

export function requestRole3MobilitySkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 3) return undefined;
  const slot = findSlot(params.input, params.previousInput);
  if (slot === undefined) return undefined;
  const binding = params.skill.loadout.slots[slot];
  if (!binding || (binding.skillName !== 'dgq' && binding.skillName !== 'xgq')) return undefined;
  const runtime = params.skill.role3Runtime;
  if (params.combat.state !== 'ready' || params.normalAttack.activeAttack || runtime.actionRemainingMs > 0) {
    params.skill.lastResult = 'role3 mobility: attacking';
    return undefined;
  }
  const cost = getRole3MobilityMpCost(binding);
  if (params.skill.mp < cost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${cost}`;
    return undefined;
  }
  const before = params.skill.mp;
  params.skill.mp -= cost;
  const point: ProjectileSpawnPoint = {
    sourceId: params.combat.id, x: params.movement.x, y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const multiplier = consumeRole3NextDamageMultiplier(runtime);
  const projectile = binding.skillName === 'dgq'
    ? spawnDgq(params.projectiles, point, binding.level, params.sourcePower, multiplier)
    : spawnProjectileFromTuning(params.projectiles, point, 'role3-xgq-cast', 'role3-xgq-cast', xgqCastTuning);
  if (binding.skillName === 'xgq') params.projectiles.projectiles.push(projectile);
  runtime.actionRemainingMs = binding.skillName === 'dgq'
    ? Role3MobilityTuning.dgqDurationMs
    : Role3MobilityTuning.xgqDurationMs;
  runtime.mobility = {
    kind: binding.skillName,
    movement: params.movement,
    spawnPoint: point,
    skillLevel: binding.level,
    sourcePower: params.sourcePower,
    damageMultiplier: multiplier,
    elapsedMs: 0,
    durationMs: runtime.actionRemainingMs,
    damageSpawned: binding.skillName === 'dgq',
  };
  params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}`;
  return {
    skillName: binding.skillName, slotIndex: slot,
    actionName: binding.skillName === 'dgq' ? 'hit10' : 'hit11',
    projectile, mpBefore: before, mpAfter: params.skill.mp, mpCost: cost, reentered: false,
  };
}

function spawnDgq(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  power: number,
  multiplier: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role3-dgq-hit10', 'role3-dgq-hit10', dgqTuning);
  projectile.damage = calculateRole3DgqDamage(level, power) * multiplier;
  system.projectiles.push(projectile);
  return projectile;
}

function calculateDamage(level: number, power: number, scale: number, fixedScale: number, hits: number): number {
  const index = clampLevel(level) - 1;
  const fixed = skillFixedDamage[index] * SkillFixedDamageCount[index] * fixedScale;
  const powerPart = (SkillFactorBase + SkillFactorPerLevel * index) * 6201 / 6782 * Math.max(0, power);
  return Math.floor(scale * (fixed + powerPart) / hits) * 1.165;
}





