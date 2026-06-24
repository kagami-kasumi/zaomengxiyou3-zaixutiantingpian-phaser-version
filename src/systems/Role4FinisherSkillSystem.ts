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

export type Role4FinisherSkillName = 'lybj' | 'mmw';
export type Role4FinisherWeaponMode = 'shovel' | 'arrow';

export const Role4FinisherSkillTuning = {
  mpScale: 26483 / 25958,
  lybjMpPercent: 0.015,
  lybjReentryMpRatio: 0.1,
  markerLifetimeMs: 10_000,
  markerScreenMinX: 30,
  markerScreenMaxX: 930,
  hit11ActionMs: 220,
  hit12ShovelActionMs: 3_400,
  hit12ArrowActionMs: 1_000,
  hit12ArrowRiseMs: 111,
  hit12ArrowSlideStartMs: 111,
  hit12ArrowSlideEndMs: 222,
  hit12ArrowVelocityY: -1_500,
  hit12ArrowVelocityX: 1_500,
  hit12ArrowWaveMs: [333, 667, 944],
  hit12ArrowRingCount: 10,
  hit12ArrowRingRadius: 100,
  hit12AntiKnockbackMs: 3_400,
} as const;

export type Role4FinisherMarker = {
  projectileId: number;
  x: number;
  y: number;
  remainingMs: number;
  firstMpCost: number;
};

export type Role4FinisherAction = {
  skillName: 'mmw';
  weaponMode: Role4FinisherWeaponMode;
  sourceId: string;
  facingX: -1 | 1;
  elapsedMs: number;
  durationMs: number;
  followProjectiles: Role4FinisherFollowProjectile[];
  spawnedWaveCount: number;
};

export type Role4FinisherFollowProjectile = {
  projectileId: number;
  offsetX: number;
  offsetY: number;
};

export type Role4FinisherSkillRuntime = {
  marker?: Role4FinisherMarker;
  active?: Role4FinisherAction;
};

export function createRole4FinisherSkillRuntime(): Role4FinisherSkillRuntime {
  return {};
}

export function getRole4FinisherMpCost(
  binding: SkillBinding,
  maxMp: number,
  weaponMode: Role4FinisherWeaponMode = 'shovel',
): number {
  if (binding.skillName === 'lybj') {
    return Math.floor(Math.max(0, maxMp) * Role4FinisherSkillTuning.lybjMpPercent);
  }
  if (binding.skillName !== 'mmw') return 0;
  const index = clampLevel(binding.level) - 1;
  const factor = weaponMode === 'arrow' ? 1.1 : 0.64;
  return Math.floor(consumeMpByLevel[index] * factor * Role4FinisherSkillTuning.mpScale);
}

export function calculateRole4MmwDamage(
  level: number,
  sourcePower: number,
  weaponMode: Role4FinisherWeaponMode,
): number {
  const divisor = weaponMode === 'arrow' ? 34 : 4.6;
  const coefficient = weaponMode === 'arrow' ? 1.1 : 0.68;
  return coefficient * calculateSkillBase(level, sourcePower) / divisor * 1.154;
}

export function requestRole4FinisherSkillFromInput(params: {
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
  if (!binding || !isRole4FinisherSkillName(binding.skillName)) return undefined;
  if (
    params.combat.state !== 'ready' || params.normalAttack.activeAttack ||
    params.skill.role4Runtime.actionRemainingMs > 0 ||
    params.skill.role4MobilityRuntime.active ||
    params.skill.role4FinisherRuntime.active
  ) {
    params.skill.lastResult = `role4 ${binding.skillName}: attacking`;
    return undefined;
  }

  if (binding.skillName === 'lybj') {
    return requestLybj({ ...params, binding: { ...binding, skillName: 'lybj' }, slotIndex });
  }
  return requestMmw({ ...params, binding: { ...binding, skillName: 'mmw' }, slotIndex });
}

export function updateRole4FinisherSkill(params: {
  runtime: Role4FinisherSkillRuntime;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  projectiles: ProjectileSystemModel;
  deltaMs: number;
}): void {
  updateMarker(params.runtime, params.projectiles, params.deltaMs);
  updateMmwAction(params);
}

export function hasRole4LybjMarker(runtime: Role4FinisherSkillRuntime): boolean {
  return runtime.marker !== undefined;
}

function requestLybj(params: {
  skill: HeroSkillModel;
  binding: SkillBinding & { skillName: 'lybj' };
  slotIndex: number;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  projectiles: ProjectileSystemModel;
}): HeroSkillCastEvent | undefined {
  const firstCost = getRole4FinisherMpCost(params.binding, params.skill.maxMp);
  const marker = params.skill.role4FinisherRuntime.marker;
  const mpCost = marker
    ? Math.floor(marker.firstMpCost * Role4FinisherSkillTuning.lybjReentryMpRatio)
    : firstCost;
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `lybj mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  if (marker) {
    if (isMarkerOnScreen(marker)) {
      params.movement.x = marker.x;
      params.movement.y = marker.y;
      params.movement.velocityX = 0;
      params.movement.velocityY = 0;
    }
    expireMarker(params.skill.role4FinisherRuntime, params.projectiles);
    params.skill.lastResult = marker ? `lybj-reentry mp ${params.skill.mp}` : `lybj mp ${params.skill.mp}`;
    return {
      skillName: 'lybj',
      slotIndex: params.slotIndex,
      actionName: 'hit11',
      projectile: createVirtualEventProjectile(params.projectiles, params.combat.id, 'role4-lybj-reentry'),
      mpBefore,
      mpAfter: params.skill.mp,
      mpCost,
      reentered: true,
    };
  }

  params.skill.role4Runtime.actionRemainingMs = Role4FinisherSkillTuning.hit11ActionMs;
  const projectile = spawnMarkerProjectile(params.projectiles, {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  });
  params.skill.role4FinisherRuntime.marker = {
    projectileId: projectile.id,
    x: params.movement.x,
    y: params.movement.y,
    remainingMs: Role4FinisherSkillTuning.markerLifetimeMs,
    firstMpCost: firstCost,
  };
  params.skill.lastResult = `lybj mp ${params.skill.mp}`;
  return {
    skillName: 'lybj',
    slotIndex: params.slotIndex,
    actionName: 'hit11',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function requestMmw(params: {
  skill: HeroSkillModel;
  binding: SkillBinding & { skillName: 'mmw' };
  slotIndex: number;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  timeMs: number;
}): HeroSkillCastEvent | undefined {
  const weaponMode: Role4FinisherWeaponMode = params.normalAttack.weaponMode === 'arrow'
    ? 'arrow'
    : 'shovel';
  const mpCost = getRole4FinisherMpCost(params.binding, params.skill.maxMp, weaponMode);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `mmw mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  const durationMs = weaponMode === 'arrow'
    ? Role4FinisherSkillTuning.hit12ArrowActionMs
    : Role4FinisherSkillTuning.hit12ShovelActionMs;
  params.skill.role4Runtime.actionRemainingMs = durationMs;
  params.combat.role4Hit12KnockbackImmune = true;
  lockHeroMovementForSkill(params.movement, params.timeMs, durationMs, true);

  const spawned = weaponMode === 'arrow'
    ? spawnMmwArrowProjectiles(params, durationMs)
    : spawnMmwShovelProjectile(params, durationMs);
  params.skill.role4FinisherRuntime.active = {
    skillName: 'mmw',
    weaponMode,
    sourceId: params.combat.id,
    facingX: params.movement.facingX,
    elapsedMs: 0,
    durationMs,
    followProjectiles: spawned.followProjectiles,
    spawnedWaveCount: 0,
  };
  params.skill.lastResult = `mmw-${weaponMode} mp ${params.skill.mp}`;
  return {
    skillName: 'mmw',
    slotIndex: params.slotIndex,
    actionName: 'hit12',
    projectile: spawned.primary,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function spawnMarkerProjectile(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role4-lybj-marker', 'role4-lybj-marker', {
    ...base,
    actionName: 'hit11',
    assetKey: SkillProjectileEffectKeys.role4LybjMarker,
    sourceSymbol: 'Role4Bullet11',
    runtimeName: 'Role4Bullet11',
    offsetX: 0,
    offsetY: 0,
    width: 72,
    height: 120,
    lifetimeMs: Role4FinisherSkillTuning.markerLifetimeMs,
    maxHits: 100,
  });
  projectile.visualOnly = true;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

function spawnMmwShovelProjectile(
  params: {
    projectiles: ProjectileSystemModel;
    combat: HeroCombatModel;
    movement: HeroMovementModel;
    binding: SkillBinding & { skillName: 'mmw' };
    sourcePower: number;
  },
  durationMs: number,
): { primary: ProjectileModel; followProjectiles: Role4FinisherFollowProjectile[] } {
  const damage = calculateRole4MmwDamage(params.binding.level, params.sourcePower, 'shovel');
  const projectile = spawnProjectileFromTuning(
    params.projectiles,
    createSpawnPoint(params),
    'role4-mmw-shovel-hit12',
    'role4-mmw-shovel-hit12',
    { ...mmwShovelTuning, damage, lifetimeMs: durationMs },
  );
  params.projectiles.projectiles.push(projectile);
  return { primary: projectile, followProjectiles: [] };
}

function spawnMmwArrowProjectiles(
  params: {
    projectiles: ProjectileSystemModel;
    combat: HeroCombatModel;
    movement: HeroMovementModel;
    binding: SkillBinding & { skillName: 'mmw' };
    sourcePower: number;
  },
  durationMs: number,
): { primary: ProjectileModel; followProjectiles: Role4FinisherFollowProjectile[] } {
  const point = createSpawnPoint(params);
  const prelude = spawnProjectileFromTuning(
    params.projectiles,
    point,
    'role4-mmw-arrow-hit12-1',
    'role4-mmw-arrow-hit12-1',
    { ...mmwArrowPreludeTuning, lifetimeMs: durationMs },
  );
  prelude.visualOnly = true;
  const primary = spawnProjectileFromTuning(
    params.projectiles,
    point,
    'role4-mmw-arrow-hit12-2',
    'role4-mmw-arrow-hit12-2',
    {
      ...mmwArrowFollowTuning,
      damage: calculateRole4MmwDamage(params.binding.level, params.sourcePower, 'arrow'),
      lifetimeMs: durationMs,
    },
  );
  params.projectiles.projectiles.push(prelude, primary);
  return {
    primary,
    followProjectiles: [
      { projectileId: prelude.id, offsetX: mmwArrowPreludeTuning.offsetX, offsetY: mmwArrowPreludeTuning.offsetY },
      { projectileId: primary.id, offsetX: mmwArrowFollowTuning.offsetX, offsetY: mmwArrowFollowTuning.offsetY },
    ],
  };
}

function updateMarker(
  runtime: Role4FinisherSkillRuntime,
  projectiles: ProjectileSystemModel,
  deltaMs: number,
): void {
  const marker = runtime.marker;
  if (!marker) return;
  marker.remainingMs -= Math.max(0, deltaMs);
  const projectile = projectiles.projectiles.find((item) => item.id === marker.projectileId);
  if (projectile) {
    projectile.x = marker.x;
    projectile.y = marker.y;
  }
  if (marker.remainingMs > 0) return;
  expireMarker(runtime, projectiles);
}

function updateMmwAction(params: {
  runtime: Role4FinisherSkillRuntime;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  projectiles: ProjectileSystemModel;
  deltaMs: number;
}): void {
  const action = params.runtime.active;
  if (!action) return;
  const previousElapsed = action.elapsedMs;
  action.elapsedMs = Math.min(action.durationMs, action.elapsedMs + Math.max(0, params.deltaMs));
  if (action.weaponMode === 'arrow') {
    applyMmwArrowMovement(action, params.movement, previousElapsed, action.elapsedMs);
    spawnDueRingWaves(action, params.projectiles, params.movement);
  }
  syncFollowProjectiles(action, params.movement, params.projectiles);
  params.combat.role4Hit12KnockbackImmune = true;
  if (action.elapsedMs < action.durationMs) return;
  params.movement.velocityX = 0;
  params.movement.velocityY = 0;
  params.combat.role4Hit12KnockbackImmune = false;
  params.runtime.active = undefined;
}

function applyMmwArrowMovement(
  action: Role4FinisherAction,
  movement: HeroMovementModel,
  fromMs: number,
  toMs: number,
): void {
  const riseSeconds = phaseDuration(fromMs, toMs, 0, Role4FinisherSkillTuning.hit12ArrowRiseMs) / 1_000;
  const slideSeconds = phaseDuration(
    fromMs,
    toMs,
    Role4FinisherSkillTuning.hit12ArrowSlideStartMs,
    Role4FinisherSkillTuning.hit12ArrowSlideEndMs,
  ) / 1_000;
  movement.y += Role4FinisherSkillTuning.hit12ArrowVelocityY * riseSeconds;
  movement.x += action.facingX * Role4FinisherSkillTuning.hit12ArrowVelocityX * slideSeconds;
  if (riseSeconds > 0) movement.grounded = false;
}

function spawnDueRingWaves(
  action: Role4FinisherAction,
  projectiles: ProjectileSystemModel,
  movement: HeroMovementModel,
): void {
  while (
    action.spawnedWaveCount < Role4FinisherSkillTuning.hit12ArrowWaveMs.length &&
    action.elapsedMs >= Role4FinisherSkillTuning.hit12ArrowWaveMs[action.spawnedWaveCount]
  ) {
    spawnRingWave(projectiles, {
      sourceId: action.sourceId,
      x: movement.x,
      y: movement.y - (-7 + (action.spawnedWaveCount === 0 ? 6 : action.spawnedWaveCount === 1 ? 12 : 17) * 2),
      facingX: action.facingX,
    });
    action.spawnedWaveCount++;
  }
}

function spawnRingWave(system: ProjectileSystemModel, point: ProjectileSpawnPoint): void {
  for (let index = 0; index < Role4FinisherSkillTuning.hit12ArrowRingCount; index++) {
    const angle = 360 / Role4FinisherSkillTuning.hit12ArrowRingCount * index;
    const radians = angle * Math.PI / 180;
    const projectile = spawnProjectileFromTuning(
      system,
      point,
      'role4-mmw-arrow-hit12-3',
      `role4-mmw-arrow-hit12-3-${index}`,
      {
        ...mmwArrowRingTuning,
        offsetX: Math.sin(radians) * Role4FinisherSkillTuning.hit12ArrowRingRadius,
        offsetY: -Math.cos(radians) * Role4FinisherSkillTuning.hit12ArrowRingRadius,
      },
    );
    system.projectiles.push(projectile);
  }
}

function syncFollowProjectiles(
  action: Role4FinisherAction,
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

function createSpawnPoint(params: {
  combat: HeroCombatModel;
  movement: HeroMovementModel;
}): ProjectileSpawnPoint {
  return {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
}

function createVirtualEventProjectile(
  system: ProjectileSystemModel,
  sourceId: string,
  attackSlug: string,
): ProjectileModel {
  return spawnProjectileFromTuning(
    system,
    { sourceId, x: 0, y: 0, facingX: 1 },
    'role4-lybj-marker',
    attackSlug,
    { ...base, actionName: 'hit11', assetKey: SkillProjectileEffectKeys.role4LybjMarker,
      sourceSymbol: 'Role4Bullet11', runtimeName: 'Role4Bullet11', width: 0, height: 0,
      lifetimeMs: 0, maxHits: 0 },
  );
}

function isMarkerOnScreen(marker: Role4FinisherMarker): boolean {
  return marker.x >= Role4FinisherSkillTuning.markerScreenMinX &&
    marker.x <= Role4FinisherSkillTuning.markerScreenMaxX;
}

function expireMarker(runtime: Role4FinisherSkillRuntime, projectiles: ProjectileSystemModel): void {
  const marker = runtime.marker;
  if (!marker) return;
  const projectile = projectiles.projectiles.find((item) => item.id === marker.projectileId);
  if (projectile) projectile.isExpired = true;
  runtime.marker = undefined;
}

function phaseDuration(fromMs: number, toMs: number, startMs: number, endMs: number): number {
  return Math.max(0, Math.min(toMs, endMs) - Math.max(fromMs, startMs));
}

function calculateSkillBase(level: number, sourcePower: number): number {
  const index = clampLevel(level) - 1;
  return (hmzLianZhan[index] * 8 + hmzZaDi[index]) * fixedDamageCount[index] +
    (skillFactorBase + skillFactorPerLevel * index) * 6201 / 5658 * Math.max(0, sourcePower);
}

function findSlot(input: PlayerInputState, previous: PlayerInputState | undefined): number | undefined {
  const index = input.skillSlots.findIndex((pressed, slot) =>
    pressed && !(previous?.skillSlots[slot] ?? false));
  return index >= 0 ? index : undefined;
}

function isRole4FinisherSkillName(skillName: string): skillName is Role4FinisherSkillName {
  return skillName === 'lybj' || skillName === 'mmw';
}

function clampLevel(level: number): number {
  return Math.min(Math.max(Math.floor(level), 1), consumeMpByLevel.length);
}

const base = {
  speedX: 0, speedY: 0, distance: undefined, damage: 0, attackKind: 'magic',
  hitIntervalFrames: 999, knockbackX: 0, knockbackY: 0, offsetX: 0, offsetY: 0,
  width: 1, height: 1, lifetimeMs: 1, maxHits: 1,
} as const;
const mmwShovelTuning = {
  ...base, actionName: 'hit12', assetKey: SkillProjectileEffectKeys.role4MmwShovelHit12,
  sourceSymbol: 'Role4Bullet12', runtimeName: 'Role4Bullet12', offsetX: 150, offsetY: 0,
  width: 310, height: 190, lifetimeMs: 3_400, knockbackX: 3, knockbackY: -2,
  hitIntervalFrames: 18, maxHits: 999,
} as const satisfies ProjectileTuning;
const mmwArrowPreludeTuning = {
  ...base, actionName: 'hit12', assetKey: SkillProjectileEffectKeys.role4MmwArrowHit12_1,
  sourceSymbol: 'Role4BulletArrow12_1', runtimeName: 'Role4BulletArrow12_1', offsetX: 80,
  offsetY: -100, width: 170, height: 180, lifetimeMs: 1_000,
} as const satisfies ProjectileTuning;
const mmwArrowFollowTuning = {
  ...base, actionName: 'hit12Arrow', assetKey: SkillProjectileEffectKeys.role4MmwArrowHit12_2,
  sourceSymbol: 'Role4BulletArrow12_2', runtimeName: 'Role4BulletArrow12_2', offsetX: 0,
  offsetY: 0, width: 150, height: 190, lifetimeMs: 1_000, hitIntervalFrames: 10, maxHits: 999,
} as const satisfies ProjectileTuning;
const mmwArrowRingTuning = {
  ...base, actionName: 'hit12Arrow', assetKey: SkillProjectileEffectKeys.role4MmwArrowHit12_3,
  sourceSymbol: 'Role4BulletArrow12_3', runtimeName: 'Role4BulletArrow12_3', offsetX: 0,
  offsetY: 0, width: 54, height: 54, lifetimeMs: 800, hitIntervalFrames: 10, maxHits: 999,
} as const satisfies ProjectileTuning;
