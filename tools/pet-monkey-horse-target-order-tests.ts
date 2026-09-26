import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';

const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-227/source-trace.json', 'utf8')) as {
  cases: { id: string; target: { x: number; y: number } | null; randomCalls: number }[];
};
let compared = 0;
for (const species of ['monkey', 'horse'] as const) for (const form of [1, 2, 3, 4]) {
  for (const fps of [20, 24, 30]) for (const partitions of [1, 2, 4]) {
    const roster = createSeedPetRoster();
    for (const pet of roster.pets) pet.isActive = pet.species === species && pet.form === form;
    roster.pets.find(pet => pet.isActive)!.skills = [];
    const runtime = new PetCombatRuntime();
    const projectiles = createProjectileSystem();
    const owner = { x: 200, y: 300, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture(species, form as 1 | 2 | 3 | 4, owner.y - 100);
    runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps: fps });
    const origin = runtime.snapshot().runtime!;
    const targets = [
      { id: 'dead-first', x: origin.x + 100, y: origin.y, isAlive: false },
      { id: 'alive-second', x: origin.x + 10, y: origin.y, isAlive: true },
    ];
    let randomCalls = 0;
    const tick = () => {
      for (let part = 0; part < partitions; part++) runtime.update({ roster, owner, groundEnvironment, targets, projectiles,
        deltaMs: 1000 / fps / partitions, hostFps: fps, random: () => { randomCalls++; return 0.1; } });
      return runtime.snapshot();
    };
    const acquire = source.cases.find(c => c.id === `${species}${form}:acquire-dead-first`)!;
    assert.equal(tick().target?.id, 'dead-first');
    assert.equal(runtime.snapshot().target!.x - origin.x, acquire.target!.x);
    assert.equal(randomCalls, acquire.randomCalls);
    const clear = source.cases.find(c => c.id === `${species}${form}:clear-dead-first`)!;
    assert.equal(tick().target ?? null, clear.target);
    assert.equal(randomCalls, clear.randomCalls);
    assert.equal(projectiles.projectiles.length, 0, 'clear does not attack or reacquire');
    assert.equal(tick().target?.id, 'dead-first', 'next search preserves original supplied order');
    runtime.destroy();
    compared++;
  }
}
console.log('Monkey/horse original dead-first acquisition, next-tick clear, no same-tick reacquire:', compared, 'Runtime cases passed.');
