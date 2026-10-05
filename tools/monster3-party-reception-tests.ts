import assert from 'node:assert/strict';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';

// Owner adapter test; placement is controlled and is not a natural Scene journey.
const model = createHeroPartyRuntimeModel(['p1', 'p2'].map(slot => ({
  slot: slot as 'p1' | 'p2', heroId: 1, x: 300, y: 250, width: 40,
})));
const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
const pets = Object.fromEntries(['p1', 'p2'].map(slot => {
  const pet = structuredClone(createSeedPetRoster().pets.find(p => p.species === 'monkey' && p.form === 1)!);
  pet.id = `${slot}-pet`; pet.isActive = true;
  return [slot, pet];
})) as Record<'p1' | 'p2', ReturnType<typeof createSeedPetRoster>['pets'][number]>;
for (const slot of ['p1', 'p2'] as const) for (let tick = 0; tick < 120; tick++) runtimes[slot].update({
  roster: { pets: [pets[slot]], selectedIndex: 0, message: '' },
  owner: { x: 300, y: 200, facingX: 1 }, targets: [], random: () => 0.99,
  deltaMs: 1000 / 30, hostFps: 30,
  groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000,
    top: 250.1, bottom: 280, usesWallTolerance: true }] },
});
let destroyed = false;
const attack: Monster3Attack = { id: 'monster3:1', action: 'hit1', x: 300, y: 140,
  facingX: -1, frame: 3, age: 3, parentId: 'world',
  source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.99 },
  reception: { prefix: 'm3:', serial: 1, count: 0, remaining: 99, interval: 999 } };
const pairs = heroPartyMonster3Targets(model, runtimes, slot => pets[slot], () => destroyed, attack);
assert.equal(pairs.length, 2);
assert(pairs.every(pair => pair.pet), 'each owner has its own live Session target');
for (let i = 0; i < pairs.length; i++) {
  const player = model.members[i]!.combat;
  player.combat.hp = player.combat.maxHp = 1000;
  player.effectiveStats.defense = 3;
  player.effectiveStats.missPercent = 0;
  const result = pairs[i]!.hero.receive({ ...monster3AttackRequest(attack, 1000, 30, 0), attackId: `hit-${i}` });
  assert.equal(result.accepted, true);
  assert.equal(player.combat.hp, 963, 'current defense goes through the actual hero HP owner');
  player.effectiveStats.defense = 10;
  pairs[i]!.hero.receive({ ...monster3AttackRequest(attack, 2000, 30, 0), attackId: `next-${i}` });
  assert.equal(player.combat.hp, 933, 'same port reads changed effective stats');
}
assert.notEqual(pairs[0]!.hero.ids, pairs[1]!.hero.ids);
assert.notEqual(pairs[0]!.pet!.ids, pairs[1]!.pet!.ids);
// Old pair cannot read counter/attributes or settle damage after a roster swap.
const oldPet = pets.p1, oldHp = oldPet.hp;
pets.p1 = structuredClone(oldPet);
Object.defineProperty(oldPet, 'skills', { get() { throw new Error('Stale pet skill read'); } });
assert.equal(pairs[0]!.pet!.receive(monster3AttackRequest(attack, 3000, 30, 0)).accepted, false);
assert.equal(oldPet.hp, oldHp);
destroyed = true;
assert.equal(pairs[1]!.hero.receive(monster3AttackRequest(attack, 3000, 30, 0)).accepted, false);
assert.equal(pairs[1]!.pet!.receive(monster3AttackRequest(attack, 3000, 30, 0)).accepted, false);
runtimes.p1.destroy(); runtimes.p2.destroy(); destroyHeroPartyRuntime(model);
console.log('Monster3 formal-party adapter: P1/P2 current hero HP/stats, separate hero/pet IDs, stale roster and destroyed owner rejection passed.');
