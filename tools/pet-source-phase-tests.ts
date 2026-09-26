import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-227/source-trace.json', 'utf8')) as {
  cases: { id: string; extra: { normalTicks?: number[] } }[];
};
const results: object[] = [];
for (const species of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-${species === 'monkey' ? 228 : 229}/callback-air/measurement.json`, 'utf8')) as {
    cases: { form: number; fps: number; action: string; local: boolean; hurt: boolean; skills: number; noTarget: boolean;
      rows: { tick: number; action: string; events: { kind: string }[] }[] }[];
  };
  for (const fps of [20, 24, 30]) for (const partitions of [1, 2, 4]) {
    const roster = createSeedPetRoster();
    for (const pet of roster.pets) pet.isActive = pet.species === species && pet.form === form;
    const pet = roster.pets.find(pet => pet.isActive)!;
    pet.skills = [];
    const runtime = new PetCombatRuntime();
    const projectiles = createProjectileSystem();
    const owner = { x: 200, y: 300, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture(species, form as 1 | 2 | 3 | 4, owner.y - 100);
    const normalTicks: number[] = [];
    const emissionTicks: number[] = [];
    for (let tick = 0; tick < 56; tick++) for (let part = 0; part < partitions; part++) {
      const position = runtime.snapshot().runtime;
      const targets = tick < 7 ? [] : [{ id: 'phase-target', x: position!.x + 10, y: position!.y, isAlive: true }];
      runtime.update({ roster, owner, groundEnvironment, targets, projectiles, projectileCombat: noTargetBodyFixturePort, random: () => 0.1,
        deltaMs: 1000 / fps / partitions, hostFps: fps });
      if (runtime.events().some(event => event.action?.type === 'basic-attack')) normalTicks.push(tick);
      if (runtime.events().some(event => event.behaviorEvent?.type === 'basic-attack')) emissionTicks.push(tick);
    }
    const body = native.cases.find(row => row.form === form && row.fps === fps && row.action === 'hit1'
      && row.local && !row.hurt && row.skills === -1 && !row.noTarget)!;
    const duration = body.rows.find(row => row.action === 'wait')!.tick;
    const emit = body.rows.find(row => row.events.some(event => event.kind === 'emit'))!.tick;
    let availableTick = 0;
    // 227 isolates the AI modulus; 228/229 supply the real body busy interval.
    const expected = source.cases.find(row => row.id === `${species}${form}:off-phase-acquire-${fps}`)!.extra.normalTicks!
      .filter(tick => {
        if (tick < availableTick) return false;
        availableTick = tick + duration;
        return true;
      });
    assert.deepEqual(normalTicks, expected, `${species}${form}/${fps}/${partitions}: original continuous phase`);
    assert.deepEqual(emissionTicks, expected.map(tick => tick + emit - 1).filter(tick => tick < 56),
      `${species}${form}/${fps}/${partitions}: original body emission phase`);
    results.push({ species, form, fps, partitions, normalTicks, emissionTicks });
    runtime.destroy();
  }
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/runtime-phase.json', JSON.stringify({ cases: results.length, results }, null, 2));
console.log('Original off-phase acquisition through real Runtime:', results.length, 'family/fps/render partitions passed.');
