import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalog = JSON.parse(readFileSync(path.join(
  root,
  'docs/reverse-engineering/reference/inventory-resource-catalog-1.1.json',
), 'utf8'));
const derivedRoot = path.join(
  root,
  'local-resources/regima/task-outputs/task-slice-160-inventory-icons',
);
const publicRoot = path.join(root, 'public/assets/ui/inventory/items');
const uiRoot = path.join(root, 'public/assets/ui/inventory/native');
const annotationPath = path.join(
  root,
  'docs/reverse-engineering/asset-annotation/annotations/inventory-items.csv',
);
const sourceDirectories = {
  'assets/EIcon1.swf': path.join(derivedRoot, 'eicon1/images'),
  '1_MainLoad__main1.swf': path.join(derivedRoot, 'main1/images'),
  'assets/MagicWeapon2.swf': path.join(derivedRoot, 'magicweapon2/images'),
};

mkdirSync(publicRoot, { recursive: true });
mkdirSync(uiRoot, { recursive: true });
const annotationRows = [
  'stableKey,as3Name,sourceKind,sourcePath,sourcePackage,symbolId,scope,usage,status,confidence,nextAction,note',
];
let copied = 0;
let excluded = 0;

for (const item of catalog.items) {
  if (item.icon.status !== 'located') {
    excluded += 1;
    annotationRows.push(csvRow([
      item.icon.stableKey,
      item.icon.originalRequestedSymbol,
      'restored-swf',
      item.icon.status === 'missing-original'
        ? 'local-resources/regima/source/restored-swfs'
        : item.icon.evidencePath,
      item.icon.sourcePackage ?? '',
      item.icon.characterId ?? '',
      'ui',
      `${item.displayName}背包图标`,
      item.icon.status === 'missing-original' ? 'missing-original' : 'rejected',
      'confirmed',
      item.icon.status === 'missing-original' ? 'request-source' : 'none',
      '原版目录缺陷且无外部生产者；未生成现代替代图',
    ]));
    continue;
  }

  const sourceDirectory = sourceDirectories[item.icon.sourcePackage];
  if (!sourceDirectory || !existsSync(sourceDirectory)) {
    throw new Error(`Missing derived source directory for ${item.icon.sourcePackage}`);
  }
  const prefix = `${item.icon.characterId}_`;
  const candidates = readdirSync(sourceDirectory).filter((name) => name.startsWith(prefix));
  if (candidates.length !== 1) {
    throw new Error(`Expected one exported image for ${item.fillName}, got ${candidates.length}`);
  }
  const outputName = `${encodeURIComponent(item.fillName)}.png`;
  const outputPath = path.join(publicRoot, outputName);
  copyFileSync(path.join(sourceDirectory, candidates[0]), outputPath);
  copied += 1;
  annotationRows.push(csvRow([
    item.icon.stableKey,
    item.icon.resolvedSymbol,
    'restored-swf',
    `public/assets/ui/inventory/items/${outputName};src/assets/InventoryItemAssets.ts`,
    item.icon.sourcePackage,
    item.icon.characterId,
    'ui',
    `${item.displayName}背包动态真图标`,
    'ready',
    'confirmed',
    'none',
    `TASK-SLICE-160；原请求 ${item.icon.originalRequestedSymbol}`,
  ]));
}

if (copied !== 428 || excluded !== 3) {
  throw new Error(`Unexpected inventory icon totals: copied=${copied}, excluded=${excluded}`);
}
writeFileSync(annotationPath, `${annotationRows.join('\n')}\n`, 'utf8');
integrateNativeUiAssets();
console.log(`Integrated ${copied} inventory icons and native controls; preserved ${excluded} original defects.`);

function csvRow(values) {
  return values.map((value) => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(',');
}

function integrateNativeUiAssets() {
  const uiDerivedRoot = path.join(
    root,
    'local-resources/regima/task-outputs/task-slice-160-inventory-ui',
  );
  const controls = {
    close: 31,
    previous: 78,
    next: 83,
    equipment: 230,
    items: 235,
    fashion: 240,
    skillBooks: 245,
  };
  const stateFiles = { up: '1_up.png', over: '2_over.png', down: '3_down.png' };
  for (const [name, characterId] of Object.entries(controls)) {
    const sourceDirectory = path.join(uiDerivedRoot, 'buttons', `DefineButton2_${characterId}`);
    for (const [state, fileName] of Object.entries(stateFiles)) {
      const sourcePath = path.join(sourceDirectory, fileName);
      if (!existsSync(sourcePath)) throw new Error(`Missing native inventory control ${sourcePath}`);
      copyFileSync(sourcePath, path.join(uiRoot, `${name}-${state}.png`));
    }
  }
  const slotSource = path.join(
    uiDerivedRoot,
    'packthings/DefineSprite_628_export.pack.PackThings/1.png',
  );
  if (!existsSync(slotSource)) throw new Error(`Missing native inventory slot ${slotSource}`);
  copyFileSync(slotSource, path.join(uiRoot, 'pack-slot.png'));
}
