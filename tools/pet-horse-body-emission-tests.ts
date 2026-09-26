import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const native = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SETTINGS-229/callback-air/measurement.json', 'utf8')) as {
  cases: { form: number; fps: number; action: string; local: boolean; hurt: boolean; skills: number; noTarget: boolean;
    rows: { tick: number; action: string; events: { kind: string }[] }[] }[];
};
const actions = [['sp'], ['bd', 'sp'], ['bd', 'sp', 'bz'], ['bd', 'sp', 'bz', 'tmaoyi']] as const;
let compared = 0;
for (const form of [1, 2, 3, 4]) for (const [index, skill] of actions[form - 1]!.entries()) {
  for (const fps of [20, 24, 30]) for (const partitions of [1, 2, 4]) {
    const body = native.cases.find(c => c.form === form && c.fps === fps && c.action === `hit${index + 2}`
      && c.local && !c.hurt && c.skills === -1 && !c.noTarget)!;
    const emit = body.rows.find(r => r.events.some(e => e.kind === 'emit'))!.tick;
    const roster = createSeedPetRoster();
    for (const pet of roster.pets) pet.isActive = pet.species === 'horse' && pet.form === form;
    const pet = roster.pets.find(pet => pet.isActive)!;
    pet.skills = [skill]; pet.mp = 100; pet.skillState!.horse2Bd.releaseReady = true;
    const runtime = new PetCombatRuntime();
    const projectiles = createProjectileSystem();
    const owner = { x: 200, y: 300, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture('horse', form as 1 | 2 | 3 | 4, owner.y - 100);
    runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps: fps });
    const origin = runtime.snapshot().runtime!;
    const targets = [{ id: 'target', x: origin.x + 80, y: origin.y, isAlive: true }];
    const emissions: number[] = [];
    for (let tick = 0; tick <= emit + 2; tick++) {
      for (let part = 0; part < partitions; part++) {
        runtime.update({ roster, owner, groundEnvironment, targets, projectiles, deltaMs: 1000 / fps / partitions,
          hostFps: fps, random: () => 0.1, projectileCombat: noTargetBodyFixturePort });
        if (runtime.events().some(e => e.behaviorEvent?.type === 'skill-emitted')) emissions.push(tick);
      }
      assert.equal(pet.mp, tick === 0 ? 100 : 100 - (skill === 'tmaoyi' ? 30 : 20), 'MP charged once on release');
      if (skill === 'bd') assert.equal(pet.skillState!.horse2Bd.releaseReady, tick < emit,
        'original doHit2 clears release at the body callback, not when preparing the skill');
      const prelude = projectiles.projectiles.filter(p => p.sourceSymbol === 'AoyiBuff');
      assert.equal(prelude.length, skill === 'tmaoyi' && tick > 0 ? 1 : 0, 'only the release-time aoyi prelude precedes the body callback');
      if (tick < emit) assert.equal(projectiles.projectiles.filter(p => p.sourceSymbol !== 'AoyiBuff').length, 0,
        'no damaging projectile before native callback');
    }
    assert.deepEqual(emissions, [emit], `horse${form}/${skill}/${fps}/${partitions}`);
    assert.equal(projectiles.projectiles.filter(p => p.sourceSymbol !== 'AoyiBuff').length, 1);
    runtime.destroy(); compared++;
  }
}
console.log('Horse native body skill emission and release-time MP:', compared, 'real Runtime cases passed.');
