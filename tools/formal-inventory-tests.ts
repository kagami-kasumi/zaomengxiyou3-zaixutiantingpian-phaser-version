import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fullFeatureUiAssets } from '../src/assets/AssetManifest';
import {
  createFormalInventoryPage,
  equipFormalInventorySelection,
  getFormalInventoryPageEntries,
  selectFormalInventoryEntry,
  setFormalInventoryOwner,
  unequipFormalInventorySelection,
} from '../src/systems/FormalInventoryPageSystem';
import { createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const root = process.cwd();

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function testOwnerEquipUnequipAndPersistence(): void {
  const storage = createStorage();
  assert.equal(createSaveSlot(storage, 0), true);
  const model = createFormalInventoryPage(storage, 'p1');
  assert.ok(model);
  const entries = getFormalInventoryPageEntries(model);
  const accessoryIndex = entries.findIndex((entry) => entry.definition.fillName === 'mysz');
  assert.ok(accessoryIndex >= 0);
  selectFormalInventoryEntry(model, accessoryIndex);
  assert.equal(equipFormalInventorySelection(model, storage), true);
  assert.equal(model.restored.player1.equipmentLoadout.accessory?.definition.fillName, 'mysz');
  assert.equal(model.restored.player2.equipmentLoadout.accessory, null);

  setFormalInventoryOwner(model, 'p2');
  const p2Index = getFormalInventoryPageEntries(model)
    .findIndex((entry) => entry.definition.fillName === 'mysz');
  selectFormalInventoryEntry(model, p2Index);
  assert.equal(equipFormalInventorySelection(model, storage), true);
  assert.equal(model.restored.player2.equipmentLoadout.accessory?.definition.fillName, 'mysz');

  const persisted = loadActiveGame(storage);
  assert.ok(persisted);
  assert.equal(persisted.player1.equipment.accessory?.fillName, 'mysz');
  assert.equal(persisted.player2.equipment.accessory?.fillName, 'mysz');
  assert.equal(unequipFormalInventorySelection(model, storage), false, 'weapon slot is selected by default and empty');
}

function testTrueAssetsAndSceneContract(): void {
  for (const asset of Object.values(fullFeatureUiAssets)) {
    assert.equal(asset.status, 'ready');
    assert.equal(asset.source, 'extracted-flash');
    assert.ok(existsSync(path.join(root, 'public', asset.path)));
  }
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  assert.match(scene, /createFormalInventoryPage/);
  assert.match(scene, /InventoryCategories\.forEach/);
  assert.match(scene, /getFormalInventoryPageEntries/);
  assert.match(scene, /equipFormalInventorySelection/);
  assert.match(scene, /unequipFormalInventorySelection/);
}

testOwnerEquipUnequipAndPersistence();
testTrueAssetsAndSceneContract();
console.log('Formal backpack/equipment owner, persistence, and true asset tests passed.');
