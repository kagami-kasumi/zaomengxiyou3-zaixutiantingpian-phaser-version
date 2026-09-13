import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const { build } = createRequire(import.meta.url)('esbuild') as typeof import('esbuild');

const mutations = [
  ['clone-source', 'PetDragon1ProjectileSystem', 'sourceId: context.pet.id', 'sourceId: context.sourcePetId'],
  ['clone-max-hp', 'PetDragonCloneState', 'maxHp: parent.hp', 'maxHp: parent.maxHp'],
  ['clone-crit', 'PetDragonCloneState', 'critBonusRate: 0', 'critBonusRate: parent.critBonusRate'],
  ['early-expiry', 'pet-behaviors/Dragon1PetBehavior', 'context.hostFps * 10', 'context.hostFps * 9'],
  ['death-heal', 'pet-behaviors/Dragon1PetBehavior', "if (reason !== 'expired') return;", 'if (false) return;'],
  ['free-fs', 'pet-behaviors/Dragon1PetBehavior', 'context.spendMp(20)', 'context.spendMp(0)'],
  ['gxp-hurt', 'pet-behaviors/Dragon1PetBehavior', 'context.pet.hp > 0 && !context.isGxp', 'context.pet.hp > 0'],
  ['double-clock', 'ProjectileSystem', 'if (projectile.petHostTick !== undefined) continue;', 'if (false) continue;'],
  ['zero-damage', 'PetDragonDamageSystem', 'ratio < 0 ? 1', 'ratio <= 0 ? 1'],
  ['missing-heal', 'PetDragonDamageSystem', 'ports.onAccepted(next);', 'void next;'],
  ['last-frame', 'PetDragon1ProjectileSystem', 'if (frame === 11)', 'if (frame === 10)'],
  ['facing-direction', 'PetCombatEntitySession', 'this.ground?.face(direction);', 'void direction;'],
  ['right-sampling', 'PetDragonCollisionSystem', '(dx - 10) / 20', '(dx - 5) / 20'],
  ['coordinate-rounding', 'PetDragonCollisionSystem', 'Math.trunc(value * 20)', 'Math.round(value * 20)'],
] as const;
const directory = path.resolve('.tmp/dragon1-mutations');
mkdirSync(directory, { recursive: true });
const results = [];
for (const [id, stem, from, to] of mutations) {
  const file = path.resolve(`src/systems/${stem}.ts`);
  const original = readFileSync(file, 'utf8');
  assert.equal(original.split(from).length, 2, `${id}: unique mutation locator`);
  const bundle = await build({ stdin: { contents: [
    './tools/pet-dragon1-runtime-tests.ts', './tools/pet-dragon-damage-tests.ts', './tools/pet-dragon-collision-tests.ts',
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
writeFileSync('docs/tasks/evidence/TASK-SLICE-214C4/mutation-results.json', JSON.stringify(results, null, 2) + '\n');
console.log(`Dragon1 ${results.length} independent implementation mutations rejected.`);
