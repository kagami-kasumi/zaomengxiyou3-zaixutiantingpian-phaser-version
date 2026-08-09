import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  FormalWorkshopPageCount,
  FormalWorkshopPageSize,
  createFormalWorkshopPage,
  getFormalWorkshopGridPageEntries,
  getFormalWorkshopPlayer,
  selectFormalWorkshopCategory,
  selectFormalWorkshopGridEntry,
  setFormalWorkshopInventoryPage,
  setFormalWorkshopOwner,
} from '../src/systems/FormalWorkshopPageSystem';
import { createSaveSlot } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const root = process.cwd();
const truthPath = path.join(root, 'docs/reverse-engineering/ground-truth/manifests/task-slice-165d-workshop-inventory.json');

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
}

function testCategoryPageAndOwnerProjection(): void {
  const storage = createStorage();
  assert.equal(createSaveSlot(storage, 0), true);
  const model = createFormalWorkshopPage(storage, 'p1');
  assert.ok(model);
  assert.equal(FormalWorkshopPageSize, 25);
  assert.equal(FormalWorkshopPageCount, 5);
  assert.equal(model.activeCategory, 'equipment');
  assert.deepEqual(getFormalWorkshopGridPageEntries(model), getFormalWorkshopPlayer(model).inventoryStore.categories.equipment.slice(0, 25));

  selectFormalWorkshopCategory(model, 'items');
  assert.equal(model.activeCategory, 'items');
  assert.equal(model.inventoryPage, 0);
  assert.deepEqual(getFormalWorkshopGridPageEntries(model), getFormalWorkshopPlayer(model).inventoryStore.categories.items.slice(0, 25));
  setFormalWorkshopInventoryPage(model, 99);
  assert.equal(model.inventoryPage, 4);
  assert.ok(getFormalWorkshopGridPageEntries(model).length <= 25);
  assert.equal(selectFormalWorkshopGridEntry(model, 24), false);
  assert.equal(model.message, '当前背包格为空');

  const p1Store = getFormalWorkshopPlayer(model).inventoryStore;
  setFormalWorkshopOwner(model, 'p2');
  assert.equal(model.owner, 'p2');
  assert.equal(model.activeCategory, 'equipment');
  assert.equal(model.inventoryPage, 0);
  assert.notEqual(getFormalWorkshopPlayer(model).inventoryStore, p1Store);
}

function testViewAndTruthContract(): void {
  assert.ok(existsSync(truthPath));
  const truth = JSON.parse(readFileSync(truthPath, 'utf8')) as {
    status: string;
    truthId: string;
    displayObjects: Array<{ id: string; placements: Array<{ stageBounds: { left: number; top: number; width: number; height: number } }> }>;
    completeness: { displayListMatched: boolean; stateSetMatched: boolean; unresolved: unknown[] };
  };
  assert.equal(truth.truthId, 'task-slice-165d.workshop-inventory');
  assert.equal(truth.status, 'verified');
  assert.equal(truth.completeness.displayListMatched, true);
  assert.equal(truth.completeness.stateSetMatched, true);
  assert.deepEqual(truth.completeness.unresolved, []);
  assert.equal(truth.displayObjects.filter(({ id }) => id.startsWith('inventory-slot-')).length, 25);
  assert.deepEqual(truth.displayObjects.find(({ id }) => id === 'inventory-root')?.placements[0]?.stageBounds,
    { left: 512.8, top: 130, width: 295, height: 329 });

  const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalWorkshopPageView.ts'), 'utf8');
  const sharedView = readFileSync(path.join(root, 'src/scenes/feature-ui/InventoryGridView.ts'), 'utf8');
  const bundles = readFileSync(path.join(root, 'src/assets/SceneAssetBundles.ts'), 'utf8');
  const container = readFileSync(path.join(root, 'public/assets/ui/crafting/container-native.svg'), 'utf8');
  assert.match(view, /task-slice-165d-workshop-inventory\.json/);
  assert.match(view, /createInventoryGridProjection/);
  assert.match(view, /createInventoryGridObjects/);
  assert.match(view, /InventoryCategories\.forEach/);
  assert.match(view, /selectFormalWorkshopGridEntry/);
  assert.match(view, /stageSelectedWorkshopEntry/);
  assert.doesNotMatch(view, /背包 \/ 装备栏|inventoryEntry\(|第 \$\{model\.inventoryPage/);
  assert.match(sharedView, /inventoryUiAssets\.slot\.key/);
  assert.match(sharedView, /getInventoryItemAsset/);
  assert.match(sharedView, /entry\.quantity > 1/);
  assert.match(bundles, /'feature-ui-workshop': \{\s*dependencies: \['feature-ui-backpack'\]/);
  assert.doesNotMatch(container, /id="nowpage"|id="txtlh"/);
}

testCategoryPageAndOwnerProjection();
testViewAndTruthContract();
console.log('Workshop embedded inventory grid category, paging, owner, shared view, truth, and asset contracts passed.');
