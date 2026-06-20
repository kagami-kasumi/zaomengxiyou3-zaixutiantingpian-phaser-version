import {
  spawnPetUfo1PmsProjectile,
  spawnPetUfo3KmskProjectile,
} from './PetUfoProjectileSystem';
import type { ProjectileSystemModel } from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type {
  PetRoster,
  PetRuntimeModel,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillState,
  PetSkillTarget,
  PetState,
} from './PetTypes';

export function requestPetUfo1PmsSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'ufo') {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not ufo`, pet);
  }

  if (!pet.skills.includes('pms')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned pms`, pet);
  }

  if (pet.mp < PetTuning.ufo1PmsMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for pms`, pet);
  }

  if (state.ufo1Pms.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} pms cooling ${Math.ceil(state.ufo1Pms.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} pms has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.ufo1PmsDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.ufo1PmsMpCost);
  state.ufo1Pms.cooldownMs = PetTuning.ufo1PmsCooldownMs;

  const projectile = spawnPetUfo1PmsProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} pms -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

function ensurePetSkillState(pet: PetState): PetSkillState {
  pet.skillState ??= createPetSkillState();
  return pet.skillState;
}

function calculatePetSkillDamage(
  pet: PetState,
  multiplier: number,
  random: PetSkillRandomSource = Math.random,
): number {
  const baseDamage = pet.atk * multiplier + Math.max(0, pet.skillDamageBonus ?? 0);
  return calculatePetSkillDamageFromBase(baseDamage, pet, random);
}

function calculatePetSkillDamageFromBase(
  baseDamage: number,
  pet: PetState,
  random: PetSkillRandomSource = Math.random,
): number {
  const critRate = Math.max(0, Math.min(1, pet.critBonusRate ?? 0));
  if (critRate <= 0) {
    return baseDamage;
  }

  return random() <= critRate ? baseDamage * PetTuning.petSkillCritDamageMultiplier : baseDamage;
}

function selectPetSkillTarget(
  runtime: PetRuntimeModel | undefined,
  targets: readonly PetSkillTarget[],
): PetSkillTarget | undefined {
  const aliveTargets = targets.filter((target) => target.isAlive);
  if (aliveTargets.length === 0) {
    return undefined;
  }

  if (!runtime) {
    return aliveTargets[0];
  }

  return aliveTargets.reduce((nearest, target) => {
    const nearestDistance = Math.hypot(nearest.x - runtime.x, nearest.y - runtime.y);
    const targetDistance = Math.hypot(target.x - runtime.x, target.y - runtime.y);
    return targetDistance < nearestDistance ? target : nearest;
  });
}

function getPetSkillFacing(
  runtime: PetRuntimeModel | undefined,
  target: PetSkillTarget,
): -1 | 1 {
  if (!runtime) {
    return 1;
  }
  return target.x < runtime.x ? -1 : 1;
}

export function requestPetUfo2SsSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'ufo' || pet.form < 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not ufo2+`, pet);
  }

  if (!pet.skills.includes('ss')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned ss`, pet);
  }

  if (pet.mp < PetTuning.ufo2SsMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for ss`, pet);
  }

  if (state.ufo2Ss.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} ss cooling ${Math.ceil(state.ufo2Ss.cooldownMs)}ms`, pet);
  }

  const target = selectRandomPetSkillTarget(params.targets, params.random);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} ss has no target`, pet);
  }

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.ufo2SsMpCost);
  state.ufo2Ss.cooldownMs = PetTuning.ufo2SsCooldownMs;

  // Teleport behind target: determine which side the pet should appear on
  // "传送到目标朝向背后约 40 像素、y - 40"
  // The pet runtime determines which side is "behind" — we use the runtime facing
  // as a hint; if no runtime, default to placing pet to the right of the target
  const behindDirection = params.runtime ? (params.runtime.facingX > 0 ? 1 : -1) : 1;
  const teleportX = target.x + behindDirection * PetTuning.ufo2SsTeleportBehindDistance;
  const teleportY = target.y + PetTuning.ufo2SsTeleportYOffset;

  state.ufo2Ss.teleportX = teleportX;
  state.ufo2Ss.teleportY = teleportY;
  state.ufo2Ss.basicAttackTargetId = target.id;

  const basicAttackFeedback = `${pet.displayName} ss teleport behind ${target.id} (${teleportX.toFixed(0)},${teleportY.toFixed(0)}), normalHit feedback`;
  const message = `${pet.displayName} ss -> ${target.id} teleport(${teleportX.toFixed(0)},${teleportY.toFixed(0)}) dmg=0 basicAtk`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    damage: PetTuning.ufo2SsDirectDamage,
    mpBefore,
    mpAfter: pet.mp,
    teleportX,
    teleportY,
    basicAttackFeedback,
  };
}

export function completePetUfo3KmskRising(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    state.ufo3Kmsk.risingMs = 0;
    state.ufo3Kmsk.risingTotalMs = 0;
    return setPetSkillFailure(params.roster, `${pet.displayName} kmsk strike has no target`, pet);
  }

  return finishPetUfo3KmskStrike(pet, state, params, target);
}

export function requestPetUfo3KmskSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'ufo' || pet.form < 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not ufo3+`, pet);
  }

  if (!pet.skills.includes('kmsk')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned kmsk`, pet);
  }

  if (pet.mp < PetTuning.ufo3KmskMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for kmsk`, pet);
  }

  if (state.ufo3Kmsk.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} kmsk cooling ${Math.ceil(state.ufo3Kmsk.cooldownMs)}ms`, pet);
  }

  // kmsk doesn't require a target for the rise phase (can start without target),
  // but needs one for the strike phase. For minimum slice, require target upfront.
  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} kmsk has no target`, pet);
  }

  // Phase 1: Rising (hit4_1)
  // Start rising phase - bridge handles visual Tween
  // We check if already rising (re-entry during rise phase is allowed per AS3 hit4_1 -> hit4_2)

  // If already in rising phase (hit4_1 active), transition to strike phase (hit4_2)
  if (state.ufo3Kmsk.risingMs > 0) {
    // Phase 2: Strike (hit4_2) - spawn projectile below the pet
    return finishPetUfo3KmskStrike(pet, state, params, target);
  }

  // Phase 1: Start rising
  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.ufo3KmskMpCost);
  state.ufo3Kmsk.cooldownMs = PetTuning.ufo3KmskCooldownMs;
  state.ufo3Kmsk.risingMs = PetTuning.ufo3KmskRiseDurationMs;
  state.ufo3Kmsk.risingTotalMs = PetTuning.ufo3KmskRiseDurationMs;

  const message = `${pet.displayName} kmsk rising (hit4_1) ${PetTuning.ufo3KmskRiseDurationMs}ms`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    damage: 0,
    mpBefore,
    mpAfter: pet.mp,
  };
}

function finishPetUfo3KmskStrike(
  pet: PetState,
  state: PetSkillState,
  params: {
    roster: PetRoster;
    runtime: PetRuntimeModel | undefined;
    targets: readonly PetSkillTarget[];
    projectiles: ProjectileSystemModel;
    random?: PetSkillRandomSource;
  },
  target: PetSkillTarget,
): PetSkillCastResult {
  state.ufo3Kmsk.risingMs = 0;
  state.ufo3Kmsk.risingTotalMs = 0;

  const petX = params.runtime?.x ?? 0;
  const petY = (params.runtime?.y ?? 0) + PetTuning.ufo3KmskRisePixels;
  const spawnX = petX;
  const spawnY = petY + PetTuning.ufo3KmskProjectileSpawnYOffset;

  const damage = calculatePetSkillDamage(pet, PetTuning.ufo3KmskDamageMultiplier, params.random);
  const projectile = spawnPetUfo3KmskProjectile(params.projectiles, {
    sourceId: pet.id,
    x: spawnX,
    y: spawnY,
    facingX: params.runtime?.facingX ?? 1,
  }, damage);

  state.ufo3Kmsk.lastProjectileSpawnX = spawnX;
  state.ufo3Kmsk.lastProjectileSpawnY = spawnY;

  const message = `${pet.displayName} kmsk strike (hit4_2) -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
  };
}

function selectRandomPetSkillTarget(
  targets: readonly PetSkillTarget[],
  random: PetSkillRandomSource = Math.random,
): PetSkillTarget | undefined {
  const aliveTargets = targets.filter((target) => target.isAlive);
  if (aliveTargets.length === 0) {
    return undefined;
  }

  const index = Math.floor(random() * aliveTargets.length);
  return aliveTargets[index];
}

function setPetSkillFailure(
  roster: PetRoster,
  message: string,
  pet?: PetState,
): PetSkillCastResult {
  if (pet) {
    ensurePetSkillState(pet).lastResult = message;
  }
  roster.message = message;
  return { ok: false, message, pet };
}
