import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(root, 'docs/reverse-engineering/ground-truth/manifests/task-settings-170b1-equipment-page.json');
const swfPath = 'local-resources/regima/source/restored-swfs/assets/backpack1.swf';
const backPackAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/BackPack.as';
const elementAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/BackPackElement.as';
const packThingsAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/PackThings.as';
const headSpriteAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/HeadSprite.as';
const showObjAs = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pack/ShowObj.as';
const baselinePath = 'docs/tasks/evidence/TASK-SETTINGS-165B/original-static-304-940x590.png';

const states = [
  ['p1-empty-page-1', 'P1 opens equipment category page 1 with no equipped items', 'owner=p1; category=equipment; page=1; equipped=none'],
  ['p1-equipped-page-1', 'P1 opens equipment category page 1 with all six slots populated', 'owner=p1; category=equipment; page=1; equipped=all'],
  ['p2-equipped-page-1', 'P2 opens equipment category page 1 with independent equipped items', 'owner=p2; category=equipment; page=1; equipped=all'],
  ['p1-equipment-page-2', 'P1 advances the equipment category to page 2', 'owner=p1; category=equipment; page=2'],
  ['p1-equipment-selected', 'P1 selects an equipment instance and opens threebtn', 'owner=p1; category=equipment; selected=equipment'],
  ['p1-item-selected', 'P1 selects a stack item and opens simplebtn', 'owner=p1; category=items; selected=item'],
  ['p1-fashion-hidden', 'P1 hides equipped fashion while retaining the slot item', 'owner=p1; category=fashion; showsz=false'],
  ['p1-fashion-shown', 'P1 shows equipped fashion', 'owner=p1; category=fashion; showsz=true'],
  ['page-closing', 'BackPack removes listeners and all dynamic children on close', 'owner=p1; lifecycle=removed'],
].map(([id, entry, fixtureId]) => ({ id, entry, frame: 1, fixtureId, baselineId: `original-root-${id}` }));
const stateIds = states.map(({ id }) => id);

const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');
const matrix = (tx = 0, ty = 0) => ({ a: 1, b: 0, c: 0, d: 1, tx, ty });
const bounds = (left, top, width, height) => ({ left, top, width, height });
const render = (assetRef = null, textStyle = undefined, buttonStateAssets = undefined) => ({
  assetRef,
  blendMode: 'normal',
  filters: [],
  maskId: null,
  ...(textStyle ? { textStyle } : {}),
  ...(buttonStateAssets ? { buttonStateAssets } : {}),
});
const sourceIdentity = (characterId, symbolClass, instanceName, frame = 1) => ({
  provenanceId: 'backpack1-swf', characterId, symbolClass, instanceName, frame,
});
const placement = (stateId, x, y, width, height, evidenceRefs, visible = true, derivation = 'extracted', hitArea) => ({
  stateId,
  visible,
  localMatrix: matrix(x, y),
  registrationPoint: { x: 0, y: 0 },
  localBounds: bounds(0, 0, width, height),
  stageBounds: bounds(x, y, width, height),
  ...(hitArea ? { hitArea: bounds(x, y, width, height) } : {}),
  derivation,
  ...(derivation === 'calculated' ? { derivationMethod: 'Parent translation composed with restored SWF placement and AS3 dynamic-child coordinates.' } : {}),
  evidenceRefs,
});
const allStates = (x, y, width, height, refs, options = {}) => stateIds.map((stateId) => placement(
  stateId, x, y, width, height, refs, options.visible ? options.visible(stateId) : true, options.derivation ?? 'extracted', options.hitArea,
));
const nestedPlacement = (stateId, localX, localY, stageX, stageY, width, height, evidenceRefs, visible = true, hitArea) => ({
  ...placement(stateId, stageX, stageY, width, height, evidenceRefs, visible, 'calculated', hitArea),
  localMatrix: matrix(localX, localY),
});
const allNestedStates = (localX, localY, stageX, stageY, width, height, refs, options = {}) => stateIds.map((stateId) => nestedPlacement(
  stateId, localX, localY, stageX, stageY, width, height, refs, options.visible ? options.visible(stateId) : true, options.hitArea,
));
const object = (id, parentId, depth, objectType, identity, placements, assetRef = null, extraRender = {}) => ({
  id, parentId, depth, objectType, sourceIdentity: identity, placements, render: { ...render(assetRef), ...extraRender },
});

const rootObjects = [
  object('equipment-page-root', null, 0, 'movie-clip', sourceIdentity(304, 'export.pack.BackPack', null), allStates(0, 0, 940, 590, ['backpack1-swf:character-304']), baselinePath),
  object('close', 'equipment-page-root', 31, 'button', sourceIdentity(31, null, 'btn_close'), allStates(809.5, 59.85, 42, 42, ['backpack1-swf:character-304/depth-31', 'backpack-as:lifecycle'], { hitArea: true }), 'public/assets/ui/inventory/native/close-up.png', { buttonStateAssets: { up: 'public/assets/ui/inventory/native/close-up.png', over: 'public/assets/ui/inventory/native/close-over.png', down: 'public/assets/ui/inventory/native/close-down.png' } }),
  object('inventory-root', 'equipment-page-root', 246, 'container', sourceIdentity(246, 'export.pack.BackPackElement', 'bpe'), allStates(516.2, 114.35, 295, 329, ['backpack1-swf:character-304/depth-bpe', 'backpack-element-as:drawgz'], { visible: (s) => s !== 'page-closing' }), null),
  object('previous-page', 'equipment-page-root', 78, 'button', sourceIdentity(78, null, 'prePage'), allStates(609, 472.45, 86, 34, ['backpack1-swf:character-304', 'backpack-as:page-controls'], { hitArea: true }), 'public/assets/ui/inventory/native/previous-up.png'),
  object('next-page', 'equipment-page-root', 83, 'button', sourceIdentity(83, null, 'nextPage'), allStates(727.2, 472.45, 86, 34, ['backpack1-swf:character-304', 'backpack-as:page-controls'], { hitArea: true }), 'public/assets/ui/inventory/native/next-up.png'),
];

const textStyle = { fontFamily: 'original embedded/runtime TextField', color: '#ffffff', dynamic: true };
const dynamicFields = [
  ['page-value', 204, 'nowpage', 695, 478.85, 42, 24, 'category page and /5'],
  ['experience-value', 211, 'txt_exp', 237.45, 482.05, 150, 24, 'current/required or MAX'],
  ['soul-value', 214, 'txt_lh', 664.7, 450.5, 100, 24, 'owner soul'],
  ['hero-name', 277, 'txt_name', 237.45, 120.6, 145, 24, 'owner/hero name'],
  ['fighting-force', 278, 'txt_zdl', 234.45, 146.35, 150, 24, 'computed fighting force'],
  ['hp', 250, 'txt_hp', 214.5, 313.6, 145, 24, 'current / maximum HP'],
  ['attack', 251, 'txt_att', 215.25, 347, 100, 24, 'effective attack'],
  ['critical', 252, 'txt_baoji', 213.5, 414.1, 100, 24, 'critical percent'],
  ['hp-regen', 253, 'txt_hx', 215.1, 447.5, 100, 24, 'HP regeneration'],
  ['mp-regen', 254, 'txt_hl', 377.3, 447.05, 100, 24, 'MP regeneration'],
  ['evasion', 255, 'txt_sb', 376.1, 414.55, 100, 24, 'evasion percent'],
  ['defense', 256, 'txt_def', 378.25, 347, 100, 24, 'effective defense'],
  ['mp', 257, 'txt_mp', 378.3, 313.55, 145, 24, 'current / maximum MP'],
  ['luck', 269, 'txt_luck', 213.5, 381, 100, 24, 'deep-hit/luck percent'],
  ['magic-defense', 270, 'txt_mdef', 377.5, 381, 100, 24, 'magic defense percent'],
].map(([id, characterId, instanceName, x, y, width, height, dynamic]) => object(
  id, 'equipment-page-root', characterId, 'text-field', sourceIdentity(characterId, null, instanceName),
  allStates(x, y, width, height, ['backpack1-swf:character-304', `backpack-as:setInfoTxt:${dynamic}`], { visible: (s) => s !== 'page-closing' }),
  null, { textStyle: { ...textStyle, dynamic } },
));

const heroObjects = [
  object('experience-progress', 'equipment-page-root', 210, 'movie-clip', sourceIdentity(210, 'updataFBWithLvdyl', 'mc_exp'), allStates(311.6, 489.95, 452, 20, ['backpack1-swf:character-210', 'backpack-as:setInfoTxt:experience-frame'], { visible: (s) => s !== 'page-closing' }), 'public/assets/ui/inventory/native/exp-frame-30.png'),
  object('level-container', 'equipment-page-root', 219, 'container', sourceIdentity(219, null, 'levelSit'), allStates(378.95, 105.85, 83, 59, ['backpack1-swf:character-219', 'backpack-as:leveImage'], { visible: (s) => s !== 'page-closing' }), 'public/assets/ui/inventory/native/level-plate.png'),
  object('sell-white', 'equipment-page-root', 222, 'button', sourceIdentity(222, null, 'sellwhite'), allStates(747.5, 445.5, 62, 28, ['backpack1-swf:character-222', 'backpack-as:deleteWhiteEquipment'], { visible: (s) => s !== 'page-closing', hitArea: true }), 'public/assets/ui/inventory/native/sell-white-up.png'),
  object('hero-preview', 'equipment-page-root', 276, 'container', sourceIdentity(276, null, 'headSit'), allStates(280.25, 235.85, 300, 290, ['backpack1-swf:character-304', 'backpack-as:added:new HeadSprite', 'head-sprite-as:initBBC'], { visible: (s) => s !== 'page-closing', derivation: 'calculated' }), null),
];

const equippedVisible = (stateId) => ['p1-equipped-page-1', 'p2-equipped-page-1', 'p1-fashion-hidden', 'p1-fashion-shown'].includes(stateId);
const equipmentSlots = [
  ['magic-weapon-slot', 281, 'zbfb', 433.05, 241.65],
  ['armor-slot', 284, 'zbfj', 362.05, 241.65],
  ['accessory-slot', 287, 'zbsp', 433.05, 166.65],
  ['weapon-slot', 290, 'zbwq', 362.05, 166.65],
  ['title-slot', 300, 'zbtx', 164.4, 244.9],
  ['fashion-slot', 303, 'zbsz', 168.05, 166.65],
].map(([id, characterId, instanceName, x, y]) => object(
  id, 'equipment-page-root', characterId, 'container', sourceIdentity(characterId, null, instanceName),
  allStates(x, y - 2, 50, 51, ['backpack1-swf:character-304', 'backpack-as:curequip', 'show-obj-as:constructor'], { visible: equippedVisible, derivation: 'calculated' }), null,
));

const fashionToggles = [
  object('fashion-toggle-hidden', 'equipment-page-root', 297, 'movie-clip', sourceIdentity(297, null, 'showszmc', 1), allStates(168.05, 218.85, 49, 18, ['backpack1-swf:character-297/frame-1', 'backpack-as:changeShowFashionMc'], { visible: (s) => s === 'p1-fashion-hidden' }), 'public/assets/ui/inventory/native/fashion-toggle-hidden.png'),
  object('fashion-toggle-shown', 'equipment-page-root', 298, 'movie-clip', sourceIdentity(297, null, 'showszmc', 2), allStates(168.05, 218.85, 49, 18, ['backpack1-swf:character-297/frame-2', 'backpack-as:changeShowFashionMc'], { visible: (s) => s !== 'p1-fashion-hidden' && s !== 'page-closing' }), 'public/assets/ui/inventory/native/fashion-toggle-shown.png'),
];

const tabs = [
  ['equipment', 230, 0], ['items', 235, 74], ['fashion', 240, 148], ['skillBooks', 245, 222],
].map(([name, characterId, x], index) => object(
  `tab-${name}`, 'inventory-root', index + 1, 'button', sourceIdentity(characterId, null, `btn_${name}`),
  allNestedStates(x, 0, 516.2 + x, 114.35, 73, 27, ['backpack1-swf:character-246', 'backpack-element-as:category-buttons'], { visible: (s) => s !== 'page-closing', hitArea: true }),
  `public/assets/ui/inventory/native/${name}-up.png`, { buttonStateAssets: { up: `public/assets/ui/inventory/native/${name}-up.png`, over: `public/assets/ui/inventory/native/${name}-over.png`, down: `public/assets/ui/inventory/native/${name}-down.png`, selected: `public/assets/ui/inventory/native/${name}-down.png` } },
));
const slots = Array.from({ length: 25 }, (_, index) => {
  const x = 516.2 + (index % 5) * 61;
  const y = 152.35 + Math.floor(index / 5) * 60;
  return object(`inventory-slot-${String(index).padStart(2, '0')}`, 'inventory-root', 25 - index, 'movie-clip', sourceIdentity(628, 'export.pack.PackThings', null), allNestedStates((index % 5) * 61, 38 + Math.floor(index / 5) * 60, x, y, 50, 51, ['backpack1-swf:character-628', 'backpack-element-as:drawgz'], { visible: (s) => s !== 'page-closing', hitArea: true }), 'public/assets/ui/inventory/native/pack-slot.png');
});
const operations = [
  object('equipment-operation-layer', 'inventory-slot-00', 610, 'movie-clip', sourceIdentity(610, 'threebtn', null), allNestedStates(25, 25, 541.2, 177.35, 87, 115, ['backpack1-swf:character-610', 'pack-things-as:equipment-selection'], { visible: (s) => s === 'p1-equipment-selected' }), 'public/assets/ui/inventory/native/operation-three-default.png'),
  object('item-operation-layer', 'inventory-slot-00', 358, 'movie-clip', sourceIdentity(358, 'simplebtn', null), allNestedStates(25, 25, 541.2, 177.35, 87, 117, ['backpack1-swf:character-358', 'pack-things-as:item-selection'], { visible: (s) => s === 'p1-item-selected' }), 'public/assets/ui/inventory/native/operation-simple-default.png'),
];

const displayObjects = [...rootObjects, ...dynamicFields, ...heroObjects, ...equipmentSlots, ...fashionToggles, ...tabs, ...slots, ...operations];
const expectedCounts = Object.fromEntries(stateIds.map((stateId) => [stateId, displayObjects.filter((item) => item.placements.find((entry) => entry.stateId === stateId)?.visible).length]));
const baselines = states.map(({ id }) => ({ id: `original-root-${id}`, stateId: id, path: baselinePath, sha256: sha256(baselinePath), width: 940, height: 590, crop: bounds(0, 0, 940, 590) }));

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json', schemaVersion: 1,
  truthId: 'task-settings-170b1.equipment-page', status: 'verified',
  scope: { taskId: 'TASK-SETTINGS-170B1', surfaceId: 'backpack-character-304-equipment-page', originalVersion: 'RegiMA 1.1 restored corpus', description: 'Formal BackPack character 304 display list, 246/628 inventory subtree, six equipped slots, HeadSprite preview, dynamic fields, selection layers, owner/fashion/page/lifecycle topology. Dynamic values are fixture-driven; the common source-rendered 304 baseline intentionally proves the stable root rather than inventing a runtime Flash screenshot.' },
  generatedBy: { tool: 'generate-equipment-page-ground-truth.mjs', toolVersion: '1', command: 'npm run generate:equipment-page-truth', generatedAt: '2026-08-09T20:00:00+08:00' },
  provenance: [
    { id: 'backpack1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: 'character 304 export.pack.BackPack; 246 BackPackElement; 628 PackThings; 358 simplebtn; 610 threebtn; 210 experience; 219 level; 222 sellwhite; 297 fashion toggle.' },
    { id: 'backpack-as', sourceType: 'legacy-as3', sourcePath: backPackAs, sha256: sha256(backPackAs), locator: 'BackPack.as setInfoTxt, added/removed, curequip, page/category/fashion lifecycle.' },
    { id: 'backpack-element-as', sourceType: 'legacy-as3', sourcePath: elementAs, sha256: sha256(elementAs), locator: 'BackPackElement.as four categories, five pages and 5x5 PackThings construction.' },
    { id: 'pack-things-as', sourceType: 'legacy-as3', sourcePath: packThingsAs, sha256: sha256(packThingsAs), locator: 'PackThings.as ShowObj/quantity and simplebtn/threebtn selection lifecycle.' },
    { id: 'head-sprite-as', sourceType: 'legacy-as3', sourcePath: headSpriteAs, sha256: sha256(headSpriteAs), locator: 'HeadSprite.as role/armor/weapon/title dynamic preview composition and registration offsets.' },
    { id: 'show-obj-as', sourceType: 'legacy-as3', sourcePath: showObjAs, sha256: sha256(showObjAs), locator: 'ShowObj.as icon aliases, curzb identity and hover AttributeCon lifecycle.' },
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states, displayObjects, baselines,
  completeness: { expectedStateIds: stateIds, extractedStateIds: stateIds, expectedVisibleObjectCountByState: expectedCounts, displayListMatched: true, stateSetMatched: true, unresolved: [] },
  evidenceRefs: [
    'docs/reverse-engineering/evidence/TASK-SETTINGS-170B1-equipment-page.md',
    'docs/reverse-engineering/evidence/TASK-SETTINGS-165B-backpack-review.md:31-126',
    'docs/tasks/evidence/TASK-SLICE-166B/visual-audit.md',
    'docs/tasks/evidence/TASK-SLICE-166C/visual-audit.md',
    'docs/tasks/evidence/TASK-SLICE-166D/visual-audit.md',
  ],
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${path.relative(root, outputPath)} with ${states.length} states and ${displayObjects.length} display objects.`);
