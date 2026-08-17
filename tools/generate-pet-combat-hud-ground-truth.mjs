import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/pet1.swf';
const xmlPath = 'local-resources/regima/task-outputs/task-settings-175a-pet-page/pet1.xml';
const svgPath = 'local-resources/regima/task-outputs/task-settings-191-pet-ui/svg/DefineSprite_662_export.pet.ShowPetInfo/1.svg';
const roleInfoPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/RoleInfo.as';
const showPetInfoPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/ShowPetInfo.as';
const petInterfacePath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetInterface.as';
const basePetPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-191-pet-combat-hud.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-191';
const command = 'npm run generate:pet-combat-hud-truth';

const states = [
  ['no-pet-p1', 'P1 RoleInfo created without an active pet', 'p1; findCurrentPet()=null'],
  ['active-full-p1', 'P1 active pet is created or selected', 'p1; monkey1 火丸; level=1; hp=840/840; mp=150/150'],
  ['active-hit-p1', 'P1 active pet is damaged and RoleInfo.step refreshes', 'p1; monkey1; hp=420/840; mp=150/150'],
  ['active-dead-p1', 'P1 active pet reaches zero HP while lifetime remains positive', 'p1; monkey1; hp=0/840; lifetime>0'],
  ['rested-p1', 'P1 PetInterface rests the active pet and dispatches CHANGECURRENTPET', 'p1; isFight=0'],
  ['no-pet-p2', 'P2 RoleInfo created without an active pet', 'p2; findCurrentPet()=null'],
  ['active-full-p2', 'P2 active pet is created or selected', 'p2; monkey1 火丸; level=1; hp=840/840; mp=150/150'],
  ['active-hit-p2', 'P2 active pet is damaged and RoleInfo.step refreshes', 'p2; monkey1; hp=420/840; mp=150/150'],
  ['active-dead-p2', 'P2 active pet reaches zero HP while lifetime remains positive', 'p2; monkey1; hp=0/840; lifetime>0'],
  ['rested-p2', 'P2 PetInterface rests the active pet and dispatches CHANGECURRENTPET', 'p2; isFight=0'],
];
const activeStates = states.map(([id]) => id).filter((id) => id.startsWith('active-'));
const p1States = activeStates.filter((id) => id.endsWith('-p1'));
const p2States = activeStates.filter((id) => id.endsWith('-p2'));

const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');
const round = (value) => Math.round(value * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => ({ a: round(a), b: round(b), c: round(c), d: round(d), tx: round(tx), ty: round(ty) });
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));

const svg = readFileSync(path.join(root, svgPath), 'utf8');
const rootGroup = svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/)?.[1];
if (!rootGroup) throw new Error('Unable to locate ShowPetInfo character 662 display list.');
const svgChildren = [...rootGroup.matchAll(/<use\b[^>]*\/>/g)].map((entry) => {
  const value = attrs(entry[0]);
  return { characterId: Number(value['ffdec:characterId']), instanceName: value.id ?? null };
});
const expectedChildren = [[605, null], [610, 'hpmc'], [614, 'mpmc'], [657, 'headmc'], [659, 'txtlevel'], [660, 'txtmp'], [661, 'txthp']];
if (JSON.stringify(svgChildren.map(({ characterId, instanceName }) => [characterId, instanceName])) !== JSON.stringify(expectedChildren)) {
  throw new Error(`ShowPetInfo SVG display-list mismatch: ${JSON.stringify(svgChildren)}`);
}

const xml = readFileSync(path.join(root, xmlPath), 'utf8');
const spriteMarker = '<item type="DefineSpriteTag" forceWriteAsLong="true" frameCount="1" hasEndTag="true" spriteId="662">';
const spriteStart = xml.indexOf(spriteMarker);
const spriteEnd = xml.indexOf('<item type="ShowFrameTag"', spriteStart);
if (spriteStart < 0 || spriteEnd < 0) throw new Error('Unable to locate character 662 in restored pet1 FFDec XML.');
const xmlChildren = [...xml.slice(spriteStart, spriteEnd).matchAll(/<item type="PlaceObject(?:2|3)Tag"([^>]*)>/g)].map((entry) => {
  const value = attrs(entry[1]);
  return { characterId: Number(value.characterId), instanceName: value.name ?? null, depth: Number(value.depth) };
});
if (JSON.stringify(xmlChildren.map(({ characterId, instanceName }) => [characterId, instanceName])) !== JSON.stringify(expectedChildren)) {
  throw new Error(`ShowPetInfo XML display-list mismatch: ${JSON.stringify(xmlChildren)}`);
}

const placement = (stateId, localMatrix, localBounds, stageBounds, evidenceRefs, extra = {}) => ({
  stateId, visible: true, localMatrix, registrationPoint: { x: 0, y: 0 }, localBounds, stageBounds,
  derivation: 'calculated',
  derivationMethod: 'Character 662 local PlaceObject geometry composed with RoleInfo.addPetHead y=94 and GameInfo P1/P2 parent transforms.',
  evidenceRefs, ...extra,
});
const render = (assetRef, extra = {}) => ({ assetRef, blendMode: 'normal', filters: [], maskId: null, ...extra });
const displayObjects = [];
function addObject({ id, parentId, depth, objectType, characterId, instanceName = null, sourceFrame = 1, p1StateSet = p1States, p2StateSet = p2States, p1Matrix, p1Bounds, p2Matrix, p2Bounds, localBounds, assetRef, extraRender = {} }) {
  displayObjects.push({
    id, parentId, depth, objectType,
    sourceIdentity: { provenanceId: 'pet1-swf', characterId, symbolClass: characterId === 662 ? 'export.pet.ShowPetInfo' : null, instanceName, frame: sourceFrame },
    placements: [
      ...p1StateSet.map((stateId) => placement(stateId, p1Matrix, localBounds, p1Bounds, [`pet1-swf:character-${characterId}`, 'role-info-as:addPetHead/step'])),
      ...p2StateSet.map((stateId) => placement(stateId, p2Matrix, localBounds, p2Bounds, [`pet1-swf:character-${characterId}`, 'role-info-as:setPos/addPetHead', 'show-pet-info-as:flipHorizontalTxt'])),
    ],
    render: render(assetRef, extraRender),
  });
}

addObject({ id: 'pet-combat-hud-root', parentId: null, depth: 65, objectType: 'movie-clip', characterId: 662,
  p1Matrix: matrix(1, 0, 0, 1, 0, 94), p1Bounds: bounds(-87.2, 64.45, 273.7, 93.6),
  p2Matrix: matrix(-1, 0, 0, 1, 920, 94), p2Bounds: bounds(733.5, 64.45, 273.7, 93.6),
  localBounds: bounds(-87.2, -29.55, 273.7, 93.6), assetRef: svgPath });
addObject({ id: 'pet-combat-hud-root.shell', parentId: 'pet-combat-hud-root', depth: 1, objectType: 'shape', characterId: 605,
  p1Matrix: matrix(1, 0, 0, 1, 0, 94), p1Bounds: bounds(0, 94, 178, 56),
  p2Matrix: matrix(-1, 0, 0, 1, 920, 94), p2Bounds: bounds(742, 94, 178, 56),
  localBounds: bounds(0, 0, 178, 56), assetRef: `${svgPath}#shape0` });
for (const [suffix, sourceFrame, stateToken] of [['full', 1, 'full'], ['hit', 12, 'hit'], ['dead', 25, 'dead']]) {
  addObject({ id: `pet-combat-hud-root.hpmc-${suffix}`, parentId: 'pet-combat-hud-root', depth: 2, objectType: 'movie-clip', characterId: 610, instanceName: 'hpmc', sourceFrame,
    p1StateSet: p1States.filter((stateId) => stateId.includes(stateToken)), p2StateSet: p2States.filter((stateId) => stateId.includes(stateToken)),
    p1Matrix: matrix(0.84, 0, 0, 0.84, 118.3, 109.35), p1Bounds: bounds(45.43, 96.263, 141.12, 24.662),
    p2Matrix: matrix(-0.84, 0, 0, 0.84, 801.7, 109.35), p2Bounds: bounds(733.45, 96.263, 141.12, 24.662),
    localBounds: bounds(-86.75, -15.58, 168, 29.36), assetRef: `${svgPath}#sprite0-frame-${sourceFrame}` });
}
addObject({ id: 'pet-combat-hud-root.mpmc', parentId: 'pet-combat-hud-root', depth: 7, objectType: 'movie-clip', characterId: 614, instanceName: 'mpmc',
  p1Matrix: matrix(0.84, 0, 0, 0.84, 117, 125), p1Bounds: bounds(56.352, 116.138, 126.84, 18.48),
  p2Matrix: matrix(-0.84, 0, 0, 0.84, 803, 125), p2Bounds: bounds(736.808, 116.138, 126.84, 18.48),
  localBounds: bounds(-72.2, -10.55, 151, 22), assetRef: `${svgPath}#sprite1` });
addObject({ id: 'pet-combat-hud-root.headmc', parentId: 'pet-combat-hud-root', depth: 12, objectType: 'movie-clip', characterId: 657, instanceName: 'headmc',
  p1Matrix: matrix(1, 0, 0, 1, 7.8, 82.7), p1Bounds: bounds(7.8, 82.7, 104.8, 93.6),
  p2Matrix: matrix(-1, 0, 0, 1, 912.2, 82.7), p2Bounds: bounds(807.4, 82.7, 104.8, 93.6),
  localBounds: bounds(0, 0, 104.8, 93.6), assetRef: `${svgPath}#sprite2`, sourceFrame: null,
  extraRender: { filters: [{ type: 'glow', color: '#000000', blurX: 4, blurY: 4, strength: 3 }] } });

const textStyle = (source) => ({ fontFamily: 'FZCuYuan-M03', fontSize: 12, color: '#ffffff', dynamic: true, source });
addObject({ id: 'pet-combat-hud-root.txtlevel', parentId: 'pet-combat-hud-root', depth: 26, objectType: 'text-field', characterId: 659, instanceName: 'txtlevel',
  p1Matrix: matrix(1, 0, 0, 1, 5.5, 130.55), p1Bounds: bounds(5.5, 130.55, 19.5, 18.1),
  p2Matrix: matrix(1, 0, 0, 1, 895, 130.55), p2Bounds: bounds(895, 130.55, 19.5, 18.1),
  localBounds: bounds(0, 0, 19.5, 18.1), assetRef: `${svgPath}#text0`, extraRender: { textStyle: textStyle('PetInfo.getLevel()') } });
addObject({ id: 'pet-combat-hud-root.txtmp', parentId: 'pet-combat-hud-root', depth: 27, objectType: 'text-field', characterId: 660, instanceName: 'txtmp',
  p1Matrix: matrix(1, 0, 0, 1, 79, 118.15), p1Bounds: bounds(79, 118.15, 72, 16),
  p2Matrix: matrix(1, 0, 0, 1, 780, 118.15), p2Bounds: bounds(780, 118.15, 72, 16),
  localBounds: bounds(0, 0, 72, 16), assetRef: `${svgPath}#text1`, extraRender: { textStyle: textStyle('PetInfo.getMp()/getSMp()') } });
addObject({ id: 'pet-combat-hud-root.txthp', parentId: 'pet-combat-hud-root', depth: 28, objectType: 'text-field', characterId: 661, instanceName: 'txthp',
  p1Matrix: matrix(1, 0, 0, 1, 78, 101.5), p1Bounds: bounds(78, 101.5, 74, 16),
  p2Matrix: matrix(1, 0, 0, 1, 780, 101.5), p2Bounds: bounds(780, 101.5, 74, 16),
  localBounds: bounds(0, 0, 74, 16), assetRef: `${svgPath}#text2`, extraRender: { textStyle: textStyle('PetInfo.getHp()/getSHp()') } });

const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((item) => item.stateId === stateId)).length;
const baselines = states.map(([stateId]) => {
  const relativePath = `${baselineRoot}/original-${stateId}-940x590.png`;
  return { id: `original-${stateId}-940x590`, stateId, path: relativePath, sha256: sha256(relativePath), width: 940, height: 590, crop: bounds(0, 0, 940, 590) };
});
const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json', schemaVersion: 1,
  truthId: 'task-settings-191.pet-combat-hud', status: 'verified',
  scope: { taskId: 'TASK-SETTINGS-191', surfaceId: 'role-info-dynamic-show-pet-info-character-662', originalVersion: 'RegiMA 1.1 restored corpus', description: 'The independent battle pet HUD dynamically added above RoleInfo: character 662 shell, current pet head, level, HP/MP bars and texts. The separate character 573 pet-page button is outside this scope and remains covered by task-settings-175c.stage-feature-host.' },
  generatedBy: { tool: 'generate-pet-combat-hud-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-08-17T22:30:00+08:00' },
  provenance: [
    { id: 'pet1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: 'character 662 export.pet.ShowPetInfo frame 1; children 605/610/614/657/659/660/661; 610 and 614 each 25 frames; FFDec 26 selective SVG/PNG export.' },
    { id: 'pet1-ffdec-xml', sourceType: 'ffdec-xml', sourcePath: xmlPath, sha256: sha256(xmlPath), locator: 'DefineSprite 662 first-frame PlaceObject depths, matrices, instance names and headmc filter.' },
    { id: 'role-info-as', sourceType: 'legacy-as3', sourcePath: roleInfoPath, sha256: sha256(roleInfoPath), locator: 'added/addPetHead/removePetHead/changeCurPet/step/setPos: dynamic addChild at y=94, P2 parent mirror, per-frame show().' },
    { id: 'show-pet-info-as', sourceType: 'legacy-as3', sourcePath: showPetInfoPath, sha256: sha256(showPetInfoPath), locator: 'show/flipHorizontalTxt: head label, level, HP/MP text and 25-frame formulas; P2 text readability transforms.' },
    { id: 'pet-interface-as', sourceType: 'legacy-as3', sourcePath: petInterfacePath, sha256: sha256(petInterfacePath), locator: 'fightClick/restClick/okClick/sendHeroRefreshPet dispatch CHANGECURRENTPET.' },
    { id: 'base-pet-as', sourceType: 'legacy-as3', sourcePath: basePetPath, sha256: sha256(basePetPath), locator: 'reduceHp: HP clamps to zero, death action and lifetime decrement while the same PetInfo remains visible.' },
  ],
  stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states: states.map(([id, entry, fixtureId]) => ({ id, entry, frame: id.includes('no-pet') || id.includes('rested') ? 0 : 1, fixtureId, baselineId: `original-${id}-940x590` })),
  displayObjects, baselines,
  completeness: { expectedStateIds: states.map(([id]) => id), extractedStateIds: states.map(([id]) => id), expectedVisibleObjectCountByState: Object.fromEntries(states.map(([id]) => [id, visibleCount(id)])), displayListMatched: true, stateSetMatched: true, unresolved: [] },
  evidenceRefs: ['docs/reverse-engineering/evidence/TASK-SETTINGS-191-pet-ui-visibility.md', 'docs/reverse-engineering/pets-index.md#task-settings-191-正式可见性与战斗-hud-裁决', 'docs/reverse-engineering/combat-hud-index.md#task-settings-191-宠物战斗-hud-真值'],
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const current = readFileSync(path.join(root, outputPath), 'utf8');
  if (current !== serialized) throw new Error(`${outputPath} is stale; run ${command}`);
  console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${states.length} states.`);
} else {
  writeFileSync(path.join(root, outputPath), serialized);
  console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${states.length} states.`);
}
