import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'docs/tasks/evidence/TASK-SLICE-249A');
mkdirSync(output, { recursive: true });
const mutations = [
  ['magic-defense', 'MonsterDamageReception.ts', 'const defense = target.magicDefenseRate;', 'const defense = 0;', 'direct'],
  ['hero-dodge-equality', 'MonsterDamageReception.ts', "target.kind === 'hero' ? roll <= threshold", "target.kind === 'hero' ? roll < threshold", 'direct'],
  ['role5-override', 'HeroMonsterDamageReception.ts', 'role5Guard ? 0.75 : 1 - reduction', 'role5Guard ? 1 : 1 - reduction', 'direct'],
  ['random-order', 'MonsterDamageReception.ts', "if (target.kind === 'hero') source.random();", "if (target.kind === 'pet') source.random();", 'direct'],
  ['pet-returnvoid', 'MonsterDamageReception.ts', "accepted: target.kind === 'hero', missed: false, returnVoid:", 'accepted: true, missed: false, returnVoid:', 'direct'],
  ['shield-recursion', 'HeroCombatSystem.ts', 'if (reduceOverride) return reduceOverride(overflow);', 'if (reduceOverride) return overflow;', 'direct'],
  ['protected-id', 'HeroMonsterDamageReception.ts', 'if (!prepared.accepted) return', 'if (!prepared.accepted) (hero.monsterHitIds ??= []).push(request.attackId);\n  if (!prepared.accepted) return', 'direct'],
  ['omit-pet', 'MonsterAttackReception.ts', 'if (state.remaining > 0 && pair.pet', 'if (state.remaining < 0 && pair.pet', 'world'],
  ['wrong-interval', 'MonsterAttackReception.ts', 'state.count === state.interval', 'state.count === state.interval + 1', 'world'],
  ['duplicate-pet-reaction', 'PetCombatEntitySession.ts', 'if (deferReaction) continue;', 'if (deferReaction) { /* mutant: execute the reaction twice */ }', 'session'],
  ['double-life-loss', 'PetCombatEntitySession.ts', '!lifetimeAlreadySettled && this.behavior.losesLifeOnDeath?.()', 'this.behavior.losesLifeOnDeath?.()', 'session'],
];
const results = [];
for (const [name, filename, from, to, suite] of mutations) {
  const file = path.join(root, 'src/systems', filename);
  const original = readFileSync(file);
  const source = original.toString('utf8');
  assert.equal(source.split(from).length, 2, `unique mutation locator ${name}`);
  try {
    writeFileSync(file, source.replace(from, to));
    const args = suite === 'session' ? ['tools/run-system-tests.mjs', 'monster3-receiver-session-tests']
      : [`tools/monster3-receiver-${suite}-tests.mjs`];
    const run = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 60000 });
    writeFileSync(path.join(output, `mutation-${name}.log`), run.stdout + run.stderr);
    // A compilation/import failure is not a killed behavioral mutant.
    assert.notEqual(run.status, 0, name);
    let rejectedCases;
    if (suite === 'session') {
      assert(run.stderr.includes('AssertionError'), `must reach a session assertion: ${name}`);
      rejectedCases = 1; // fail-fast actual owner assertion, not an exhaustive count.
    } else {
      const report = JSON.parse(readFileSync(path.join(output, `${suite}-verification.json`), 'utf8'));
      const summary = run.stdout.split('\n').find(line => line.startsWith('{"cases":'));
      assert(summary && JSON.parse(summary).failures > 0, `must execute actual assertions: ${name}`);
      assert(report.failures.length > 0);
      rejectedCases = report.failures.length;
    }
    results.push({ name, rejectedCases, sourceSha256: createHash('sha256').update(original).digest('hex') });
  } finally {
    writeFileSync(file, original);
    assert(readFileSync(file).equals(original));
  }
}
for (const suite of ['direct', 'world']) {
  const run = spawnSync(process.execPath, [`tools/monster3-receiver-${suite}-tests.mjs`], { cwd: root, encoding: 'utf8', timeout: 60000 });
  assert.equal(run.status, 0, run.stdout + run.stderr);
}
writeFileSync(path.join(output, 'mutations.json'), JSON.stringify({ status: 'passed', results, restoredAndRechecked: true }, null, 2) + '\n');
console.log(`Monster3 reception: ${results.length} executed production mutants rejected; original source restored and direct/world rerun.`);
