import assert from 'node:assert/strict';
import {
  AllPetsQaSaveSlot,
  seedAllPetsQaSave,
} from '../src/systems/PetVisualQaFixtureSystem';
import { inspectSaveSlot, createSaveSlot, getSaveSlotStorageKey, ActiveSaveSlotStorageKey } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

const storage = createStorage();
assert.equal(seedAllPetsQaSave(storage, '?qaPetSave=all', 'example.com', '5173'), 'disabled');
assert.equal(seedAllPetsQaSave(storage, '?qaPetSave=all', 'localhost', '5173'), 'created');
const slot = inspectSaveSlot(storage, AllPetsQaSaveSlot);
assert.equal(slot.status, 'valid');
assert.ok(slot.save);
assert.equal(slot.save.party.playerCount, 2);
assert.equal(slot.save.player1.pets.length, 35);
assert.equal(slot.save.player2.pets.length, 35);
assert.equal(new Set(slot.save.player1.pets.map(({ species }) => species)).size, 9);
assert.equal(seedAllPetsQaSave(storage, '?qaPetSave=all', '127.0.0.1', '5173'), 'selected-existing');

console.log('Localhost-only all-pets visual QA save fixture tests passed.');

for (const [host, port, search] of [['localhost','4174','?qaPetSave=all'],['127.0.0.2','5173','?qaPetSave=all'],['localhost','5173',''],['localhost','5173','?qaPetSave=other']]) {
  const target=createStorage();
  assert.equal(seedAllPetsQaSave(target,search,host,port),'disabled');
  assert.equal(target.getItem(getSaveSlotStorageKey(5)),null);
}
const raw=storage.getItem(getSaveSlotStorageKey(5));
assert.equal(seedAllPetsQaSave(storage,'?qaPetSave=all','localhost','5173'),'selected-existing');
assert.equal(storage.getItem(getSaveSlotStorageKey(5)),raw,'refresh preserves existing progress');
for(const corrupt of [false,true]) {
  const target=createStorage();
  if(corrupt) target.setItem(getSaveSlotStorageKey(5),'broken'); else createSaveSlot(target,5);
  target.setItem(ActiveSaveSlotStorageKey,'0');
  const before=target.getItem(getSaveSlotStorageKey(5));
  assert.equal(seedAllPetsQaSave(target,'?qaPetSave=all','localhost','5173'),'occupied');
  assert.equal(target.getItem(getSaveSlotStorageKey(5)),before);
  assert.equal(target.getItem(ActiveSaveSlotStorageKey),'0');
}
console.log('216C port/host/query isolation, ordinary/corrupt slot protection and repeat preservation passed');
