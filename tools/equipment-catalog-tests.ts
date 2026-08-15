import assert from 'node:assert/strict';

import {
  AuthoritativeEquipmentDefinitions,
  createAuthoritativeEquipmentRegistry,
} from '../src/systems/EquipmentCatalog';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from '../src/systems/InventoryResourceCatalog';
import {
  addInventoryResource,
  createInventoryStore,
  equipInventoryItem,
  unequipInventorySlot,
} from '../src/systems/InventorySystem';
import { createEmptyEquipmentLoadout } from '../src/systems/EquipmentSystem';

function testAuthoritativeCoverageAndUnits(): void {
  assert.equal(AuthoritativeEquipmentDefinitions.length, 164);
  assert.equal(new Set(AuthoritativeEquipmentDefinitions.map((item) => item.fillName)).size, 164);
  const registry = createAuthoritativeEquipmentRegistry(createSeedEquipmentRegistry());
  assert.equal(registry._clj?.stats.power, 230);
  assert.deepEqual(registry._clj?.baseStatRanges?.power, {
    min: 230, max: 234, maxInclusive: true, unit: 'points', runtimeCoercion: 'int',
    originalExpression: '230 + Math.random() * 5',
  });
  assert.equal(registry._clj?.stats.critPercent, 6);
  assert.equal(registry._clj?.baseStatRanges?.critPercent?.unit, 'ratio');
  assert.equal(registry.dgg?.strengthGrowth?.power, 111);
  assert.equal(registry.dgg?.strengthGrowth?.maxHp, 1111);
  assert.equal(registry.dgg?.strengthGrowth?.magicDefensePercent, 1);
  assert.equal(registry.ptdcz?.stats.power, 5);
}

function testAllEquipmentUsesExistingTransactionOwner(): void {
  const registry = createInventoryItemDefinitionRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const store = createInventoryStore(200, 'catalog');
  for (const definition of AuthoritativeEquipmentDefinitions) {
    assert.equal(addInventoryResource(store, registry, definition.fillName, 1).ok, true);
  }
  assert.equal(store.categories.equipment.length, 164);
  const weapon = store.categories.equipment.find(
    (entry) => entry.kind === 'equipment' && entry.definition.fillName === '_clj',
  );
  assert.ok(weapon?.kind === 'equipment');
  assert.equal(equipInventoryItem(store, loadout, weapon.instanceId, '白龙').ok, true);
  assert.equal(loadout.weapon?.definition.fillName, '_clj');
  assert.equal(unequipInventorySlot(store, loadout, 'weapon').ok, true);
  assert.equal(loadout.weapon, null);
  assert.equal(store.categories.equipment.length, 164);
}

testAuthoritativeCoverageAndUnits();
testAllEquipmentUsesExistingTransactionOwner();
console.log('Authoritative 164-item equipment catalog and transaction-owner tests passed.');
