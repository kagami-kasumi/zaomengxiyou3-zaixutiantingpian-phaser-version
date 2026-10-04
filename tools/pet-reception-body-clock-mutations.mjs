import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const output = '.tmp/pet-reception-body-clock-mutations';
mkdirSync(output, { recursive: true });
const body = 'src/systems/PetReceptionBodyClock.ts';
const clock = 'src/systems/PetAnimationClock.ts';
const variants = [
  ['column-limit', clock, 'definition.keyFrameCountsByColumn?.[this.column]', 'undefined'],
  ['hold-decrement', clock, 'this.remaining--;', 'this.remaining -= 2;'],
  ['phoenix-entry', body, '(!target.requiresNonzeroColumn || current.column !== 0)', 'true'],
  ['repeat-key-reset', body, "if (this.action === 'hurt') this.clock.setColumn(0);", "if (this.action === 'hurt') this.clock.restartCell();"],
  ['pause-ignored', body, 'if (this.stopped || (', 'if (false || ('],
  ['dead-remains-paused', body, "if (action === 'dead') this.stopped = false;", '// death remains paused'],
  ['missing-static', body, 'this.events.setStatic?.();', '// missing setStatic'],
];
const results = [];
for (const [name, filename, before, after] of variants) {
  const outfile = path.join(output, `${name}.mjs`);
  await build({ entryPoints: ['tools/pet-reception-body-clock-tests.ts'], bundle: true,
    platform: 'node', format: 'esm', outfile, logLevel: 'silent', plugins: [{ name: 'isolated-production-mutation',
      setup(api) { api.onLoad({ filter: /\.ts$/ }, args => {
        if (path.resolve(args.path) !== path.resolve(filename)) return;
        const original = readFileSync(args.path, 'utf8');
        assert.equal(original.split(before).length, 2, `${name}: mutation target must be unique`);
        return { contents: original.replace(before, after), loader: 'ts' };
      }); } }] });
  const run = spawnSync(process.execPath, [outfile], { encoding: 'utf8', timeout: 30000 });
  if (run.error) throw run.error;
  assert.notEqual(run.status, 0, `${name}: behavior mutant survived`);
  assert.match(run.stderr, /AssertionError/, `${name}: infrastructure failure is not a behavior rejection`);
  writeFileSync(path.join(output, `${name}.log`), run.stdout + run.stderr);
  results.push({ name, rejected: true });
}
writeFileSync(path.join(output, 'report.json'), JSON.stringify({ status: 'passed', results }, null, 2) + '\n');
console.log(`${results.length} isolated production body-clock mutations rejected by original traces; source files unchanged.`);
