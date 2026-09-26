import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { coreSystemTests, fullSystemTests, selectSystemTests } from './system-test-suites.mjs';

test('daily core is a bounded subset; the original full regression stays intact', () => {
  assert.equal(coreSystemTests.length, 14);
  assert.equal(fullSystemTests.length, 88);
  assert.equal(new Set(fullSystemTests).size, fullSystemTests.length);
  assert.deepEqual(selectSystemTests().tests, coreSystemTests);
  assert.deepEqual(selectSystemTests(['--full']).tests, fullSystemTests);
  for (const name of coreSystemTests) assert(fullSystemTests.includes(name), name);
  for (const name of fullSystemTests) assert(existsSync(`tools/${name}.ts`), name);
});

test('core plus affected tests runs each group once; explicit design gates stay explicit', () => {
  const selected = selectSystemTests(['--core', 'pet-movement-clock-tests', 'save-slot-tests', 'pet-movement-clock-tests']);
  assert.equal(selected.tests.length, 15);
  assert.equal(selected.tests.filter(name => name === 'save-slot-tests').length, 1);
  assert.deepEqual(selectSystemTests(['pet-turtle-runtime-tests', 'pet-turtle-runtime-tests']).tests, ['pet-turtle-runtime-tests']);
  assert.equal(selectSystemTests(['pet-turtle-runtime-tests']).scope, 'selected');
});

test('invalid options cannot silently select a different scope', () => {
  for (const args of [['--core', '--full'], ['--ful'], ['../system-tests']]) assert.throws(() => selectSystemTests(args));
});

test('the real CLI can explain its selection without compiling or running tests', () => {
  for (const [args, expected] of [[['--list'], coreSystemTests], [['--full', '--list'], fullSystemTests]]) {
    const result = spawnSync(process.execPath, ['tools/run-system-tests.mjs', ...args], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.stdout.split(/\r?\n/).filter(line => /^[a-z0-9-]+-tests$/.test(line)), expected);
    assert(!result.stdout.includes('tests passed'));
  }
});
