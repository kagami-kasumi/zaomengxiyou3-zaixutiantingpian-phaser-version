import assert from 'node:assert/strict';
import {
  AllPetsQaSaveSlot,
  seedAllPetsQaSave,
} from '../src/systems/PetVisualQaFixtureSystem';
import { inspectSaveSlot } from '../src/systems/SaveSlotSystem';
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
assert.equal(seedAllPetsQaSave(storage, '?qaPetSave=all', 'example.com'), 'disabled');
assert.equal(seedAllPetsQaSave(storage, '?qaPetSave=all', 'localhost'), 'created');
const slot = inspectSaveSlot(storage, AllPetsQaSaveSlot);
assert.equal(slot.status, 'valid');
assert.ok(slot.save);
assert.equal(slot.save.party.playerCount, 2);
assert.equal(slot.save.player1.pets.length, 35);
assert.equal(slot.save.player2.pets.length, 35);
assert.equal(new Set(slot.save.player1.pets.map(({ species }) => species)).size, 9);
assert.equal(seedAllPetsQaSave(storage, '?qaPetSave=all', '127.0.0.1'), 'selected-existing');

console.log('Localhost-only all-pets visual QA save fixture tests passed.');
