import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { prepareCompatibilityPetReception, releaseCompatibilityPet } from '../src/systems/PetReceptionCompatibilitySystem';
import { readLegacyPetExperience } from '../src/systems/PetExperienceTargetSystem';
import type { PetState, PetRoster } from '../src/systems/PetTypes';
import type { ProjectileSystemModel } from '../src/systems/ProjectileTypes';
import type { MonsterDamageRequest } from '../src/systems/MonsterDamageReception';
import { updateOwnedPetSystem } from '../src/scenes/test-scene/TestScenePetMagicBridge';
import { readPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import { createHeroCombat } from '../src/systems/HeroCombatSystem';
import { createHeroSkillModel } from '../src/systems/HeroSkillSystem';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { Monster3Attack } from '../src/systems/Monster3AttackRuntime';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json', 'utf8'));
const seed = createSeedPetRoster().pets[0]!;
const request = (fps: number): MonsterDamageRequest => ({
  source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
  sourceId: 'compatibility-lifecycle', attackId: 'fatal', actionName: 'hit1', power: 100,
  attackKind: 'physical', geometryHit: true, bingo: false, difficulty: 2, timeMs: 0,
  hostFps: fps, knockbackX: 0, knockbackY: 0,
});
let cases = 0;
for (const c of truth.receptions.filter((item: { id: string }) => item.id.split(':')[3] === 'dead')) {
  const form = c.id.split(':')[0], fps = Number(c.id.split(':')[4]);
  const match = /^(\w+)([1-4])$/.exec(form)!;
  const projectiles: ProjectileSystemModel = { projectiles: [], projectileSerial: 0, sourceAttackSerialBySource: {} };
  const owners = (['p1', 'p2'] as const).map(slot => {
    const pet: PetState = { ...structuredClone(seed), id: 'same-save-id', species: match[1] as PetState['species'],
      form: Number(match[2]), hp: 100, maxHp: 100, lifetime: 1, def: 0, skills: [],
      missRate: 0, magicDefenseRate: 0, isActive: true };
    const roster: PetRoster = { pets: [pet], selectedIndex: 0, message: '' };
    const runtime = createPetRuntime(pet, { x: 0, y: 0, facingX: 1 });
    let destroyed = 0, changed = 0;
    const body = prepareCompatibilityPetReception(pet, runtime, roster, slot, projectiles,
      () => { destroyed++; }, () => { changed++; });
    const source = readLegacyPetExperience(runtime)!;
    // These are lifecycle ownership fixtures; projectile motion is outside this test.
    const projectile = { experienceSource: source, isExpired: false } as ProjectileSystemModel['projectiles'][number];
    projectiles.projectiles.push(projectile);
    return { pet, runtime, body, source, projectile, counts: () => ({ destroyed, changed }) };
  });
  const [first, second] = owners;
  assert.notEqual(first!.source, second!.source);
  assert.equal(first!.runtime.runtimeKey, second!.runtime.runtimeKey);
  const party = createHeroPartyRuntimeModel(['p1', 'p2'].map(slot => ({
    slot: slot as 'p1' | 'p2', heroId: 1, x: 300, y: 200, width: 40 })));
  const sessions = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  for (const owner of owners) { owner.runtime.x = 300; owner.runtime.y = 200; }
  const attack: Monster3Attack = { id: 'compatibility-geometry', action: 'hit1', x: 300, y: 140,
    facingX: -1, frame: 3, age: 3, parentId: 'world', source: request(fps).source,
    reception: { prefix: 'm3:', serial: 1, count: 0, remaining: 99, interval: 999 } };
  let exited = false;
  const pairs = heroPartyMonster3Targets(party, sessions,
    slot => owners[slot === 'p1' ? 0 : 1]!.pet, () => exited, attack,
    slot => owners[slot === 'p1' ? 0 : 1]!.runtime);
  assert.equal(pairs.length, 2); assert(pairs.every(pair => pair.pet));
  assert.notEqual(pairs[0]!.pet!.ids, pairs[1]!.pet!.ids);
  const retained = pairs[0]!.pet!;
  retained.receive(request(fps));
  assert.equal(first!.pet.hp, 0); assert.equal(first!.pet.lifetime, 0);
  assert.equal(first!.counts().changed, 1, 'First death pose is published synchronously');
  assert.equal(second!.pet.hp, 100); assert.equal(second!.pet.lifetime, 1);
  const terminal = c.states.find((state: { dead: boolean }) => state.dead).tick;
  for (let tick = 1; tick <= terminal; tick++) {
    first!.body.update(1000 / fps, fps);
    assert.equal(first!.counts().destroyed, tick === terminal ? 1 : 0, `${c.id}/${tick}`);
  }
  assert.equal(first!.projectile.isExpired, true);
  assert.equal(first!.projectile.experienceSource, undefined);
  assert.equal(readLegacyPetExperience(first!.runtime), undefined);
  assert.equal(first!.source.isReadyToDestroy(), true);
  assert.equal(second!.projectile.isExpired, false);
  assert.equal(second!.projectile.experienceSource, second!.source);
  assert.equal(second!.source.isReadyToDestroy(), false);
  delete first!.pet.missRate;
  assert.equal(retained.receive(request(fps)).accepted, false);
  first!.body.update(10000, fps);
  releaseCompatibilityPet(first!.runtime);
  assert.equal(first!.counts().destroyed, 1, 'Release is idempotent after death');
  releaseCompatibilityPet(second!.runtime);
  assert.equal(second!.counts().destroyed, 1);
  assert.equal(second!.projectile.isExpired, true);
  assert.equal(second!.projectile.experienceSource, undefined);
  exited = true;
  assert.equal(pairs[1]!.pet!.receive(request(fps)).accepted, false);
  sessions.p1.destroy(); sessions.p2.destroy(); destroyHeroPartyRuntime(party);
  cases++;
}
assert.equal(cases, 57);
for (const lifetime of [1, 2]) for (const slot of ['p1', 'p2'] as const) for (const fps of [20, 24, 30]) {
  const pet: PetState = { ...structuredClone(seed), id: 'bridge-pet', species: 'ufo', form: 1,
    hp: 100, maxHp: 100, lifetime, def: 0, skills: [], missRate: 0, magicDefenseRate: 0, isActive: true };
  const roster: PetRoster = { pets: [pet], selectedIndex: 0, message: '' };
  const owner = { movement: { x: 300, y: 350, facingX: 1 }, combat: createHeroCombat(slot),
    skill: createHeroSkillModel(), baseStats: { power: 10, defense: 0 } };
  let runtime: ReturnType<typeof updateOwnedPetSystem>;
  let visible = false;
  const projectiles: ProjectileSystemModel = { projectiles: [], projectileSerial: 0, sourceAttackSerialBySource: {} };
  const step = () => { runtime = updateOwnedPetSystem({ ownerSlot: slot, owner, roster, runtime,
    targets: [], projectiles, deltaMs: 1000 / fps, hostFps: fps,
    syncView: (_pet, next) => { runtime = next; visible = true; }, destroyView: () => { visible = false; } }); };
  step();
  const original = runtime!, body = readPetReceptionBody(original)!;
  body.receive(request(fps));
  for (let tick = 0; tick < 10; tick++) step();
  assert.equal(body.snapshot().phase, 'released'); assert.equal(visible, false);
  for (let tick = 0; tick < 10; tick++) step();
  assert.equal(pet.hp, 0); assert.equal(pet.lifetime, lifetime - 1);
  assert.equal(visible, false, 'HP=0 pet cannot reappear after its death deadline');
  if (lifetime > 1) {
    pet.hp = 100; step();
    assert.notEqual(runtime, original, 'Explicit HP restoration creates a fresh runtime');
    assert.equal(readPetReceptionBody(runtime)!.snapshot().phase, 'alive');
    assert.equal(visible, true);
  }
  owner.combat.hp = 0; owner.combat.state = 'dead'; step();
  assert.equal(runtime, undefined); assert.equal(visible, false);
  assert.equal(body.snapshot().phase, 'released');
}
console.log(`Compatibility reception: ${cases} native death deadlines, last-life removal, synchronous pose, exact-owner projectile retirement and idempotent exit passed.`);
