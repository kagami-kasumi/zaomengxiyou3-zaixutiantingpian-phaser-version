import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = '.tmp/turtle-lifecycle-mutations'; mkdirSync(out, { recursive: true });
const cases = [
  ['owner-reference', 'PetCombatEntitySession.ts', 'detachTurtleLink(this.turtleLink);', ''],
  ['source-removal', 'PetCombatEntitySession.ts', "this.projectiles.projectiles.filter(({ sourceId }) => sourceId !== this.pet.id)", 'this.projectiles.projectiles'],
  ['rest', 'PetCombatRuntime.ts', "if (this.active) this.releaseEntity(this.active, 'inactive');", ''],
  ['world-reset', 'TestSceneEncounterReset.ts', 'scene.monster30s = [];', ''],
  ['climb-reset', 'TestSceneEncounterReset.ts', 'scene.verticalClimb = createVerticalClimbState(viewportHeight);', ''],
  ['consumer-target', 'pet-turtle-lifecycle-tests.ts', "const closure = ts.transpileModule(source.slice", "const closure = ts.transpileModule(source.replace('targets: frame.targets,', 'targets: [],'.padEnd('targets: frame.targets,'.length)).slice"],
  ["consumer-owner", "pet-turtle-lifecycle-tests.ts", "const closure = ts.transpileModule(source.slice", "const closure = ts.transpileModule(source.replaceAll('ownerSlot: slot,', 'ownerSlot: \"p1\",'.padEnd('ownerSlot: slot,'.length)).slice"],
];
const entry = 'tools/pet-turtle-lifecycle-tests.ts';
const trace = 'docs/tasks/evidence/TASK-SLICE-224C/lifecycle-trace.json';
await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: `${out}/baseline.mjs`, logLevel: 'silent' });
const baseline = spawnSync(process.execPath, [`${out}/baseline.mjs`], { encoding: 'utf8', windowsHide: true });
assert.equal(baseline.status, 0, baseline.stderr);
const baselineTrace = readFileSync(trace), results = [];
for (const [name, file, before, after] of cases) {
  let replaced = false;
  await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: `${out}/${name}.mjs`, logLevel: 'silent',
    plugins: [{ name, setup(api) { api.onLoad({ filter: /\.ts$/ }, ({ path: source }) => {
      if (path.basename(source) !== file) return;
      const code = readFileSync(source, 'utf8'); assert.equal(code.split(before).length, 2, `${name} unique anchor`);
      replaced = true; return { contents: code.replace(before, after), loader: 'ts' };
    }); } }] });
  assert(replaced);
  const result = spawnSync(process.execPath, [`${out}/${name}.mjs`], { encoding: 'utf8', windowsHide: true,
    env: { ...process.env, TURTLE_COMBAT_MUTATION: '1' } });
  assert.notEqual(result.status, 0, `${name} escaped`); assert.match(result.stderr, /AssertionError/, `${name} must fail by assertion`);
  assert.deepEqual(readFileSync(trace), baselineTrace, 'Negative run cannot replace successful evidence');
  results.push({ name, exitCode: result.status, assertion: result.stderr.slice(0, 900) }); console.log(`Turtle C rejected ${name}`);
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-224C/lifecycle-mutations.json', JSON.stringify({ status: 'passed', results }, null, 2) + '\n');
