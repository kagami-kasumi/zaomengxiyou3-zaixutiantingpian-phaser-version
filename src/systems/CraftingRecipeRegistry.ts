import recipeAuthority from '../../docs/reverse-engineering/reference/crafting-recipes-1.1.json';

import type { CraftingRecipe } from './CraftingSystem';

const SOUL_COST = 1_000;

export type DirectStaticRecipeSource = {
  sourceBranch: number;
  materials: readonly [string, string, string];
  productFillName: string;
  productDisplayName: string;
};

export type SutraRecipeSource = DirectStaticRecipeSource;
export type SpecialInheritanceRecipeSource = DirectStaticRecipeSource;

const directStaticSources = recipeAuthority.recipes.filter(
  (recipe) => recipe.productionBehavior === 'direct_static',
);

export const DirectStaticRecipeSources: readonly DirectStaticRecipeSource[] = deduplicateSources(
  directStaticSources.map((recipe) => ({
    sourceBranch: recipe.sourceBranch,
    materials: asMaterialTuple(recipe.materials, recipe.sourceBranch),
    productFillName: recipe.productFillName,
    productDisplayName: recipe.productDisplayName,
  })),
);

export const DirectStaticCraftingRecipes: readonly CraftingRecipe[] = DirectStaticRecipeSources.map(
  (source) => ({
    materialFillNames: source.materials,
    productFillName: source.productFillName,
    productName: source.productDisplayName,
    soulCost: SOUL_COST,
    productionBehavior: 'direct_static',
  }),
);

const sutraSources = recipeAuthority.recipes.filter(
  (recipe) => recipe.productionBehavior === 'get_sutra_value',
);

export const SutraRecipeSources: readonly SutraRecipeSource[] = deduplicateSources(
  sutraSources.map((recipe) => ({
    sourceBranch: recipe.sourceBranch,
    materials: asMaterialTuple(recipe.materials, recipe.sourceBranch),
    productFillName: recipe.productFillName,
    productDisplayName: recipe.productDisplayName,
  })),
);

export const SutraCraftingRecipes: readonly CraftingRecipe[] = SutraRecipeSources.map(
  (source) => ({
    materialFillNames: source.materials,
    productFillName: source.productFillName,
    productName: source.productDisplayName,
    soulCost: SOUL_COST,
    productionBehavior: 'get_sutra_value',
  }),
);

const sunSutraSources = recipeAuthority.recipes.filter(
  (recipe) => recipe.productionBehavior === 'get_sun_sutra_value',
);

export const SunSutraRecipeSources: readonly SpecialInheritanceRecipeSource[] = deduplicateSources(
  sunSutraSources.map((recipe) => ({
    sourceBranch: recipe.sourceBranch,
    materials: asMaterialTuple(recipe.materials, recipe.sourceBranch),
    productFillName: recipe.productFillName,
    productDisplayName: recipe.productDisplayName,
  })),
);

export const SunSutraCraftingRecipes: readonly CraftingRecipe[] = SunSutraRecipeSources.map(
  (source) => ({
    materialFillNames: source.materials,
    productFillName: source.productFillName,
    productName: source.productDisplayName,
    soulCost: SOUL_COST,
    productionBehavior: 'get_sun_sutra_value',
  }),
);

const mingDingHuaYanSources = recipeAuthority.recipes.filter(
  (recipe) => recipe.productionBehavior === 'get_mingding_huayan',
);

export const MingDingHuaYanRecipeSources: readonly SpecialInheritanceRecipeSource[] = deduplicateSources(
  mingDingHuaYanSources.map((recipe) => ({
    sourceBranch: recipe.sourceBranch,
    materials: asMaterialTuple(recipe.materials, recipe.sourceBranch),
    productFillName: recipe.productFillName,
    productDisplayName: recipe.productDisplayName,
  })),
);

export const MingDingHuaYanCraftingRecipes: readonly CraftingRecipe[] = MingDingHuaYanRecipeSources.map(
  (source) => ({
    materialFillNames: source.materials,
    productFillName: source.productFillName,
    productName: source.productDisplayName,
    soulCost: SOUL_COST,
    productionBehavior: 'get_mingding_huayan',
  }),
);

export const CraftingItemNames: ReadonlyMap<string, string> = buildItemNames();

function deduplicateSources(
  sources: readonly DirectStaticRecipeSource[],
): DirectStaticRecipeSource[] {
  const unique = new Map<string, DirectStaticRecipeSource>();
  for (const source of sources) {
    const key = materialMultisetKey(source.materials);
    const previous = unique.get(key);
    if (previous) {
      if (previous.productFillName !== source.productFillName) {
        throw new Error(`Conflicting crafting recipes for ${key}`);
      }
      continue;
    }
    unique.set(key, source);
  }
  return [...unique.values()];
}

function asMaterialTuple(materials: readonly string[], sourceBranch: number): [string, string, string] {
  if (materials.length !== 3 || materials.some((material) => material.length === 0)) {
    throw new Error(`Invalid materials in crafting source branch ${sourceBranch}`);
  }
  return [materials[0], materials[1], materials[2]];
}

function materialMultisetKey(materials: readonly string[]): string {
  return [...materials].sort().join('\u0000');
}

function buildItemNames(): Map<string, string> {
  const names = new Map<string, string>();
  for (const source of DirectStaticRecipeSources) {
    for (const material of source.materials) names.set(material, names.get(material) ?? material);
    names.set(source.productFillName, source.productDisplayName);
  }
  for (const source of SutraRecipeSources) {
    for (const material of source.materials) names.set(material, names.get(material) ?? material);
    names.set(source.productFillName, source.productDisplayName);
  }
  for (const source of [...SunSutraRecipeSources, ...MingDingHuaYanRecipeSources]) {
    for (const material of source.materials) names.set(material, names.get(material) ?? material);
    names.set(source.productFillName, source.productDisplayName);
  }
  return names;
}
