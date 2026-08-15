import assert from 'node:assert/strict';

import {
  AuthoritativeEquipmentDefinitions,
} from '../src/systems/EquipmentCatalog';
import {
  EquipmentMakingRecipes,
  createEquipmentMakingDefinitionRegistry,
} from '../src/systems/EquipmentMakingRegistry';
import {
  createEquipmentMakingSession,
  stageEquipmentMakingEntry,
  submitEquipmentMaking,
} from '../src/systems/EquipmentMakingSystem';
import {
  canResolveEquipment,
  createEquipmentResolutionSession,
  resolveEquipmentProducts,
  stageEquipmentResolutionTarget,
  submitEquipmentResolution,
} from '../src/systems/EquipmentResolutionSystem';
import {
  canStrengthenEquipment,
  createEquipmentStrengtheningSession,
  stageEquipmentStrengtheningEntry,
  submitEquipmentStrengthening,
} from '../src/systems/EquipmentStrengtheningSystem';
import {
  createEmptyEquipmentLoadout,
  createSeedEquipmentRegistry,
  getEquipmentInstanceStats,
  type EquipmentDefinition,
  type EquipmentInstance,
  type EquipmentStats,
} from '../src/systems/EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from '../src/systems/InventoryResourceCatalog';
import {
  addEquipmentDefinition,
  addStackByFillName,
  createInventoryStore,
  getInventoryEntries,
  getStackQuantityByFillName,
  InventoryStackQuantityLimit,
} from '../src/systems/InventorySystem';
import { createDefaultGameSave } from '../src/systems/SaveSlotSystem';
import {
  GameSaveVersion,
  parseGameSave,
  restoreGameState,
} from '../src/systems/SaveSystem';

const registry = createEquipmentMakingDefinitionRegistry({
  ...createSeedEquipmentRegistry(),
  ...createInventoryItemDefinitionRegistry(),
});
const StrengthenableTypes = new Set(['zbwq', 'zbfj', 'zbsp', 'zbsz', '']);
const StrengthenableArtifacts = new Set([
  'sqmdcqg', 'zxstg', 'zxstj', 'zxptz', 'zxpty', 'zxztk',
  'zxztp', 'zxqtc', 'zxqts', 'zxztj', 'zxttp',
]);
const ResolvableTypes = new Set(['zbwq', 'zbfj', 'zbsp']);
const StatKeys: readonly (keyof EquipmentStats)[] = [
  'maxHp', 'maxMp', 'power', 'defense', 'critPercent', 'missPercent',
  'hpRegen', 'mpRegen', 'lifeStealPercent', 'magicDefensePercent',
  'piercePercent', 'shield',
];

function testAuthoritativeStrengtheningAndResolutionReplay(): void {
  assert.equal(AuthoritativeEquipmentDefinitions.length, 164);
  for (const owner of ['p1', 'p2'] as const) {
    for (const definition of AuthoritativeEquipmentDefinitions) {
      replayStrengthening(owner, definition);
      replayResolution(owner, definition);
    }
  }
}

function replayStrengthening(owner: 'p1' | 'p2', definition: EquipmentDefinition): void {
  const store = createInventoryStore(20, `${owner}-strength-${definition.fillName}`);
  const loadout = createEmptyEquipmentLoadout();
  const target = addEquipmentDefinition(store, definition)!;
  const session = createEquipmentStrengtheningSession(owner);
  const expectedAdmission = isExpectedStrengthenable(definition);
  assert.equal(canStrengthenEquipment(target) === true, expectedAdmission, definition.fillName);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, target), expectedAdmission);
  if (!expectedAdmission) {
    assert.equal(store.categories.equipment.includes(target), true);
    return;
  }
  assert.ok(addStackByFillName(store, registry, 'wpqhs5', 1));
  const stone = findStack(store, 'wpqhs5');
  assert.ok(stone);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, stone), true);
  const result = submitEquipmentStrengthening({ session, store, loadout, soul: 50_000, random: () => 0 });
  assert.equal(result.ok, true, definition.fillName);
  assert.equal(result.outcome, 'success');
  assert.equal(target.strengthLevel, 1);
  const effective = getEquipmentInstanceStats(target);
  for (const key of StatKeys) {
    assert.equal(
      effective[key],
      definition.stats[key] + (definition.strengthGrowth?.[key] ?? 0),
      `${owner} ${definition.fillName} ${key}`,
    );
  }
}

function replayResolution(owner: 'p1' | 'p2', definition: EquipmentDefinition): void {
  const target = instance(definition, `${owner}-resolution-${definition.fillName}`);
  const expectedAdmission = ResolvableTypes.has(definition.type);
  assert.equal(canResolveEquipment(target) === true, expectedAdmission, definition.fillName);
  if (!expectedAdmission) return;
  const store = createInventoryStore(20, `${owner}-resolution`);
  const loadout = createEmptyEquipmentLoadout();
  assert.ok(addEquipmentDefinition(store, definition));
  const stored = getInventoryEntries(store, 'equipment').find(
    (entry) => entry.kind === 'equipment' && entry.definition.fillName === definition.fillName,
  );
  assert.ok(stored?.kind === 'equipment');
  const session = createEquipmentResolutionSession(owner);
  assert.equal(stageEquipmentResolutionTarget(session, store, loadout, stored), true);
  const expectedProducts = resolveEquipmentProducts(stored, () => 0);
  for (const fillName of expectedProducts) assert.ok(registry[fillName], fillName);
  const result = submitEquipmentResolution({ session, store, registry, soul: 50_000, random: () => 0 });
  assert.equal(result.ok, true, `${owner} ${definition.fillName}`);
  assert.deepEqual(result.productFillNames, expectedProducts);
}

function testAllMakingRecipesForBothOwners(): void {
  assert.equal(EquipmentMakingRecipes.length, 78);
  const largestMaterialRequirement = Math.max(
    ...EquipmentMakingRecipes.flatMap((recipe) => recipe.requiredMaterials.map((material) => material.quantity)),
  );
  assert.equal(largestMaterialRequirement, 1_888);
  assert.equal(InventoryStackQuantityLimit, largestMaterialRequirement);
  for (const owner of ['p1', 'p2'] as const) {
    for (const recipe of EquipmentMakingRecipes) {
      const store = createInventoryStore(30, `${owner}-making-${recipe.bookFillName}`);
      assert.ok(addStackByFillName(store, registry, recipe.bookFillName, 1));
      for (const material of recipe.requiredMaterials) {
        assert.ok(
          addStackByFillName(store, registry, material.fillName, material.quantity),
          `${owner} ${recipe.bookFillName} missing material ${material.fillName}`,
        );
      }
      for (const gem of ['wptlz', 'wpllz', 'wpflz']) {
        assert.ok(addStackByFillName(store, registry, gem, 1));
      }
      const session = createEquipmentMakingSession(owner);
      assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, recipe.bookFillName)), true);
      for (const gem of ['wptlz', 'wpllz', 'wpflz']) {
        assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, gem)), true);
      }
      const result = submitEquipmentMaking({ session, store, registry, soul: 50_000, random: () => 0 });
      assert.equal(result.ok, true, `${owner} ${recipe.bookFillName}`);
      assert.equal(result.product?.definition.fillName, recipe.productFillName);
      assert.equal(result.product?.baseStatsOverride?.magicDefensePercent, registry[recipe.productFillName].stats.magicDefensePercent + 1);
      assert.equal(result.product?.baseStatsOverride?.critPercent, registry[recipe.productFillName].stats.critPercent + 1);
      assert.equal(result.product?.baseStatsOverride?.missPercent, registry[recipe.productFillName].stats.missPercent + 1);
    }
  }
}

function testHighestMakingRecipeRejectsAtomically(): void {
  const recipe = EquipmentMakingRecipes.find((candidate) =>
    candidate.requiredMaterials.some((material) => material.quantity === InventoryStackQuantityLimit)
  );
  assert.ok(recipe);
  const store = createInventoryStore(30, 'highest-making-atomic');
  assert.ok(addStackByFillName(store, registry, recipe.bookFillName, 1));
  for (const material of recipe.requiredMaterials) {
    assert.ok(addStackByFillName(store, registry, material.fillName, material.quantity));
  }
  const session = createEquipmentMakingSession('p1');
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, recipe.bookFillName)), true);

  const largestMaterial = recipe.requiredMaterials.find(
    (material) => material.quantity === InventoryStackQuantityLimit,
  );
  assert.ok(largestMaterial);
  const largestStack = findStack(store, largestMaterial.fillName);
  assert.ok(largestStack);
  largestStack.quantity -= 1;
  const beforeShortage = JSON.stringify(store);
  const shortage = submitEquipmentMaking({ session, store, registry, soul: 50_000, random: () => 0 });
  assert.equal(shortage.ok, false);
  assert.equal(JSON.stringify(store), beforeShortage);
  assert.ok(session.book);

  largestStack.quantity += 1;
  store.capacityPerCategory = 0;
  const beforeCapacity = JSON.stringify(store);
  const capacity = submitEquipmentMaking({ session, store, registry, soul: 50_000, random: () => 0 });
  assert.equal(capacity.ok, false);
  assert.equal(JSON.stringify(store), beforeCapacity);
  assert.ok(session.book);
}

function testCurrentMakingSnapshotRoundTripAndOldVersionRejection(): void {
  const save = createDefaultGameSave();
  const definition = registry.whg;
  const currentSnapshot = { ...definition.stats, maxHp: definition.stats.maxHp + 17 };
  for (const key of [
    'critPercent', 'missPercent', 'lifeStealPercent', 'magicDefensePercent', 'piercePercent',
  ] as const) {
    currentSnapshot[key] = definition.stats[key] + 1;
  }
  save.player1.inventory.categories.equipment.unshift(
    {
      kind: 'equipment', fillName: 'whg', instanceId: 'current-making-points', quantity: 1,
      baseStatsOverride: currentSnapshot,
    },
  );
  const parsed = parseGameSave(JSON.stringify(save));
  assert.ok(parsed);
  assert.equal(parsed.version, GameSaveVersion);
  const restored = restoreGameState(parsed, registry).player1.inventoryStore.categories.equipment;
  const current = restored.find((entry) => entry.kind === 'equipment' && entry.instanceId === 'current-making-points');
  assert.ok(current?.kind === 'equipment');
  assert.equal(current.baseStatsOverride?.maxHp, definition.stats.maxHp + 17);
  for (const key of [
    'critPercent', 'missPercent', 'lifeStealPercent', 'magicDefensePercent', 'piercePercent',
  ] as const) {
    assert.equal(current.baseStatsOverride?.[key], definition.stats[key] + 1);
  }
  assert.equal(parseGameSave(JSON.stringify({ ...save, version: GameSaveVersion - 1 })), undefined);
}

function isExpectedStrengthenable(definition: EquipmentDefinition): boolean {
  if (!StrengthenableTypes.has(definition.type) || definition.type === 'zbtx') return false;
  const quality = definition.quality.replaceAll(' ', '');
  const artifact = quality === '神器' || definition.fillName.startsWith('hy')
    || definition.fillName.startsWith('_dzj') || definition.fillName.startsWith('dzjj');
  return !artifact || StrengthenableArtifacts.has(definition.fillName);
}

function instance(definition: EquipmentDefinition, instanceId: string): EquipmentInstance {
  return { kind: 'equipment', instanceId, definition, quantity: 1 };
}

function findStack(store: ReturnType<typeof createInventoryStore>, fillName: string) {
  return Object.values(store.categories).flat().find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === fillName,
  );
}

testAuthoritativeStrengtheningAndResolutionReplay();
testAllMakingRecipesForBothOwners();
testHighestMakingRecipeRejectsAtomically();
testCurrentMakingSnapshotRoundTripAndOldVersionRejection();
console.log('164-item strengthening/resolution, 78-recipe making, dual-owner, and current-schema replay passed.');
