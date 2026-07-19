import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const recipePath = path.join(repoRoot, 'docs', 'reverse-engineering', 'reference', 'crafting-recipes-1.1.json');
const allEquipmentRelativePath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/AllEquipment.as';
const allEquipmentPath = path.join(repoRoot, ...allEquipmentRelativePath.split('/'));
const outputPath = path.join(repoRoot, 'docs', 'reverse-engineering', 'reference', 'crafting-item-catalog-1.1.json');

const authority = JSON.parse(readFileSync(recipePath, 'utf8'));
const source = readFileSync(allEquipmentPath, 'utf8');
const recipes = deduplicateRecipes(authority.recipes.filter((recipe) => recipe.productionBehavior !== 'direct_fashion_timestamp'));
const definitions = extractDefinitions(source);

const materialFillNames = new Set(recipes.flatMap((recipe) => recipe.materials));
const productFillNames = new Set(recipes.map((recipe) => recipe.productFillName));
const allFillNames = [...new Set([...materialFillNames, ...productFillNames])].sort();

if (recipes.length !== 112) throw new Error(`Expected 112 recipes, got ${recipes.length}`);
if (allFillNames.length !== 201) throw new Error(`Expected 201 fillName values, got ${allFillNames.length}`);

const items = allFillNames.map((fillName) => buildItem(fillName));
const statusCounts = countBy(items, (item) => item.authorityStatus);
const categoryCounts = countBy(items, (item) => item.modernInventoryCategory ?? 'unresolved');
const productNameConflictCount = items.filter((item) => item.recipeProductNameCheck === 'conflict').length;

const catalog = {
  schemaVersion: 1,
  gameVersion: '1.1',
  scope: '112 unique modern-supported Fusion recipes (direct_fashion_timestamp excluded by recorded modern decision)',
  authorities: {
    recipes: 'docs/reverse-engineering/reference/crafting-recipes-1.1.json',
    itemDefinitions: allEquipmentRelativePath,
  },
  counts: {
    recipes: recipes.length,
    materialFillNames: materialFillNames.size,
    productFillNames: productFillNames.size,
    uniqueFillNames: allFillNames.length,
    authorityStatus: statusCounts,
    modernInventoryCategory: categoryCounts,
    productNameConflicts: productNameConflictCount,
  },
  typeMapping: {
    skillBooks: 'fillName contains jns',
    fashion: ['zbsz', 'zbcb'],
    equipment: ['zbwq', 'zbfj', 'zbsp', 'zbfb', 'zbtx', 'empty'],
    items: ['wpqhs', 'zbwp'],
  },
  items,
};

writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(catalog.counts, null, 2));

function deduplicateRecipes(sourceRecipes) {
  const unique = new Map();
  for (const recipe of sourceRecipes) {
    const key = [...recipe.materials].sort().join('\u0000');
    const previous = unique.get(key);
    if (previous && previous.productFillName !== recipe.productFillName) {
      throw new Error(`Conflicting recipe authority for ${key}`);
    }
    unique.set(key, previous ?? recipe);
  }
  return [...unique.values()];
}

function extractDefinitions(text) {
  const byFillName = new Map();
  const pattern = /new\s+MyEquipObj\(\s*([^,]+),\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"/g;
  for (const match of text.matchAll(pattern)) {
    const showIdExpression = match[1].trim();
    const name = decodeString(match[2]);
    const fillName = decodeString(match[3]);
    const type = decodeString(match[4]);
    const user = decodeString(match[5]);
    const quality = decodeString(match[6]);
    const color = decodeString(match[7]);
    const sourceLine = text.slice(0, match.index).split(/\r?\n/).length;
    const candidate = { showIdExpression, name, type, user, quality, color, sourceLine };
    const candidates = byFillName.get(fillName) ?? [];
    if (!candidates.some((item) => item.name === name && item.type === type && item.sourceLine === sourceLine)) {
      candidates.push(candidate);
    }
    byFillName.set(fillName, candidates);
  }
  return byFillName;
}

function buildItem(fillName) {
  const candidates = definitions.get(fillName) ?? [];
  const uniqueMeanings = new Map(candidates.map((item) => [
    [item.showIdExpression, item.name, item.type, item.user, item.quality, item.color].join('\u0000'),
    item,
  ]));
  const meanings = [...uniqueMeanings.values()];
  const authorityStatus = meanings.length === 0 ? 'unresolved' : meanings.length === 1 ? 'confirmed' : 'conflict';
  const confirmed = authorityStatus === 'confirmed' ? meanings[0] : undefined;
  const recipeProductDisplayNames = [...new Set(
    recipes.filter((recipe) => recipe.productFillName === fillName).map((recipe) => recipe.productDisplayName),
  )];
  const recipeProductNameCheck = !confirmed || recipeProductDisplayNames.length === 0
    ? 'not-applicable'
    : recipeProductDisplayNames.every((name) => name === confirmed.name) ? 'match' : 'conflict';

  return {
    fillName,
    roles: [
      ...(materialFillNames.has(fillName) ? ['material'] : []),
      ...(productFillNames.has(fillName) ? ['product'] : []),
    ],
    authorityStatus,
    showId: confirmed && /^\d+$/.test(confirmed.showIdExpression) ? Number(confirmed.showIdExpression) : null,
    name: confirmed?.name ?? null,
    originalType: confirmed?.type ?? null,
    user: confirmed?.user ?? null,
    quality: confirmed?.quality ?? null,
    color: confirmed?.color ?? null,
    modernInventoryCategory: confirmed ? inventoryCategory(fillName, confirmed.type) : null,
    recipeProductDisplayNames,
    recipeProductNameCheck,
    as3Definitions: candidates.map((candidate) => ({
      ...candidate,
      source: `${allEquipmentRelativePath}:${candidate.sourceLine}`,
    })),
    nextAction: authorityStatus === 'confirmed' ? 'none' : authorityStatus === 'conflict' ? 'resolve-findByName-precedence' : 'narrow-search-other-1.1-static-catalogs',
  };
}

function inventoryCategory(fillName, type) {
  if (fillName.includes('jns')) return 'skillBooks';
  if (type === 'zbsz' || type === 'zbcb') return 'fashion';
  if (['zbwq', 'zbfj', 'zbsp', 'zbfb', 'zbtx', ''].includes(type)) return 'equipment';
  if (type === 'wpqhs' || type === 'zbwp') return 'items';
  return null;
}

function decodeString(value) {
  return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

function countBy(items, keyOf) {
  const counts = {};
  for (const item of items) {
    const key = keyOf(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
