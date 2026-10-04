import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const skill = 'src/systems/PetRabbitSkillSystem.ts';
const state = 'src/systems/PetSkillStateSystem.ts';
const roster = 'src/systems/PetRosterSystem.ts';
const input = 'src/systems/PetMonsterDamageReception.ts';
const reset = 'src/scenes/test-scene/TestSceneEncounterReset.ts';
const runtime = 'src/systems/PetCombatRuntime.ts';
const originals = new Map([skill, state, roster, input, reset, runtime].map(file => [file, readFileSync(path.join(root, file))]));
const mutations = [
  ['wrong-form-duration', skill, 'pet.form === 2 ?', 'pet.form === 1 ?'],
  ['expiry-early', skill, '      ticks--;', ''],
  ['refresh-not-restarted', skill, 'state.rabbit2Jf.refreshPending = true;', 'state.rabbit2Jf.refreshPending = false;'],
  ['cooldown-as-active', state, 'rabbit2Jf.remainingHostTicks', 'rabbit2Jf.cooldownMs'],
  ['rest-not-cleared', roster, '  clearPetRabbitJifeng(selected);', ''],
  ['replace-not-cleared', roster, 'if (pet.isActive && pet.id !== selected.id) clearPetRabbitJifeng(pet);', ''],
  ['reset-p2-not-cleared', reset, '  clearRosterPetRabbitJifeng(scene.p2PetRoster);', ''],
  ['read-wrong-stat', input, 'return { missRate, magicDefenseRate,', 'return { missRate: magicDefenseRate, magicDefenseRate,'],
  ['released-target-callback', runtime, 'this.destroyed || entity.released || this.entities.get(runtimeKey) !== entity', 'false'],
];
const out = path.join(root, 'docs/tasks/evidence/TASK-SLICE-253/jifeng-mutations');
mkdirSync(out, { recursive: true });
function run(name) {
  const result = spawnSync(process.execPath, ['tools/run-system-tests.mjs', 'pet-rabbit-jifeng-clock-tests', 'pet-reception-current-input-tests'],
    { cwd: root, encoding: 'utf8', timeout: 120000 });
  if (result.error) throw result.error;
  const log = result.stdout + result.stderr;
  writeFileSync(path.join(out, `${name}.log`), log);
  return { code: result.status, log };
}
const results = [];
try {
  assert.equal(run('baseline').code, 0);
  for (const [name, file, before, after] of mutations) {
    const original = originals.get(file).toString('utf8');
    assert(original.includes(before), name);
    writeFileSync(path.join(root, file), original.replaceAll(before, after));
    const result = run(name);
    assert.notEqual(result.code, 0, `Survived: ${name}`);
    assert.match(result.log, /AssertionError/, `Not a behavioral rejection: ${name}`);
    results.push({ name, rejected: true });
    writeFileSync(path.join(root, file), originals.get(file));
  }
} finally {
  for (const [file, bytes] of originals) writeFileSync(path.join(root, file), bytes);
}
assert.equal(run('restored').code, 0);
for (const [file, bytes] of originals) assert.deepEqual(readFileSync(path.join(root, file)), bytes);
writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
console.log(`${results.length} Jifeng/current-input production mutants rejected; source restored.`);
