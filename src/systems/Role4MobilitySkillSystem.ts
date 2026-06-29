import { clampSkillLevel as clampLevel } from './SkillMathUtils';
import { findJustPressedSkillSlot as findSlot } from './SkillInputUtils';
import { SkillMpByLevel, SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel } from './SkillTuning';
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


export type Role4MobilitySkillName = 'qlj' | 'tkj' | 'dzj';
export type Role4MobilityWeaponMode = 'shovel' | 'arrow';

export const Role4MobilitySkillTuning = {
  mpScale: 26483 / 25958,
  mpFactors: { qlj: 0.55, tkj: 0.55, dzj: 0.82 },
  qljExtraMp: 15,
  actionMs: {
    shovel: { qlj: 583, tkj: 556, dzj: 944 },
    arrow: { qlj: 500, tkj: 833, dzj: 1_000 },
  },
  activeAfterMs: {
    shovel: { qlj: 167, tkj: 472, dzj: 56 },
    arrow: { qlj: 56, tkj: 111, dzj: 972 },
  },
  qljArrowLeapMs: 56,
  qljArrowVelocityX: 2_500,
  qljArrowVelocityY: -2_500,
  tkjShovelRiseFromMs: 111,
  tkjShovelVelocityY: -1_000,
  tkjArrowRiseMs: 111,
  tkjArrowVelocityY: -3_500,
  dzjShovelDashMs: 111,
  dzjShovelVelocityX: 2_000,
} as const;

export type Role4FollowProjectile = {
  projectileId: number;
  offsetX: number;
  offsetY: number;
};

export type Role4MobilityAction = {
  skillName: Role4MobilitySkillName;
  weaponMode: Role4MobilityWeaponMode;
  facingX: -1 | 1;
  elapsedMs: number;
  durationMs: number;
  followProjectiles: Role4FollowProjectile[];
};

export type Role4MobilitySkillRuntime = {
  active?: Role4MobilityAction;
};

export function createRole4MobilitySkillRuntime(): Role4MobilitySkillRuntime {
  return {};
}

export function getRole4MobilityMpCost(binding: SkillBinding): number {
  if (!isRole4MobilitySkillName(binding.skillName)) return 0;
  const index = clampLevel(binding.level) - 1;
  const dynamic = Math.floor(
    SkillMpByLevel[index] * Role4MobilitySkillTuning.mpFactors[binding.skillName] *
      Role4MobilitySkillTuning.mpScale,
  );
  return dynamic + (binding.skillName === 'qlj' ? Role4MobilitySkillTuning.qljExtraMp : 0);
}

export function calculateRole4MobilityDamage(
  skillName: Role4MobilitySkillName,
  level: number,
  sourcePower: number,
  weaponMode: Role4MobilityWeaponMode,
): number {
  const totalCoefficient = skillName === 'qlj' ? 0.6 : skillName === 'tkj' ? 0.7 : 0.79;
  const hitCount = skillName === 'tkj'
    ? (weaponMode === 'arrow' ? 5 : 1)
    : skillName === 'dzj'
      ? (weaponMode === 'shovel' ? 5 : 1)
      : 1;
  return totalCoefficient * calculateSkillBase(level, sourcePower) / hitCount * 1.154;
}

export function requestRole4MobilitySkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  timeMs: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 4) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (!binding || !isRole4MobilitySkillName(binding.skillName)) return undefined;
  if (
    params.combat.state !== 'ready' || params.normalAttack.activeAttack ||
    params.skill.role4Runtime.actionRemainingMs > 0 || params.skill.role4MobilityRuntime.active
  ) {
    params.skill.lastResult = `role4 ${binding.skillName}: attacking`;
    return undefined;
  }

  const dynamicMpCost = getDynamicMpCost(binding);
  if (params.skill.mp < dynamicMpCost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${dynamicMpCost}`;
    return undefined;
  }
  const mpCost = dynamicMpCost +
    (binding.skillName === 'qlj' ? Role4MobilitySkillTuning.qljExtraMp : 0);
  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);

  const weaponMode: Role4MobilityWeaponMode = params.normalAttack.weaponMode === 'arrow'
    ? 'arrow'
    : 'shovel';
  const durationMs = Role4MobilitySkillTuning.actionMs[weaponMode][binding.skillName];
  params.skill.role4Runtime.actionRemainingMs = durationMs;
  const spawnPoint: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const spawned = spawnSkillProjectiles(
    params.projectiles,
    spawnPoint,
    binding.skillName,
    weaponMode,
    binding.level,
    params.sourcePower,
    durationMs,
  );
  const action: Role4MobilityAction = {
    skillName: binding.skillName,
    weaponMode,
    facingX: params.movement.facingX,
    elapsedMs: 0,
    durationMs,
    followProjectiles: spawned.followProjectiles,
  };
  params.skill.role4MobilityRuntime.active = action;
  if (!(binding.skillName === 'qlj' && weaponMode === 'shovel')) {
    lockHeroMovementForSkill(params.movement, params.timeMs, durationMs, true);
  }
  params.skill.lastResult = `${binding.skillName}-${weaponMode} mp ${params.skill.mp}`;
  return {
    skillName: binding.skillName,
    slotIndex,
    actionName: binding.skillName === 'qlj' ? 'hit8' : binding.skillName === 'tkj' ? 'hit9' : 'hit10',
    projectile: spawned.primary,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function updateRole4MobilitySkill(params: {
  runtime: Role4MobilitySkillRuntime;
  movement: HeroMovementModel;
  projectiles: ProjectileSystemModel;
  deltaMs: number;
}): void {
  const action = params.runtime.active;
  if (!action) return;
  const previousElapsed = action.elapsedMs;
  action.elapsedMs = Math.min(action.durationMs, action.elapsedMs + Math.max(0, params.deltaMs));
  applyScriptedMovement(action, params.movement, previousElapsed, action.elapsedMs);
  syncFollowProjectiles(action, params.movement, params.projectiles);
  if (action.elapsedMs < action.durationMs) return;
  params.movement.velocityX = 0;
  params.movement.velocityY = 0;
  params.runtime.active = undefined;
}

function spawnSkillProjectiles(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  skillName: Role4MobilitySkillName,
  weaponMode: Role4MobilityWeaponMode,
  level: number,
  power: number,
  actionMs: number,
): { primary: ProjectileModel; followProjectiles: Role4FollowProjectile[] } {
  const damage = calculateRole4MobilityDamage(skillName, level, power, weaponMode);
  const delay = Role4MobilitySkillTuning.activeAfterMs[weaponMode][skillName];
  const created: ProjectileModel[] = [];
  const follows: Role4FollowProjectile[] = [];
  const spawn = (
    variant: Parameters<typeof spawnProjectileFromTuning>[2],
    tuning: ProjectileTuning,
    visualOnly: boolean,
    follow = false,
  ) => {
    const projectile = spawnProjectileFromTuning(system, point, variant, variant, {
      ...tuning,
      lifetimeMs: actionMs,
    });
    projectile.visualOnly = visualOnly;
    if (!visualOnly) {
      projectile.damage = damage;
      projectile.activeAfterMs = delay;
    }
    system.projectiles.push(projectile);
    created.push(projectile);
    if (follow) follows.push({
      projectileId: projectile.id,
      offsetX: tuning.offsetX,
      offsetY: tuning.offsetY,
    });
    return projectile;
  };

  if (skillName === 'qlj' && weaponMode === 'shovel') {
    spawn('role4-qlj-shovel-hit8', qljShovelTuning, false, true);
  } else if (skillName === 'qlj') {
    spawn('role4-qlj-arrow-hit8-1', qljArrowPreludeTuning, true, true);
    spawn('role4-qlj-arrow-hit8-2', qljArrowDamageTuning, false);
  } else if (skillName === 'tkj' && weaponMode === 'shovel') {
    spawn('role4-tkj-shovel-hit9-1', tkjShovelPreludeTuning, true, true);
    spawn('role4-tkj-shovel-hit9-2', tkjShovelDamageTuning, false, true);
  } else if (skillName === 'tkj') {
    spawn('role4-tkj-arrow-hit9-1', tkjArrowPreludeTuning, true, true);
    spawn('role4-tkj-arrow-hit9-2', tkjArrowDamageTuning, false, true);
  } else if (weaponMode === 'shovel') {
    spawn('role4-dzj-shovel-hit10', dzjShovelTuning, false);
  } else {
    spawn('role4-dzj-arrow-hit10-1', dzjArrowPreludeTuning, true, true);
    spawn('role4-dzj-arrow-hit10-2', dzjArrowDamageTuning, false);
  }
  return { primary: created.find((projectile) => !projectile.visualOnly)!, followProjectiles: follows };
}

function applyScriptedMovement(
  action: Role4MobilityAction,
  movement: HeroMovementModel,
  fromMs: number,
  toMs: number,
): void {
  if (action.skillName === 'qlj' && action.weaponMode === 'arrow') {
    const seconds = phaseDuration(fromMs, toMs, 0, Role4MobilitySkillTuning.qljArrowLeapMs) / 1_000;
    movement.x -= action.facingX * Role4MobilitySkillTuning.qljArrowVelocityX * seconds;
    movement.y += Role4MobilitySkillTuning.qljArrowVelocityY * seconds;
    if (seconds > 0) movement.grounded = false;
  } else if (action.skillName === 'tkj') {
    const start = action.weaponMode === 'shovel' ? Role4MobilitySkillTuning.tkjShovelRiseFromMs : 0;
    const end = action.weaponMode === 'shovel' ? action.durationMs : Role4MobilitySkillTuning.tkjArrowRiseMs;
    const velocityY = action.weaponMode === 'shovel'
      ? Role4MobilitySkillTuning.tkjShovelVelocityY
      : Role4MobilitySkillTuning.tkjArrowVelocityY;
    const seconds = phaseDuration(fromMs, toMs, start, end) / 1_000;
    movement.y += velocityY * seconds;
    if (seconds > 0) movement.grounded = false;
  } else if (action.skillName === 'dzj' && action.weaponMode === 'shovel') {
    const seconds = phaseDuration(fromMs, toMs, 0, Role4MobilitySkillTuning.dzjShovelDashMs) / 1_000;
    movement.x += action.facingX * Role4MobilitySkillTuning.dzjShovelVelocityX * seconds;
  }
}

function syncFollowProjectiles(
  action: Role4MobilityAction,
  movement: HeroMovementModel,
  system: ProjectileSystemModel,
): void {
  for (const follow of action.followProjectiles) {
    const projectile = system.projectiles.find((item) => item.id === follow.projectileId);
    if (!projectile) continue;
    projectile.x = movement.x + follow.offsetX * action.facingX;
    projectile.y = movement.y + follow.offsetY;
  }
}

function phaseDuration(fromMs: number, toMs: number, startMs: number, endMs: number): number {
  return Math.max(0, Math.min(toMs, endMs) - Math.max(fromMs, startMs));
}

function getDynamicMpCost(binding: SkillBinding): number {
  if (!isRole4MobilitySkillName(binding.skillName)) return 0;
  const index = clampLevel(binding.level) - 1;
  return Math.floor(SkillMpByLevel[index] *
    Role4MobilitySkillTuning.mpFactors[binding.skillName] * Role4MobilitySkillTuning.mpScale);
}

function calculateSkillBase(level: number, sourcePower: number): number {
  const index = clampLevel(level) - 1;
  return (hmzLianZhan[index] * 8 + hmzZaDi[index]) * SkillFixedDamageCount[index] +
    (SkillFactorBase + SkillFactorPerLevel * index) * 6201 / 5658 * Math.max(0, sourcePower);
}

function isRole4MobilitySkillName(skillName: string): skillName is Role4MobilitySkillName {
  return skillName === 'qlj' || skillName === 'tkj' || skillName === 'dzj';
}



const base = {
  speedX: 0, speedY: 0, distance: undefined, damage: 0, attackKind: 'magic',
  hitIntervalFrames: 999,
} as const;
const qljShovelTuning = {
  ...base, actionName: 'hit8', assetKey: SkillProjectileEffectKeys.role4QljShovelHit8,
  sourceSymbol: 'Role4Bullet8', runtimeName: 'Role4Bullet8', offsetX: 125, offsetY: -30,
  width: 250, height: 170, lifetimeMs: 583, knockbackX: 30, knockbackY: -2, maxHits: 1,
} as const satisfies ProjectileTuning;
const qljArrowPreludeTuning = {
  ...base, actionName: 'hit8', assetKey: SkillProjectileEffectKeys.role4QljArrowHit8_1,
  sourceSymbol: 'Role4BulletArrow8_1', runtimeName: 'Role4BulletArrow8_1', offsetX: 75,
  offsetY: -60, width: 190, height: 160, lifetimeMs: 500, knockbackX: 0,
  knockbackY: 0, maxHits: 1,
} as const satisfies ProjectileTuning;
const qljArrowDamageTuning = {
  ...base, actionName: 'hit8Arrow', assetKey: SkillProjectileEffectKeys.role4QljArrowHit8_2,
  sourceSymbol: 'Role4BulletArrow8_2', runtimeName: 'Role4BulletArrow8_2', offsetX: 65,
  offsetY: -10, width: 210, height: 160, lifetimeMs: 500, knockbackX: 30,
  knockbackY: -2, maxHits: 1,
} as const satisfies ProjectileTuning;
const tkjShovelPreludeTuning = {
  ...base, actionName: 'hit9', assetKey: SkillProjectileEffectKeys.role4TkjShovelHit9_1,
  sourceSymbol: 'Role4Bullet9_1', runtimeName: 'Role4Bullet9_1', offsetX: 0, offsetY: 0,
  width: 170, height: 170, lifetimeMs: 556, knockbackX: 0, knockbackY: 0, maxHits: 1,
} as const satisfies ProjectileTuning;
const tkjShovelDamageTuning = {
  ...base, actionName: 'hit9', assetKey: SkillProjectileEffectKeys.role4TkjShovelHit9_2,
  sourceSymbol: 'Role4Bullet9_2', runtimeName: 'Role4Bullet9_2', offsetX: 0, offsetY: -80,
  width: 190, height: 190, lifetimeMs: 556, knockbackX: 15, knockbackY: -25, maxHits: 1,
} as const satisfies ProjectileTuning;
const tkjArrowPreludeTuning = {
  ...base, actionName: 'hit9', assetKey: SkillProjectileEffectKeys.role4TkjArrowHit9_1,
  sourceSymbol: 'Role4BulletArrow9_1', runtimeName: 'Role4BulletArrow9_1', offsetX: 80,
  offsetY: -80, width: 170, height: 180, lifetimeMs: 833, knockbackX: 0,
  knockbackY: 0, maxHits: 1,
} as const satisfies ProjectileTuning;
const tkjArrowDamageTuning = {
  ...base, actionName: 'hit9Arrow', assetKey: SkillProjectileEffectKeys.role4TkjArrowHit9_2,
  sourceSymbol: 'Role4BulletArrow9_2', runtimeName: 'Role4BulletArrow9_2', offsetX: 60,
  offsetY: 30, width: 180, height: 240, lifetimeMs: 833, knockbackX: 5,
  knockbackY: 0, hitIntervalFrames: 4, maxHits: 5,
} as const satisfies ProjectileTuning;
const dzjShovelTuning = {
  ...base, actionName: 'hit10', assetKey: SkillProjectileEffectKeys.role4DzjShovelHit10,
  sourceSymbol: 'Role4Bullet10', runtimeName: 'Role4Bullet10', offsetX: 150, offsetY: -50,
  width: 310, height: 190, lifetimeMs: 944, knockbackX: 2, knockbackY: -2,
  hitIntervalFrames: 8, maxHits: 5,
} as const satisfies ProjectileTuning;
const dzjArrowPreludeTuning = {
  ...base, actionName: 'hit10', assetKey: SkillProjectileEffectKeys.role4DzjArrowHit10_1,
  sourceSymbol: 'Role4BulletArrow10_1', runtimeName: 'Role4BulletArrow10_1', offsetX: 0,
  offsetY: 0, width: 180, height: 170, lifetimeMs: 1_000, knockbackX: 0,
  knockbackY: 0, maxHits: 1,
} as const satisfies ProjectileTuning;
const dzjArrowDamageTuning = {
  ...base, actionName: 'hit10Arrow', assetKey: SkillProjectileEffectKeys.role4DzjArrowHit10_2,
  sourceSymbol: 'Role4BulletArrow10_2', runtimeName: 'Role4BulletArrow10_2', offsetX: 225,
  offsetY: -80, width: 260, height: 180, lifetimeMs: 1_000, knockbackX: 10,
  knockbackY: -2, maxHits: 1,
} as const satisfies ProjectileTuning;



