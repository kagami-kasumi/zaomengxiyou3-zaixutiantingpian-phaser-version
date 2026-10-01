import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
const { build } = createRequire(import.meta.url)('esbuild');

const mutations = [
  ['early-null', 'HeroPetBuffSystem.ts', '>= effect.time)', '>= effect.time - 1)'],
  ['late-property-removal', 'HeroPetBuffSystem.ts', 'timeLeft === 0', 'timeLeft === -1'],
  ['refresh-value', 'HeroPetBuffSystem.ts', 'old.time = time;', 'old.value = value; old.time = time;'],
  ['float-power', 'HeroPetBuffSystem.ts', 'stats.power = (stats.power + value) | 0', 'stats.power = stats.power + value'],
  ['wrong-hp-ratio', 'HeroPetBuffSystem.ts', 'player.combat.hp / player.combat.maxHp', '1'],
  ['stale-skill-source', 'HeroCurrentStats.ts', 'player.currentStats ?? player.baseStats', 'player.baseStats'],
  ['no-pet-no-owner-step', 'PetCombatRuntime.ts', 'if (frame.ownerStep) {', 'if (!this.active) return this.snapshot();\n    if (frame.ownerStep) {'],
  ['pause-clock', 'PetCombatRuntime.ts', 'frame.deltaMs * fps / 1000', '(frame.deltaMs * fps / 1000) + 1'],
  ['pet-before-owner', 'PetCombatRuntime.ts', 'frame.ownerStep();', 'if (this.active) this.stepEntity(this.active, { ...frame, hostTicks: 1 }); frame.ownerStep();'],
  ['exit-leak', 'HeroPartyRuntimeSystem.ts', 'for (const member of runtime.members) clearHeroPetBuffs(member.combat);', '/* mutant: owner effect cleanup omitted */'],
] as const;
const reports: any[] = [];
mkdirSync('.tmp/hero-pet-buff-mutations', { recursive: true });
for (const [name, file, before, after] of mutations) {
  const target = path.resolve('src/systems', file);
  const source = readFileSync(target, 'utf8');
  assert(source.includes(before), `${name}: production mutation locator changed`);
  const outfile = path.resolve('.tmp/hero-pet-buff-mutations', `${name}.mjs`);
  await build({ entryPoints: ['tools/hero-pet-buff-tests.ts'], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{ name, setup(api) { api.onLoad({ filter: /\.ts$/ }, args => args.path === target
      ? { contents: source.replace(before, after), loader: 'ts' } : undefined); } }] });
  const run = spawnSync(process.execPath, [outfile], { encoding: 'utf8', env: { ...process.env, PET_BUFF_MUTATION: name } });
  assert.equal(run.error, undefined, `${name}: child must execute`);
  assert.notEqual(run.status, 0, `${name}: production mutation survived`);
  assert.match(run.stderr, /AssertionError/, `${name}: failure must be an acceptance assertion`);
  reports.push({ name, status: 'rejected', productionFile: `src/systems/${file}` });
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-242A', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-242A/production-mutations.json', JSON.stringify({ status: 'passed', reports }, null, 2) + '\n');
console.log(`242A: ${reports.length} actual production mutations rejected without source writes.`);
