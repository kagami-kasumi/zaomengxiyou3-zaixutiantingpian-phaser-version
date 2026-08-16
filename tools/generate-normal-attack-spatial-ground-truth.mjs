import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(
  root,
  'docs/reverse-engineering/ground-truth/manifests/task-arch-174-normal-attack-spatial.json',
);
const sources = {
  role2Swf: 'local-resources/regima/source/restored-swfs/assets/TangSeng1.swf',
  role4Swf: 'local-resources/regima/source/restored-swfs/assets/ShaShen.swf',
  role2As: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role2.as',
  role4As: 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/hero/Role4.as',
  role2Hit1: 'public/assets/combat/role2/skills/DefineSprite_274_Role2Bullet1/1.png',
  role2Hit2: 'public/assets/combat/role2/skills/DefineSprite_232_Role2Bullet2/1.png',
  role4Hit1: 'public/assets/combat/role4/skills/DefineSprite_68_Role4BulletArrow1/1.svg',
  role4Hit3: 'public/assets/combat/role4/skills/DefineSprite_71_Role4BulletArrow2/1.svg',
};
const expectedHashes = {
  role2Swf: '5a3deedd551ebca5026f04ee2ca75abecbc5c8b5837cbc615e09e36bd8855187',
  role4Swf: '721382af64a6b12a6d5087d5a05a6a7e577fe4423b666f4e1f16355b59831440',
  role2As: 'cdfea276e85d4d8cc619fb6ca33901cbe2e7d42afd02b2bf5738acbdab16cf3b',
  role4As: '66b6456edf846f6878cec085f48245d15de2ead742a46262e5b9b3faf6832705',
  role2Hit1: '376687980840f9ecf3bdffb13ec1341a3379a007a6d91e2ca6aa0e95a1c4b7f7',
  role2Hit2: '7862aa8e85ff2eb5a1f0a33cf9caa5ad58febb90b63cae0a8b9077a7c1b4703e',
  role4Hit1: '676e8764be896d7fdfae6887f98e7ab78b9aef86878d85bfcd14263ceea59fd4',
  role4Hit3: '9dbac8ca84ed68722e82641d433645ce4677263147be1181289de463e3ed5835',
};

const bytes = Object.fromEntries(Object.entries(sources).map(([id, sourcePath]) => [
  id,
  readFileSync(path.join(root, sourcePath)),
]));
const hash = (value) => createHash('sha256').update(value).digest('hex');
for (const [id, expected] of Object.entries(expectedHashes)) {
  if (hash(bytes[id]) !== expected) throw new Error(`${id} source hash changed`);
}
const text = (id) => bytes[id].toString('utf8');
const requireSource = (id, pattern, description) => {
  if (!pattern.test(text(id))) throw new Error(`${id} no longer proves ${description}`);
};
requireSource('role2As', /_loc7_\.x\s*=\s*this\.x\s*[+-]\s*50[\s\S]*_loc7_\.y\s*=\s*this\.y\s*\+\s*10/, 'Role2 detached effect release offset');
requireSource('role2As', /new SpecialEffectBullet\("Role2Bullet1"\)[\s\S]*new SpecialEffectBullet\("Role2Bullet2"\)/, 'Role2 detached effect identities');
requireSource('role4As', /_loc8_\.x\s*=\s*this\.x\s*[+-]\s*90[\s\S]*_loc8_\.y\s*=\s*this\.y[\s\S]*doHit1Arrow/, 'Role4 first arrow release offset');
requireSource('role4As', /_loc8_\.x\s*=\s*this\.x\s*[+-]\s*115[\s\S]*_loc8_\.y\s*=\s*this\.y\s*-\s*20[\s\S]*doHit2Arrow/, 'Role4 third arrow release offset');
requireSource('role4As', /new SpecialEffectBullet\("Role4BulletArrow1"\)[\s\S]*new SpecialEffectBullet\("Role4BulletArrow2"\)/, 'Role4 detached effect identities');

const effects = [
  effect('role2-hit1', 2, 'normal-attack-effect.hero2.hit1', 'Role2Bullet1', 274, 'role2Swf', 'role2As', 'role2Hit1', 50, 10, -493, -94.95, 591.5, 179.4, 592, 180),
  effect('role2-hit2', 2, 'normal-attack-effect.hero2.hit2', 'Role2Bullet2', 232, 'role2Swf', 'role2As', 'role2Hit2', 50, 10, -1289, -130, 1414, 258.9, 1414, 259),
  effect('role4-arrow-hit1', 4, 'normal-attack-effect.hero4.arrow.hit1', 'Role4BulletArrow1', 68, 'role4Swf', 'role4As', 'role4Hit1', 90, 0, -374.4, -44, 533.4, 108, 534, 108),
  effect('role4-arrow-hit3', 4, 'normal-attack-effect.hero4.arrow.hit3', 'Role4BulletArrow2', 71, 'role4Swf', 'role4As', 'role4Hit3', 115, -20, -366.1, -150.65, 535.9, 285.55, 536, 286),
];

const states = effects.map((value) => ({
  id: value.id,
  entry: `${value.symbol} detached SpecialEffectBullet release; canonical right-facing fixture`,
  frame: 1,
  fixtureId: 'heroFoot=(470,350); stage=940x590; facing=right',
  baselineId: `baseline-${value.id}`,
}));
const displayObjects = effects.map((value, depth) => {
  const rootX = 470 + (value.heroId === 2 ? 15 : 0);
  const rootY = 300;
  const originX = rootX + value.forward;
  const originY = rootY + value.rootOffsetY;
  const evidenceRefs = [value.swfRef, value.asRef, `${value.id}-baseline`];
  return {
    id: value.id,
    parentId: null,
    depth,
    objectType: 'movie-clip',
    sourceIdentity: {
      provenanceId: value.swfRef,
      characterId: value.characterId,
      symbolClass: value.symbol,
      instanceName: null,
      frame: 1,
    },
    placements: [{
      stateId: value.id,
      visible: true,
      localMatrix: { a: 1, b: 0, c: 0, d: 1, tx: value.forward, ty: value.rootOffsetY },
      registrationPoint: { x: -value.left, y: -value.top },
      localBounds: { left: value.left, top: value.top, width: value.width, height: value.height },
      stageBounds: { left: originX + value.left, top: originY + value.top, width: value.width, height: value.height },
      hitArea: { left: value.left, top: value.top, width: value.width, height: value.height },
      derivation: 'calculated',
      derivationMethod: `localMatrix tx/ty is AS3 release offset (${value.forward},${value.rootOffsetY}); localBounds is restored frame geometry; stageBounds uses hero visual root footY-50 and Role2 +15 local X`,
      evidenceRefs,
    }],
    render: { assetRef: sources[value.baselineRef], blendMode: 'normal', filters: [], maskId: null },
  };
});
const baselines = effects.map((value) => ({
  id: `baseline-${value.id}`,
  stateId: value.id,
  path: sources[value.baselineRef],
  sha256: expectedHashes[value.baselineRef],
  width: value.baselineWidth,
  height: value.baselineHeight,
  crop: { left: 0, top: 0, width: value.width, height: value.height },
}));

const provenance = [
  ['role2-swf', 'restored-swf', 'role2Swf', 'TangSeng1.swf characters 274/232; Role2Bullet1/2 restored visual source'],
  ['role4-swf', 'restored-swf', 'role4Swf', 'ShaShen.swf characters 68/71; Role4BulletArrow1/2 restored visual source'],
  ['role2-as', 'legacy-as3', 'role2As', 'hit1/hit2 release points and detached SpecialEffectBullet construction'],
  ['role4-as', 'legacy-as3', 'role4As', 'arrow hit1/hit3 release points and detached SpecialEffectBullet construction'],
  ...effects.map((value) => [`${value.id}-baseline`, 'runtime-capture', value.baselineRef, `${value.symbol} restored first-frame export and local visible bounds`]),
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
  truthId: 'task-arch-174.normal-attack-spatial',
  status: 'verified',
  scope: {
    taskId: 'TASK-ARCH-174',
    surfaceId: 'detached-normal-attack-world-effects',
    originalVersion: 'RegiMA 1.1 restored corpus',
    description: 'Four detached normal-attack effect release offsets, local visible/collision bounds and canonical stage projection. Runtime direction mirroring and damage settlement remain behavior contracts tested separately.',
  },
  generatedBy: {
    tool: 'generate-normal-attack-spatial-ground-truth.mjs',
    toolVersion: '1',
    command: 'npm run generate:normal-attack-spatial-truth',
    generatedAt: '2026-08-15T20:00:00+08:00',
  },
  provenance,
  stage: { width: 940, height: 590, frameRate: 30, coordinateSpace: 'stage', scaleMode: 'noScale', alignment: 'top-left' },
  states,
  displayObjects,
  baselines,
  completeness: {
    expectedStateIds: states.map((state) => state.id),
    extractedStateIds: states.map((state) => state.id),
    expectedVisibleObjectCountByState: Object.fromEntries(states.map((state) => [state.id, 1])),
    displayListMatched: true,
    stateSetMatched: true,
    unresolved: [],
  },
  evidenceRefs: provenance.map((entry) => entry.id),
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== serialized) throw new Error('Normal-attack spatial ground truth is stale');
  console.log('Normal-attack spatial ground truth is current');
} else {
  writeFileSync(outputPath, serialized);
  console.log(`wrote ${path.relative(root, outputPath)}`);
}

function effect(id, heroId, key, symbol, characterId, swfRef, asRef, baselineRef, forward, rootOffsetY, left, top, width, height, baselineWidth, baselineHeight) {
  return { id, heroId, key, symbol, characterId, swfRef, asRef, baselineRef, forward, rootOffsetY, left, top, width, height, baselineWidth, baselineHeight };
}
