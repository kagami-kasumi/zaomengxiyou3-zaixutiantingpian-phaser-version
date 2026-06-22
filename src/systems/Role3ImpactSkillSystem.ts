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

export const Role3ImpactTuning = {
  mpScale: 22998 / 25958,
  sspMpFactor: 0.55,
  jspMpFactor: 0.65,
  comboMpCost: 20,
  jspStunChance: 0.1,
  jspStunMs: 2_000,
  actionMs: 900,
} as const;

const sspLiftTuning = {
  actionName: 'hit8_1', assetKey: SkillProjectileEffectKeys.role3SspHit8_1,
  sourceSymbol: 'Role3Bullet8_1', runtimeName: 'Role3Bullet8_1',
  offsetX: 95, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
  width: 150, height: 180, lifetimeMs: 360, damage: 0,
  attackKind: 'magic', knockbackX: 2, knockbackY: -22,
  hitIntervalFrames: 2, maxHits: 0,
} as const satisfies ProjectileTuning;

const sspDamageTuning = {
  actionName: 'hit8_2', assetKey: SkillProjectileEffectKeys.role3SspHit8_2,
  sourceSymbol: 'Role3Bullet8_2', runtimeName: 'Role3Bullet8_2',
  offsetX: -20, offsetY: -20, speedX: 0, speedY: 0, distance: undefined,
  width: 230, height: 190, lifetimeMs: 620, damage: 0,
  attackKind: 'magic', knockbackX: 10, knockbackY: -4,
  hitIntervalFrames: 8, maxHits: 4,
} as const satisfies ProjectileTuning;

const jspTuning = {
  actionName: 'hit9', assetKey: SkillProjectileEffectKeys.role3JspHit9,
  sourceSymbol: 'Role3Bullet9', runtimeName: 'Role3Bullet9',
  offsetX: 195, offsetY: -160, speedX: 0, speedY: 0, distance: undefined,
  width: 250, height: 190, lifetimeMs: 720, damage: 0,
  attackKind: 'physics', knockbackX: 1, knockbackY: -4,
  hitIntervalFrames: 7, maxHits: 3,
} as const satisfies ProjectileTuning;

export function isRole3SspComboRequested(params: {
  heroId: number;
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
}): boolean {
  return params.heroId === 3 &&
    params.skill.role3Runtime.sspLevel > 0 &&
    params.skill.mp >= Role3ImpactTuning.comboMpCost &&
    params.input.up && params.input.attack &&
    !(params.previousInput?.attack ?? false);
}

export function getRole3ImpactMpCost(binding: SkillBinding): number {
  const index = clampLevel(binding.level) - 1;
  const factor = binding.skillName === 'ssp'
    ? Role3ImpactTuning.sspMpFactor
    : Role3ImpactTuning.jspMpFactor;
  return Math.floor(consumeMpByLevel[index] * factor * Role3ImpactTuning.mpScale);
}

export function calculateRole3SspDamage(level: number, sourcePower: number): number {
  return calculateDamage(level, sourcePower, 0.62, 1.1, 4);
}

export function calculateRole3JspDamage(level: number, sourcePower: number): number {
  return calculateDamage(level, sourcePower, 0.7, 1.08, 3);
}

export function requestRole3ImpactSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  random?: () => number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 3) return undefined;
  const combo = isRole3SspComboRequested({
    heroId: params.normalAttack.heroId,
    skill: params.skill,
    input: params.input,
    previousInput: params.previousInput,
  });
  const slotIndex = findSlot(params.input, params.previousInput);
  const binding = slotIndex === undefined ? undefined : params.skill.loadout.slots[slotIndex];
  const isSlotSkill = binding?.skillName === 'ssp' || binding?.skillName === 'jsp';
  if (!combo && !isSlotSkill) return undefined;
  if (params.combat.state !== 'ready' || params.normalAttack.activeAttack || params.skill.role3Runtime.actionRemainingMs > 0) {
    params.skill.lastResult = 'role3 impact: attacking';
    return undefined;
  }
  const skillName = combo ? 'ssp' : binding!.skillName as 'ssp' | 'jsp';
  const level = combo ? params.skill.role3Runtime.sspLevel : binding!.level;
  if (!combo && skillName === 'ssp' && !params.movement.grounded) {
    params.skill.lastResult = 'ssp requires ground';
    return undefined;
  }
  const mpCost = combo ? Role3ImpactTuning.comboMpCost : getRole3ImpactMpCost(binding!);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }
  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  params.skill.role3Runtime.actionRemainingMs = Role3ImpactTuning.actionMs;
  const point: ProjectileSpawnPoint = {
    sourceId: params.combat.id, x: params.movement.x, y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = skillName === 'ssp'
    ? castSsp(params.projectiles, point, level, params.sourcePower, params.skill)
    : castJsp(params.projectiles, point, level, params.sourcePower, params.skill, params.random);
  params.skill.lastResult = `${skillName}${combo ? '-combo' : ''} mp ${params.skill.mp}`;
  return {
    skillName, slotIndex: combo ? -1 : slotIndex!, actionName: skillName === 'ssp' ? 'hit8' : 'hit9',
    projectile, mpBefore, mpAfter: params.skill.mp, mpCost, reentered: combo,
  };
}

function castSsp(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  power: number,
  skill: HeroSkillModel,
): ProjectileModel {
  const lift = spawnProjectileFromTuning(system, point, 'role3-ssp-hit8-1', 'role3-ssp-hit8-1', sspLiftTuning);
  const damage = spawnProjectileFromTuning(system, point, 'role3-ssp-hit8-2', 'role3-ssp-hit8-2', sspDamageTuning);
  damage.damage = calculateRole3SspDamage(level, power) * consumeRole3NextDamageMultiplier(skill.role3Runtime);
  system.projectiles.push(lift, damage);
  return damage;
}

function castJsp(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  level: number,
  power: number,
  skill: HeroSkillModel,
  random: (() => number) | undefined,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role3-jsp-hit9', 'role3-jsp-hit9', jspTuning);
  projectile.damage = calculateRole3JspDamage(level, power) * consumeRole3NextDamageMultiplier(skill.role3Runtime);
  if ((random ?? Math.random)() < Role3ImpactTuning.jspStunChance) {
    projectile.magicStunMs = Role3ImpactTuning.jspStunMs;
  }
  system.projectiles.push(projectile);
  return projectile;
}

function calculateDamage(level: number, power: number, scale: number, fixedScale: number, hits: number): number {
  const index = clampLevel(level) - 1;
  const fixed = skillFixedDamage[index] * fixedDamageCount[index] * fixedScale;
  const powerPart = (skillFactorBase + skillFactorPerLevel * index) * 6201 / 6782 * Math.max(0, power);
  return Math.floor(scale * (fixed + powerPart) / hits) * 1.165;
}

function findSlot(input: PlayerInputState, previous: PlayerInputState | undefined): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slot) => pressed && !(previous?.skillSlots[slot] ?? false));
  return index >= 0 ? index : undefined;
}

function clampLevel(level: number): number {
  return Math.min(18, Math.max(1, Math.floor(level)));
}
