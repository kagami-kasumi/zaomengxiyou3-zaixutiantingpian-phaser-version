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
import type {
  Role3PullEffect,
  Role3PullTarget,
  Role3SkillRuntimeModel,
} from './Role3DefenseSkillSystem';

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

export const Role3ControlTuning = {
  mpScale: 22998 / 25958,
  zznhMpFactor: 0.4,
  syzqMpFactor: 1,
  pullDurationMs: 1_800,
  actionMs: 850,
} as const;

const zznhEffectTuning = {
  actionName: 'hit6', assetKey: SkillProjectileEffectKeys.role3ZznhHit6,
  sourceSymbol: 'Role3Bullet6', runtimeName: 'Role3Bullet6',
  offsetX: 120, offsetY: -115, speedX: 0, speedY: 0, distance: undefined,
  width: 220, height: 180, lifetimeMs: 650, damage: 0,
  attackKind: 'physics', knockbackX: 0, knockbackY: 0,
  hitIntervalFrames: 5, maxHits: 0,
} as const satisfies ProjectileTuning;

const syzqStartTuning = {
  actionName: 'hit7_1', assetKey: SkillProjectileEffectKeys.role3SyzqHit7_1,
  sourceSymbol: 'Role3Bullet7_1', runtimeName: 'Role3Bullet7_1',
  offsetX: 140, offsetY: -160, speedX: 0, speedY: 0, distance: undefined,
  width: 160, height: 140, lifetimeMs: 360, damage: 0,
  attackKind: 'physics', knockbackX: 0, knockbackY: -2,
  hitIntervalFrames: 4, maxHits: 0,
} as const satisfies ProjectileTuning;

const syzqMoveTuning = {
  actionName: 'hit7_2', assetKey: SkillProjectileEffectKeys.role3SyzqHit7_2,
  sourceSymbol: 'Role3Bullet7_2', runtimeName: 'Role3Bullet7_2',
  offsetX: 135, offsetY: -145, speedX: 12, speedY: 0, distance: 999,
  width: 180, height: 130, lifetimeMs: 2_500, damage: 0,
  attackKind: 'physics', knockbackX: 15, knockbackY: -2,
  hitIntervalFrames: 7, maxHits: 11,
} as const satisfies ProjectileTuning;

export function getRole3ControlMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  const factor = binding.skillName === 'zznh'
    ? Role3ControlTuning.zznhMpFactor
    : Role3ControlTuning.syzqMpFactor;
  return Math.floor(consumeMpByLevel[index] * factor * Role3ControlTuning.mpScale);
}

export function getRole3ZznhDamageMultiplier(level: number): number {
  return 1.1 + 0.005 * (clampLevel(level) - 1);
}

export function consumeRole3NextDamageMultiplier(runtime: Role3SkillRuntimeModel): number {
  const multiplier = runtime.nextDamageMultiplier;
  runtime.nextDamageMultiplier = 1;
  return multiplier;
}

export function calculateRole3SyzqDamage(level: number, sourcePower: number): number {
  const index = clampLevel(level) - 1;
  const fixed = skillFixedDamage[index] * fixedDamageCount[index] * 1.05;
  const power = (skillFactorBase + skillFactorPerLevel * index)
    * 6201 / 6782 * Math.max(0, sourcePower);
  return Math.floor(0.8 * (fixed + power) / 11) * 1.165;
}

export function updateRole3PullEffects(runtime: Role3SkillRuntimeModel, deltaMs: number): void {
  const active: Role3PullEffect[] = [];
  for (const effect of runtime.pullEffects) {
    effect.elapsedMs += Math.max(0, deltaMs);
    const ratio = Math.min(1, effect.elapsedMs / effect.durationMs);
    if (effect.target.isAlive) {
      effect.target.setPosition(
        effect.startX + (effect.endX - effect.startX) * ratio,
        effect.startY + (effect.endY - effect.startY) * ratio,
      );
    }
    if (ratio >= 1 || !effect.target.isAlive) effect.target.setSuspended(false);
    else active.push(effect);
  }
  runtime.pullEffects = active;
}

export function requestRole3ControlSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  targets: readonly Role3PullTarget[];
}): HeroSkillCastEvent | undefined {
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined || params.normalAttack.heroId !== 3) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (!binding || (binding.skillName !== 'zznh' && binding.skillName !== 'syzq')) return undefined;
  const runtime = params.skill.role3Runtime;
  if (params.combat.state !== 'ready' || params.normalAttack.activeAttack || runtime.actionRemainingMs > 0) {
    params.skill.lastResult = `slot ${slotIndex}: attacking`;
    return undefined;
  }
  const mpCost = getRole3ControlMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `slot ${slotIndex}: mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  runtime.actionRemainingMs = Role3ControlTuning.actionMs;
  const point: ProjectileSpawnPoint = {
    sourceId: params.combat.id, x: params.movement.x, y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = binding.skillName === 'zznh'
    ? castZznh(params.projectiles, point, runtime, binding.level, params.targets)
    : castSyzq(
      params.projectiles,
      point,
      binding.level,
      params.sourcePower,
      consumeRole3NextDamageMultiplier(runtime),
    );
  params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}`;
  return {
    skillName: binding.skillName, slotIndex,
    actionName: binding.skillName === 'zznh' ? 'hit6' : 'hit7',
    projectile, mpBefore, mpAfter: params.skill.mp, mpCost, reentered: false,
  };
}

function castZznh(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  runtime: Role3SkillRuntimeModel,
  level: number,
  targets: readonly Role3PullTarget[],
): ProjectileModel {
  const effect = spawnProjectileFromTuning(system, point, 'role3-zznh-hit6', 'role3-zznh-hit6', zznhEffectTuning);
  system.projectiles.push(effect);
  runtime.nextDamageMultiplier = getRole3ZznhDamageMultiplier(level);
  runtime.pullEffects = targets.filter((target) => target.isAlive && !target.isImmune).map((target) => {
    target.setSuspended(true);
    return {
      target, startX: target.x, startY: target.y,
      endX: point.x, endY: point.y - 100,
      elapsedMs: 0, durationMs: Role3ControlTuning.pullDurationMs,
    };
  });
  return effect;
}

function castSyzq(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  sourcePower: number,
  damageMultiplier: number,
): ProjectileModel {
  const start = spawnProjectileFromTuning(system, point, 'role3-syzq-hit7-1', 'role3-syzq-hit7-1', syzqStartTuning);
  const moving = spawnProjectileFromTuning(system, point, 'role3-syzq-hit7-2', 'role3-syzq-hit7-2', syzqMoveTuning);
  moving.damage = calculateRole3SyzqDamage(level, sourcePower) * damageMultiplier;
  system.projectiles.push(start, moving);
  return moving;
}

function findSlot(input: PlayerInputState, previous: PlayerInputState | undefined): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slot) => pressed && !(previous?.skillSlots[slot] ?? false));
  return index >= 0 ? index : undefined;
}

function clampLevel(level: number): number {
  return Math.min(18, Math.max(1, Math.floor(level)));
}
