import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const { build } = createRequire(import.meta.url)('esbuild') as typeof import('esbuild');

const mutations = [
  ['family-range', 'pet-behaviors/Dragon1PetBehavior', 'basicAttackRange(): number { return 150; }', 'basicAttackRange(): number { return 300; }'],
  ['family-hit', 'PetProjectileCombatSystem', 'if (!enemy) return false;', 'if (enemy || !enemy) return false;'],
  ['family-source', 'PetProjectileCombatSystem', 'petId: projectile.sourceId,', "petId: 'wrong-source',"],
  ['flower-rate', 'PetDragon23ProjectileSystem', 'this.form === 4 ? (pet.magicFlowerBuff?.attackMultiplier ?? 1) : 1', '1'],
  ['qlaoyi-debit', 'pet-behaviors/Dragon4PetBehavior', "context.setSkillCooldown('dragon4Qlaoyi', 24000);", "context.spendMp(30); context.setSkillCooldown('dragon4Qlaoyi', 24000);"],
  ['missing-clone-tick', 'PetDragonAnimationClock', 'qlaoyi?.cloneRemainingCounts?.map', 'qlaoyi?.cloneRemainingCounts?.filter(n => n !== 36).map'],
  ['trigger-fs-gate', 'pet-behaviors/Dragon4PetBehavior', "if (index === 0) this.effects().emit", "if (index === 0 && context.pet.skills.includes('fs')) this.effects().emit"],
  ['clone-hp', 'PetDragonCloneState', 'maxHp: ((parent.hp * 20) | 0) * 20', 'maxHp: parent.maxHp'],
  ['clone-mp', 'PetDragonCloneState', 'maxMp: ((parent.mp * 99) | 0) * 99', 'maxMp: parent.maxMp'],
  ['initial-chain', 'PetCombatRuntime', 'child.enter(owner, request.initialAction)', 'child.enter(owner)'],
  ['clone-direction', 'pet-behaviors/Dragon4PetBehavior', 'index % 2 ? 1 : -1', '1'],
  ['clone-expiry', 'pet-behaviors/Dragon1PetBehavior', 'this.form === 4 ? 12 : 10', 'this.form === 4 ? 10 : 10'],
  ['dead-clone-heal', 'pet-behaviors/Dragon4PetBehavior', "this.healRemoval(context, 'dead');", 'void context;'],
  ['trigger-hurt-cut', 'PetDragon23ProjectileSystem', "action === 'sdcc' || action === 'aoyi-buff';", "action === 'sdcc' || action === 'aoyi-buff' || action === 'qlaoyi';"],
  ['trigger-heal', 'PetDragon23ProjectileSystem', "entry.action === 'qlaoyi' || (this.form", "(this.form"],
  ['no-owner-chain', 'pet-behaviors/Dragon4PetBehavior', "if (this.isAoyi && context.pet.skills.includes('sdcc'))", "if (false)"],
  ['ascent', 'pet-behaviors/Dragon4PetBehavior', 'qlaoyi: { x: 0, y: -5 }', 'qlaoyi: { x: 0, y: 0 }'],
  ['enter-new-row', 'PetAnimationClock', 'const switchedInEnter = this.action !== action || this.token !== token;',
    'const switchedInEnter = this.action !== action || this.token !== token; if (switchedInEnter) continue;'],
  ['normal-offset', 'PetDragon23ProjectileSystem', 'this.form === 4 ? 65 : 30', 'this.form === 4 ? 30 : 30'],
  ['first-mask', 'PetDragonEffectCollisionSystem', '`${symbol}/${frame}`', '`${symbol}/${1}`'],
] as const;
const directory = path.resolve('.tmp/dragon4-mutations'); mkdirSync(directory, { recursive: true });
const baselines = ['docs/tasks/evidence/TASK-SLICE-214E/runtime-traces.json', 'docs/tasks/evidence/TASK-SLICE-214E/family-runtime-traces.json'].map(file => ({ file, bytes: readFileSync(file) }));
const results = [];
for (const [id, stem, from, to] of mutations) {
  const file = path.resolve(`src/systems/${stem}.ts`), original = readFileSync(file, 'utf8');
  assert.equal(original.split(from).length, 2, `${id}: unique locator`);
  const bundle = await build({ stdin: { contents: [
    './tools/pet-dragon4-runtime-tests.ts', './tools/pet-dragon4-collision-tests.ts',
    './tools/pet-dragon-family-behavior-tests.ts',
  ].map(file => `import ${JSON.stringify(file)};`).join('\n'), resolveDir: process.cwd(), loader: 'ts' },
    bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{ name: id, setup(builder) { builder.onLoad({ filter: /\.ts$/ }, args => args.path === file
      ? { contents: original.replace(from, to), loader: 'ts' } : undefined); } }] });
  const executable = path.join(directory, `${id}.mjs`); writeFileSync(executable, bundle.outputFiles[0]!.text);
  const run = spawnSync(process.execPath, [executable], { encoding: 'utf8', timeout: 30000, env: { ...process.env, PET_DRAGON_MUTATION: '1' } });
  assert.equal(run.error, undefined, `${id}: executed`);
  const rejected = run.status !== 0 && run.stderr.includes('AssertionError');
  results.push({ id, rejected, exitCode: run.status });
  assert.ok(rejected, `${id}: semantic assertion required\n${run.stderr}`);
}
for (const { file, bytes } of baselines) assert.deepEqual(readFileSync(file), bytes, 'Mutation process overwrote baseline: ' + file);
writeFileSync('docs/tasks/evidence/TASK-SLICE-214E/mutation-results.json', JSON.stringify(results, null, 2) + '\n');
console.log(`Dragon4: ${results.length} implementation mutations rejected`);
