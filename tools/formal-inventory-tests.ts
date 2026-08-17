import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fullFeatureUiAssets } from '../src/assets/AssetManifest';
import {
  changeFormalInventoryPage,
  createFormalInventoryPage,
  equipFormalInventorySelection,
  getFormalInventoryPageCount,
  getFormalInventoryPageEntries,
  getFormalInventoryPresentation,
  selectFormalEquipmentSlot,
  selectFormalInventoryCategory,
  selectFormalInventoryEntry,
  setFormalInventoryOwner,
  unequipFormalInventorySelection,
} from '../src/systems/FormalInventoryPageSystem';
import {
  InventoryGridCellHeight,
  InventoryGridCellWidth,
  InventoryGridStepX,
  InventoryGridStepY,
  createInventoryGridProjection,
} from '../src/systems/InventoryGridProjection';
import { InventoryCategories } from '../src/systems/InventorySystem';
import { createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';
import {
  assertVerifiedEquipmentPageTruth,
  EquipmentPageTruthId,
  getEquipmentPageInventorySlotIds,
  getEquipmentPageTruthChildren,
  getEquipmentPageTruthObjects,
  getEquipmentPageTruthPlacement,
} from '../src/systems/EquipmentPageTruthSystem';

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
  assert.equal(model.entrySelectionArmed, false);
  assert.equal(model.slotSelectionArmed, false);
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

  selectFormalEquipmentSlot(model, 2);
  assert.equal(unequipFormalInventorySelection(model, storage), true);
  assert.equal(model.entrySelectionArmed, false);
  assert.equal(model.slotSelectionArmed, false);
  const reloaded = createFormalInventoryPage(storage, 'p1');
  assert.ok(reloaded);
  assert.equal(reloaded.restored.player1.equipmentLoadout.accessory?.definition.fillName, 'mysz');
  assert.equal(reloaded.restored.player2.equipmentLoadout.accessory, null);
}

function testCategoriesPagingAndSafeUnsupportedFeedback(): void {
  const storage = createStorage();
  assert.equal(createSaveSlot(storage, 0), true);
  const model = createFormalInventoryPage(storage, 'p1');
  assert.ok(model);

  assert.equal(getFormalInventoryPageEntries(model).length, 25);
  assert.ok(getFormalInventoryPageCount(model) >= 2);
  changeFormalInventoryPage(model, 1);
  assert.equal(model.pageIndex, 1);
  assert.equal(getFormalInventoryPageEntries(model).length, 0);

  for (const category of InventoryCategories) {
    selectFormalInventoryCategory(model, category);
    assert.equal(model.activeCategory, category);
    assert.equal(model.pageIndex, 0);
    assert.ok(getFormalInventoryPageEntries(model).length > 0, `${category} should expose seed content`);
  }

  selectFormalInventoryCategory(model, 'items');
  selectFormalInventoryEntry(model, 0);
  assert.equal(equipFormalInventorySelection(model, storage), false);
  assert.equal(model.message, '该物品没有已支持的穿戴行为');
}

function testTrueAssetsAndSceneContract(): void {
  for (const asset of Object.values(fullFeatureUiAssets)) {
    assert.equal(asset.status, 'ready');
    assert.equal(asset.source, 'extracted-flash');
    assert.ok(existsSync(path.join(root, 'public', asset.path)));
  }
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalInventoryPageView.ts'), 'utf8');
  const gridView = readFileSync(path.join(root, 'src/scenes/feature-ui/InventoryGridView.ts'), 'utf8');
  assert.match(scene, /createFormalInventoryPage/);
  assert.match(scene, /createFormalInventoryPageView/);
  assert.match(view, /InventoryCategories\.forEach/);
  assert.match(view, /getFormalInventoryPageEntries/);
  assert.match(view, /equipFormalInventorySelection/);
  assert.match(view, /unequipFormalInventorySelection/);
  assert.match(view, /if \(equipped\) unequipFormalInventorySelection/);
  assert.doesNotMatch(view, /const activate = model\.slotSelectionArmed/);
  assert.match(view, /createInventoryGridProjection/);
  assert.match(view, /operationThree\.background/);
  assert.match(view, /operationSimple\.background/);
  assert.match(view, /getFormalInventoryPresentation/);
  assert.match(view, /createInventoryGridObjects/);
  assert.match(view, /createInventoryPagerObjects/);
  assert.match(gridView, /`\$\{options\.currentPage\}\/\$\{options\.pageCount\}`/);
  assert.match(gridView, /inventoryUiAssets\.slot\.key/);
  assert.match(view, /getEquipmentPageTruthPlacement/);
  assert.match(view, /getEquipmentPageInventorySlotIds/);
  assert.match(view, /EquipmentPageTruthStateId/);
  assert.match(gridView, /ItemIconFrameInset = 9/);
  assert.match(view, /createInventoryItemIcon/);
  assert.match(gridView, /setScale\(ItemIconContentSize \/ cropWidth, ItemIconContentSize \/ cropHeight\)/);
  assert.match(view, /getEquipmentPageTruthObject\('soul-value'\)\.textStyle/);
  assert.match(view, /soulValue\.stageBounds\.left \+ soulTextStyle\.leftGutterPx/);
  assert.match(view, /soulValue\.stageBounds\.top \+ soulTextStyle\.topGutterPx/);
  assert.doesNotMatch(view, /String\(presentation\.soulCount\),[\s\S]*?\.setOrigin\(1/);
  assert.match(view, /pageBounds: pageValue\.stageBounds/);
  assert.match(view, /getFormalInventoryPageCount\(model\)/);
  assert.doesNotMatch(view, /add\.rectangle/);
  assert.doesNotMatch(view, /setTint|formatSelectedDetails|model\.message/);
  assert.doesNotMatch(view, /const GRID_ORIGIN|const TAB_ORIGIN|const EQUIPMENT_SLOTS/);
}

function testVerifiedTruthDirectConsumption(): void {
  assert.doesNotThrow(() => assertVerifiedEquipmentPageTruth());
  assert.equal(EquipmentPageTruthId, 'task-settings-170b1.equipment-page');
  assert.equal(getEquipmentPageTruthObjects().length, 63);
  assert.equal(getEquipmentPageInventorySlotIds().length, 25);
  assert.equal(getEquipmentPageTruthChildren('inventory-root').length, 29);
  const firstSlot = getEquipmentPageTruthPlacement('inventory-slot-00');
  const secondSlot = getEquipmentPageTruthPlacement('inventory-slot-01');
  assert.deepEqual(firstSlot.localMatrix, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 38 });
  assert.equal(secondSlot.stageBounds.left - firstSlot.stageBounds.left, 61);
  assert.equal(getEquipmentPageTruthPlacement('equipment-operation-layer').localMatrix.tx, 25);
  assert.equal(getEquipmentPageTruthPlacement('equipment-operation-layer').localMatrix.ty, 25);
  assert.equal(getEquipmentPageTruthPlacement('inventory-root', 'page-closing').visible, false);
}

function testNativeGridAndDynamicPresentation(): void {
  const storage = createStorage();
  assert.equal(createSaveSlot(storage, 0), true);
  const model = createFormalInventoryPage(storage, 'p1');
  assert.ok(model);
  const entries = getFormalInventoryPageEntries(model);
  const cells = createInventoryGridProjection(entries, 12);
  assert.equal(cells.length, 25);
  assert.deepEqual(cells[0], { index: 0, x: 0, y: 0, empty: false, selected: false, entry: entries[0] });
  assert.equal(cells[24]?.x, InventoryGridStepX * 4);
  assert.equal(cells[24]?.y, InventoryGridStepY * 4);
  assert.equal(InventoryGridCellWidth, 50);
  assert.equal(InventoryGridCellHeight, 51);

  model.restored.player1.progression.level = 10;
  model.restored.player1.progression.currentExp = 50;
  model.restored.player1.progression.expToNext = 100;
  const mapPresentation = getFormalInventoryPresentation(model);
  assert.equal(mapPresentation.heroName, '悟空');
  assert.equal(mapPresentation.level, 10);
  assert.equal(mapPresentation.expFrame, 15);
  assert.equal(mapPresentation.currentHp, mapPresentation.maxHp);
  assert.equal(mapPresentation.currentMp, mapPresentation.maxMp);
  assert.ok(mapPresentation.fightingForce > 0);

  const combatPresentation = getFormalInventoryPresentation(model, {
    hp: 123, maxHp: 456, mp: 17, maxMp: 89,
  });
  assert.equal(combatPresentation.currentHp, 123);
  assert.equal(combatPresentation.maxHp, 456);
  assert.equal(combatPresentation.currentMp, 17);
  assert.equal(combatPresentation.maxMp, 89);
}

testOwnerEquipUnequipAndPersistence();
testCategoriesPagingAndSafeUnsupportedFeedback();
testTrueAssetsAndSceneContract();
testVerifiedTruthDirectConsumption();
testNativeGridAndDynamicPresentation();
console.log('Formal backpack/equipment owner, persistence, and true asset tests passed.');
