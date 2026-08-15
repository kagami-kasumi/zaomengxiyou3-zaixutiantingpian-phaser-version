import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { inventoryItemAssets } from '../src/assets/InventoryItemAssets';
import {
  ExcludedInventoryResourceDefinitions,
  InventoryResourceDefinitions,
  InventoryResourceFillNames,
  LegacyInventoryCompatibilityFillNames,
  LoadableInventoryResourceDefinitions,
  createInventoryItemDefinitionRegistry,
} from '../src/systems/InventoryResourceCatalog';
import {
  InventoryCategories,
  InventoryStackQuantityLimit,
  addInventoryResource,
  applyInventoryTransaction,
  createInventoryStore,
  getStackQuantityByFillName,
} from '../src/systems/InventorySystem';
import { createDefaultGameSave } from '../src/systems/SaveSlotSystem';
import {
  createGameSave,
  parseGameSave,
  restoreGameState,
} from '../src/systems/SaveSystem';

const root = process.cwd();
const registry = createInventoryItemDefinitionRegistry();

function testAuthoritativeCatalogAndAssets(): void {
  assert.equal(InventoryResourceDefinitions.length, 431);
  assert.equal(new Set(InventoryResourceDefinitions.map((item) => item.fillName)).size, 431);
  assert.deepEqual(
    Object.fromEntries(InventoryCategories.map((category) => [
      category,
      InventoryResourceDefinitions.filter((item) => item.inventoryCategory === category).length,
    ])),
    { equipment: 164, items: 235, fashion: 20, skillBooks: 12 },
  );
  assert.equal(InventoryResourceDefinitions.filter((item) => item.quantityModel === 'instance').length, 184);
  assert.equal(InventoryResourceDefinitions.filter((item) => item.quantityModel === 'stack').length, 247);
  assert.equal(LoadableInventoryResourceDefinitions.length, 428);
  assert.equal(ExcludedInventoryResourceDefinitions.length, 3);
  assert.equal(InventoryResourceFillNames.size, 431);
  assert.deepEqual([...LegacyInventoryCompatibilityFillNames], ['wphtd', 'nianqld', 'nianjhd']);
  assert.ok(Object.keys(registry).length >= 434);
  assert.equal(Object.keys(inventoryItemAssets).length, 428);
  for (const asset of Object.values(inventoryItemAssets)) {
    assert.ok(existsSync(path.join(root, 'public', asset.path)), asset.path);
  }
  assert.equal(inventoryItemAssets.fmtstx, undefined);
  assert.equal(inventoryItemAssets.scwpqhs5, undefined);
  assert.equal(inventoryItemAssets.wc, undefined);
}

function testAtomicStackAndCapacityTransactions(): void {
  const store = createInventoryStore(2, 'atomic');
  assert.equal(addInventoryResource(store, registry, 'sms1', 3).ok, true);
  assert.equal(addInventoryResource(store, registry, 'sms1', 2).ok, true);
  assert.equal(getStackQuantityByFillName(store, 'sms1'), 5);
  assert.equal(applyInventoryTransaction(store, registry, [
    { kind: 'consume-stack', fillName: 'sms1', quantity: 5 },
  ]).ok, true);
  assert.equal(getStackQuantityByFillName(store, 'sms1'), 0);

  assert.equal(addInventoryResource(store, registry, 'sms1', InventoryStackQuantityLimit).ok, true);
  const beforeLimitFailure = JSON.stringify(store);
  assert.equal(addInventoryResource(store, registry, 'sms1', 1).ok, false);
  assert.equal(JSON.stringify(store), beforeLimitFailure);

  assert.equal(addInventoryResource(store, registry, 'wpqhs1', 1).ok, true);
  const beforeCapacityFailure = JSON.stringify(store);
  assert.equal(applyInventoryTransaction(store, registry, [
    { kind: 'consume-stack', fillName: 'sms1', quantity: 1 },
    { kind: 'add-resource', fillName: 'wpcsd', quantity: 1 },
  ]).ok, false);
  assert.equal(JSON.stringify(store), beforeCapacityFailure);
}

function testInstancesAndOwnerIsolation(): void {
  const p1 = createInventoryStore(1, 'p1');
  const p2 = createInventoryStore(1, 'p2');
  assert.equal(addInventoryResource(p1, registry, '_clj', 1).ok, true);
  const p1Snapshot = JSON.stringify(p1);
  assert.equal(addInventoryResource(p1, registry, 'ptdcz', 1).ok, false);
  assert.equal(JSON.stringify(p1), p1Snapshot);
  assert.equal(p1.nextEquipmentInstanceId, 2);
  assert.equal(p2.categories.equipment.length, 0);
  assert.equal(addInventoryResource(p2, registry, 'ptdcz', 1).ok, true);
  assert.notEqual(
    p1.categories.equipment[0]?.kind === 'equipment'
      ? p1.categories.equipment[0].instanceId
      : '',
    p2.categories.equipment[0]?.kind === 'equipment'
      ? p2.categories.equipment[0].instanceId
      : '',
  );
}

function testCurrentSchemaRoundTripWithPreviouslyUncoveredIdentity(): void {
  const base = createDefaultGameSave(new Date('2026-07-25T00:00:00.000Z'));
  const restoredBase = restoreGameState(base, registry);
  assert.equal(addInventoryResource(restoredBase.player1.inventoryStore, registry, '_clj', 1).ok, true);
  assert.equal(addInventoryResource(restoredBase.player2.inventoryStore, registry, 'css24', 4).ok, true);
  const save = createGameSave({
    party: base.party,
    progression: restoredBase.player1.progression,
    soulCount: restoredBase.player1.soulCount,
    skillLoadout: restoredBase.player1.skillLoadout,
    skillLearning: restoredBase.player1.skillLearning,
    inventoryStore: restoredBase.player1.inventoryStore,
    equipmentLoadout: restoredBase.player1.equipmentLoadout,
    petRoster: restoredBase.player1.petRoster,
    player2Progression: restoredBase.player2.progression,
    player2SoulCount: restoredBase.player2.soulCount,
    player2SkillLoadout: restoredBase.player2.skillLoadout,
    player2SkillLearning: restoredBase.player2.skillLearning,
    player2InventoryStore: restoredBase.player2.inventoryStore,
    player2EquipmentLoadout: restoredBase.player2.equipmentLoadout,
    player2PetRoster: restoredBase.player2.petRoster,
    levelUnlockProgress: base.levelUnlockProgress,
  });
  const parsed = parseGameSave(JSON.stringify(save));
  assert.ok(parsed);
  const roundTrip = restoreGameState(parsed, registry);
  assert.equal(roundTrip.player1.inventoryStore.categories.equipment.some(
    (entry) => entry.definition.fillName === '_clj',
  ), true);
  assert.equal(getStackQuantityByFillName(roundTrip.player2.inventoryStore, 'css24'), 4);
  assert.equal(getStackQuantityByFillName(roundTrip.player1.inventoryStore, 'css24'), 0);
}

function testNativeViewBoundary(): void {
  const source = readFileSync(
    path.join(root, 'src/scenes/feature-ui/FormalInventoryPageView.ts'),
    'utf8',
  );
  assert.match(source, /STAGE_OFFSET/);
  assert.match(source, /inventoryUiAssets/);
  assert.match(source, /getInventoryItemAsset/);
  assert.doesNotMatch(source, /add\.rectangle/);
  assert.doesNotMatch(source, /正式背包与装备|穿戴选中|卸下槽位|P1 背包|P2 背包/);
}

testAuthoritativeCatalogAndAssets();
testAtomicStackAndCapacityTransactions();
testInstancesAndOwnerIsolation();
testCurrentSchemaRoundTripWithPreviouslyUncoveredIdentity();
testNativeViewBoundary();
console.log('Authoritative inventory catalog, atomic transactions, current-schema round-trip, and native view tests passed.');
