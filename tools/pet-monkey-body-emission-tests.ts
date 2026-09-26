import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const native = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SETTINGS-228/callback-air/measurement.json', 'utf8')) as {
  cases: { form: number; fps: number; action: string; local: boolean; hurt: boolean; skills: number; noTarget: boolean;
    rows: { tick: number; action: string; events: { kind: string }[] }[] }[];
};
const actions = [['xj'], ['lj', 'xj'], ['lyq', 'xj', 'lj'], ['lyq', 'xj', 'lj']] as const;
let compared = 0;
for (const form of [1, 2, 3, 4]) for (const [index, skill] of actions[form - 1]!.entries()) {
  for (const fps of [20, 24, 30]) for (const partitions of [1, 2, 4]) {
    const body = native.cases.find(c => c.form === form && c.fps === fps && c.action === `hit${index + 2}`
      && c.local && !c.hurt && c.skills === -1 && !c.noTarget)!;
    const emitRows = body.rows.filter(r => r.events.some(e => e.kind === 'emit'));
    const emit = emitRows[0]!.tick;
    const duration = body.rows.find(r => r.action === 'wait')!.tick;
    const roster = createSeedPetRoster();
    for (const pet of roster.pets) pet.isActive = pet.species === 'monkey' && pet.form === form;
    const pet = roster.pets.find(pet => pet.isActive)!;
    pet.skills = [skill]; pet.mp = 100; pet.skillState!.monkey1Xj.releaseReady = true;
    pet.skillState!.monkey2Xj.releaseReady = true; pet.skillState!.monkey3Lj.releaseReady = true;
    const runtime = new PetCombatRuntime();
    const projectiles = createProjectileSystem();
    const owner = { x: 200, y: 300, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture('monkey', form as 1 | 2 | 3 | 4, owner.y - 100);
    runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps: fps });
    const origin = runtime.snapshot().runtime!;
    const targets = [{ id: 'target', x: origin.x + 80, y: origin.y, isAlive: true }];
    const emissions: number[] = [];
    for (let tick = 0; tick <= duration + 1; tick++) {
      for (let part = 0; part < partitions; part++) {
        runtime.update({ roster, owner, groundEnvironment, targets, projectiles, deltaMs: 1000 / fps / partitions,
          hostFps: fps, random: () => 0.1, projectileCombat: noTargetBodyFixturePort });
        if (runtime.events().some(e => e.behaviorEvent?.type === 'skill-emitted')) emissions.push(tick);
      }
      assert.equal(pet.mp, tick === 0 ? 100 : 100 - 20, 'MP charged once on release');
      if (tick < emit) assert.equal(projectiles.projectiles.length, 0, 'no projectile before native callback');
    }
    assert.deepEqual(emissions, emitRows.map(row => row.tick), `monkey${form}/${skill}/${fps}/${partitions}`);
    assert.equal(projectiles.projectiles.length, emitRows.reduce((sum, row) => sum + row.events.filter(e => e.kind === 'emit').length, 0));
    if (skill === 'lj') {
      for (let i = 0; i < projectiles.projectiles.length; i += 2) {
        assert.equal(projectiles.projectiles[i]!.visualOnly, true);
        assert.equal(projectiles.projectiles[i + 1]!.visualOnly, false);
      }
    }
    runtime.destroy(); compared++;
  }
}
console.log('Monkey native body skill emission and release-time MP:', compared, 'real Runtime cases passed.');
