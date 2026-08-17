import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(
  root,
  'docs/reverse-engineering/ground-truth/manifests/task-slice-165d-workshop-inventory.json',
);
const swfPath = 'local-resources/regima/source/restored-swfs/assets/backpack1.swf';
const as3Path = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/StrengthEquipment.as';
const baselinePath = 'local-resources/regima/task-outputs/task-slice-117-crafting-ui/backpack1/DefineSprite_119_export.strength.StrengthEquipment/1.png';

const sha256 = (relativePath) => createHash('sha256')
  .update(readFileSync(path.join(root, relativePath)))
  .digest('hex');
const matrix = (tx = 0, ty = 0) => ({ a: 1, b: 0, c: 0, d: 1, tx, ty });
const bounds = (left, top, width, height) => ({ left, top, width, height });
const placement = (localMatrix, localBounds, stageBounds, evidenceRefs, hitArea) => ({
  stateId: 'inventory-grid-geometry',
  visible: true,
  localMatrix,
  registrationPoint: { x: 0, y: 0 },
  localBounds,
  stageBounds,
  ...(hitArea ? { hitArea } : {}),
  derivation: 'calculated',
  derivationMethod: 'Unit-scale parent translation composed with restored SWF/AS3 placement evidence.',
  evidenceRefs,
});
const render = (assetRef, buttonStateAssets) => ({
  assetRef,
  blendMode: 'normal',
  filters: [],
  maskId: null,
  ...(buttonStateAssets ? { buttonStateAssets } : {}),
});
const sourceIdentity = (characterId, symbolClass, instanceName, provenanceId = 'backpack1-swf') => ({
  provenanceId,
  characterId,
  symbolClass,
  instanceName,
  frame: 1,
});

const inventoryRoot = { x: 512.8, y: 130 };
const statePlacement = (tx, ty, width, height, evidenceRefs, hitArea) => placement(
  matrix(tx, ty),
  bounds(0, 0, width, height),
  bounds(inventoryRoot.x + tx, inventoryRoot.y + ty, width, height),
  evidenceRefs,
  hitArea,
);
const tabs = [
  ['equipment', 230, 0],
  ['items', 235, 74],
  ['fashion', 240, 148],
  ['skillBooks', 245, 222],
].map(([name, characterId, x], index) => ({
  id: `inventory-tab-${name}`,
  parentId: 'inventory-root',
  depth: index + 1,
  objectType: 'button',
  sourceIdentity: sourceIdentity(characterId, null, `btn-${name}`),
  placements: [statePlacement(x, 0, 73, 27, ['backpack1-swf:character-246', 'strength-equipment-as:addBackPackAgeMc'], bounds(inventoryRoot.x + x, inventoryRoot.y, 73, 27))],
  render: render(
    `public/assets/ui/inventory/native/${name}-up.png`,
    {
      up: `public/assets/ui/inventory/native/${name}-up.png`,
      over: `public/assets/ui/inventory/native/${name}-over.png`,
      down: `public/assets/ui/inventory/native/${name}-down.png`,
      selected: `public/assets/ui/inventory/native/${name}-down.png`,
    },
  ),
}));
const slots = Array.from({ length: 25 }, (_, index) => {
  const tx = (index % 5) * 61;
  const ty = 38 + Math.floor(index / 5) * 60;
  return {
    id: `inventory-slot-${String(index).padStart(2, '0')}`,
    parentId: 'inventory-root',
    depth: 25 - index,
    objectType: 'movie-clip',
    sourceIdentity: sourceIdentity(628, 'export.pack.PackThings', null),
    placements: [statePlacement(tx, ty, 50, 51, ['backpack1-swf:character-628', 'backpack-element-as:drawgz'], bounds(inventoryRoot.x + tx, inventoryRoot.y + ty, 50, 51))],
    render: render('public/assets/ui/inventory/native/pack-slot.png'),
  };
});

const displayObjects = [
  {
    id: 'workshop-root',
    parentId: null,
    depth: 0,
    objectType: 'movie-clip',
    sourceIdentity: sourceIdentity(119, 'export.strength.StrengthEquipment', null),
    placements: [placement(matrix(), bounds(0, 0, 940, 593.45), bounds(0, 0, 940, 590), ['backpack1-swf:character-119'])],
    render: render(baselinePath),
  },
  {
    id: 'inventory-root',
    parentId: 'workshop-root',
    depth: 1,
    objectType: 'container',
    sourceIdentity: sourceIdentity(246, 'export.pack.BackPackElement', 'backpackagemc'),
    placements: [placement(matrix(inventoryRoot.x, inventoryRoot.y), bounds(0, 0, 295, 329), bounds(inventoryRoot.x, inventoryRoot.y, 295, 329), ['strength-equipment-as:addBackPackAgeMc', 'backpack1-swf:character-246'])],
    render: render(null),
  },
  ...tabs,
  ...slots,
  {
    id: 'inventory-page-value',
    parentId: 'workshop-root',
    depth: 23,
    objectType: 'text-field',
    sourceIdentity: sourceIdentity(117, null, 'nowpage'),
    placements: [placement(matrix(694.65, 471.95), bounds(0, 0, 15.25, 23.25), bounds(694.65, 471.95, 15.25, 23.25), ['backpack1-swf:character-119', 'strength-equipment-as:page-controls'])],
    render: { ...render(null), textStyle: { fontFamily: 'FZCuYuan-M03', color: '#ffffff', dynamic: 'currentPage' } },
  },
  {
    id: 'inventory-page-suffix',
    parentId: 'workshop-root',
    depth: 25,
    objectType: 'text-field',
    sourceIdentity: sourceIdentity(118, null, null),
    placements: [placement(matrix(704.7, 471.95), bounds(0, 0, 24.15, 23.25), bounds(704.7, 471.95, 24.15, 23.25), ['backpack1-swf:character-119', 'backpack1-swf:character-118'])],
    render: { ...render(null), textStyle: { fontFamily: 'FZCuYuan-M03', color: '#ffffff', staticText: '/5' } },
  },
  {
    id: 'inventory-page-previous',
    parentId: 'workshop-root',
    depth: 27,
    objectType: 'button',
    sourceIdentity: sourceIdentity(78, null, 'prePage'),
    placements: [placement(matrix(608.65, 465.55), bounds(0, 0, 86, 34), bounds(608.65, 465.55, 86, 34), ['backpack1-swf:character-119', 'strength-equipment-as:page-controls'], bounds(608.65, 465.55, 86, 34))],
    render: render('public/assets/ui/inventory/native/previous-up.png'),
  },
  {
    id: 'inventory-page-next',
    parentId: 'workshop-root',
    depth: 24,
    objectType: 'button',
    sourceIdentity: sourceIdentity(83, null, 'nextPage'),
    placements: [placement(matrix(726.85, 465.55), bounds(0, 0, 86, 34), bounds(726.85, 465.55, 86, 34), ['backpack1-swf:character-119', 'strength-equipment-as:page-controls'], bounds(726.85, 465.55, 86, 34))],
    render: render('public/assets/ui/inventory/native/next-up.png'),
  },
];

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-slice-165d.workshop-inventory',
  status: 'verified',
  scope: {
    taskId: 'TASK-SLICE-165D',
    surfaceId: 'workshop-character-119-inventory-subtree',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Character 119 right-side BackPackElement geometry, native category controls, 25 PackThings cells, and page controls. Runtime item identities remain owner data rather than original visual truth.',
  },
  generatedBy: {
    tool: 'generate-workshop-inventory-ground-truth.mjs',
    toolVersion: '2',
    command: 'npm run generate:workshop-inventory-truth',
    generatedAt: '2026-08-17T00:00:00+08:00',
  },
  provenance: [
    {
      id: 'backpack1-swf',
      sourceType: 'restored-swf',
      sourcePath: swfPath,
      sha256: sha256(swfPath),
      locator: 'SWF 940x590 @24fps; character 119 StrengthEquipment; dynamic character 246 BackPackElement; character 628 PackThings; page suffix character 118; button characters 230/235/240/245/78/83.',
    },
    {
      id: 'strength-equipment-as',
      sourceType: 'legacy-as3',
      sourcePath: as3Path,
      sha256: sha256(as3Path),
      locator: 'StrengthEquipment.as:198-241 page refresh and addBackPackAgeMc; BackPackElement.as:1-180 category/page/grid lifecycle cross-check.',
    },
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states: [{
    id: 'inventory-grid-geometry',
    entry: 'MapMenu -> GMain.showStrengthEquip -> StrengthEquipment.addBackPackAgeMc',
    frame: 1,
    fixtureId: 'geometry-only; runtime inventory contents excluded',
    baselineId: 'original-character-119-static',
  }],
  displayObjects,
  baselines: [{
    id: 'original-character-119-static',
    stateId: 'inventory-grid-geometry',
    path: baselinePath,
    sha256: sha256(baselinePath),
    width: 940,
    height: 594,
    crop: bounds(0, 0, 940, 590),
  }],
  completeness: {
    expectedStateIds: ['inventory-grid-geometry'],
    extractedStateIds: ['inventory-grid-geometry'],
    expectedVisibleObjectCountByState: { 'inventory-grid-geometry': displayObjects.length },
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: [
    'docs/reverse-engineering/crafting-ui-index.md:67-85',
    'docs/reverse-engineering/equipment-workshop-index.md:31-64',
    'docs/reverse-engineering/evidence/TASK-SETTINGS-165B-backpack-review.md:55-82',
  ],
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${path.relative(root, outputPath)} with ${displayObjects.length} scoped display objects.`);
