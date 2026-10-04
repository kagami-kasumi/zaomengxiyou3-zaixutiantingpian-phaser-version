import assert from 'node:assert/strict';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { readPetMonsterReceptionInput } from '../src/systems/PetMonsterDamageReception';
import { requestPetRabbit2JfSkill, updatePetRabbitPersistentEffects } from '../src/systems/PetRabbitSkillSystem';
import { receiveCurrentOwnedPetMonsterDamage } from '../src/systems/PetBattleOwnershipSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { addPetExperience, getPetExperienceToNextLevel } from '../src/systems/PetProgressionSystem';
import type { MonsterDamageRequest } from '../src/systems/MonsterDamageReception';

function request(roll: number): MonsterDamageRequest {
  return { source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => roll },
    sourceId: 'monster3', attackId: 'input-probe', actionName: 'hit2', power: 18, attackKind: 'magic',
    geometryHit: true, bingo: false, difficulty: 0, timeMs: 1000, hostFps: 24, knockbackX: 0, knockbackY: 0 };
}

const context = { action: 'idle', protected: false, gxp: false, counterChance: undefined };
for (const slot of ['p1', 'p2'] as const) {
  const roster = createPlayerPetRosters()[slot], pet = roster.pets[0]!;
  assert.deepEqual(readPetMonsterReceptionInput(pet, context), {
    ...context, missRate: 0, magicDefenseRate: 0, rabbitDodgeActive: false,
  });
  Object.assign(pet, { species: 'rabbit', form: 2, skills: ['jf'], mp: 100 });
  assert.equal(requestPetRabbit2JfSkill({ roster, hostFps: 24 }).ok, true);
  pet.missRate = 0.12; pet.magicDefenseRate = 0.23;
  const active = readPetMonsterReceptionInput(pet, context);
  assert.equal(active.missRate, 0.12); assert.equal(active.magicDefenseRate, 0.23);
  assert.equal(active.rabbitDodgeActive, true);
  const compatibility = createPetRuntime(pet, { x: 100, y: 100, facingX: 1 });
  assert.equal(receiveCurrentOwnedPetMonsterDamage(pet, compatibility, context, request(0.2)).missed, true);
  updatePetRabbitPersistentEffects({ roster, deltaMs: 121 * 1000 / 24, hostFps: 24 });
  assert(pet.skillState!.rabbit2Jf.cooldownMs > 0);
  assert.equal(readPetMonsterReceptionInput(pet, context).rabbitDodgeActive, false);
  const hpBefore = pet.hp;
  assert.equal(receiveCurrentOwnedPetMonsterDamage(pet, compatibility, context, request(0.99)).amount, 13);
  assert.equal(pet.hp, hpBefore - 13);
  for (const field of ['missRate', 'magicDefenseRate'] as const) {
    const before = pet[field];
    for (const missing of [undefined, NaN, Infinity]) {
      pet[field] = missing;
      assert.throws(() => readPetMonsterReceptionInput(pet, context), /attributes unavailable/);
    }
    pet[field] = before;
  }
}
for (const slot of ['p1', 'p2'] as const) {
  const roster = createPlayerPetRosters()[slot], pet = roster.pets[0]!;
  const runtime = new PetCombatRuntime();
  const frame = { roster, owner: { x: 280, y: 200, facingX: -1 as const }, targets: [], random: () => 0.99,
    deltaMs: 1000 / 30, hostFps: 30, groundEnvironment: { ownerRootOffsetY: -50,
      walls: [{ id: 'floor', left: -1000, right: 2000, top: 250.1, bottom: 280, usesWallTolerance: true }] } };
  for (let i = 0; i < 120; i++) runtime.update(frame);
  const snapshot = runtime.snapshot();
  assert(snapshot.runtime && !snapshot.protectedFromHits);
  let counterReads = 0;
  const target = runtime.currentMonsterReceptionTarget(snapshot.runtime.runtimeKey, () => { counterReads++; return undefined; })!;
  // Capture the target before a real upgrade: reception must not cache old stats.
  pet.level = 59;
  addPetExperience(pet, getPetExperienceToNextLevel(59), () => 0.99);
  assert.equal(pet.missRate, 0.01); assert.equal(pet.magicDefenseRate, 0.01);
  assert.equal(target.receive(request(0.005)).missed, true);
  const hp = pet.hp;
  assert.equal(target.receive(request(0.99)).amount, 17);
  assert.equal(pet.hp, hp - 17);
  runtime.destroy();
  const deadHp = pet.hp;
  const readsBeforeDestroy = counterReads;
  delete pet.missRate;
  assert.equal(target.receive(request(0.99)).accepted, false, 'Retained target must reject before reading unknown attributes');
  assert.equal(pet.hp, deadHp);
  assert.equal(counterReads, readsBeforeDestroy, 'Released targets cannot query a stale owner callback');
  assert.equal(runtime.currentMonsterReceptionTarget(snapshot.runtime.runtimeKey, () => undefined), undefined);
}
console.log('Pet reception reads current owner attributes and active effect for both players; unknown inputs rejected.');
