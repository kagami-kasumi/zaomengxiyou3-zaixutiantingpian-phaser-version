import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const { build } = createRequire(import.meta.url)('esbuild') as typeof import('esbuild');

const mutations = [
  ['dash-speed', 'pet-behaviors/Dragon1PetBehavior', 'sdcc: 10', 'sdcc: 5'],
  ['skill-mp', 'pet-behaviors/Dragon1PetBehavior', 'const mpCost = 20', 'const mpCost = 0'],
  ['wave-delay', 'PetDragon23ProjectileSystem', '(index + 1) * 200', '(index + 1) * 300'],
  ['wave-offset', 'PetDragon23ProjectileSystem', '[-150, -10]', '[-151, -10]'],
  ['magic-kind', 'PetDragon23ProjectileSystem', "action === 'ltwj' ? 'magic'", "action === 'ltwj' ? 'physics'"],
  ['skill-power', 'PetDragon23ProjectileSystem', 'pet.atk * 7.2', 'pet.atk * 6.2'],
  ['hurt-cut', 'PetDragon23ProjectileSystem', "context.animation?.action === 'hurt'", "context.animation?.action === 'never'"],
  ['follow-root', 'PetDragon23ProjectileSystem', 'p.x + context.runtime.x - entry.owner.x', 'p.x'],
  ['first-mask', 'PetDragonEffectCollisionSystem', '`${symbol}/${frame}`', '`${symbol}/${1}`'],
] as const;
const directory = path.resolve('.tmp/dragon23-mutations');
mkdirSync(directory, { recursive: true });
const results = [];
for (const [id, stem, from, to] of mutations) {
  const file = path.resolve(`src/systems/${stem}.ts`);
  const original = readFileSync(file, 'utf8');
  assert.ok(original.includes(from), `${id}: mutation locator`);
  const bundle = await build({ stdin: { contents: [
    './tools/pet-dragon23-runtime-tests.ts', './tools/pet-dragon23-collision-tests.ts',
  ].map(file => `import ${JSON.stringify(file)};`).join('\n'), resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
  plugins: [{ name: id, setup(builder) {
    builder.onLoad({ filter: /\.ts$/ }, args => args.path === file
      ? { contents: original.replace(from, to), loader: 'ts' } : undefined);
  } }] });
  const executable = path.join(directory, `${id}.mjs`);
  writeFileSync(executable, bundle.outputFiles[0]!.text);
  const run = spawnSync(process.execPath, [executable], { encoding: 'utf8', timeout: 30000 });
  assert.equal(run.error, undefined, `${id}: must execute`);
  const rejected = run.status !== 0 && run.stderr.includes('AssertionError');
  results.push({ id, rejected, exitCode: run.status });
  assert.ok(rejected, `${id}: expected a semantic assertion failure\n${run.stderr}`);
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-214D/mutation-results.json', JSON.stringify(results, null, 2) + '\n');
console.log(`Dragon23 ${results.length} independent implementation mutations rejected.`);
