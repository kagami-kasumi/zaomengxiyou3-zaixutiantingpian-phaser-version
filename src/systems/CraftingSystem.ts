import type { EquipmentDefinition, EquipmentInstance } from './EquipmentSystem';
import {
  addEquipmentDefinition,
  addStackByFillName,
  getInventoryCategoryForDefinition,
  InventoryCategories,
  type InventoryStore,
} from './InventorySystem';
import {
  CraftingItemNames,
  DirectStaticCraftingRecipes,
  MingDingHuaYanCraftingRecipes,
  SunSutraCraftingRecipes,
  SutraCraftingRecipes,
} from './CraftingRecipeRegistry';

export type CraftingProductionBehavior =
  | 'legacy_static'
  | 'direct_static'
  | 'get_sutra_value'
  | 'get_sun_sutra_value'
  | 'get_mingding_huayan';

export type CraftingRecipe = {
  materialFillNames: readonly [string, string, string];
  productFillName: string;
  productName: string;
  soulCost: number;
  productionBehavior: CraftingProductionBehavior;
};

export type CraftingPreview = {
  recipe?: CraftingRecipe;
  materialQuantity: number;
  canCraft: boolean;
  message: string;
};

export type CraftingResult = {
  ok: boolean;
  message: string;
  soulBefore: number;
  soulAfter: number;
  recipe?: CraftingRecipe;
};

const DefaultSeedCraftingRecipe: CraftingRecipe = {
  materialFillNames: ['tlzsp', 'tlzsp', 'tlzsp'],
  productFillName: 'wptlz',
  productName: '土灵珠',
  soulCost: 1_000,
  productionBehavior: 'legacy_static',
};

// VS-042's original earth-pearl compatibility entry remains available alongside
// the authoritative direct-static and inherited-attribute registries.
export const SeedCraftingRecipes: readonly CraftingRecipe[] = [
  DefaultSeedCraftingRecipe,
  ...DirectStaticCraftingRecipes,
  ...SutraCraftingRecipes,
  ...SunSutraCraftingRecipes,
  ...MingDingHuaYanCraftingRecipes,
];

export function createSeedCraftingItemDefinitions(
  existing: Readonly<Record<string, EquipmentDefinition>> = {},
): Record<string, EquipmentDefinition> {
  const emptyStats = {
    maxHp: 0, maxMp: 0, power: 0, defense: 0, critPercent: 0,
    missPercent: 0, hpRegen: 0, mpRegen: 0, lifeStealPercent: 0,
    magicDefensePercent: 0, piercePercent: 0, shield: 0,
  };
  const itemNames = new Map(CraftingItemNames);
  itemNames.set('tlzsp', '土灵珠碎片');
  itemNames.set('wptlz', '土灵珠');
  const definitions: EquipmentDefinition[] = [...itemNames]
    .filter(([fillName]) => !existing[fillName])
    .map(([fillName, name]) => ({
      showId: 1, name, fillName, type: 'zbwp', user: '',
      quality: '普 通', color: '0xFFFFFF', stats: { ...emptyStats },
      description: '1.1 合成注册表物品',
    }));
  return Object.fromEntries(definitions.map((definition) => [definition.fillName, definition]));
}

export function matchCraftingRecipe(
  materialFillNames: readonly string[],
  recipes: readonly CraftingRecipe[] = SeedCraftingRecipes,
): CraftingRecipe | undefined {
  if (materialFillNames.length !== 3) return undefined;
  const sortedMaterials = [...materialFillNames].sort();
  return recipes.find((recipe) =>
    [...recipe.materialFillNames].sort().every((name, index) => name === sortedMaterials[index])
  );
}

export function previewCrafting(
  store: InventoryStore,
  soul: number,
  recipe: CraftingRecipe = DefaultSeedCraftingRecipe,
): CraftingPreview {
  const requirements = buildRequirements(recipe.materialFillNames);
  const totalRequired = recipe.materialFillNames.length;
  let totalAvailable = 0;
  for (const [fillName, required] of requirements) {
    const available = getMaterialQuantity(store, fillName);
    totalAvailable += Math.min(available, required);
    if (available < required) {
      return {
        recipe,
        materialQuantity: totalAvailable,
        canCraft: false,
        message: `材料不足 ${fillName} ${available}/${required}`,
      };
    }
  }
  if (soul < recipe.soulCost) {
    return { recipe, materialQuantity: totalRequired, canCraft: false, message: `灵魂不足 ${soul}/${recipe.soulCost}` };
  }
  return { recipe, materialQuantity: totalRequired, canCraft: true, message: `可合成 ${recipe.productName}` };
}

export function craft(params: {
  store: InventoryStore;
  registry: Record<string, EquipmentDefinition>;
  soul: number;
  materialFillNames: readonly string[];
  recipes?: readonly CraftingRecipe[];
}): CraftingResult {
  const soulBefore = params.soul;
  const recipe = matchCraftingRecipe(params.materialFillNames, params.recipes);
  if (!recipe) return failure('没有匹配的合成配方', soulBefore);

  const product = params.registry[recipe.productFillName];
  if (!product) return failure('合成产物配置缺失', soulBefore, recipe);
  const requirements = buildRequirements(recipe.materialFillNames);
  const inheritsEquipmentStats = isInheritedEquipmentBehavior(recipe.productionBehavior);
  const sutraMaterials = inheritsEquipmentStats
    ? findSutraMaterials(params.store, recipe.materialFillNames)
    : undefined;
  if (inheritsEquipmentStats && !sutraMaterials) {
    return failure('合成材料装备实例不足', soulBefore, recipe);
  }
  for (const [fillName, quantity] of requirements) {
    if (getMaterialQuantity(params.store, fillName) < quantity) {
      return failure(`${fillName} 数量不足`, soulBefore, recipe);
    }
  }
  if (params.soul < recipe.soulCost) return failure('灵魂值不够', soulBefore, recipe);
  if (!canAddProductAfterConsumption(params.store, product, requirements, sutraMaterials)) {
    return failure('背包空间不足', soulBefore, recipe);
  }

  if (sutraMaterials) {
    for (const material of sutraMaterials) removeEquipmentInstance(params.store, material);
  } else {
    for (const [fillName, quantity] of requirements) removeStackQuantity(params.store, fillName, quantity);
  }
  const added = sutraMaterials
    ? addEquipmentDefinition(params.store, createInheritedProduct(product, sutraMaterials, recipe.productionBehavior))
    : addStackByFillName(params.store, params.registry, recipe.productFillName, 1);
  if (!added) throw new Error('Crafting preflight allowed a product that could not be added');
  return {
    ok: true,
    message: `合成成功：${recipe.productName}`,
    soulBefore,
    soulAfter: soulBefore - recipe.soulCost,
    recipe,
  };
}

export function inheritSutraStats(
  materials: readonly EquipmentInstance[],
): Pick<EquipmentDefinition['stats'], 'maxHp' | 'maxMp' | 'power' | 'defense'> {
  return {
    maxHp: Math.trunc(materials.reduce((sum, item) => sum + item.definition.stats.maxHp, 0) / 3),
    maxMp: Math.trunc(materials.reduce((sum, item) => sum + item.definition.stats.maxMp, 0) / 3),
    power: Math.trunc(materials.reduce((sum, item) => sum + item.definition.stats.power, 0) / 3),
    defense: Math.trunc(materials.reduce((sum, item) => sum + item.definition.stats.defense, 0) / 3),
  };
}

type SpecialInheritedStats = Pick<
  EquipmentDefinition['stats'],
  | 'maxHp' | 'maxMp' | 'power' | 'defense'
  | 'critPercent' | 'missPercent' | 'hpRegen' | 'mpRegen'
  | 'lifeStealPercent' | 'magicDefensePercent'
>;

export function inheritSunSutraStats(
  materials: readonly EquipmentInstance[],
  productFillName: string,
): SpecialInheritedStats {
  const positiveSum = (read: (stats: EquipmentDefinition['stats']) => number): number =>
    materials.reduce((sum, item) => {
      const value = read(item.definition.stats);
      return value > 0 ? sum + value : sum;
    }, 0);
  const positiveFractionSum = (read: (stats: EquipmentDefinition['stats']) => number): number =>
    positiveSum(read) / 100;
  let lifeStealPercent = Math.trunc(positiveSum((stats) => stats.lifeStealPercent) / 1.5);
  if (productFillName === 'dzjj') lifeStealPercent = 0;
  if (productFillName === 'hy') lifeStealPercent = 18;
  return {
    maxHp: Math.trunc(positiveSum((stats) => stats.maxHp) / 1.5),
    maxMp: Math.trunc(positiveSum((stats) => stats.maxMp) / 1.5),
    power: Math.trunc(positiveSum((stats) => stats.power) / 1.5),
    defense: Math.trunc(positiveSum((stats) => stats.defense) / 1.5),
    critPercent: as3FractionToPercentPoints(roundTo2(positiveFractionSum((stats) => stats.critPercent) / 1.5)),
    missPercent: as3FractionToPercentPoints(Math.min(
      roundTo2(positiveFractionSum((stats) => stats.missPercent) / 1.5), 0.15,
    )),
    hpRegen: Math.trunc(positiveSum((stats) => stats.hpRegen) / 1.5),
    mpRegen: Math.trunc(positiveSum((stats) => stats.mpRegen) / 1.5),
    lifeStealPercent,
    magicDefensePercent: as3FractionToPercentPoints(Math.min(
      roundTo2(positiveFractionSum((stats) => stats.magicDefensePercent) / 1.5), 0.24,
    )),
  };
}

export function inheritMingDingHuaYanStats(
  materials: readonly EquipmentInstance[],
): SpecialInheritedStats {
  const positiveScaledIntegerSum = (
    read: (stats: EquipmentDefinition['stats']) => number,
  ): number => materials.reduce((sum, item) => {
    const value = read(item.definition.stats);
    return value > 0 ? sum + Math.trunc(value * 1.5) : sum;
  }, 0);
  const positiveScaledFractionSum = (
    read: (stats: EquipmentDefinition['stats']) => number,
  ): number => materials.reduce((sum, item) => {
    const value = read(item.definition.stats);
    return value > 0 ? sum + (value / 100) * 1.5 : sum;
  }, 0);
  return {
    maxHp: positiveScaledIntegerSum((stats) => stats.maxHp),
    maxMp: positiveScaledIntegerSum((stats) => stats.maxMp),
    power: positiveScaledIntegerSum((stats) => stats.power),
    defense: positiveScaledIntegerSum((stats) => stats.defense),
    critPercent: as3FractionToPercentPoints(roundTo2(
      positiveScaledFractionSum((stats) => stats.critPercent),
    )),
    missPercent: as3FractionToPercentPoints(Math.min(
      roundTo2(positiveScaledFractionSum((stats) => stats.missPercent)), 0.18,
    )),
    hpRegen: positiveScaledIntegerSum((stats) => stats.hpRegen),
    mpRegen: positiveScaledIntegerSum((stats) => stats.mpRegen),
    lifeStealPercent: positiveScaledIntegerSum((stats) => stats.lifeStealPercent),
    magicDefensePercent: as3FractionToPercentPoints(Math.min(
      roundTo2(positiveScaledFractionSum((stats) => stats.magicDefensePercent)), 0.24,
    )),
  };
}

function failure(message: string, soul: number, recipe?: CraftingRecipe): CraftingResult {
  return { ok: false, message, soulBefore: soul, soulAfter: soul, recipe };
}

function getMaterialQuantity(store: InventoryStore, fillName: string): number {
  let quantity = 0;
  for (const category of InventoryCategories) {
    for (const entry of store.categories[category]) {
      if (entry.definition.fillName !== fillName) continue;
      quantity += entry.kind === 'stack' ? entry.quantity : 1;
    }
  }
  return quantity;
}

function removeStackQuantity(store: InventoryStore, fillName: string, quantity: number): void {
  for (const category of InventoryCategories) {
    const index = store.categories[category].findIndex((entry) =>
      entry.kind === 'stack' && entry.definition.fillName === fillName
    );
    if (index < 0) continue;
    const stack = store.categories[category][index];
    if (stack.kind !== 'stack') return;
    stack.quantity -= quantity;
    if (stack.quantity === 0) store.categories[category].splice(index, 1);
    return;
  }
}

function findSutraMaterials(
  store: InventoryStore,
  materialFillNames: readonly string[],
): EquipmentInstance[] | undefined {
  const selected: EquipmentInstance[] = [];
  for (const fillName of materialFillNames) {
    const found = InventoryCategories.flatMap((category) => store.categories[category]).find(
      (entry): entry is EquipmentInstance =>
        entry.kind === 'equipment' &&
        entry.definition.fillName === fillName &&
        !selected.includes(entry),
    );
    if (!found) return undefined;
    selected.push(found);
  }
  return selected;
}

function removeEquipmentInstance(store: InventoryStore, material: EquipmentInstance): void {
  for (const category of InventoryCategories) {
    const index = store.categories[category].indexOf(material);
    if (index >= 0) {
      store.categories[category].splice(index, 1);
      return;
    }
  }
}

function createInheritedProduct(
  product: EquipmentDefinition,
  materials: readonly EquipmentInstance[],
  behavior: CraftingProductionBehavior,
): EquipmentDefinition {
  if (product.type === 'zbtx') return product;
  const inheritedStats = behavior === 'get_sun_sutra_value'
    ? inheritSunSutraStats(materials, product.fillName)
    : behavior === 'get_mingding_huayan'
      ? inheritMingDingHuaYanStats(materials)
      : inheritSutraStats(materials);
  return {
    ...product,
    stats: {
      ...product.stats,
      ...inheritedStats,
    },
  };
}

function isInheritedEquipmentBehavior(behavior: CraftingProductionBehavior): boolean {
  return behavior === 'get_sutra_value' ||
    behavior === 'get_sun_sutra_value' ||
    behavior === 'get_mingding_huayan';
}

function roundTo2(value: number): number {
  return Number(value.toFixed(2));
}

function as3FractionToPercentPoints(value: number): number {
  return value * 100;
}

function canAddProductAfterConsumption(
  store: InventoryStore,
  product: EquipmentDefinition,
  requirements: ReadonlyMap<string, number>,
  consumedEquipment: readonly EquipmentInstance[] | undefined,
): boolean {
  const category = getInventoryCategoryForDefinition(product);
  const entries = store.categories[category];
  if (entries.some((entry) => entry.kind === 'stack' && entry.definition.fillName === product.fillName)) {
    return true;
  }
  const removedStacks = entries.filter((entry) =>
    entry.kind === 'stack' &&
    (requirements.get(entry.definition.fillName) ?? 0) === entry.quantity
  ).length;
  const removedEquipment = consumedEquipment?.filter((entry) => entries.includes(entry)).length ?? 0;
  return entries.length - removedStacks - removedEquipment < store.capacityPerCategory;
}

function buildRequirements(names: readonly string[]): Map<string, number> {
  const requirements = new Map<string, number>();
  for (const fillName of names) {
    requirements.set(fillName, (requirements.get(fillName) ?? 0) + 1);
  }
  return requirements;
}
