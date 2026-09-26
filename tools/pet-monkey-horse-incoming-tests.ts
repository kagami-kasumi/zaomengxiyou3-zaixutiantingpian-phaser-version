import { bodyGroundFixture } from './pet226-body/ground-fixture';
/** Native reduceHp branch results through the real session, then its body/private-owner emission. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/incoming-native.json', 'utf8')) as {
  sources: { path: string; sha256: string }[];
  cases: { form: number; learned: boolean; reactive: boolean; gxp: boolean; lethal: boolean;
    action: string; roll: number; result: { action: string; hp: number; life: number; reads: number; normals: number } }[];
};
for (const source of native.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.sha256);
let cases = 0, emissions = 0;
for (const row of native.cases.filter(row => row.action === 'wait'))
for (const family of ['monkey', 'horse'] as const) for (const fps of [20, 24, 30]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === family && p.form === row.form; });
  const pet = roster.pets.find(p => p.isActive)!;
  Object.assign(pet, { skills: row.learned ? ['qlfj'] : [], hp: 100, maxHp: 100, lifetime: 100,
    warpower: 1, moveSpeed: 0, mp: 100, maxMp: 100 });
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: 300, y: 350, facingX: -1 as const };
  const groundEnvironment = bodyGroundFixture(family, row.form as 1 | 2 | 3 | 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
  const key = runtime.snapshot().runtime!.runtimeKey!;
  let reads = 0;
  const frame = { roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 1000 / fps, hostFps: fps,
    gxpRuntimeKeys: row.gxp ? [key] : [], random: () => { reads++; return row.roll; },
    projectileCombat: noTargetBodyFixturePort };
  runtime.update({ ...frame, damageEvents: [{ runtimeKey: key, amount: row.lethal ? 100 : 1, reactsToHit: row.reactive }] });
  const tag = `${family}${row.form}/${fps}/${JSON.stringify(row)}`;
  assert.equal(runtime.snapshot().animation?.action, row.result.action === 'hit1' ? 'basic-attack' : row.result.action, tag);
  assert.equal(pet.hp, row.result.hp, tag); assert.equal(pet.lifetime, row.result.life, tag);
  assert.equal(reads, row.result.reads, tag);
  assert.equal(projectiles.projectiles.length, 0, 'Incoming branch does not directly emit/damage');
  if (row.result.normals) {
    assert.equal(runtime.snapshot().runtime!.facingX, 1, 'No target retains original right-facing constructor state');
    assert.equal(runtime.snapshot().target, undefined);
    if (family === 'monkey' && row.form === 4) assert.equal(runtime.snapshot().protectedFromHits, true);
    for (let tick = 0; tick < 100 && !projectiles.projectiles.length; tick++) runtime.update(frame);
    assert.equal(projectiles.projectiles.length, 1, tag);
    const bullet = projectiles.projectiles[0]!;
    assert.equal(bullet.actionName, 'hit1'); assert.equal(bullet.sourceId, pet.id);
    assert.equal(bullet.petHostTick, 0); assert.equal(pet.mp, 100);
    emissions++;
  }
  runtime.destroy(); assert.equal(projectiles.projectiles.length, 0); cases++;
}
assert.equal(cases, 1152); assert(emissions > 0);
console.log(`${cases} real Runtime cases match original incoming branches; ${emissions} targetless counters emit through native body/private owner. No full Scene or target damage claim.`);

let directions = 0;
for (const family of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4])
for (const fps of [20, 24, 30]) for (const dx of [-40, 0, 40]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === family && p.form === form; });
  const pet = roster.pets.find(p => p.isActive)!;
  Object.assign(pet, { skills: ['qlfj'], hp: 100, maxHp: 100, warpower: 1, moveSpeed: 0 });
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: 300, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture(family, form as 1 | 2 | 3 | 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  const targets = [{ id: 'prior-target', x: origin.x + dx, y: origin.y, isAlive: true }];
  const frame = { roster, owner, groundEnvironment, projectiles, targets, deltaMs: 1000 / fps, hostFps: fps,
    random: () => 0, projectileCombat: noTargetBodyFixturePort };
  runtime.update(frame);
  runtime.update({ ...frame, damageEvents: [{ runtimeKey: origin.runtimeKey!, amount: 1,
    sourceId: 'unrelated-attacker', reactsToHit: true }] });
  assert.equal(runtime.snapshot().animation?.action, 'basic-attack');
  assert.equal(runtime.snapshot().target?.id, 'prior-target');
  // BasePet.faceToTarget: x < target.x turns right; equality takes the left branch.
  assert.equal(runtime.snapshot().runtime?.facingX, dx > 0 ? 1 : -1);
  runtime.destroy(); directions++;
}
assert.equal(directions, 72);
console.log(`${directions} retained-target counter facing cases, including equal x, passed.`);
