import { clampSkillLevel as clampLevel, clampSkillLevelOrZero as clampLevelOrZero } from './SkillMathUtils';
import { findJustPressedSkillSlot } from './SkillInputUtils';
import { SkillMpByLevel, SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel, Role1DamageFinalMultiplier } from './SkillTuning';
import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { AttackKind } from './CombatSystem';
import type { HeroCombatModel } from './HeroCombatSystem';
import { lockHeroMovementForSkill, type HeroMovementModel } from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel, SkillBinding } from './HeroSkillSystem';
import type { PlayerInputState } from './InputSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';
import { spawnRole1LyfbProjectiles } from './Role1SkillProjectileFactory';


const hmzLianZhan = [
  34, 95, 192, 253, 318, 444, 524, 687, 876,
  1091, 1219, 1480, 1770, 2092, 2444, 2831, 3058, 3500,
] as const;
const hmzZaDi = [
  209, 573, 1151, 1523, 1912, 2666, 3149, 4126, 5258,
  6551, 7323, 8884, 10623, 12551, 14671, 16992, 18350, 21006,
] as const;


export type Role1SkillRuntimeModel = {
  actionRemainingMs: number;
  slzLevel: number;
  lysLevel: number;
  hytjLevel: number;
  lyfbLevel: number;
  jdyLevel: number;
  sxLevel: number;
  lifeStealPercent: number;
  critBonusPercent: number;
  lastLysCastAtMs: number;
  activeMobility?: Role1MobilityState;
  jdyStage?: Role1JdyStageState;
};

export const Role1BasicSkillTuning = {
  slzMpFactor: 0.55,
  lysMpFactor: 0.45,
  hytjMpFactor: 0.6,
  lyfbMpFactor: 0.65,
  jdyMpFactor: 1,
  slzActionMs: 650,
  lysActionMs: 360,
  hytjActionMs: 360,
  lyfbActionMs: 480,
  jdyStageActionMs: 520,
  lysGateMs: 36,
  lysHorizontalSpeed: 720,
  lysUpwardSpeed: -900,
  hytjDashSpeed: 900,
  jdyStage1Speed: 750,
  jdyStage2UpwardSpeed: -750,
} as const;

const slzProjectileTuning = {
  actionName: 'hit6',
  assetKey: SkillProjectileEffectKeys.role1SlzHit6,
  sourceSymbol: 'Role1Bullet6',
  runtimeName: 'Role1Bullet6',
  offsetX: 30,
  offsetY: 40,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 170,
  height: 150,
  lifetimeMs: 460,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 5,
  knockbackY: -20,
  hitIntervalFrames: 999,
  maxHits: 99,
} as const satisfies ProjectileTuning;

const hytjProjectileTuning = {
  actionName: 'hit7',
  assetKey: SkillProjectileEffectKeys.role1HytjHit7,
  sourceSymbol: 'Role1Bullet7',
  runtimeName: 'Role1Bullet7',
  offsetX: 175,
  offsetY: -30,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 210,
  height: 110,
  lifetimeMs: 360,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 15,
  knockbackY: 0,
  hitIntervalFrames: 4,
  maxHits: 4,
} as const satisfies ProjectileTuning;

const lysProjectileTuning = {
  actionName: 'hit9',
  assetKey: SkillProjectileEffectKeys.role1LysHit9,
  sourceSymbol: 'Role1Bullet9',
  runtimeName: 'Role1Bullet9',
  offsetX: 120,
  offsetY: -50,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 150,
  lifetimeMs: 360,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 0,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 100,
} as const satisfies ProjectileTuning;

const jdyStage1ProjectileTuning = {
  actionName: 'hit11_1',
  assetKey: SkillProjectileEffectKeys.role1JdyHit11_1,
  sourceSymbol: 'Role1Bullet11_1',
  runtimeName: 'Role1Bullet11_1',
  offsetX: 50,
  offsetY: -50,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 190,
  height: 130,
  lifetimeMs: 560,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 20,
  knockbackY: 0,
  hitIntervalFrames: 5,
  maxHits: 13,
} as const satisfies ProjectileTuning;

const jdyStage2ProjectileTuning = {
  actionName: 'hit11_2',
  assetKey: SkillProjectileEffectKeys.role1JdyHit11_2,
  sourceSymbol: 'Role1Bullet11_2',
  runtimeName: 'Role1Bullet11_2',
  offsetX: 0,
  offsetY: -50,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 190,
  height: 150,
  lifetimeMs: 560,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: -25,
  hitIntervalFrames: 5,
  maxHits: 13,
} as const satisfies ProjectileTuning;

type Role1MobilityState = {
  kind: 'lys' | 'hytj' | 'jdy1' | 'jdy2';
  remainingMs: number;
  directionX: -1 | 1;
  direction: 'horizontal' | 'upward';
};

type Role1JdyStageState = {
  level: number;
  stage1ProjectileId: number;
};

export function createRole1SkillRuntime(): Role1SkillRuntimeModel {
  return {
    actionRemainingMs: 0,
    slzLevel: 0,
    lysLevel: 0,
    hytjLevel: 0,
    lyfbLevel: 0,
    jdyLevel: 0,
    sxLevel: 0,
    lifeStealPercent: 0,
    critBonusPercent: 0,
    lastLysCastAtMs: Number.NEGATIVE_INFINITY,
  };
}

export function updateRole1BasicRuntime(
  runtime: Role1SkillRuntimeModel,
  deltaMs: number,
  movement?: HeroMovementModel,
): void {
  const safeDelta = Math.max(0, deltaMs);
  runtime.actionRemainingMs = Math.max(0, runtime.actionRemainingMs - safeDelta);
  if (!runtime.activeMobility || !movement) return;
  const active = runtime.activeMobility;
  const stepMs = Math.min(safeDelta, active.remainingMs);
  const stepSeconds = stepMs / 1000;
  if (active.kind === 'hytj') {
    movement.velocityX = active.directionX * Role1BasicSkillTuning.hytjDashSpeed;
    movement.x += movement.velocityX * stepSeconds;
    movement.velocityY = 0;
    movement.state = 'run';
  } else if (active.kind === 'jdy1') {
    movement.velocityX = active.directionX * Role1BasicSkillTuning.jdyStage1Speed;
    movement.velocityY = 0;
    movement.x += movement.velocityX * stepSeconds;
    movement.state = 'run';
  } else if (active.kind === 'jdy2') {
    movement.velocityX = 0;
    movement.velocityY = Role1BasicSkillTuning.jdyStage2UpwardSpeed;
    movement.y += movement.velocityY * stepSeconds;
    movement.grounded = false;
    movement.state = 'jump2';
  } else {
    const upward = active.direction === 'upward';
    movement.velocityX = upward
      ? 0
      : active.directionX * Role1BasicSkillTuning.lysHorizontalSpeed;
    movement.velocityY = upward
      ? Role1BasicSkillTuning.lysUpwardSpeed
      : 0;
    movement.x += movement.velocityX * stepSeconds;
    movement.y += movement.velocityY * stepSeconds;
    movement.grounded = false;
    movement.state = upward ? 'jump2' : 'run';
  }
  active.remainingMs -= stepMs;
  if (active.remainingMs <= 0) {
    runtime.activeMobility = undefined;
    movement.velocityX = 0;
    if (active.direction !== 'upward') movement.velocityY = 0;
  }
  if (runtime.actionRemainingMs <= 0 && runtime.jdyStage) {
    runtime.jdyStage = undefined;
  }
}

export function syncRole1LearnedSkills(
  runtime: Role1SkillRuntimeModel,
  learned: {
    slzLevel: number;
    lysLevel?: number;
    hytjLevel?: number;
    lyfbLevel?: number;
    jdyLevel?: number;
    sxLevel: number;
  },
): void {
  runtime.slzLevel = clampLevelOrZero(learned.slzLevel, 18);
  runtime.lysLevel = clampLevelOrZero(learned.lysLevel ?? 0, 18);
  runtime.hytjLevel = clampLevelOrZero(learned.hytjLevel ?? 0, 18);
  runtime.lyfbLevel = clampLevelOrZero(learned.lyfbLevel ?? 0, 18);
  runtime.jdyLevel = clampLevelOrZero(learned.jdyLevel ?? 0, 18);
  runtime.sxLevel = clampLevelOrZero(learned.sxLevel, 9);
  runtime.lifeStealPercent = runtime.sxLevel > 0
    ? 0.8 + (runtime.sxLevel - 1) / 10
    : 0;
  runtime.critBonusPercent = runtime.sxLevel > 0
    ? 3 + Math.round(runtime.sxLevel)
    : 0;
}

export function getRole1SlzMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, SkillMpByLevel.length) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1BasicSkillTuning.slzMpFactor);
}

export function getRole1LysMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, SkillMpByLevel.length) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1BasicSkillTuning.lysMpFactor);
}

export function getRole1HytjMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, SkillMpByLevel.length) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1BasicSkillTuning.hytjMpFactor);
}

export function getRole1LyfbMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, SkillMpByLevel.length) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1BasicSkillTuning.lyfbMpFactor);
}

export function getRole1JdyMpCost(binding: SkillBinding): number {
  const levelIndex = clampLevel(binding.level, SkillMpByLevel.length) - 1;
  return Math.floor(SkillMpByLevel[levelIndex] * Role1BasicSkillTuning.jdyMpFactor);
}

export function calculateRole1SlzDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1SkillDamage(skillLevel, sourcePower, 0.6, 1);
}

export function calculateRole1LysDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1SkillDamage(skillLevel, sourcePower, 0.5, 1);
}

export function calculateRole1HytjDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1SkillDamage(skillLevel, sourcePower, 0.65, 4);
}

export function calculateRole1LyfbDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1SkillDamage(skillLevel, sourcePower, 0.7, 12);
}

export function calculateRole1JdyDamage(skillLevel: number, sourcePower: number): number {
  return calculateRole1SkillDamage(skillLevel, sourcePower, 0.8, 13);
}

function calculateRole1SkillDamage(
  skillLevel: number,
  sourcePower: number,
  multiplier: number,
  divisor: number,
): number {
  const levelIndex = clampLevel(skillLevel, hmzLianZhan.length) - 1;
  const skillFixedDamage = hmzLianZhan[levelIndex] * 8 + hmzZaDi[levelIndex];
  const fixedPart = skillFixedDamage * SkillFixedDamageCount[levelIndex];
  const powerPart = (SkillFactorBase + SkillFactorPerLevel * levelIndex)
    * Math.max(0, sourcePower);
  return Math.floor(multiplier * (fixedPart + powerPart) / divisor) * Role1DamageFinalMultiplier;
}

export function isRole1SlzComboRequested(params: {
  heroId: number;
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
}): boolean {
  const level = params.skill.role1Runtime.slzLevel;
  if (params.heroId !== 1 || level <= 0) return false;
  const justPressed = params.input.attack && !(params.previousInput?.attack ?? false)
    || params.input.up && !(params.previousInput?.up ?? false);
  return params.input.attack && params.input.up && justPressed
    && params.skill.mp >= getRole1SlzMpCost({ skillName: 'slz', level });
}

export function isRole1HytjRunAttackRequested(params: {
  heroId: number;
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
}): boolean {
  const level = params.skill.role1Runtime.hytjLevel;
  if (params.heroId !== 1 || level <= 0 || params.movement.runningDirection === 0) return false;
  const justPressedAttack = params.input.attack && !(params.previousInput?.attack ?? false);
  return justPressedAttack
    && params.skill.mp >= getRole1HytjMpCost({ skillName: 'hytj', level });
}

export function requestRole1BasicSkillFromInput(params: {
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
  if (params.normalAttack.heroId !== 1) return undefined;
  const slzCombo = isRole1SlzComboRequested({
    heroId: params.normalAttack.heroId,
    skill: params.skill,
    input: params.input,
    previousInput: params.previousInput,
  });
  const hytjCombo = isRole1HytjRunAttackRequested({
    heroId: params.normalAttack.heroId,
    skill: params.skill,
    input: params.input,
    previousInput: params.previousInput,
    movement: params.movement,
  });
  const slotIndex = findJustPressedSkillSlot(params.input, params.previousInput);
  const binding = slotIndex === undefined ? undefined : params.skill.loadout.slots[slotIndex];
  const skillName = slzCombo ? 'slz' : hytjCombo ? 'hytj' : binding?.skillName;
  if (
    skillName !== 'slz'
    && skillName !== 'lys'
    && skillName !== 'hytj'
    && skillName !== 'lyfb'
    && skillName !== 'jdy'
  ) return undefined;
  const jdyStageReady = skillName === 'jdy' && params.skill.role1Runtime.jdyStage !== undefined;
  if (
    params.combat.state !== 'ready'
    || params.normalAttack.activeAttack
    || (params.skill.role1Runtime.actionRemainingMs > 0 && !jdyStageReady)
  ) {
    params.skill.lastResult = `role1 ${skillName}: attacking`;
    return undefined;
  }
  if (jdyStageReady && params.skill.role1Runtime.jdyStage) {
    return castJdyStage2(params, params.skill.role1Runtime.jdyStage.level, slotIndex ?? -1);
  }
  const level = getRuntimeOrBindingLevel(params.skill, skillName, binding);
  if (skillName === 'lys' && params.timeMs - params.skill.role1Runtime.lastLysCastAtMs < Role1BasicSkillTuning.lysGateMs) {
    params.skill.lastResult = 'lys gate';
    return undefined;
  }
  const mpCost = getRole1MpCost(skillName, level);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp -= mpCost;
  if (skillName === 'slz') {
    return castSlz(params, level, mpBefore, mpCost, slzCombo, slotIndex);
  }
  if (skillName === 'lys') {
    return castLys(params, level, mpBefore, mpCost, slotIndex!);
  }
  if (skillName === 'hytj') {
    return castHytj(params, level, mpBefore, mpCost, hytjCombo, slotIndex);
  }
  if (skillName === 'lyfb') {
    return castLyfb(params, level, mpBefore, mpCost, slotIndex!);
  }
  return castJdyStage1(params, level, mpBefore, mpCost, slotIndex!);
}

function castSlz(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
  },
  level: number,
  mpBefore: number,
  mpCost: number,
  combo: boolean,
  slotIndex: number | undefined,
): HeroSkillCastEvent {
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.slzActionMs;
  const spawnPoint: ProjectileSpawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  };
  const projectile = spawnProjectileFromTuning(
    params.projectiles,
    spawnPoint,
    'role1-slz-hit6',
    'role1-slz-hit6',
    slzProjectileTuning,
  );
  projectile.damage = calculateRole1SlzDamage(level, params.sourcePower);
  params.projectiles.projectiles.push(projectile);
  params.skill.lastResult = `slz${combo ? '-combo' : ''} mp ${params.skill.mp}`;
  return {
    skillName: 'slz',
    slotIndex: combo ? -1 : slotIndex!,
    actionName: 'hit6',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: combo,
  };
}

function castHytj(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
    timeMs: number;
  },
  level: number,
  mpBefore: number,
  mpCost: number,
  combo: boolean,
  slotIndex: number | undefined,
): HeroSkillCastEvent {
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.hytjActionMs;
  params.skill.role1Runtime.activeMobility = {
    kind: 'hytj',
    remainingMs: Role1BasicSkillTuning.hytjActionMs,
    directionX: params.movement.facingX,
    direction: 'horizontal',
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, Role1BasicSkillTuning.hytjActionMs, false);
  const projectile = spawnRole1Projectile(
    params.projectiles,
    params.combat,
    params.movement,
    'role1-hytj-hit7',
    'role1-hytj-hit7',
    hytjProjectileTuning,
  );
  projectile.damage = calculateRole1HytjDamage(level, params.sourcePower);
  params.projectiles.projectiles.push(projectile);
  params.skill.lastResult = `hytj${combo ? '-run' : ''} mp ${params.skill.mp}`;
  return {
    skillName: 'hytj',
    slotIndex: combo ? -1 : slotIndex!,
    actionName: 'hit7',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: combo,
  };
}

function castLys(
  params: {
    skill: HeroSkillModel;
    input: PlayerInputState;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
    timeMs: number;
  },
  level: number,
  mpBefore: number,
  mpCost: number,
  slotIndex: number,
): HeroSkillCastEvent {
  const upward = params.input.up;
  params.skill.role1Runtime.lastLysCastAtMs = params.timeMs;
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.lysActionMs;
  params.skill.role1Runtime.activeMobility = {
    kind: 'lys',
    remainingMs: Role1BasicSkillTuning.lysActionMs,
    directionX: params.movement.facingX,
    direction: upward ? 'upward' : 'horizontal',
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, Role1BasicSkillTuning.lysActionMs, true);
  const projectile = spawnRole1Projectile(
    params.projectiles,
    params.combat,
    params.movement,
    'role1-lys-hit9',
    'role1-lys-hit9',
    lysProjectileTuning,
  );
  if (upward) {
    projectile.x = params.movement.x + 60;
    projectile.y = params.movement.y - 50;
  }
  projectile.damage = calculateRole1LysDamage(level, params.sourcePower);
  params.projectiles.projectiles.push(projectile);
  params.skill.lastResult = `lys${upward ? '-up' : ''} mp ${params.skill.mp}`;
  return {
    skillName: 'lys',
    slotIndex,
    actionName: 'hit9',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function castLyfb(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
  },
  level: number,
  mpBefore: number,
  mpCost: number,
  slotIndex: number,
): HeroSkillCastEvent {
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.lyfbActionMs;
  const [follow, moving] = spawnRole1LyfbProjectiles({
    projectiles: params.projectiles,
    combat: params.combat,
    movement: params.movement,
    damage: calculateRole1LyfbDamage(level, params.sourcePower),
    shadowDerived: false,
  });
  params.projectiles.projectiles.push(follow, moving);
  params.skill.lastResult = `lyfb mp ${params.skill.mp}`;
  return {
    skillName: 'lyfb',
    slotIndex,
    actionName: 'hit8',
    projectile: follow,
    spawnedProjectiles: [follow, moving],
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function castJdyStage1(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
    timeMs: number;
  },
  level: number,
  mpBefore: number,
  mpCost: number,
  slotIndex: number,
): HeroSkillCastEvent {
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.jdyStageActionMs;
  params.skill.role1Runtime.activeMobility = {
    kind: 'jdy1',
    remainingMs: Role1BasicSkillTuning.jdyStageActionMs,
    directionX: params.movement.facingX,
    direction: 'horizontal',
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, Role1BasicSkillTuning.jdyStageActionMs, false);
  const projectile = spawnRole1Projectile(
    params.projectiles,
    params.combat,
    params.movement,
    'role1-jdy-hit11-1',
    'role1-jdy-hit11-1',
    jdyStage1ProjectileTuning,
  );
  projectile.damage = calculateRole1JdyDamage(level, params.sourcePower);
  params.projectiles.projectiles.push(projectile);
  params.skill.role1Runtime.jdyStage = { level, stage1ProjectileId: projectile.id };
  params.skill.lastResult = `jdy-1 mp ${params.skill.mp}`;
  return {
    skillName: 'jdy',
    slotIndex,
    actionName: 'hit11_1',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function castJdyStage2(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
    timeMs: number;
  },
  level: number,
  slotIndex: number,
): HeroSkillCastEvent | undefined {
  if (params.combat.state !== 'ready') return undefined;
  const stage = params.skill.role1Runtime.jdyStage;
  if (!stage) return undefined;
  for (const projectile of params.projectiles.projectiles) {
    if (projectile.id === stage.stage1ProjectileId) projectile.isExpired = true;
  }
  params.skill.role1Runtime.actionRemainingMs = Role1BasicSkillTuning.jdyStageActionMs;
  params.skill.role1Runtime.activeMobility = {
    kind: 'jdy2',
    remainingMs: Role1BasicSkillTuning.jdyStageActionMs,
    directionX: params.movement.facingX,
    direction: 'upward',
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, Role1BasicSkillTuning.jdyStageActionMs, true);
  const projectile = spawnRole1Projectile(
    params.projectiles,
    params.combat,
    params.movement,
    'role1-jdy-hit11-2',
    'role1-jdy-hit11-2',
    jdyStage2ProjectileTuning,
  );
  projectile.damage = calculateRole1JdyDamage(level, params.sourcePower);
  params.projectiles.projectiles.push(projectile);
  params.skill.role1Runtime.jdyStage = undefined;
  params.skill.lastResult = `jdy-2 mp ${params.skill.mp}`;
  return {
    skillName: 'jdy',
    slotIndex,
    actionName: 'hit11_2',
    projectile,
    mpBefore: params.skill.mp,
    mpAfter: params.skill.mp,
    // The second stage reuses the MP paid by hit11_1.
    mpCost: 0,
    reentered: true,
  };
}

function spawnRole1Projectile(
  projectiles: ProjectileSystemModel,
  combat: HeroCombatModel,
  movement: HeroMovementModel,
  variant:
    | 'role1-slz-hit6'
    | 'role1-hytj-hit7'
    | 'role1-lys-hit9'
    | 'role1-jdy-hit11-1'
    | 'role1-jdy-hit11-2',
  attackSlug: string,
  tuning: ProjectileTuning,
) {
  const spawnPoint: ProjectileSpawnPoint = {
    sourceId: combat.id,
    x: movement.x,
    y: movement.y,
    facingX: movement.facingX,
  };
  return spawnProjectileFromTuning(projectiles, spawnPoint, variant, attackSlug, tuning);
}

function getRuntimeOrBindingLevel(
  skill: HeroSkillModel,
  skillName: 'slz' | 'lys' | 'hytj' | 'lyfb' | 'jdy',
  binding: SkillBinding | null | undefined,
): number {
  if (skillName === 'slz') return binding?.level ?? skill.role1Runtime.slzLevel;
  if (skillName === 'lys') return binding?.level ?? skill.role1Runtime.lysLevel;
  if (skillName === 'hytj') return binding?.level ?? skill.role1Runtime.hytjLevel;
  if (skillName === 'lyfb') return binding?.level ?? skill.role1Runtime.lyfbLevel;
  return binding?.level ?? skill.role1Runtime.jdyLevel;
}

function getRole1MpCost(skillName: 'slz' | 'lys' | 'hytj' | 'lyfb' | 'jdy', level: number): number {
  if (skillName === 'slz') return getRole1SlzMpCost({ skillName, level });
  if (skillName === 'lys') return getRole1LysMpCost({ skillName, level });
  if (skillName === 'hytj') return getRole1HytjMpCost({ skillName, level });
  if (skillName === 'lyfb') return getRole1LyfbMpCost({ skillName, level });
  return getRole1JdyMpCost({ skillName, level });
}

export function tryRole1SxLifeSteal(params: {
  runtime: Role1SkillRuntimeModel;
  combat: HeroCombatModel;
  actualDamage: number;
  attackKind: AttackKind;
}): number {
  if (
    params.runtime.sxLevel <= 0
    || params.combat.state === 'dead'
    || params.attackKind !== 'physics'
  ) return 0;
  const heal = Math.floor(Math.max(0, params.actualDamage) * params.runtime.lifeStealPercent / 100);
  const hpBefore = params.combat.hp;
  params.combat.hp = Math.min(params.combat.maxHp, params.combat.hp + heal);
  return params.combat.hp - hpBefore;
}







