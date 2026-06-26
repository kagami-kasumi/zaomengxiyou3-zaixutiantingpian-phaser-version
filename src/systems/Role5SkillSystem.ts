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
import {
  role5JrjlCompanionTuning,
  role5JrjlShotTuning,
  role5LxjTuning,
  role5LxuanjTuning,
  role5LyshCompanionTuning,
  role5LyshShotTuning,
  role5MlszTunings,
  role5PkzTunings,
  Role5SkillTuning,
  role5TljTuning,
  role5XkjzTuning,
  role5XlcTuning,
  role5YybTuning,
} from './Role5SkillTuning';
import {
  calculateRole5CompanionArrowDamage,
  calculateRole5SpearSkillDamage,
  calculateRole5SwordSkillDamage,
  clampRole5SkillLevel,
  getRole5CompanionSkillMpCost,
  getRole5SpearSkillMpCost,
  getRole5StatusSkillMpCost,
  getRole5SwordSkillMpCost,
  getRole5YybStatusDurationMs,
  isRole5CompanionSkillName,
  isRole5SpearSkillName,
  isRole5StatusSkillName,
  isRole5SwordSkillName,
} from './Role5SkillMath';
import type {
  Role5CompanionArrowState,
  Role5SkillName,
  Role5SkillRuntime,
  Role5SkillTarget,
  Role5SpearSkillName,
  Role5StatusSkillName,
  Role5SwordSkillName,
} from './Role5SkillTypes';

export { Role5SkillTuning } from './Role5SkillTuning';
export {
  calculateRole5CompanionArrowDamage,
  calculateRole5SpearSkillDamage,
  calculateRole5SwordSkillDamage,
  getRole5CompanionSkillMpCost,
  getRole5LoongSwordDamageMultiplier,
  getRole5SpearSkillMpCost,
  getRole5StatusSkillMpCost,
  getRole5SwordSkillMpCost,
  getRole5YybStatusDurationMs,
  isRole5CompanionSkillName,
  isRole5SpearSkillName,
  isRole5StatusSkillName,
  isRole5SwordSkillName,
} from './Role5SkillMath';
export {
  createRole5SkillRuntime,
  type Role5CompanionArrowState,
  type Role5CompanionSkillName,
  type Role5SkillName,
  type Role5SkillRuntime,
  type Role5SkillTarget,
  type Role5SpearSkillName,
  type Role5StatusSkillName,
  type Role5SwordSkillName,
} from './Role5SkillTypes';

export function isRole5YybComboRequested(params: {
  heroId: number;
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
}): boolean {
  if (params.heroId !== 5 || !findBinding(params.skill, 'yyb')) return false;
  const justPressed = params.input.attack && !(params.previousInput?.attack ?? false)
    || params.input.up && !(params.previousInput?.up ?? false);
  return params.input.attack && params.input.up && justPressed;
}

export function requestRole5SpearSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  targets?: readonly Role5SkillTarget[];
  sourcePower: number;
  timeMs: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 5) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (!binding || !isRole5SpearSkillName(binding.skillName)) return undefined;

  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    params.skill.activeAction ||
    params.skill.role5Runtime.active
  ) {
    params.skill.lastResult = `role5 ${binding.skillName}: attacking`;
    return undefined;
  }

  const mpCost = getRole5SpearSkillMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  const damage = calculateRole5SpearSkillDamage(binding.skillName, binding.level, params.sourcePower);
  const projectile = spawnRole5SpearSkillProjectile({
    skillName: binding.skillName,
    system: params.projectiles,
    point: spawnPoint(params),
    damage,
    targets: params.targets ?? [],
  });
  const actionName = binding.skillName === 'xlc'
    ? 'hit6'
    : binding.skillName === 'lxuanj'
      ? 'hit7'
      : 'hit10';
  const durationMs = binding.skillName === 'xlc'
    ? Role5SkillTuning.xlcDurationMs
    : binding.skillName === 'lxuanj'
      ? Role5SkillTuning.lxuanjDurationMs
      : Role5SkillTuning.xkjzDurationMs;
  params.skill.role5Runtime.active = {
    skillName: binding.skillName,
    elapsedMs: 0,
    durationMs,
    facingX: params.movement.facingX,
    dashVelocityX: binding.skillName === 'xlc'
      ? Role5SkillTuning.xlcDashVelocityX * params.movement.facingX
      : undefined,
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, durationMs, true);
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectileId: projectile.id,
  };
  params.skill.lastResult = `role5 ${binding.skillName} ${actionName} mp ${params.skill.mp}/${params.skill.maxMp}`;
  return {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function requestRole5StatusSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  timeMs: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 5) return undefined;
  const yybCombo = isRole5YybComboRequested({
    heroId: params.normalAttack.heroId,
    skill: params.skill,
    input: params.input,
    previousInput: params.previousInput,
  });
  const slotIndex = yybCombo ? -1 : findSlot(params.input, params.previousInput);
  const binding = yybCombo
    ? findBinding(params.skill, 'yyb')
    : slotIndex === undefined ? undefined : params.skill.loadout.slots[slotIndex];
  if (!binding || !isRole5StatusSkillName(binding.skillName)) return undefined;
  const castSlotIndex = yybCombo ? -1 : slotIndex!;

  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    params.skill.activeAction ||
    params.skill.role5Runtime.active
  ) {
    params.skill.lastResult = `role5 ${binding.skillName}: attacking`;
    return undefined;
  }

  const mpCost = getRole5StatusSkillMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  const projectile = spawnRole5StatusSkillProjectile({
    skillName: binding.skillName,
    system: params.projectiles,
    point: spawnPoint(params),
  });
  const actionName = binding.skillName === 'yyb' ? 'hit9' : 'hit11';
  const durationMs = binding.skillName === 'yyb'
    ? Role5SkillTuning.yybDurationMs
    : Role5SkillTuning.tljDurationMs;
  if (binding.skillName === 'yyb') {
    params.skill.role5Runtime.yybRemainingMs = getRole5YybStatusDurationMs(binding.level);
    params.skill.role5Runtime.yybInverted = !params.skill.role5Runtime.yybInverted;
  } else {
    params.skill.role5Runtime.tljRemainingMs = getRole5YybStatusDurationMs(binding.level);
  }
  params.skill.role5Runtime.active = {
    skillName: binding.skillName,
    elapsedMs: 0,
    durationMs,
    facingX: params.movement.facingX,
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, durationMs, true);
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex: castSlotIndex,
    actionName,
    projectileId: projectile.id,
  };
  params.skill.lastResult = `role5 ${binding.skillName} ${actionName} mp ${params.skill.mp}/${params.skill.maxMp}`;
  return {
    skillName: binding.skillName,
    slotIndex: castSlotIndex,
    actionName,
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function requestRole5SwordSkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  timeMs: number;
  jrjlLevel?: number;
}): HeroSkillCastEvent | undefined {
  if (params.normalAttack.heroId !== 5) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (!binding || !isRole5SwordSkillName(binding.skillName)) return undefined;

  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    params.skill.activeAction ||
    params.skill.role5Runtime.active
  ) {
    params.skill.lastResult = `role5 ${binding.skillName}: attacking`;
    return undefined;
  }

  const mpCost = getRole5SwordSkillMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  const spawned = spawnRole5SwordSkillProjectiles({
    skillName: binding.skillName,
    system: params.projectiles,
    point: spawnPoint(params),
    level: binding.level,
    sourcePower: params.sourcePower,
    runtime: params.skill.role5Runtime,
    jrjlLevel: params.jrjlLevel ?? 0,
  });
  const durationMs = binding.skillName === 'pkz'
    ? Role5SkillTuning.pkzDurationMs
    : binding.skillName === 'lxj'
      ? Role5SkillTuning.lxjDurationMs
      : Role5SkillTuning.mlszDurationMs;
  const actionName = binding.skillName === 'pkz'
    ? 'hit24_1'
    : binding.skillName === 'lxj'
      ? 'hit26'
      : 'hit29';
  if (binding.skillName === 'lxj') {
    params.skill.role5Runtime.loongSwordRemainingMs = getRole5YybStatusDurationMs(binding.level);
    params.skill.role5Runtime.loongSwordLevel = clampRole5SkillLevel(binding.level);
  } else if (params.skill.role5Runtime.loongSwordRemainingMs > 0) {
    params.skill.role5Runtime.loongSwordFeijianOpportunities += 1;
  }
  params.skill.role5Runtime.active = {
    skillName: binding.skillName,
    elapsedMs: 0,
    durationMs,
    facingX: params.movement.facingX,
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, durationMs, true);
  const primary = spawned[0];
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectileId: primary.id,
  };
  params.skill.lastResult = `role5 ${binding.skillName} ${actionName} mp ${params.skill.mp}/${params.skill.maxMp}`;
  return {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectile: primary,
    spawnedProjectiles: spawned,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function requestRole5CompanionSkillFromInput(params: {
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
  if (params.normalAttack.heroId !== 5) return undefined;
  const slotIndex = findSlot(params.input, params.previousInput);
  if (slotIndex === undefined) return undefined;
  const binding = params.skill.loadout.slots[slotIndex];
  if (!binding || !isRole5CompanionSkillName(binding.skillName)) return undefined;

  if (
    params.combat.state !== 'ready' ||
    params.normalAttack.activeAttack ||
    params.skill.activeAction ||
    params.skill.role5Runtime.active
  ) {
    params.skill.lastResult = `role5 ${binding.skillName}: attacking`;
    return undefined;
  }

  if (binding.skillName === 'lysh' && params.skill.role5Runtime.lyshArrows.created) {
    return shootRole5LyshArrows(params, binding, slotIndex);
  }

  const mpCost = getRole5CompanionSkillMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `${binding.skillName} mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  const projectile = binding.skillName === 'lysh'
    ? createRole5LyshCompanion(params.projectiles, spawnPoint(params))
    : createRole5JrjlCompanion(params.projectiles, spawnPoint(params));
  const actionName = binding.skillName === 'lysh' ? 'hit27_1' : 'hit28';
  const durationMs = binding.skillName === 'lysh'
    ? Role5SkillTuning.lyshCreateDurationMs
    : Role5SkillTuning.jrjlDurationMs;
  if (binding.skillName === 'lysh') {
    params.skill.role5Runtime.lyshArrows = { created: true, charged: 0, chargeElapsedMs: 0 };
  } else {
    params.skill.role5Runtime.jrjlArrows = { created: true, charged: 0, chargeElapsedMs: 0 };
    params.skill.role5Runtime.jrjlLevel = clampRole5SkillLevel(binding.level);
  }
  params.skill.role5Runtime.active = {
    skillName: binding.skillName,
    elapsedMs: 0,
    durationMs,
    facingX: params.movement.facingX,
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, durationMs, true);
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectileId: projectile.id,
  };
  params.skill.lastResult = `role5 ${binding.skillName} ${actionName} mp ${params.skill.mp}/${params.skill.maxMp}`;
  return {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

export function triggerRole5JrjlArrow(params: {
  runtime: Role5SkillRuntime;
  projectiles: ProjectileSystemModel;
  point: ProjectileSpawnPoint;
  sourcePower: number;
}): ProjectileModel | undefined {
  if (!params.runtime.jrjlArrows.created || params.runtime.jrjlArrows.charged <= 0 || params.runtime.jrjlLevel <= 0) {
    return undefined;
  }
  params.runtime.jrjlArrows.charged -= 1;
  return spawnRole5JrjlShot(params.projectiles, params.point, calculateRole5CompanionArrowDamage(
    'jrjl',
    params.runtime.jrjlLevel,
    params.sourcePower,
  ));
}

export function updateRole5SkillRuntime(params: {
  runtime: Role5SkillRuntime;
  movement: HeroMovementModel;
  deltaMs: number;
}): void {
  params.runtime.yybRemainingMs = Math.max(0, params.runtime.yybRemainingMs - Math.max(0, params.deltaMs));
  params.runtime.tljRemainingMs = Math.max(0, params.runtime.tljRemainingMs - Math.max(0, params.deltaMs));
  params.runtime.loongSwordRemainingMs = Math.max(
    0,
    params.runtime.loongSwordRemainingMs - Math.max(0, params.deltaMs),
  );
  if (params.runtime.loongSwordRemainingMs === 0) {
    params.runtime.loongSwordLevel = 0;
  }
  chargeRole5Arrows(params.runtime.lyshArrows, Role5SkillTuning.lyshArrowCount, Role5SkillTuning.lyshArrowChargeMs, params.deltaMs);
  chargeRole5Arrows(params.runtime.jrjlArrows, Role5SkillTuning.jrjlArrowCount, Role5SkillTuning.jrjlArrowChargeMs, params.deltaMs);
  const action = params.runtime.active;
  if (!action) return;
  const deltaSeconds = Math.max(0, params.deltaMs) / 1_000;
  action.elapsedMs = Math.min(action.durationMs, action.elapsedMs + Math.max(0, params.deltaMs));
  if (action.dashVelocityX !== undefined) {
    params.movement.x += action.dashVelocityX * deltaSeconds;
    params.movement.velocityX = action.dashVelocityX;
    params.movement.velocityY = 0;
  }
  if (action.elapsedMs < action.durationMs) return;
  params.movement.velocityX = 0;
  params.runtime.active = undefined;
}

function spawnRole5StatusSkillProjectile(params: {
  skillName: Role5StatusSkillName;
  system: ProjectileSystemModel;
  point: ProjectileSpawnPoint;
}): ProjectileModel {
  const variant = params.skillName === 'yyb' ? 'role5-yyb-hit9' : 'role5-tlj-hit11';
  const tuning = params.skillName === 'yyb' ? role5YybTuning : role5TljTuning;
  const projectile = spawnProjectileFromTuning(params.system, params.point, variant, variant, tuning);
  projectile.visualOnly = true;
  params.system.projectiles.push(projectile);
  return projectile;
}

function spawnRole5SwordSkillProjectiles(params: {
  skillName: Role5SwordSkillName;
  system: ProjectileSystemModel;
  point: ProjectileSpawnPoint;
  level: number;
  sourcePower: number;
  runtime: Role5SkillRuntime;
  jrjlLevel: number;
}): ProjectileModel[] {
  if (params.skillName === 'lxj') {
    return [spawnOneSwordProjectile(params.system, params.point, 'role5-lxj-hit26', role5LxjTuning, 0)];
  }
  if (params.skillName === 'pkz') {
    const enhanced = params.runtime.loongSwordRemainingMs > 0;
    const damage = calculateRole5SwordSkillDamage(
      'pkz',
      params.level,
      params.sourcePower,
      params.runtime,
      params.jrjlLevel,
    ) / role5PkzTunings.length;
    return role5PkzTunings.map((tuning, index) => {
      const variant = enhanced && index === 0 ? 'role5-pkz-hit24-1-enhanced' : tuning.variant;
      const projectile = spawnOneSwordProjectile(params.system, params.point, variant, {
        ...tuning,
        assetKey: variant === 'role5-pkz-hit24-1-enhanced'
          ? SkillProjectileEffectKeys.role5PkzHit24_1Enhanced
          : tuning.assetKey,
      }, damage);
      projectile.activeAfterMs = index * 180;
      projectile.destroyWhenSourceHurt = false;
      return projectile;
    });
  }

  const enhanced = params.runtime.loongSwordRemainingMs > 0;
  const damage = calculateRole5SwordSkillDamage(
    'mlsz',
    params.level,
    params.sourcePower,
    params.runtime,
    params.jrjlLevel,
  ) / role5MlszTunings.length;
  return role5MlszTunings.map((tuning, index) => {
    const variant = enhanced ? tuning.enhancedVariant : tuning.variant;
    const projectile = spawnOneSwordProjectile(params.system, params.point, variant, {
      ...tuning,
      assetKey: enhanced ? SkillProjectileEffectKeys.role5MlszHit29Enhanced : tuning.assetKey,
      sourceSymbol: enhanced ? `${tuning.sourceSymbol}_1` : tuning.sourceSymbol,
      runtimeName: enhanced ? `${tuning.runtimeName}_1` : tuning.runtimeName,
    }, damage);
    projectile.activeAfterMs = index * 140;
    projectile.destroyWhenSourceHurt = false;
    return projectile;
  });
}

function spawnOneSwordProjectile(
  system: ProjectileSystemModel,
  point: ProjectileSpawnPoint,
  variant: ProjectileModel['variant'],
  tuning: ProjectileTuning,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, variant, variant, {
    ...tuning,
    damage,
  });
  system.projectiles.push(projectile);
  return projectile;
}

function shootRole5LyshArrows(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
    timeMs: number;
  },
  binding: SkillBinding,
  slotIndex: number,
): HeroSkillCastEvent | undefined {
  const runtime = params.skill.role5Runtime;
  if (runtime.lyshArrows.charged < Role5SkillTuning.lyshArrowCount) {
    params.skill.lastResult = `lysh charge ${runtime.lyshArrows.charged}/${Role5SkillTuning.lyshArrowCount}`;
    return undefined;
  }
  const damage = calculateRole5CompanionArrowDamage('lysh', binding.level, params.sourcePower, runtime);
  const point = spawnPoint(params);
  const spawned = Array.from({ length: Role5SkillTuning.lyshArrowCount }, (_, index) => {
    const projectile = spawnRole5LyshShot(params.projectiles, point, damage / Role5SkillTuning.lyshArrowCount);
    projectile.activeAfterMs = index * 90;
    return projectile;
  });
  runtime.lyshArrows = { created: false, charged: 0, chargeElapsedMs: 0 };
  runtime.active = {
    skillName: 'lysh',
    elapsedMs: 0,
    durationMs: Role5SkillTuning.lyshShootDurationMs,
    facingX: params.movement.facingX,
  };
  lockHeroMovementForSkill(params.movement, params.timeMs, Role5SkillTuning.lyshShootDurationMs, true);
  params.skill.activeAction = {
    skillName: 'lysh',
    slotIndex,
    actionName: 'hit27_2',
    projectileId: spawned[0].id,
  };
  params.skill.lastResult = `role5 lysh hit27_2 arrows:${spawned.length}`;
  return {
    skillName: 'lysh',
    slotIndex,
    actionName: 'hit27_2',
    projectile: spawned[0],
    spawnedProjectiles: spawned,
    mpBefore: params.skill.mp,
    mpAfter: params.skill.mp,
    mpCost: 0,
    reentered: true,
  };
}

function createRole5LyshCompanion(system: ProjectileSystemModel, point: ProjectileSpawnPoint): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role5-lysh-companion', 'role5-lysh-companion', role5LyshCompanionTuning);
  projectile.visualOnly = true;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

function createRole5JrjlCompanion(system: ProjectileSystemModel, point: ProjectileSpawnPoint): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role5-jrjl-companion', 'role5-jrjl-companion', role5JrjlCompanionTuning);
  projectile.visualOnly = true;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

function spawnRole5LyshShot(system: ProjectileSystemModel, point: ProjectileSpawnPoint, damage: number): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role5-lysh-shot', 'role5-lysh-shot', {
    ...role5LyshShotTuning,
    damage,
  });
  system.projectiles.push(projectile);
  return projectile;
}

function spawnRole5JrjlShot(system: ProjectileSystemModel, point: ProjectileSpawnPoint, damage: number): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, point, 'role5-jrjl-shot', 'role5-jrjl-shot', {
    ...role5JrjlShotTuning,
    damage,
  });
  system.projectiles.push(projectile);
  return projectile;
}

function chargeRole5Arrows(
  state: Role5CompanionArrowState,
  maxCount: number,
  chargeMs: number,
  deltaMs: number,
): void {
  if (!state.created || state.charged >= maxCount) return;
  state.chargeElapsedMs += Math.max(0, deltaMs);
  while (state.chargeElapsedMs >= chargeMs && state.charged < maxCount) {
    state.chargeElapsedMs -= chargeMs;
    state.charged += 1;
  }
}

function spawnRole5SpearSkillProjectile(params: {
  skillName: Role5SpearSkillName;
  system: ProjectileSystemModel;
  point: ProjectileSpawnPoint;
  damage: number;
  targets: readonly Role5SkillTarget[];
}): ProjectileModel {
  if (params.skillName === 'xkjz') {
    return spawnXkjzProjectile(params);
  }

  const tuning = params.skillName === 'xlc' ? role5XlcTuning : role5LxuanjTuning;
  const variant = params.skillName === 'xlc' ? 'role5-xlc-hit6' : 'role5-lxuanj-hit7-1';
  const projectile = spawnProjectileFromTuning(params.system, params.point, variant, variant, {
    ...tuning,
    damage: params.damage,
  });
  params.system.projectiles.push(projectile);
  return projectile;
}

function spawnXkjzProjectile(params: {
  system: ProjectileSystemModel;
  point: ProjectileSpawnPoint;
  damage: number;
  targets: readonly Role5SkillTarget[];
}): ProjectileModel {
  const target = selectFacingTarget(params.point, params.targets);
  const point = target
    ? {
      ...params.point,
      x: target.x + params.point.facingX * (208 - role5XkjzTuning.offsetX),
      y: target.y,
    }
    : params.point;
  const projectile = spawnProjectileFromTuning(
    params.system,
    point,
    'role5-xkjz-hit10',
    'role5-xkjz-hit10',
    { ...role5XkjzTuning, damage: params.damage },
  );
  params.system.projectiles.push(projectile);
  return projectile;
}

function selectFacingTarget(
  point: ProjectileSpawnPoint,
  targets: readonly Role5SkillTarget[],
): Role5SkillTarget | undefined {
  return targets
    .filter((target) => target.alive && target.hp > 0 && (
      point.facingX === 1 ? target.x > point.x : target.x < point.x
    ))
    .sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y))[0];
}

function spawnPoint(params: {
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

function findSlot(
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
): number | undefined {
  return input.skillSlots.findIndex((pressed, index) =>
    pressed && !(previousInput?.skillSlots[index] ?? false));
}

function findBinding(skill: HeroSkillModel, skillName: Role5SkillName): SkillBinding | undefined {
  return skill.loadout.slots.find((binding) => binding?.skillName === skillName) ?? undefined;
}

