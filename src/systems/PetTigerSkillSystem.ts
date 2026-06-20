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
  PetTiger4BhaoyiComboState,
} from './PetTypes';

// ─── tigress1/hy ────────────────────────────────────────────

export function requestPetTiger1HySkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');

  const state = ensureState(pet);
  if (pet.species !== 'tigress' || pet.form < 1) {
    return setFailure(params.roster, `${pet.displayName} is not tigress`, pet);
  }
  if (!pet.skills.includes('hy')) {
    return setFailure(params.roster, `${pet.displayName} has not learned hy`, pet);
  }
  if (pet.mp < PetTuning.tiger1HyMpCost) {
    return setFailure(params.roster, `${pet.displayName} MP not enough for hy`, pet);
  }
  if (state.tiger1Hy.cooldownMs > 0) {
    return setFailure(params.roster, `${pet.displayName} hy cooling ${Math.ceil(state.tiger1Hy.cooldownMs)}ms`, pet);
  }

  const target = selectNearestTarget(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} hy has no target`, pet);

  const dist = getDistance(params.runtime, target);
  if (dist < PetTuning.tiger1HyMinDistance) {
    return setFailure(params.roster, `${pet.displayName} hy target too close ${Math.floor(dist)}`, pet);
  }
  if (dist > PetTuning.tiger1HyMaxDistance) {
    return setFailure(params.roster, `${pet.displayName} hy target too far ${Math.ceil(dist)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calcDamage(pet, PetTuning.tiger1HyDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.tiger1HyMpCost);
  state.tiger1Hy.cooldownMs = PetTuning.tiger1HyCooldownMs;

  const proj = spawnTigerProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getFacing(params.runtime, target),
  }, damage, 'hy');

  const msg = `${pet.displayName} hy -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = msg;
  params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage, mpBefore, mpAfter: pet.mp };
}

// ─── tigress2/sxhz ──────────────────────────────────────────

export function requestPetTiger2SxhzSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');

  const state = ensureState(pet);
  if (pet.species !== 'tigress' || pet.form < 2) {
    return setFailure(params.roster, `${pet.displayName} is not tigress2+`, pet);
  }
  if (!pet.skills.includes('sxhz')) {
    return setFailure(params.roster, `${pet.displayName} has not learned sxhz`, pet);
  }
  if (pet.mp < PetTuning.tiger2SxhzMpCost) {
    return setFailure(params.roster, `${pet.displayName} MP not enough for sxhz`, pet);
  }
  if (state.tiger2Sxhz.cooldownMs > 0) {
    return setFailure(params.roster, `${pet.displayName} sxhz cooling ${Math.ceil(state.tiger2Sxhz.cooldownMs)}ms`, pet);
  }

  const target = selectNearestTarget(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} sxhz has no target`, pet);

  const dist = getDistance(params.runtime, target);
  if (dist > PetTuning.tiger2SxhzMaxDistance) {
    return setFailure(params.roster, `${pet.displayName} sxhz target too far ${Math.ceil(dist)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calcDamage(pet, PetTuning.tiger2SxhzDamageMultiplier, params.random);
  const hpBefore = pet.hp;
  pet.mp = Math.max(0, pet.mp - PetTuning.tiger2SxhzMpCost);
  state.tiger2Sxhz.cooldownMs = PetTuning.tiger2SxhzCooldownMs;

  // Heal on hit: sxhz.first (same as damage = 4×atk)
  pet.hp = Math.min(pet.maxHp, pet.hp + damage);
  state.tiger2Sxhz.lastHeal = pet.hp - hpBefore;

  const proj = spawnTigerProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getFacing(params.runtime, target),
  }, damage, 'sxhz');

  const msg = `${pet.displayName} sxhz -> ${target.id} ${damage.toFixed(1)} heal:${state.tiger2Sxhz.lastHeal}`;
  state.lastResult = msg;
  params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage, mpBefore, mpAfter: pet.mp, healOnHit: state.tiger2Sxhz.lastHeal };
}

// ─── tigress3/hsqj ──────────────────────────────────────────

export function requestPetTiger3HsqjSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');

  const state = ensureState(pet);
  if (pet.species !== 'tigress' || pet.form < 3) {
    return setFailure(params.roster, `${pet.displayName} is not tigress3+`, pet);
  }
  if (!pet.skills.includes('hsqj')) {
    return setFailure(params.roster, `${pet.displayName} has not learned hsqj`, pet);
  }
  if (pet.mp < PetTuning.tiger3HsqjMpCost) {
    return setFailure(params.roster, `${pet.displayName} MP not enough for hsqj`, pet);
  }
  if (state.tiger3Hsqj.cooldownMs > 0) {
    return setFailure(params.roster, `${pet.displayName} hsqj cooling ${Math.ceil(state.tiger3Hsqj.cooldownMs)}ms`, pet);
  }

  const target = selectNearestTarget(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} hsqj has no target`, pet);

  const dist = getDistance(params.runtime, target);
  if (dist > PetTuning.tiger3HsqjMaxDistance) {
    return setFailure(params.roster, `${pet.displayName} hsqj target too far ${Math.ceil(dist)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calcDamage(pet, PetTuning.tiger3HsqjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.tiger3HsqjMpCost);
  state.tiger3Hsqj.cooldownMs = PetTuning.tiger3HsqjCooldownMs;

  const proj = spawnTigerProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getFacing(params.runtime, target),
  }, damage, 'hsqj');

  const msg = `${pet.displayName} hsqj -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = msg;
  params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage, mpBefore, mpAfter: pet.mp };
}

// ─── tigress4/bhaoyi ────────────────────────────────────────

export function requestPetTiger4BhaoyiSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');

  const state = ensureState(pet);
  if (pet.species !== 'tigress' || pet.form < 4) {
    return setFailure(params.roster, `${pet.displayName} is not tigress4+`, pet);
  }
  if (!pet.skills.includes('bhaoyi')) {
    return setFailure(params.roster, `${pet.displayName} has not learned bhaoyi`, pet);
  }
  if (pet.mp < PetTuning.tiger4BhaoyiMpCost) {
    return setFailure(params.roster, `${pet.displayName} MP not enough for bhaoyi`, pet);
  }
  if (state.tiger4Bhaoyi.cooldownMs > 0) {
    return setFailure(params.roster, `${pet.displayName} bhaoyi cooling ${Math.ceil(state.tiger4Bhaoyi.cooldownMs)}ms`, pet);
  }
  const target = selectNearestTarget(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} bhaoyi has no target`, pet);

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.tiger4BhaoyiMpCost);
  state.tiger4Bhaoyi.cooldownMs = PetTuning.tiger4BhaoyiCooldownMs;

  const combo: PetTiger4BhaoyiComboState = {
    hyFreeCast: pet.skills.includes('hy'),
    sxhzFreeCast: pet.skills.includes('sxhz'),
    hsqjFreeCast: pet.skills.includes('hsqj'),
  };
  state.tiger4Bhaoyi.lastCombo = combo;
  state.tiger4Bhaoyi.comboStep = 1;
  state.tiger4Bhaoyi.comboStepElapsedMs = 0;
  state.tiger4Bhaoyi.comboTargetId = target.id;
  state.tiger4Bhaoyi.emittedSteps = [];
  state.tiger4Bhaoyi.attackBoostReady = false;

  if (params.runtime) {
    params.runtime.x = target.x + ((params.random?.() ?? Math.random()) < 0.5 ? -80 : 80);
  }
  const spawned: import('./ProjectileSystem').ProjectileModel[] = [];
  if (combo.hyFreeCast) {
    const damage = calcDamage(pet, PetTuning.tiger1HyDamageMultiplier, params.random);
    spawned.push(spawnTigerProjectile(params.projectiles, {
      sourceId: pet.id, x: target.x, y: target.y, facingX: getFacing(params.runtime, target),
    }, damage, 'hy'));
    state.tiger4Bhaoyi.emittedSteps.push('hy@1');
  }

  const msg = `${pet.displayName} bhaoyi combo hy:${combo.hyFreeCast} sxhz:${combo.sxhzFreeCast} hsqj:${combo.hsqjFreeCast} dmg=0`;
  state.lastResult = msg;
  params.roster.message = msg;
  return {
    ok: true, message: msg, pet,
    target,
    projectile: spawned[0],
    projectiles: spawned,
    damage: PetTuning.tiger4BhaoyiHit5Damage,
    mpBefore, mpAfter: pet.mp,
  };
}

export function updatePetTiger4BhaoyiCombo(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  deltaMs: number;
  random?: PetSkillRandomSource;
}): import('./ProjectileSystem').ProjectileModel[] {
  const pet = getActivePet(params.roster);
  if (!pet || pet.species !== 'tigress' || pet.form < 4) return [];
  const state = ensureState(pet).tiger4Bhaoyi;
  if (state.comboStep <= 0) return [];
  const target = params.targets.find((candidate) => candidate.id === state.comboTargetId && candidate.isAlive)
    ?? selectNearestTarget(params.runtime, params.targets);
  if (!target) {
    state.comboStep = 0;
    state.comboTargetId = undefined;
    return [];
  }

  const emitted: import('./ProjectileSystem').ProjectileModel[] = [];
  state.comboStepElapsedMs += Math.max(0, params.deltaMs);
  if (state.comboStep === 1 && state.comboStepElapsedMs >= PetTuning.tiger4BhaoyiComboStepMs) {
    state.comboStepElapsedMs -= PetTuning.tiger4BhaoyiComboStepMs;
    state.comboStep = 2;
    if (params.runtime) params.runtime.x = target.x + (params.runtime.x <= target.x ? 80 : -80);
    if (state.lastCombo.sxhzFreeCast) {
      const damage = calcDamage(pet, PetTuning.tiger2SxhzDamageMultiplier, params.random);
      const hpBefore = pet.hp;
      pet.hp = Math.min(pet.maxHp, pet.hp + damage);
      ensureState(pet).tiger2Sxhz.lastHeal = pet.hp - hpBefore;
      emitted.push(spawnTigerProjectile(params.projectiles, {
        sourceId: pet.id, x: target.x, y: target.y, facingX: getFacing(params.runtime, target),
      }, damage, 'sxhz'));
      state.emittedSteps.push('sxhz@2');
    }
  }
  if (state.comboStep === 2 && state.comboStepElapsedMs >= PetTuning.tiger4BhaoyiFinalDelayMs) {
    state.comboStepElapsedMs -= PetTuning.tiger4BhaoyiFinalDelayMs;
    state.comboStep = 3;
    state.attackBoostReady = true;
    if (state.lastCombo.hsqjFreeCast) {
      const damage = calcDamage(pet, PetTuning.tiger3HsqjDamageMultiplier, params.random)
        * PetTuning.tiger4BhaoyiAttackBoostMultiplier;
      emitted.push(spawnTigerProjectile(params.projectiles, {
        sourceId: pet.id, x: target.x, y: target.y, facingX: getFacing(params.runtime, target),
      }, damage, 'hsqj'));
      state.emittedSteps.push('hsqj@3');
      state.attackBoostReady = false;
    }
    state.comboStep = 0;
    state.comboTargetId = undefined;
  }
  return emitted;
}

// ─── shared helpers ─────────────────────────────────────────

function ensureState(pet: PetState): PetSkillState {
  pet.skillState ??= createPetSkillState();
  return pet.skillState;
}

function calcDamage(pet: PetState, mult: number, random: PetSkillRandomSource = Math.random): number {
  const base = pet.atk * mult + Math.max(0, pet.skillDamageBonus ?? 0);
  const critRate = Math.max(0, Math.min(1, pet.critBonusRate ?? 0));
  if (critRate <= 0) return base;
  return random() <= critRate ? base * PetTuning.petSkillCritDamageMultiplier : base;
}

function selectNearestTarget(
  runtime: PetRuntimeModel | undefined,
  targets: readonly PetSkillTarget[],
): PetSkillTarget | undefined {
  const alive = targets.filter((t) => t.isAlive);
  if (alive.length === 0) return undefined;
  if (!runtime) return alive[0];
  return alive.reduce((a, b) =>
    Math.hypot(a.x - runtime.x, a.y - runtime.y) < Math.hypot(b.x - runtime.x, b.y - runtime.y) ? a : b,
  );
}

function getDistance(runtime: PetRuntimeModel | undefined, target: PetSkillTarget): number {
  if (!runtime) return 0;
  return Math.hypot(target.x - runtime.x, target.y - runtime.y);
}

function getFacing(runtime: PetRuntimeModel | undefined, target: PetSkillTarget): -1 | 1 {
  if (!runtime) return 1;
  return target.x < runtime.x ? -1 : 1;
}

function setFailure(roster: PetRoster, msg: string, pet?: PetState): PetSkillCastResult {
  if (pet) ensureState(pet).lastResult = msg;
  roster.message = msg;
  return { ok: false, message: msg, pet };
}

const TIGER_PROJECTILE = {
  hy:   { variant: 'pet-tiger1-hy' as const,   symbol: 'PetTiger1Bullet2', w: 160, h: 118, kbX: 9, kbY: 0, interval: 6 },
  sxhz: { variant: 'pet-tiger2-sxhz' as const, symbol: 'PetTiger2Bullet3_2', w: 160, h: 118, kbX: 0, kbY: 0, interval: 6 },
  hsqj: { variant: 'pet-tiger3-hsqj' as const, symbol: 'PetTiger3Bullet4_2', w: 180, h: 140, kbX: -7, kbY: 0, interval: 3 },
} as const;

function spawnTigerProjectile(
  system: ProjectileSystemModel,
  spawn: { sourceId: string; x: number; y: number; facingX: -1 | 1 },
  damage: number,
  skill: 'hy' | 'sxhz' | 'hsqj',
) {
  const cfg = TIGER_PROJECTILE[skill];
  const id = system.projectileSerial + 1;
  system.projectileSerial = id;
  const saSerial = (system.sourceAttackSerialBySource[spawn.sourceId] ?? 0) + 1;
  system.sourceAttackSerialBySource[spawn.sourceId] = saSerial;

  const p = {
    id,
    projectileId: `projectile-${id}`,
    variant: cfg.variant,
    sourceId: spawn.sourceId,
    sourceAttackId: `${spawn.sourceId}-${cfg.variant}-${saSerial}`,
    actionName: skill === 'hy' ? 'hit2' : skill === 'sxhz' ? 'hit3_2' : 'hit4',
    assetKey: `pet-skill.tigress.${skill}`,
    sourceSymbol: cfg.symbol,
    runtimeName: cfg.symbol,
    x: spawn.x + spawn.facingX * 0,
    y: spawn.y + 0,
    width: cfg.w,
    height: cfg.h,
    velocityX: 0,
    velocityY: 0,
    speedX: 0,
    speedY: 0,
    distanceTraveled: 0,
    maxDistance: undefined as number | undefined,
    damage,
    attackKind: 'magic' as const,
    knockbackX: cfg.kbX,
    knockbackY: cfg.kbY,
    elapsedMs: 0,
    lifetimeMs: 700,
    hitIntervalFrames: cfg.interval,
    nextHitSerialAtFrame: cfg.interval,
    hitSerial: 0,
    remainingHits: 1,
    destroyWhenSourceHurt: false,
    hasSpawnedSecondStage: false,
    isExpired: false,
    facingX: spawn.facingX,
    remainingDistance: undefined as number | undefined,
  } as import('./ProjectileSystem').ProjectileModel;
  system.projectiles.push(p);
  return p;
}
