import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swfPath = 'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf';
const taskOutput = 'local-resources/regima/task-outputs/task-settings-175c-stage-feature-host';
const legacyOutput = 'local-resources/regima/task-outputs/task-settings-067-stage-feature-entry';
const roleInfoPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/RoleInfo.as';
const gameInfoPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/GameInfo.as';
const setMenuPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/setmenu/SetMenu.as';
const helpPath = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/Help.as';
const outputPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-175c-stage-feature-host.json';
const baselineRoot = 'docs/tasks/evidence/TASK-SETTINGS-175C';
const command = 'npm run generate:stage-feature-host-truth';
const expectedSwfHash = '97478e1e03a22c7d06197ffb75ab890d98b084377cbdcf394716cbaf27082126';

const featureButtons = [
  ['settings', 'btn_set', 549, 52, 63.65, 563.15, 47, 43],
  ['backpack', 'btn_bb', 555, 55, 32.9, 540.5, 47, 44],
  ['skills', 'btn_study', 561, 58, 28.5, 504.85, 47, 40],
  ['magic-weapon', 'btn_fb', 567, 61, 55.15, 475.4, 47, 41],
  ['pets', 'btn_cw', 573, 64, 91.35, 472.65, 47, 46],
];

const settingsButtonCharacters = {
  btn_x: 337,
  btn_continue: 342,
  btn_back_selectmap: 347,
  btn_help: 351,
  btn_back_menu: 355,
  btn_sound_open: 359,
  btn_sound_close: 362,
  btn_huazhi: 370,
};

const helpButtonCharacters = { actionHelp: 436, achivePet: 440, btnback: 441 };

const stateSpecs = [
  ['hud-p1-normal', 'P1 RoleInfo is visible in a playable local stage', 'p1; no pointer target'],
  ...featureButtons.flatMap(([entry]) => [
    [`hud-p1-${entry}-over`, `P1 pointer over ${entry}`, `p1; hover=${entry}`],
    [`hud-p1-${entry}-down`, `P1 pointer down on ${entry}`, `p1; pressed=${entry}`],
    [`hud-p1-${entry}-hit`, `P1 ${entry} hittest region`, `p1; hit=${entry}; shared character 418`],
  ]),
  ['hud-p2-normal', 'P2 RoleInfo parent is at x=920 with scaleX=-1', 'p2; child readability correction active'],
  ...featureButtons.map(([entry]) => [`hud-p2-${entry}-over`, `P2 pointer over mirrored ${entry}`, `p2; hover=${entry}; stageX=920-p1X`]),
  ['gate-skills-special-denied', 'Skills entry at stage 0 level 2 is refused', 'stage=0; level=2; existing HUD remains'],
  ['gate-backpack-special-denied', 'Backpack entry at stage 0 level 2 or stage 16 is refused', 'special stage; existing HUD remains'],
  ['gate-backpack-dead-denied', 'Backpack entry for a dead owner is refused', 'owner dead; existing HUD remains'],
  ['gate-magic-unequipped-denied', 'Magic-weapon entry without zbfb is refused with original alert path', 'zbfb=null; existing HUD remains'],
  ['gate-pets-dead-allowed', 'Pet entry does not test hero death and opens only the external pet root', 'owner dead; pet page external to host scope'],
  ['page-backpack-open', 'Backpack root opens without universal feature-host chrome', 'external page root; host chrome absent'],
  ['page-skills-open', 'BuySkill root opens and defaults to P1 without universal feature-host chrome', 'external page root; default selected owner=p1'],
  ['page-magic-open', 'SutraInterface opens without universal feature-host chrome', 'external page root; equipped zbfb'],
  ['page-pets-open', 'PetInterface opens without universal feature-host chrome', 'external page root; selected HUD owner'],
  ['page-closed-return', 'The active page removes itself and returns to the paused stage', 'external page removed; host chrome absent'],
  ['settings-normal-sound-on-speed1', 'SetMenu 371 opens with sound enabled and x1 spawn speed', 'soundStay=true; SummonMonsterSpeed=1'],
  ['settings-sound-off-speed2', 'SetMenu 371 shows the mutually exclusive sound-open control and x2', 'soundStay=false; SummonMonsterSpeed=2'],
  ['settings-speed4', 'SetMenu 371 shows x4 before cycling to x1', 'SummonMonsterSpeed=4'],
  ['settings-close-over', 'Pointer over SetMenu btn_x', 'hover=btn_x'],
  ['settings-close-down', 'Pointer down on SetMenu btn_x', 'pressed=btn_x'],
  ['help-action', 'Help 444 frame 1 operation guide', 'help frame=1'],
  ['help-pet', 'Help 444 frame 2 pet capture guide', 'help frame=2'],
  ['help-back-over', 'Pointer over Help btnback', 'help frame=1; hover=btnback'],
  ['help-back-down', 'Pointer down on Help btnback', 'help frame=1; pressed=btnback'],
  ['map-origin-no-shared-chrome', 'Original map services have separate page roots and no universal five-page host chrome', 'negative original evidence; scoped overlay is empty'],
];

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
    ? 'Direct FFDec SVG display-list matrix cross-checked against the selected DefineSprite XML from the restored SWF.'
    : 'Composed from the original GameInfo parent transform and RoleInfo.setPos child transform, or from AS3 dynamic add/remove state.',
  evidenceRefs,
  ...extra,
});

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function parseSvgUses(svgPath) {
  const svg = readFileSync(path.join(root, svgPath), 'utf8');
  const rootMatch = svg.match(/<g transform="matrix\([^>]+>\s*([\s\S]*?)\s*<\/g>\s*<defs>/);
  if (!rootMatch) throw new Error(`Unable to locate root display list in ${svgPath}`);
  return [...rootMatch[1].matchAll(/<use\b[^>]*\/>/g)].map((entry, index) => {
    const attrs = attributes(entry[0]);
    const values = attrs.transform.match(/matrix\(([^)]*)\)/)?.[1].split(',').map(Number);
    if (!values) throw new Error(`Missing matrix for ${svgPath} use ${index}`);
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
}

function parseFirstFrameXml(xmlPath) {
  const xml = readFileSync(path.join(root, xmlPath), 'utf8');
  const firstFrame = xml.split('<item type="ShowFrameTag"')[0];
  return [...firstFrame.matchAll(/<item type="PlaceObject2Tag"([^>]*)>\s*<matrix type="MATRIX"([^>]*)\/>/g)].map((match) => {
    const tag = attributes(match[1]);
    const transform = attributes(match[2]);
    return {
      characterId: Number(tag.characterId),
      instanceName: tag.name ?? null,
      depth: Number(tag.depth),
      matrix: matrix(
        transform.hasScale === 'true' ? Number(transform.scaleX) : 1,
        transform.hasRotate === 'true' ? Number(transform.rotateSkew0) : 0,
        transform.hasRotate === 'true' ? Number(transform.rotateSkew1) : 0,
        transform.hasScale === 'true' ? Number(transform.scaleY) : 1,
        Number(transform.translateX) / 20,
        Number(transform.translateY) / 20,
      ),
    };
  });
}

function crossCheckDisplayList(label, xmlPath, svgPath) {
  const xml = parseFirstFrameXml(xmlPath);
  const svg = parseSvgUses(svgPath);
  if (xml.length !== svg.length) throw new Error(`${label} display-list mismatch XML=${xml.length} SVG=${svg.length}`);
  svg.forEach((use, index) => {
    const raw = xml[index];
    if (use.characterId !== raw.characterId || use.instanceName !== raw.instanceName) {
      throw new Error(`${label} child mismatch at ${index}: XML=${raw.characterId}/${raw.instanceName} SVG=${use.characterId}/${use.instanceName}`);
    }
    for (const key of ['a', 'b', 'c', 'd', 'tx', 'ty']) {
      if (Math.abs(use.matrix[key] - raw.matrix[key]) > 0.001) throw new Error(`${label} ${use.instanceName ?? index} ${key} matrix mismatch`);
    }
    use.depth = raw.depth;
  });
  return svg;
}

if (sha256(swfPath) !== expectedSwfHash) throw new Error('OtherMat1.swf hash does not match the frozen RegiMA 1.1 source');

const roleSvgPath = `${taskOutput}/exports/sprites/DefineSprite_574_export.RoleInfo/1.svg`;
const settingsSvgPath = `${taskOutput}/exports/sprites/DefineSprite_371_export.setmenu.SetMenu/1.svg`;
const helpActionSvgPath = `${taskOutput}/exports/sprites/DefineSprite_444_export.Help/1.svg`;
const helpPetSvgPath = `${taskOutput}/exports/sprites/DefineSprite_444_export.Help/2.svg`;
const roleUses = crossCheckDisplayList('RoleInfo 574', `${legacyOutput}/sprite-574.xml`, roleSvgPath);
const settingsUses = crossCheckDisplayList('SetMenu 371', `${legacyOutput}/sprite-371.xml`, settingsSvgPath);
const helpActionUses = crossCheckDisplayList('Help 444 frame 1', `${legacyOutput}/sprite-444.xml`, helpActionSvgPath);
const helpPetUses = parseSvgUses(helpPetSvgPath);
if (helpActionUses.length !== 4 || helpPetUses.length !== 4 || helpPetUses[0].characterId !== 443) {
  throw new Error('Help 444 frame topology does not match the expected 432->443 background swap with three retained buttons');
}

const hudP1States = stateSpecs.map(([id]) => id).filter((id) => id.startsWith('hud-p1-'));
const hudP2States = stateSpecs.map(([id]) => id).filter((id) => id.startsWith('hud-p2-'));
const hudGateStates = stateSpecs.map(([id]) => id).filter((id) => id.startsWith('gate-') && id !== 'gate-pets-dead-allowed');
const settingsStates = stateSpecs.map(([id]) => id).filter((id) => id.startsWith('settings-'));
const helpStates = stateSpecs.map(([id]) => id).filter((id) => id.startsWith('help-'));
const displayObjects = [];

displayObjects.push({
  id: 'role-info-root', parentId: null, depth: 0, objectType: 'movie-clip',
  sourceIdentity: { provenanceId: 'othermat1-swf', characterId: 574, symbolClass: 'export.RoleInfo', instanceName: null, frame: 1 },
  placements: [
    ...[...hudP1States, ...hudGateStates].map((stateId) => placement(stateId, matrix(), bounds(-62.15, -19, 862.9, 614.65), bounds(-62.15, -19, 862.9, 614.65), 'extracted', ['othermat1-swf:character-574-frame-1'])),
    ...hudP2States.map((stateId) => placement(stateId, matrix(-1, 0, 0, 1, 920, 0), bounds(-62.15, -19, 862.9, 614.65), bounds(119.25, -19, 862.9, 614.65), 'calculated', ['game-info-as:refreshRoleInfo', 'role-info-as:setPos'])),
  ],
  render: render(roleSvgPath),
});

for (const [entry, instanceName, characterId, depth, x, y, width, height] of featureButtons) {
  const use = roleUses.find((candidate) => candidate.characterId === characterId && candidate.instanceName === instanceName);
  if (!use || use.depth !== depth) throw new Error(`Missing RoleInfo ${entry} button ${characterId} at depth ${depth}`);
  const states = [...hudP1States, ...hudP2States, ...hudGateStates];
  const buttonAssetsRoot = `${taskOutput}/exports/buttons/DefineButton2_${characterId}`;
  displayObjects.push({
    id: `role-info.${instanceName}`, parentId: 'role-info-root', depth, objectType: 'button',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId, symbolClass: null, instanceName, frame: 1 },
    placements: states.map((stateId) => {
      const p2 = stateId.startsWith('hud-p2-');
      const centerX = p2 ? 920 - x : x;
      const local = p2 ? matrix(-1, 0, 0, 1, x, y) : use.matrix;
      return placement(stateId, local, bounds(-width / 2, -height / 2, width, height), bounds(centerX - width / 2, y - height / 2, width, height), p2 ? 'calculated' : 'extracted', p2 ? ['game-info-as:refreshRoleInfo', 'role-info-as:setPos'] : [`othermat1-swf:character-574-depth-${depth}`], { hitArea: bounds(centerX - 15.5, y - 17.5, 31, 35) });
    }),
    render: render(`${roleSvgPath}#${use.href}`, { buttonStateAssets: {
      up: `${buttonAssetsRoot}/1_up.png`, over: `${buttonAssetsRoot}/2_over.png`, down: `${buttonAssetsRoot}/3_down.png`, hit: `${buttonAssetsRoot}/4_hittest.png`,
    } }),
  });
}

displayObjects.push({
  id: 'set-menu-root', parentId: null, depth: 0, objectType: 'movie-clip',
  sourceIdentity: { provenanceId: 'othermat1-swf', characterId: 371, symbolClass: 'export.setmenu.SetMenu', instanceName: null, frame: 1 },
  placements: settingsStates.map((stateId) => placement(stateId, matrix(), bounds(0, 0, 940.05, 590), bounds(0, 0, 940.05, 590), 'extracted', ['othermat1-swf:character-371-frame-1'])),
  render: render(settingsSvgPath),
});

for (const use of settingsUses.filter((candidate) => candidate.instanceName !== 'huazhi')) {
  const objectType = use.instanceName && settingsButtonCharacters[use.instanceName] ? 'button' : use.href.startsWith('shape') ? 'shape' : 'sprite';
  let states = [...settingsStates];
  if (use.instanceName === 'btn_sound_open') states = ['settings-sound-off-speed2'];
  if (use.instanceName === 'btn_sound_close') states = settingsStates.filter((id) => id !== 'settings-sound-off-speed2');
  const extra = objectType === 'button' ? { hitArea: bounds(use.matrix.tx, use.matrix.ty, use.width, use.height) } : {};
  const buttonCharacter = use.instanceName ? settingsButtonCharacters[use.instanceName] : undefined;
  displayObjects.push({
    id: `set-menu.${use.instanceName ?? `character-${use.characterId}`}`, parentId: 'set-menu-root', depth: use.depth, objectType,
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: 1 },
    placements: states.map((stateId) => placement(stateId, use.matrix, bounds(0, 0, use.width, use.height), bounds(use.matrix.tx, use.matrix.ty, use.width, use.height), 'extracted', [`othermat1-swf:character-371-depth-${use.depth}`], extra)),
    render: render(`${settingsSvgPath}#${use.href}`, buttonCharacter ? { buttonStateAssets: {
      up: `${taskOutput}/exports/buttons/DefineButton2_${buttonCharacter}/1_up.png`, over: `${taskOutput}/exports/buttons/DefineButton2_${buttonCharacter}/2_over.png`, down: `${taskOutput}/exports/buttons/DefineButton2_${buttonCharacter}/3_down.png`, hit: `${taskOutput}/exports/buttons/DefineButton2_${buttonCharacter}/4_hittest.png`,
    } } : {}),
  });
}

const speedUse = settingsUses.find((candidate) => candidate.instanceName === 'huazhi');
if (!speedUse || speedUse.characterId !== 366) throw new Error('Missing SetMenu huazhi character 366');
for (const [speed, stateId, frame] of [[1, 'settings-normal-sound-on-speed1', 1], [2, 'settings-sound-off-speed2', 2], [4, 'settings-speed4', 3]]) {
  displayObjects.push({
    id: `set-menu.huazhi-speed-${speed}`, parentId: 'set-menu-root', depth: speedUse.depth, objectType: 'sprite',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId: 366, symbolClass: speedUse.symbolClass, instanceName: 'huazhi', frame },
    placements: [placement(stateId, speedUse.matrix, bounds(0, 0, speedUse.width, speedUse.height), bounds(speedUse.matrix.tx, speedUse.matrix.ty, speedUse.width, speedUse.height), 'extracted', [`set-menu-as:SummonMonsterSpeed-${speed}`])],
    render: render(`local-resources/regima/task-outputs/task-slice-156b-stage-settings/spawn-speed/DefineSprite_366_OtherMat_fla.Timeline_92/${frame}.png`),
  });
}

displayObjects.push({
  id: 'help-root', parentId: null, depth: 0, objectType: 'movie-clip',
  sourceIdentity: { provenanceId: 'othermat1-swf', characterId: 444, symbolClass: 'export.Help', instanceName: null, frame: null },
  placements: helpStates.map((stateId) => placement(stateId, matrix(), bounds(0, 0, 940, 590), bounds(0, 0, 940, 590), 'extracted', ['othermat1-swf:character-444-frames-1-2'])),
  render: render(helpActionSvgPath),
});

for (const [frame, use, frameStates, svgPath] of [
  [1, helpActionUses[0], helpStates.filter((id) => id !== 'help-pet'), helpActionSvgPath],
  [2, helpPetUses[0], ['help-pet'], helpPetSvgPath],
]) {
  displayObjects.push({
    id: `help.background-frame-${frame}`, parentId: 'help-root', depth: 1, objectType: use.href.startsWith('shape') ? 'shape' : 'sprite',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId: use.characterId, symbolClass: use.symbolClass, instanceName: null, frame },
    placements: frameStates.map((stateId) => placement(stateId, use.matrix, bounds(0, 0, use.width, use.height), bounds(use.matrix.tx, use.matrix.ty, use.width, use.height), 'extracted', [`othermat1-swf:character-444-frame-${frame}-depth-1`])),
    render: render(`${svgPath}#${use.href}`),
  });
}

for (const use of helpActionUses.slice(1)) {
  const characterId = helpButtonCharacters[use.instanceName];
  if (characterId !== use.characterId) throw new Error(`Unexpected Help button ${use.instanceName}/${use.characterId}`);
  displayObjects.push({
    id: `help.${use.instanceName}`, parentId: 'help-root', depth: use.depth, objectType: 'button',
    sourceIdentity: { provenanceId: 'othermat1-swf', characterId, symbolClass: use.symbolClass, instanceName: use.instanceName, frame: 1 },
    placements: helpStates.map((stateId) => placement(stateId, use.matrix, bounds(0, 0, use.width, use.height), bounds(use.matrix.tx, use.matrix.ty, use.width, use.height), 'extracted', [`othermat1-swf:character-444-depth-${use.depth}`], { hitArea: bounds(use.matrix.tx, use.matrix.ty, use.width, use.height) })),
    render: render(`${helpActionSvgPath}#${use.href}`, { buttonStateAssets: {
      up: `${taskOutput}/exports/buttons/DefineButton2_${characterId}/1_up.png`, over: `${taskOutput}/exports/buttons/DefineButton2_${characterId}/2_over.png`, down: `${taskOutput}/exports/buttons/DefineButton2_${characterId}/3_down.png`, hit: `${taskOutput}/exports/buttons/DefineButton2_${characterId}/4_hittest.png`,
    } }),
  });
}

const visibleCount = (stateId) => displayObjects.filter((object) => object.placements.some((entry) => entry.stateId === stateId && entry.visible)).length;
const baselines = stateSpecs.map(([id]) => {
  const baselinePath = `${baselineRoot}/original-${id}-940x590.png`;
  return { id: `original-${id}-940x590`, stateId: id, path: baselinePath, sha256: sha256(baselinePath), width: 940, height: 590, crop: bounds(0, 0, 940, 590) };
});

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-175c.stage-feature-host',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-175C',
    surfaceId: 'stage-feature-entry-574-setmenu-371-help-444-and-negative-shared-host',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Scoped original truth for RoleInfo 574 five feature buttons, P1/P2 transforms, SetMenu 371, Help 444, entry gates and the negative absence of a universal map/battle feature-host chrome. External page roots remain owned by their page manifests.',
  },
  generatedBy: { tool: 'generate-stage-feature-host-ground-truth.mjs', toolVersion: '1', command, generatedAt: '2026-08-16T14:30:00+08:00' },
  provenance: [
    { id: 'othermat1-swf', sourceType: 'restored-swf', sourcePath: swfPath, sha256: sha256(swfPath), locator: 'characters 574 export.RoleInfo, 371 export.setmenu.SetMenu, 444 export.Help; 549/555/561/567/573 HUD buttons; 337/342/347/351/355/359/362/370 settings buttons; 436/440/441 help buttons; FFDec 26 selective SVG/PNG/button export.' },
    { id: 'role-info-as', sourceType: 'legacy-as3', sourcePath: roleInfoPath, sha256: sha256(roleInfoPath), locator: 'constructor/setPos/added/removed/showBackPack/setClick/studySkill/fbClick/cwClick; P2 child scale correction and entry gates.' },
    { id: 'game-info-as', sourceType: 'legacy-as3', sourcePath: gameInfoPath, sha256: sha256(gameInfoPath), locator: 'refreshRoleInfo creates one 574 per player, P2 x=920 and parent scaleX=-1.' },
    { id: 'set-menu-as', sourceType: 'legacy-as3', sourcePath: setMenuPath, sha256: sha256(setMenuPath), locator: 'added/removed/continue/backmap/backmenu/help/sound/SummonMonsterSpeed/close lifecycle.' },
    { id: 'help-as', sourceType: 'legacy-as3', sourcePath: helpPath, sha256: sha256(helpPath), locator: 'frame 1/2 selection, actionHelp/achivePet/btnback listeners and removal.' },
    { id: 'role-info-xml', sourceType: 'ffdec-xml', sourcePath: `${legacyOutput}/sprite-574.xml`, sha256: sha256(`${legacyOutput}/sprite-574.xml`), locator: 'character 574 first-frame PlaceObject list; 27 children; five scoped buttons at depths 52/55/58/61/64.' },
    { id: 'set-menu-xml', sourceType: 'ffdec-xml', sourcePath: `${legacyOutput}/sprite-371.xml`, sha256: sha256(`${legacyOutput}/sprite-371.xml`), locator: 'character 371 first-frame PlaceObject list; background, eight buttons and speed MovieClip.' },
    { id: 'help-xml', sourceType: 'ffdec-xml', sourcePath: `${legacyOutput}/sprite-444.xml`, sha256: sha256(`${legacyOutput}/sprite-444.xml`), locator: 'character 444 two-frame PlaceObject list; depth-1 432->443 swap and three retained buttons.' },
  ],
  stage: { width: 940, height: 590, frameRate: 24, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states: stateSpecs.map(([id, entry, fixtureId]) => ({ id, entry, frame: id.startsWith('help-') && id === 'help-pet' ? 2 : id.startsWith('page-') || id === 'map-origin-no-shared-chrome' ? 0 : 1, fixtureId, baselineId: `original-${id}-940x590` })),
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds: stateSpecs.map(([id]) => id),
    extractedStateIds: stateSpecs.map(([id]) => id),
    expectedVisibleObjectCountByState: Object.fromEntries(stateSpecs.map(([id]) => [id, visibleCount(id)])),
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: [
    'docs/reverse-engineering/evidence/TASK-SETTINGS-175C-stage-feature-host.md',
    'docs/reverse-engineering/stage-feature-entry-index.md#task-settings-175c-机器真值与-host-chrome-裁决',
    'docs/reverse-engineering/evidence/TASK-SETTINGS-175-functional-ui-truth-audit.md',
  ],
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
