import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assetBundles,
  stage11Assets,
  stage13Assets,
  Stage13AssetKeys,
} from '../src/assets/AssetManifest';
import { canEnterStage13, normalizeStage13PlayerCount } from '../src/systems/Stage13EntrySystem';
import {
  STAGE13_GROUND_TOP_Y,
  stage13RenderBounds,
  stage13SpawnPoints,
  stage13StopPoints,
  stage13TransferDoor,
  stage13WallMarkers,
} from '../src/systems/Stage13Layout';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(Object.values(stage13Assets).map((asset) => asset.sourceCharacterId), [119, 13, 40]);
assert.equal(Stage13AssetKeys.floor, stage11Assets.floor.key);
assert.equal(assetBundles.stage13[0], stage11Assets.floor);
for (const asset of Object.values(stage13Assets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.ok(asset.sourcePackage.endsWith('.swf'));
  assert.ok(asset.sourceSymbol.length > 0 && asset.sourceTag.length > 0);
  assert.deepEqual(
    pngDimensions(path.join(repoRoot, 'public', asset.path)),
    { width: asset.width, height: asset.height },
  );
}

assert.deepEqual(stage13RenderBounds.foreground, {
  left: -30, right: 5629.35, top: 494, bottom: 589,
});
assert.equal(STAGE13_GROUND_TOP_Y, 501.0003962);
assert.deepEqual(stage13WallMarkers.map((marker) => [marker.matrix.tx, marker.matrix.ty]), [
  [2496.35, 521], [4804.65, 77], [-13.35, 199.4], [2496.35, -140.6],
]);
assert.deepEqual(stage13StopPoints.map(({ x, y, idx, betweenRandL, isBoss }) => [
  x, y, idx, betweenRandL, isBoss,
]), [
  [1088.1, 196.05, 0, 1150, false],
  [1834.35, 189.35, 1, 1150, false],
  [2838.6, 170.15, 2, 1150, false],
  [3566.75, 239.15, 3, 1150, false],
  [4310.45, 258.7, 4, 940, true],
]);
assert.equal(stage13SpawnPoints.length, 14);
assert.deepEqual(
  [0, 1, 2, 3, 4].map((idx) => stage13SpawnPoints
    .filter((point) => point.stopPointIdx === idx)
    .reduce((sum, point) => sum + point.totalNum, 0)),
  [9, 10, 12, 13, 61],
);
assert.equal(stage13SpawnPoints.reduce((sum, point) => sum + point.totalNum, 0), 105);
assert.deepEqual(stage13TransferDoor, {
  id: 'stage13-transfer-door-1', sourceCharacterId: 40,
  x: 4150.05, y: 453.15, isTransferDoor: true,
  sourceBounds: { left: -90.75, right: 95.05, top: -110.7, bottom: 54.3 },
  rasterPadding: 5,
});

assert.equal(canEnterStage13({ unlockedStage: 1, unlockedLevel: 1 }), true);
assert.equal(canEnterStage13({ unlockedStage: 1, unlockedLevel: 2 }, 'progression'), false);
assert.equal(canEnterStage13({ unlockedStage: 1, unlockedLevel: 3 }, 'progression'), true);
assert.equal(canEnterStage13({ unlockedStage: 2, unlockedLevel: 1 }, 'progression'), true);
assert.equal(normalizeStage13PlayerCount(2), 2);
assert.equal(normalizeStage13PlayerCount(undefined), 1);

const worldBridge = readFileSync(path.join(repoRoot, 'src/scenes/stage13/Stage13WorldBridge.ts'), 'utf8');
assert.ok(worldBridge.includes("setName('floorBg1')"));
assert.ok(worldBridge.includes("setName('sl13')"));
assert.ok(worldBridge.includes("setName('bgContainer')"));
assert.ok(worldBridge.includes('stage13TransferDoor.rasterPadding'));
const entry = readFileSync(path.join(repoRoot, 'src/scenes/Stage11EntryScene.ts'), 'utf8');
assert.ok(entry.includes("this.scene.start('Stage13Scene', { playerCount })"));
assert.ok(entry.includes('if (!canEnterStage13(readUnlockProgress())) return'));

console.log('Stage 1-3 resource, layout, and entry tests passed.');
