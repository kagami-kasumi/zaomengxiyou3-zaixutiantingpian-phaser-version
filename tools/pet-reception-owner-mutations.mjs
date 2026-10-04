import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const output = '.tmp/pet-reception-owner-mutations';
mkdirSync(output, { recursive: true });
const owner = 'src/systems/PetReceptionBodyOwner.ts';
const compatibility = 'src/systems/PetReceptionCompatibilitySystem.ts';
const variants = [
  ['protection-zero', owner, 'protectedFromHits: this.protectionCount >= 0', 'protectedFromHits: this.protectionCount > 0'],
  ['double-hp-write', owner, 'const prior = this.clock.snapshot().action;', 'this.pet.hp = Math.max(0, this.pet.hp - 1); const prior = this.clock.snapshot().action;'],
  ['release-before-body-end', owner, "this.clock.select('dead');", "this.clock.select('dead'); this.release('dead-complete');"],
  ['cleanup-all-owners', compatibility, 'if (projectile.experienceSource !== source) continue;', '// missing owner identity guard'],
  ['retain-projectile-source', compatibility, 'projectile.experienceSource = undefined;', '// stale source retained'],
  ['missing-source-retirement', compatibility, '      retireLegacyPetExperience(runtime);', '// owner source remains live'],
  ['missing-first-pose', owner, 'this.ports?.changed?.();', '// first pose omitted'],
];
const results = [];
for (const [name, filename, before, after] of variants) {
  const outfile = path.join(output, `${name}.mjs`);
  await build({ entryPoints: [['protection-zero', 'double-hp-write'].includes(name) ? 'tools/pet-reception-body-owner-tests.ts' : 'tools/pet-reception-compatibility-tests.ts'], bundle: true,
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
console.log(`${results.length} isolated production owner mutations rejected by native deadlines and ownership assertions; source files unchanged.`);
