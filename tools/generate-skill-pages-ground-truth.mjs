import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-175d-skill-pages';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175d-skill-pages.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175D';
const command = 'npm run generate:skill-pages-truth';
const legacyRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/shop';
const as3Paths = {
  buy: `${legacyRoot}/BuySkill.as`,
  active: `${legacyRoot}/SkillControl.as`,
  bind: `${legacyRoot}/SkillSetControl.as`,
  passiveControl: `${legacyRoot}/PassiveSkillControl.as`,
  passiveRow: 'local-resources/regima/task-outputs/task-settings-061-skill-native/as3/scripts/export/shop/PassiveSkill.as',
};

const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');
const round = (value) => Math.round(value * 1000) / 1000;
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => ({ a: round(a), b: round(b), c: round(c), d: round(d), tx: round(tx), ty: round(ty) });
const render = (assetRef, extra = {}) => ({ assetRef, blendMode: 'normal', filters: [], maskId: null, ...extra });
const placement = (stateId, localMatrix, localBounds, stageBounds, derivation, evidenceRefs, extra = {}) => ({
  stateId,
  visible: true,
  localMatrix,
  registrationPoint: { x: 0, y: 0 },
  localBounds,
  stageBounds,
  derivation,
  derivationMethod: derivation === 'extracted'
    ? 'Direct restored-SWF PlaceObject matrix cross-checked against the FFDec SVG visible envelope.'
    : 'AS3 dynamic addChild placement composed with restored-SWF child geometry.',
  evidenceRefs,
  ...extra,
});

const treeStates = Array.from({ length: 10 }, (_, index) => {
  const frame = index + 1;
  const role = Math.ceil(frame / 2);
  const tree = ((frame - 1) % 2) + 1;
  const owner = role === 2 ? 'p2' : 'p1';
  return [`active-role${role}-tree${tree}-${owner}`, `Role${role} selects mind tree ${tree}`, `${owner}; role=${role}; tree=${tree}; iconFrames=3,2,1,2,3`, frame];
});
const stateSpecs = [
  ['hub-active-p1', 'P1 opens the skill hub with the active page', 'p1; party=Role1,Role2; selected=Role1'],
  ['hub-active-p2', 'P2 opens the skill hub with the active page', 'p2; party=Role1,Role2; selected=Role2'],
  ['hub-back-hover', 'Pointer over character 240', 'p1; hover=btnback'],
  ['hub-back-pressed', 'Pointer down on character 240', 'p1; pressed=btnback'],
  ['hub-active-hover', 'Pointer over character 244', 'p1; hover=activebtn'],
  ['hub-active-pressed', 'Pointer down on character 244', 'p1; pressed=activebtn'],
  ['hub-passive-hover', 'Pointer over character 248', 'p1; hover=passivebtn'],
  ['hub-passive-pressed', 'Pointer down on character 248', 'p1; pressed=passivebtn'],
  ...treeStates,
  ['bind-p1', 'P1 opens character 417 from a learned skill', 'p1; slotFrames=1; source skill present'],
  ['bind-p2', 'P2 opens character 417 from a learned skill', 'p2; slotFrames=2; source skill present'],
  ['bind-dragging', 'Pointer drags the source skill', 'p1; source=startDrag'],
  ['bind-dropped', 'Source hits a 76x76 slot and snaps to slot+5,+5', 'p1; drop=Ymc; pending only'],
  ['bind-returned', 'Source misses every slot and returns to ox,oy', 'p1; drop=miss'],
  ['bind-close-hover', 'Pointer over character 337 x_btn', 'p1; hover=x_btn'],
  ['bind-close-pressed', 'Pointer down on character 337 x_btn', 'p1; pressed=x_btn; submit on click'],
  ['passive-p1', 'P1 selects the passive page', 'p1; five dynamic rows'],
  ['passive-p2', 'P2 selects the passive page', 'p2; five dynamic rows'],
  ['passive-dynamic-fields', 'Passive rows project current/next values and soul costs', 'p1; levels=1,2,3,4,5'],
  ['passive-upgrade-hover', 'Pointer over a row character 207', 'p1; hover=pskill1.btn'],
  ['passive-upgrade-pressed', 'Pointer down on a row character 207', 'p1; pressed=pskill1.btn'],
  ['passive-max-level', 'Level 10 hides the row upgrade button', 'p1; pskill1.level=10; btn.visible=false'],
  ['closed-return', 'Character 240 returns to maping/gameing and removes character 250', 'page removed; origin resumed'],
];
const stateIds = stateSpecs.map(([id]) => id);
const closedStateIds = new Set(['closed-return']);
const openStateIds = stateIds.filter((id) => !closedStateIds.has(id));
const passiveStateIds = stateIds.filter((id) => id.startsWith('passive-'));
const bindStateIds = stateIds.filter((id) => id.startsWith('bind-'));
const activeStateIds = openStateIds.filter((id) => !passiveStateIds.includes(id));

function assertSourcePattern(sourcePath, pattern, description) {
  const source = readFileSync(path.join(root, sourcePath), 'utf8');
  if (!pattern.test(source)) throw new Error(`${sourcePath} no longer proves ${description}`);
}
assertSourcePattern(as3Paths.buy, /new\s+SelectWK|playerControl|setTxtlh/, 'dynamic role selectors, child-page ownership and soul projection');
assertSourcePattern(as3Paths.active, /mainskillmc|SkillSetControl|gotoAndStop/, 'ten active trees and binding-page creation');
assertSourcePattern(as3Paths.bind, /startDrag|hitTestObject|unshift/, 'drag, 76x76 hit and close-time ordering behavior');
assertSourcePattern(as3Paths.passiveControl, /pskill[1-5]|setRole/, 'five passive-row owner projections');
assertSourcePattern(as3Paths.passiveRow, /skilllevel\s*\*\s*5000|gotoAndStop|生命上限增加/, 'passive frame selection, fields and upgrade formula');

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function spriteDirectory(characterId) {
  const directory = readdirSync(path.join(root, `${taskOutput}/exports-svg`), { withFileTypes: true })
    .find((entry) => entry.isDirectory() && entry.name.startsWith(`DefineSprite_${characterId}_`));
  if (!directory) throw new Error(`Missing FFDec SVG export for character ${characterId}`);
  return `${taskOutput}/exports-svg/${directory.name}`;
}

function spriteSvg(characterId, frame = 1) {
  return `${spriteDirectory(characterId)}/${frame}.svg`;
}

function parseRootUses(svgPath) {
  const svg = readFileSync(path.join(root, svgPath), 'utf8');
  const size = attributes(svg.match(/<svg\b[^>]*>/)?.[0] ?? '');
  const group = svg.match(/<g transform="matrix\(([^)]*)\)">\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if (!group) throw new Error(`Unable to locate root display list in ${svgPath}`);
  const outer = matrix(...group[1].split(',').map(Number));
  const uses = [...group[2].matchAll(/<use\b[^>]*\/>/g)].map((entry) => {
    const attrs = attributes(entry[0]);
    const values = attrs.transform.match(/matrix\(([^)]*)\)/)?.[1].split(',').map(Number);
    if (!values) throw new Error(`Missing child matrix in ${svgPath}`);
    return {
      characterId: Number(attrs['ffdec:characterId']),
      instanceName: attrs.id ?? null,
      symbolClass: attrs['ffdec:characterName'] ?? null,
      href: attrs['xlink:href'].slice(1),
      width: Number(attrs.width),
      height: Number(attrs.height),
      matrix: matrix(...values),
    };
  });
  return {
    svgPath,
    outer,
    visibleBounds: bounds(-outer.tx, -outer.ty, Number.parseFloat(size.width), Number.parseFloat(size.height)),
    uses,
  };
}

const swfRaw = readFileSync(path.join(root, swfPath));
const swfBody = swfRaw.subarray(0, 3).toString('ascii') === 'CWS' ? inflateSync(swfRaw.subarray(8)) : swfRaw.subarray(8);
const swf = swfRaw.subarray(0, 3).toString('ascii') === 'CWS' ? Buffer.concat([Buffer.from('FWS'), swfRaw.subarray(3, 8), swfBody]) : swfRaw;
const headerRect = readRect(swf, 8);

function parseSpriteFrames(characterId) {
  const spriteTag = iterateTags(swf, headerRect.nextOffset + 4, swf.length)
    .find((tag) => tag.code === 39 && swf.readUInt16LE(tag.offset) === characterId);
  if (!spriteTag) throw new Error(`DefineSprite character ${characterId} not found`);
  const expectedFrames = swf.readUInt16LE(spriteTag.offset + 2);
  const depths = new Map();
  const frames = [];
  for (const tag of iterateTags(swf, spriteTag.offset + 4, spriteTag.end)) {
    if (tag.code === 1) {
      frames.push([...depths.values()].sort((left, right) => left.depth - right.depth).map((entry) => ({ ...entry })));
      continue;
    }
    if (tag.code === 5) {
      depths.delete(swf.readUInt16LE(tag.offset + 2));
      continue;
    }
    if (tag.code === 28) {
      depths.delete(swf.readUInt16LE(tag.offset));
      continue;
    }
    const parsed = parsePlaceObject(tag, depths);
    if (parsed) depths.set(parsed.depth, parsed);
  }
  if (frames.length !== expectedFrames) throw new Error(`${characterId} frame mismatch: SWF=${expectedFrames}, parsed=${frames.length}`);
  return frames;
}

function parsePlaceObject(tag, existing) {
  let cursor;
  let characterId = null;
  let instanceName = null;
  let localMatrix = null;
  let depth;
  if (tag.code === 4) {
    characterId = swf.readUInt16LE(tag.offset);
    depth = swf.readUInt16LE(tag.offset + 2);
    localMatrix = readMatrix(swf, tag.offset + 4).matrix;
  } else if (tag.code === 26) {
    const flags = swf[tag.offset];
    depth = swf.readUInt16LE(tag.offset + 1);
    cursor = tag.offset + 3;
    if (flags & 0x02) { characterId = swf.readUInt16LE(cursor); cursor += 2; }
    if (flags & 0x04) { const parsed = readMatrix(swf, cursor); localMatrix = parsed.matrix; cursor = parsed.nextOffset; }
    if (flags & 0x08) cursor = skipCxform(swf, cursor, false);
    if (flags & 0x10) cursor += 2;
    if (flags & 0x20) instanceName = readCString(swf, cursor, tag.end).value;
  } else if (tag.code === 70) {
    const flags1 = swf[tag.offset];
    const flags2 = swf[tag.offset + 1];
    depth = swf.readUInt16LE(tag.offset + 2);
    cursor = tag.offset + 4;
    if ((flags2 & 0x08) || ((flags2 & 0x10) && (flags1 & 0x02))) cursor = readCString(swf, cursor, tag.end).nextOffset;
    if (flags1 & 0x02) { characterId = swf.readUInt16LE(cursor); cursor += 2; }
    if (flags1 & 0x04) { const parsed = readMatrix(swf, cursor); localMatrix = parsed.matrix; cursor = parsed.nextOffset; }
    if (flags1 & 0x08) cursor = skipCxform(swf, cursor, true);
    if (flags1 & 0x10) cursor += 2;
    if (flags1 & 0x20) instanceName = readCString(swf, cursor, tag.end).value;
  } else {
    return null;
  }
  const previous = existing.get(depth);
  return {
    characterId: characterId ?? previous?.characterId ?? null,
    instanceName: instanceName ?? previous?.instanceName ?? null,
    depth,
    matrix: localMatrix ?? previous?.matrix ?? matrix(),
  };
}

function crossCheckedSource(characterId, expectedFrames, expectedCounts) {
  const rawFrames = parseSpriteFrames(characterId);
  const frames = Array.from({ length: expectedFrames }, (_, index) => {
    const parsed = parseRootUses(spriteSvg(characterId, index + 1));
    const raw = rawFrames[index];
    if (parsed.uses.length !== expectedCounts[index] || raw.length !== expectedCounts[index]) {
      throw new Error(`${characterId} frame ${index + 1} display-list mismatch: expected=${expectedCounts[index]}, SVG=${parsed.uses.length}, SWF=${raw.length}`);
    }
    parsed.uses.forEach((use, childIndex) => {
      const source = raw[childIndex];
      if (use.characterId !== source.characterId || use.instanceName !== source.instanceName) {
        throw new Error(`${characterId} frame ${index + 1} child ${childIndex} mismatch: SVG=${use.characterId}/${use.instanceName}, SWF=${source.characterId}/${source.instanceName}`);
      }
      use.depth = source.depth;
    });
    return parsed;
  });
  return { characterId, frames };
}

const sources = {
  hub: crossCheckedSource(250, 1, [5]),
  active: crossCheckedSource(868, 1, [14]),
  bind: crossCheckedSource(417, 1, [8]),
  passive: crossCheckedSource(213, 1, [6]),
  passiveRow: crossCheckedSource(212, 5, [6, 6, 6, 6, 6]),
  tree: crossCheckedSource(865, 10, [16, 17, 16, 16, 16, 16, 16, 16, 16, 16]),
  selector1: crossCheckedSource(218, 2, [1, 1]),
  selector2: crossCheckedSource(223, 2, [1, 1]),
  selector3: crossCheckedSource(228, 2, [1, 1]),
  selector4: crossCheckedSource(233, 2, [1, 1]),
  selector5: crossCheckedSource(871, 2, [1, 1]),
};
const activeSkillCharacterIds = [...new Set(sources.tree.frames.flatMap((frame) => frame.uses)
  .filter((use) => /^skill[1-5]$/.test(use.instanceName ?? ''))
  .map((use) => use.characterId))];
if (activeSkillCharacterIds.length !== 50) throw new Error(`Expected 50 unique active-skill sprites, found ${activeSkillCharacterIds.length}`);
for (const characterId of activeSkillCharacterIds) {
  const frames = parseSpriteFrames(characterId);
  if (frames.length !== 3) throw new Error(`Active-skill sprite ${characterId} has ${frames.length} SWF frames instead of 3`);
  for (const frame of [1, 2, 3]) parseRootUses(spriteSvg(characterId, frame));
}

function compose(parent, child) {
  return matrix(
    parent.a * child.a + parent.c * child.b,
    parent.b * child.a + parent.d * child.b,
    parent.a * child.c + parent.c * child.d,
    parent.b * child.c + parent.d * child.d,
    parent.a * child.tx + parent.c * child.ty + parent.tx,
    parent.b * child.tx + parent.d * child.ty + parent.ty,
  );
}

function transformedBounds(localBounds, transform) {
  const points = [
    [localBounds.left, localBounds.top],
    [localBounds.left + localBounds.width, localBounds.top],
    [localBounds.left, localBounds.top + localBounds.height],
    [localBounds.left + localBounds.width, localBounds.top + localBounds.height],
  ].map(([x, y]) => ({ x: transform.a * x + transform.c * y + transform.tx, y: transform.b * x + transform.d * y + transform.ty }));
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  return bounds(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function objectType(use) {
  if (use.href.startsWith('shape')) return 'shape';
  if (use.href.startsWith('text')) return 'text-field';
  if (use.href.startsWith('button')) return 'button';
  return 'sprite';
}

const buttonIds = new Set([207, 240, 244, 248, 337, 580, 638]);
const buttonStateAssets = (characterId) => buttonIds.has(characterId) ? {
  up: `${taskOutput}/exports-png/DefineButton2_${characterId}/1_up.png`,
  over: `${taskOutput}/exports-png/DefineButton2_${characterId}/2_over.png`,
  down: `${taskOutput}/exports-png/DefineButton2_${characterId}/3_down.png`,
  hit: `${taskOutput}/exports-png/DefineButton2_${characterId}/4_hittest.png`,
} : undefined;

const displayObjects = [];
function appendRoot(key, id, states, symbolClass, skip = () => false) {
  const source = sources[key].frames[0];
  displayObjects.push({
    id, parentId: null, depth: key === 'hub' ? 0 : key === 'bind' ? 200 : 100, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId: sources[key].characterId, symbolClass, instanceName: null, frame: 1 },
    placements: states.map((stateId) => placement(stateId, matrix(), source.visibleBounds, source.visibleBounds, 'extracted', [`othermat1-swf:character-${sources[key].characterId}-frame-1`])),
    render: render(source.svgPath),
  });
  for (const use of source.uses.filter((candidate) => !skip(candidate))) {
    const type = objectType(use);
    const localBounds = bounds(0, 0, use.width, use.height);
    const stageBounds = transformedBounds(localBounds, use.matrix);
    const assets = buttonStateAssets(use.characterId);
    displayObjects.push({
      id: `${id}.${use.instanceName ?? type}-${use.characterId}-depth-${use.depth}`,
      parentId: id,
      depth: use.depth,
      objectType: type,
      sourceIdentity: { provenanceId: 'othermat1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: 1 },
      placements: states.map((stateId) => placement(stateId, use.matrix, localBounds, stageBounds, 'extracted', [`othermat1-swf:character-${sources[key].characterId}-depth-${use.depth}`], type === 'button' ? { hitArea: stageBounds } : {})),
      render: render(`${source.svgPath}#${use.href}`, {
        ...(type === 'text-field' ? { textStyle: { dynamic: use.instanceName, font: 'FZCuYuan-M03', source: 'AS3 setRole/setTxt projection' } } : {}),
        ...(assets ? { buttonStateAssets: assets } : {}),
      }),
    });
  }
}

appendRoot('hub', 'skill-hub-root', openStateIds, 'export.shop.BuySkill');
appendRoot('active', 'active-page-root', activeStateIds, 'export.shop.SkillControl', (use) => use.characterId === 865);
appendRoot('bind', 'bind-page-root', bindStateIds, 'export.shop.SkillSetControl');
appendRoot('passive', 'passive-page-root', passiveStateIds, 'export.shop.PassiveSkillControl', (use) => use.characterId === 212);

const selectorSpecs = [
  { role: 1, characterId: 218, symbolClass: 'export.shop.SelectWK', sourceKey: 'selector1' },
  { role: 2, characterId: 223, symbolClass: 'export.shop.SelectTS', sourceKey: 'selector2' },
  { role: 3, characterId: 228, symbolClass: 'export.shop.SelectSS', sourceKey: 'selector3' },
  { role: 4, characterId: 233, symbolClass: 'export.shop.SelectBJ', sourceKey: 'selector4' },
  { role: 5, characterId: 871, symbolClass: 'export.shop.SelectBL', sourceKey: 'selector5' },
];
for (const selector of selectorSpecs) {
  for (const frame of [1, 2]) {
    const selectorSource = sources[selector.sourceKey].frames[frame - 1];
    const selectorPlacements = [];
    for (const stateId of openStateIds) {
      const roleMatch = stateId.match(/^active-role([1-5])-tree/);
      const selectedRole = roleMatch ? Number(roleMatch[1]) : (stateId.includes('-p2') || stateId === 'hub-active-p2' ? 2 : 1);
      const presentRoles = selectedRole === 1 ? [1, 2] : [1, selectedRole];
      const position = presentRoles.indexOf(selector.role);
      if (position < 0 || frame !== (selector.role === selectedRole ? 2 : 1)) continue;
      const selectorMatrix = matrix(1, 0, 0, 1, 50 + position * 90, 14.85);
      const selectorBounds = transformedBounds(selectorSource.visibleBounds, selectorMatrix);
      selectorPlacements.push(placement(stateId, selectorMatrix, selectorSource.visibleBounds, selectorBounds, 'calculated', ['buy-skill-as:dynamic-selectors', `othermat1-swf:character-${selector.characterId}-frame-${frame}`]));
    }
    if (selectorPlacements.length === 0) continue;
    displayObjects.push({
      id: `skill-hub-root.role${selector.role}-selector-frame-${frame}`,
      parentId: 'skill-hub-root', depth: 100 + selector.role, objectType: 'movie-clip',
      sourceIdentity: { provenanceId: 'othermat1-swf', characterId: selector.characterId, symbolClass: selector.symbolClass, instanceName: `role${selector.role}Selector`, frame },
      placements: selectorPlacements,
      render: render(selectorSource.svgPath),
    });
  }
}

const activeTreeUse = sources.active.frames[0].uses.find((use) => use.characterId === 865);
if (!activeTreeUse) throw new Error('Character 868 no longer contains mainskillmc character 865');
const skillFramePattern = [3, 2, 1, 2, 3];
for (const [stateId, , , frame] of treeStates) {
  const treeSource = sources.tree.frames[frame - 1];
  const treeBounds = transformedBounds(treeSource.visibleBounds, activeTreeUse.matrix);
  const treeId = `active-page-root.tree-frame-${frame}`;
  displayObjects.push({
    id: treeId, parentId: 'active-page-root', depth: activeTreeUse.depth, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId: 865, symbolClass: 'OtherMat_fla.Timeline_139', instanceName: 'mainskillmc', frame },
    placements: [placement(stateId, activeTreeUse.matrix, treeSource.visibleBounds, treeBounds, 'extracted', [`othermat1-swf:character-865-frame-${frame}`])],
    render: render(treeSource.svgPath),
  });
  for (const use of treeSource.uses) {
    const slotMatch = use.instanceName?.match(/^skill([1-5])$/);
    const sourceFrame = slotMatch ? skillFramePattern[Number(slotMatch[1]) - 1] : 1;
    const type = objectType(use);
    const childMatrix = compose(activeTreeUse.matrix, use.matrix);
    const localBounds = bounds(0, 0, use.width, use.height);
    const stageBounds = transformedBounds(localBounds, childMatrix);
    const assets = buttonStateAssets(use.characterId);
    displayObjects.push({
      id: `${treeId}.${use.instanceName ?? type}-${use.characterId}-depth-${use.depth}`,
      parentId: treeId, depth: use.depth, objectType: type,
      sourceIdentity: { provenanceId: 'othermat1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: sourceFrame },
      placements: [placement(stateId, use.matrix, localBounds, stageBounds, 'extracted', [`othermat1-swf:character-865-frame-${frame}-depth-${use.depth}`], type === 'button' ? { hitArea: stageBounds } : {})],
      render: render(slotMatch ? spriteSvg(use.characterId, sourceFrame) : `${treeSource.svgPath}#${use.href}`, {
        ...(assets ? { buttonStateAssets: assets } : {}),
        ...(slotMatch && sourceFrame === 3 ? { textStyle: { dynamic: 'LV.n child at local (35,48)', font: 'FZCuYuan-M03', source: 'SkillControl learned-skill addChild' } } : {}),
      }),
    });
  }
}

const passiveRows = sources.passive.frames[0].uses.filter((use) => use.characterId === 212);
for (let index = 0; index < passiveRows.length; index += 1) {
  const rowUse = passiveRows[index];
  const frame = index + 1;
  const rowSource = sources.passiveRow.frames[index];
  const rowId = `passive-page-root.pskill${frame}`;
  const rowBounds = transformedBounds(rowSource.visibleBounds, rowUse.matrix);
  displayObjects.push({
    id: rowId, parentId: 'passive-page-root', depth: rowUse.depth, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId: 212, symbolClass: 'export.shop.PassiveSkill', instanceName: `pskill${frame}`, frame },
    placements: passiveStateIds.map((stateId) => placement(stateId, rowUse.matrix, rowSource.visibleBounds, rowBounds, 'extracted', [`othermat1-swf:character-212-frame-${frame}`])),
    render: render(rowSource.svgPath),
  });
  for (const use of rowSource.uses) {
    const type = objectType(use);
    const composed = compose(rowUse.matrix, use.matrix);
    const localBounds = bounds(0, 0, use.width, use.height);
    const stageBounds = transformedBounds(localBounds, composed);
    const states = use.instanceName === 'btn' ? passiveStateIds.filter((id) => !(id === 'passive-max-level' && frame === 1)) : passiveStateIds;
    const assets = buttonStateAssets(use.characterId);
    displayObjects.push({
      id: `${rowId}.${use.instanceName ?? type}-${use.characterId}-depth-${use.depth}`,
      parentId: rowId, depth: use.depth, objectType: type,
      sourceIdentity: { provenanceId: 'othermat1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: 1 },
      placements: states.map((stateId) => placement(stateId, use.matrix, localBounds, stageBounds, 'extracted', [`othermat1-swf:character-212-frame-${frame}-depth-${use.depth}`], type === 'button' ? { hitArea: stageBounds } : {})),
      render: render(`${rowSource.svgPath}#${use.href}`, {
        ...(type === 'text-field' ? { textStyle: { dynamic: use.instanceName, font: 'FZCuYuan-M03', source: 'PassiveSkill.setTxt/analy' } } : {}),
        ...(assets ? { buttonStateAssets: assets } : {}),
      }),
    });
  }
}

const bindDynamicSpecs = [
  ['source-skill', 'sourcemc', 421.95, 233, 'Current learned skill imgSprite plus character 422 highlight'],
  ['slot-y-skill', 'Ymc', 235.95, 344, 'Current Y/8 binding plus Skill_key child'],
  ['slot-u-skill', 'Umc', 329.95, 344, 'Current U/4 binding plus Skill_key child'],
  ['slot-i-skill', 'Imc', 421.95, 344, 'Current I/5 binding plus Skill_key child'],
  ['slot-o-skill', 'Omc', 514.95, 344, 'Current O/6 binding plus Skill_key child'],
  ['slot-l-skill', 'Lmc', 607.95, 344, 'Current L/3 binding plus Skill_key child'],
];
for (let index = 0; index < bindDynamicSpecs.length; index += 1) {
  const [suffix, instanceName, tx, ty, source] = bindDynamicSpecs[index];
  const localBounds = bounds(0, 0, 66, 66);
  const localMatrix = matrix(1, 0, 0, 1, tx, ty);
  const stageBounds = transformedBounds(localBounds, localMatrix);
  displayObjects.push({
    id: `bind-page-root.${suffix}`, parentId: 'bind-page-root', depth: 100 + index, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'skill-set-control-as', characterId: null, symbolClass: 'Skill.imgSprite', instanceName, frame: 3 },
    placements: bindStateIds.map((stateId) => placement(stateId, localMatrix, localBounds, stageBounds, 'calculated', ['skill-set-control-as:dynamic-icons-and-hitTestObject'])),
    render: render('dynamic:current-skill-imgSprite-frame-3', { textStyle: { dynamic: 'ShowSkillKey/Skill_key child', source } }),
  });
}

const baselineSpecs = [
  ...treeStates.map(([stateId]) => [stateId, stateId]),
  ['bind-p1', 'bind-p1'],
  ['bind-p2', 'bind-p2'],
  ['passive-p1', 'passive-p1'],
  ['passive-p2', 'passive-p2'],
  ['closed-return', 'closed-return'],
];
const baselineForState = (stateId) => {
  if (stateId === 'closed-return') return 'original-closed-return-940x590';
  if (stateId.startsWith('bind-')) return stateId === 'bind-p2' ? 'original-bind-p2-940x590' : 'original-bind-p1-940x590';
  if (stateId.startsWith('passive-')) return stateId === 'passive-p2' ? 'original-passive-p2-940x590' : 'original-passive-p1-940x590';
  const tree = treeStates.find(([id]) => id === stateId);
  if (tree) return `original-${stateId}-940x590`;
  return stateId === 'hub-active-p2' ? 'original-active-role2-tree1-p2-940x590' : 'original-active-role1-tree1-p1-940x590';
};
const baselines = baselineSpecs.map(([id, stateId]) => {
  const baselinePath = `${baselineRoot}/original-${id}-940x590.png`;
  return { id: `original-${id}-940x590`, stateId, path: baselinePath, sha256: sha256(baselinePath), width: 940, height: 590, crop: bounds(0, 0, 940, 590) };
});
const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((entry) => entry.stateId === stateId && entry.visible)).length;

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-175d.skill-pages',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-175D',
    surfaceId: 'skill-pages-characters-250-868-417-213',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Complete four-page root display lists, ten active-tree frames with fifty three-frame skill icons, two-owner selectors/binding slots, five passive rows, button states, dynamic fields and return lifecycle.',
  },
  generatedBy: { tool: 'generate-skill-pages-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-08-16T14:50:00+08:00' },
  provenance: [
    { id: 'othermat1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: 'characters 250/868/417/213; nested 212 frames 1..5, 865 frames 1..10, role selectors, P1/P2 slots and buttons; raw DefineSprite PlaceObject depth/matrix cross-checked with selective FFDec 26 SVG/PNG exports.' },
    { id: 'buy-skill-as', sourceType: 'legacy-as3', sourcePath: as3Paths.buy, sha256: sha256(as3Paths.buy), locator: 'added/setRole/selectRole/active/passive/back/setTxtlh: dynamic selectors, child-page switching, owner and return.' },
    { id: 'skill-control-as', sourceType: 'legacy-as3', sourcePath: as3Paths.active, sha256: sha256(as3Paths.active), locator: 'setRole/setMainSkill/showSkill/updataMainSkill/openSkillSet: ten trees, three skill states, LV.n child and shared transient feedback.' },
    { id: 'skill-set-control-as', sourceType: 'legacy-as3', sourcePath: as3Paths.bind, sha256: sha256(as3Paths.bind), locator: 'setRole/initSkill/move/down/up/close: source and five slot children, startDrag/hitTestObject, +5,+5 snap, miss return, P1/P2 keys and x_btn submit.' },
    { id: 'passive-control-as', sourceType: 'legacy-as3', sourcePath: as3Paths.passiveControl, sha256: sha256(as3Paths.passiveControl), locator: 'five pskill rows receive the selected User.' },
    { id: 'passive-row-as', sourceType: 'legacy-as3', sourcePath: as3Paths.passiveRow, sha256: sha256(as3Paths.passiveRow), locator: 'added/setRole/setTxt/analy/updataSkill: row frame from instance name, four fields, five formulas, level/soul gates and level-10 hidden button.' },
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states: stateSpecs.map(([id, entry, fixtureId, frame]) => ({ id, entry, frame: closedStateIds.has(id) ? 0 : frame ?? 1, fixtureId, baselineId: baselineForState(id) })),
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds: stateIds,
    extractedStateIds: stateIds,
    expectedVisibleObjectCountByState: Object.fromEntries(stateIds.map((id) => [id, visibleCount(id)])),
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: [
    'docs/reverse-engineering/evidence/TASK-SETTINGS-175D-skill-pages.md',
    'docs/reverse-engineering/skill-ui-native-index.md#task-settings-175d-机器真值迁移',
    'docs/reverse-engineering/evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md',
  ],
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const current = readFileSync(path.join(root, outputPath), 'utf8');
  if (current !== serialized) throw new Error(`${outputPath} is stale; run ${command}`);
  console.log(`Verified ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states, 50 active icons x 3 source frames.`);
} else {
  writeFileSync(path.join(root, outputPath), serialized);
  console.log(`Generated ${outputPath}: ${displayObjects.length} objects, ${stateSpecs.length} states, 50 active icons x 3 source frames.`);
}

function iterateTags(buffer, start, end) {
  const result = [];
  let cursor = start;
  while (cursor + 2 <= end) {
    const header = buffer.readUInt16LE(cursor);
    cursor += 2;
    const code = header >> 6;
    let length = header & 0x3f;
    if (length === 0x3f) { length = buffer.readUInt32LE(cursor); cursor += 4; }
    const tagEnd = cursor + length;
    if (tagEnd > end) break;
    result.push({ code, offset: cursor, end: tagEnd });
    cursor = tagEnd;
    if (code === 0) break;
  }
  return result;
}
function readRect(buffer, offset) {
  const bits = new BitReader(buffer, offset);
  const count = bits.readUnsigned(5);
  bits.readSigned(count); bits.readSigned(count); bits.readSigned(count); bits.readSigned(count); bits.align();
  return { nextOffset: bits.byteOffset };
}
function readMatrix(buffer, offset) {
  const bits = new BitReader(buffer, offset);
  let a = 1; let d = 1; let b = 0; let c = 0;
  if (bits.readUnsigned(1)) { const count = bits.readUnsigned(5); a = bits.readSigned(count) / 65536; d = bits.readSigned(count) / 65536; }
  if (bits.readUnsigned(1)) { const count = bits.readUnsigned(5); b = bits.readSigned(count) / 65536; c = bits.readSigned(count) / 65536; }
  const count = bits.readUnsigned(5);
  const tx = bits.readSigned(count) / 20;
  const ty = bits.readSigned(count) / 20;
  bits.align();
  return { matrix: matrix(a, b, c, d, tx, ty), nextOffset: bits.byteOffset };
}
function skipCxform(buffer, offset, withAlpha) {
  const bits = new BitReader(buffer, offset);
  const hasAdd = bits.readUnsigned(1);
  const hasMult = bits.readUnsigned(1);
  const count = bits.readUnsigned(4);
  const channels = withAlpha ? 4 : 3;
  if (hasMult) for (let index = 0; index < channels; index += 1) bits.readSigned(count);
  if (hasAdd) for (let index = 0; index < channels; index += 1) bits.readSigned(count);
  bits.align();
  return bits.byteOffset;
}
function BitReader(buffer, byteOffset) {
  this.buffer = buffer;
  this.byteOffset = byteOffset;
  this.bitOffset = 0;
  this.readUnsigned = (count) => {
    let value = 0;
    for (let index = 0; index < count; index += 1) {
      value = value * 2 + ((this.buffer[this.byteOffset] >> (7 - this.bitOffset)) & 1);
      this.bitOffset += 1;
      if (this.bitOffset === 8) { this.bitOffset = 0; this.byteOffset += 1; }
    }
    return value;
  };
  this.readSigned = (count) => {
    if (!count) return 0;
    const value = this.readUnsigned(count);
    const sign = 2 ** (count - 1);
    return value >= sign ? value - 2 ** count : value;
  };
  this.align = () => { if (this.bitOffset) { this.bitOffset = 0; this.byteOffset += 1; } };
}
function readCString(buffer, offset, end) {
  const zero = buffer.indexOf(0, offset);
  const safeEnd = zero < 0 || zero > end ? end : zero;
  return { value: buffer.subarray(offset, safeEnd).toString('utf8'), nextOffset: Math.min(safeEnd + 1, end) };
}
