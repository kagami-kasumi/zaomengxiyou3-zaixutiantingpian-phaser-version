/** Diagnostic: exit zero means evidence collected, not correct owner isolation. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { catchNewPet } from '../src/systems/PetRosterSystem';
import { CapturablePetDefinitions } from '../src/systems/PetTuning';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const rosters = createPlayerPetRosters();
const definition = Object.values(CapturablePetDefinitions).find(d => d.species === 'monkey' && d.form === 1)!;
assert(definition);
const pets = (['p1', 'p2'] as const).map(slot => {
  rosters[slot].pets.forEach(p => { p.isActive = false; });
  const pet = catchNewPet(rosters[slot], definition.petName)!;
  pet.isActive = true; pet.skills = []; pet.moveSpeed = 0; return pet;
});
const runtimes = [new PetCombatRuntime(), new PetCombatRuntime()], projectiles = createProjectileSystem();
const owner = { x: 300, y: 350, facingX: 1 as const };
for (const [index, slot] of (['p1', 'p2'] as const).entries()) runtimes[index]!.update({
  roster: rosters[slot], owner, projectiles, targets: [], deltaMs: 0, hostFps: 24,
});
const origin = runtimes[0]!.snapshot().runtime!;
for (let tick = 0; tick < 100 && projectiles.projectiles.length < 2; tick++) {
  for (const [index, slot] of (['p1', 'p2'] as const).entries()) runtimes[index]!.update({
    roster: rosters[slot], owner, projectiles, targets: [{ id: 'target', x: origin.x + 40, y: origin.y, isAlive: true }],
    deltaMs: 1000 / 24, hostFps: 24, random: () => 0.1, projectileCombat: noTargetBodyFixturePort,
  });
}
assert.equal(projectiles.projectiles.length, 2);
const before = projectiles.projectiles.map(p => ({ id: p.projectileId, sourceId: p.sourceId }));
runtimes[0]!.destroy();
const report = { status: 'diagnostic-not-acceptance', ids: pets.map(p => p.id), before,
  afterP1Release: projectiles.projectiles.map(p => p.projectileId),
  p2RuntimeAlive: !runtimes[1]!.snapshot().destroyed,
  expectedSurvivingProjectiles: 1, actualSurvivingProjectiles: projectiles.projectiles.length };
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/capture-owner-preflight.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report)); runtimes[1]!.destroy();
