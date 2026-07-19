import recipeAuthority from '../docs/reverse-engineering/reference/crafting-recipes-1.1.json';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { CraftingItemTextureKeys } from '../src/assets/AssetManifest';
import {
  DirectStaticCraftingRecipes,
  MingDingHuaYanCraftingRecipes,
  SunSutraCraftingRecipes,
  SutraCraftingRecipes,
} from '../src/systems/CraftingRecipeRegistry';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import {
  getInventoryCategoryForDefinition,
  type InventoryCategory,
} from '../src/systems/InventorySystem';
import {
  createCraftingAcceptanceInventoryStore,
  createCraftingItemDefinitionRegistry,
} from '../src/systems/CraftingItemDefinitionRegistry';

type AuthorityRecipe = (typeof recipeAuthority.recipes)[number];
type IncludedRecipe = AuthorityRecipe & { productionBehavior: IncludedBehavior };
type IncludedBehavior =
  | 'direct_static'
  | 'get_sutra_value'
  | 'get_sun_sutra_value'
  | 'get_mingding_huayan';
type DefinitionStatus = 'named' | 'placeholder' | 'missing';

const INCLUDED_BEHAVIORS = new Set<IncludedBehavior>([
  'direct_static',
  'get_sutra_value',
  'get_sun_sutra_value',
  'get_mingding_huayan',
]);

const recipes = deduplicateAuthorityRecipes();
const baseRegistry = createSeedEquipmentRegistry();
const registry = Object.assign(baseRegistry, createCraftingItemDefinitionRegistry(baseRegistry));
const seedStore = createCraftingAcceptanceInventoryStore(registry, 'coverage');
const seededFillNames = new Set(
  Object.values(seedStore.categories).flat().map((entry) => entry.definition.fillName),
);
const iconFillNames = new Set(Object.keys(CraftingItemTextureKeys));

const modernRecipes = [
  ...DirectStaticCraftingRecipes,
  ...SutraCraftingRecipes,
  ...SunSutraCraftingRecipes,
  ...MingDingHuaYanCraftingRecipes,
];

assertCoverageContract();

if (process.argv.includes('--write-doc')) {
  writeCoverageDocument();
} else {
  const output = process.argv.includes('--json') ? JSON.stringify(buildAudit(), null, 2) : buildMarkdown();
  console.log(output);
}

function deduplicateAuthorityRecipes(): IncludedRecipe[] {
  const unique = new Map<string, IncludedRecipe>();
  for (const recipe of recipeAuthority.recipes) {
    if (!INCLUDED_BEHAVIORS.has(recipe.productionBehavior as IncludedBehavior)) continue;
    const included = recipe as IncludedRecipe;
    const key = materialKey(included.materials);
    const previous = unique.get(key);
    if (previous && previous.productFillName !== included.productFillName) {
      throw new Error(`Authority conflict for ${key}`);
    }
    unique.set(key, previous ?? included);
  }
  return [...unique.values()];
}

function assertCoverageContract(): void {
  const behaviorCounts = countBy(recipes, (recipe) => recipe.productionBehavior);
  assertEqual(recipes.length, 112, 'included unique recipe count');
  assertEqual(behaviorCounts.direct_static, 67, 'direct_static count');
  assertEqual(behaviorCounts.get_sutra_value, 41, 'get_sutra_value count');
  assertEqual(behaviorCounts.get_sun_sutra_value, 3, 'get_sun_sutra_value count');
  assertEqual(behaviorCounts.get_mingding_huayan, 1, 'get_mingding_huayan count');
  assertEqual(modernRecipes.length, 112, 'modern registry count');

  const authoritySignatures = new Set(
    recipes.map((recipe) => signature(recipe.materials, recipe.productFillName)),
  );
  const modernSignatures = new Set(
    modernRecipes.map((recipe) => signature(recipe.materialFillNames, recipe.productFillName)),
  );
  const authorityOnly = [...authoritySignatures].filter((item) => !modernSignatures.has(item));
  const modernOnly = [...modernSignatures].filter((item) => !authoritySignatures.has(item));
  assertEqual(authorityOnly.length, 0, 'authority-only recipe signatures');
  assertEqual(modernOnly.length, 0, 'modern-only recipe signatures');
}

function buildAudit() {
  const materialFillNames = new Set(recipes.flatMap((recipe) => recipe.materials));
  const productFillNames = new Set(recipes.map((recipe) => recipe.productFillName));
  const allFillNames = new Set([...materialFillNames, ...productFillNames]);
  const definitionCounts = countBy([...allFillNames], definitionStatus);

  return {
    generatedAt: new Date().toISOString(),
    recipeCount: recipes.length,
    behaviorCounts: countBy(recipes, (recipe) => recipe.productionBehavior),
    fillNameCounts: {
      materials: materialFillNames.size,
      products: productFillNames.size,
      union: allFillNames.size,
    },
    definitionCounts,
    acceptanceFillNameCount: [...allFillNames].filter((fillName) => seededFillNames.has(fillName)).length,
    readyIconCount: [...allFillNames].filter((fillName) => iconFillNames.has(fillName)).length,
    rows: recipes.map(buildRow),
  };
}

function buildRow(recipe: IncludedRecipe) {
  const uniqueFillNames = [...new Set([...recipe.materials, recipe.productFillName])];
  const definitionStates = uniqueFillNames.map(definitionStatus);
  const categories = [...recipe.materials, recipe.productFillName].map(inventoryCategory);
  const definedCount = definitionStates.filter((state) => state !== 'missing').length;
  const namedCount = definitionStates.filter((state) => state === 'named').length;
  const placeholderCount = definitionStates.filter((state) => state === 'placeholder').length;
  const seededCount = uniqueFillNames.filter((fillName) => seededFillNames.has(fillName)).length;
  const iconCount = uniqueFillNames.filter((fillName) => iconFillNames.has(fillName)).length;

  return {
    sourceBranch: recipe.sourceBranch,
    productionBehavior: recipe.productionBehavior,
    materials: recipe.materials,
    productFillName: recipe.productFillName,
    productDisplayName: recipe.productDisplayName,
    uniqueFillNameCount: uniqueFillNames.length,
    definitions: { definedCount, namedCount, placeholderCount, missingCount: uniqueFillNames.length - definedCount },
    inventoryCategories: { materials: categories.slice(0, 3), product: categories[3] },
    acceptanceEntry: { kind: 'acceptance-inventory-only', coveredCount: seededCount },
    icons: { readyCount: iconCount, unresolvedCount: uniqueFillNames.length - iconCount },
    ui: definedCount !== uniqueFillNames.length ? 'definition-blocked' : iconCount === uniqueFillNames.length ? 'true-icons' : 'text-fallback',
    tests: 'registry-set+full-p1-p2-transaction-matrix',
  };
}

function buildMarkdown(): string {
  const audit = buildAudit();
  const lines = [
    `recipes=${audit.recipeCount}; behaviors=${JSON.stringify(audit.behaviorCounts)}`,
    `fillNames=${JSON.stringify(audit.fillNameCounts)}; definitions=${JSON.stringify(audit.definitionCounts)}; acceptance=${audit.acceptanceFillNameCount}; icons=${audit.readyIconCount}`,
    '',
    '| 源分支 | 行为 | 材料 | 产物 | 现代定义（命名/占位/缺失） | 库存类别（材料→产物） | 获得/验收入口 | 真图标 | UI | 自动测试 |',
    '| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const row of audit.rows) {
    const definitions = row.definitions;
    lines.push(
      `| ${row.sourceBranch} | ${row.productionBehavior} | \`${row.materials.join(' + ')}\` | \`${row.productFillName}\` ${row.productDisplayName} | ${definitions.namedCount}/${definitions.placeholderCount}/${definitions.missingCount} | ${row.inventoryCategories.materials.join('/')}→${row.inventoryCategories.product} | 验收库存 ${row.acceptanceEntry.coveredCount}/${row.uniqueFillNameCount}；正式 0 | ${row.icons.readyCount}/${row.uniqueFillNameCount} | ${row.ui} | ${row.tests} |`,
    );
  }
  return lines.join('\n');
}

function writeCoverageDocument(): void {
  const repoRoot = process.cwd();
  const documentPath = path.join(repoRoot, 'docs', 'tasks', 'feature-line-coverage', 'LINE-CRAFTING.md');
  const startMarker = '<!-- crafting-coverage-matrix:start -->';
  const endMarker = '<!-- crafting-coverage-matrix:end -->';
  const document = readFileSync(documentPath, 'utf8');
  const start = document.indexOf(startMarker);
  const end = document.indexOf(endMarker);
  if (start < 0 || end < start) throw new Error('Crafting coverage matrix markers are missing or invalid');

  const replacement = `${startMarker}\n\n${buildMarkdown()}\n\n${endMarker}`;
  const nextDocument = `${document.slice(0, start)}${replacement}${document.slice(end + endMarker.length)}`;
  writeFileSync(documentPath, nextDocument, 'utf8');
  console.log('Updated docs/tasks/feature-line-coverage/LINE-CRAFTING.md with 112 recipe rows.');
}

function definitionStatus(fillName: string): DefinitionStatus {
  const definition = registry[fillName];
  if (!definition) return 'missing';
  return definition.name === fillName || /占位|配方测试材料|合成注册表物品/.test(definition.description)
    ? 'placeholder'
    : 'named';
}

function inventoryCategory(fillName: string): InventoryCategory | 'missing' {
  const definition = registry[fillName];
  return definition ? getInventoryCategoryForDefinition(definition) : 'missing';
}

function signature(materials: readonly string[], productFillName: string): string {
  return `${materialKey(materials)}=>${productFillName}`;
}

function materialKey(materials: readonly string[]): string {
  return [...materials].sort().join('+');
}

function countBy<T>(items: readonly T[], keyOf: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = keyOf(item);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

function assertEqual(actual: number | undefined, expected: number, label: string): void {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}
