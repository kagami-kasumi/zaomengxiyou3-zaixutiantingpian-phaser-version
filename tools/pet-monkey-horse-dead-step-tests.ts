/** Retained-dead scheduler through real family bodies and private projectiles.
 * Source child/body/passive sinks establish scheduling only, not damage or removal. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import { bodyGroundFixture } from './pet226-body/ground-fixture';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/dead-step-native.json', 'utf8'));
for (const source of native.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.fileSha256);
assert.equal(native.cases.length, 288);
const rows: unknown[] = [], failures: unknown[] = [];
for (const family of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4])
for (const fps of [20, 24, 30]) for (const ownerIndex of [1, 2]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === family && p.form === form; });
  const pet = roster.pets.find(p => p.isActive)!;
  Object.assign(pet, { id: `p${ownerIndex}-${pet.id}`, skills: [], hp: 1000, maxHp: 1000, moveSpeed: 0 });
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: 300 * ownerIndex, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture(family, form as 1 | 2 | 3 | 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  let reads = 0;
  const frame = { roster, owner, groundEnvironment, projectiles, hostFps: fps, deltaMs: 1000 / fps,
    targets: [{ id: 'target', x: origin.x + 40, y: origin.y, isAlive: true }],
    random: () => { reads++; return 0; }, projectileCombat: noTargetBodyFixturePort };
  for (let n = 0; n < 100 && !projectiles.projectiles.length; n++) runtime.update(frame);
  const bullet = projectiles.projectiles[0];
  assert(bullet, `${family}${form}: real body emits before death`);
  const age = bullet.petHostTick!;
  const cd = family === 'monkey' ? pet.skillState!.monkey1Xj : pet.skillState!.horse1Sp;
  cd.cooldownMs = 3 * 1000 / fps;
  const priorReads = reads;
  for (let tick = 1; tick <= 4; tick++) {
    runtime.update({ ...frame, damageEvents: tick === 1
      ? [{ runtimeKey: origin.runtimeKey!, amount: 2000, reactsToHit: true }] : [] });
    const oracle = native.cases.find((r: any) => r.family === `${family}${form}` && r.fps === fps && r.phase === 0 && r.tick === tick);
    assert(oracle);
    const row = { family, form, fps, ownerIndex, tick, phase: runtime.snapshot().phase,
      childSteps: bullet.petHostTick! - age, cooldownTicks: cd.cooldownMs * fps / 1000,
      randomReads: reads - priorReads, expectedChildSteps: oracle.childCalls, expectedCooldownTicks: oracle.cd[0] };
    rows.push(row);
    if (row.childSteps !== oracle.childCalls || Math.abs(row.cooldownTicks - oracle.cd[0]) > 1e-8
      || row.randomReads !== 0 || row.phase !== 'dead-playing') failures.push(row);
  }
  for (let n = 0; n < 100 && runtime.snapshot().runtime; n++) runtime.update(frame);
  assert.equal(runtime.snapshot().runtime, undefined);
  assert.equal(projectiles.projectiles.length, 0);
  runtime.destroy();
}
if (process.env.PET226_DEAD_PREFLIGHT === '1') {
  writeFileSync('docs/tasks/evidence/TASK-SLICE-226/dead-step-modern-preflight.json', JSON.stringify({ rows, failures }));
  console.log(`${rows.length} retained-dead Runtime states, ${failures.length} mismatches (diagnostic only).`);
} else {
  assert.deepEqual(failures, []);
  console.log(`${rows.length} real Runtime retained-dead states match native child/CD scheduling; AI suppressed and body completion cleans up. Damage/passive/ground excluded.`);
}
