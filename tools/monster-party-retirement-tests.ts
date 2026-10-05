import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bindHeroPartyPetRetirement } from '../src/scenes/HeroPartyPetRetirement';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { prepareCompatibilityPetReception, releaseCompatibilityPet } from '../src/systems/PetReceptionCompatibilitySystem';
import { checkMonsterAttackReception } from '../src/systems/MonsterAttackReception';
import { monster3AttackHits, monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';
import type { PetRuntimeModel } from '../src/systems/PetTypes';
import { readHeroMonsterReceptionInput, receiveHeroMonsterDamage } from '../src/systems/HeroMonsterDamageReception';
import { refreshTurtleLink } from '../src/systems/PetTurtleLinkSystem';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster2-reception-contract.json', 'utf8'));
const slots = ['p1', 'p2'] as const;
let cases = 0;
for (const species of ['monkey', 'ufo'] as const) for (const sequence of truth.sequences.filter((s: any) =>
  ['fatal-hero', 'hp-equal', 'hp-above', 'hero-protected', 'fatal-pet', 'normal'].includes(s.mode))) {
  const model = createHeroPartyRuntimeModel(slots.map(slot => ({ slot, heroId: 1, x: 300, y: 200, width: 40 })));
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const initial = sequence.steps[0].targets;
  const expected = sequence.steps.find((s: any) => s.tick === 6);
  const pets = slots.map(slot => {
    const pet = structuredClone(createSeedPetRoster().pets.find(p => p.species === 'monkey' && p.form === 1)!);
    Object.assign(pet, { id: 'same-id', species, hp: 1000, maxHp: 1000, lifetime: 10, def: 0,
      missRate: 0, magicDefenseRate: 0, skills: [], isActive: true });
    const init = initial.find((t: any) => t.sid === (slot === 'p1' ? 1 : 2));
    if (init) pet.hp = init.petHp;
    return pet;
  });
  const compatible: Partial<Record<'p1' | 'p2', PetRuntimeModel>> = {};
  const bodies: any[] = [], cleared = [0, 0];
  for (const [i, slot] of slots.entries()) {
    const pet = pets[i]!, roster = { pets: [pet], selectedIndex: 0, message: '' };
    if (species === 'monkey') for (let tick = 0; tick < 120; tick++) runtimes[slot].update({
      roster, owner: { x: 300, y: 200, facingX: 1 }, targets: [], random: () => 0.99,
      deltaMs: 1000 / sequence.fps, hostFps: sequence.fps,
      groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000,
        top: 250.1, bottom: 280, usesWallTolerance: true }] },
    });
    else {
      const runtime = compatible[slot] = createPetRuntime(pet, { x: 300, y: 200, facingX: 1 });
      bodies[i] = prepareCompatibilityPetReception(pet, runtime, roster, slot, model.projectiles, () => {});
    }
    const player = model.members[i]!.combat, init = initial.find((t: any) => t.sid === i + 1);
    player.combat.hp = init?.hp ?? 1000; player.combat.maxHp = 1000;
    player.effectiveStats.defense = 0; player.effectiveStats.missPercent = 0;
    if (sequence.mode === 'hero-protected') player.combat.invulnerableUntilMs = Infinity;
  }
  const unbind = bindHeroPartyPetRetirement(model, runtimes, slot => {
    releaseCompatibilityPet(compatible[slot]); delete compatible[slot]; cleared[slots.indexOf(slot)]!++;
  });
  const pose = runtimes.p1.snapshot().runtime ?? compatible.p1!;
  // pose is a source root; the actual hero movement owner stores feet.
  for (const member of model.members) { member.movement.x = pose.x; member.movement.y = pose.y + 50; }
  const attack: Monster3Attack = { id: 'retirement', action: 'hit1', x: pose.x, y: pose.y,
    facingX: -1, frame: 3, age: 3, parentId: 'world',
    source: { boss: true, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
    reception: { prefix: 'retirement:', serial: 1, count: 0, remaining: 99, interval: 999 } };
  let found = false;
  for (let dx = -150; dx <= 150 && !found; dx += 5) for (let dy = -150; dy <= 150; dy += 5) {
    attack.x = pose.x + dx; attack.y = pose.y + dy;
    if (monster3AttackHits(attack, 'hero-ObjectBaseSprite', pose.x, pose.y)
      && monster3AttackHits(attack, 'pet-ObjectBaseSprite3', pose.x, pose.y)) {
      found = true; break;
    }
  }
  assert(found);
  const pairs = heroPartyMonster3Targets(model, runtimes, slot => pets[slots.indexOf(slot)], () => false, attack, slot => compatible[slot]);
  const selected = pairs.filter((_, i) => initial.some((t: any) => t.sid === i + 1));
  const request = { ...monster3AttackRequest(attack, 1000, sequence.fps, 0), power: 29 };
  checkMonsterAttackReception(attack.reception, request, selected);
  assert.equal(attack.reception.remaining, expected.bullets[0].max, `${species}/${sequence.id}`);
  for (const t of expected.targets) {
    const i = t.sid - 1, slot = slots[i]!, pet = pets[i]!;
    assert.equal(model.members[i]!.combat.combat.hp, Math.max(0, t.hp), sequence.id);
    assert.equal(pet.hp, Math.max(0, t.petHp), `${species}/${sequence.id}/pet`);
    assert.equal(pet.lifetime, t.life, sequence.id);
    assert.equal(cleared[i], t.destroyed ? 1 : 0);
    if (t.destroyed) {
      assert.equal(runtimes[slot].snapshot().runtime, undefined, 'Synchronous session release');
      assert.equal(runtimes[slot].snapshot().summons?.length, 0);
      assert.equal(compatible[slot], undefined);
      if (bodies[i]) assert.equal(bodies[i].snapshot().phase, 'released');
      assert.equal(pairs[i]!.pet!.receive({ ...request, attackId: 'old-port' }).accepted, false);
      assert.equal(pet.hp, t.petHp); assert.equal(pet.lifetime, t.life);
    }
  }
  for (const [i, slot] of slots.entries()) if (!initial.some((t: any) => t.sid === i + 1)) {
    assert.equal(cleared[i], 0, 'Other slot remains attached');
    assert(runtimes[slot].snapshot().runtime ?? compatible[slot]);
    assert.equal(pets[i]!.hp, 1000);
  }
  if (expected.targets.every((t: any) => t.destroyed)) {
    attack.reception = { ...attack.reception, prefix: 'second:', remaining: 99 };
    checkMonsterAttackReception(attack.reception, request, selected);
    assert.equal(attack.reception.remaining, 99, 'Second bullet cannot use retired ports');
  }
  unbind(); slots.forEach(slot => { runtimes[slot].destroy(); releaseCompatibilityPet(compatible[slot]); });
  destroyHeroPartyRuntime(model); cases++;
}
console.log(`Party retirement: ${cases} source-sequence cases, real Session/compatibility owners, same-call cleanup and retained ports passed.`);
for (const slot of slots) for (const fps of [20, 24, 30]) for (const scenario of ['shield-full', 'turtle-link']) {
  const id = `Role1-${slot}-1-1-${scenario}`;
  const index = truth.direct.inputs.findIndex((row: any[]) => row[0] === id);
  const expected = Object.fromEntries(truth.direct.expectedColumns.map((key: string, i: number) => [key, truth.direct.expected[index][i]]));
  const model = createHeroPartyRuntimeModel([{ slot, heroId: 1, x: 0, y: 0, width: 40 }]);
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const pet = structuredClone(createSeedPetRoster().pets.find(p => p.species === 'monkey' && p.form === 1)!);
  Object.assign(pet, { hp: 1000, maxHp: 1000, def: 0, missRate: 0, magicDefenseRate: 0, skills: [], isActive: true });
  for (let tick = 0; tick < 120; tick++) runtimes[slot].update({ roster: { pets: [pet], selectedIndex: 0, message: '' },
    owner: { x: 0, y: 0, facingX: 1 }, targets: [], deltaMs: 1000 / fps, hostFps: fps,
    groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000,
      top: 50.1, bottom: 80, usesWallTolerance: true }] } });
  let retired = false;
  const unbind = bindHeroPartyPetRetirement(model, runtimes, () => { retired = true; });
  const player = model.members[0]!.combat;
  Object.assign(player.combat, { hp: 1000, maxHp: 1000 });
  Object.assign(player.effectiveStats, { defense: 0, missPercent: 0 });
  if (scenario === 'shield-full') player.combat.magicShield = { kind: 'magicUmbrella', remainingAmount: 100,
    initialAmount: 100, totalMs: 1000, remainingMs: 1000, sourceName: 'source-fixture' };
  else {
    const a = refreshTurtleLink(undefined, pet, 'link', 1, 100, fps), b = refreshTurtleLink(undefined, pet, 'link', 1, 100, fps);
    a.peer = () => b; b.peer = () => a; player.combat.turtleLink = a;
    a.reduceHp = amount => { pet.hp -= amount; };
  }
  const request = { source: { boss: true, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
    sourceId: 'source', attackId: id, actionName: 'hit1', power: 29, attackKind: 'physical' as const,
    geometryHit: true, bingo: false, difficulty: 0, timeMs: 1000, hostFps: fps, knockbackX: 0, knockbackY: 0 };
  receiveHeroMonsterDamage(player.combat, readHeroMonsterReceptionInput(player, { gxp: false, protected: false }), request);
  assert.equal(player.combat.hp, expected.hp, id);
  assert.equal(retired, false);
  const key = runtimes[slot].snapshot().runtime!.runtimeKey;
  assert.equal(runtimes[slot].currentMonsterReceptionTarget(key, () => undefined)!.receive(request).accepted, true,
    'Shield/transfer without owner destruction leaves pet independently receivable');
  unbind(); runtimes.p1.destroy(); runtimes.p2.destroy(); destroyHeroPartyRuntime(model);
}
console.log('12 source shield/link cases retain live pet ports at all three host rates.');
