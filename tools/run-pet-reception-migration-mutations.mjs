import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const migration = 'src/systems/PetReceptionSaveMigration.ts', attributes = 'src/systems/PetReceptionAttributes.ts';
const save = 'src/systems/SaveSystem.ts', slots = 'src/systems/SaveSlotSystem.ts';
const originals = new Map([migration, attributes, save, slots].map(file => [file, readFileSync(file)]));
const mutations = [
  ['overwrite-explicit', migration, "typeof pet[field] !== 'number' || !Number.isFinite(pet[field])", 'true'],
  ['false-known', migration, "pet.receptionAttributeSource = 'legacy-missing-baseline';", "pet.receptionAttributeSource = 'known';"],
  ['overwrite-backup', migration, 'if (previous !== null) continue;', ''],
  ['not-idempotent', migration, 'if (missing.length === 0) continue;', 'if (missing.length > 2) continue;'],
  ['skip-load', save, 'if (!migrated.changed) return save;', 'if (true) return save;'],
  ['write-before-backup', save, '  backupPetReceptionSave(storage, storageKey, raw);\n  storage.setItem(storageKey, migrated.raw);',
    '  storage.setItem(storageKey, migrated.raw);\n  backupPetReceptionSave(storage, storageKey, raw);'],
  ['skip-save-migration', save, 'const next = parseGameSave(raw) ?', 'const next = false ?'],
  ['lose-provenance', attributes, "saved.receptionAttributeSource === 'legacy-missing-baseline'", "false && saved.receptionAttributeSource === 'legacy-missing-baseline'"],
  ['select-bypasses', slots, 'const save = loadGame(storage, snapshot.storageKey);', 'const save = snapshot.save;'],
];
const out = 'docs/tasks/evidence/TASK-SLICE-253/migration-mutations'; mkdirSync(out, { recursive: true });
function run(name) {
  const result = spawnSync(process.execPath, ['tools/run-system-tests.mjs', 'pet-reception-migration-tests'], { encoding: 'utf8', timeout: 120000 });
  if (result.error) throw result.error;
  const log = result.stdout + result.stderr; writeFileSync(`${out}/${name}.log`, log);
  return { code: result.status, log };
}
const results = [];
try {
  assert.equal(run('baseline').code, 0);
  for (const [name, file, before, after] of mutations) {
    const original = originals.get(file).toString('utf8').replaceAll('\r\n', '\n');
    assert(original.includes(before), name);
    writeFileSync(file, original.replaceAll(before, after));
    const result = run(name);
    assert.notEqual(result.code, 0, `Survived: ${name}`);
    assert.match(result.log, /AssertionError/, `Not a behavior rejection: ${name}`);
    results.push({ name, rejected: true });
    writeFileSync(file, originals.get(file));
  }
} finally { for (const [file, bytes] of originals) writeFileSync(file, bytes); }
assert.equal(run('restored').code, 0);
for (const [file, bytes] of originals) assert.deepEqual(readFileSync(file), bytes);
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
console.log(`${results.length} migration production mutants rejected; original source restored and passing.`);
