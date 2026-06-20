import type { ProjectileSystemModel } from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type { PetRoster, PetRuntimeModel, PetSkillCastResult, PetSkillRandomSource, PetSkillState, PetSkillTarget, PetState } from './PetTypes';

// ─── phoenix1/np (涅槃) ─────────────────────────────────────

export function requestPetPhoenix1NpSkill(params: {
  roster: PetRoster;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'phoenix') return setFailure(params.roster, `${pet.displayName} is not phoenix`, pet);
  if (!pet.skills.includes('np')) return setFailure(params.roster, `${pet.displayName} has not learned np`, pet);

  // np triggers when HP ≤ 20% — checked by the bridge
  const hpRatio = pet.hp / Math.max(1, pet.maxHp);
  if (hpRatio > 0.2) return setFailure(params.roster, `${pet.displayName} HP > 20% for np`, pet);
  if (pet.mp < PetTuning.phoenix1NpMpCost) return setFailure(params.roster, `${pet.displayName} MP not enough for np`, pet);
  if (state.phoenix1Np.cooldownMs > 0) return setFailure(params.roster, `${pet.displayName} np cooling`, pet);

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.phoenix1NpMpCost);
  state.phoenix1Np.cooldownMs = PetTuning.phoenix1NpCooldownMs;

  state.phoenix1Np.transformationRemainingMs = PetTuning.phoenix1NpTransformationMs;
  state.phoenix1Np.pendingFullHeal = true;
  state.phoenix1Np.damageTakenMultiplier = PetTuning.phoenix1NpDamageTakenMultiplier;
  state.phoenix1Np.hurtActionImmune = true;

  const msg = `${pet.displayName} np涅槃 transforming ${PetTuning.phoenix1NpTransformationMs}ms`;
  state.lastResult = msg;
  params.roster.message = msg;
  return { ok: true, message: msg, pet, damage: 0, mpBefore, mpAfter: pet.mp, healOnHit: 0 };
}

export function applyPetPhoenixNpIncomingDamage(pet: PetState, incomingDamage: number): number {
  const state = ensureState(pet).phoenix1Np;
  const multiplier = state.transformationRemainingMs > 0 ? state.damageTakenMultiplier : 1;
  const applied = Math.max(0, incomingDamage) * multiplier;
  pet.hp = Math.max(0, pet.hp - applied);
  return applied;
}

// ─── phoenix2/bshn (不死火鸟) ───────────────────────────────

export function requestPetPhoenix2BshnSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'phoenix' || pet.form < 2) return setFailure(params.roster, `${pet.displayName} is not phoenix2+`, pet);
  if (!pet.skills.includes('bshn')) return setFailure(params.roster, `${pet.displayName} has not learned bshn`, pet);
  if (pet.mp < PetTuning.phoenix2BshnMpCost) return setFailure(params.roster, `${pet.displayName} MP not enough for bshn`, pet);
  if (state.phoenix2Bshn.cooldownMs > 0) return setFailure(params.roster, `${pet.displayName} bshn cooling`, pet);

  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} bshn no target`, pet);

  const dist = getDist(params.runtime, target);
  if (dist > PetTuning.phoenix2BshnMaxDistance) return setFailure(params.roster, `${pet.displayName} bshn too far`, pet);

  const mpBefore = pet.mp;
  const dmg = calcDmg(pet, PetTuning.phoenix2BshnDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.phoenix2BshnMpCost);
  state.phoenix2Bshn.cooldownMs = PetTuning.phoenix2BshnCooldownMs;

  const proj = spawnPhoenixProj(params.projectiles, { sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target) }, dmg, 'bshn', state.phoenix4Zqaoyi.fireImbueActive ? pet.atk : undefined);
  const msg = `${pet.displayName} bshn -> ${target.id} ${dmg.toFixed(1)}`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage: dmg, mpBefore, mpAfter: pet.mp };
}

// ─── phoenix3/dhly (地火燎原) ───────────────────────────────

export function requestPetPhoenix3DhlySkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'phoenix' || pet.form < 3) return setFailure(params.roster, `${pet.displayName} is not phoenix3+`, pet);
  if (!pet.skills.includes('dhly')) return setFailure(params.roster, `${pet.displayName} has not learned dhly`, pet);
  if (pet.mp < PetTuning.phoenix3DhlyMpCost) return setFailure(params.roster, `${pet.displayName} MP not enough for dhly`, pet);
  if (state.phoenix3Dhly.cooldownMs > 0) return setFailure(params.roster, `${pet.displayName} dhly cooling`, pet);

  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} dhly no target`, pet);

  const mpBefore = pet.mp;
  const dmg = calcDmg(pet, PetTuning.phoenix3DhlyDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.phoenix3DhlyMpCost);
  state.phoenix3Dhly.cooldownMs = PetTuning.phoenix3DhlyCooldownMs;

  const proj = spawnPhoenixProj(params.projectiles, { sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target) }, dmg, 'dhly', state.phoenix4Zqaoyi.fireImbueActive ? pet.atk : undefined);
  const msg = `${pet.displayName} dhly -> ${target.id} ${dmg.toFixed(1)}`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage: dmg, mpBefore, mpAfter: pet.mp };
}

// ─── phoenix4/zqaoyi (朱雀奥义) ─────────────────────────────

export function requestPetPhoenix4ZqaoyiSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFailure(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'phoenix' || pet.form < 4) return setFailure(params.roster, `${pet.displayName} is not phoenix4+`, pet);
  if (!pet.skills.includes('zqaoyi')) return setFailure(params.roster, `${pet.displayName} has not learned zqaoyi`, pet);
  if (pet.mp < PetTuning.phoenix4ZqaoyiMpCost) return setFailure(params.roster, `${pet.displayName} MP not enough for zqaoyi`, pet);
  if (state.phoenix4Zqaoyi.cooldownMs > 0) return setFailure(params.roster, `${pet.displayName} zqaoyi cooling`, pet);
  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFailure(params.roster, `${pet.displayName} zqaoyi no target`, pet);

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.phoenix4ZqaoyiMpCost);
  state.phoenix4Zqaoyi.cooldownMs = PetTuning.phoenix4ZqaoyiCooldownMs;
  state.phoenix4Zqaoyi.fireImbueActive = pet.skills.includes('np');

  const combo = { np: pet.skills.includes('np'), bshn: pet.skills.includes('bshn'), dhly: pet.skills.includes('dhly') };
  const msg = `${pet.displayName} zqaoyi combo np:${combo.np} bshn:${combo.bshn} dhly:${combo.dhly} dmg=0`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, damage: PetTuning.phoenix4ZqaoyiHit5Damage, mpBefore, mpAfter: pet.mp };
}

// ─── shared ─────────────────────────────────────────────────

function ensureState(pet: PetState): PetSkillState { pet.skillState ??= createPetSkillState(); return pet.skillState; }

function calcDmg(pet: PetState, mult: number, random: PetSkillRandomSource = Math.random): number {
  const base = pet.atk * mult + Math.max(0, pet.skillDamageBonus ?? 0);
  const cr = Math.max(0, Math.min(1, pet.critBonusRate ?? 0));
  return cr > 0 && random() <= cr ? base * PetTuning.petSkillCritDamageMultiplier : base;
}

function selectNearest(r: PetRuntimeModel | undefined, ts: readonly PetSkillTarget[]) {
  const a = ts.filter(t => t.isAlive); if (a.length === 0) return undefined; if (!r) return a[0];
  return a.reduce((b, c) => Math.hypot(b.x - r.x, b.y - r.y) < Math.hypot(c.x - r.x, c.y - r.y) ? b : c);
}
function getDist(r: PetRuntimeModel | undefined, t: PetSkillTarget) { return r ? Math.hypot(t.x - r.x, t.y - r.y) : 0; }
function getFac(r: PetRuntimeModel | undefined, t: PetSkillTarget): -1 | 1 { return r ? (t.x < r.x ? -1 : 1) : 1; }
function setFailure(roster: PetRoster, msg: string, pet?: PetState): PetSkillCastResult { if (pet) ensureState(pet).lastResult = msg; roster.message = msg; return { ok: false, message: msg, pet }; }

const PHX_CFG = { bshn: { variant: 'pet-phoenix2-bshn' as const, sym: 'PetPhoenix2Bullet3', w: 160, h: 118, kbX: 10, kbY: -5, int: 5 }, dhly: { variant: 'pet-phoenix3-dhly' as const, sym: 'PetPhoenix3Bullet4', w: 200, h: 160, kbX: 10, kbY: -5, int: 999 } } as const;

function spawnPhoenixProj(sys: ProjectileSystemModel, sp: { sourceId: string; x: number; y: number; facingX: -1 | 1 }, dmg: number, sk: 'bshn' | 'dhly', burnDamage?: number) {
  const c = PHX_CFG[sk];
  const id = sys.projectileSerial + 1; sys.projectileSerial = id;
  const sas = (sys.sourceAttackSerialBySource[sp.sourceId] ?? 0) + 1; sys.sourceAttackSerialBySource[sp.sourceId] = sas;
  const p = { id, projectileId: `projectile-${id}`, variant: c.variant, sourceId: sp.sourceId, sourceAttackId: `${sp.sourceId}-${c.variant}-${sas}`, actionName: sk === 'bshn' ? 'hit3' : 'hit4', assetKey: `pet-skill.phoenix.${sk}`, sourceSymbol: c.sym, runtimeName: c.sym, x: sp.x, y: sp.y, width: c.w, height: c.h, velocityX: 0, velocityY: 0, speedX: 0, speedY: 0, distanceTraveled: 0, maxDistance: undefined as number | undefined, damage: dmg, attackKind: 'magic' as const, knockbackX: c.kbX, knockbackY: c.kbY, elapsedMs: 0, lifetimeMs: 700, hitIntervalFrames: c.int, nextHitSerialAtFrame: c.int, hitSerial: 0, remainingHits: 1, petBurnMs: burnDamage === undefined ? undefined : PetTuning.phoenix4ZqaoyiBurnMs, petBurnDamage: burnDamage, destroyWhenSourceHurt: false, hasSpawnedSecondStage: false, isExpired: false, facingX: sp.facingX, remainingDistance: undefined as number | undefined } as import('./ProjectileSystem').ProjectileModel;
  sys.projectiles.push(p); return p;
}
