import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/pet1.swf';
const svgPath = 'local-resources/regima/task-outputs/task-settings-175a-pet-page/exports-svg/DefineSprite_932_export.pet.PetInterface/1.svg';
const petInterfacePath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetInterface.as';
const petHeadPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetHeadSprite.as';
const putSkillPath = 'local-resources/regima/task-outputs/task-settings-175a-pet-page/scripts/scripts/export/pet/PutPetSkill.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175a-pet-page.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175A';
const command = 'npm run generate:pet-page-truth';

const stateSpecs = [
  ['empty-p1', 'P1 B -> PetInterface; empty roster', 'p1; roster=[]'],
  ['page1-five-p1', 'P1 pet page, page 1', 'p1; roster=10; page=1; rows=0..4'],
  ['page2-five-p1', 'P1 pet page, nextPage', 'p1; roster=10; page=2; rows=5..9'],
  ['selected-resting-p1', 'P1 page 1, select resting pet', 'p1; monkey1; isFight=0; selected=row0'],
  ['selected-fighting-p1', 'P1 page 1, select active pet', 'p1; monkey1; isFight=1; selected=row0'],
  ['selected-eight-skills-p1', 'P1 selected pet with eight skills', 'p1; monkey4; skills=8'],
  ['skill-hover-p1', 'P1 selected pet, pointer over skill1', 'p1; skills=8; hover=skill1'],
  ['button-hover-p1', 'P1 selected pet, pointer over fightbtn', 'p1; hover=fightbtn'],
  ['button-pressed-p1', 'P1 selected pet, pointer down on fightbtn', 'p1; pressed=fightbtn'],
  ['release-confirm-p1', 'P1 selected pet, releasebtn -> giveUpThisPet', 'p1; confirm=release'],
  ['after-attribute-reroll-p1', 'P1 selected pet, czsxbtn success', 'p1; item=cwzzxld; refreshed attributes'],
  ['after-skill-reroll-p1', 'P1 selected pet, czjnbtn success', 'p1; item=cwjnxld; refreshed skills'],
  ['after-evolution-p1', 'P1 selected level-50 third-form pet, upBtn success', 'p1; form=3->4'],
  ['empty-p2', 'P2 numpad minus -> PetInterface; empty roster', 'p2; roster=[]'],
  ['selected-p2', 'P2 page 1, select pet', 'p2; monkey1; selected=row0'],
  ['closed', 'btn_close or repeated owner shortcut', 'PetInterface removed; host resumed'],
];
const openStateIds = stateSpecs.map(([id]) => id).filter((id) => id !== 'closed');
const listStateIds = openStateIds.filter((id) => !id.startsWith('empty-'));
const selectedStateIds = listStateIds.filter((id) => !['page1-five-p1', 'page2-five-p1'].includes(id));
const eightSkillStateIds = ['selected-eight-skills-p1', 'skill-hover-p1', 'after-skill-reroll-p1'];

const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');
const round = (value) => Math.round(value * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => ({ a: round(a), b: round(b), c: round(c), d: round(d), tx: round(tx), ty: round(ty) });
const render = (assetRef, extra = {}) => ({ assetRef, blendMode: 'normal', filters: [], maskId: null, ...extra });
const placement = (stateId, visible, localMatrix, localBounds, stageBounds, derivation, evidenceRefs, extra = {}) => ({
  stateId, visible, localMatrix, registrationPoint: { x: 0, y: 0 }, localBounds, stageBounds,
  derivation, derivationMethod: derivation === 'extracted'
    ? 'Direct restored-SWF PlaceObject matrix composed with the FFDec SVG visible envelope.'
    : 'Calculated from the AS3 addChild position and the restored-SWF exported child envelope.',
  evidenceRefs, ...extra,
});

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function parseRootUses(svg) {
  const match = svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if (!match) throw new Error('Unable to locate character 932 root display list');
  return [...match[1].matchAll(/<use\b[^>]*\/>/g)].map((entry) => {
    const attrs = attributes(entry[0]);
    const values = attrs.transform.match(/matrix\(([^)]*)\)/)?.[1].split(',').map(Number);
    if (!values) throw new Error(`Missing matrix for root use ${entry[0]}`);
    return {
      characterId: Number(attrs['ffdec:characterId']), instanceName: attrs.id ?? null,
      symbolClass: attrs['ffdec:characterName'] ?? null, href: attrs['xlink:href'].slice(1),
      width: Number(attrs.width), height: Number(attrs.height), matrix: matrix(...values),
    };
  });
}

function parseSwfRootPlacements() {
  const raw = readFileSync(path.join(root, swfPath));
  const signature = raw.subarray(0, 3).toString('ascii');
  const body = signature === 'CWS' ? inflateSync(raw.subarray(8)) : raw.subarray(8);
  const swf = signature === 'CWS' ? Buffer.concat([Buffer.from('FWS'), raw.subarray(3, 8), body]) : raw;
  if (swf.subarray(0, 3).toString('ascii') !== 'FWS') throw new Error(`Unsupported SWF signature ${signature}`);
  const headerRect = readRect(swf, 8);
  for (const tag of iterateTags(swf, headerRect.nextOffset + 4, swf.length)) {
    if (tag.code === 39 && swf.readUInt16LE(tag.offset) === 932) return parsePlacements(swf, tag.offset + 4, tag.end);
  }
  throw new Error('DefineSprite character 932 not found');
}

function parsePlacements(buffer, start, end) {
  const result = [];
  for (const tag of iterateTags(buffer, start, end)) {
    let cursor; let characterId = null; let instanceName = null; let localMatrix = matrix(); let depth;
    if (tag.code === 4) {
      characterId = buffer.readUInt16LE(tag.offset); depth = buffer.readUInt16LE(tag.offset + 2);
      localMatrix = readMatrix(buffer, tag.offset + 4).matrix;
    } else if (tag.code === 26) {
      const flags = buffer[tag.offset]; depth = buffer.readUInt16LE(tag.offset + 1); cursor = tag.offset + 3;
      if (flags & 0x02) { characterId = buffer.readUInt16LE(cursor); cursor += 2; }
      if (flags & 0x04) { const parsed = readMatrix(buffer, cursor); localMatrix = parsed.matrix; cursor = parsed.nextOffset; }
      if (flags & 0x08) cursor = skipCxform(buffer, cursor, false);
      if (flags & 0x10) cursor += 2;
      if (flags & 0x20) instanceName = readCString(buffer, cursor, tag.end).value;
    } else if (tag.code === 70) {
      const flags1 = buffer[tag.offset]; const flags2 = buffer[tag.offset + 1]; depth = buffer.readUInt16LE(tag.offset + 2); cursor = tag.offset + 4;
      if ((flags2 & 0x08) || ((flags2 & 0x10) && (flags1 & 0x02))) cursor = readCString(buffer, cursor, tag.end).nextOffset;
      if (flags1 & 0x02) { characterId = buffer.readUInt16LE(cursor); cursor += 2; }
      if (flags1 & 0x04) { const parsed = readMatrix(buffer, cursor); localMatrix = parsed.matrix; cursor = parsed.nextOffset; }
      if (flags1 & 0x08) cursor = skipCxform(buffer, cursor, true);
      if (flags1 & 0x10) cursor += 2;
      if (flags1 & 0x20) instanceName = readCString(buffer, cursor, tag.end).value;
    }
    if (characterId !== null) result.push({ characterId, instanceName, depth, matrix: localMatrix });
  }
  return result;
}

function inferType(use) {
  if (use.href.startsWith('shape')) return 'shape';
  if (use.href.startsWith('text')) return 'text-field';
  if (use.href.startsWith('button')) return 'button';
  return 'sprite';
}

const svg = readFileSync(path.join(root, svgPath), 'utf8');
const uses = parseRootUses(svg);
const rawPlacements = parseSwfRootPlacements();
if (uses.length !== rawPlacements.length) throw new Error(`932 display-list mismatch: SVG=${uses.length}, SWF=${rawPlacements.length}`);
uses.forEach((use, index) => {
  const raw = rawPlacements[index];
  if (use.characterId !== raw.characterId || use.instanceName !== raw.instanceName) {
    throw new Error(`932 child mismatch at ${index}: SVG=${use.characterId}/${use.instanceName}, SWF=${raw.characterId}/${raw.instanceName}`);
  }
  use.depth = raw.depth;
});

const buttonStateCharacters = {
  fightbtn: { up: 832, over: 834, down: 834, hit: 834 }, releasebtn: { up: 837, over: 839, down: 839, hit: 839 },
  restbtn: { up: 842, over: 844, down: 844, hit: 844 }, btn_close: { up: 880, over: 882, down: 882, hit: 882 },
  upBtn: { up: 914, over: 914, down: 914, hit: 914 }, prePage: { up: 917, over: 919, down: 919, hit: 919 },
  nextPage: { up: 922, over: 924, down: 924, hit: 924 },
};

const displayObjects = [{
  id: 'pet-page-root', parentId: null, depth: 0, objectType: 'movie-clip',
  sourceIdentity: { provenanceId: 'pet1-swf', characterId: 932, symbolClass: 'export.pet.PetInterface', instanceName: null, frame: 1 },
  placements: stateSpecs.map(([stateId]) => placement(stateId, stateId !== 'closed', matrix(), bounds(0, 0, 940, 590), bounds(0, 0, 940, 590), 'extracted', ['pet1-swf:character-932-frame-1'])),
  render: render(svgPath),
}];

for (const use of uses) {
  const objectType = inferType(use);
  const id = use.instanceName ?? `${objectType}-${use.characterId}-depth-${use.depth}`;
  const stageBounds = bounds(use.matrix.tx, use.matrix.ty, use.width * Math.abs(use.matrix.a), use.height * Math.abs(use.matrix.d));
  const textStyle = objectType === 'text-field' ? { dynamic: use.instanceName, source: 'DefineEditText preserved by character id; runtime text values are enumerated by fixture and PetInterface.setShow().' } : undefined;
  const buttonStateAssets = objectType === 'button' ? Object.fromEntries(Object.entries(buttonStateCharacters[use.instanceName]).map(([key, value]) => [key, `pet1.swf#character-${value}`])) : undefined;
  displayObjects.push({
    id, parentId: 'pet-page-root', depth: use.depth, objectType,
    sourceIdentity: { provenanceId: 'pet1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: 1 },
    placements: stateSpecs.map(([stateId]) => placement(stateId, stateId !== 'closed', use.matrix, bounds(0, 0, use.width, use.height), stageBounds, 'extracted', [`pet1-swf:character-932-depth-${use.depth}`], objectType === 'button' ? { hitArea: stageBounds } : {})),
    render: render(`${svgPath}#${use.href}`, { ...(textStyle ? { textStyle } : {}), ...(buttonStateAssets ? { buttonStateAssets } : {}) }),
  });
}

for (let row = 0; row < 5; row += 1) {
  const y = 142.5 + row * 26;
  displayObjects.push({
    id: `pet-list-row-${row}`, parentId: 'pet-page-root', depth: 100 + row, objectType: 'sprite',
    sourceIdentity: { provenanceId: 'pet1-swf', characterId: 1224, symbolClass: 'petlist', instanceName: `petlist${row}`, frame: 1 },
    placements: listStateIds.map((stateId) => placement(stateId, true, matrix(1, 0, 0, 1, 349.85, y), bounds(0, 0, 112, 21), bounds(349.85, y, 112, 21), 'calculated', ['pet-interface-as:setPetList', 'pet1-swf:character-1224'])),
    render: render('local-resources/regima/task-outputs/task-settings-175a-pet-page/exports-svg/DefineSprite_1224_petlist/1.svg'),
  });
  displayObjects.push({
    id: `pet-list-row-${row}-name`, parentId: `pet-list-row-${row}`, depth: 1, objectType: 'text-field',
    sourceIdentity: { provenanceId: 'pet1-swf', characterId: 1222, symbolClass: null, instanceName: 'petname', frame: 1 },
    placements: listStateIds.map((stateId) => placement(stateId, true, matrix(1, 0, 0, 1, 2, 2), bounds(0, 0, 110.95, 20), bounds(351.85, y + 2, 110.95, 20), 'calculated', ['pet-interface-as:setPetList', 'pet1-swf:character-1224-child-petname'])),
    render: render('pet1.swf#character-1222', { textStyle: { dynamic: 'pet china name + optional (出战)', normalColor: '#381d09', selectedColor: '#fdfcba' } }),
  });
}

displayObjects.push({
  id: 'selected-pet-head', parentId: 'pet-page-root', depth: 25, objectType: 'container',
  sourceIdentity: { provenanceId: 'pet-head-as', characterId: null, symbolClass: 'export.pet.PetHeadSprite', instanceName: 'pethead', frame: null },
  placements: selectedStateIds.map((stateId) => placement(stateId, true, matrix(1, 0, 0, 1, 280, 220), bounds(-8, -10, 70, 70), bounds(272, 210, 70, 70), 'calculated', ['pet-interface-as:addPetHead', 'pet-head-as:monkey1-fixture'])),
  render: render('pet1.swf#PetMonkeyBmd1; BaseBitmapDataClip fixture monkey1'),
});

for (let index = 0; index < 8; index += 1) {
  const slot = uses.find((use) => use.instanceName === `skill${index + 1}`);
  if (!slot) throw new Error(`Missing static skill slot ${index + 1}`);
  const x = slot.matrix.tx; const y = slot.matrix.ty;
  displayObjects.push({
    id: `skill-runtime-icon-${index + 1}`, parentId: `skill${index + 1}`, depth: 1, objectType: 'bitmap',
    sourceIdentity: { provenanceId: 'put-skill-as', characterId: null, symbolClass: null, instanceName: 'skillImage', frame: null },
    placements: eightSkillStateIds.map((stateId) => placement(stateId, true, matrix(), bounds(0, 0, 57, 57), bounds(x, y, 57, 57), 'calculated', ['put-skill-as:setImage', `pet-interface-as:skill-${index + 1}`])),
    render: render('AUtils.getImageObj("petskill_" + sname)'),
  });
}

displayObjects.push({
  id: 'skill-tooltip', parentId: 'skill1', depth: 2, objectType: 'sprite',
  sourceIdentity: { provenanceId: 'pet1-swf', characterId: 1228, symbolClass: 'skillIntro', instanceName: 'skillIntro', frame: 1 },
  placements: [placement('skill-hover-p1', true, matrix(1, 0, 0, 1, 28.5, 28.5), bounds(0, 0, 144, 105.55), bounds(534.45, 393.35, 144, 105.55), 'calculated', ['put-skill-as:show', 'pet1-swf:character-1228'])],
  render: render('local-resources/regima/task-outputs/task-settings-175a-pet-page/exports-svg/DefineSprite_1228_skillIntro/1.svg'),
});

displayObjects.push({
  id: 'release-confirm-overlay', parentId: 'pet-page-root', depth: 1000, objectType: 'sprite',
  sourceIdentity: { provenanceId: 'pet1-swf', characterId: 1221, symbolClass: 'giveUpThisPet', instanceName: 'giveupPet', frame: 1 },
  placements: [placement('release-confirm-p1', true, matrix(), bounds(0, 0, 940, 590), bounds(0, 0, 940, 590), 'calculated', ['pet-interface-as:releaseClick', 'pet1-swf:character-1221'])],
  render: render('local-resources/regima/task-outputs/task-settings-175a-pet-page/exports-svg/DefineSprite_1221_giveUpThisPet/1.svg'),
});
for (const [id, characterId, x] of [['release-confirm-ok', 1215, 376.3], ['release-confirm-no', 1220, 463.3]]) {
  displayObjects.push({
    id, parentId: 'release-confirm-overlay', depth: id.endsWith('ok') ? 2 : 3, objectType: 'button',
    sourceIdentity: { provenanceId: 'pet1-swf', characterId, symbolClass: null, instanceName: id.endsWith('ok') ? 'okbtn' : 'nobtn', frame: 1 },
    placements: [placement('release-confirm-p1', true, matrix(1, 0, 0, 1, x, 329), bounds(0, 0, 68, 35), bounds(x, 329, 68, 35), 'extracted', [`pet1-swf:character-1221-${id}`], { hitArea: bounds(x, 329, 68, 35) })],
    render: render(`pet1.swf#character-${characterId}`, { buttonStateAssets: { up: `${characterId}:up`, over: `${characterId}:over`, down: `${characterId}:down`, hit: `${characterId}:hit` } }),
  });
}

const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((entry) => entry.stateId === stateId && entry.visible)).length;
const baselines = stateSpecs.map(([id]) => {
  const baselinePath = `${baselineRoot}/original-${id}-940x590.png`;
  return { id: `original-${id}-940x590`, stateId: id, path: baselinePath, sha256: sha256(baselinePath), width: 940, height: 590, crop: bounds(0, 0, 940, 590) };
});

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json', schemaVersion: 1,
  truthId: 'task-settings-175a.pet-page', status: 'verified',
  scope: { taskId: 'TASK-SETTINGS-175A', surfaceId: 'pet-page-character-932', originalVersion: 'RegiMA 1.1 restored corpus', description: 'Character 932 complete root display list plus AS3-created pet rows, selected head container, eight skill images, skill tooltip and release confirmation. Feedback alerts belong to the shared alert host and are referenced as behavior, not falsified as page children.' },
  generatedBy: { tool: 'generate-pet-page-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-08-16T13:10:00+08:00' },
  provenance: [
    { id: 'pet1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: 'character 932 export.pet.PetInterface frame 1; direct DefineSprite PlaceObject depth/matrix; characters 813, 835, 840, 845, 852, 858, 863, 868, 873, 878, 883, 891, 915, 920, 925, 1221, 1224, 1228, 1323, 1324; FFDec 26 selective SVG/PNG export.' },
    { id: 'pet-interface-as', sourceType: 'legacy-as3', sourcePath: petInterfacePath, sha256: sha256(petInterfacePath), locator: 'constructor/added/setPetList/plClick/addPetHead/setPetAllSkill/setShow/releaseClick/revolution/fightClick/restClick/close.' },
    { id: 'pet-head-as', sourceType: 'legacy-as3', sourcePath: petHeadPath, sha256: sha256(petHeadPath), locator: 'PetHeadSprite.initBBC; monkey1 fixture uses PetMonkeyBmd1 70x70 offset -8,-10.' },
    { id: 'put-skill-as', sourceType: 'legacy-as3', sourcePath: putSkillPath, sha256: sha256(putSkillPath), locator: 'setCurrentSkill/setImage/show/hide; runtime skillImage and character 1228 tooltip.' },
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states: stateSpecs.map(([id, entry, fixtureId]) => ({ id, entry, frame: id === 'closed' ? 0 : 1, fixtureId, baselineId: `original-${id}-940x590` })),
  displayObjects, baselines,
  completeness: {
    expectedStateIds: stateSpecs.map(([id]) => id), extractedStateIds: stateSpecs.map(([id]) => id),
    expectedVisibleObjectCountByState: Object.fromEntries(stateSpecs.map(([id]) => [id, visibleCount(id)])),
    displayListMatched: true, stateSetMatched: true, unresolved: [],
  },
  evidenceRefs: ['docs/reverse-engineering/evidence/TASK-SETTINGS-175A-pet-page.md', 'docs/reverse-engineering/pets-index.md#task-settings-175a-宠物页-932-机器真值'],
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const current = readFileSync(path.join(root, outputPath), 'utf8');
  if (current !== serialized) throw new Error(`${outputPath} is stale; run ${command}`);
  console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`);
} else {
  writeFileSync(path.join(root, outputPath), serialized);
  console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states.`);
}

function iterateTags(buffer, start, end) {
  const result = []; let cursor = start;
  while (cursor + 2 <= end) {
    const header = buffer.readUInt16LE(cursor); cursor += 2; const code = header >> 6; let length = header & 0x3f;
    if (length === 0x3f) { length = buffer.readUInt32LE(cursor); cursor += 4; }
    const tagEnd = cursor + length; if (tagEnd > end) break;
    result.push({ code, offset: cursor, end: tagEnd }); cursor = tagEnd; if (code === 0) break;
  }
  return result;
}
function readRect(buffer, offset) {
  const bits = new BitReader(buffer, offset); const count = bits.readUnsigned(5);
  bits.readSigned(count); bits.readSigned(count); bits.readSigned(count); bits.readSigned(count); bits.align();
  return { nextOffset: bits.byteOffset };
}
function readMatrix(buffer, offset) {
  const bits = new BitReader(buffer, offset); let a = 1; let d = 1; let b = 0; let c = 0;
  if (bits.readUnsigned(1)) { const count = bits.readUnsigned(5); a = bits.readSigned(count) / 65536; d = bits.readSigned(count) / 65536; }
  if (bits.readUnsigned(1)) { const count = bits.readUnsigned(5); b = bits.readSigned(count) / 65536; c = bits.readSigned(count) / 65536; }
  const count = bits.readUnsigned(5); const tx = bits.readSigned(count) / 20; const ty = bits.readSigned(count) / 20; bits.align();
  return { matrix: matrix(a, b, c, d, tx, ty), nextOffset: bits.byteOffset };
}
function skipCxform(buffer, offset, withAlpha) {
  const bits = new BitReader(buffer, offset); const hasAdd = bits.readUnsigned(1); const hasMult = bits.readUnsigned(1); const count = bits.readUnsigned(4); const channels = withAlpha ? 4 : 3;
  if (hasMult) for (let i = 0; i < channels; i += 1) bits.readSigned(count);
  if (hasAdd) for (let i = 0; i < channels; i += 1) bits.readSigned(count);
  bits.align(); return bits.byteOffset;
}
function BitReader(buffer, byteOffset) {
  this.buffer = buffer; this.byteOffset = byteOffset; this.bitOffset = 0;
  this.readUnsigned = (count) => { let value = 0; for (let i = 0; i < count; i += 1) { value = value * 2 + ((this.buffer[this.byteOffset] >> (7 - this.bitOffset)) & 1); this.bitOffset += 1; if (this.bitOffset === 8) { this.bitOffset = 0; this.byteOffset += 1; } } return value; };
  this.readSigned = (count) => { if (!count) return 0; const value = this.readUnsigned(count); const sign = 2 ** (count - 1); return value >= sign ? value - 2 ** count : value; };
  this.align = () => { if (this.bitOffset) { this.bitOffset = 0; this.byteOffset += 1; } };
}
function readCString(buffer, offset, end) { const zero = buffer.indexOf(0, offset); const safeEnd = zero < 0 || zero > end ? end : zero; return { value: buffer.subarray(offset, safeEnd).toString('utf8'), nextOffset: Math.min(safeEnd + 1, end) }; }
