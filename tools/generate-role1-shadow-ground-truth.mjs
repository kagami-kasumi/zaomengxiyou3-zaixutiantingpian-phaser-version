import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(
  root,
  'docs/reverse-engineering/ground-truth/manifests/task-settings-173-role1-shadow.json',
);
const sources = {
  swf: 'local-resources/regima/source/restored-swfs/assets/WuKong.swf',
  role1: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as',
  shadow: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role1Shadow.as',
  monster: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseMonster.as',
  clip: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseBitmapDataClip.as',
  settings: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/setmenu/gameSetting.as',
  xml: 'local-resources/regima/task-outputs/task-settings-069a-role1/wukong-selected.xml',
  symbols: 'local-resources/regima/task-outputs/task-settings-069a-role1/symbols-wukong/symbols.csv',
  atlas: 'public/assets/combat/role1/body/1_ROLE1_SHALLDOW.png',
};
const expectedHashes = {
  swf: '61e71b182b3dd500b230be569336b6fb72081e5ac35a770f1886b3f603fedea3',
  role1: '9785fb74ddadc858c2bda6d084612a7f50bbd09392e45a99e71a9a7b80fde489',
  shadow: '04b1477e07dcb211f3990206f3c95ab9b9a4101583ef0e648cee9fec3898614d',
  monster: 'fcbb52a290b82e95378072940ac7581f298abb0f2c10d72f7019480cb501539b',
  clip: '7a52392e0ed6e97f3dc4d9cc6dd32be58969f88bfa13cd4905a15764b9e879d2',
  settings: 'd467c90af7d1aea39f9e2b77a4d40a35601c3ce9d4f9e169ac841d0728eea177',
  xml: 'a6bdbc7854a21c880cd33a2433cb936ae12f345078aca4f6cdd8041c3789a9d6',
  atlas: 'a1d7d6ff167769b39b39f3cb12877d3b88314d98f44b703c4ae399b961ff9244',
};

const bytes = Object.fromEntries(Object.entries(sources).map(([id, relativePath]) => [
  id,
  readFileSync(path.join(root, relativePath)),
]));
const hash = (value) => createHash('sha256').update(value).digest('hex');
for (const [id, expected] of Object.entries(expectedHashes)) {
  if (hash(bytes[id]) !== expected) throw new Error(`${id} source hash changed`);
}
const text = (id) => bytes[id].toString('utf8');
const requireSource = (id, pattern, description) => {
  if (!pattern.test(text(id))) throw new Error(`${id} no longer proves ${description}`);
};
requireSource('shadow', /maxCount\s*=\s*gc\.frameClips\s*\*\s*3/, 'three-second lifetime');
requireSource('shadow', /setFrameStopCount\(\[\[72,72,72,72,72\],\[2,3,2,3\],\[2,12,16\]\]\)/, 'hold ticks');
requireSource('shadow', /setFrameCount\(\[\[1,1,1,1,1\],4,3\]\)/, 'static candidate and attack frame counts');
requireSource('shadow', /Math\.random\(\)\s*\*\s*5/, 'one random idle candidate');
requireSource('shadow', /setOffsetXY\(15,-5\)/, 'registration offset');
requireSource('role1', /\.setAction\("hit1"\)/, 'hit1 reachability');
requireSource('role1', /\.setAction\("hit2"\)/, 'hit2 reachability');
requireSource('monster', /getImcName\(\)\s*==\s*"Role1Bullet13"/, 'qsez hit creation path');
requireSource('settings', /frameClips\s*=\s*24[\s\S]*frameClips\s*=\s*20[\s\S]*frameClips\s*=\s*30/, '20/24/30 tick quality modes');
if (!/^1;"ROLE1_SHALLDOW"$/m.test(text('symbols'))) throw new Error('character 1 SymbolClass changed');
if (bytes.atlas.readUInt32BE(16) !== 1000 || bytes.atlas.readUInt32BE(20) !== 600) {
  throw new Error('Role1 shadow atlas must remain 1000x600');
}

const actions = [
  ...Array.from({ length: 5 }, (_, column) => ({ action: 'walk', row: 0, column, hold: 72 })),
  ...[2, 3, 2, 3].map((hold, column) => ({ action: 'hit1', row: 1, column, hold })),
  ...[2, 12, 16].map((hold, column) => ({ action: 'hit2', row: 2, column, hold })),
];
const directions = [
  { id: 'left', direct: 0, tx: -115, registrationX: 115 },
  { id: 'right', direct: 1, tx: -85, registrationX: 85 },
];
const states = [];
const placements = [];
const baselines = [];
for (const direction of directions) {
  for (const frame of actions) {
    const id = `${frame.action}-${frame.column}-${direction.id}`;
    const staticMeaning = frame.action === 'walk'
      ? '; selected once from five candidates; frameCount=1 keeps this cell after the initial 72-tick hold'
      : `; action total=${frame.action === 'hit1' ? 10 : 30} ticks and destroys on frame-over`;
    states.push({
      id,
      entry: `${frame.action} row=${frame.row} cell=${frame.column}; hold=${frame.hold} host ticks${staticMeaning}`,
      frame: frame.row * 5 + frame.column,
      fixtureId: `sourceRoot=(470,350); direct=${direction.direct}; frameClips=30; lifetime=90 ticks`,
      baselineId: `atlas-${id}`,
    });
    placements.push({
      stateId: id,
      visible: true,
      localMatrix: { a: 1, b: 0, c: 0, d: 1, tx: direction.tx, ty: -105 },
      registrationPoint: { x: direction.registrationX, y: 105 },
      localBounds: { left: direction.tx, top: -105, width: 200, height: 200 },
      stageBounds: { left: 470 + direction.tx, top: 245, width: 200, height: 200 },
      derivation: 'calculated',
      derivationMethod: `BaseBitmapDataClip 200x200; setOffsetXY(15,-5); direct=${direction.direct}; atlas cell row=${frame.row}, column=${frame.column}; right uses BaseBitmapDataPool mirrored bitmap`,
      evidenceRefs: ['role1-shadow-as', 'base-bitmap-data-clip-as', 'wukong-atlas'],
    });
    baselines.push({
      id: `atlas-${id}`,
      stateId: id,
      path: sources.atlas,
      sha256: expectedHashes.atlas,
      width: 1000,
      height: 600,
      crop: { left: frame.column * 200, top: frame.row * 200, width: 200, height: 200 },
    });
  }
}

const provenance = [
  ['wukong-swf', 'restored-swf', 'swf', 'character 1 / ROLE1_SHALLDOW; BitmapData 1000x600; source owner for the 5x3 atlas'],
  ['role1-as', 'legacy-as3', 'role1', 'createShallow; shallowArray owner/step; hit8 -> shadow hit1; hit14 -> shadow hit2'],
  ['role1-shadow-as', 'legacy-as3', 'shadow', 'constructor, initBBDC, setAction, enterFrameFunc, scriptFrameOverFunc, move, destroy'],
  ['base-monster-as', 'legacy-as3', 'monster', 'Role1Bullet13 hit creates 1..2 non-boss shadows or 4..5 boss shadows'],
  ['base-bitmap-data-clip-as', 'legacy-as3', 'clip', 'frameShow/step/frameCount semantics, mirrored cell selection and setXYByDirect matrix'],
  ['game-setting-as', 'legacy-as3', 'settings', 'quality selector binds frameClips and stage.frameRate to 20, 24 or 30'],
  ['wukong-ffdec-xml', 'ffdec-xml', 'xml', 'AVM2 constants expose ROLE1_SHALLDOW and 1000x600 BitmapData identity'],
].map(([id, sourceType, key, locator]) => ({
  id,
  sourceType,
  sourcePath: sources[key],
  sha256: expectedHashes[key],
  locator,
}));

const manifest = {
  $schema: '../schema/ui-ground-truth.schema.json',
  schemaVersion: 1,
  truthId: 'task-settings-173.role1-shadow',
  status: 'verified',
  scope: {
    taskId: 'TASK-SETTINGS-173',
    surfaceId: 'role1-shadow-runtime-visual',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Role1Shadow character 1 identity, 5 static walk candidates, hit1/hit2 cells, host-tick holds, left/right registration matrices and fixed 30-tick fixture. Lifetime and action reachability remain AS3 behavior contracts documented by the evidence index.',
  },
  generatedBy: {
    tool: 'generate-role1-shadow-ground-truth.mjs',
    toolVersion: '1',
    command: 'npm run generate:role1-shadow-truth',
    generatedAt: '2026-08-15T12:00:00+08:00',
  },
  provenance,
  stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states,
  displayObjects: [{
    id: 'role1-shadow-bitmap',
    parentId: null,
    depth: 0,
    objectType: 'bitmap',
    sourceIdentity: { provenanceId: 'wukong-swf', characterId: 1, symbolClass: 'ROLE1_SHALLDOW', instanceName: null, frame: null },
    placements,
    render: { assetRef: sources.atlas, blendMode: 'normal', filters: [], maskId: null },
  }],
  baselines,
  completeness: {
    expectedStateIds: states.map((state) => state.id),
    extractedStateIds: states.map((state) => state.id),
    expectedVisibleObjectCountByState: Object.fromEntries(states.map((state) => [state.id, 1])),
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: ['role1-shadow-as', 'role1-as', 'base-monster-as', 'base-bitmap-data-clip-as', 'game-setting-as', 'wukong-ffdec-xml'],
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== serialized) throw new Error('Role1 shadow ground truth is stale');
  console.log('Role1 shadow ground truth is current');
} else {
  writeFileSync(outputPath, serialized);
  console.log(`wrote ${path.relative(root, outputPath)}`);
}
