import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('.');
const outDir = path.resolve('.tmp/turtle-combat-mutations');
mkdirSync(outDir, { recursive: true });

const tests = [
  ['runtime', 'tools/pet-turtle-runtime-tests.ts'],
  ['clock', 'tools/pet-turtle-combat-clock-tests.ts'],
  ['collision', 'tools/pet-turtle-world-collision-tests.ts'],
  ['caller', 'tools/pet-turtle-caller-order-tests.ts'],
];
const mutations = [
  { name: 'range', file: 'TurtlePetBehavior.ts', before: 'return [40, 120, 150, 150][this.form - 1]!;', after: 'return [41, 120, 150, 150][this.form - 1]!;', test: 'runtime' },
  { name: 'clock-hit-column', file: 'PetTurtleAnimationClock.ts', before: "action === 'hit1' ? { column: form === 1 ? 2 : 3, remaining: 10 }", after: "action === 'hit1' ? { column: form === 1 ? 3 : 3, remaining: 10 }", test: 'clock' },
  { name: 'mask-polarity', file: 'PetTurtleProjectileSystem.ts', before: 'if (!sample.hit) continue;', after: 'if (sample.hit) continue;', test: 'runtime' },
  { name: 'owner-authority', file: 'PetCombatEntitySession.ts', before: 'const ownsPet = frame.isLocalOwner !== false;', after: 'const ownsPet = true;', test: 'runtime' },
  { name: 'source-offset', file: 'PetTurtleProjectileSystem.ts', before: 'offsetX: offset[0]!, offsetY: offset[1]!', after: 'offsetX: offset[0]! + 1, offsetY: offset[1]!', test: 'runtime' },
  { name: 'root-matrix-follow', file: 'PetTurtleProjectileSystem.ts', before: 'if (matrixA !== entry.sourceMatrixA) {', after: 'if (false && matrixA !== entry.sourceMatrixA) {', test: 'caller' },
];

function pluginFor(mutation) {
  let replaced = false;
  const plugin = {
    name: `turtle-combat-mutation-${mutation.name}`,
    setup(buildApi) {
      buildApi.onLoad({ filter: /\.ts$/ }, ({ path: source }) => {
        if (path.basename(source) !== mutation.file) return undefined;
        const code = readFileSync(source, 'utf8');
        assert.equal(code.split(mutation.before).length, 2, `${mutation.name}: unique mutation anchor`);
        replaced = true;
        return { contents: code.replace(mutation.before, mutation.after), loader: 'ts' };
      });
    },
  };
  return { plugin, wasReplaced: () => replaced };
}

function run(entry, outfile, mutation = false) {
  const result = spawnSync(process.execPath, [outfile], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 4_000_000,
    env: { ...process.env, ...(mutation ? { TURTLE_COMBAT_MUTATION: '1' } : {}) } });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const baseline = [];
for (const [id, entry] of tests) {
  const outfile = path.join(outDir, `baseline-${id}.mjs`);
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
  const result = run(entry, outfile);
  assert.equal(result.status, 0, `baseline ${id} failed:\n${result.stderr}`);
  baseline.push({ id, exitCode: result.status });
}

const results = [];
for (const mutation of mutations) {
  const testEntry = tests.find(([id]) => id === mutation.test);
  assert(testEntry);
  const mutationPlugin = pluginFor(mutation);
  const outfile = path.join(outDir, `${mutation.name}.mjs`);
  await build({ entryPoints: [testEntry[1]], bundle: true, platform: 'node', format: 'esm', outfile,
    plugins: [mutationPlugin.plugin], logLevel: 'silent' });
  assert(mutationPlugin.wasReplaced(), `${mutation.name} did not load its production file`);
  const tracePath = path.join(root, 'docs/tasks/evidence/TASK-SLICE-224A2/runtime-trace.json');
  const traceBefore = existsSync(tracePath) ? readFileSync(tracePath) : undefined;
  const result = run(testEntry[1], outfile, true);
  assert.notEqual(result.status, 0, `${mutation.name} escaped its oracle`);
  const assertionKilled = /AssertionError/.test(result.stderr);
  const oracleKilled = assertionKilled;
  assert(oracleKilled, `${mutation.name} did not die by an independent oracle:\n${result.stderr}`);
  if (traceBefore !== undefined) {
    assert(existsSync(tracePath), `${mutation.name} removed runtime trace`);
    assert.deepEqual(readFileSync(tracePath), traceBefore, `${mutation.name} rewrote runtime trace`);
  }
  results.push({ name: mutation.name, test: mutation.test, exitCode: result.status,
    assertionKilled, oracleKilled, detail: result.stderr.slice(0, 800) });
}

const report = {
  status: 'passed',
  scope: 'A2 production turtle range, native clock lifetime, collision mask, owner authority, source offset, and Follow root matrix mutation kill',
  baseline,
  results,
  sourceUnmodified: true,
};
writeFileSync('docs/tasks/evidence/TASK-SLICE-224A2/combat-mutations.json', JSON.stringify(report, null, 2) + '\n');
console.log(`A2 combat mutations passed: ${results.length} killed; baselines ${baseline.length} passed`);
