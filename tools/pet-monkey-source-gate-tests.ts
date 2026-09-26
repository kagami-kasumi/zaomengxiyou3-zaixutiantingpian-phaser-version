import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { MonkeyPetBehavior, type MonkeyPetForm } from '../src/systems/pet-behaviors/MonkeyPetBehavior';
import type { PetBehaviorContext } from '../src/systems/PetBehavior';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';

// Expected gates were captured from the original AS3 by 227 and independently
// checked there. No modern request/tuning function supplies the expected value.
const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-227/source-trace.json', 'utf8')) as {
  cases: { id: string; extra: { gates?: boolean[] } }[];
};
const names = {
  1: ['monkey1-xj'], 2: ['monkey2-lj', 'monkey2-xj'],
  3: ['monkey3-lyq', 'monkey3-xj', 'monkey3-lj'],
  4: ['monkey3-lyq', 'monkey3-xj', 'monkey3-lj', 'monkey4-jgaoyi'],
};
const failures: object[] = [];
let cases = 0;
for (const row of source.cases) {
  const match = /^monkey([1-4]):gates-(\d+)-(\d+)-(true|false)$/.exec(row.id);
  if (!match) continue;
  const form = Number(match[1]) as MonkeyPetForm;
  const pet = createSeedPetRoster().pets.find(pet => pet.species === 'monkey' && pet.form === form)!;
  pet.skills = match[4] === 'true' ? ['xj', 'lj', 'lyq', 'jgaoyi'] : [];
  pet.mp = Number(match[3]);
  for (const state of Object.values(pet.skillState!)) {
    if (!state || typeof state !== 'object') continue;
    if ('cooldownMs' in state) state.cooldownMs = 0;
    if ('releaseReady' in state) state.releaseReady = true;
  }
  const context = { pet, runtime: { x: 0, y: 0 }, target: { id: 'target', x: Number(match[2]), y: 0, isAlive: true } } as unknown as PetBehaviorContext;
  const gates = row.extra.gates!;
  const expected = names[form][gates.indexOf(true)];
  const actual = new MonkeyPetBehavior(form).selectAction(context)?.type;
  if (actual !== expected) failures.push({ id: row.id, expected: expected ?? null, actual: actual ?? null });
  cases++;
}
assert.equal(cases, 480);
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/monkey-skill-gates.json', JSON.stringify({ cases, failures }, null, 2));
console.log('Monkey source eligibility:', cases, 'cases;', failures.length, 'failures', failures.slice(0, 2));
assert.equal(failures.length, 0, 'Modern selection must match original learned/MP/distance gates');
