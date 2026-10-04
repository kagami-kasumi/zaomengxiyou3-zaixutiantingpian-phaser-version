import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const output = 'docs/tasks/evidence/TASK-SLICE-249B';
mkdirSync(output, { recursive: true });
const mutations = [
  ['hurt-clears', 'Monster3AttackRuntime.ts', 'const events = updateStage11MonsterVisual', "if (host.state === 'hurt') destroyMonster3Attacks(runtime);\n  const events = updateStage11MonsterVisual", 'monster3-combat-world-tests'],
  ['first-frame', 'Monster3AttackRuntime.ts', 'attack.frame = attack.age;', 'attack.frame = attack.age + 1;', 'monster3-attack-phase-tests'],
  ['death-clears', 'Monster3AttackRuntime.ts', 'const events = updateStage11MonsterVisual', "if (host.state === 'dead') destroyMonster3Attacks(runtime);\n  const events = updateStage11MonsterVisual", 'monster3-attack-phase-tests'],
  ['destroy-keeps', 'Monster3AttackRuntime.ts', 'for (const attack of runtime.attacks) releaseAttack(attack);', '// mutated clear omitted', 'monster3-attack-lifetime-tests'],
  ['offset', 'Monster3AttackRuntime.ts', 'host.x + event.offsetX', 'host.x + event.offsetX + 1', 'monster3-selection-tests'],
  ['direction', 'Monster3AttackRuntime.ts', 'facingX: event.facingX,', 'facingX: event.facingX === 1 ? -1 : 1,', 'monster3-selection-tests'],
  ['interval', 'Monster3AttackRuntime.ts', "action === 'hit1' ? 999 : 4", "action === 'hit1' ? 999 : 5", 'monster3-selection-tests'],
  ['cd-order', 'Monster3Selection.ts', 'state.count = state.count >', 'state.cooldown = Math.max(0, state.cooldown - 1);\n  state.count = state.count >', 'monster3-selection-tests'],
  ['normal-rate', 'Monster3Selection.ts', 'boss ? 0.423 : 0.366', 'boss ? 0.423 : 0.423', 'monster3-selection-tests'],
  ['random', 'Monster3Selection.ts', 'random(); // Original', '// random(); // Original', 'monster3-selection-tests'],
  ['collision-frame', 'Monster3CollisionSystem.ts', '${frame}-s${scaleSign}', '${frame === 1 ? 2 : frame}-s${scaleSign}', 'monster3-collision-tests'],
  ['collision-direction', 'Monster3CollisionSystem.ts', '${frame}-s${scaleSign}', '${frame}-s${-scaleSign}', 'monster3-collision-tests'],
  ['collision-origin', 'Monster3CollisionSystem.ts', 'sourceRoot, profileId, targetRoot, inspectPixel', '{ x: sourceRoot.x + 1, y: sourceRoot.y }, profileId, targetRoot, inspectPixel', 'monster3-collision-tests'],
];
const results = [];
for (const [id, file, from, to, suite] of mutations) {
  const path = `src/systems/${file}`, bytes = readFileSync(path), text = bytes.toString('utf8');
  const at = text.indexOf(from); assert(at >= 0, id);
  try {
    writeFileSync(path, text.slice(0, at) + to + text.slice(at + from.length));
    const run = spawnSync(process.execPath, ['tools/run-system-tests.mjs', suite], { encoding: 'utf8', timeout: 60000 });
    writeFileSync(`${output}/mutation-${id}.log`, run.stdout + run.stderr);
    assert.notEqual(run.status, 0, id); assert(run.stderr.includes('AssertionError'), `not a behavioral rejection: ${id}`);
    results.push({ id, suite, sha256: createHash('sha256').update(bytes).digest('hex') });
  } finally { writeFileSync(path, bytes); assert(readFileSync(path).equals(bytes)); }
}
const run = spawnSync(process.execPath, ['tools/run-system-tests.mjs', 'monster3-collision-tests', 'monster3-selection-tests', 'monster3-attack-phase-tests', 'monster3-attack-lifetime-tests', 'monster3-combat-world-tests'], { encoding: 'utf8', timeout: 60000 });
assert.equal(run.status, 0, run.stdout + run.stderr);
writeFileSync(`${output}/core-mutations.json`, JSON.stringify({ status: 'passed', scope: 'shared core only; not Scene completion', results, restoredAndRechecked: true }, null, 2) + '\n');
console.log(`${results.length} Monster3 core production mutants rejected; source restored and positive suites rerun.`);
