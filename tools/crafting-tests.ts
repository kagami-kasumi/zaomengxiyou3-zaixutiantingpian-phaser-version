import assert from 'node:assert/strict';
import {
  craft,
  craftStagedSession,
  closeCraftingSession,
  createCraftingSession,
  createSeedCraftingItemDefinitions,
  inheritMingDingHuaYanStats,
  inheritSunSutraStats,
  matchCraftingRecipe,
  previewCrafting,
  previewCraftingSession,
  removeStagedCraftingMaterial,
  stageCraftingMaterial,
  type CraftingRecipe,
} from '../src/systems/CraftingSystem';
import {
  DirectStaticCraftingRecipes,
  DirectStaticRecipeSources,
  MingDingHuaYanCraftingRecipes,
  MingDingHuaYanRecipeSources,
  SunSutraCraftingRecipes,
  SunSutraRecipeSources,
  SutraCraftingRecipes,
  SutraRecipeSources,
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
import {
  craftingAssets,
  CraftingAssetKeys,
  CraftingItemTextureKeys,
} from '../src/assets/AssetManifest';
import {
  CraftingUILayout,
  getCraftingCanvasTransform,
} from '../src/scenes/test-scene/CraftingUILayout';

const seedEquipment = createSeedEquipmentRegistry();
const registry = Object.assign(seedEquipment, createSeedCraftingItemDefinitions(seedEquipment));

testAuthorityRegistryCoverage();
testUnorderedRecipeMatching();
testMixedMaterialRecipeCrafting();
testDuplicateMaterialQuantity();
testMinimalSutraInheritance();
testDuplicateSutraMaterialsAndAtomicFailure();
testSutraRequiresEquipmentInstances();
testSpecialInheritanceRegistryCoverage();
testSunSutraInheritanceRules();
testMingDingHuaYanInheritanceRules();
testAllSpecialRecipesCraftEquipmentInstances();
testSpecialInheritanceFailureIsAtomic();
testFailuresHaveNoSideEffects();
testSuccessfulAtomicTransaction();
testFullInventoryPreflightIsAtomic();
testPlayerInventoriesStayIsolated();
testSpecialInheritancePlayerIsolation();
testCraftingSessionSlotAndIdentityRules();
testCraftingSessionPreviewAndReturn();
testCraftingSessionSuccessAndFailureLifecycle();
testCraftingSessionConsumesStagedEquipment();
testCraftingSessionsStayPlayerIsolated();
testKylSeedCraftingAndPlayerIsolation();
testCraftingVisualAssetProvenance();
testCraftingFixedLayoutAndScaling();

console.log('Crafting system tests passed.');

function testCraftingVisualAssetProvenance(): void {
  assert.equal(craftingAssets.container.key, CraftingAssetKeys.container);
  assert.equal(craftingAssets.container.sourcePackage, 'assets/backpack1.swf');
  assert.equal(craftingAssets.container.sourceCharacterId, 119);
  assert.equal(craftingAssets.fusionPanel.sourceCharacterId, 169);
  assert.equal(craftingAssets.role1Unselected.sourceCharacterId, 218);
  assert.equal(craftingAssets.role5Selected.sourceCharacterId, 871);
  assert.equal(craftingAssets.tlzsp.sourcePackage, 'assets/EIcon1.swf');
  assert.equal(craftingAssets.tlzsp.sourceCharacterId, 813);
  assert.equal(craftingAssets.wptlz.sourceCharacterId, 807);
  assert.equal(craftingAssets.kyg.sourceCharacterId, 332);
  assert.equal(craftingAssets.kyz.sourceCharacterId, 342);
  assert.equal(craftingAssets.kys.sourceCharacterId, 323);
  assert.equal(craftingAssets.kyl.sourceCharacterId, 809);
  assert.deepEqual(
    [craftingAssets.kyg, craftingAssets.kyz, craftingAssets.kys, craftingAssets.kyl]
      .map((asset) => asset.sourcePackage),
    Array(4).fill('assets/EIcon1.swf'),
  );
  assert.deepEqual(CraftingItemTextureKeys, {
    tlzsp: CraftingAssetKeys.tlzsp,
    wptlz: CraftingAssetKeys.wptlz,
    kyg: CraftingAssetKeys.kyg,
    kyz: CraftingAssetKeys.kyz,
    kys: CraftingAssetKeys.kys,
    kyl: CraftingAssetKeys.kyl,
  });
  assert.equal(new Set(Object.values(craftingAssets).map((asset) => asset.key)).size, 18);
}

function testCraftingFixedLayoutAndScaling(): void {
  assert.deepEqual(CraftingUILayout.materialSlots, [
    { x: 183.6, y: 222.4 },
    { x: 281.45, y: 142.45 },
    { x: 379.45, y: 222.4 },
  ]);
  assert.deepEqual(CraftingUILayout.fusionPanel, { x: 175.6, y: 128.45 });
  assert.deepEqual(getCraftingCanvasTransform(1000, 600), { scale: 1, x: 0, y: 0 });
  assert.deepEqual(getCraftingCanvasTransform(940, 590), { scale: 0.94, x: 0, y: 13 });
  const wide = getCraftingCanvasTransform(2000, 1000);
  assert.equal(wide.scale, 5 / 3);
  assert.ok(Math.abs(wide.x - 500 / 3) < 1e-9);
  assert.equal(wide.y, 0);
}

function testAuthorityRegistryCoverage(): void {
  assert.equal(DirectStaticRecipeSources.length, 67);
  assert.equal(DirectStaticCraftingRecipes.length, 67);
  assert.equal(SutraRecipeSources.length, 41);
  assert.equal(SutraCraftingRecipes.length, 41);
  assert.equal(SunSutraRecipeSources.length, 3);
  assert.equal(SunSutraCraftingRecipes.length, 3);
  assert.equal(MingDingHuaYanRecipeSources.length, 1);
  assert.equal(MingDingHuaYanCraftingRecipes.length, 1);
  assert.equal(new Set(SutraRecipeSources.map((source) =>
    [...source.materials].sort().join('\u0000')
  )).size, 41);
  assert.equal(
    DirectStaticRecipeSources.filter((source) => source.sourceBranch === 86 || source.sourceBranch === 87).length,
    1,
  );
  assert.equal(
    matchCraftingRecipe(['mdcqg', 'wpdh', 'wpbp'])?.productFillName,
    'cs_wq_llzzs',
  );
}

function testDuplicateSutraMaterialsAndAtomicFailure(): void {
  const store = createInventoryStore();
  const sutraRegistry = createSutraTestRegistry();
  sutraRegistry.rls = equipment('rls', '熔炼石', 'zbfj', {
    ...sutraRegistry.kyl.stats, maxHp: 10, maxMp: 20, power: 30, defense: 40,
  });
  sutraRegistry.gjrls = equipment('gjrls', '高级熔炼石', 'zbfj', sutraRegistry.kyl.stats);
  addEquipmentDefinition(store, sutraRegistry.rls);
  addEquipmentDefinition(store, sutraRegistry.rls);

  const recipe = matchCraftingRecipe(['rls', 'rls', 'rls']);
  assert.equal(recipe?.productFillName, 'gjrls');
  assert.equal(previewCrafting(store, 1_000, recipe).canCraft, false);
  const failed = craft({
    store, registry: sutraRegistry, soul: 1_000,
    materialFillNames: ['rls', 'rls', 'rls'],
  });
  assert.equal(failed.ok, false);
  assert.equal(failed.soulAfter, 1_000);
  assert.equal(getInventoryEntries(store, 'equipment').length, 2);

  addEquipmentDefinition(store, sutraRegistry.rls);
  assert.equal(previewCrafting(store, 1_000, recipe).canCraft, true);
  const result = craft({
    store, registry: sutraRegistry, soul: 1_000,
    materialFillNames: ['rls', 'rls', 'rls'],
  });
  assert.equal(result.ok, true);
  const product = getInventoryEntries(store, 'equipment').find(
    (entry) => entry.kind === 'equipment' && entry.definition.fillName === 'gjrls',
  );
  assert.ok(product?.kind === 'equipment');
  assert.deepEqual(
    {
      maxHp: product.definition.stats.maxHp, maxMp: product.definition.stats.maxMp,
      power: product.definition.stats.power, defense: product.definition.stats.defense,
    },
    { maxHp: 10, maxMp: 20, power: 30, defense: 40 },
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

function testSpecialInheritanceRegistryCoverage(): void {
  assert.equal(matchCraftingRecipe(['xhz', 'xhc', 'xhp'])?.productionBehavior, 'get_sutra_value');
  assert.equal(
    matchCraftingRecipe(['tdlzj', 'mgzh', 'tflj'])?.productionBehavior,
    'get_sun_sutra_value',
  );
  assert.equal(matchCraftingRecipe(['shsjt', '_dzj', 'lly'])?.productFillName, 'dzjj');
  assert.equal(matchCraftingRecipe(['phhl', 'bxhy', 'zhhz'])?.productFillName, 'hy');
  assert.equal(
    matchCraftingRecipe(['wpjt', 'hy', 'wpxih'])?.productionBehavior,
    'get_mingding_huayan',
  );
  assert.equal(SutraCraftingRecipes.some((recipe) => recipe.productFillName === '_dzj'), false);
  assert.equal(SutraCraftingRecipes.some((recipe) => recipe.productFillName === 'mdhy'), false);
  assert.equal(matchCraftingRecipe(['ptnmwsz', 'ptnmwsz', 'ptnmwsz']), undefined);
}

function testSunSutraInheritanceRules(): void {
  const materials = specialMaterialInstances();
  const inherited = inheritSunSutraStats(materials, '_dzj');
  assert.deepEqual(inherited, {
    maxHp: 14, maxMp: 8, power: 4, defense: 6,
    critPercent: 10, missPercent: 15, hpRegen: 4, mpRegen: 6,
    lifeStealPercent: 8, magicDefensePercent: 24,
  });
  assert.equal(inheritSunSutraStats(materials, 'dzjj').lifeStealPercent, 0);
  assert.equal(inheritSunSutraStats(materials, 'hy').lifeStealPercent, 18);
}

function testMingDingHuaYanInheritanceRules(): void {
  const materials = specialMaterialInstances().map((item, index) => equipmentInstance(
    equipment(`ming-${index}`, `命定材料${index}`, 'zbfj', {
      ...item.definition.stats,
      maxHp: 1, maxMp: index === 0 ? -3 : 1, power: 1, defense: 1,
      hpRegen: 1, mpRegen: 1, lifeStealPercent: 1,
    }),
    `ming-${index}`,
  ));
  assert.deepEqual(inheritMingDingHuaYanStats(materials), {
    maxHp: 3, maxMp: 2, power: 3, defense: 3,
    critPercent: 23, missPercent: 18, hpRegen: 3, mpRegen: 3,
    lifeStealPercent: 3, magicDefensePercent: 24,
  });
}

function testAllSpecialRecipesCraftEquipmentInstances(): void {
  for (const recipe of [...SunSutraCraftingRecipes, ...MingDingHuaYanCraftingRecipes]) {
    const store = createInventoryStore();
    const specialRegistry = createSpecialTestRegistry();
    for (const fillName of recipe.materialFillNames) {
      assert.ok(addEquipmentDefinition(store, specialRegistry[fillName]));
    }
    const result = craft({
      store, registry: specialRegistry, soul: 1_000,
      materialFillNames: [...recipe.materialFillNames].reverse(),
    });
    assert.equal(result.ok, true, recipe.productFillName);
    assert.equal(result.soulAfter, 0);
    const entries = getInventoryEntries(store, 'equipment');
    assert.equal(entries.length, 1);
    const product = entries[0];
    assert.ok(product.kind === 'equipment');
    assert.equal(product.definition.fillName, recipe.productFillName);
    assert.equal(product.definition.stats.piercePercent, 7);
    assert.equal(product.definition.stats.shield, 9);
  }
}

function testSpecialInheritanceFailureIsAtomic(): void {
  const store = createInventoryStore();
  const specialRegistry = createSpecialTestRegistry();
  addEquipmentDefinition(store, specialRegistry.mgzh);
  addEquipmentDefinition(store, specialRegistry.tflj);
  specialRegistry.tdlzj = { ...specialRegistry.tdlzj, type: 'zbwp' };
  addStackByFillName(store, specialRegistry, 'tdlzj', 1);
  const result = craft({
    store, registry: specialRegistry, soul: 1_000,
    materialFillNames: ['mgzh', 'tflj', 'tdlzj'],
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /装备实例不足/);
  assert.equal(result.soulAfter, 1_000);
  assert.equal(getInventoryEntries(store, 'equipment').length, 2);
  assert.equal(stackQuantity(store, 'tdlzj'), 1);
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

function specialMaterialInstances(): ReturnType<typeof equipmentInstance>[] {
  const empty = createSeedEquipmentRegistry().kyl.stats;
  const stats = [
    { maxHp: 10, maxMp: -5, power: 1, defense: 2, critPercent: 4, missPercent: 20,
      hpRegen: 1, mpRegen: 2, lifeStealPercent: 3, magicDefensePercent: 30 },
    { maxHp: 11, maxMp: 6, power: 2, defense: 3, critPercent: 5, missPercent: 10,
      hpRegen: 2, mpRegen: 3, lifeStealPercent: 4, magicDefensePercent: 20 },
    { maxHp: -100, maxMp: 7, power: 3, defense: 4, critPercent: 6, missPercent: 0,
      hpRegen: 3, mpRegen: 4, lifeStealPercent: 5, magicDefensePercent: 10 },
  ];
  return stats.map((overrides, index) => equipmentInstance(
    equipment(`special-${index}`, `特殊材料${index}`, 'zbfj', { ...empty, ...overrides }),
    `special-${index}`,
  ));
}

function equipmentInstance(
  definition: ReturnType<typeof createSeedEquipmentRegistry>[string],
  instanceId: string,
) {
  return { kind: 'equipment' as const, instanceId, definition, quantity: 1 as const };
}

function createSpecialTestRegistry(): Record<string, ReturnType<typeof createSeedEquipmentRegistry>[string]> {
  const base = createSeedEquipmentRegistry();
  const materialStats = specialMaterialInstances().map((item) => item.definition.stats);
  const result: Record<string, ReturnType<typeof createSeedEquipmentRegistry>[string]> = { ...base };
  const fillNames = new Set(
    [...SunSutraCraftingRecipes, ...MingDingHuaYanCraftingRecipes]
      .flatMap((recipe) => [...recipe.materialFillNames, recipe.productFillName]),
  );
  let index = 0;
  for (const fillName of fillNames) {
    const isProduct = [...SunSutraCraftingRecipes, ...MingDingHuaYanCraftingRecipes]
      .some((recipe) => recipe.productFillName === fillName);
    result[fillName] = equipment(fillName, fillName, 'zbfj', isProduct
      ? { ...base.kyl.stats, piercePercent: 7, shield: 9 }
      : { ...materialStats[index++ % materialStats.length] });
  }
  return result;
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

function testSpecialInheritancePlayerIsolation(): void {
  const specialRegistry = createSpecialTestRegistry();
  const runtimes = createPlayerInventoryRuntimes(specialRegistry);
  for (const fillName of ['mgzh', 'tflj', 'tdlzj']) {
    addEquipmentDefinition(runtimes.p2.store, specialRegistry[fillName]);
  }
  const p1Before = getInventoryEntries(runtimes.p1.store, 'equipment').length;
  const result = craft({
    store: runtimes.p2.store, registry: specialRegistry, soul: runtimes.p2.magicWeaponSoul,
    materialFillNames: ['tdlzj', 'mgzh', 'tflj'],
  });
  runtimes.p2.magicWeaponSoul = result.soulAfter;
  assert.equal(result.ok, true);
  assert.equal(getInventoryEntries(runtimes.p1.store, 'equipment').length, p1Before);
  assert.equal(runtimes.p1.magicWeaponSoul, 5_000);
  assert.equal(runtimes.p2.magicWeaponSoul, 4_000);
  assert.ok(getInventoryEntries(runtimes.p2.store, 'equipment').some(
    (entry) => entry.kind === 'equipment' && entry.definition.fillName === '_dzj',
  ));
}

function testCraftingSessionSlotAndIdentityRules(): void {
  const store = createInventoryStore();
  const session = createCraftingSession('p1');
  const definition = equipment('unique', '唯一装备', 'zbfj', createSeedEquipmentRegistry().kyl.stats);
  const instance = addEquipmentDefinition(store, definition);
  assert.ok(instance);
  assert.equal(stageCraftingMaterial(session, store, instance).ok, true);
  assert.equal(getInventoryEntries(store, 'equipment').includes(instance), false);
  assert.equal(stageCraftingMaterial(session, store, instance).ok, false);
  assert.equal(session.slots.length, 1);
  assert.equal(removeStagedCraftingMaterial(session, store, 0).ok, true);
  assert.equal(getInventoryEntries(store, 'equipment')[0], instance);

  addStackByFillName(store, registry, 'tlzsp', 4);
  const stack = getInventoryEntries(store, 'items').find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === 'tlzsp',
  );
  assert.ok(stack?.kind === 'stack');
  assert.equal(stageCraftingMaterial(session, store, stack).ok, true);
  assert.equal(stageCraftingMaterial(session, store, stack).ok, true);
  assert.equal(stageCraftingMaterial(session, store, stack).ok, true);
  assert.equal(session.slots.length, 3);
  assert.equal(stageCraftingMaterial(session, store, stack).ok, false);
  assert.equal(stack.quantity, 1);
}

function testCraftingSessionPreviewAndReturn(): void {
  const store = createInventoryStore();
  const session = createCraftingSession('p1');
  addStackByFillName(store, registry, 'tlzsp', 3);
  const stack = getInventoryEntries(store, 'items')[0];
  assert.ok(stack?.kind === 'stack');
  stageCraftingMaterial(session, store, stack);
  stageCraftingMaterial(session, store, stack);
  stageCraftingMaterial(session, store, stack);
  assert.equal(stackQuantity(store, 'tlzsp'), 0);
  const preview = previewCraftingSession(session, 1_000);
  assert.equal(preview.canCraft, true);
  assert.equal(preview.recipe?.productFillName, 'wptlz');
  assert.equal(previewCraftingSession(session, 999).canCraft, false);
  assert.match(previewCraftingSession(session, 999).message, /灵魂不足/);

  assert.equal(removeStagedCraftingMaterial(session, store, 1).ok, true);
  assert.equal(stackQuantity(store, 'tlzsp'), 1);
  assert.equal(previewCraftingSession(session, 1_000).materialQuantity, 2);
  assert.equal(closeCraftingSession(session, store).ok, true);
  assert.equal(session.slots.length, 0);
  assert.equal(stackQuantity(store, 'tlzsp'), 3);

  const invalidSession = createCraftingSession('p1');
  addStackByFillName(store, registry, 'wptlz', 1);
  const restoredPearls = getInventoryEntries(store, 'items').find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === 'tlzsp',
  );
  const earthPearl = getInventoryEntries(store, 'items').find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === 'wptlz',
  );
  assert.ok(restoredPearls?.kind === 'stack');
  assert.ok(earthPearl?.kind === 'stack');
  stageCraftingMaterial(invalidSession, store, earthPearl);
  stageCraftingMaterial(invalidSession, store, restoredPearls);
  stageCraftingMaterial(invalidSession, store, restoredPearls);
  assert.match(previewCraftingSession(invalidSession, 1_000).message, /没有匹配/);
}

function testCraftingSessionSuccessAndFailureLifecycle(): void {
  const successStore = createInventoryStore();
  const successSession = createCraftingSession('p1');
  addStackByFillName(successStore, registry, 'tlzsp', 3);
  const successStack = getInventoryEntries(successStore, 'items')[0];
  assert.ok(successStack?.kind === 'stack');
  for (let i = 0; i < 3; i += 1) stageCraftingMaterial(successSession, successStore, successStack);
  const success = craftStagedSession({
    session: successSession, store: successStore, registry, soul: 1_000,
  });
  assert.equal(success.ok, true);
  assert.equal(successSession.slots.length, 0);
  assert.equal(successSession.lastProductFillName, 'wptlz');
  assert.equal(stackQuantity(successStore, 'tlzsp'), 0);
  assert.equal(stackQuantity(successStore, 'wptlz'), 1);

  const failureStore = createInventoryStore();
  const failureSession = createCraftingSession('p1');
  addStackByFillName(failureStore, registry, 'tlzsp', 3);
  const failureStack = getInventoryEntries(failureStore, 'items')[0];
  assert.ok(failureStack?.kind === 'stack');
  for (let i = 0; i < 3; i += 1) stageCraftingMaterial(failureSession, failureStore, failureStack);
  const failure = craftStagedSession({
    session: failureSession, store: failureStore, registry, soul: 999,
  });
  assert.equal(failure.ok, false);
  assert.equal(failure.soulAfter, 999);
  assert.equal(failureSession.slots.length, 3);
  assert.equal(failureSession.lastProductFillName, undefined);
  assert.equal(stackQuantity(failureStore, 'tlzsp'), 0);
  closeCraftingSession(failureSession, failureStore);
  assert.equal(failureSession.lastProductFillName, undefined);
  assert.equal(stackQuantity(failureStore, 'tlzsp'), 3);
  assert.equal(stackQuantity(failureStore, 'wptlz'), 0);
}

function testCraftingSessionConsumesStagedEquipment(): void {
  const store = createInventoryStore();
  const session = createCraftingSession('p1');
  const specialRegistry = createSpecialTestRegistry();
  for (const fillName of ['tdlzj', 'mgzh', 'tflj']) {
    const instance = addEquipmentDefinition(store, specialRegistry[fillName]);
    assert.ok(instance);
    assert.equal(stageCraftingMaterial(session, store, instance).ok, true);
  }
  assert.equal(getInventoryEntries(store, 'equipment').length, 0);
  assert.equal(previewCraftingSession(session, 1_000).recipe?.productFillName, '_dzj');
  const result = craftStagedSession({ session, store, registry: specialRegistry, soul: 1_000 });
  assert.equal(result.ok, true);
  assert.equal(session.slots.length, 0);
  const entries = getInventoryEntries(store, 'equipment');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].definition.fillName, '_dzj');
}

function testCraftingSessionsStayPlayerIsolated(): void {
  const runtimes = createPlayerInventoryRuntimes(registry);
  const p1Stack = getInventoryEntries(runtimes.p1.store, 'items').find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === 'tlzsp',
  );
  const p2Stack = getInventoryEntries(runtimes.p2.store, 'items').find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === 'tlzsp',
  );
  assert.ok(p1Stack?.kind === 'stack');
  assert.ok(p2Stack?.kind === 'stack');
  stageCraftingMaterial(runtimes.p1.craftingSession, runtimes.p1.store, p1Stack);
  stageCraftingMaterial(runtimes.p2.craftingSession, runtimes.p2.store, p2Stack);
  stageCraftingMaterial(runtimes.p2.craftingSession, runtimes.p2.store, p2Stack);
  assert.equal(runtimes.p1.craftingSession.ownerSlot, 'p1');
  assert.equal(runtimes.p2.craftingSession.ownerSlot, 'p2');
  assert.equal(runtimes.p1.craftingSession.slots.length, 1);
  assert.equal(runtimes.p2.craftingSession.slots.length, 2);
  assert.equal(stackQuantity(runtimes.p1.store, 'tlzsp'), 2);
  assert.equal(stackQuantity(runtimes.p2.store, 'tlzsp'), 1);
  closeCraftingSession(runtimes.p1.craftingSession, runtimes.p1.store);
  assert.equal(stackQuantity(runtimes.p1.store, 'tlzsp'), 3);
  assert.equal(stackQuantity(runtimes.p2.store, 'tlzsp'), 1);
}

function testKylSeedCraftingAndPlayerIsolation(): void {
  const kylRegistry = createSeedEquipmentRegistry();
  Object.assign(kylRegistry, createSeedCraftingItemDefinitions(kylRegistry));
  const runtimes = createPlayerInventoryRuntimes(kylRegistry);
  const materialNames = ['kyg', 'kyz', 'kys'] as const;

  const p1Materials = materialNames.map((fillName) => getInventoryEntries(
    runtimes.p1.store, 'equipment',
  ).find((entry) => entry.definition.fillName === fillName));
  const p2Materials = materialNames.map((fillName) => getInventoryEntries(
    runtimes.p2.store, 'equipment',
  ).find((entry) => entry.definition.fillName === fillName));
  p1Materials.forEach((entry) => assert.equal(entry?.kind, 'equipment'));
  p2Materials.forEach((entry) => assert.equal(entry?.kind, 'equipment'));
  p1Materials.forEach((entry, index) => {
    assert.notEqual(entry?.instanceId, p2Materials[index]?.instanceId);
  });

  p2Materials.forEach((entry) => {
    assert.ok(entry?.kind === 'equipment');
    assert.equal(stageCraftingMaterial(
      runtimes.p2.craftingSession, runtimes.p2.store, entry,
    ).ok, true);
  });
  assert.equal(previewCraftingSession(
    runtimes.p2.craftingSession, runtimes.p2.magicWeaponSoul,
  ).recipe?.productFillName, 'kyl');

  const failure = craftStagedSession({
    session: runtimes.p2.craftingSession,
    store: runtimes.p2.store,
    registry: kylRegistry,
    soul: 999,
  });
  assert.equal(failure.ok, false);
  assert.equal(runtimes.p2.craftingSession.slots.length, 3);
  assert.equal(getInventoryEntries(runtimes.p1.store, 'equipment').filter(
    (entry) => materialNames.includes(entry.definition.fillName as typeof materialNames[number]),
  ).length, 3);

  const success = craftStagedSession({
    session: runtimes.p2.craftingSession,
    store: runtimes.p2.store,
    registry: kylRegistry,
    soul: runtimes.p2.magicWeaponSoul,
  });
  assert.equal(success.ok, true);
  runtimes.p2.magicWeaponSoul = success.soulAfter;
  assert.equal(runtimes.p2.magicWeaponSoul, 4_000);
  assert.equal(runtimes.p1.magicWeaponSoul, 5_000);
  assert.equal(runtimes.p2.craftingSession.lastProductFillName, 'kyl');
  assert.equal(runtimes.p2.craftingSession.slots.length, 0);
  assert.equal(getInventoryEntries(runtimes.p2.store, 'equipment').some(
    (entry) => entry.definition.fillName === 'kyl',
  ), true);
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
