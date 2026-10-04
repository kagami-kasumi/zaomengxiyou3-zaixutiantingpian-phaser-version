import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createDefaultGameSave, selectSaveSlot, inspectSaveSlot, getSaveSlotStorageKey,
  ActiveSaveSlotStorageKey, loadActiveGame, saveActiveGame, deleteSaveSlot, createSaveSlot } from '../src/systems/SaveSlotSystem';
import { loadGame, saveGame, restoreGameState, encodePet, GameSaveStorageKey, type SaveStorage } from '../src/systems/SaveSystem';
import { addPetExperience, getPetExperienceToNextLevel } from '../src/systems/PetProgressionSystem';
import { evolvePetWithItem, returnPetToChild } from '../src/systems/PetGrowthSystem';

class MemoryStorage implements SaveStorage {
  data = new Map<string, string>();
  writes: string[] = [];
  fail?: (key: string) => boolean;
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.fail?.(key)) throw Error('storage unavailable');
    this.writes.push(key); this.data.set(key, value);
  }
  removeItem(key: string) { this.data.delete(key); }
}
function oldRaw() {
  const save = createDefaultGameSave(new Date('2026-10-03T00:00:00Z'));
  delete save.player1.pets[0]!.missRate;
  save.player1.pets[0]!.magicDefenseRate = 0.17;
  delete save.player2.pets[0]!.missRate;
  delete save.player2.pets[0]!.magicDefenseRate;
  return JSON.stringify({ ...save, futureField: { retain: ['unchanged', 73] } }, null, 2);
}
const rows: object[] = [];
for (const key of [GameSaveStorageKey, getSaveSlotStorageKey(0), getSaveSlotStorageKey(5)]) {
  const storage = new MemoryStorage(), raw = oldRaw(); storage.data.set(key, raw);
  const loaded = loadGame(storage, key)!;
  const backup = `${key}.pet-reception-baseline-v1.backup`;
  assert.deepEqual(storage.writes, [backup, key]);
  assert.equal(storage.getItem(backup), raw);
  const migrated = JSON.parse(storage.getItem(key)!);
  const original = JSON.parse(raw);
  for (const slot of ['player1', 'player2'] as const) {
    const pet = migrated[slot].pets[0];
    assert.equal(pet.missRate, 0); assert.equal(pet.magicDefenseRate, slot === 'player1' ? 0.17 : 0);
    assert.equal(pet.receptionAttributeSource, 'legacy-missing-baseline');
    assert.deepEqual(pet.receptionBaselineFields, slot === 'player1' ? ['missRate'] : ['missRate', 'magicDefenseRate']);
    for (const field of ['missRate', 'magicDefenseRate', 'receptionAttributeSource', 'receptionBaselineFields']) {
      delete pet[field]; delete original[slot].pets[0][field];
    }
  }
  assert.deepEqual(migrated, original, 'No unrelated field may change during migration');
  const after = storage.getItem(key), writes = storage.writes.length;
  assert(loadGame(storage, key)); assert.equal(storage.writes.length, writes); assert.equal(storage.getItem(key), after);
  const state = restoreGameState(loaded, {});
  for (const slot of ['player1', 'player2'] as const) {
    const pet = state[slot].petRoster.pets[0]!;
    pet.level = 59; addPetExperience(pet, getPetExperienceToNextLevel(59), () => 0.99);
    assert.equal(pet.missRate, 0.01);
    assert.equal(pet.receptionAttributeSource, 'legacy-missing-baseline');
    pet.form = 3; evolvePetWithItem(pet); returnPetToChild(pet, () => 0.5);
    assert.equal(pet.missRate, 0.01); assert.equal(pet.receptionAttributeSource, 'legacy-missing-baseline');
    loaded[slot].pets = [encodePet(pet)];
  }
  saveGame(storage, loaded, key);
  const again = restoreGameState(loadGame(storage, key)!, {});
  assert.equal(again.player1.petRoster.pets[0]!.missRate, 0.01);
  assert.equal(again.player2.petRoster.pets[0]!.receptionAttributeSource, 'legacy-missing-baseline');
  assert.deepEqual(again.player1.petRoster.pets[0]!.receptionBaselineFields, ['missRate']);
  assert.equal(storage.getItem(backup), raw);
  rows.push({ key, originalPreserved: true, unrelatedFieldsPreserved: true, idempotent: true, growthRetained: true });
}
for (const failure of ['backup', 'main'] as const) {
  const storage = new MemoryStorage(), key = getSaveSlotStorageKey(1), raw = oldRaw();
  storage.data.set(key, raw); storage.data.set(ActiveSaveSlotStorageKey, '0');
  storage.fail = candidate => failure === 'backup' ? candidate.includes('.backup') : candidate === key;
  assert.throws(() => selectSaveSlot(storage, 1), /storage unavailable/);
  assert.equal(storage.getItem(key), raw); assert.equal(storage.getItem(ActiveSaveSlotStorageKey), '0');
  storage.fail = undefined; assert(selectSaveSlot(storage, 1));
  assert.equal(storage.getItem(`${key}.pet-reception-baseline-v1.backup`), raw);
  assert.equal([...storage.data.keys()].filter(k => k.includes('.backup')).length, 1);
}
{
  const storage = new MemoryStorage(), key = getSaveSlotStorageKey(2), raw = oldRaw(); storage.data.set(key, raw);
  const inspected = inspectSaveSlot(storage, 2); assert.equal(storage.writes.length, 0);
  assert.equal(inspected.save!.player1.pets[0]!.missRate, undefined);
  assert(selectSaveSlot(storage, 2)); assert.equal(loadActiveGame(storage)!.player1.pets[0]!.missRate, 0);
  assert(saveActiveGame(storage, loadActiveGame(storage)!));
  deleteSaveSlot(storage, 2);
  const different = JSON.parse(raw); different.player1.pets[0].level = 42;
  assert(createSaveSlot(storage, 2, different));
  assert.equal(storage.getItem(`${key}.pet-reception-baseline-v1.backup`), raw);
  const secondBackup = storage.getItem(`${key}.pet-reception-baseline-v1.backup.1`);
  assert(secondBackup, 'Reused slots must back up the new original without overwriting the first');
  assert.equal(JSON.parse(secondBackup).player1.pets[0].level, 42);
}
// A caller that only inspected an old slot may save it before loading it.
{
  const storage = new MemoryStorage(), raw = oldRaw(); storage.data.set(GameSaveStorageKey, raw);
  saveGame(storage, JSON.parse(raw));
  assert.equal(storage.getItem(`${GameSaveStorageKey}.pet-reception-baseline-v1.backup`), raw);
  assert.equal(JSON.parse(storage.getItem(GameSaveStorageKey)!).player1.pets[0].missRate, 0);
  assert.equal(loadGame(storage)!.player1.pets[0]!.receptionAttributeSource, 'legacy-missing-baseline');
}
for (const invalid of [null, '0.5']) {
  const storage = new MemoryStorage(), save = JSON.parse(oldRaw());
  save.player1.pets[0].missRate = invalid; storage.data.set(GameSaveStorageKey, JSON.stringify(save));
  assert.equal(loadGame(storage)!.player1.pets[0]!.missRate, 0);
}
for (const raw of ['{broken', JSON.stringify({ ...JSON.parse(oldRaw()), version: 6 })]) {
  const storage = new MemoryStorage(); storage.data.set(GameSaveStorageKey, raw);
  assert.equal(loadGame(storage), undefined); assert.equal(storage.writes.length, 0);
}
{
  const storage = new MemoryStorage(), save = createDefaultGameSave();
  save.player1.pets[0]!.missRate = -0.1; save.player2.pets[0]!.magicDefenseRate = 0.9;
  storage.data.set(GameSaveStorageKey, JSON.stringify(save));
  assert(loadGame(storage)); assert.equal(storage.writes.length, 0, 'Explicit finite values do not require baseline migration');
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-253', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-253/migration.json', JSON.stringify({ policy: 'A', status: 'passed', rows }, null, 2));
console.log('Policy A: actual load/select/save paths, exact backups, failure/retry, slot reuse, provenance and growth retention passed.');
