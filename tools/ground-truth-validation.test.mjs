import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { createValidator, discoverManifests, manifestDirectory } from './ground-truth-validation.mjs';
import { defaultTurtleTests, turtleLocalInputs, turtleTests } from './turtle-test-registry.mjs';
import { coreSystemTests, fullSystemTests } from './system-test-suites.mjs';

const validate = createValidator();
const knockbackName = `${manifestDirectory}/behavior/task-settings-230-monster-knockback.json`;
const knockback = JSON.parse(readFileSync(knockbackName, 'utf8'));

test('knockback schema accepts current source handoff and rejects corrupted entry/physics data', () => {
  assert.deepEqual(validate(knockbackName, knockback).errors, []);
  for (const mutate of [
    value => { value.entryAndScheduler[0] = { arbitrary: true }; },
    value => { value.entryAndScheduler.find(row => row.type === 'gate').accepted = 'yes'; },
    value => { delete value.entryAndScheduler.find(row => row.type === 'gate').state.vx; },
    value => { value.entryAndScheduler.find(row => row.type === 'dedup').refresh = -1; },
    value => { value.entryAndScheduler.find(row => row.type === 'schedule').tick = 4; },
    value => { value.naturalTweenOutcome.replace = {}; },
    value => { value.motion[0].states[0][4] = 3; },
    value => { value.directionObservations.sha256 = 'not-a-hash'; },
  ]) {
    const changed = structuredClone(knockback);
    mutate(changed);
    assert(validate(knockbackName, changed).errors.length > 0);
  }
});

test('routing rejects unknown or conflicting schema and keeps UI requirements', () => {
  assert.throws(() => validate('unregistered.json', {}), /No registered schema/);
  assert.throws(() => validate(knockbackName, { ...knockback, $schema: '../schema/ui-ground-truth.schema.json' }), /conflicts/);
  assert.throws(() => validate('new.json', { $schema: 4 }), /string/);
  assert(validate('new.json', { $schema: '../schema/ui-ground-truth.schema.json' }).errors.length > 0);
  const name = `${manifestDirectory}/task-settings-215-player-pet-incoming-damage-feedback.json`;
  const value = JSON.parse(readFileSync(name, 'utf8'));
  assert.deepEqual(validate(name, value).errors, []);
  delete value.visualTruth.displayObjects;
  assert(validate(name, value).errors.some(message => message.includes('displayObjects')));
});

test('default discovery includes behavior and excludes ignored local manifests', () => {
  const tracked = discoverManifests();
  assert(tracked.includes(knockbackName));
  assert(!tracked.includes(`${manifestDirectory}/task-settings-222-pet-turtle-family.json`));
});

test('validation errors identify the explicit input file', () => {
  const missing = '.tmp/review-nonexistent-manifest.json';
  const result = spawnSync(process.execPath, ['tools/validate-ui-ground-truth.mjs', missing], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert(result.stderr.includes(missing));
});

test('all turtle tests have an explicit execution tier and clean default inputs', () => {
  const names = readdirSync('tools').filter(name => /^pet-turtle-.*\.ts$/.test(name)).map(name => name.slice(0, -3)).sort();
  assert.deepEqual(Object.keys(turtleTests).sort(), names);
  assert.deepEqual(turtleLocalInputs(defaultTurtleTests), []);
  for (const name of names.filter(name => !defaultTurtleTests.includes(name))) assert(turtleLocalInputs([name]).length > 0, name);
  for (const name of defaultTurtleTests) {
    assert(coreSystemTests.includes(name));
    assert(fullSystemTests.includes(name));
  }
});
