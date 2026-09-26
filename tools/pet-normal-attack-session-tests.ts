/** Original conditional RNG boundaries through the real ground Session. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { bodyGroundFixture } from './pet226-body/ground-fixture';

const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-227/source-trace.json', 'utf8'));
let cases = 0;
for (const family of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4] as const)
for (const fps of [20, 24, 30]) for (const ownerIndex of [1, 2])
for (const first of [0.7, 0.700001]) for (const second of [0.299999, 0.3]) {
  const oracle = source.cases.find((r: any) => r.id === `${family}${form}:random-${first}-${second}`);
  assert(oracle);
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === family && p.form === form; });
  const pet = roster.pets.find(p => p.isActive)!;
  pet.id = `p${ownerIndex}-${pet.id}`; pet.skills = [];
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: 300 * ownerIndex, y: 350, facingX: -1 as const };
  const groundEnvironment = bodyGroundFixture(family, form, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, hostFps: fps, deltaMs: 0 });
  assert.equal(runtime.snapshot().runtime!.facingX, 1, 'BasePet constructor faces right independently of hero facing');
  const origin = runtime.snapshot().runtime!;
  const rolls = [first, second];
  let reads = 0;
  const frame = { roster, owner, groundEnvironment, projectiles, hostFps: fps, deltaMs: 1000 / fps,
    targets: [{ id: 'target', x: origin.x + 10, y: origin.y, isAlive: true }],
    random: () => { assert(reads < rolls.length, 'Duplicate conditional chance owner'); return rolls[reads++]!; } };
  for (let tick = 0; tick < fps; tick++) {
    runtime.update(frame);
    assert.equal(reads, 0, 'Acquisition and off-phase ticks do not draw');
    assert(!runtime.events().some(e => e.action?.type === 'basic-attack'));
  }
  runtime.update(frame);
  assert.equal(reads, oracle.randomCalls);
  assert.equal(runtime.events().some(e => e.action?.type === 'basic-attack'), oracle.events.includes('normal'));
  const direction = oracle.events.includes('static') ? 0 : 1;
  assert.equal(runtime.snapshot().groundMotion!.direction, direction);
  if (!oracle.events.includes('normal')) {
    assert.equal(runtime.snapshot().runtime!.x, origin.x + (direction === 0 ? 0 : 5));
  }
  runtime.destroy(); cases++;
}
assert.equal(cases, 192);
console.log(`${cases} real ground Session cases match native phase, acquisition and conditional RNG boundaries for both owner identities.`);
