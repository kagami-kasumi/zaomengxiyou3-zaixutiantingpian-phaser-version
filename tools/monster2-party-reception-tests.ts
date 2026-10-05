import assert from 'node:assert/strict';
import { heroPartyMonster2Targets } from '../src/scenes/HeroPartyMonster2Reception';
import { bindHeroPartyPetRetirement } from '../src/scenes/HeroPartyPetRetirement';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { monster2AttackHits, monster2AttackRequest, type Monster2Attack } from '../src/systems/Monster2AttackRuntime';
import { monster2TargetProfile } from '../src/systems/Monster2CollisionSystem';

const slots = ['p1', 'p2'] as const;
let scenarios = 0;
for (const slot of slots) {
  const model = createHeroPartyRuntimeModel([{ slot, heroId: 1, x: 300, y: 200, width: 40 }]);
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const seed = createSeedPetRoster().pets.find(p => p.species === 'monkey' && p.form === 1)!;
  const oldPet = structuredClone(seed); oldPet.id = `${slot}-old`; oldPet.hp = oldPet.maxHp = 1000; oldPet.isActive = true;
  let currentPet = oldPet;
  const roster = () => ({ pets: [currentPet], selectedIndex: 0, message: '' });
  const updatePet = () => runtimes[slot].update({ roster: roster(), owner: { x: 300, y: 200, facingX: 1 }, targets: [], random: () => 0.99,
    deltaMs: 1000 / 30, hostFps: 30, groundEnvironment: { ownerRootOffsetY: -50,
      walls: [{ id: 'floor', left: -1000, right: 2000, top: 250.1, bottom: 280, usesWallTolerance: true }] } });
  updatePet();
  const member = model.members[0]!; const hero = member.combat;
  hero.combat.hp = hero.combat.maxHp = 1000;
  hero.effectiveStats = { ...hero.effectiveStats, defense: 0, missPercent: 0, magicDefensePercent: 0 };
  const attack: Monster2Attack = { id: `${slot}:monster2`, sourceId: 'monster2-fixture', attack: 1, x: 0, y: 0,
    facingX: -1, frame: 1, age: 1, parentId: 'world', source: { boss: false, hit: 0, criticalPercent: 0,
      magicDefenseReduction: 0, flower: false, random: () => 0.99 },
    reception: { prefix: `${slot}:bullet:`, serial: 1, count: 0, interval: 999, remaining: 99 } };
  const heroProfile = monster2TargetProfile(`Role${hero.normalAttack.heroId}`);
  const petProfile = monster2TargetProfile('PetMonkey1');
  const petRoot = { x: runtimes[slot].snapshot().runtime!.x, y: runtimes[slot].snapshot().runtime!.y };
  const heroRoot = { x: member.movement.x, y: member.movement.y - 50 };
  let found: { x: number; y: number } | undefined;
  for (let x = 100; x <= 500 && !found; x += 1) for (let y = 50; y <= 350 && !found; y += 1) {
    attack.x = x; attack.y = y;
    if (monster2AttackHits(attack, heroProfile, heroRoot.x, heroRoot.y) && monster2AttackHits(attack, petProfile, petRoot.x, petRoot.y)) found = { x, y };
  }
  assert(found, `${slot} needs a real Monster2 geometry root covering hero and pet`); attack.x = found.x; attack.y = found.y;
  let destroyed = false; let retired: string | undefined;
  const unbind = bindHeroPartyPetRetirement(model, runtimes, retiredSlot => { retired = retiredSlot; });
  const oldPairs = heroPartyMonster2Targets(model, runtimes, () => currentPet, () => destroyed, attack);
  const oldPair = oldPairs[0]!; assert(oldPair.pet, `${slot} must expose old session pet`);
  assert.notEqual(oldPair.hero.ids, oldPair.pet.ids, `${slot} hero/pet ID lists must be independent`);
  const request = { ...monster2AttackRequest(attack, 1000, 30, 0), attackId: `${slot}:live` };
  const oldHeroHp = hero.combat.hp; const oldPetHp = oldPet.hp;
  hero.effectiveStats.defense = 10;
  assert.equal(oldPair.hero.receive(request).accepted, true);
  assert.equal(hero.combat.hp, oldHeroHp - 19, `${slot} reads current defense after target creation`);
  assert.equal(oldPair.pet.receive(request).accepted, true); assert(oldPet.hp < oldPetHp);
  const oldPetAfterLive = oldPet.hp;
  const replacement = structuredClone(seed); replacement.id = `${slot}-replacement`; replacement.hp = replacement.maxHp = 1000; replacement.isActive = true;
  currentPet = replacement;
  Object.defineProperty(oldPet, 'skills', { get() { throw new Error('stale pet skill read'); } });
  let staleResult: { accepted: boolean } | undefined;
  assert.doesNotThrow(() => { staleResult = oldPair.pet!.receive({ ...request, attackId: `${slot}:stale` }); }, `${slot} stale owner must be rejected before reading old pet`);
  assert.equal(staleResult?.accepted, false);
  assert.equal(oldPet.hp, oldPetAfterLive, `${slot} stale owner HP must remain unchanged`);
  updatePet();
  const newPair = heroPartyMonster2Targets(model, runtimes, () => currentPet, () => destroyed, attack)[0]!;
  const replacementHp = replacement.hp;
  assert.equal(newPair.pet?.receive({ ...request, attackId: `${slot}:replacement` }).accepted, true);
  assert(replacement.hp < replacementHp, `${slot} current replacement pet must receive`);
  destroyed = true;
  assert.equal(newPair.hero.receive({ ...request, attackId: `${slot}:destroyed` }).accepted, false);
  assert.equal(newPair.pet?.receive({ ...request, attackId: `${slot}:destroyed-pet` }).accepted, false);
  assert.equal(retired, undefined, `${slot} live reception must not retire owner`);
  destroyed = false;
  hero.combat.hp = 1;
  const petBeforeLethal = replacement.hp;
  const lethal = { ...request, attackId: `${slot}:lethal` };
  assert.equal(newPair.hero.receive(lethal).accepted, true);
  assert.equal(hero.combat.state, 'dead');
  assert.equal(retired, slot, `${slot} actual fatal receiver synchronously retires current pet`);
  assert.equal(runtimes[slot].snapshot().runtime, undefined);
  assert.equal(newPair.pet?.receive(lethal).accepted, false);
  assert.equal(replacement.hp, petBeforeLethal, `${slot} retired pet keeps its actual HP`);
  unbind(); runtimes.p1.destroy(); runtimes.p2.destroy(); destroyHeroPartyRuntime(model); scenarios += 1;
}
assert.equal(scenarios, 2);
console.log('Monster2 formal-party reception: live hero/pet, current defense, real roster replacement, stale-owner rejection, destroyed guard and same-call fatal retirement passed.');
