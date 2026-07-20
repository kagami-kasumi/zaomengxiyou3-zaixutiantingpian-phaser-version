import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { stage11Assets, Stage11AssetKeys } from '../src/assets/AssetManifest';
import { activateBossArena, createBossArena } from '../src/systems/LevelSystem';
import {
  createStage11MovementPlatforms,
  getStage11MarkerBounds,
  stage11RenderBounds,
  stage11TransferDoor,
  stage11WallMarkers,
  STAGE11_GROUND_PLATFORM_ID,
  STAGE11_GROUND_TOP_Y,
  STAGE11_WORLD_HEIGHT,
  STAGE11_WORLD_WIDTH,
  type Stage11WallKind,
} from '../src/systems/Stage11Layout';

const repoRoot = process.cwd();
const assetDirectory = path.join(repoRoot, 'public', 'assets', 'stage', 'stage1-1');

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const expectedCounts: Record<Stage11WallKind, number> = {
  ObsWall: 3,
  ThroughWall: 15,
  ThroughUpButDownWall: 1,
  FallDownWhenStandingWall: 1,
};

assert.equal(stage11WallMarkers.length, 20, 'sl11 must retain all 20 wall markers');
for (const [kind, expected] of Object.entries(expectedCounts)) {
  assert.equal(
    stage11WallMarkers.filter((marker) => marker.kind === kind).length,
    expected,
    `${kind} count must match the source frame`,
  );
}
assert.deepEqual(
  Object.keys(stage11TransferDoor).includes('sourceCharacterId'),
  true,
  'the transfer door must retain source provenance',
);
assert.equal(stage11TransferDoor.sourceCharacterId, 45);
const bossArena = createBossArena();
assert.equal(bossArena.triggerZone.y, 470, 'source trigger -1900 maps through runtime +2370');
assert.equal(bossArena.door.x, 723.85);
assert.equal(bossArena.door.y, 334.1);
assert.ok(Math.abs(bossArena.door.width - 167) < 0.0001);
assert.ok(Math.abs(bossArena.door.height - 163.45) < 0.0001);
assert.equal(bossArena.door.visible, false);
const boss = activateBossArena(bossArena);
assert.deepEqual({ x: boss.x, y: boss.y }, { x: 750, y: 320 });

const platforms = createStage11MovementPlatforms();
assert.equal(platforms.length, 18, '18 horizontal markers participate in vertical movement');
assert.equal(platforms[0].id, STAGE11_GROUND_PLATFORM_ID);
assert.equal(platforms[0].kind, 'solid');
assert.equal(platforms[0].top, STAGE11_GROUND_TOP_Y);
assert.equal(
  stage11WallMarkers.filter((marker) => {
    const bounds = getStage11MarkerBounds(marker);
    return bounds.bottom > bounds.top && bounds.right > bounds.left;
  }).length,
  20,
  'every marker must derive a non-empty world-space AABB',
);

assert.equal(STAGE11_WORLD_WIDTH, 940);
assert.equal(STAGE11_WORLD_HEIGHT, 2970.45);
assert.deepEqual(stage11RenderBounds.floor, { left: 0, right: 1440, top: 0, bottom: 690 });
assert.deepEqual(stage11RenderBounds.background, { left: -79, right: 1053, top: 0, bottom: 3051 });
assert.deepEqual(stage11RenderBounds.foreground, { left: -200, right: 1097.2, top: 205.5, bottom: 2961.05 });

const expectedFiles = ['background.png', 'floor.png', 'foreground.png'];
assert.deepEqual(readdirSync(assetDirectory).sort(), expectedFiles);
for (const [name, asset] of Object.entries(stage11Assets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.ok(asset.sourcePackage.endsWith('.swf'));
  assert.ok(asset.sourceTag.length > 0);
  assert.deepEqual(
    pngDimensions(path.join(repoRoot, 'public', asset.path)),
    { width: asset.width, height: asset.height },
    `${name} raster dimensions must match the manifest`,
  );
}
assert.deepEqual(
  Object.values(stage11Assets).map((asset) => asset.key),
  [Stage11AssetKeys.floor, Stage11AssetKeys.background, Stage11AssetKeys.foreground],
);

console.log('Stage 1-1 resource and layout tests passed.');
