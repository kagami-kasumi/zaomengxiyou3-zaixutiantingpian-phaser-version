import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const out = 'docs/tasks/evidence/TASK-SLICE-260A/production-mutations';
mkdirSync(out, { recursive: true });
const variants = [
  ['request-captures-start', 'HeroGatherCoordinateSystem.ts', [
    ['endX, endY, startTime: this.time', 'endX, endY, startTime: this.time, start: { x: target.x, y: target.y }'],
    ['tween.start = { x: target.x, y: target.y };', 'tween.start ??= { x: target.x, y: target.y };'],
  ]],
  ['ignore-overwrite', 'HeroGatherCoordinateSystem.ts', [
    ['if (this.disposed) return;', 'if (this.disposed || this.active.has(target)) return;'],
  ]],
  ['pause-keeps-moving', 'HeroGatherCoordinateSystem.ts', [
    ['if (this.pausedAt !== undefined) return;', '/* wrong: render while paused */'],
  ]],
  ['exit-keeps-tween', 'HeroGatherCoordinateSystem.ts', [
    ['this.disposed = true;', 'this.disposed = false;'],
    ['this.active.clear();', '/* wrong: retain active */'],
    ['this.pending.clear();', '/* wrong: retain pending */'],
  ]],
  ['death-kills-tween', 'HeroGatherCoordinateSystem.ts', [
    ['advance: (timeSeconds: number) => controller.advance(timeSeconds),',
      "advance: (timeSeconds: number) => { if (party.members.some(m => m.combat.combat.state === 'dead')) controller.destroy(); controller.advance(timeSeconds); },"],
  ]],
  ['duplicate-hero-step', 'LevelHeroMovementSystem.ts', [
    ['    updateHeroMovement(', '    for (let wrongStep = 0; wrongStep < 2; wrongStep++) updateHeroMovement('],
  ]],
  ['feet-as-root', 'HeroSourceMovementSystem.ts', [
    ['movement.y - profiles.collision.height / 2', 'movement.y'],
  ]],
  ['monster3-feet-as-root', 'HeroPartyMonsterReception.ts', [
    ['projectHeroVisualRootY(member.movement.y)', 'member.movement.y'],
  ]],
];
const results = [];
for (const variant of [undefined, ...variants]) {
  const name = variant?.[0] ?? 'baseline';
  const file = `${out}/${name}.mjs`;
  let matched = false;
  const rootOnly = name === 'monster3-feet-as-root';
  await build({ entryPoints: [rootOnly ? 'tools/hero-root-reception-tests.ts' : 'tools/hero-gather-world-tests.ts'],
    outfile: file, platform: 'node', format: 'esm', bundle: true, logLevel: 'silent',
    plugins: variant ? [{ name: 'production-mutation', setup(b) {
      b.onLoad({ filter: /\.ts$/ }, args => {
        if (!args.path.endsWith(variant[1])) return;
        let source = readFileSync(args.path, 'utf8');
        for (const [before, after] of variant[2]) {
          assert(source.includes(before), `${name}: missing mutation site`);
          // A first-match replacement is intentional where methods share guards.
          source = source.replace(before, after);
        }
        matched = true;
        return { loader: 'ts', contents: source };
      });
    } }] : [],
  });
  const run = spawnSync(process.execPath, [file], { encoding: 'utf8', timeout: 120000 });
  if (run.error) throw run.error;
  writeFileSync(`${out}/${name}.log`, run.stdout + run.stderr);
  if (!variant) assert.equal(run.status, 0, run.stderr);
  else {
    assert(matched, name);
    assert.notEqual(run.status, 0, `${name} survived`);
    assert.match(run.stderr, /AssertionError/, `${name}: runtime errors are not oracle rejection`);
  }
  results.push({ name, compiled: true, exitCode: run.status, result: variant ? 'rejected' : 'passed',
    bundleSha256: createHash('sha256').update(readFileSync(file)).digest('hex') });
}
writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2)+'\n');
console.log('Hero gather production: baseline and eight isolated source mutants passed; Scene order remains separately verified.');
