import type { ProjectileSystemModel } from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type { PetRoster, PetRuntimeModel, PetSkillCastResult, PetSkillRandomSource, PetSkillState, PetSkillTarget, PetState } from './PetTypes';

// ─── mouse1/sc (鼠窜) ───────────────────────────────────────

export function requestPetMouse1ScSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'mouse') return setFail(params.roster, `${pet.displayName} is not mouse`, pet);
  if (!pet.skills.includes('sc')) return setFail(params.roster, `${pet.displayName} has not learned sc`, pet);
  if (pet.mp < PetTuning.mouse1ScMpCost) return setFail(params.roster, `${pet.displayName} MP not enough for sc`, pet);
  if (state.mouse1Sc.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} sc cooling`, pet);

  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFail(params.roster, `${pet.displayName} sc no target`, pet);

  const mpBefore = pet.mp;
  const dmg = calcDmg(pet, PetTuning.mouse1ScDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.mouse1ScMpCost);
  state.mouse1Sc.cooldownMs = PetTuning.mouse1ScCooldownMs;

  const proj = spawnMsProj(params.projectiles, { sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target) }, dmg, 'sc');
  const msg = `${pet.displayName} sc鼠窜 -> ${target.id} ${dmg.toFixed(1)}`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage: dmg, mpBefore, mpAfter: pet.mp };
}

// ─── mouse4/hxfb (回旋飞镖) ─────────────────────────────────

export function requestPetMouse4HxfbSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'mouse' || pet.form < 4) return setFail(params.roster, `${pet.displayName} is not mouse4+`, pet);
  if (!pet.skills.includes('hxfb')) return setFail(params.roster, `${pet.displayName} has not learned hxfb`, pet);
  if (pet.mp < PetTuning.mouse4HxfbMpCost) return setFail(params.roster, `${pet.displayName} MP not enough for hxfb`, pet);
  if (state.mouse4Hxfb.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} hxfb cooling`, pet);

  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFail(params.roster, `${pet.displayName} hxfb no target`, pet);

  const mpBefore = pet.mp;
  const dmg = calcDmg(pet, PetTuning.mouse4HxfbDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.mouse4HxfbMpCost);
  state.mouse4Hxfb.cooldownMs = PetTuning.mouse4HxfbCooldownMs;

  const spawned = spawnMouseHxfbProjectiles(params.projectiles, pet, params.runtime, target, dmg);
  const msg = `${pet.displayName} hxfb回旋镖 -> ${target.id} ${dmg.toFixed(1)}`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: spawned[0], projectiles: spawned, damage: dmg, mpBefore, mpAfter: pet.mp };
}

// ─── mouse4/zsaoyi (紫鼠奥义) ───────────────────────────────

export function requestPetMouse4ZsaoyiSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'mouse' || pet.form < 4) return setFail(params.roster, `${pet.displayName} is not mouse4+`, pet);
  if (!pet.skills.includes('zsaoyi')) return setFail(params.roster, `${pet.displayName} has not learned zsaoyi`, pet);
  if (pet.mp < PetTuning.mouse4ZsaoyiMpCost) return setFail(params.roster, `${pet.displayName} MP not enough for zsaoyi`, pet);
  if (state.mouse4Zsaoyi.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} zsaoyi cooling`, pet);
  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFail(params.roster, `${pet.displayName} zsaoyi no target`, pet);

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.mouse4ZsaoyiMpCost);
  state.mouse4Zsaoyi.cooldownMs = PetTuning.mouse4ZsaoyiCooldownMs;
  state.mouse4Zsaoyi.comboStep = 1;
  state.mouse4Zsaoyi.comboStepElapsedMs = 0;
  state.mouse4Zsaoyi.comboTargetId = target.id;
  state.mouse4Zsaoyi.emittedSteps = ['sc@1'];

  const firstDamage = calcDmg(pet, PetTuning.mouse1ScDamageMultiplier, params.random);
  const firstProjectile = spawnMsProj(params.projectiles, {
    sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target),
  }, firstDamage, 'sc');

  const combo = { scFree: pet.skills.includes('sc'), hxfbFree: pet.skills.includes('hxfb') };
  const msg = `${pet.displayName} zsaoyi紫鼠奥义 sc:${combo.scFree} hxfb:${combo.hxfbFree} dmg=0`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: firstProjectile, projectiles: [firstProjectile], damage: 0, mpBefore, mpAfter: pet.mp };
}

export function updatePetMouse4ZsaoyiCombo(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; deltaMs: number; random?: PetSkillRandomSource;
}): import('./ProjectileSystem').ProjectileModel[] {
  const pet = getActivePet(params.roster);
  if (!pet || pet.species !== 'mouse' || pet.form < 4) return [];
  const state = ensureState(pet).mouse4Zsaoyi;
  if (state.comboStep <= 0) return [];
  const target = params.targets.find((candidate) => candidate.id === state.comboTargetId && candidate.isAlive)
    ?? selectNearest(params.runtime, params.targets);
  if (!target) {
    state.comboStep = 0;
    state.comboTargetId = undefined;
    return [];
  }

  const emitted: import('./ProjectileSystem').ProjectileModel[] = [];
  state.comboStepElapsedMs += Math.max(0, params.deltaMs);
  while (state.comboStep > 0 && state.comboStepElapsedMs >= PetTuning.mouse4ZsaoyiComboStepMs) {
    state.comboStepElapsedMs -= PetTuning.mouse4ZsaoyiComboStepMs;
    state.comboStep += 1;
    if (state.comboStep === 4 && pet.skills.includes('sc')) {
      const damage = calcDmg(pet, PetTuning.mouse1ScDamageMultiplier, params.random);
      emitted.push(spawnMsProj(params.projectiles, {
        sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target),
      }, damage, 'sc'));
      state.emittedSteps.push('sc@4');
    }
    if (state.comboStep === 6 && pet.skills.includes('hxfb')) {
      const damage = calcDmg(pet, PetTuning.mouse4HxfbDamageMultiplier, params.random);
      emitted.push(...spawnMouseHxfbProjectiles(params.projectiles, pet, params.runtime, target, damage));
      state.emittedSteps.push('hxfb@6');
    }
    if (state.comboStep > 7) {
      state.comboStep = 0;
      state.comboTargetId = undefined;
    }
  }
  return emitted;
}

// ─── shared ─────────────────────────────────────────────────
function ensureState(pet: PetState): PetSkillState { pet.skillState ??= createPetSkillState(); return pet.skillState; }
function calcDmg(pet: PetState, mult: number, rng: PetSkillRandomSource = Math.random): number { const b = pet.atk * mult + Math.max(0, pet.skillDamageBonus ?? 0); const cr = Math.max(0, Math.min(1, pet.critBonusRate ?? 0)); return cr > 0 && rng() <= cr ? b * PetTuning.petSkillCritDamageMultiplier : b; }
function selectNearest(r: PetRuntimeModel | undefined, ts: readonly PetSkillTarget[]) { const a = ts.filter(t => t.isAlive); if (a.length === 0) return undefined; if (!r) return a[0]; return a.reduce((b, c) => Math.hypot(b.x - r.x, b.y - r.y) < Math.hypot(c.x - r.x, c.y - r.y) ? b : c); }
function getFac(r: PetRuntimeModel | undefined, t: PetSkillTarget): -1 | 1 { return r ? (t.x < r.x ? -1 : 1) : 1; }
function setFail(roster: PetRoster, msg: string, pet?: PetState): PetSkillCastResult { if (pet) ensureState(pet).lastResult = msg; roster.message = msg; return { ok: false, message: msg, pet }; }

const MS_CFG = { sc: { variant: 'pet-mouse1-sc' as const, sym: 'PetMouse1Bullet1', w: 120, h: 80, kbX: 4, kbY: -3, int: 999 }, hxfb: { variant: 'pet-mouse4-hxfb' as const, sym: 'PetMouse1Bullet3', w: 100, h: 60, kbX: 0, kbY: -3, int: 999 } } as const;

function spawnMsProj(sys: ProjectileSystemModel, sp: { sourceId: string; x: number; y: number; facingX: -1 | 1 }, dmg: number, sk: 'sc' | 'hxfb') {
  const c = MS_CFG[sk]; const id = sys.projectileSerial + 1; sys.projectileSerial = id;
  const sas = (sys.sourceAttackSerialBySource[sp.sourceId] ?? 0) + 1; sys.sourceAttackSerialBySource[sp.sourceId] = sas;
  const p = { id, projectileId: `projectile-${id}`, variant: c.variant, sourceId: sp.sourceId, sourceAttackId: `${sp.sourceId}-${c.variant}-${sas}`, actionName: sk === 'sc' ? 'hit2' : 'hit2', assetKey: `pet-skill.mouse.${sk}`, sourceSymbol: c.sym, runtimeName: c.sym, x: sp.x, y: sp.y, width: c.w, height: c.h, velocityX: 0, velocityY: 0, speedX: 0, speedY: 0, distanceTraveled: 0, maxDistance: undefined as number | undefined, damage: dmg, attackKind: 'magic' as const, knockbackX: c.kbX, knockbackY: c.kbY, elapsedMs: 0, lifetimeMs: 700, hitIntervalFrames: c.int, nextHitSerialAtFrame: c.int, hitSerial: 0, remainingHits: 1, destroyWhenSourceHurt: false, hasSpawnedSecondStage: false, isExpired: false, facingX: sp.facingX, remainingDistance: undefined as number | undefined } as import('./ProjectileSystem').ProjectileModel;
  sys.projectiles.push(p); return p;
}

function spawnMouseHxfbProjectiles(
  system: ProjectileSystemModel,
  pet: PetState,
  runtime: PetRuntimeModel | undefined,
  target: PetSkillTarget,
  totalDamage: number,
): import('./ProjectileSystem').ProjectileModel[] {
  const perProjectileDamage = totalDamage / 3;
  return [-8, -4, 0].map((yOffset) => spawnMsProj(system, {
    sourceId: pet.id,
    x: target.x,
    y: target.y + yOffset,
    facingX: getFac(runtime, target),
  }, perProjectileDamage, 'hxfb'));
}
