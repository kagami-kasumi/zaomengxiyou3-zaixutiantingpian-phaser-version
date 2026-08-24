import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const root = process.cwd();
const check = process.argv.includes('--check');
const selfTest = process.argv.includes('--self-test');
const ffdec = 'C:/Program Files (x86)/FFDec/ffdec-cli.exe';
const source = {
  swf: 'local-resources/regima/source/restored-swfs/assets/pet1.swf',
  xml: 'local-resources/regima/task-outputs/task-settings-175a-pet-page/pet1.xml',
  corpus: 'docs/reverse-engineering/pet-animation-corpus.json',
  petInfo: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/petInfo/PetInfo.as',
  showPetInfo: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/ShowPetInfo.as',
  roleInfo: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/RoleInfo.as',
  gameInfo: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/GameInfo.as',
};
const taskOutput = 'local-resources/regima/task-outputs/task-settings-201-pet-combat-hud-head';
const exportRoot = `${taskOutput}/export`;
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-201/head';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-201-pet-combat-hud-head.json';
const reportPath = 'docs/reverse-engineering/ground-truth/reports/task-settings-201-pet-combat-hud-head-completeness.json';
const command = 'npm run generate:pet-combat-hud-head-truth';
const owners = ['p1', 'p2'];
const negativeFixtures = [
  ['no-active-p1', 'P1 findCurrentPet() returns null; RoleInfo.removePetHead removes character 662/657.'],
  ['rested-p1', 'P1 current pet is rested; CHANGECURRENTPET removes character 662/657.'],
  ['no-active-p2', 'P2 findCurrentPet() returns null; RoleInfo.removePetHead removes character 662/657.'],
  ['rested-p2', 'P2 current pet is rested; CHANGECURRENTPET removes character 662/657.'],
];

const absolute = (relative) => path.join(root, relative);
const hashBuffer = (value) => createHash('sha256').update(value).digest('hex');
const sha256 = (relative) => hashBuffer(readFileSync(absolute(relative)));
const round = (value) => Math.round(value * 1000) / 1000;
const point = (x, y) => ({ x: round(x), y: round(y) });
const bounds = (left, top, width, height) => ({ left: round(left), top: round(top), width: round(width), height: round(height) });
const matrix = (a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) => ({ a: round(a), b: round(b), c: round(c), d: round(d), tx: round(tx), ty: round(ty) });
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
const slug = (value) => value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

if (!check) extractFrames();

const corpus = JSON.parse(readFileSync(absolute(source.corpus), 'utf8'));
const expectedPetKeys = corpus.species.flatMap((species) => species.forms.map((form) => `${species.species}${form.form}`));
if (expectedPetKeys.length !== 35 || new Set(expectedPetKeys).size !== 35) {
  throw new Error(`pet-animation-corpus must independently declare exactly 35 unique pet fixtures, got ${expectedPetKeys.length}.`);
}

const petInfoText = readFileSync(absolute(source.petInfo), 'utf8');
const chinaNameByPetKey = new Map([...petInfoText.matchAll(/case "([a-z]+\d+)":\s*this\.petChinaName = "([^"]+)";/g)]
  .map((match) => [match[1], match[2]]));
const expectedFixtures = expectedPetKeys.map((petKey) => {
  const chineseName = chinaNameByPetKey.get(petKey);
  if (!chineseName) throw new Error(`PetInfo.transPetChinaName does not map declared corpus fixture ${petKey}.`);
  return { petKey, chineseName };
});

const xml = readFileSync(absolute(source.xml), 'utf8');
const timeline657 = parseSpriteTimeline(xml, 657);
if (timeline657.frameCount !== 42 || timeline657.frames.length !== 42) throw new Error('Character 657 must contain 42 extracted frames.');
const extractedByLabel = new Map(timeline657.frames.map((frame) => [frame.label, frame]));
if (extractedByLabel.size !== 42) throw new Error('Character 657 frame labels must be unique across all 42 frames.');

const shapeDefinitions = parseShapeDefinitions(xml);
const headPlacement = parseNamedPlacement(xml, 662, 'headmc');
if (headPlacement.characterId !== 657 || headPlacement.depth !== 12) throw new Error('Character 662 headmc no longer resolves to character 657 at depth 12.');

const svg657Directory = locateExportDirectory(`${exportRoot}/svg`, 'DefineSprite_657_');
const png657Directory = locateExportDirectory(`${exportRoot}/png`, 'DefineSprite_657_');
const svg662Directory = locateExportDirectory(`${exportRoot}/svg`, 'DefineSprite_662_');
const headSvgPlacement = parseSvgUse(`${relative(svg662Directory)}/1.svg`, 657);
assertMatrixEqual(headPlacement.localMatrix, headSvgPlacement.matrix, 'character 662 XML/SVG headmc matrix');

const roleInfoText = readFileSync(absolute(source.roleInfo), 'utf8');
const gameInfoText = readFileSync(absolute(source.gameInfo), 'utf8');
const roleY = Number(roleInfoText.match(/this\.petHead\.y = ([-\d.]+);/)?.[1]);
const ownerSpacing = Number(gameInfoText.match(/_loc3_\.x = _loc2_ \* ([-\d.]+);/)?.[1]);
if (!Number.isFinite(roleY) || !Number.isFinite(ownerSpacing) || !/AUtils\.flipHorizontal\(_loc3_,-1\)/.test(gameInfoText)) {
  throw new Error('RoleInfo/GameInfo no longer prove pet-head y and P2 mirrored owner projection.');
}
const ownerMatrices = {
  p1: matrix(1, 0, 0, 1, 0, roleY),
  p2: matrix(-1, 0, 0, 1, ownerSpacing, roleY),
};

const fixtureFacts = expectedFixtures.map((fixture) => {
  const extracted = extractedByLabel.get(fixture.chineseName);
  if (!extracted) throw new Error(`Character 657 is missing target label ${fixture.chineseName} for ${fixture.petKey}.`);
  if (extracted.displayList.length !== 1) throw new Error(`${fixture.chineseName} frame ${extracted.frame} must have exactly one visible direct child.`);
  const child = extracted.displayList[0];
  const definition = shapeDefinitions.get(child.characterId);
  if (!definition) throw new Error(`${fixture.chineseName} child ${child.characterId} is not a terminal DefineShape; recursive expansion is unresolved.`);
  const svgPath = `${relative(svg657Directory)}/${extracted.frame}.svg`;
  const pngPath = `${relative(png657Directory)}/${extracted.frame}.png`;
  const svgUse = parseSvgUse(svgPath, child.characterId);
  const png = decodePng(pngPath);
  const alpha = alphaBounds(png);
  const alphaLocalBounds = bounds(alpha.left - svgUse.rootRegistration.x, alpha.top - svgUse.rootRegistration.y, alpha.width, alpha.height);
  assertSizeEqual(definition.bounds, bounds(0, 0, svgUse.width, svgUse.height), `${fixture.chineseName} XML shape bounds / FFDec SVG size`);
  assertRasterBoundsCoverVector(alphaLocalBounds, definition.bounds, `${fixture.chineseName} FFDec PNG alpha / XML vector bounds`);
  const baselineName = `${fixture.petKey}-frame-${String(extracted.frame).padStart(2, '0')}-${slug(fixture.chineseName)}.png`;
  const baselinePath = `${baselineRoot}/${baselineName}`;
  if (!check) copyFileSync(absolute(pngPath), absolute(baselinePath));
  if (!existsSync(absolute(baselinePath)) || sha256(baselinePath) !== sha256(pngPath)) throw new Error(`Baseline is missing or stale: ${baselinePath}`);
  return { ...fixture, targetFrame: extracted.frame, child, definition, svgUse, png, alpha, alphaLocalBounds, baselinePath };
});

const counterexample = fixtureFacts.find((fixture) => fixture.petKey === 'monkey2');
const counterexamplePath = 'docs/tasks/evidence/TASK-SETTINGS-201/monkey2-character-619-vs-657-union.svg';
const actualCanvasBounds = {
  left: counterexample.definition.bounds.left + counterexample.svgUse.rootRegistration.x,
  top: counterexample.definition.bounds.top + counterexample.svgUse.rootRegistration.y,
  width: counterexample.definition.bounds.width,
  height: counterexample.definition.bounds.height,
};
emit(counterexamplePath, `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="170" viewBox="0 0 620 170">
  <rect width="620" height="170" fill="#151922"/>
  <text x="18" y="24" fill="#fff" font-family="sans-serif" font-size="14">灵猴：character 657 frame 5 → character 619</text>
  <g transform="translate(18 42)">
    <image href="head/${path.basename(counterexample.baselinePath)}" width="105" height="94"/>
    <rect x="0.5" y="0.5" width="103.8" height="92.6" fill="none" stroke="#ff5364" stroke-width="1"/>
    <rect x="${round(actualCanvasBounds.left)}" y="${round(actualCanvasBounds.top)}" width="${round(actualCanvasBounds.width)}" height="${round(actualCanvasBounds.height)}" fill="none" stroke="#53e08d" stroke-width="1.5"/>
  </g>
  <g font-family="sans-serif" font-size="13">
    <text x="145" y="68" fill="#ff5364">红：旧 657 联合画布 104.8 × 93.6</text>
    <text x="145" y="94" fill="#53e08d">绿：frame 5 / character 619 矢量 bounds 46.75 × 40</text>
    <text x="145" y="120" fill="#c9d1dc">P1 stage bounds: (8.25, 95.55, 46.75, 40)</text>
    <text x="145" y="146" fill="#c9d1dc">旧画布不能作为单只头像尺寸；身体 atlas 也不是该 frame child。</text>
  </g>
</svg>\n`);

validateCompleteness(expectedFixtures, fixtureFacts);
if (selfTest) runMutationTests(expectedFixtures, fixtureFacts, headPlacement.localMatrix, headSvgPlacement.matrix);

const states = [];
const baselines = [];
const rootPlacements = [];
const childObjects = [];
const visibleCounts = {};
const stageClip = bounds(0, 0, 940, 590);

for (const fixture of fixtureFacts) {
  const childPlacements = [];
  for (const owner of owners) {
    const stateId = `${fixture.petKey}-${owner}`;
    const childToStage = compose(ownerMatrices[owner], compose(headPlacement.localMatrix, fixture.child.localMatrix));
    const parentBounds = transformBounds(fixture.definition.bounds, fixture.child.localMatrix);
    const stageBounds = transformBounds(fixture.definition.bounds, childToStage);
    const visibleBounds = intersectBounds(transformBounds(fixture.alphaLocalBounds, childToStage), stageClip);
    states.push({
      id: stateId,
      entry: `ShowPetInfo.show() -> headmc.gotoAndStop(PetInfo.getPetChinaName()) -> ${fixture.chineseName}`,
      frame: fixture.targetFrame,
      fixtureId: `${fixture.petKey}; chineseName=${fixture.chineseName}; owner=${owner}; root=character 657; child=character ${fixture.child.characterId}`,
      baselineId: `original-${stateId}`,
    });
    const placement = {
      stateId,
      visible: true,
      localMatrix: fixture.child.localMatrix,
      registrationPoint: fixture.svgUse.rootRegistration,
      localBounds: fixture.definition.bounds,
      parentBounds,
      stageBounds,
      visibleBounds,
      clipBounds: stageClip,
      alpha: 1,
      colorTransform: null,
      derivation: 'calculated',
      derivationMethod: `Character ${fixture.child.characterId} XML shape bounds composed through character 657 frame ${fixture.targetFrame}, character 662 headmc, RoleInfo y=${roleY}, and ${owner.toUpperCase()} GameInfo transform; visibleBounds cross-checks FFDec PNG alpha.`,
      evidenceRefs: ['pet1-swf', 'pet1-ffdec-xml', `baseline-${fixture.petKey}`, 'show-pet-info-as', 'role-info-as', 'game-info-as'],
    };
    childPlacements.push(placement);
    rootPlacements.push({ ...placement, localMatrix: headPlacement.localMatrix, registrationPoint: point(0, 0), localBounds: parentBounds });
    baselines.push({
      id: `original-${stateId}`,
      stateId,
      path: fixture.baselinePath,
      sha256: sha256(fixture.baselinePath),
      width: fixture.png.width,
      height: fixture.png.height,
      crop: bounds(fixture.alpha.left, fixture.alpha.top, fixture.alpha.width, fixture.alpha.height),
    });
    visibleCounts[stateId] = 3;
  }
  childObjects.push({
    id: `pet-combat-hud-head.${fixture.petKey}.character-${fixture.child.characterId}`,
    parentId: 'pet-combat-hud-head.character-657',
    depth: fixture.child.depth,
    objectType: 'shape',
    sourceIdentity: { provenanceId: 'pet1-swf', characterId: fixture.child.characterId, symbolClass: null, instanceName: null, frame: fixture.targetFrame },
    placements: childPlacements,
    render: { assetRef: fixture.baselinePath, blendMode: 'normal', filters: [], maskId: null },
  });
}

const negativeBaselinePath = `${baselineRoot}/negative-headmc-absent-940x590.svg`;
const negativeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="940" height="590" viewBox="0 0 940 590"><!-- character 657 absent by RoleInfo.removePetHead --></svg>\n';
emit(negativeBaselinePath, negativeSvg);
for (const [id, entry] of negativeFixtures) {
  states.push({ id, entry, frame: 0, fixtureId: id, baselineId: `original-${id}` });
  baselines.push({ id: `original-${id}`, stateId: id, path: negativeBaselinePath, sha256: sha256(negativeBaselinePath), width: 940, height: 590, crop: stageClip });
  visibleCounts[id] = 0;
}

const displayObjects = [
  {
    id: 'pet-combat-hud-projection.character-662', parentId: null, depth: 65, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'pet1-swf', characterId: 662, symbolClass: 'export.pet.ShowPetInfo', instanceName: null, frame: 1 },
    placements: rootPlacements.map((placement) => ({ ...placement, localMatrix: ownerMatrices[placement.stateId.endsWith('-p2') ? 'p2' : 'p1'] })),
    render: { assetRef: null, blendMode: 'normal', filters: [], maskId: null },
  },
  {
    id: 'pet-combat-hud-head.character-657', parentId: 'pet-combat-hud-projection.character-662', depth: 12, objectType: 'movie-clip',
    sourceIdentity: { provenanceId: 'pet1-swf', characterId: 657, symbolClass: 'pet1_fla.Sprite311_150', instanceName: 'headmc', frame: null },
    placements: rootPlacements,
    render: {
      assetRef: null,
      blendMode: 'normal',
      filters: [{ type: 'glow', color: '#000000', blurX: 5, blurY: 5, strength: 3.546875, passes: 1, innerGlow: false, knockout: false }],
      maskId: null,
    },
  },
  ...childObjects,
];

const expectedStateIds = [
  ...expectedFixtures.flatMap((fixture) => owners.map((owner) => `${fixture.petKey}-${owner}`)),
  ...negativeFixtures.map(([id]) => id),
];
const extractedStateIds = states.map((state) => state.id);
const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-201.pet-combat-hud-head',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-201',
    surfaceId: 'role-info-show-pet-info-character-657-state-recursive-head',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Character 657 dynamic pet-head selector expanded by the 35 supported species/form fixtures, with actual target frame, terminal child, source geometry, P1/P2 projection, glow semantics, and absent/rested negative states. Character 662 shell/bars/text remain owned by task-settings-191.pet-combat-hud.',
  },
  generatedBy: { tool: 'generate-pet-combat-hud-head-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-08-24T00:00:00+08:00' },
  provenance: [
    { id: 'pet1-swf', sourceType: 'restored-swf', sourcePath: source.swf, sha256: sha256(source.swf), locator: 'characters 657 and 662; FFDec 26 selective sprite SVG/PNG exports generated under task-settings-201-pet-combat-hud-head/export.' },
    { id: 'pet1-ffdec-xml', sourceType: 'ffdec-xml', sourcePath: source.xml, sha256: sha256(source.xml), locator: 'character 657: 42 labeled timeline frames and PlaceObject/RemoveObject display state; characters 615..656 terminal DefineShape bounds; character 662 headmc depth/matrix/filter.' },
    { id: 'pet-animation-corpus', sourceType: 'user-reference', sourcePath: source.corpus, sha256: sha256(source.corpus), locator: 'Independent declared scope: nine supported species and 35 actual forms.' },
    { id: 'pet-info-as', sourceType: 'legacy-as3', sourcePath: source.petInfo, sha256: sha256(source.petInfo), locator: 'transPetChinaName(): pet key to Chinese target label mapping.' },
    { id: 'show-pet-info-as', sourceType: 'legacy-as3', sourcePath: source.showPetInfo, sha256: sha256(source.showPetInfo), locator: 'show(): headmc.gotoAndStop(pif.getPetChinaName()).' },
    { id: 'role-info-as', sourceType: 'legacy-as3', sourcePath: source.roleInfo, sha256: sha256(source.roleInfo), locator: `addPetHead/removePetHead: character 662 dynamic presence and y=${roleY}.` },
    { id: 'game-info-as', sourceType: 'legacy-as3', sourcePath: source.gameInfo, sha256: sha256(source.gameInfo), locator: `refreshRoleInfo(): P1 x=0; P2 x=${ownerSpacing} and horizontal mirror.` },
  ],
  stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states,
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds,
    extractedStateIds,
    expectedVisibleObjectCountByState: visibleCounts,
    displayListMatched: expectedStateIds.every((id, index) => extractedStateIds[index] === id),
    stateSetMatched: new Set(expectedStateIds).size === new Set(extractedStateIds).size && expectedStateIds.every((id) => extractedStateIds.includes(id)),
    unresolved: [],
  },
  evidenceRefs: [
    'docs/reverse-engineering/evidence/TASK-SETTINGS-201-pet-combat-hud-head.md',
    reportPath,
    'docs/workflow/problems/PG-017-真值表不管用.md',
  ],
};

const duplicateLabelGroups = Object.entries(Object.groupBy(fixtureFacts, (fixture) => fixture.chineseName))
  .filter(([, fixtures]) => fixtures.length > 1)
  .map(([chineseName, fixtures]) => ({ chineseName, petKeys: fixtures.map((fixture) => fixture.petKey), targetFrame: fixtures[0].targetFrame, characterId: fixtures[0].child.characterId }));
const report = {
  reportId: 'task-settings-201.pet-combat-hud-head.completeness',
  status: 'verified',
  declarationSource: { corpus: source.corpus, fixtureCount: expectedFixtures.length, petKeys: expectedFixtures.map((fixture) => fixture.petKey) },
  stateSource: { mapping: source.petInfo, timeline: source.xml, characterId: 657, declaredTimelineFrames: timeline657.frameCount, extractedTimelineFrames: timeline657.frames.length },
  comparison: {
    expectedFixtureCount: 35,
    extractedFixtureCount: fixtureFacts.length,
    missingPetKeys: expectedFixtures.filter((fixture) => !fixtureFacts.some((fact) => fact.petKey === fixture.petKey)).map((fixture) => fixture.petKey),
    unexpectedPetKeys: fixtureFacts.filter((fact) => !expectedFixtures.some((fixture) => fixture.petKey === fact.petKey)).map((fixture) => fixture.petKey),
    recursiveTerminalCount: fixtureFacts.filter((fixture) => fixture.definition.type.startsWith('DefineShape')).length,
    xmlSvgGeometryMatchedCount: fixtureFacts.length,
    duplicateLabelGroups,
    negativeStateCount: negativeFixtures.length,
    p1ProjectionCount: fixtureFacts.length,
    p2ProjectionCount: fixtureFacts.length,
  },
  fixtures: fixtureFacts.map((fixture) => ({
    petKey: fixture.petKey,
    chineseName: fixture.chineseName,
    targetFrame: fixture.targetFrame,
    characterId: fixture.child.characterId,
    depth: fixture.child.depth,
    localMatrix: fixture.child.localMatrix,
    localBounds: fixture.definition.bounds,
    baselinePath: fixture.baselinePath,
    baselineSha256: sha256(fixture.baselinePath),
  })),
  verdict: {
    stateSetMatched: true,
    recursiveDisplayListsMatched: true,
    geometryCrossSourceMatched: true,
    expectedWasNotCopiedFromExtracted: true,
    rationale: 'Expected fixtures come from pet-animation-corpus plus PetInfo AS3 name mapping; extracted frames/children/matrices come from the restored-SWF FFDec XML and are independently cross-checked against per-frame FFDec SVG/PNG.',
    unresolved: [],
  },
};

emit(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
emit(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`${check ? 'Verified' : 'Generated'} character 657 truth: 35 fixtures, 70 P1/P2 active states, 4 negative states, 0 unresolved.`);

function extractFrames() {
  if (!existsSync(ffdec)) throw new Error(`FFDec CLI is unavailable at ${ffdec}.`);
  mkdirSync(absolute(`${exportRoot}/svg`), { recursive: true });
  mkdirSync(absolute(`${exportRoot}/png`), { recursive: true });
  mkdirSync(absolute(baselineRoot), { recursive: true });
  for (const [format, directory] of [['sprite:svg', `${exportRoot}/svg`], ['sprite:png', `${exportRoot}/png`]]) {
    const result = spawnSync(ffdec, ['-onerror', 'abort', '-ignorebackground', '-selectid', '657,662', '-format', format, '-export', 'sprite', absolute(directory), absolute(source.swf)], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`FFDec ${format} export failed.\n${result.stdout}\n${result.stderr}`);
  }
}

function parseSpriteTimeline(xmlText, spriteId) {
  const marker = new RegExp(`<item type="DefineSpriteTag"[^>]*spriteId="${spriteId}"[^>]*>`).exec(xmlText);
  if (!marker) throw new Error(`Cannot locate DefineSprite ${spriteId}.`);
  const subStart = xmlText.indexOf('<subTags>', marker.index);
  const subEnd = xmlText.indexOf('</subTags>', subStart);
  const lines = xmlText.slice(subStart, subEnd).split(/\r?\n/);
  const frameCount = Number(attrs(marker[0]).frameCount);
  const display = new Map();
  const frames = [];
  let label = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith('<item type="FrameLabelTag"')) label = attrs(line).name;
    else if (line.startsWith('<item type="RemoveObject2Tag"')) display.delete(Number(attrs(line).depth));
    else if (/^<item type="PlaceObject(?:2|3)Tag"/.test(line)) {
      const value = attrs(line);
      const depth = Number(value.depth);
      const previous = display.get(depth);
      let localMatrix = previous?.localMatrix ?? matrix();
      if (!line.endsWith('/>')) {
        const matrixLine = lines.slice(index + 1).find((candidate) => candidate.includes('<matrix type="MATRIX"'));
        if (!matrixLine) throw new Error(`Placement at depth ${depth} has no matrix.`);
        localMatrix = parseXmlMatrix(matrixLine);
      }
      display.set(depth, { characterId: Number(value.characterId ?? previous?.characterId), depth, localMatrix });
    } else if (line.startsWith('<item type="ShowFrameTag"')) {
      frames.push({ frame: frames.length + 1, label, displayList: [...display.values()].sort((a, b) => a.depth - b.depth) });
      label = null;
    }
  }
  return { frameCount, frames };
}

function parseShapeDefinitions(xmlText) {
  const definitions = new Map();
  const pattern = /<item type="(DefineShape(?:2|3|4)?Tag)"[^>]*shapeId="(\d+)"[^>]*>\s*<shapeBounds[^>]*>/g;
  for (const match of xmlText.matchAll(pattern)) {
    const value = attrs(match[0].match(/<shapeBounds[^>]*>/)[0]);
    definitions.set(Number(match[2]), {
      type: match[1],
      bounds: bounds(Number(value.Xmin) / 20, Number(value.Ymin) / 20, (Number(value.Xmax) - Number(value.Xmin)) / 20, (Number(value.Ymax) - Number(value.Ymin)) / 20),
    });
  }
  return definitions;
}

function parseNamedPlacement(xmlText, spriteId, instanceName) {
  const marker = new RegExp(`<item type="DefineSpriteTag"[^>]*spriteId="${spriteId}"[^>]*>`).exec(xmlText);
  const subEnd = xmlText.indexOf('</subTags>', marker?.index ?? 0);
  const section = xmlText.slice(marker?.index ?? 0, subEnd);
  const placement = new RegExp(`<item type="PlaceObject(?:2|3)Tag"[^>]*name="${instanceName}"[^>]*>[\\s\\S]*?</item>`).exec(section)?.[0];
  if (!placement) throw new Error(`Cannot locate ${instanceName} in character ${spriteId}.`);
  const value = attrs(placement.match(/^<item[^>]*>/)[0]);
  return { characterId: Number(value.characterId), depth: Number(value.depth), localMatrix: parseXmlMatrix(placement.match(/<matrix type="MATRIX"[^>]*>/)[0]) };
}

function parseXmlMatrix(tag) {
  const value = attrs(tag);
  return matrix(
    value.hasScale === 'true' ? Number(value.scaleX) : 1,
    value.hasRotate === 'true' ? Number(value.rotateSkew0) : 0,
    value.hasRotate === 'true' ? Number(value.rotateSkew1) : 0,
    value.hasScale === 'true' ? Number(value.scaleY) : 1,
    Number(value.translateX) / 20,
    Number(value.translateY) / 20,
  );
}

function parseSvgUse(relativePath, characterId) {
  const svg = readFileSync(absolute(relativePath), 'utf8');
  const svgTag = svg.match(/<svg\b[^>]*>/)?.[0];
  const rootMatrix = svg.match(/<g transform="matrix\(([^)]+)\)"/)?.[1].split(/,\s*/).map(Number);
  const useTag = svg.match(new RegExp(`<use[^>]*ffdec:characterId="${characterId}"[^>]*/>`))?.[0];
  if (!svgTag || !rootMatrix || !useTag) throw new Error(`Cannot parse FFDec SVG character ${characterId}: ${relativePath}`);
  const value = attrs(useTag);
  const useMatrix = value.transform.match(/matrix\(([^)]+)\)/)?.[1].split(/,\s*/).map(Number);
  return {
    width: Number(value.width),
    height: Number(value.height),
    canvasWidth: Number(attrs(svgTag).width.replace('px', '')),
    canvasHeight: Number(attrs(svgTag).height.replace('px', '')),
    rootRegistration: point(rootMatrix[4], rootMatrix[5]),
    matrix: matrix(...useMatrix),
  };
}

function locateExportDirectory(relativeRoot, prefix) {
  const directory = absolute(relativeRoot);
  const match = readdirSync(directory).find((name) => name.startsWith(prefix) && statSync(path.join(directory, name)).isDirectory());
  if (!match) throw new Error(`Cannot find ${prefix} below ${relativeRoot}.`);
  return path.join(directory, match);
}

function relative(absolutePath) {
  return path.relative(root, absolutePath).replaceAll('\\', '/');
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

function transformBounds(value, transform) {
  const corners = [
    [value.left, value.top], [value.left + value.width, value.top],
    [value.left, value.top + value.height], [value.left + value.width, value.top + value.height],
  ].map(([x, y]) => ({ x: transform.a * x + transform.c * y + transform.tx, y: transform.b * x + transform.d * y + transform.ty }));
  const xs = corners.map((corner) => corner.x); const ys = corners.map((corner) => corner.y);
  return bounds(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function intersectBounds(value, clip) {
  const left = Math.max(value.left, clip.left); const top = Math.max(value.top, clip.top);
  const right = Math.min(value.left + value.width, clip.left + clip.width); const bottom = Math.min(value.top + value.height, clip.top + clip.height);
  return bounds(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

function assertMatrixEqual(actual, expected, description) {
  for (const key of ['a', 'b', 'c', 'd', 'tx', 'ty']) if (Math.abs(actual[key] - expected[key]) > 0.001) throw new Error(`${description} mismatch at ${key}: ${actual[key]} vs ${expected[key]}.`);
}

function assertBoundsEqual(actual, expected, description) {
  for (const key of ['left', 'top', 'width', 'height']) if (Math.abs(actual[key] - expected[key]) > 0.051) throw new Error(`${description} mismatch at ${key}: ${actual[key]} vs ${expected[key]}.`);
}

function assertSizeEqual(actual, expected, description) {
  for (const key of ['width', 'height']) if (Math.abs(actual[key] - expected[key]) > 0.051) throw new Error(`${description} mismatch at ${key}: ${actual[key]} vs ${expected[key]}.`);
}

function assertRasterBoundsCoverVector(raster, vector, description) {
  // FFDec rasterizes thin Flash strokes and antialiasing up to roughly 1.5 px
  // beyond the twip vector bounds. This check is deliberately edge-based.
  const tolerance = 1.6;
  const rasterRight = raster.left + raster.width; const rasterBottom = raster.top + raster.height;
  const vectorRight = vector.left + vector.width; const vectorBottom = vector.top + vector.height;
  if (Math.abs(raster.left - vector.left) > tolerance || Math.abs(raster.top - vector.top) > tolerance
    || Math.abs(rasterRight - vectorRight) > tolerance || Math.abs(rasterBottom - vectorBottom) > tolerance) {
    throw new Error(`${description} mismatch: raster=${JSON.stringify(raster)} vector=${JSON.stringify(vector)}.`);
  }
}

function validateCompleteness(expected, extracted) {
  const expectedKeys = expected.map((fixture) => fixture.petKey);
  const extractedKeys = extracted.map((fixture) => fixture.petKey);
  if (expectedKeys.length !== extractedKeys.length || expectedKeys.some((key) => !extractedKeys.includes(key))) throw new Error(`Fixture completeness mismatch: expected ${expectedKeys.join(',')}; extracted ${extractedKeys.join(',')}.`);
  for (const fixture of extracted) {
    if (!fixture.child || fixture.targetFrame < 1 || fixture.targetFrame > 42) throw new Error(`Fixture ${fixture.petKey} lacks a target child/frame.`);
    assertMatrixEqual(fixture.child.localMatrix, fixture.svgUse.matrix, `${fixture.petKey} XML/SVG child matrix`);
  }
}

function runMutationTests(expected, extracted, xmlHeadMatrix, svgHeadMatrix) {
  const missingChild = structuredClone(extracted); missingChild[0].child = null;
  expectFailure(() => validateCompleteness(expected, missingChild), 'missing target child');
  const wrongFrame = structuredClone(extracted); wrongFrame[0].targetFrame = 99;
  expectFailure(() => validateCompleteness(expected, wrongFrame), 'wrong target frame');
  const wrongMatrix = { ...xmlHeadMatrix, tx: xmlHeadMatrix.tx + 1 };
  expectFailure(() => assertMatrixEqual(wrongMatrix, svgHeadMatrix, 'mutated head matrix'), 'mutated key matrix');
}

function expectFailure(callback, label) {
  try { callback(); } catch { return; }
  throw new Error(`Mutation test did not reject ${label}.`);
}

function decodePng(relativePath) {
  const data = readFileSync(absolute(relativePath));
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${relativePath} is not PNG.`);
  let offset = 8; let width; let height; let bitDepth; let colorType; const idat = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset); const type = data.subarray(offset + 4, offset + 8).toString('ascii'); const chunk = data.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') { width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); bitDepth = chunk[8]; colorType = chunk[9]; }
    else if (type === 'IDAT') idat.push(chunk);
    offset += 12 + length;
  }
  if (bitDepth !== 8 || ![4, 6].includes(colorType)) throw new Error(`${relativePath} must be 8-bit alpha PNG.`);
  const bpp = colorType === 6 ? 4 : 2; const stride = width * bpp; const raw = inflateSync(Buffer.concat(idat)); const pixels = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[sourceOffset++];
    for (let x = 0; x < stride; x += 1) {
      const rawValue = raw[sourceOffset++]; const left = x >= bpp ? pixels[y * stride + x - bpp] : 0; const up = y > 0 ? pixels[(y - 1) * stride + x] : 0; const upLeft = y > 0 && x >= bpp ? pixels[(y - 1) * stride + x - bpp] : 0;
      const value = filter === 0 ? rawValue : filter === 1 ? rawValue + left : filter === 2 ? rawValue + up : filter === 3 ? rawValue + Math.floor((left + up) / 2) : filter === 4 ? rawValue + paeth(left, up, upLeft) : Number.NaN;
      if (!Number.isFinite(value)) throw new Error(`${relativePath} uses unsupported PNG filter ${filter}.`);
      pixels[y * stride + x] = value & 0xff;
    }
  }
  return { width, height, bpp, stride, pixels };
}

function alphaBounds(png) {
  let minX = png.width; let minY = png.height; let maxX = -1; let maxY = -1;
  for (let y = 0; y < png.height; y += 1) for (let x = 0; x < png.width; x += 1) {
    if (png.pixels[y * png.stride + x * png.bpp + png.bpp - 1] > 0) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  }
  if (maxX < minX) throw new Error('Baseline PNG unexpectedly contains no visible pixels.');
  return bounds(minX, minY, maxX - minX + 1, maxY - minY + 1);
}

function emit(relativePath, content) {
  const target = absolute(relativePath);
  if (check) {
    if (!existsSync(target) || readFileSync(target, 'utf8') !== content) throw new Error(`Generated file is stale: ${relativePath}`);
  } else {
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}
