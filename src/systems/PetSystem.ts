import {
  spawnPetMonkey2LjProjectile,
  spawnPetMonkey2XjProjectile,
  spawnPetMonkey3LyqProjectile,
  spawnPetMonkey3XjProjectile,
  spawnPetMonkey3LjProjectile,
  spawnPetMonkey4JgaoyiProjectile,
  spawnPetMonkey1XjProjectile,
  spawnPetHorse1SpProjectile,
  spawnPetHorse2BdProjectile,
  spawnPetHorse3BzProjectile,
  spawnPetHorse4TmaoyiExplodeProjectile,
  spawnPetHorse4TmaoyiProjectile,
  spawnPetDragon1FsProjectile,
  spawnPetDragon2SdccProjectile,
  spawnPetDragon3LtwjProjectile,
  spawnPetDragon4QlaoyiProjectile,
  type ProjectileModel,
  type ProjectileSystemModel,
} from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type {
  PetCounterRandomSource,
  PetDragon4QlaoyiComboState,
  PetRoster,
  PetRuntimeModel,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillState,
  PetSkillTarget,
  PetState,
} from './PetTypes';
export { CapturablePetDefinitions, PetBaseSkillCandidates, PetSkillInfoByKey, PetTuning } from './PetTuning';
export { buildCompactPetPanelLines, buildPetPanelLines, buildPetSkillSlotViews, getPetSkillDisplay } from './PetPanelSystem';
export { addPetExperience, getPetBaseStats, getPetExperienceToNextLevel, refreshPetStatsForLevel, resetPetSkillsByLevel } from './PetProgressionSystem';
export { updatePetAutoBuffs } from './PetAutoBuffSystem';
export { createPetRuntime, syncPetRuntimeWithRoster, updatePetRuntime } from './PetRuntimeSystem';
export { createPetSkillState } from './PetSkillStateSystem';
export { catchNewPet, createSeedPetRoster, getActivePet, getCurrentPet, getSelectedPet, restSelectedPet, selectPet, setSelectedPetActive, toggleSelectedPetActive } from './PetRosterSystem';
export { closePetPanel, createPetPanelSession, createPlayerPetRosters, getPlayerPetRoster, PetUiKeyCodes, selectOwnedPet, toggleOwnedPetActive, togglePetPanelForOwner } from './PetOwnershipSystem';
export type { PetPanelSession, PlayerPetRosters } from './PetOwnershipSystem';
export { applyOwnedPetDamageRedirect, awardMonsterExperienceByTarget, claimMonsterExperienceForCurrentTarget, markOwnedPetSkillTriggered } from './PetBattleOwnershipSystem';
export type { OwnedMonsterExperienceAward, PetExperienceTarget } from './PetBattleOwnershipSystem';
export { awardMonsterExperienceWithCurrentPet, isPetConsumableFillName, usePetConsumable } from './PetConsumableSystem';
export { evolvePetWithItem, rerollPetGrowthAttribute, rerollPetGrowthAttributes, returnPetToChild } from './PetGrowthSystem';
export { createMagicBottleCaptureModel, requestMagicBottleCapture, resolveMagicBottleCaptureHit, updateMagicBottleCapture } from './PetMagicBottleSystem';
export { markActivePetSkillTriggered, updatePetSkillState } from './PetSkillTickSystem';
export { getAdvancedPetSkillPriority, type AdvancedPetSkillSpecies } from './PetSkillPrioritySystem';
export { applyPetMagicFlowerBuff, clearPetMagicFlowerBuff } from './PetMagicFlowerSystem';
export { applyPetSkillSaveString, decodePetSkillSaveString, encodePetSkillSaveString } from './PetSkillSaveSystem';
export {
  applyPetTurtleTxljOwnerDamage,
  applyPetTurtleTxljOwnerHeal,
  requestPetTurtle1SldSkill,
  requestPetTurtle2TxljSkill,
  requestPetTurtle3SybhSkill,
  requestPetTurtle4XwaoyiSkill,
} from './PetTurtleSkillSystem';
export { completePetUfo3KmskRising, requestPetUfo1PmsSkill, requestPetUfo2SsSkill, requestPetUfo3KmskSkill } from './PetUfoSkillSystem';
export { requestPetTiger1HySkill, requestPetTiger2SxhzSkill, requestPetTiger3HsqjSkill, requestPetTiger4BhaoyiSkill, updatePetTiger4BhaoyiCombo } from './PetTigerSkillSystem';
export { applyPetPhoenixNpIncomingDamage, requestPetPhoenix1NpSkill, requestPetPhoenix2BshnSkill, requestPetPhoenix3DhlySkill, requestPetPhoenix4ZqaoyiSkill } from './PetPhoenixSkillSystem';
export { markPetRabbitBasicAttackHit, requestPetRabbit1YgSkill, requestPetRabbit2JfSkill, requestPetRabbit3BsSkill, requestPetRabbit4YsaoyiSkill, updatePetRabbitPersistentEffects } from './PetRabbitSkillSystem';
export { requestPetMouse1ScSkill, requestPetMouse4HxfbSkill, requestPetMouse4ZsaoyiSkill, updatePetMouse4ZsaoyiCombo } from './PetMouseSkillSystem';
export type {
  CapturableMonsterId,
  CapturablePetDefinition,
  CapturablePetTarget,
  MagicBottleCaptureModel,
  MagicBottleEffect,
  MonsterExperienceShareResult,
  PetAutoBuffActiveEffect,
  PetAutoBuffEffectState,
  PetAutoBuffOwnerStats,
  PetAutoBuffUpdateResult,
  PetConsumableFillName,
  PetConsumableResult,
  PetCounterRandomSource,
  PetDragon4QlaoyiComboState,
  PetExperienceResult,
  PetFormChange,
  PetId,
  PetOwnerSnapshot,
  PetRoster,
  PetRuntimeModel,
  PetRuntimeState,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillResetResult,
  PetSkillSlotView,
  PetSkillState,
  PetSkillTarget,
  PetState,
} from './PetTypes';
export function requestPetQlfjCounterAttack(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  random?: PetCounterRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  if (!pet.skills.includes('qlfj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned qlfj`, pet);
  }

  if (pet.hp <= 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlfj cannot counter while defeated`, pet);
  }

  const chance = calculatePetQlfjCounterChance(pet);
  const roll = Math.max(0, Math.min(1, params.random?.() ?? Math.random()));
  if (roll > chance) {
    const message = `${pet.displayName} qlfj missed roll:${roll.toFixed(3)} chance:${chance.toFixed(3)}`;
    ensurePetSkillState(pet).lastResult = message;
    params.roster.message = message;
    return {
      ok: false,
      message,
      pet,
      mpBefore: pet.mp,
      mpAfter: pet.mp,
    };
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlfj has no target`, pet);
  }

  const damage = pet.atk;
  const message = `${pet.displayName} qlfj counter -> ${target.id} ${damage.toFixed(1)}`;
  ensurePetSkillState(pet).lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    damage,
    mpBefore: pet.mp,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey1XjSkill(params: {
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
  if (pet.species !== 'monkey' || pet.form !== 1) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey1`, pet);
  }

  if (!pet.skills.includes('xj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xj`, pet);
  }

  if (pet.mp < PetTuning.monkey1XjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xj`, pet);
  }

  if (!state.monkey1Xj.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj trigger not ready`, pet);
  }

  if (state.monkey1Xj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj cooling ${Math.ceil(state.monkey1Xj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey1XjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey1XjMpCost);
  state.monkey1Xj.releaseReady = false;
  state.monkey1Xj.cooldownMs = PetTuning.monkey1XjCooldownMs;

  const projectile = spawnPetMonkey1XjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} xj -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetMonkey2LjSkill(params: {
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
  if (pet.species !== 'monkey' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey2`, pet);
  }

  if (!pet.skills.includes('lj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned lj`, pet);
  }

  if (pet.mp < PetTuning.monkey2LjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for lj`, pet);
  }

  if (state.monkey2Lj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj cooling ${Math.ceil(state.monkey2Lj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey2LjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey2LjMpCost);
  state.monkey2Lj.cooldownMs = PetTuning.monkey2LjCooldownMs;

  const projectile = spawnPetMonkey2LjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} lj -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetMonkey2XjSkill(params: {
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
  if (pet.species !== 'monkey' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey2`, pet);
  }

  if (!pet.skills.includes('xj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xj`, pet);
  }

  if (pet.mp < PetTuning.monkey2XjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xj`, pet);
  }

  if (!state.monkey2Xj.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj trigger not ready`, pet);
  }

  if (state.monkey2Xj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj cooling ${Math.ceil(state.monkey2Xj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey2XjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey2XjMpCost);
  state.monkey2Xj.releaseReady = false;
  state.monkey2Xj.cooldownMs = PetTuning.monkey2XjCooldownMs;

  const projectile = spawnPetMonkey2XjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} xj -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetMonkey3LyqSkill(params: {
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
  if (pet.species !== 'monkey' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey3`, pet);
  }

  if (!pet.skills.includes('lyq')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned lyq`, pet);
  }

  if (pet.mp < PetTuning.monkey3LyqMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for lyq`, pet);
  }

  if (state.monkey3Lyq.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lyq cooling ${Math.ceil(state.monkey3Lyq.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lyq has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.monkey3LyqMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lyq target too far ${Math.ceil(distance)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey3LyqDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey3LyqMpCost);
  state.monkey3Lyq.cooldownMs = PetTuning.monkey3LyqCooldownMs;

  const projectile = spawnPetMonkey3LyqProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} lyq -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetMonkey3XjSkill(params: {
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
  if (pet.species !== 'monkey' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey3`, pet);
  }

  if (!pet.skills.includes('xj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xj`, pet);
  }

  if (pet.mp < PetTuning.monkey3XjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xj`, pet);
  }

  if (state.monkey3Xj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj cooling ${Math.ceil(state.monkey3Xj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey3XjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey3XjMpCost);
  state.monkey3Xj.cooldownMs = PetTuning.monkey3XjCooldownMs;

  const projectile = spawnPetMonkey3XjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} xj -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetMonkey3LjSkill(params: {
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
  if (pet.species !== 'monkey' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey3`, pet);
  }

  if (!pet.skills.includes('lj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned lj`, pet);
  }

  if (pet.mp < PetTuning.monkey3LjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for lj`, pet);
  }

  if (!state.monkey3Lj.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj trigger not ready`, pet);
  }

  if (state.monkey3Lj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj cooling ${Math.ceil(state.monkey3Lj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey3LjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey3LjMpCost);
  state.monkey3Lj.releaseReady = false;
  state.monkey3Lj.cooldownMs = PetTuning.monkey3LjCooldownMs;

  const projectile = spawnPetMonkey3LjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} lj -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetMonkey4JgaoyiSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 4) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey4`, pet);
  }

  if (!pet.skills.includes('jgaoyi')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned jgaoyi`, pet);
  }

  if (pet.mp < PetTuning.monkey4JgaoyiMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for jgaoyi`, pet);
  }

  if (state.monkey4Jgaoyi.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} jgaoyi cooling ${Math.ceil(state.monkey4Jgaoyi.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} jgaoyi has no target`, pet);
  }

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey4JgaoyiMpCost);
  state.monkey4Jgaoyi.cooldownMs = PetTuning.monkey4JgaoyiCooldownMs;

  const projectile = spawnPetMonkey4JgaoyiProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  });

  const message = `${pet.displayName} jgaoyi -> ${target.id} hit5`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage: PetTuning.monkey4JgaoyiHit5Damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetHorse1SpSkill(params: {
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
  if (pet.species !== 'horse' || pet.form !== 1) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse1`, pet);
  }

  if (!pet.skills.includes('sp')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned sp`, pet);
  }

  if (pet.mp < PetTuning.horse1SpMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for sp`, pet);
  }

  if (state.horse1Sp.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp cooling ${Math.ceil(state.horse1Sp.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance < PetTuning.horse1SpMinDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp target too close ${Math.floor(distance)}`, pet);
  }
  if (distance > PetTuning.horse1SpMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp target too far ${Math.ceil(distance)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.horse1SpDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.horse1SpMpCost);
  state.horse1Sp.cooldownMs = PetTuning.horse1SpCooldownMs;

  const projectile = spawnPetHorse1SpProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} sp -> ${target.id} ${damage.toFixed(1)} ice`;
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

export function requestPetHorse2BdSkill(params: {
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
  if (pet.species !== 'horse' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse2`, pet);
  }

  if (!pet.skills.includes('bd')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned bd`, pet);
  }

  if (pet.mp < PetTuning.horse2BdMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for bd`, pet);
  }

  if (!state.horse2Bd.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bd trigger not ready`, pet);
  }

  if (state.horse2Bd.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bd cooling ${Math.ceil(state.horse2Bd.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bd has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.horse2BdDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.horse2BdMpCost);
  state.horse2Bd.releaseReady = false;
  state.horse2Bd.cooldownMs = PetTuning.horse2BdCooldownMs;

  const projectile = spawnPetHorse2BdProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} bd -> ${target.id} ${damage.toFixed(1)} ice`;
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

export function requestPetHorse3BzSkill(params: {
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
  if (pet.species !== 'horse' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse3`, pet);
  }

  if (!pet.skills.includes('bz')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned bz`, pet);
  }

  if (pet.mp < PetTuning.horse3BzMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for bz`, pet);
  }

  if (state.horse3Bz.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bz cooling ${Math.ceil(state.horse3Bz.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bz has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.horse3BzMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bz target too far ${Math.ceil(distance)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.horse3BzDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.horse3BzMpCost);
  state.horse3Bz.cooldownMs = PetTuning.horse3BzCooldownMs;

  const projectile = spawnPetHorse3BzProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} bz -> ${target.id} ${damage.toFixed(1)} ice`;
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

export function requestPetHorse4TmaoyiSkill(params: {
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
  if (pet.species !== 'horse' || pet.form !== 4) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse4`, pet);
  }

  if (!pet.skills.includes('tmaoyi')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned tmaoyi`, pet);
  }

  if (pet.mp < PetTuning.horse4TmaoyiMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for tmaoyi`, pet);
  }

  if (state.horse4Tmaoyi.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} tmaoyi cooling ${Math.ceil(state.horse4Tmaoyi.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} tmaoyi has no target`, pet);
  }

  const hasSp = pet.skills.includes('sp');
  const hasBd = pet.skills.includes('bd');
  const hasBz = pet.skills.includes('bz');
  const explosionDamage = hasBz
    ? calculatePetSkillDamage(pet, PetTuning.horse3BzDamageMultiplier, params.random)
    : undefined;
  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.horse4TmaoyiMpCost);
  state.horse4Tmaoyi.cooldownMs = PetTuning.horse4TmaoyiCooldownMs;

  const projectile = spawnPetHorse4TmaoyiProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, {
    targetId: target.id,
    tracksTarget: hasSp,
    magicIceMs: hasBd ? PetTuning.horse4TmaoyiIceMsWithBd : undefined,
    explosionDelayMs: hasBd && hasBz ? PetTuning.horse4TmaoyiExplosionDelayMsWithBd : undefined,
    explosionDamage,
  });

  if (hasBz && explosionDamage !== undefined) {
    spawnPetHorse4TmaoyiExplodeProjectile(params.projectiles, {
      sourceId: pet.id,
      x: target.x,
      y: target.y,
      facingX: getPetSkillFacing(params.runtime, target),
    }, explosionDamage);
  }

  const comboText = `${hasSp ? 'sp-track' : 'drop'}${hasBd ? '+bd-ice' : ''}${hasBz ? '+bz-explode' : ''}`;
  const message = `${pet.displayName} tmaoyi -> ${target.id} ${comboText}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage: PetTuning.horse4TmaoyiHit5Damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetDragon1FsSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  projectiles: ProjectileSystemModel;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'dragon' || pet.form !== 1) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not dragon1`, pet);
  }

  if (!pet.skills.includes('fs')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned fs`, pet);
  }

  if (pet.mp < PetTuning.dragon1FsMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for fs`, pet);
  }

  if (state.dragon1Fs.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} fs cooling ${Math.ceil(state.dragon1Fs.cooldownMs)}ms`, pet);
  }

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.dragon1FsMpCost);
  state.dragon1Fs.cooldownMs = PetTuning.dragon1FsCooldownMs;
  state.dragon1Fs.cloneRemainingMs = PetTuning.dragon1FsCloneDurationMs;

  const projectile = spawnPetDragon1FsProjectile(params.projectiles, {
    sourceId: pet.id,
    x: (params.runtime?.x ?? 0) - (params.runtime?.facingX ?? 1) * 44,
    y: (params.runtime?.y ?? 0) - 50,
    facingX: params.runtime?.facingX ?? 1,
  });

  const message = `${pet.displayName} fs clone ${Math.ceil(PetTuning.dragon1FsCloneDurationMs / 1000)}s`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    projectile,
    damage: PetTuning.dragon1FsHit2Damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetDragon2SdccSkill(params: {
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
  if (pet.species !== 'dragon' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not dragon2`, pet);
  }

  if (!pet.skills.includes('sdcc')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned sdcc`, pet);
  }

  if (pet.mp < PetTuning.dragon2SdccMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for sdcc`, pet);
  }

  if (state.dragon2Sdcc.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sdcc cooling ${Math.ceil(state.dragon2Sdcc.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sdcc has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.dragon2SdccMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sdcc target too far ${Math.ceil(distance)}`, pet);
  }

  const damage = calculatePetSkillDamageFromBase(calculatePetDragon2SdccBaseDamage(pet), pet, params.random);
  const healOnHit = calculatePetDragon2SdccHealOnHit(pet);
  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.dragon2SdccMpCost);
  state.dragon2Sdcc.cooldownMs = PetTuning.dragon2SdccCooldownMs;
  state.dragon2Sdcc.lastHealOnHit = healOnHit;

  const projectile = spawnPetDragon2SdccProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage, healOnHit);

  const message = `${pet.displayName} sdcc -> ${target.id} ${damage.toFixed(1)} heal:${healOnHit}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    healOnHit,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetDragon3LtwjSkill(params: {
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
  if (pet.species !== 'dragon' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not dragon3`, pet);
  }

  if (!pet.skills.includes('ltwj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned ltwj`, pet);
  }

  if (pet.mp < PetTuning.dragon3LtwjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for ltwj`, pet);
  }

  if (state.dragon3Ltwj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} ltwj cooling ${Math.ceil(state.dragon3Ltwj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} ltwj has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.dragon3LtwjMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} ltwj target too far ${Math.ceil(distance)}`, pet);
  }

  const damage = calculatePetSkillDamageFromBase(calculatePetDragon3LtwjBaseDamage(pet), pet, params.random);
  const healOnHit = calculatePetDragon3LtwjHealOnHit(pet);
  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.dragon3LtwjMpCost);
  state.dragon3Ltwj.cooldownMs = PetTuning.dragon3LtwjCooldownMs;
  state.dragon3Ltwj.lastHealOnHit = healOnHit;

  let firstProjectile: ProjectileModel | undefined;
  for (let index = 0; index < PetTuning.dragon3LtwjProjectileCount; index += 1) {
    const projectile = spawnPetDragon3LtwjProjectile(params.projectiles, {
      sourceId: pet.id,
      x: target.x + (index - 1.5) * 28,
      y: target.y - index * 10,
      facingX: getPetSkillFacing(params.runtime, target),
    }, damage, healOnHit, index + 1);
    firstProjectile ??= projectile;
  }

  const message = `${pet.displayName} ltwj -> ${target.id} ${damage.toFixed(1)}x${PetTuning.dragon3LtwjProjectileCount} heal:${healOnHit}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile: firstProjectile,
    damage,
    healOnHit,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetDragon4QlaoyiSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'dragon' || pet.form !== 4) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not dragon4`, pet);
  }

  if (!pet.skills.includes('qlaoyi')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned qlaoyi`, pet);
  }

  if (pet.mp < PetTuning.dragon4QlaoyiMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for qlaoyi`, pet);
  }

  if (state.dragon4Qlaoyi.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlaoyi cooling ${Math.ceil(state.dragon4Qlaoyi.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlaoyi has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.dragon4QlaoyiMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlaoyi target too far ${Math.ceil(distance)}`, pet);
  }

  const combo = getPetDragon4QlaoyiComboState(pet);
  const comboTags = getPetDragon4QlaoyiComboTags(combo);
  const mpBefore = pet.mp;
  const damage = PetTuning.dragon4QlaoyiHit4Damage;
  pet.mp = Math.max(0, pet.mp - PetTuning.dragon4QlaoyiMpCost);
  state.dragon4Qlaoyi.cooldownMs = PetTuning.dragon4QlaoyiCooldownMs;
  state.dragon4Qlaoyi.lastCombo = combo;

  const projectile = spawnPetDragon4QlaoyiProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, comboTags);

  const message = `${pet.displayName} qlaoyi -> ${target.id} combos:${comboTags.length > 0 ? comboTags.join('+') : 'none'}`;
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

function calculatePetDragon2SdccBaseDamage(pet: PetState): number {
  return ((0.03 * pet.maxHp) + (3 * pet.atk)) * 1.05 + Math.max(0, pet.skillDamageBonus ?? 0);
}

function calculatePetDragon2SdccHealOnHit(pet: PetState): number {
  return Math.floor((pet.maxHp * 0.018) + (pet.atk * 0.18) + (pet.level * 2));
}

function calculatePetDragon3LtwjBaseDamage(pet: PetState): number {
  return ((0.024 * pet.maxHp) + (3.6 * 2 * pet.atk)) * 1.05 + Math.max(0, pet.skillDamageBonus ?? 0);
}

function calculatePetDragon3LtwjHealOnHit(pet: PetState): number {
  return Math.floor((pet.maxHp * 0.028) + (pet.atk * 0.09) + (pet.level * 2));
}

function getPetDragon4QlaoyiComboState(pet: PetState): PetDragon4QlaoyiComboState {
  return {
    cloneCombo: pet.skills.includes('fs'),
    sdccCombo: pet.skills.includes('sdcc'),
    ltwjCombo: pet.skills.includes('ltwj'),
  };
}

function getPetDragon4QlaoyiComboTags(combo: PetDragon4QlaoyiComboState): string[] {
  const tags: string[] = [];
  if (combo.cloneCombo) {
    tags.push('fs-clone');
  }
  if (combo.sdccCombo) {
    tags.push('sdcc-charge');
  }
  if (combo.ltwjCombo) {
    tags.push('ltwj-multi');
  }
  return tags;
}

function calculatePetQlfjCounterChance(pet: PetState): number {
  return Math.max(0, Math.min(1, (
    PetTuning.qlfjBaseChance + pet.form * PetTuning.qlfjFormChanceStep
  ) * pet.warpower * PetTuning.qlfjChanceMultiplier));
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

function getPetSkillDistance(
  runtime: PetRuntimeModel | undefined,
  target: PetSkillTarget,
): number {
  if (!runtime) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.hypot(target.x - runtime.x, target.y - runtime.y);
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



