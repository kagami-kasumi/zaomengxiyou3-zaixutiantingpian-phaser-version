import {
  spawnPetTurtle1SldProjectile,
  spawnPetTurtle3SybhProjectile,
  spawnPetTurtle4XwaoyiProjectile,
  type ProjectileSystemModel,
} from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type {
  PetAutoBuffOwnerStats,
  PetRoster,
  PetRuntimeModel,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillState,
  PetSkillTarget,
  PetState,
  PetTurtle4XwaoyiComboState,
} from './PetTypes';

export function requestPetTurtle1SldSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  ownerStats?: PetAutoBuffOwnerStats;
  random?: PetSkillRandomSource;
  freeCast?: boolean;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'turtle') {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not turtle`, pet);
  }

  if (!pet.skills.includes('sld')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned sld`, pet);
  }

  if (!params.freeCast && pet.mp < PetTuning.turtle1SldMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for sld`, pet);
  }

  if (!params.freeCast && state.turtle1Sld.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sld cooling ${Math.ceil(state.turtle1Sld.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sld has no target`, pet);
  }

  if (!params.freeCast) {
    const distance = getPetSkillDistance(params.runtime, target);
    if (distance < PetTuning.turtle1SldMinDistance) {
      return setPetSkillFailure(params.roster, `${pet.displayName} sld target too close ${Math.floor(distance)}`, pet);
    }
    if (distance > PetTuning.turtle1SldMaxDistance) {
      return setPetSkillFailure(params.roster, `${pet.displayName} sld target too far ${Math.ceil(distance)}`, pet);
    }
  }

  const mpBefore = pet.mp;
  const hpBefore = pet.hp;
  const damage = calculatePetSkillDamage(pet, PetTuning.turtle1SldDamageMultiplier, params.random);
  const heal = Math.max(0, damage);
  if (!params.freeCast) {
    pet.mp = Math.max(0, pet.mp - PetTuning.turtle1SldMpCost);
    state.turtle1Sld.cooldownMs = PetTuning.turtle1SldCooldownMs;
  }
  pet.hp = Math.min(pet.maxHp, pet.hp + heal);
  state.turtle1Sld.lastHeal = pet.hp - hpBefore;
  state.turtle1Sld.lastOwnerHeal = 0;
  if (params.ownerStats && isPetTurtleTxljLinkActive(pet)) {
    const ownerHpBefore = params.ownerStats.hp;
    params.ownerStats.hp = Math.min(params.ownerStats.maxHp, params.ownerStats.hp + state.turtle1Sld.lastHeal);
    state.turtle1Sld.lastOwnerHeal = params.ownerStats.hp - ownerHpBefore;
  }

  const projectile = spawnPetTurtle1SldProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const castKind = params.freeCast ? 'free-sld' : 'sld';
  const message = `${pet.displayName} ${castKind} -> ${target.id} ${damage.toFixed(1)} heal:${state.turtle1Sld.lastHeal.toFixed(1)} owner:${state.turtle1Sld.lastOwnerHeal.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    healOnHit: state.turtle1Sld.lastHeal,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetTurtle2TxljSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  freeCast?: boolean;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'turtle' || (!params.freeCast && pet.form !== 2)) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not turtle2`, pet);
  }

  if (!pet.skills.includes('txlj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned txlj`, pet);
  }

  if (!params.freeCast && pet.mp < PetTuning.turtle2TxljMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for txlj`, pet);
  }

  if (!params.freeCast && state.turtle2Txlj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} txlj cooling ${Math.ceil(state.turtle2Txlj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} txlj has no target`, pet);
  }

  const mpBefore = pet.mp;
  if (!params.freeCast) {
    pet.mp = Math.max(0, pet.mp - PetTuning.turtle2TxljMpCost);
    state.turtle2Txlj.cooldownMs = PetTuning.turtle2TxljCooldownMs;
  }
  state.turtle2Txlj.linkRemainingMs = calculatePetTurtle2TxljDurationMs(pet);
  state.turtle2Txlj.lastOwnerDamageRedirect = 0;
  state.turtle2Txlj.lastOwnerDamageAfterRedirect = 0;
  state.turtle2Txlj.lastOwnerHealBoost = 0;
  state.turtle2Txlj.lastPetHeal = 0;

  const castKind = params.freeCast ? 'free-txlj' : 'txlj';
  const message = `${pet.displayName} ${castKind} link ${formatPetAutoBuffMs(state.turtle2Txlj.linkRemainingMs)}`;
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

export function requestPetTurtle3SybhSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
  freeCast?: boolean;
  sustainedMs?: number;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'turtle' || (!params.freeCast && pet.form !== 3)) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not turtle3`, pet);
  }

  if (!pet.skills.includes('sybh')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned sybh`, pet);
  }

  if (!params.freeCast && pet.mp < PetTuning.turtle3SybhMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for sybh`, pet);
  }

  if (!params.freeCast && state.turtle3Sybh.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sybh cooling ${Math.ceil(state.turtle3Sybh.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sybh has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.turtle3SybhDamageMultiplier, params.random);
  if (!params.freeCast) {
    pet.mp = Math.max(0, pet.mp - PetTuning.turtle3SybhMpCost);
    state.turtle3Sybh.cooldownMs = PetTuning.turtle3SybhCooldownMs;
  }

  const projectile = spawnPetTurtle3SybhProjectile(params.projectiles, {
    sourceId: pet.id,
    x: params.runtime?.x ?? target.x,
    y: params.runtime?.y ?? target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);
  if (params.sustainedMs !== undefined) {
    projectile.lifetimeMs = params.sustainedMs;
  }

  const castKind = params.freeCast ? 'free-sybh' : 'sybh';
  const message = `${pet.displayName} ${castKind} -> ${target.id} ${damage.toFixed(1)}`;
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

export function requestPetTurtle4XwaoyiSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  ownerStats?: PetAutoBuffOwnerStats;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'turtle' || pet.form !== 4) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not turtle4`, pet);
  }

  if (!pet.skills.includes('xwaoyi')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xwaoyi`, pet);
  }

  if (pet.mp < PetTuning.turtle4XwaoyiMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xwaoyi`, pet);
  }

  if (state.turtle4Xwaoyi.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xwaoyi cooling ${Math.ceil(state.turtle4Xwaoyi.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xwaoyi has no target`, pet);
  }

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.turtle4XwaoyiMpCost);
  state.turtle4Xwaoyi.cooldownMs = PetTuning.turtle4XwaoyiCooldownMs;
  state.turtle4Xwaoyi.ultimateRemainingMs = PetTuning.turtle4XwaoyiDurationMs;
  state.turtle4Xwaoyi.sldFreeCastTimersMs = [...PetTuning.turtle4XwaoyiSldFreeCastTimersMs];

  const combo = applyPetTurtle4XwaoyiCombos(params, state);
  state.turtle4Xwaoyi.lastCombo = combo;

  const projectile = spawnPetTurtle4XwaoyiProjectile(params.projectiles, {
    sourceId: pet.id,
    x: params.runtime?.x ?? target.x,
    y: params.runtime?.y ?? target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  });

  const tags = [
    combo.sldFreeCasts > 0 ? `sldx${combo.sldFreeCasts}` : '',
    combo.txljRefreshed ? 'txlj-refresh' : '',
    combo.sybhSustained ? 'sybh-sustain' : '',
  ].filter(Boolean);
  const message = `${pet.displayName} xwaoyi -> ${target.id} combos:${tags.length > 0 ? tags.join('+') : 'none'}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage: PetTuning.turtle4XwaoyiHit5Damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export type PetTurtleTxljOwnerDamageResult = {
  active: boolean;
  ownerDamage: number;
  petDamage: number;
  petHpBefore?: number;
  petHpAfter?: number;
};

export function applyPetTurtleTxljOwnerDamage(
  roster: PetRoster,
  ownerDamage: number,
): PetTurtleTxljOwnerDamageResult {
  const normalizedDamage = Math.max(0, ownerDamage);
  const pet = getActivePet(roster);
  if (!pet || !isPetTurtleTxljLinkActive(pet) || normalizedDamage <= 0) {
    return {
      active: false,
      ownerDamage: normalizedDamage,
      petDamage: 0,
    };
  }

  const state = ensurePetSkillState(pet);
  const petHpBefore = pet.hp;
  const petDamage = Math.ceil(normalizedDamage * PetTuning.turtle2TxljPetDamageRate);
  const redirectedOwnerDamage = Math.ceil(normalizedDamage * PetTuning.turtle2TxljOwnerDamageRate);
  pet.hp = Math.max(0, pet.hp - petDamage);
  state.turtle2Txlj.lastOwnerDamageRedirect = petDamage;
  state.turtle2Txlj.lastOwnerDamageAfterRedirect = redirectedOwnerDamage;
  return {
    active: true,
    ownerDamage: redirectedOwnerDamage,
    petDamage,
    petHpBefore,
    petHpAfter: pet.hp,
  };
}

export type PetTurtleTxljOwnerHealResult = {
  active: boolean;
  ownerHeal: number;
  petHeal: number;
  ownerHpBefore?: number;
  ownerHpAfter?: number;
  petHpBefore?: number;
  petHpAfter?: number;
};

export function applyPetTurtleTxljOwnerHeal(
  roster: PetRoster,
  ownerStats: PetAutoBuffOwnerStats,
  heal: number,
): PetTurtleTxljOwnerHealResult {
  const normalizedHeal = Math.max(0, heal);
  const pet = getActivePet(roster);
  if (!pet || !isPetTurtleTxljLinkActive(pet) || normalizedHeal <= 0) {
    const ownerHpBefore = ownerStats.hp;
    ownerStats.hp = Math.min(ownerStats.maxHp, ownerStats.hp + normalizedHeal);
    return {
      active: false,
      ownerHeal: ownerStats.hp - ownerHpBefore,
      petHeal: 0,
      ownerHpBefore,
      ownerHpAfter: ownerStats.hp,
    };
  }

  const state = ensurePetSkillState(pet);
  const ownerHpBefore = ownerStats.hp;
  const petHpBefore = pet.hp;
  const boostedHeal = Math.ceil(normalizedHeal * PetTuning.turtle2TxljHealMultiplier);
  ownerStats.hp = Math.min(ownerStats.maxHp, ownerStats.hp + boostedHeal);
  pet.hp = Math.min(pet.maxHp, pet.hp + boostedHeal);
  const ownerHeal = ownerStats.hp - ownerHpBefore;
  const petHeal = pet.hp - petHpBefore;
  state.turtle2Txlj.lastOwnerHealBoost = ownerHeal;
  state.turtle2Txlj.lastPetHeal = petHeal;
  return {
    active: true,
    ownerHeal,
    petHeal,
    ownerHpBefore,
    ownerHpAfter: ownerStats.hp,
    petHpBefore,
    petHpAfter: pet.hp,
  };
}

function applyPetTurtle4XwaoyiCombos(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  ownerStats?: PetAutoBuffOwnerStats;
  random?: PetSkillRandomSource;
}, state: PetSkillState): PetTurtle4XwaoyiComboState {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return { sldFreeCasts: 0, txljRefreshed: false, sybhSustained: false };
  }

  let sldFreeCasts = 0;
  if (pet.skills.includes('sld')) {
    const result = requestPetTurtle1SldSkill({
      ...params,
      freeCast: true,
    });
    sldFreeCasts = result.ok ? PetTuning.turtle4XwaoyiSldFreeCastTimersMs.length : 0;
  }

  let txljRefreshed = false;
  if (pet.skills.includes('txlj')) {
    const result = requestPetTurtle2TxljSkill({
      roster: params.roster,
      runtime: params.runtime,
      targets: params.targets,
      freeCast: true,
    });
    txljRefreshed = result.ok;
  }

  let sybhSustained = false;
  if (pet.skills.includes('sybh')) {
    const result = requestPetTurtle3SybhSkill({
      ...params,
      freeCast: true,
      sustainedMs: PetTuning.turtle4XwaoyiDurationMs,
    });
    sybhSustained = result.ok;
  }

  state.lastResult = 'xwaoyi combo pending';
  return { sldFreeCasts, txljRefreshed, sybhSustained };
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

function isPetTurtleTxljLinkActive(pet: PetState): boolean {
  return pet.species === 'turtle' &&
    pet.hp > 0 &&
    pet.skills.includes('txlj') &&
    (pet.skillState?.turtle2Txlj.linkRemainingMs ?? 0) > 0;
}

function calculatePetTurtle2TxljDurationMs(pet: PetState): number {
  return Math.max(0, pet.warpower * PetTuning.turtle2TxljDurationMultiplierMs);
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

function formatPetAutoBuffMs(value: number): string {
  return `${Math.max(0, value / 1000).toFixed(1)}s`;
}
