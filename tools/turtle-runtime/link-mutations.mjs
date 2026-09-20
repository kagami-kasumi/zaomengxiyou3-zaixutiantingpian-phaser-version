import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = '.tmp/turtle-link-mutations'; mkdirSync(out, { recursive: true });
const cases = [
  ['owner', 'PetCombatEntitySession.ts', 'this.ownerCombat && this.ownerCombat !== frame.ownerCombat', 'false'],
  ['single-buff', 'PetTurtleLinkSystem.ts', 'buff.peer?.()?.active', 'true'],
  ['damage-rounding', 'PetTurtleLinkSystem.ts', 'Math.trunc(amount * 0.95)', 'Math.ceil(amount * 0.95)'],
  ['heal-rounding', 'PetTurtleLinkSystem.ts', '(((heal | 0) * 1.05) | 0)', 'Math.ceil(heal * 1.05)'],
  ['shield-before-transfer', 'HeroCombatSystem.ts', 'redirectDamage?.(hpDamage) ?? hpDamage', 'redirectDamage?.(reducedDamage) ?? hpDamage'],
  ['double-heal', 'PetCombatEntitySession.ts', '(hero.hp + amount) | 0', '(hero.hp + 2 * amount) | 0'],
  ['fake-hit-gates-heal', 'PetTurtleProjectileSystem.ts', "if (form >= 2) context.healLinkedOwner", "if (false && form >= 2) context.healLinkedOwner"],
  ['refresh-value', 'PetTurtleLinkSystem.ts', 'previous.age = 0;', 'previous.age = 0; previous.value = value;'],
  ['expiry', 'PetTurtleLinkSystem.ts', 'buff.age >= buff.durationTicks', 'buff.age > buff.durationTicks'],
];
const trace = 'docs/tasks/evidence/TASK-SLICE-224A3/link-trace.json';
await build({ entryPoints: ['tools/pet-turtle-link-tests.ts'], bundle: true, platform: 'node', format: 'esm',
  outfile: `${out}/baseline.mjs`, logLevel: 'silent' });
const baseline = spawnSync(process.execPath, [`${out}/baseline.mjs`], { encoding: 'utf8', windowsHide: true });
assert.equal(baseline.status, 0, baseline.stderr);
const beforeTrace = readFileSync(trace);
const results = [];
for (const [name, file, before, after] of cases) {
  let changed = false;
  const outfile = `${out}/${name}.mjs`;
  await build({ entryPoints: ['tools/pet-turtle-link-tests.ts'], bundle: true, platform: 'node', format: 'esm', outfile,
    logLevel: 'silent', plugins: [{ name, setup(build) {
      build.onLoad({ filter: /\.ts$/ }, ({ path: source }) => {
        if (path.basename(source) !== file) return;
        const text = readFileSync(source, 'utf8'); assert.equal(text.split(before).length, 2, `${name} anchor`);
        changed = true; return { loader: 'ts', contents: text.replace(before, after) };
      });
    } }] });
  assert(changed);
  const result = spawnSync(process.execPath, [outfile], { encoding: 'utf8', windowsHide: true,
    env: { ...process.env, TURTLE_LINK_MUTATION: '1' } });
  assert.notEqual(result.status, 0, `${name} escaped`);
  assert.match(result.stderr, /AssertionError/, `${name} must fail an independent assertion`);
  assert.deepEqual(readFileSync(trace), beforeTrace, 'Mutation must not replace normal evidence');
  results.push({ name, exitCode: result.status, assertion: result.stderr.slice(0, 1100) });
  console.log(`TXLJ mutation rejected: ${name}`);
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-224A3/link-mutations.json', JSON.stringify({ status: 'passed', results }, null, 2) + '\n');
