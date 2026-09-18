import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const rules = [
  ['registration', 'PetTurtleProjection.ts', 'part.origin.x + dx', 'part.origin.x + dx + 1'],
  ['duplicate-scale', 'PetTurtleProjection.ts', 'part.origin.x + dx', 'part.origin.x * 2 + dx'],
  ['owner-translation', 'PetTurtleProjection.ts', 'moved.x - original!.x', 'moved.x - original!.x + 1'],
  ['duplicate-components', 'PetTurtleProjection.ts', 'group.paintParts.map(part', '[...group.paintParts, ...group.components].map(part'],
  ['paint-depth', 'PetTurtleProjection.ts', 'group.paintParts.map(part', '[...group.paintParts].reverse().map(part'],
  ['duplicate-alpha', 'PetTurtleProjection.ts', 'const alpha = image.rgba[src + 3]!', 'const alpha = Math.floor(image.rgba[src + 3]! / 2)'],
  ['clock', 'PetTurtleAssets.ts', 'cells: row.cells,', 'cells: row.cells.map(c => ({ ...c, holdTicks: c.holdTicks + 1 })),'],
  ['bit-order', 'PetTurtleCollisionAssets.ts', '(7 - (i & 7))', '(i & 7)'],
  ['source-phase', 'PetTurtleCollisionAssets.ts', 'modulo(ty, 4) * 4 + modulo(tx, 4)', '0'],
];
const dir = path.resolve('.tmp/turtle-mutations'); mkdirSync(dir, { recursive: true });
const results = [];
for (const [name, file, before, after] of [['baseline', '', '', ''], ...rules]) {
  let replaced = false;
  const output = path.join(dir, `${name}.mjs`);
  await build({ entryPoints: ['tools/turtle-runtime/mutation-probe.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output,
    plugins: name === 'baseline' ? [] : [{ name: 'production-mutation', setup(b) {
      b.onLoad({ filter: /PetTurtle.*\.ts$/ }, ({ path: source }) => {
        if (path.basename(source) !== file) return;
        const code = readFileSync(source, 'utf8'); assert.equal(code.split(before).length, 2, name);
        replaced = true; return { contents: code.replace(before, after), loader: 'ts' };
      });
    }}], logLevel: 'silent' });
  assert(name === 'baseline' || replaced);
  const run = spawnSync(process.execPath, [output], { encoding: 'utf8', maxBuffer: 2_000_000 });
  if (name === 'baseline') assert.equal(run.status, 0, run.stderr);
  else assert(run.status !== 0 && /AssertionError/.test(run.stderr), `${name} was not killed by oracle: ${run.stderr}`);
  results.push({ name, exitCode: run.status, semanticRejected: name !== 'baseline', detail: run.stderr.slice(0, 1000) });
  console.log('Turtle mutation', name, run.status);
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-224A1/implementation-mutations.json', JSON.stringify({ status: 'passed', results }));
