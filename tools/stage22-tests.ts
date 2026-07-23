import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assetBundles,
  stage22Assets,
  Stage22AssetKeys,
} from '../src/assets/AssetManifest';
import {
  isStage22LocalQaHost,
  readStage22DevOptions,
} from '../src/systems/Stage22EntrySystem';
import {
  createStage22FireHazards,
  Stage22FireTuning,
  updateStage22FireHazards,
} from '../src/systems/Stage22FireHazardSystem';
import {
  STAGE22_GROUND_TOP_Y,
  STAGE22_TRAVEL_LEFT,
  STAGE22_TRAVEL_RIGHT,
  stage22FireThorns,
  stage22StopPoints,
  stage22TransferDoor,
  stage22WallMarkers,
} from '../src/systems/Stage22Layout';
import {
  getStage22CameraScrollX,
  getStage22TravelRight,
  hasReachedStage22StopPoint,
  stage22MovementPlatforms,
  STAGE22_SCREEN_RIGHT_X,
} from '../src/systems/Stage22TraversalSystem';

const repoRoot = process.cwd();

function readPublic(pathname: string): string {
  return readFileSync(path.join(repoRoot, 'public', pathname), 'utf8');
}

function readSvgDimensions(pathname: string): { width: number; height: number } {
  const svg = readPublic(pathname);
  const width = svg.match(/\bwidth="([0-9.]+)px"/)?.[1];
  const height = svg.match(/\bheight="([0-9.]+)px"/)?.[1];
  assert.ok(width && height, `${pathname} keeps explicit FFDec SVG dimensions`);
  return { width: Number(width), height: Number(height) };
}

assert.deepEqual(
  Object.values(stage22Assets).map((asset) => asset.sourceCharacterId),
  [3, 279, 36, 34, 63, 31],
);
assert.equal(assetBundles.stage22.length, 6);
assert.equal(stage22Assets.floor, assetBundles.stage21[0], 'floorBg2 reuses the Stage 2 owner');
assert.equal(Stage22AssetKeys.floor, 'stage.stage2.floor');
assert.equal(stage22Assets.fireThorn.frameKeys.length, 130);
assert.equal(stage22Assets.fireThorn.framePaths.length, 130);
assert.deepEqual(readSvgDimensions('assets/stage22/background.svg'), { width: 4700, height: 590 });
assert.deepEqual(readSvgDimensions('assets/stage22/midground.svg'), { width: 1745.1, height: 52.45 });
assert.deepEqual(readSvgDimensions('assets/stage22/foreground.svg'), { width: 4701, height: 94 });
assert.deepEqual(readSvgDimensions('assets/stage22/transfer-door.svg'), { width: 185.8, height: 165 });
for (const framePath of stage22Assets.fireThorn.framePaths) {
  assert.deepEqual(readSvgDimensions(framePath), { width: 143, height: 314.35 });
}

assert.equal(stage22WallMarkers.length, 7);
assert.deepEqual(
  stage22WallMarkers.map((marker) => marker.kind),
  ['ObsWall', 'ObsWall', 'ObsWall', 'FallDownWhenStandingWall', 'ThroughWall', 'ThroughWall', 'ThroughWall'],
);
assert.equal(stage22StopPoints.length, 5);
assert.equal(stage22StopPoints[4]?.isBoss, true);
assert.equal(stage22FireThorns.length, 9);
assert.equal(STAGE22_GROUND_TOP_Y, 501.0501981);
assert.equal(STAGE22_TRAVEL_LEFT, 6.6);
assert.equal(STAGE22_TRAVEL_RIGHT, 4692.55);
assert.equal(stage22MovementPlatforms.length, 4);
assert.deepEqual(
  stage22MovementPlatforms.slice(1).map((platform) => platform.top),
  [271.9, 271.85, 270.3],
);
assert.equal(getStage22TravelRight(0), 1267.3);
assert.equal(
  getStage22CameraScrollX(stage22StopPoints[0]!.x, 0),
  stage22StopPoints[0]!.x - STAGE22_SCREEN_RIGHT_X,
);
assert.equal(hasReachedStage22StopPoint(stage22StopPoints[0]!.x - 0.01, 0), false);
assert.equal(hasReachedStage22StopPoint(stage22StopPoints[0]!.x, 0), true);
assert.deepEqual(stage22TransferDoor.sourceBounds, {
  left: -90.75,
  right: 95.05,
  top: -110.7,
  bottom: 54.3,
});

assert.deepEqual(readStage22DevOptions('?qaStage=2-2-layout&players=2', true), {
  enabled: true,
  playerCount: 2,
  noDamage: false,
});
assert.deepEqual(readStage22DevOptions('?qaStage=2-2-layout&players=2', false), {
  enabled: false,
  playerCount: 1,
  noDamage: false,
});
assert.equal(readStage22DevOptions('', true).enabled, false);
assert.deepEqual(
  readStage22DevOptions('?qaStage=2-2-layout&qaX=1404.35&qaNoDamage=1', true),
  { enabled: true, playerCount: 1, spawnX: 1404.35, noDamage: true },
);
assert.equal(readStage22DevOptions('?qaStage=2-2-layout&qaX=9999', true).spawnX, undefined);
assert.equal(
  readStage22DevOptions('?qaStage=2-2-layout&qaFireFrame=7', true).freezeFireFrame,
  7,
);
assert.equal(
  readStage22DevOptions('?qaStage=2-2-layout&qaFireFrame=131', true).freezeFireFrame,
  undefined,
);
assert.equal(isStage22LocalQaHost('127.0.0.1'), true);
assert.equal(isStage22LocalQaHost('localhost'), true);
assert.equal(isStage22LocalQaHost('example.com'), false);

const hazards = createStage22FireHazards();
assert.equal(hazards.length, 9);
const fire = hazards[0]!;
const target = {
  slot: 'p1' as const,
  x: fire.source.x + Stage22FireTuning.triggerDistanceX,
  y: fire.source.y,
  width: 72,
  height: 96,
  facingX: 1 as const,
  alive: true,
  isYourFather: false,
};
const rejectedRectangleHit = updateStage22FireHazards(
  [fire],
  [target],
  0,
  () => false,
  () => 0,
);
assert.equal(fire.frame, 2, 'fire starts at the exact 200px horizontal threshold');
assert.equal(rejectedRectangleHit.length, 0, 'the source rectangle alone cannot deal damage');
const firstHit = updateStage22FireHazards(
  [fire],
  [{ ...target, x: fire.source.x }],
  0,
  () => true,
  () => 0,
);
assert.deepEqual(firstHit, [{
  hazardId: fire.source.id,
  attackId: 1,
  target: 'p1',
  damage: 40,
  knockbackX: 10,
}]);
assert.equal(
  updateStage22FireHazards([fire], [{ ...target, x: fire.source.x }], 0, () => true).length,
  0,
  'one player is hit at most once for one fire attack id',
);
fire.attackElapsedMs = Stage22FireTuning.attackIdIntervalMs - 1;
const repeatHit = updateStage22FireHazards(
  [fire],
  [{ ...target, x: fire.source.x, facingX: -1 }],
  1,
  () => true,
  () => 0.999,
);
assert.equal(repeatHit.length, 1);
assert.ok(repeatHit[0]!.damage >= 40 && repeatHit[0]!.damage < 50);
assert.equal(repeatHit[0]?.knockbackX, -10);
fire.hitKeys.clear();
assert.equal(
  updateStage22FireHazards(
    [fire],
    [{ ...target, x: fire.source.x, isYourFather: true }],
    0,
    () => true,
  ).length,
  0,
  'isYourFather remains immune',
);
fire.frame = Stage22FireTuning.activeFrameEnd;
fire.frameElapsedMs = 0;
fire.hitKeys.clear();
assert.equal(
  updateStage22FireHazards(
    [fire],
    [{ ...target, x: fire.source.x }],
    1000 / Stage22FireTuning.fps,
    () => true,
  ).length,
  0,
  'frame 20 and later remain visual-only',
);
fire.frame = 2;
fire.frameElapsedMs = 0;
updateStage22FireHazards(
  [fire],
  [],
  129 * 1000 / Stage22FireTuning.fps + 0.001,
  () => false,
);
assert.equal(fire.frame, 1, 'the 130-frame timeline loops back to stopped frame 1');

const bootSource = readFileSync(path.join(repoRoot, 'src/scenes/BootScene.ts'), 'utf8');
assert.ok(bootSource.includes('import.meta.env.DEV || isStage22LocalQaHost'));
assert.ok(bootSource.includes("this.scene.start('Stage22DevScene', stage22Dev)"));
assert.ok(bootSource.includes("this.scene.start('SaveSlotScene')"));
const mapSource = readFileSync(path.join(repoRoot, 'src/systems/HeavenMapSystem.ts'), 'utf8');
assert.equal(mapSource.includes('Stage22Scene'), false, '150A does not expose an empty formal route');
const worldSource = readFileSync(
  path.join(repoRoot, 'src/scenes/stage22/Stage22WorldBridge.ts'),
  'utf8',
);
const expectedDisplayOrder = [
  "setName('bgContainer')",
  "setName('sl22-foreground')",
  "setName(fire.id)",
  "setName('sl22-midground')",
  "setName('stage22-transfer-door')",
];
for (let index = 1; index < expectedDisplayOrder.length; index += 1) {
  assert.ok(
    worldSource.indexOf(expectedDisplayOrder[index - 1]!)
      < worldSource.indexOf(expectedDisplayOrder[index]!),
    'Stage 2-2 source display-list depth order is preserved',
  );
}
const gameplaySource = readFileSync(
  path.join(repoRoot, 'src/scenes/stage22/Stage22DevGameplayBridge.ts'),
  'utf8',
);
assert.ok(gameplaySource.includes('getPixelAlpha'));
assert.equal(gameplaySource.includes('createStage22Flow'), false);
assert.equal(gameplaySource.includes('Monster16'), false);
assert.equal(gameplaySource.includes('SaveSystem'), false);

console.log('Stage 2-2 true scene, traversal, DEV entry, and fire hazard tests passed.');
