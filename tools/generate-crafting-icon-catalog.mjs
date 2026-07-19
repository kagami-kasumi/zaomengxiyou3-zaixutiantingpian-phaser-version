import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const repoRoot = process.cwd();
const itemCatalogPath = path.join(repoRoot, 'docs', 'reverse-engineering', 'reference', 'crafting-item-catalog-1.1.json');
const recipeCatalogPath = path.join(repoRoot, 'docs', 'reverse-engineering', 'reference', 'crafting-recipes-1.1.json');
const fusionRelativePath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/Fusion.as';
const fusionPath = path.join(repoRoot, ...fusionRelativePath.split('/'));
const restoredRoot = path.join(repoRoot, 'local-resources', 'regima', 'source', 'restored-swfs');
const symbolSources = [
  {
    sourcePackage: 'assets/EIcon1.swf',
    relativePath: 'local-resources/regima/task-outputs/task-settings-049-crafting-icons/eicon1-symbols/symbols.csv',
  },
  {
    sourcePackage: 'assets/EIcon2.swf',
    relativePath: 'local-resources/regima/task-outputs/task-settings-049-crafting-icons/eicon2-symbols/symbols.csv',
  },
];
const catalogOutputPath = path.join(repoRoot, 'docs', 'reverse-engineering', 'reference', 'crafting-icon-catalog-1.1.json');
const annotationOutputPath = path.join(repoRoot, 'docs', 'reverse-engineering', 'asset-annotation', 'annotations', 'crafting-items-remaining.csv');
const originalAnnotationFillNames = new Set(['tlzsp', 'wptlz', 'kyg', 'kyz', 'kys', 'kyl']);

const itemCatalog = JSON.parse(readFileSync(itemCatalogPath, 'utf8'));
const recipeCatalog = JSON.parse(readFileSync(recipeCatalogPath, 'utf8'));
const fusionSource = readFileSync(fusionPath, 'utf8');
const previewAliases = extractPreviewAliases(fusionSource);
const symbols = loadSymbols();
const items = itemCatalog.items.map(buildItem);
const statusCounts = countBy(items, (item) => item.status);
const packageCounts = countBy(items.flatMap((item) => item.requiredSymbols), (item) => item.sourcePackage ?? 'unresolved');
const batchCounts = countBy(items.filter((item) => !item.integrated), (item) => item.batchId);

if (items.length !== 201) throw new Error(`Expected 201 crafting icon items, got ${items.length}`);
if ((statusCounts.unresolved ?? 0) !== 0) {
  const unresolved = items.filter((item) => item.status === 'unresolved').map((item) => item.fillName);
  throw new Error(`Unresolved crafting icons: ${unresolved.join(', ')}`);
}

const output = {
  schemaVersion: 1,
  gameVersion: '1.1',
  scope: '201 crafting material/product fillName values',
  authorities: {
    itemCatalog: 'docs/reverse-engineering/reference/crafting-item-catalog-1.1.json',
    previewAliases: `${fusionRelativePath}:229-301`,
    symbolClass: symbolSources.map((source) => source.relativePath),
  },
  counts: {
    items: items.length,
    integrated: items.filter((item) => item.integrated).length,
    remaining: items.filter((item) => !item.integrated).length,
    previewAliases: Object.keys(previewAliases).length,
    status: statusCounts,
    requiredSymbolPackages: packageCounts,
    remainingBatches: batchCounts,
  },
  previewAliases,
  items,
};

writeFileSync(catalogOutputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
writeFileSync(annotationOutputPath, buildAnnotationCsv(items.filter((item) => !originalAnnotationFillNames.has(item.fillName))), 'utf8');
console.log(JSON.stringify(output.counts, null, 2));

function extractPreviewAliases(text) {
  const aliases = {};
  const pattern = /produceEquipName\s*==\s*"([^"]+)"[\s\S]*?AUtils\.getImageObj\("([^"]+)"\)/g;
  for (const match of text.matchAll(pattern)) {
    const sourceLine = text.slice(0, match.index).split(/\r?\n/).length;
    if (sourceLine < 229 || sourceLine > 300) continue;
    aliases[match[1]] = { symbol: match[2], sourceLine };
  }
  return aliases;
}

function loadSymbols() {
  const byName = new Map();
  for (const source of symbolSources) {
    const text = readFileSync(path.join(repoRoot, ...source.relativePath.split('/')), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^(\d+);"(.*)"$/);
      if (!match) continue;
      const entries = byName.get(match[2]) ?? [];
      entries.push({
        symbol: match[2],
        characterId: Number(match[1]),
        sourcePackage: source.sourcePackage,
        evidencePath: source.relativePath,
      });
      byName.set(match[2], entries);
    }
  }
  for (const absolutePath of listSwfs(restoredRoot)) {
    const relativeSwfPath = path.relative(restoredRoot, absolutePath).replaceAll('\\', '/');
    for (const symbol of readSymbolClassTag(absolutePath)) {
      const entries = byName.get(symbol.symbol) ?? [];
      if (!entries.some((entry) =>
        entry.sourcePackage === relativeSwfPath && entry.characterId === symbol.characterId
      )) {
        entries.push({
          ...symbol,
          sourcePackage: relativeSwfPath,
          evidencePath: `local-resources/regima/source/restored-swfs/${relativeSwfPath}`,
        });
      }
      byName.set(symbol.symbol, entries);
    }
  }
  for (const [name, entries] of byName) {
    const preferred = entries.filter((entry) => entry.sourcePackage === 'assets/EIcon1.swf');
    const secondary = entries.filter((entry) => entry.sourcePackage === 'assets/EIcon2.swf');
    const main = entries.filter((entry) => entry.sourcePackage === '1_MainLoad__main1.swf');
    byName.set(name, preferred.length > 0 ? preferred : secondary.length > 0 ? secondary : main.length > 0 ? main : entries);
  }
  return byName;
}

function listSwfs(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.swf'))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function readSymbolClassTag(filePath) {
  const raw = readFileSync(filePath);
  const signature = raw.subarray(0, 3).toString('ascii');
  if (signature === 'ZWS') return [];
  const body = signature === 'CWS' ? inflateSync(raw.subarray(8)) : raw.subarray(8);
  const swf = signature === 'CWS' ? Buffer.concat([Buffer.from('FWS'), raw.subarray(3, 8), body]) : raw;
  if (swf.subarray(0, 3).toString('ascii') !== 'FWS') return [];

  const rectBits = 5 + (swf[8] >> 3) * 4;
  let offset = 8 + Math.ceil(rectBits / 8) + 4;
  const symbols = [];
  while (offset + 2 <= swf.length) {
    const tagHeader = swf.readUInt16LE(offset);
    offset += 2;
    const tagCode = tagHeader >> 6;
    let tagLength = tagHeader & 0x3f;
    if (tagLength === 0x3f) {
      if (offset + 4 > swf.length) break;
      tagLength = swf.readUInt32LE(offset);
      offset += 4;
    }
    const end = offset + tagLength;
    if (end > swf.length) break;
    if (tagCode === 76 && tagLength >= 2) {
      let cursor = offset;
      const count = swf.readUInt16LE(cursor);
      cursor += 2;
      for (let index = 0; index < count && cursor + 2 <= end; index += 1) {
        const characterId = swf.readUInt16LE(cursor);
        cursor += 2;
        const zero = swf.indexOf(0, cursor);
        if (zero < 0 || zero > end) break;
        symbols.push({ characterId, symbol: swf.subarray(cursor, zero).toString('utf8') });
        cursor = zero + 1;
      }
    }
    offset = end;
    if (tagCode === 0) break;
  }
  return symbols;
}

function buildItem(item) {
  const integrated = existsSync(path.join(repoRoot, 'public', 'assets', 'ui', 'crafting', 'items', `${item.fillName}.png`));
  const requiredNames = [];
  if (item.roles.includes('material')) requiredNames.push({ usage: 'material', symbol: item.fillName });
  if (item.roles.includes('product')) {
    const alias = previewAliases[item.fillName];
    requiredNames.push({ usage: 'product-preview', symbol: alias?.symbol ?? item.fillName, aliasSourceLine: alias?.sourceLine ?? null });
  }
  const uniqueRequirements = [...new Map(requiredNames.map((entry) => [`${entry.usage}\u0000${entry.symbol}`, entry])).values()];
  const requiredSymbols = uniqueRequirements.map((requirement) => {
    const candidates = symbols.get(requirement.symbol) ?? [];
    return {
      ...requirement,
      status: candidates.length === 1 ? 'located' : candidates.length > 1 ? 'ambiguous' : 'unresolved',
      ...(candidates.length === 1 ? candidates[0] : { candidates }),
    };
  });
  const status = requiredSymbols.every((entry) => entry.status === 'located')
    ? 'export-ready'
    : requiredSymbols.some((entry) => entry.status === 'ambiguous') ? 'ambiguous' : 'unresolved';
  const firstRecipeBranch = Math.min(...recipeCatalog.recipes.filter((recipe) =>
    recipe.productionBehavior !== 'direct_fashion_timestamp' &&
    (recipe.productFillName === item.fillName || recipe.materials.includes(item.fillName))
  ).map((recipe) => recipe.sourceBranch));
  const batchId = requiredSymbols.some((entry) => entry.sourcePackage !== 'assets/EIcon1.swf')
    ? 'crafting-icons-special-sources'
    : firstRecipeBranch <= 18 ? 'crafting-icons-b001-018'
      : firstRecipeBranch <= 38 ? 'crafting-icons-b019-038'
        : firstRecipeBranch <= 58 ? 'crafting-icons-b039-058'
          : firstRecipeBranch <= 78 ? 'crafting-icons-b059-078'
            : firstRecipeBranch <= 98 ? 'crafting-icons-b079-098'
              : 'crafting-icons-b099-122';
  return {
    fillName: item.fillName,
    name: item.name,
    roles: item.roles,
    stableKey: `crafting-item.${item.fillName}`,
    integrated,
    firstRecipeBranch,
    batchId,
    status: integrated ? 'ready' : status,
    requiredSymbols,
    nextAction: integrated ? 'none' : status === 'export-ready' ? 'export-selectively' : 'review-candidate',
  };
}

function buildAnnotationCsv(remainingItems) {
  const header = 'stableKey,as3Name,sourceKind,sourcePath,sourcePackage,symbolId,scope,usage,status,confidence,nextAction,note';
  const rows = remainingItems.map((item) => {
    const primary = item.requiredSymbols[0];
    const symbolSummary = item.requiredSymbols.map((entry) =>
      `${entry.usage}:${entry.symbol}#${entry.characterId}`
    ).join(';');
    const aliasSummary = item.requiredSymbols.filter((entry) => entry.aliasSourceLine).map((entry) =>
      `${item.fillName}->${entry.symbol}@Fusion.as:${entry.aliasSourceLine}`
    ).join(';');
    return [
      item.stableKey,
      primary.symbol,
      'restored-swf',
      item.integrated
        ? `public/assets/ui/crafting/items/${item.fillName}.png;src/assets/AssetManifest.ts`
        : primary.evidencePath,
      primary.sourcePackage,
      primary.characterId,
      'ui',
      `${item.name}合成材料/产物图标`,
      item.integrated ? 'ready' : 'export-ready',
      'confirmed',
      item.integrated ? 'none' : 'export-selectively',
      [item.batchId, symbolSummary, aliasSummary].filter(Boolean).join('；'),
    ].map(csvCell).join(',');
  });
  return `${[header, ...rows].join('\n')}\n`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function countBy(items, keyOf) {
  const counts = {};
  for (const item of items) {
    const key = keyOf(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
