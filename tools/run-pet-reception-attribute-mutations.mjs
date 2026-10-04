import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const helper = path.join(root, 'src/systems/PetReceptionAttributes.ts');
const roster = path.join(root, 'src/systems/PetRosterSystem.ts');
const progression = path.join(root, 'src/systems/PetProgressionSystem.ts');
const consumable = path.join(root, 'src/systems/PetConsumableSystem.ts');
const original = new Map([helper, roster, progression, consumable].map(file => [file, readFileSync(file)]));
const out = path.join(root, 'docs/tasks/evidence/TASK-SLICE-253/attribute-mutations');
mkdirSync(out, { recursive: true });
const mutations = [
  ['miss-cap', helper, 'readRate(saved.missRate, 0.48)', 'readRate(saved.missRate, 0.36)'],
  ['magic-cap', helper, 'readRate(saved.magicDefenseRate, 0.36)', 'readRate(saved.magicDefenseRate, 0.48)'],
  ['wrong-field', helper, 'readRate(saved.missRate, 0.48)', 'readRate(saved.magicDefenseRate, 0.48)'],
  ['missing-as-zero', helper, '? Math.min(value, upperBound) : undefined', '? Math.min(value, upperBound) : 0'],
  ['lower-clamp', helper, 'Math.min(value, upperBound)', 'Math.max(0, Math.min(value, upperBound))'],
  ['factory-omits', roster, '...createPetReceptionAttributes(),', ''],
  ['growth-threshold', helper, 'pet.level < 60', 'pet.level <= 60'],
  ['growth-mdef-draw', helper, 'Math.floor(random() * 1)', '0'],
  ['growth-crit-draw', helper, '  random();', ''],
  ['growth-writes-passive', helper, '  random();', '  pet.critBonusRate += 0.01 * random();'],
  ['growth-clamp', helper, 'pet.missRate += missIncrement;', 'pet.missRate = Math.min(0.48, pet.missRate + missIncrement);'],
  ['growth-once-per-award', progression, 'growPetReceptionAttributes(pet, random);', 'if (levelsGained === 1) growPetReceptionAttributes(pet, random);'],
  ['growth-twice', progression, 'growPetReceptionAttributes(pet, random);', 'growPetReceptionAttributes(pet, random); growPetReceptionAttributes(pet, random);'],
  ['consumable-random', consumable, 'PetTuning.petExperienceStoneExp, random', 'PetTuning.petExperienceStoneExp'],
];
function run(label) {
  const result = spawnSync(process.execPath, ['tools/run-system-tests.mjs', 'pet-reception-attributes-tests', 'pet-reception-growth-tests'],
    { cwd: root, encoding: 'utf8', timeout: 120_000 });
  const log = (result.stdout ?? '') + (result.stderr ?? '');
  writeFileSync(path.join(out, `${label}.log`), log);
  if (result.error) throw result.error;
  return { code: result.status, log };
}
const results = [];
try {
  assert.equal(run('baseline').code, 0);
  for (const [name, file, before, after] of mutations) {
    const text = original.get(file).toString('utf8');
    assert.ok(text.includes(before), `Missing source anchor: ${name}`);
    writeFileSync(file, text.replaceAll(before, after));
    const result = run(name);
    assert.notEqual(result.code, 0, `Surviving mutant: ${name}`);
    assert.match(result.log, /AssertionError/, `Not a behavior rejection: ${name}`);
    results.push({ name, rejected: true });
    writeFileSync(file, original.get(file));
  }
} finally {
  for (const [file, bytes] of original) writeFileSync(file, bytes);
}
assert.equal(run('restored').code, 0);
for (const [file, bytes] of original) assert.deepEqual(readFileSync(file), bytes);
writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
console.log(`Pet reception persistence/growth: ${results.length} source mutants rejected; originals restored and passing.`);
