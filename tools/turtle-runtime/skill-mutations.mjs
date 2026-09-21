import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = '.tmp/turtle-skill-mutations'; mkdirSync(out, { recursive: true });
const cases = [
  ['scale', 'PetTurtleProjectileSystem.ts', 'sybh && form === 4 && !visualOnly ? 2 : 1', '1'],
  ['mask', 'PetTurtleProjectileSystem.ts', 'if (!sample.hit) continue;', 'if (sample.hit) continue;'],
  ['owner', 'PetCombatEntitySession.ts', 'const ownsPet = frame.isLocalOwner !== false;', 'const ownsPet = true;'],
  ['skill-order', 'PetTurtleSkillSelection.ts', 'return candidates.find(', 'return [...candidates].reverse().find('],
  ['callback', 'PetTurtleAnimationClock.ts', "action === 'hit2' || action === 'hit3' ? { column: 2, remaining: 10 }", "action === 'hit2' || action === 'hit3' ? { column: 2, remaining: 9 }"],
  ['interval', 'PetTurtleProjectileSystem.ts', 'Math.trunc(context.hostFps * 0.25)', 'context.hostFps * 0.25'],
  ['ttl', 'PetTurtleProjectileSystem.ts', 'tick + 1 >= entry.lastTick', 'tick >= entry.lastTick'],
  ['free-mana', 'TurtlePetBehavior.ts', "if (action.type === 'xwaoyi') {", "if (action.type === 'xwaoyi') { context.spendMp(30);"],
  ['delay', 'TurtlePetBehavior.ts', 'this.nextFreeSld = 2;', 'this.nextFreeSld = 3;'],
  ['hurt', 'TurtlePetBehavior.ts', 'context.isGxp || this.isAoyi ||', 'context.isGxp ||'],
  ['move', 'TurtlePetBehavior.ts', 'suppressGroundMove(): boolean { return this.isAoyi; }', 'suppressGroundMove(): boolean { return false; }'],
  ['counter-input', 'TurtlePetBehavior.ts', "event.reactsToHit !== true || event.producerKind === 'turtle-transfer'", 'false'],
  ['counter-boundary', 'TurtlePetBehavior.ts', 'context.random() <= chance', 'context.random() < chance'],
  ['death-life', 'TurtlePetBehavior.ts', 'losesLifeOnDeath(): boolean { return true; }', 'losesLifeOnDeath(): boolean { return false; }'],
  ['power', 'PetTurtleDamageSystem.ts', "action === 'hit3' ? 5.4 : 1", "action === 'hit3' ? 5 : 1"],
  ['snapshot', 'PetTurtleProjectileSystem.ts', 'entry.cache = consumeDragonDamageCache(entry.cache, {', 'entry.cache = consumeDragonDamageCache(refreshPetTurtleDamage(context, entry.action), {'],
];
const entry = 'tools/pet-turtle-skill-runtime-tests.ts';
const trace = 'docs/tasks/evidence/TASK-SLICE-224B/skill-runtime-trace.json';
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
  results.push({ name, exitCode: result.status, assertion: result.stderr.slice(0, 900) }); console.log(`Turtle B rejected ${name}`);
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-224B/skill-mutations.json', JSON.stringify({ status: 'passed', results }, null, 2) + '\n');
