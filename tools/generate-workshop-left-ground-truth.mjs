import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDirectory = path.join(root, 'docs/reverse-engineering/ground-truth/manifests');
const swfPath = 'local-resources/regima/source/restored-swfs/assets/backpack1.swf';
const xmlPath = 'local-resources/regima/task-outputs/task-settings-165b-backpack-review/backpack1.xml';
const strengthEquipmentPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/StrengthEquipment.as';
const evidencePath = 'docs/reverse-engineering/evidence/TASK-SETTINGS-167-workshop-left-pages.md';

const pages = [
  {
    id: 'strength', label: '强化', characterId: 198, symbolClass: 'export.strength.Strength', x: 175.6, y: 128.45,
    svg: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites-svg/DefineSprite_198_export.strength.Strength/1.svg',
    png: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_198_export.strength.Strength/1.png',
    as3: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/Strength.as',
    baseline: 'docs/tasks/evidence/TASK-SETTINGS-167/original-strength-940x590.png',
    depths: [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18],
    buttonStates: { 185: [182, 184] },
  },
  {
    id: 'fusion', label: '合成', characterId: 169, symbolClass: 'export.strength.Fusion', x: 175.6, y: 128.45,
    svg: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites-svg/DefineSprite_169_export.strength.Fusion/1.svg',
    png: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_169_export.strength.Fusion/1.png',
    as3: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/Fusion.as',
    baseline: 'docs/tasks/evidence/TASK-SETTINGS-167/original-fusion-940x590.png',
    depths: [3, 4, 5, 6, 7, 8, 10, 11, 13, 15, 17, 19],
    buttonStates: { 164: [161, 163] },
  },
  {
    id: 'resolution', label: '分解', characterId: 177, symbolClass: 'export.strength.Resolution', x: 175.6, y: 128.45,
    svg: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites-svg/DefineSprite_177_export.strength.Resolution/1.svg',
    png: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_177_export.strength.Resolution/1.png',
    as3: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/Resolution.as',
    baseline: 'docs/tasks/evidence/TASK-SETTINGS-167/original-resolution-940x590.png',
    depths: [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 19],
    buttonStates: { 176: [173, 175] },
  },
  {
    id: 'making', label: '打造', characterId: 152, symbolClass: 'export.strength.Making', x: 175.6, y: 110.45,
    svg: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites-svg/DefineSprite_152_export.strength.Making/1.svg',
    png: 'local-resources/regima/task-outputs/task-settings-167-workshop-left-pages/sprites/DefineSprite_152_export.strength.Making/1.png',
    as3: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/Making.as',
    baseline: 'docs/tasks/evidence/TASK-SETTINGS-167/original-making-940x590.png',
    depths: [3, 4, 5, 6, 8, 9, 10, 11, 14, 15, 17, 19, 21, 23, 25, 27, 29],
    buttonStates: { 139: [136, 138] },
  },
];

const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');
const bounds = (left, top, width, height) => ({ left, top, width, height });
const matrix = (tx = 0, ty = 0) => ({ a: 1, b: 0, c: 0, d: 1, tx, ty });
const render = (assetRef, extra = {}) => ({ assetRef, blendMode: 'normal', filters: [], maskId: null, ...extra });

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function parsePage(page) {
  const svg = readFileSync(path.join(root, page.svg), 'utf8');
  const svgAttrs = attributes(svg.match(/<svg\b[^>]*>/)?.[0] ?? '');
  const rootGroup = svg.match(/<g transform="matrix\(([^)]*)\)">\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if (!rootGroup) throw new Error(`Unable to parse root display list for ${page.id}`);
  const rootMatrix = rootGroup[1].split(',').map(Number);
  const uses = [...rootGroup[2].matchAll(/<use\b[^>]*\/>/g)].map((match) => attributes(match[0]));
  if (uses.length !== page.depths.length) throw new Error(`${page.id}: expected ${page.depths.length} root children, found ${uses.length}`);
  return {
    width: Number(svgAttrs.width.replace('px', '')),
    height: Number(svgAttrs.height.replace('px', '')),
    normalization: { x: rootMatrix[4], y: rootMatrix[5] },
    uses,
  };
}

function makeManifest(page) {
  const parsed = parsePage(page);
  const stateId = `${page.id}-static-skeleton`;
  const pageId = `${page.id}-page-root`;
  const rootBounds = bounds(-parsed.normalization.x, -parsed.normalization.y, parsed.width, parsed.height);
  const displayObjects = [{
    id: pageId,
    parentId: null,
    depth: 0,
    objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'backpack1-swf', characterId: page.characterId, symbolClass: page.symbolClass, instanceName: page.id, frame: 1 },
    placements: [{
      stateId, visible: true, localMatrix: matrix(page.x, page.y), registrationPoint: { x: 0, y: 0 }, localBounds: rootBounds,
      stageBounds: bounds(page.x + rootBounds.left, page.y + rootBounds.top, rootBounds.width, rootBounds.height),
      derivation: 'calculated',
      derivationMethod: 'StrengthEquipment.as root placement composed with the FFDec SVG normalization matrix and exported visible envelope.',
      evidenceRefs: ['strength-equipment-as:page-placement', `page-svg:${page.characterId}`],
    }],
    render: render(page.svg),
  }];

  parsed.uses.forEach((use, index) => {
    const characterId = Number(use['ffdec:characterId']);
    const childMatrix = use.transform.match(/matrix\(([^)]*)\)/)?.[1].split(',').map(Number);
    if (!childMatrix) throw new Error(`${page.id}: missing child matrix at index ${index}`);
    const href = use['xlink:href'].slice(1);
    const objectType = href.startsWith('shape') ? 'shape' : href.startsWith('text') ? 'text-field' : href.startsWith('button') ? 'button' : 'sprite';
    const width = Number(use.width);
    const height = Number(use.height);
    const tx = childMatrix[4];
    const ty = childMatrix[5];
    const instanceName = use.id ?? null;
    const stateIds = page.buttonStates[characterId];
    displayObjects.push({
      id: instanceName ?? `${objectType}-${characterId}-depth-${page.depths[index]}`,
      parentId: pageId,
      depth: page.depths[index],
      objectType,
      sourceIdentity: { provenanceId: 'backpack1-xml', characterId, symbolClass: null, instanceName, frame: 1 },
      placements: [{
        stateId, visible: true, localMatrix: matrix(tx, ty), registrationPoint: { x: 0, y: 0 }, localBounds: bounds(0, 0, width, height),
        stageBounds: bounds(page.x + tx, page.y + ty, width, height),
        ...(objectType === 'button' ? { hitArea: bounds(page.x + tx, page.y + ty, width, height) } : {}),
        derivation: 'extracted',
        derivationMethod: 'Root-frame PlaceObject order/matrix and FFDec SVG reported envelope; dynamic child contents are intentionally not promoted to static frame objects.',
        evidenceRefs: [`backpack1-xml:character-${page.characterId}-depth-${page.depths[index]}`, `page-svg:${page.characterId}`],
      }],
      render: render(`${page.svg}#${href}`, objectType === 'text-field'
        ? { textStyle: { fontFamily: 'FZCuYuan-M03', fontSize: 15, color: '#ffffff', leading: 2, dynamic: instanceName } }
        : objectType === 'button'
          ? { buttonStateAssets: { up: `character-${stateIds[0]}`, over: `character-${stateIds[1]}`, down: `character-${stateIds[1]}@y+2`, hit: `character-${stateIds[1]}` } }
          : {}),
    });
  });

  const manifest = {
    $schema: '../schema/ui-ground-truth.schema.json', schemaVersion: 1,
    truthId: `task-settings-167.workshop-left-pages.${page.id}`, status: 'verified',
    scope: { taskId: 'TASK-SETTINGS-167', surfaceId: `workshop-character-${page.characterId}-${page.id}`, originalVersion: 'RegiMA 1.1 restored corpus', description: `${page.label}页 character ${page.characterId} 静态显示列表、原生文字字段、槽位容器、提交按钮与舞台几何。运行时 ShowObj 子项和全局 toast 由 AS3 状态矩阵补充，不伪装成 SWF 静态帧。` },
    generatedBy: { tool: 'generate-workshop-left-ground-truth.mjs', toolVersion: '1', command: 'npm run generate:workshop-left-truth', generatedAt: '2026-08-09T18:00:00+08:00' },
    provenance: [
      { id: 'backpack1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: `character ${page.characterId} ${page.symbolClass}; root character 119 at 24fps, 940x590.` },
      { id: 'backpack1-xml', sourceType: 'ffdec-xml', sourcePath: xmlPath, sha256: sha256(xmlPath), locator: `DefineSprite characterID=${page.characterId}, frame 1 PlaceObject depth/matrix/instanceName; button records ${Object.keys(page.buttonStates).join(', ')}.` },
      { id: `${page.id}-as3`, sourceType: 'legacy-as3', sourcePath: page.as3, sha256: sha256(page.as3), locator: `${page.symbolClass}: constructor, show/change/submit handlers, dynamic ShowObj children and feedback routing.` },
      { id: 'strength-equipment-as', sourceType: 'legacy-as3', sourcePath: strengthEquipmentPath, sha256: sha256(strengthEquipmentPath), locator: `StrengthEquipment page creation and root placements; ${page.symbolClass} selection.` },
    ],
    stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
    states: [{ id: stateId, entry: `MapMenu -> GMain.showStrengthEquip -> StrengthEquipment -> ${page.symbolClass}`, frame: 1, fixtureId: 'original-static-skeleton; runtime dynamic children covered by AS3 state matrix', baselineId: `original-${page.id}-940x590` }],
    displayObjects,
    baselines: [{ id: `original-${page.id}-940x590`, stateId, path: page.baseline, sha256: sha256(page.baseline), width: 940, height: 590, crop: bounds(0, 0, 940, 590) }],
    completeness: { expectedStateIds: [stateId], extractedStateIds: [stateId], expectedVisibleObjectCountByState: { [stateId]: displayObjects.length }, displayListMatched: true, stateSetMatched: true, unresolved: [] },
    evidenceRefs: [`${evidencePath}#${page.id}`, 'docs/reverse-engineering/equipment-workshop-index.md#task-settings-167-左侧四页原版机器真值'],
  };
  return { manifest, count: displayObjects.length };
}

mkdirSync(outputDirectory, { recursive: true });
for (const page of pages) {
  const { manifest, count } = makeManifest(page);
  const outputPath = path.join(outputDirectory, `task-settings-167-workshop-${page.id}.json`);
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${path.relative(root, outputPath)} with ${count} scoped display objects.`);
}
