import { spawnPetMonkey1XjProjectile, spawnPetMonkey2LjProjectile, spawnPetMonkey2XjProjectile,
  spawnPetMonkey3LyqProjectile, spawnPetMonkey3XjProjectile, spawnPetMonkey3LjProjectile,
  type ProjectileSystemModel } from './ProjectileSystem';
import { PetTuning } from './PetTuning';
import { getActivePet } from './PetRosterSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import { calculatePetSkillDamage } from './PetSkillDamageMath';
import type { PetRoster, PetRuntimeModel, PetSkillCastResult, PetSkillRandomSource, PetSkillTarget } from './PetTypes';

type Request = {
  roster: PetRoster; runtime: PetRuntimeModel | undefined; targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel; random?: PetSkillRandomSource; chainCast?: boolean;
  actionToken?: number; phase?: 'prepare' | 'emit';
};
const definitions = {
  monkey1Xj: { form: 1, skill: 'xj', cost: PetTuning.monkey1XjMpCost, cd: PetTuning.monkey1XjCooldownMs,
    multiplier: PetTuning.monkey1XjDamageMultiplier, spawn: spawnPetMonkey1XjProjectile, offset: [45, -80], release: true },
  monkey2Lj: { form: 2, skill: 'lj', cost: PetTuning.monkey2LjMpCost, cd: PetTuning.monkey2LjCooldownMs,
    multiplier: PetTuning.monkey2LjDamageMultiplier, spawn: spawnPetMonkey2LjProjectile, offset: [0, 0], release: false },
  monkey2Xj: { form: 2, skill: 'xj', cost: PetTuning.monkey2XjMpCost, cd: PetTuning.monkey2XjCooldownMs,
    multiplier: PetTuning.monkey2XjDamageMultiplier, spawn: spawnPetMonkey2XjProjectile, offset: [45, -70], release: true },
  monkey3Lyq: { form: 3, skill: 'lyq', cost: PetTuning.monkey3LyqMpCost, cd: PetTuning.monkey3LyqCooldownMs,
    multiplier: PetTuning.monkey3LyqDamageMultiplier, spawn: spawnPetMonkey3LyqProjectile, offset: [35, -60], release: false },
  monkey3Xj: { form: 3, skill: 'xj', cost: PetTuning.monkey3XjMpCost, cd: PetTuning.monkey3XjCooldownMs,
    multiplier: PetTuning.monkey3XjDamageMultiplier, spawn: spawnPetMonkey3XjProjectile, offset: [45, -50], release: false },
  monkey3Lj: { form: 3, skill: 'lj', cost: PetTuning.monkey3LjMpCost, cd: PetTuning.monkey3LjCooldownMs,
    multiplier: PetTuning.monkey3LjDamageMultiplier, spawn: spawnPetMonkey3LjProjectile, offset: [10, -15], release: true },
  monkey4Jgaoyi: { form: 4, skill: 'jgaoyi', cost: PetTuning.monkey4JgaoyiMpCost, cd: PetTuning.monkey4JgaoyiCooldownMs,
    multiplier: 0, spawn: undefined, offset: [0, 0], release: false },
} as const;
type SkillKey = keyof typeof definitions;

/** Release owns costs/CD; body callbacks own emission. The facade preserves manual request callers. */
function request(key: SkillKey, params: Request): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  const definition = definitions[key];
  const fail = (message: string): PetSkillCastResult => ({ ok: false, message, pet });
  if (!pet || pet.species !== 'monkey' || (pet.form !== definition.form && !(definition.form === 3 && pet.form === 4))) {
    return fail(`No active monkey for ${key}`);
  }
  pet.skillState ??= createPetSkillState();
  const state = pet.skillState[key];
  const target = params.phase === 'emit' ? params.targets[0]
    : params.targets.filter(target => target.isAlive).reduce<PetSkillTarget | undefined>((best, target) => {
      if (!best || !params.runtime) return best ?? target;
      const distance = (value: PetSkillTarget) => Math.hypot(value.x - params.runtime!.x, value.y - params.runtime!.y);
      return distance(target) < distance(best) ? target : best;
    }, undefined);
  if (!target) return fail(`${key} has no target`);
  if (params.phase !== 'emit') {
    if (!pet.skills.includes(definition.skill)) return fail(`${pet.displayName} has not learned ${definition.skill}`);
    if (!params.chainCast) {
      if (pet.mp < definition.cost) return fail(`${key} MP not enough`);
      if (state.cooldownMs > 0) return fail(`${key} cooling`);
      if (definition.release && (!('releaseReady' in state) || !state.releaseReady)) return fail(`${key} trigger not ready`);
      if (key === 'monkey3Lyq' && (!params.runtime
        || Math.hypot(target.x - params.runtime.x, target.y - params.runtime.y) > PetTuning.monkey3LyqMaxDistance)) {
        return fail(`${key} target too far`);
      }
    }
  }
  const mpBefore = pet.mp;
  if (params.phase !== 'emit' && !params.chainCast) {
    pet.mp -= definition.cost;
    state.cooldownMs = key === 'monkey3Lj' && pet.form === 4 ? PetTuning.monkey4LjCooldownMs : definition.cd;
  }
  const message = `${pet.displayName} ${definition.skill} -> ${target.id}`;
  const result: PetSkillCastResult = { ok: true, message, pet, target: { ...target }, mpBefore, mpAfter: pet.mp };
  pet.skillState.lastResult = message; params.roster.message = message;
  if (params.phase === 'prepare' || !definition.spawn) return result;
  const damage = calculatePetSkillDamage(pet, definition.multiplier, params.random);
  const origin = params.runtime ?? target;
  const facingX = params.runtime?.facingX ?? 1;
  const spawn = (symbol: string | undefined, offset: readonly number[], visualOnly = false) => {
    const projectile = definition.spawn!(params.projectiles, { sourceId: pet.id, x: origin.x, y: origin.y, facingX }, damage);
    projectile.x = origin.x + offset[0]! * facingX;
    projectile.y = origin.y + offset[1]!;
    projectile.petActionToken = params.actionToken;
    projectile.visualOnly = visualOnly;
    if (symbol) projectile.sourceSymbol = projectile.runtimeName = symbol;
    return projectile;
  };
  const pairPrefix = key === 'monkey2Lj' ? 'PetMonkey2Bullet2' : key === 'monkey3Lj' ? 'PetMonkey3Bullet3' : undefined;
  const prelude = pairPrefix ? spawn(`${pairPrefix}_1`, key === 'monkey2Lj' ? [15, -15] : [0, -15], true) : undefined;
  const projectile = spawn(pairPrefix ? `${pairPrefix}_2` : undefined, definition.offset);
  // These flags are cleared by the original doHit callback, not the release.
  if (key === 'monkey1Xj') pet.skillState.monkey1Xj.releaseReady = false;
  if (key === 'monkey2Xj') pet.skillState.monkey2Xj.releaseReady = false;
  if (key === 'monkey3Xj') pet.skillState.monkey3Lj.releaseReady = false;
  return { ...result, projectile, projectiles: prelude ? [prelude, projectile] : [projectile], damage };
}

export const requestPetMonkey1XjSkill = (params: Request) => request('monkey1Xj', params);
export const requestPetMonkey2LjSkill = (params: Request) => request('monkey2Lj', params);
export const requestPetMonkey2XjSkill = (params: Request) => request('monkey2Xj', params);
export const requestPetMonkey3LyqSkill = (params: Request) => request('monkey3Lyq', params);
export const requestPetMonkey3XjSkill = (params: Request) => request('monkey3Xj', params);
export const requestPetMonkey3LjSkill = (params: Request) => request('monkey3Lj', params);
export const requestPetMonkey4JgaoyiSkill = (params: Request) => request('monkey4Jgaoyi', params);
