import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const { build } = createRequire(import.meta.url)('esbuild') as typeof import('esbuild');
const file = 'src/scenes/PetAttachedDisplayLifecycle.ts', original = readFileSync(file, 'utf8');
const mutations = [
  ['immediate-retirement', 'entry.body.destroy();', 'entry.body.destroy(); this.dispose(root); return;'],
  ['permanent-retirement', 'entry.retiredMs >= 1000 - 1e-8', 'false'],
  ['restart-animation', 'entry.retiredMs = 0;', 'entry.retiredMs = 0; for (const a of entry.attachments.values()) a.elapsedMs = 0;'],
  ['wrong-alpha', 'remaining * remaining * 256', 'remaining * 256'],
  ['frozen-display', 'attachment.elapsedMs += elapsed;', 'attachment.elapsedMs += 0;'],
  ['owner-cross-talk', 'entry.initialAlpha = root.alpha;', 'entry.initialAlpha = root.alpha; for (const other of this.roots.values()) other.retiredMs = 0;'],
  ['exit-residual', 'for (const root of [...this.roots.keys()]) this.dispose(root);', '/* mutation leaves retired roots */'],
] as const;
mkdirSync('.tmp/pet-attached-mutations', { recursive: true });
const results = [];
for (const [name, from, to] of mutations) {
  assert(original.includes(from), name);
  const bundle = await build({ entryPoints: ['tools/pet-attached-display-tests.ts'], bundle: true,
    format: 'esm', platform: 'node', write: false, logLevel: 'silent', plugins: [{ name: 'mutate-production', setup(b) {
      b.onLoad({ filter: /PetAttachedDisplayLifecycle\.ts$/ }, () => ({ loader: 'ts', contents: original.replace(from, to) }));
    } }] });
  const output = `.tmp/pet-attached-mutations/${name}.mjs`;
  writeFileSync(output, bundle.outputFiles[0]!.text);
  const r = spawnSync(process.execPath, [output], { encoding: 'utf8', timeout: 60000, windowsHide: true });
  assert.notEqual(r.status, 0, `survived ${name}`);
  assert.match(r.stderr, /AssertionError/, `${name}: failure must be a contract assertion, ${r.stderr}`);
  results.push({ name, rejected: true });
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-245A/mutations.json', JSON.stringify({ status: 'passed', results }, null, 2) + '\n');
console.log(`245A: ${results.length} production display mutations rejected.`);
