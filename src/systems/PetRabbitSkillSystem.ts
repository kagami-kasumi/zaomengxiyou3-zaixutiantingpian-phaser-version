import type { ProjectileSystemModel } from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type { PetAutoBuffOwnerStats, PetRoster, PetRuntimeModel, PetSkillCastResult, PetSkillRandomSource, PetSkillState, PetSkillTarget, PetState } from './PetTypes';

// ─── rabbit1/yg (月光) - passive hit-triggered ──────────────

export function markPetRabbitBasicAttackHit(params: {
  roster: PetRoster;
  random?: PetSkillRandomSource;
}): boolean {
  const pet = getActivePet(params.roster);
  if (!pet || pet.species !== 'rabbit' || !pet.skills.includes('yg')) return false;
  const state = ensureState(pet);
  const chance = state.rabbit4Ysaoyi.activeRemainingMs > 0
    ? PetTuning.rabbit1YgUltimateProcChance
    : PetTuning.rabbit1YgProcChance;
  const roll = Math.max(0, Math.min(1, params.random?.() ?? Math.random()));
  state.rabbit1Yg.lastProcRoll = roll;
  state.rabbit1Yg.releaseReady = roll < chance;
  return state.rabbit1Yg.releaseReady;
}

export function requestPetRabbit1YgSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'rabbit') return setFail(params.roster, `${pet.displayName} is not rabbit`, pet);
  if (!pet.skills.includes('yg')) return setFail(params.roster, `${pet.displayName} has not learned yg`, pet);
  // yg is passive, no MP cost, triggered on hit (bridge sets releaseReady)
  if (!state.rabbit1Yg.releaseReady) return setFail(params.roster, `${pet.displayName} yg not triggered`, pet);
  if (state.rabbit1Yg.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} yg cooling`, pet);

  const target = selectNearest(params.runtime, params.targets);
  if (!target) { state.rabbit1Yg.releaseReady = false; return setFail(params.roster, `${pet.displayName} yg no target`, pet); }

  const dmg = calcDmg(pet, PetTuning.rabbit1YgDamageMultiplier, params.random);
  state.rabbit1Yg.releaseReady = false;
  state.rabbit1Yg.cooldownMs = PetTuning.rabbit1YgCooldownMs;

  const proj = spawnRbProj(params.projectiles, { sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target) }, dmg, 'yg');
  const msg = `${pet.displayName} yg月光 -> ${target.id} ${dmg.toFixed(1)}`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage: dmg };
}

// ─── rabbit2/jf (疾风) - self buff ──────────────────────────

export function requestPetRabbit2JfSkill(params: {
  roster: PetRoster;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'rabbit' || pet.form < 2) return setFail(params.roster, `${pet.displayName} is not rabbit2+`, pet);
  if (!pet.skills.includes('jf')) return setFail(params.roster, `${pet.displayName} has not learned jf`, pet);
  if (pet.mp < PetTuning.rabbit2JfMpCost) return setFail(params.roster, `${pet.displayName} MP not enough for jf`, pet);
  if (state.rabbit2Jf.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} jf cooling`, pet);

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.rabbit2JfMpCost);
  state.rabbit2Jf.cooldownMs = PetTuning.rabbit2JfCooldownMs;
  state.rabbit2Jf.activeRemainingMs = PetTuning.rabbit2JfDurationMs;
  state.rabbit2Jf.attackRate = PetTuning.rabbit2JfBuffedAttackRate;
  state.rabbit2Jf.dodgeBonusRate = Math.min(1, 0.1 + pet.form * 0.1);

  const msg = `${pet.displayName} jf疾风 buff active dmg=0`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, damage: 0, mpBefore, mpAfter: pet.mp };
}

// ─── rabbit3/bs (冰霜) ──────────────────────────────────────

export function requestPetRabbit3BsSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'rabbit' || pet.form < 3) return setFail(params.roster, `${pet.displayName} is not rabbit3+`, pet);
  if (!pet.skills.includes('bs')) return setFail(params.roster, `${pet.displayName} has not learned bs`, pet);
  if (pet.mp < PetTuning.rabbit3BsMpCost) return setFail(params.roster, `${pet.displayName} MP not enough for bs`, pet);
  if (state.rabbit3Bs.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} bs cooling`, pet);

  const target = selectNearest(params.runtime, params.targets);
  if (!target) return setFail(params.roster, `${pet.displayName} bs no target`, pet);

  const mpBefore = pet.mp;
  const dmg = calcDmg(pet, PetTuning.rabbit3BsDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.rabbit3BsMpCost);
  state.rabbit3Bs.cooldownMs = PetTuning.rabbit3BsCooldownMs;

  const proj = spawnRbProj(params.projectiles, { sourceId: pet.id, x: target.x, y: target.y, facingX: getFac(params.runtime, target) }, dmg, 'bs');
  proj.magicIceMs = 2_000;
  markPetRabbitBasicAttackHit({ roster: params.roster, random: params.random });
  const msg = `${pet.displayName} bs冰霜 -> ${target.id} ${dmg.toFixed(1)}`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, target, projectile: proj, damage: dmg, mpBefore, mpAfter: pet.mp };
}

// ─── rabbit4/ysaoyi (月神奥义) ──────────────────────────────

export function requestPetRabbit4YsaoyiSkill(params: {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; ownerStats?: PetAutoBuffOwnerStats;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) return setFail(params.roster, 'No active pet');
  const state = ensureState(pet);
  if (pet.species !== 'rabbit' || pet.form < 4) return setFail(params.roster, `${pet.displayName} is not rabbit4+`, pet);
  if (!pet.skills.includes('ysaoyi')) return setFail(params.roster, `${pet.displayName} has not learned ysaoyi`, pet);
  if (pet.mp < PetTuning.rabbit4YsaoyiMpCost) return setFail(params.roster, `${pet.displayName} MP not enough for ysaoyi`, pet);
  if (state.rabbit4Ysaoyi.cooldownMs > 0) return setFail(params.roster, `${pet.displayName} ysaoyi cooling`, pet);

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.rabbit4YsaoyiMpCost);
  state.rabbit4Ysaoyi.cooldownMs = PetTuning.rabbit4YsaoyiCooldownMs;
  state.rabbit4Ysaoyi.activeRemainingMs = PetTuning.rabbit4YsaoyiDurationMs;
  state.rabbit4Ysaoyi.healTickAccumulatorMs = 0;
  state.rabbit4Ysaoyi.lastPetHeal = 0;
  state.rabbit4Ysaoyi.lastOwnerHeal = 0;

  const msg = `${pet.displayName} ysaoyi月神奥义 active dmg=0`;
  state.lastResult = msg; params.roster.message = msg;
  return { ok: true, message: msg, pet, damage: 0, mpBefore, mpAfter: pet.mp };
}

export function updatePetRabbitPersistentEffects(params: {
  roster: PetRoster;
  ownerStats?: PetAutoBuffOwnerStats;
  deltaMs: number;
}): void {
  const delta = Math.max(0, params.deltaMs);
  for (const pet of params.roster.pets) {
    const state = pet.skillState;
    if (!state || pet.species !== 'rabbit') continue;

    const jf = state.rabbit2Jf;
    jf.activeRemainingMs = Math.max(0, jf.activeRemainingMs - delta);
    if (jf.activeRemainingMs === 0) {
      jf.attackRate = PetTuning.rabbit2JfBaseAttackRate;
      jf.dodgeBonusRate = 0;
    }

    const ultimate = state.rabbit4Ysaoyi;
    if (ultimate.activeRemainingMs <= 0) continue;
    const activeDelta = Math.min(delta, ultimate.activeRemainingMs);
    ultimate.activeRemainingMs = Math.max(0, ultimate.activeRemainingMs - delta);
    ultimate.healTickAccumulatorMs += activeDelta;
    while (ultimate.healTickAccumulatorMs >= PetTuning.rabbit4YsaoyiHealIntervalMs) {
      ultimate.healTickAccumulatorMs -= PetTuning.rabbit4YsaoyiHealIntervalMs;
      const petBefore = pet.hp;
      pet.hp = Math.min(pet.maxHp, pet.hp + pet.maxHp * PetTuning.rabbit4YsaoyiHealMaxHpRate);
      ultimate.lastPetHeal = pet.hp - petBefore;
      if (params.ownerStats) {
        const ownerBefore = params.ownerStats.hp;
        params.ownerStats.hp = Math.min(
          params.ownerStats.maxHp,
          params.ownerStats.hp + params.ownerStats.maxHp * PetTuning.rabbit4YsaoyiHealMaxHpRate,
        );
        ultimate.lastOwnerHeal = params.ownerStats.hp - ownerBefore;
      }
    }
  }
}

// ─── shared ─────────────────────────────────────────────────
function ensureState(pet: PetState): PetSkillState { pet.skillState ??= createPetSkillState(); return pet.skillState; }
function calcDmg(pet: PetState, mult: number, rng: PetSkillRandomSource = Math.random): number { const b = pet.atk * mult + Math.max(0, pet.skillDamageBonus ?? 0); const cr = Math.max(0, Math.min(1, pet.critBonusRate ?? 0)); return cr > 0 && rng() <= cr ? b * PetTuning.petSkillCritDamageMultiplier : b; }
function selectNearest(r: PetRuntimeModel | undefined, ts: readonly PetSkillTarget[]) { const a = ts.filter(t => t.isAlive); if (a.length === 0) return undefined; if (!r) return a[0]; return a.reduce((b, c) => Math.hypot(b.x - r.x, b.y - r.y) < Math.hypot(c.x - r.x, c.y - r.y) ? b : c); }
function getFac(r: PetRuntimeModel | undefined, t: PetSkillTarget): -1 | 1 { return r ? (t.x < r.x ? -1 : 1) : 1; }
function setFail(roster: PetRoster, msg: string, pet?: PetState): PetSkillCastResult { if (pet) ensureState(pet).lastResult = msg; roster.message = msg; return { ok: false, message: msg, pet }; }

const RB_CFG = { yg: { variant: 'pet-rabbit1-yg' as const, sym: 'Monster130Bullet2', w: 100, h: 100, kbX: 0, kbY: -3, int: 999 }, bs: { variant: 'pet-rabbit3-bs' as const, sym: 'PetPetRabbitBullet4', w: 140, h: 120, kbX: 0, kbY: -3, int: 999 } } as const;

function spawnRbProj(sys: ProjectileSystemModel, sp: { sourceId: string; x: number; y: number; facingX: -1 | 1 }, dmg: number, sk: 'yg' | 'bs') {
  const c = RB_CFG[sk]; const id = sys.projectileSerial + 1; sys.projectileSerial = id;
  const sas = (sys.sourceAttackSerialBySource[sp.sourceId] ?? 0) + 1; sys.sourceAttackSerialBySource[sp.sourceId] = sas;
  const p = { id, projectileId: `projectile-${id}`, variant: c.variant, sourceId: sp.sourceId, sourceAttackId: `${sp.sourceId}-${c.variant}-${sas}`, actionName: sk === 'yg' ? 'hit1' : 'hit4', assetKey: `pet-skill.rabbit.${sk}`, sourceSymbol: c.sym, runtimeName: c.sym, x: sp.x, y: sp.y, width: c.w, height: c.h, velocityX: 0, velocityY: 0, speedX: 0, speedY: 0, distanceTraveled: 0, maxDistance: undefined as number | undefined, damage: dmg, attackKind: 'magic' as const, knockbackX: c.kbX, knockbackY: c.kbY, elapsedMs: 0, lifetimeMs: 700, hitIntervalFrames: c.int, nextHitSerialAtFrame: c.int, hitSerial: 0, remainingHits: 1, destroyWhenSourceHurt: false, hasSpawnedSecondStage: false, isExpired: false, facingX: sp.facingX, remainingDistance: undefined as number | undefined } as import('./ProjectileSystem').ProjectileModel;
  sys.projectiles.push(p); return p;
}
