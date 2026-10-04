import assert from 'node:assert/strict';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { attachPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';

for (const change of ['runtime', 'roster', 'scene'] as const) {
  const model = createHeroPartyRuntimeModel([{ slot: 'p1', heroId: 1, x: 300, y: 200, width: 40 }]);
  const sessions = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const pet = structuredClone(createSeedPetRoster().pets.find(p => p.species === 'ufo' && p.form === 1)!);
  Object.assign(pet, { hp: 100, maxHp: 100, def: 0, skills: [], missRate: 0, magicDefenseRate: 0 });
  const runtime = createPetRuntime(pet, { x: 300, y: 200, facingX: 1 });
  runtime.x = 300; runtime.y = 200;
  const body = attachPetReceptionBody(pet, runtime, { setStatic() {}, cleanup() {}, release() {} });
  let currentPet = pet, currentRuntime = runtime, destroyed = false;
  const attack: Monster3Attack = { id: 'stale-target', action: 'hit1', x: 300, y: 140,
    facingX: -1, frame: 3, age: 3, parentId: 'world',
    source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
    reception: { prefix: 'stale:', serial: 1, count: 0, interval: 999, remaining: 99 } };
  const target = heroPartyMonster3Targets(model, sessions, () => currentPet, () => destroyed, attack,
    () => currentRuntime)[0]!.pet!;
  assert(target);
  if (change === 'runtime') currentRuntime = { ...runtime };
  if (change === 'roster') currentPet = { ...pet };
  if (change === 'scene') destroyed = true;
  // Keep old body alive: the current-owner adapter must reject before teardown too.
  Object.defineProperty(pet, 'skills', { get() { throw Error('Stale owner skill read'); } });
  assert.doesNotThrow(() => {
    assert.equal(target.receive(monster3AttackRequest(attack, 1000, 30, 2)).accepted, false, change);
  });
  assert.equal(pet.hp, 100); assert.equal(currentPet.hp, 100);
  body.release('owner-exit'); sessions.p1.destroy(); sessions.p2.destroy(); destroyHeroPartyRuntime(model);
}
console.log('Monster3 current compatibility targets reject changed runtime, roster and destroyed Scene before reading old skills.');
