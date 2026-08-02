import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  stage11MonsterAtlases,
  stage12MonsterAtlases,
  stage13Monster5Atlas,
  stage13Monster5AttackAssets,
  Stage13MonsterAssetKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  chooseStage13Monster5Attack,
  createStage13Monster5Visual,
  getStage13Monster5ActionDefinition,
  getStage13Monster5AtlasFrame,
  getStage13Monster5SpriteOrigin,
  Stage13Monster5VisualProvenance,
  Stage13Monster5VisualTickMs,
  updateStage13Monster5Visual,
  type Stage13Monster5Action,
} from '../src/systems/Stage13Monster5VisualSystem';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(
  pngDimensions(path.join(repoRoot, 'public', stage13Monster5Atlas.path)),
  { width: 2100, height: 2450 },
);
assert.equal(stage13Monster5Atlas.reachableFrameCount, 31);
assert.equal(
  Object.values(stage13Monster5AttackAssets).reduce((sum, asset) => sum + asset.frameCount, 0),
  24,
);
for (const asset of Object.values(stage13Monster5AttackAssets)) {
  assert.equal(
    readdirSync(path.join(repoRoot, 'public', path.dirname(asset.framePaths[0]!))).length,
    asset.frameCount,
  );
  for (const framePath of asset.framePaths) {
    assert.ok(readFileSync(path.join(repoRoot, 'public', framePath), 'utf8').includes('<svg'));
  }
}

const stage13Keys = new Set(sceneAssetBundles['stage-1-monsters-13'].assets.map((asset) => asset.key));
for (const key of [
  stage13Monster5Atlas.key,
  ...Object.values(stage13Monster5AttackAssets).flatMap((asset) => asset.frameKeys),
  Stage13MonsterAssetKeys.attackGeometry,
]) {
  assert.ok(stage13Keys.has(key), `stage-1-monsters-13 bundle must own ${key}`);
}
assert.deepEqual(
  sceneAssetBundles['stage-13'].dependencies,
  ['combat-common', 'stage-1-common', 'stage-1-monsters-11', 'stage-1-monsters-12', 'stage-1-monsters-13'],
  'Stage 1-3 loads its own boss plus the exact reused Stage 1-1/1-2 monster families',
);
assert.equal(stage11MonsterAtlases.monster3.key, 'monster.stage1.monster3.atlas');
assert.equal(stage11MonsterAtlases.monster30.key, 'monster.stage1.monster30.atlas');
assert.equal(stage12MonsterAtlases.monster7.key, 'monster.stage1.monster7.atlas');
assert.equal(stage12MonsterAtlases.monster8.key, 'monster.stage1.monster8.atlas');

const actions: readonly Stage13Monster5Action[] = [
  'wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2', 'hit3',
];
assert.deepEqual(
  actions.map((action) => getStage13Monster5ActionDefinition(action).holdTicks
    .reduce((sum, ticks) => sum + ticks, 0)),
  [15, 16, 15, 24, 15, 27, 16],
);

const origin = getStage13Monster5SpriteOrigin();
assert.ok(Math.abs(origin.x - (0.5 + 30 / 350)) < 0.000_001);
assert.ok(Math.abs(origin.y - (0.5 + 55 / 350)) < 0.000_001);
assert.equal(Stage13Monster5VisualProvenance.collisionRoot, 'ObjectBaseSprite2');
assert.deepEqual(Stage13Monster5VisualProvenance.collisionBounds, {
  minX: -30, minY: -65, maxX: 29.95, maxY: 64.95,
});

assert.deepEqual([1, 2, 3, 4, 5, 6].map(chooseStage13Monster5Attack), [
  'hit1', 'hit2', 'hit3', 'hit1', 'hit2', 'hit3',
]);

const hit3 = createStage13Monster5Visual();
updateStage13Monster5Visual(hit3, {
  phase: 'windup', attackSerial: 3, facingX: -1, moving: false,
}, 0);
const hit3Frames: number[] = [];
for (let tick = 0; tick < 16; tick += 1) {
  hit3Frames.push(getStage13Monster5AtlasFrame(hit3));
  updateStage13Monster5Visual(hit3, {
    phase: 'windup', attackSerial: 3, facingX: -1, moving: false,
  }, Stage13Monster5VisualTickMs);
}
assert.deepEqual(hit3Frames, [
  36, 37, 38, 39, 36, 37, 38, 39, 36, 37, 38, 39, 36, 37, 38, 39,
]);

function tickAttack(serial: number, ticks: number, facingX: -1 | 1 = -1) {
  const model = createStage13Monster5Visual();
  return updateStage13Monster5Visual(model, {
    phase: 'windup', attackSerial: serial, facingX, moving: false,
  }, Stage13Monster5VisualTickMs * ticks);
}

assert.deepEqual(tickAttack(1, 7)[0], {
  family: 'monster5Hit1', offsetX: -155, offsetY: -165, facingX: -1,
});
assert.deepEqual(
  tickAttack(2, 15).map(({ family, offsetX, offsetY }) => ({ family, offsetX, offsetY })),
  [
    { family: 'monster5Hit2Start', offsetX: -75, offsetY: -280 },
    { family: 'monster5Hit2End', offsetX: -245, offsetY: -95 },
  ],
);
assert.deepEqual(tickAttack(3, 1, 1)[0], {
  family: 'monster5Hit3', offsetX: 210, offsetY: -80, facingX: 1,
});

const dead = createStage13Monster5Visual();
updateStage13Monster5Visual(dead, {
  phase: 'dead', attackSerial: 0, facingX: -1, moving: false,
}, Stage13Monster5VisualTickMs * 23);
assert.equal(dead.completed, false);
updateStage13Monster5Visual(dead, {
  phase: 'dead', attackSerial: 0, facingX: -1, moving: false,
}, Stage13Monster5VisualTickMs);
assert.equal(dead.completed, true, 'Monster5 death remains visible through tick 24');

const gameplaySource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'stage13', 'Stage13GameplayBridge.ts'),
  'utf8',
);
assert.ok(!gameplaySource.includes('scene.add.circle'));
assert.ok(!gameplaySource.includes('`M${monster.enemyType}`'));
assert.ok(gameplaySource.includes('defeatReported'));

console.log('Stage 1-3 Monster5, shared monster identities, and death-view tests passed.');
