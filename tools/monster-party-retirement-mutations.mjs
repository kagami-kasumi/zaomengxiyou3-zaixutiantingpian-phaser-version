import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const out = 'docs/tasks/evidence/TASK-SLICE-259/mutations';
mkdirSync(out, { recursive: true });
const variants = [
  ['defer-cleanup', 'HeroCombatSystem.ts', 'hero.onDeath?.();', 'queueMicrotask(() => hero.onDeath?.());'],
  ['hp-only', 'HeroPartyPetRetirement.ts', 'runtimes[slot].releaseOwner();', 'void runtimes[slot];'],
  ['cross-slot', 'HeroPartyPetRetirement.ts', 'runtimes[slot].releaseOwner();', 'runtimes.p1.releaseOwner(); runtimes.p2.releaseOwner();'],
  ['charge-life', 'PetCombatRuntime.ts', "if (this.active) this.releaseEntity(this.active, 'inactive');", "if (this.active) { this.active.pet.lifetime--; this.releaseEntity(this.active, 'inactive'); }"],
  ['keep-compatibility', 'HeroPartyPetRetirement.ts', 'clearSlot(slot);', 'void clearSlot;'],
  ['hero-rejection-blocks-pet', 'MonsterAttackReception.ts', 'if (state.remaining > 0 && pair.pet', 'if (pair.hero.ids.includes(request.attackId) && state.remaining > 0 && pair.pet'],
];
const results = [];
for (const variant of [undefined, ...variants]) {
  let matched = false;
  const name = variant?.[0] ?? 'baseline', file = `${out}/${name}.mjs`;
  await build({ entryPoints: ['tools/monster-party-retirement-tests.ts'], outfile: file,
    platform: 'node', format: 'esm', bundle: true, logLevel: 'silent',
    plugins: variant ? [{ name: 'isolated-mutation', setup(b) {
      b.onLoad({ filter: /\.ts$/ }, args => {
        if (!args.path.endsWith(variant[1])) return;
        const source = readFileSync(args.path, 'utf8');
        assert(source.includes(variant[2]), name); matched = true;
        return { loader: 'ts', contents: source.replaceAll(variant[2], variant[3]) };
      });
    } }] : [],
  });
  const r = spawnSync(process.execPath, [file], { encoding: 'utf8', timeout: 120000 });
  if (r.error) throw r.error;
  writeFileSync(`${out}/${name}.log`, r.stdout + r.stderr);
  if (!variant) assert.equal(r.status, 0, r.stderr);
  else { assert(matched); assert.notEqual(r.status, 0, `${name} survived`); assert.match(r.stderr, /AssertionError/); }
  results.push({ name, compiled: true, result: variant ? 'rejected' : 'passed' });
}
writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
console.log('Baseline and six isolated production retirement mutants passed.');
