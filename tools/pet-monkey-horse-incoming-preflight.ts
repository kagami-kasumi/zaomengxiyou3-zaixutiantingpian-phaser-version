/** Diagnostic of actual session branches. Exit zero means observations collected, not acceptance. */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const rows: unknown[] = [];
for (const family of ['monkey', 'horse']) for (const form of [1, 2, 3, 4])
for (const fps of [20, 24, 30]) for (const mode of ['counter', 'follow-640', 'warp-950', 'target-warp']) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === family && p.form === form; });
  const pet = roster.pets.find(p => p.isActive)!;
  Object.assign(pet, { skills: ['qlfj'], hp: 1000, maxHp: 1000, warpower: 1, moveSpeed: 0 });
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: 300, y: 350, facingX: 1 as const };
  runtime.update({ roster, owner, projectiles, targets: [], deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  if (mode !== 'counter') {
    owner.x = origin.x - (mode === 'follow-640' ? 640 : mode === 'warp-950' ? 950 : 1100);
    owner.y = origin.y;
  }
  const targets = mode === 'target-warp'
    ? [{ id: 'target', x: origin.x + 700, y: origin.y, isAlive: true }] : [];
  runtime.update({ roster, owner, projectiles, targets, deltaMs: 1000 / fps, hostFps: fps,
    damageEvents: mode === 'counter' ? [{ runtimeKey: origin.runtimeKey!, amount: 1, reactsToHit: true }] : [],
    random: () => 0, projectileCombat: noTargetBodyFixturePort });
  const after = runtime.snapshot();
  assert(after.runtime && after.animation);
  rows.push({ family, form, fps, mode, owner, before: origin,
    after: { runtime: after.runtime, action: after.animation.action, target: after.target },
    sourceExpectation: mode === 'counter' ? 'hit1 even without target' : mode === 'follow-640'
      ? 'wait at root distance 640' : mode === 'warp-950' ? 'no warp at root distance 950'
        : 'warp despite target at root distance 1100; zero controlled movement' });
  runtime.destroy();
}
assert.equal(rows.length, 96);
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/incoming-follow-preflight.json', JSON.stringify({
  status: 'diagnostic-not-acceptance', scope: 'Actual PetCombatRuntime, controlled zero speed/RNG; original static contracts, not native spatial oracle.', rows,
}, null, 2) + '\n');
console.log(`${rows.length} actual Runtime observations collected; source expectations require independent native comparison.`,
  JSON.stringify(rows.slice(0, 4)));
