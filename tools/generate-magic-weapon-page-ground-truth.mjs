import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/backpack1.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-175b-magic-weapon-page';
const sutraPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/strength/SutraInterface.as';
const roleInfoPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/RoleInfo.as';
const xmlPath = `${taskOutput}/backpack1.xml`;
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175b-magic-weapon-page.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175B';
const command = 'npm run generate:magic-weapon-page-truth';

const stateSpecs = [
  ['unequipped-p1', 'P1 N or HUD magic-weapon button without equipped zbfb', 'p1; zbfb=null; RoleInfo alerts and does not construct 596'],
  ['normal-level1-p1', 'P1 opens equipped level-1 magic weapon', 'p1; zbfb=kyl; level=1; soul=5000'],
  ['upgrade-hover-p1', 'Pointer over btn_sj', 'p1; hover=btn_sj'],
  ['upgrade-pressed-p1', 'Pointer down on btn_sj', 'p1; pressed=btn_sj'],
  ['reset-hover-p1', 'Pointer over resetbtn', 'p1; hover=resetbtn'],
  ['reset-pressed-p1', 'Pointer down on resetbtn', 'p1; pressed=resetbtn'],
  ['close-hover-p1', 'Pointer over btn_close', 'p1; hover=btn_close'],
  ['close-pressed-p1', 'Pointer down on btn_close', 'p1; pressed=btn_close'],
  ['after-soul-upgrade-p1', 'btn_sj succeeds on the immediate soul branch', 'p1; level=1->2; soul=5000->4000'],
  ['upgrade-refused-soul-p1', 'btn_sj on immediate branch with insufficient soul', 'p1; soul below level^2*1000; shared ts feedback'],
  ['upgrade-confirm-material-p1', 'Level 10..14 upgrade requires updataFBWithLvdyl', 'p1; level=10; material=wplvdyl; confirm=character-200'],
  ['upgrade-confirm-special-p1', 'Special magic-weapon branch requires renewalseThisSZ', 'p1; special material branch; confirm=character-34'],
  ['confirm-ok-hover-p1', 'Pointer over material-confirm okbtn', 'p1; confirm=character-200; hover=okbtn'],
  ['confirm-ok-pressed-p1', 'Pointer down on material-confirm okbtn', 'p1; confirm=character-200; pressed=okbtn'],
  ['upgrade-confirm-cancelled-p1', 'nobtn removes the upgrade confirmation without mutation', 'p1; confirm cancelled; inventory/soul/equipment unchanged'],
  ['reset-confirm-p1', 'resetbtn creates renewalseThisSZ named refreshWX', 'p1; wpccfq count fixture; confirm=character-34'],
  ['reset-confirm-cancelled-p1', 'refreshWX nobtn removes confirmation without mutation', 'p1; reset cancelled; equipment unchanged'],
  ['reset-refused-material-p1', 'refreshWX okbtn with fewer than three wpccfq', 'p1; wpccfq<3; shared alert; character-34 remains'],
  ['reset-complete-p1', 'refreshWX okbtn consumes three wpccfq and refreshes fields', 'p1; wpccfq>=3; element reset; level preserved'],
  ['p2-no-entry', 'Original input map has no P2 magic-weapon page shortcut', 'p2; no page instance; negative original evidence'],
  ['closed', 'btn_close or closefb removes SutraInterface and resumes origin', '596 removed; host resumed'],
];
const hiddenStateIds = new Set(['unequipped-p1', 'p2-no-entry', 'closed']);
const pageStateIds = stateSpecs.map(([id]) => id).filter((id) => !hiddenStateIds.has(id));
const upgradeConfirmStateIds = ['upgrade-confirm-material-p1', 'confirm-ok-hover-p1', 'confirm-ok-pressed-p1'];
const sharedConfirmStateIds = ['upgrade-confirm-special-p1', 'reset-confirm-p1', 'reset-refused-material-p1'];

const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');
const round = (value) => Math.round(value * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => ({ a: round(a), b: round(b), c: round(c), d: round(d), tx: round(tx), ty: round(ty) });
const render = (assetRef, extra = {}) => ({ assetRef, blendMode: 'normal', filters: [], maskId: null, ...extra });
const placement = (stateId, localMatrix, localBounds, stageBounds, derivation, evidenceRefs, extra = {}) => ({
  stateId, visible: true, localMatrix, registrationPoint: { x: 0, y: 0 }, localBounds, stageBounds,
  derivation, derivationMethod: derivation === 'extracted'
    ? 'Direct restored-SWF PlaceObject matrix composed with the FFDec SVG visible envelope.'
    : 'AS3 addChild at the page origin composed with the restored-SWF child matrix.',
  evidenceRefs, ...extra,
});

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function parseRootUses(svgPath, expectedCharacterId) {
  const svg = readFileSync(path.join(root, svgPath), 'utf8');
  const match = svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if (!match) throw new Error(`Unable to locate character ${expectedCharacterId} root display list`);
  return [...match[1].matchAll(/<use\b[^>]*\/>/g)].map((entry) => {
    const attrs = attributes(entry[0]);
    const values = attrs.transform.match(/matrix\(([^)]*)\)/)?.[1].split(',').map(Number);
    if (!values) throw new Error(`Missing matrix for character ${expectedCharacterId} root use`);
    return {
      characterId: Number(attrs['ffdec:characterId']), instanceName: attrs.id ?? null,
      symbolClass: attrs['ffdec:characterName'] ?? null, href: attrs['xlink:href'].slice(1),
      width: Number(attrs.width), height: Number(attrs.height), matrix: matrix(...values),
    };
  });
}

function parseSwfPlacements(characterId) {
  const raw = readFileSync(path.join(root, swfPath));
  const signature = raw.subarray(0, 3).toString('ascii');
  const body = signature === 'CWS' ? inflateSync(raw.subarray(8)) : raw.subarray(8);
  const swf = signature === 'CWS' ? Buffer.concat([Buffer.from('FWS'), raw.subarray(3, 8), body]) : raw;
  if (swf.subarray(0, 3).toString('ascii') !== 'FWS') throw new Error(`Unsupported SWF signature ${signature}`);
  const headerRect = readRect(swf, 8);
  for (const tag of iterateTags(swf, headerRect.nextOffset + 4, swf.length)) {
    if (tag.code === 39 && swf.readUInt16LE(tag.offset) === characterId) return parsePlacements(swf, tag.offset + 4, tag.end);
  }
  throw new Error(`DefineSprite character ${characterId} not found`);
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

const sourceSpecs = [
  { characterId: 596, symbolClass: 'export.strength.SutraInterface', key: 'page', states: pageStateIds },
  { characterId: 200, symbolClass: 'updataFBWithLvdyl', key: 'upgrade-confirm', states: upgradeConfirmStateIds },
  { characterId: 34, symbolClass: 'renewalseThisSZ', key: 'shared-confirm', states: sharedConfirmStateIds },
];
const parsedSources = Object.fromEntries(sourceSpecs.map((spec) => {
  const svgPath = `${taskOutput}/exports-svg/DefineSprite_${spec.characterId}_${spec.symbolClass}/1.svg`;
  const uses = parseRootUses(svgPath, spec.characterId);
  const rawPlacements = parseSwfPlacements(spec.characterId);
  if (uses.length !== rawPlacements.length) throw new Error(`${spec.characterId} display-list mismatch: SVG=${uses.length}, SWF=${rawPlacements.length}`);
  uses.forEach((use, index) => {
    const raw = rawPlacements[index];
    if (use.characterId !== raw.characterId || use.instanceName !== raw.instanceName) {
      throw new Error(`${spec.characterId} child mismatch at ${index}: SVG=${use.characterId}/${use.instanceName}, SWF=${raw.characterId}/${raw.instanceName}`);
    }
    use.depth = raw.depth;
  });
  return [spec.key, { ...spec, svgPath, uses }];
}));

const buttonAssets = {
  resetbtn: 368, btn_sj: 436, btn_close: 31, okbtn: 19, nobtn: 24,
};
const displayObjects = [];

function appendSource(sourceKey, parentId, rootId, rootDepth, derivation) {
  const source = parsedSources[sourceKey];
  const rootBounds = source.characterId === 596 ? bounds(0, 0, 940.05, 590) : bounds(0, 0, 940, 590);
  displayObjects.push({
    id: rootId, parentId, depth: rootDepth, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'backpack1-swf', characterId: source.characterId, symbolClass: source.symbolClass, instanceName: null, frame: 1 },
    placements: source.states.map((stateId) => placement(stateId, matrix(), rootBounds, rootBounds, derivation, [`backpack1-swf:character-${source.characterId}-frame-1`])),
    render: render(source.svgPath),
  });
  for (const use of source.uses) {
    const objectType = use.href.startsWith('shape') ? 'shape' : use.href.startsWith('text') ? 'text-field' : use.href.startsWith('button') ? 'button' : 'sprite';
    const objectId = `${rootId}.${use.instanceName ?? `${objectType}-${use.characterId}-depth-${use.depth}`}`;
    const stageBounds = bounds(use.matrix.tx, use.matrix.ty, use.width * Math.abs(use.matrix.a), use.height * Math.abs(use.matrix.d));
    const textStyle = objectType === 'text-field' ? { dynamic: use.instanceName, source: source.characterId === 596 ? 'SutraInterface.setTxt fixture projection' : 'SutraInterface assigns confirmation text before addChild' } : undefined;
    const buttonCharacter = buttonAssets[use.instanceName];
    const buttonStateAssets = buttonCharacter ? {
      up: `${taskOutput}/exports-png/DefineButton2_${buttonCharacter}/1_up.png`,
      over: `${taskOutput}/exports-png/DefineButton2_${buttonCharacter}/2_over.png`,
      down: `${taskOutput}/exports-png/DefineButton2_${buttonCharacter}/3_down.png`,
      hit: `${taskOutput}/exports-png/DefineButton2_${buttonCharacter}/4_hittest.png`,
    } : undefined;
    displayObjects.push({
      id: objectId, parentId: rootId, depth: use.depth, objectType,
      sourceIdentity: { provenanceId: 'backpack1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: 1 },
      placements: source.states.map((stateId) => placement(stateId, use.matrix, bounds(0, 0, use.width, use.height), stageBounds, 'extracted', [`backpack1-swf:character-${source.characterId}-depth-${use.depth}`], objectType === 'button' ? { hitArea: stageBounds } : {})),
      render: render(`${source.svgPath}#${use.href}`, { ...(textStyle ? { textStyle } : {}), ...(buttonStateAssets ? { buttonStateAssets } : {}) }),
    });
  }
}

appendSource('page', null, 'magic-weapon-page-root', 0, 'extracted');
appendSource('upgrade-confirm', 'magic-weapon-page-root', 'upgrade-confirm-overlay', 1000, 'calculated');
appendSource('shared-confirm', 'magic-weapon-page-root', 'shared-confirm-overlay', 1000, 'calculated');

const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((entry) => entry.stateId === stateId && entry.visible)).length;
const baselines = stateSpecs.map(([id]) => {
  const baselinePath = `${baselineRoot}/original-${id}-940x590.png`;
  return { id: `original-${id}-940x590`, stateId: id, path: baselinePath, sha256: sha256(baselinePath), width: 940, height: 590, crop: bounds(0, 0, 940, 590) };
});

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json', schemaVersion: 1,
  truthId: 'task-settings-175b.magic-weapon-page', status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-175B', surfaceId: 'magic-weapon-page-character-596', originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Character 596 complete root display list plus AS3-created character 200/34 upgrade and reset confirmations. Shared ts/alert feedback is referenced as host behavior and is not falsified as a 596 child.',
  },
  generatedBy: { tool: 'generate-magic-weapon-page-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-08-16T13:40:00+08:00' },
  provenance: [
    { id: 'backpack1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: 'character 596 export.strength.SutraInterface frame 1; dynamic confirmations character 200 updataFBWithLvdyl and character 34 renewalseThisSZ; direct DefineSprite PlaceObject depth/matrix; FFDec 26 selective SVG/PNG/button export.' },
    { id: 'sutra-interface-as', sourceType: 'legacy-as3', sourcePath: sutraPath, sha256: sha256(sutraPath), locator: 'setRole/added/removed/setTxt/close/sjMethod/upDataZSJL/upDataQPJ/upDataGod/uokClick/unoClick/refreshWX/refreshConfirm/refreskCancel.' },
    { id: 'role-info-as', sourceType: 'legacy-as3', sourcePath: roleInfoPath, sha256: sha256(roleInfoPath), locator: 'fbClick constructs SutraInterface only when P1 current zbfb exists; otherwise shared alert.' },
    { id: 'backpack1-ffdec-xml', sourceType: 'ffdec-xml', sourcePath: xmlPath, sha256: sha256(xmlPath), locator: 'SymbolClass maps 596/200/34; character tags and nested PlaceObject records cross-check generator parsing.' },
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states: stateSpecs.map(([id, entry, fixtureId]) => ({ id, entry, frame: hiddenStateIds.has(id) ? 0 : 1, fixtureId, baselineId: `original-${id}-940x590` })),
  displayObjects, baselines,
  completeness: {
    expectedStateIds: stateSpecs.map(([id]) => id), extractedStateIds: stateSpecs.map(([id]) => id),
    expectedVisibleObjectCountByState: Object.fromEntries(stateSpecs.map(([id]) => [id, visibleCount(id)])),
    displayListMatched: true, stateSetMatched: true, unresolved: [],
  },
  evidenceRefs: ['docs/reverse-engineering/evidence/TASK-SETTINGS-175B-magic-weapon-page.md', 'docs/reverse-engineering/magic-weapons-index.md#task-settings-175b-法宝页-596-机器真值'],
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
