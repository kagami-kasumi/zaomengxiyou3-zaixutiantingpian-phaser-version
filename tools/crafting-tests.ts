import assert from 'node:assert/strict';
import {
  craft,
  createSeedCraftingItemDefinitions,
  matchCraftingRecipe,
  previewCrafting,
  type CraftingRecipe,
} from '../src/systems/CraftingSystem';
import {
  DirectStaticCraftingRecipes,
  DirectStaticRecipeSources,
} from '../src/systems/CraftingRecipeRegistry';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import {
  addStackByFillName,
  addEquipmentDefinition,
  createInventoryStore,
  createSeedInventoryStore,
  getInventoryEntries,
} from '../src/systems/InventorySystem';
import { createPlayerInventoryRuntimes } from '../src/systems/PlayerInventoryOwnershipSystem';

const seedEquipment = createSeedEquipmentRegistry();
const registry = Object.assign(seedEquipment, createSeedCraftingItemDefinitions(seedEquipment));

testAuthorityRegistryCoverage();
testUnorderedRecipeMatching();
testMixedMaterialRecipeCrafting();
testDuplicateMaterialQuantity();
testMinimalSutraInheritance();
testSutraRequiresEquipmentInstances();
testNonDirectRecipeIsUnavailable();
testFailuresHaveNoSideEffects();
testSuccessfulAtomicTransaction();
testFullInventoryPreflightIsAtomic();
testPlayerInventoriesStayIsolated();

console.log('Crafting system tests passed.');

function testAuthorityRegistryCoverage(): void {
  assert.equal(DirectStaticRecipeSources.length, 67);
  assert.equal(DirectStaticCraftingRecipes.length, 67);
  assert.equal(
    DirectStaticRecipeSources.filter((source) => source.sourceBranch === 86 || source.sourceBranch === 87).length,
    1,
  );
  assert.equal(
    matchCraftingRecipe(['mdcqg', 'wpdh', 'wpbp'])?.productFillName,
    'cs_wq_llzzs',
  );
}

function testUnorderedRecipeMatching(): void {
  const recipe: CraftingRecipe = {
    materialFillNames: ['a', 'b', 'a'],
    productFillName: 'c',
    productName: 'C',
    soulCost: 1,
    productionBehavior: 'direct_static',
  };
  assert.equal(matchCraftingRecipe(['b', 'a', 'a'], [recipe]), recipe);
  assert.equal(matchCraftingRecipe(['a', 'b', 'b'], [recipe]), undefined);
  assert.equal(matchCraftingRecipe(['a', 'b'], [recipe]), undefined);
}

function testMinimalSutraInheritance(): void {
  const store = createInventoryStore();
  const sutraRegistry = createSutraTestRegistry();
  addEquipmentDefinition(store, sutraRegistry.kyg);
  addEquipmentDefinition(store, sutraRegistry.kyz);
  addEquipmentDefinition(store, sutraRegistry.kys);

  const recipe = matchCraftingRecipe(['kys', 'kyg', 'kyz']);
  assert.equal(recipe?.productionBehavior, 'get_sutra_value');
  assert.equal(recipe?.productFillName, 'kyl');
  assert.equal(previewCrafting(store, 1_000, recipe).canCraft, true);

  const result = craft({
    store,
    registry: sutraRegistry,
    soul: 1_000,
    materialFillNames: ['kyz', 'kys', 'kyg'],
  });
  assert.equal(result.ok, true);
  assert.equal(result.soulAfter, 0);
  const product = getInventoryEntries(store, 'equipment').find(
    (entry) => entry.kind === 'equipment' && entry.definition.fillName === 'kyl',
  );
  assert.ok(product?.kind === 'equipment');
  assert.deepEqual(
    {
      maxHp: product.definition.stats.maxHp,
      maxMp: product.definition.stats.maxMp,
      power: product.definition.stats.power,
      defense: product.definition.stats.defense,
    },
    { maxHp: 41, maxMp: 23, power: 10, defense: 6 },
  );
  assert.equal(getInventoryEntries(store, 'equipment').length, 1);
}

function testSutraRequiresEquipmentInstances(): void {
  const store = createInventoryStore();
  const sutraRegistry = createSutraTestRegistry();
  addEquipmentDefinition(store, sutraRegistry.kyg);
  addEquipmentDefinition(store, sutraRegistry.kyz);
  const stackDefinition = { ...sutraRegistry.kys, type: 'zbwp' as const };
  sutraRegistry.kys = stackDefinition;
  addStackByFillName(store, sutraRegistry, 'kys', 1);
  const result = craft({
    store,
    registry: sutraRegistry,
    soul: 1_000,
    materialFillNames: ['kyg', 'kyz', 'kys'],
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /装备实例不足/);
  assert.equal(result.soulAfter, 1_000);
  assert.equal(getInventoryEntries(store, 'equipment').length, 2);
  assert.equal(stackQuantity(store, 'kys'), 1);
}

function testMixedMaterialRecipeCrafting(): void {
  const store = createInventoryStore();
  for (const fillName of ['wpfbyyan', 'wpfbtc', 'wpfbyyin']) {
    assert.ok(addStackByFillName(store, registry, fillName, 1));
  }
  const recipe = matchCraftingRecipe(['wpfbtc', 'wpfbyyin', 'wpfbyyan']);
  assert.equal(recipe?.productFillName, 'tjbg');
  assert.equal(previewCrafting(store, 1_000, recipe).canCraft, true);
  const result = craft({
    store, registry, soul: 1_000,
    materialFillNames: ['wpfbtc', 'wpfbyyin', 'wpfbyyan'],
  });
  assert.equal(result.ok, true);
  assert.equal(result.soulAfter, 0);
  assert.equal(stackQuantityInCategory(store, 'equipment', 'tjbg'), 1);
}

function testDuplicateMaterialQuantity(): void {
  const store = createInventoryStore();
  addStackByFillName(store, registry, 'tlzsp', 2);
  const preview = previewCrafting(store, 5_000);
  assert.equal(preview.canCraft, false);
  assert.equal(preview.materialQuantity, 2);
  assert.match(preview.message, /材料不足/);
}

function testNonDirectRecipeIsUnavailable(): void {
  assert.equal(matchCraftingRecipe(['xhz', 'xhc', 'xhp']), undefined);
  assert.equal(matchCraftingRecipe(['_dzj', 'wpqhs1', 'wpqhs1']), undefined);
}

function createSutraTestRegistry(): Record<string, ReturnType<typeof createSeedEquipmentRegistry>[string]> {
  const base = createSeedEquipmentRegistry();
  const empty = base.kyl.stats;
  return {
    ...base,
    kyg: equipment('kyg', '枯叶弓', 'zbwq', { ...empty, power: 13 }),
    kyz: equipment('kyz', '枯叶杖', 'zbwq', { ...empty, maxMp: 70, power: 17 }),
    kys: equipment('kys', '枯叶衫', 'zbfj', { ...empty, maxHp: 125, defense: 20 }),
  };
}

function equipment(
  fillName: string,
  name: string,
  type: 'zbwq' | 'zbfj',
  stats: ReturnType<typeof createSeedEquipmentRegistry>[string]['stats'],
): ReturnType<typeof createSeedEquipmentRegistry>[string] {
  return {
    showId: 1, name, fillName, type, user: '', quality: '优 秀', color: '0x00FF00',
    stats, description: '合成属性继承测试装备',
  };
}

function testFailuresHaveNoSideEffects(): void {
  const store = createInventoryStore();
  addStackByFillName(store, registry, 'tlzsp', 3);
  const before = stackQuantity(store, 'tlzsp');
  const lowSoul = craft({
    store, registry, soul: 999,
    materialFillNames: ['tlzsp', 'tlzsp', 'tlzsp'],
  });
  assert.equal(lowSoul.ok, false);
  assert.equal(lowSoul.soulAfter, 999);
  assert.equal(stackQuantity(store, 'tlzsp'), before);
  assert.equal(stackQuantity(store, 'wptlz'), 0);

  const noRecipe = craft({
    store, registry, soul: 5_000,
    materialFillNames: ['tlzsp', 'tlzsp', 'wptlz'],
  });
  assert.equal(noRecipe.ok, false);
  assert.equal(noRecipe.soulAfter, 5_000);
  assert.equal(stackQuantity(store, 'tlzsp'), before);
}

function testSuccessfulAtomicTransaction(): void {
  const store = createSeedInventoryStore(registry);
  const result = craft({
    store, registry, soul: 5_000,
    materialFillNames: ['tlzsp', 'tlzsp', 'tlzsp'],
  });
  assert.equal(result.ok, true);
  assert.equal(result.soulAfter, 4_000);
  assert.equal(stackQuantity(store, 'tlzsp'), 0);
  assert.equal(stackQuantity(store, 'wptlz'), 1);
}

function testFullInventoryPreflightIsAtomic(): void {
  const store = createInventoryStore(1);
  addStackByFillName(store, registry, 'tlzsp', 4);
  const result = craft({
    store, registry, soul: 5_000,
    materialFillNames: ['tlzsp', 'tlzsp', 'tlzsp'],
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /背包空间不足/);
  assert.equal(result.soulAfter, 5_000);
  assert.equal(stackQuantity(store, 'tlzsp'), 4);
}

function testPlayerInventoriesStayIsolated(): void {
  const runtimes = createPlayerInventoryRuntimes(registry);
  const result = craft({
    store: runtimes.p2.store, registry, soul: runtimes.p2.magicWeaponSoul,
    materialFillNames: ['tlzsp', 'tlzsp', 'tlzsp'],
  });
  runtimes.p2.magicWeaponSoul = result.soulAfter;
  assert.equal(stackQuantity(runtimes.p1.store, 'tlzsp'), 3);
  assert.equal(stackQuantity(runtimes.p1.store, 'wptlz'), 0);
  assert.equal(runtimes.p1.magicWeaponSoul, 5_000);
  assert.equal(stackQuantity(runtimes.p2.store, 'tlzsp'), 0);
  assert.equal(stackQuantity(runtimes.p2.store, 'wptlz'), 1);
  assert.equal(runtimes.p2.magicWeaponSoul, 4_000);
}

function stackQuantity(store: ReturnType<typeof createInventoryStore>, fillName: string): number {
  return stackQuantityInCategory(store, 'items', fillName);
}

function stackQuantityInCategory(
  store: ReturnType<typeof createInventoryStore>,
  category: 'equipment' | 'items',
  fillName: string,
): number {
  return getInventoryEntries(store, category).reduce((total, entry) =>
    total + (entry.kind === 'stack' && entry.definition.fillName === fillName ? entry.quantity : 0), 0);
}
