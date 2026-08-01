import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  stage11Assets,
  stage11MonsterAtlases,
  stage11MonsterAttackAssets,
  Stage11AssetKeys,
  Stage11MonsterAssetKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
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
import {
  createStage11MonsterVisual,
  getStage11MonsterActionDefinition,
  getStage11MonsterAtlasFrame,
  getStage11MonsterSpriteOrigin,
  Stage11MonsterVisualProvenance,
  Stage11VisualTickMs,
  updateStage11MonsterVisual,
  type Stage11MonsterAction,
  type Stage11MonsterType,
} from '../src/systems/Stage11MonsterVisualSystem';

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
assert.deepEqual({ x: boss.x, y: boss.y }, { x: 750, y: 350 });

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

const expectedFiles = ['background.png', 'floor.png', 'foreground.png', 'transfer-door'];
assert.deepEqual(readdirSync(assetDirectory).sort(), expectedFiles);
for (const [name, asset] of Object.entries(stage11Assets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.ok(asset.sourcePackage.endsWith('.swf'));
  assert.ok(asset.sourceTag.length > 0);
  const paths = 'framePaths' in asset ? asset.framePaths : [asset.path];
  for (const assetPath of paths) {
    assert.deepEqual(
      pngDimensions(path.join(repoRoot, 'public', assetPath)),
      { width: asset.width, height: asset.height },
      `${name} raster dimensions must match the manifest`,
    );
  }
}
assert.deepEqual(
  Object.values(stage11Assets).map((asset) => asset.key),
  [
    Stage11AssetKeys.floor,
    Stage11AssetKeys.background,
    Stage11AssetKeys.foreground,
    Stage11AssetKeys.transferDoor,
  ],
);
assert.deepEqual(stage11Assets.transferDoor.frameCount, 20);
assert.match(stage11Assets.transferDoor.sourceSymbol, /character 45/);
assert.match(stage11Assets.transferDoor.sourceTag, /41 \(20 frames\).*44 \(19 frames\)/);

const monsterDirectory = path.join(repoRoot, 'public', 'assets', 'stage1', 'monsters');
assert.deepEqual(pngDimensions(path.join(monsterDirectory, 'monster30.png')), {
  width: 900,
  height: 600,
});
assert.deepEqual(pngDimensions(path.join(monsterDirectory, 'monster3.png')), {
  width: 1080,
  height: 1080,
});
assert.deepEqual(
  Object.values(stage11MonsterAtlases).map((asset) => asset.reachableFrameCount),
  [13, 27],
);
assert.deepEqual(
  Object.values(stage11MonsterAttackAssets).map((asset) => asset.frameCount),
  [10, 5, 10],
);
for (const asset of Object.values(stage11MonsterAttackAssets)) {
  for (const framePath of asset.framePaths) {
    assert.ok(readFileSync(path.join(repoRoot, 'public', framePath), 'utf8').includes('<svg'));
  }
}

const stage11BundleKeys = new Set(
  sceneAssetBundles['stage-1-monsters'].assets.map((asset) => asset.key),
);
const expectedStage11BundleKeys = [
  stage11MonsterAtlases.monster30.key,
  stage11MonsterAtlases.monster3.key,
  ...Object.values(stage11MonsterAttackAssets).flatMap((asset) => asset.frameKeys),
  Stage11MonsterAssetKeys.attackGeometry,
];
for (const key of expectedStage11BundleKeys) {
  assert.ok(stage11BundleKeys.has(key), `stage-1-monsters bundle must own ${key}`);
}

const actionsByMonster: Readonly<Record<Stage11MonsterType, readonly Stage11MonsterAction[]>> = {
  3: ['wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2'],
  30: ['wait', 'walk', 'hurt', 'dead', 'hit1'],
};
const reachableFrames: Readonly<Record<Stage11MonsterType, number>> = { 3: 27, 30: 13 };
for (const enemyType of [3, 30] as const) {
  const provenance = Stage11MonsterVisualProvenance[enemyType];
  const origin = getStage11MonsterSpriteOrigin(enemyType);
  assert.ok(Math.abs(
    -origin.x * provenance.cellWidth
      - (-provenance.cellWidth / 2 - provenance.offsetX),
  ) < 0.000_001);
  assert.ok(Math.abs(
    -origin.y * provenance.cellHeight
      - (-provenance.cellHeight / 2 + provenance.offsetY),
  ) < 0.000_001);
  const atlasFrames = new Set<number>();
  for (const action of actionsByMonster[enemyType]) {
    const definition = getStage11MonsterActionDefinition(enemyType, action);
    for (let frame = 0; frame < definition.holdTicks.length; frame += 1) {
      atlasFrames.add(definition.row * provenance.columns + frame);
    }
  }
  assert.equal(atlasFrames.size, reachableFrames[enemyType]);
}
assert.deepEqual(
  actionsByMonster[3].map((action) =>
    getStage11MonsterActionDefinition(3, action).holdTicks.reduce(
      (sum, ticks) => sum + ticks,
      0,
    )),
  [15, 16, 15, 15, 15, 31],
);
assert.deepEqual(
  actionsByMonster[30].map((action) =>
    getStage11MonsterActionDefinition(30, action).holdTicks.reduce(
      (sum, ticks) => sum + ticks,
      0,
    )),
  [12, 12, 15, 14, 10],
);

function tickAttack(
  enemyType: Stage11MonsterType,
  state: 'hit1' | 'hit2',
  ticks: number,
  facingX: -1 | 1,
) {
  const model = createStage11MonsterVisual(enemyType);
  return {
    model,
    events: updateStage11MonsterVisual(model, {
      state,
      attackSerial: 1,
      facingX,
    }, Stage11VisualTickMs * ticks),
  };
}

assert.deepEqual(tickAttack(30, 'hit1', 1, -1).events, [{
  family: 'monster30Hit1',
  offsetX: 0,
  offsetY: 0,
  facingX: -1,
}]);
const monster3Hit1 = tickAttack(3, 'hit1', 7, -1);
assert.deepEqual(monster3Hit1.events, [{
  family: 'monster3Hit1',
  offsetX: -105,
  offsetY: -60,
  facingX: -1,
}]);
assert.equal(getStage11MonsterAtlasFrame(monster3Hit1.model), 28);
assert.deepEqual(tickAttack(3, 'hit2', 6, 1).events, [{
  family: 'monster3Hit2',
  offsetX: 155,
  offsetY: -30,
  facingX: 1,
}]);

const monster30Dead = createStage11MonsterVisual(30);
updateStage11MonsterVisual(monster30Dead, {
  state: 'removed',
  attackSerial: 0,
  facingX: -1,
}, Stage11VisualTickMs * 13);
assert.equal(monster30Dead.completed, false);
updateStage11MonsterVisual(monster30Dead, {
  state: 'removed',
  attackSerial: 0,
  facingX: -1,
}, Stage11VisualTickMs);
assert.equal(monster30Dead.completed, true);

const viewsSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneViews.ts'),
  'utf8',
);
assert.ok(!viewsSource.includes("scene.add.text(-42, -78, 'Monster30'"));
assert.ok(!viewsSource.includes('scene.add.ellipse(0, 0, 72, 56'));
const bossSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneBossArena.ts'),
  'utf8',
);
assert.ok(!bossSource.includes('createAttackFlash(this, toPhaserRect(hitbox)'));

console.log('Stage 1-1 true monster visuals, attacks, resource, and layout tests passed.');
