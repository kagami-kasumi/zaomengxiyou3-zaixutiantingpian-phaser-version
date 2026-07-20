import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  assetBundles,
  stage11Assets,
  stage12Assets,
  Stage12AssetKeys,
} from '../src/assets/AssetManifest';
import {
  canEnterStage12,
  normalizeStage12PlayerCount,
} from '../src/systems/Stage12EntrySystem';
import {
  stage12FbEnter,
  stage12HeroSpawns,
  stage12RenderBounds,
  stage12SpawnPoints,
  stage12StopPoints,
  stage12TransferDoor,
  stage12WallMarkers,
} from '../src/systems/Stage12Layout';
import { createStage12Cleanup } from '../src/systems/Stage12Lifecycle';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(
  Object.values(stage12Assets).map((asset) => asset.sourceCharacterId),
  [135, 25, 22, 52, 48, 51],
  'the six Stage 1-2 visual identities must retain exact character provenance',
);
assert.deepEqual(
  Object.values(stage12Assets).map((asset) => asset.frameCount),
  [1, 1, 30, 1, 20, 19],
);
assert.equal(Stage12AssetKeys.floor, stage11Assets.floor.key, 'Stage 1-2 must reuse floorBg1');
assert.equal(assetBundles.stage12[0], stage11Assets.floor);

for (const asset of Object.values(stage12Assets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.ok(asset.sourcePackage.endsWith('.swf'));
  assert.ok(asset.sourceSymbol.length > 0);
  assert.ok(asset.sourceTag.length > 0);
  assert.ok(asset.sourceBounds.width > 0 && asset.sourceBounds.height > 0);
  if ('framePaths' in asset) {
    assert.equal(asset.frameKeys.length, asset.frameCount);
    assert.equal(asset.framePaths.length, asset.frameCount);
    asset.framePaths.forEach((framePath) => {
      assert.deepEqual(
        pngDimensions(path.join(repoRoot, 'public', framePath)),
        { width: asset.width, height: asset.height },
      );
    });
  } else {
    assert.deepEqual(
      pngDimensions(path.join(repoRoot, 'public', asset.path)),
      { width: asset.width, height: asset.height },
    );
  }
}

assert.deepEqual(
  readdirSync(path.join(repoRoot, 'public/assets/stage/stage1-2/fb-enter')).sort(),
  Array.from({ length: 30 }, (_, index) => `frame-${String(index + 1).padStart(2, '0')}.png`),
);
assert.equal(readdirSync(path.join(repoRoot, 'public/assets/stage/stage1-2/transfer-door-primary')).length, 20);
assert.equal(readdirSync(path.join(repoRoot, 'public/assets/stage/stage1-2/transfer-door-accent')).length, 19);

assert.deepEqual(stage12RenderBounds.foreground, {
  left: -200, right: 5177.75, top: 494, bottom: 589.4,
});
assert.equal(stage12WallMarkers.filter((marker) => marker.kind === 'ObsWall').length, 3);
assert.equal(stage12WallMarkers.filter((marker) => marker.kind === 'FallDownWhenStandingWall').length, 1);
assert.deepEqual(
  stage12WallMarkers.map((marker) => [marker.matrix.tx, marker.matrix.ty]),
  [[2419.35, 511.05], [4917.55, 89], [-184.35, 211.4], [2415.35, -128.5]],
);
assert.deepEqual(
  stage12StopPoints.map(({ x, y, idx, isBoss }) => [x, y, idx, isBoss]),
  [
    [1147.4, 215.25, 0, false],
    [1809.7, 208.55, 1, false],
    [2813.95, 189.35, 2, false],
    [3790.2, 258.35, 3, false],
    [4661.55, 240.7, 4, true],
  ],
);
assert.equal(stage12SpawnPoints.length, 13);
assert.equal(stage12SpawnPoints.reduce((sum, point) => sum + point.totalNum, 0), 46);
assert.ok(stage12SpawnPoints.every((point) => point.interval === 1 && point.isRandom === false));
assert.deepEqual(stage12TransferDoor, {
  id: 'stage12-transfer-door-1', sourceCharacterId: 52,
  x: 4611.65, y: 452.35, isTransferDoor: true,
  sourceBounds: { left: -90.75, right: 95.05, top: -110.7, bottom: 54.3 },
});
assert.deepEqual(
  { x: stage12FbEnter.x, y: stage12FbEnter.y, collision: stage12FbEnter.collision },
  { x: 1760, y: 334.65, collision: { sourceCharacterId: 21, name: 'colipse', x: 339.55, y: 95.95 } },
);
assert.deepEqual(stage12HeroSpawns, [
  { slot: 'p1', x: 100, y: 350 },
  { slot: 'p2', x: 100, y: 350 },
]);

assert.equal(canEnterStage12({ unlockedStage: 1, unlockedLevel: 1 }), false);
assert.equal(canEnterStage12({ unlockedStage: 1, unlockedLevel: 2 }), true);
assert.equal(normalizeStage12PlayerCount(1), 1);
assert.equal(normalizeStage12PlayerCount(2), 2);
assert.equal(normalizeStage12PlayerCount(undefined), 1);

let cleanupCalls = 0;
const cleanup = createStage12Cleanup(() => cleanupCalls += 1);
assert.equal(cleanup.destroyed(), false);
cleanup.destroy();
cleanup.destroy();
assert.equal(cleanup.destroyed(), true);
assert.equal(cleanupCalls, 1, 'scene cleanup must be idempotent');

const bridgeSource = readFileSync(path.join(repoRoot, 'src/scenes/stage12/Stage12WorldBridge.ts'), 'utf8');
assert.ok(bridgeSource.includes("setName('floorBg1')"));
assert.ok(bridgeSource.includes("setName('sl12')"));
assert.ok(bridgeSource.includes("setName('bgContainer')"));
assert.ok(bridgeSource.includes("setScrollFactor(0).setName('floorBg1')"));
assert.ok(bridgeSource.includes('root.add(stageScene)'));
assert.ok(bridgeSource.includes('stageScene.add(bgContainer)'));

const entrySource = readFileSync(path.join(repoRoot, 'src/scenes/Stage11EntryScene.ts'), 'utf8');
assert.ok(entrySource.includes("this.scene.start('Stage12Scene', { playerCount })"));
assert.ok(entrySource.includes('if (!canEnterStage12(readUnlockProgress())) return'));

console.log('Stage 1-2 resource, layout, entry, and cleanup tests passed.');
