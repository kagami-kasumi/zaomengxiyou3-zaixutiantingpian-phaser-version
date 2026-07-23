import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assetBundles,
  stage21Assets,
  Stage21AssetKeys,
} from '../src/assets/AssetManifest';
import { canEnterStage21, normalizeStage21PlayerCount } from '../src/systems/Stage21EntrySystem';
import {
  createStage21Flow,
  defeatStage21Enemy,
  Stage21FailureDelayMs,
  touchStage21StopPoint,
  tryCompleteStage21,
  updateStage21PartyFailure,
  updateStage21Spawners,
  type Stage21FlowModel,
} from '../src/systems/Stage21FlowSystem';
import {
  createStage21IceHazards,
  Stage21IceTuning,
  updateStage21IceHazards,
} from '../src/systems/Stage21IceHazardSystem';
import {
  STAGE21_GROUND_TOP_Y,
  stage21IceThorns,
  stage21SpawnPoints,
  stage21StopPoints,
  stage21TransferDoor,
  stage21WallMarkers,
} from '../src/systems/Stage21Layout';
import {
  getStage21CameraScrollX,
  getStage21TravelRight,
  hasReachedStage21StopPoint,
  stage21MovementPlatforms,
  STAGE21_SCREEN_RIGHT_X,
} from '../src/systems/Stage21TraversalSystem';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(
  Object.values(stage21Assets).map((asset) => asset.sourceCharacterId),
  [3, 282, 19, 21, 48, 16],
);
assert.equal(assetBundles.stage21.length, 6);
assert.equal(stage21Assets.iceThorn.frameKeys.length, 66);
assert.equal(stage21Assets.iceThorn.framePaths.length, 66);
assert.equal(Stage21AssetKeys.iceThorn, stage21Assets.iceThorn.key);
for (const asset of [stage21Assets.floor, stage21Assets.background, stage21Assets.transferDoor]) {
  assert.deepEqual(
    pngDimensions(path.join(repoRoot, 'public', asset.path)),
    { width: asset.width, height: asset.height },
  );
}
for (const framePath of stage21Assets.iceThorn.framePaths) {
  assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', framePath)), { width: 59, height: 588 });
}
for (const asset of [stage21Assets.midground, stage21Assets.foreground]) {
  const svg = readFileSync(path.join(repoRoot, 'public', asset.path), 'utf8');
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('viewBox='));
}

assert.equal(stage21WallMarkers.length, 8);
assert.equal(stage21WallMarkers.filter((marker) => marker.kind === 'ThroughWall').length, 4);
assert.equal(stage21StopPoints.length, 5);
assert.equal(stage21SpawnPoints.length, 25);
assert.deepEqual(
  [0, 1, 2, 3, 4].map((idx) => stage21SpawnPoints
    .filter((point) => point.stopPointIdx === idx)
    .reduce((sum, point) => sum + point.totalNum, 0)),
  [10, 12, 14, 16, 1],
);
assert.equal(stage21SpawnPoints.reduce((sum, point) => sum + point.totalNum, 0), 53);
assert.equal(stage21IceThorns.filter((thorn) => thorn.orientation === 'ceiling').length, 19);
assert.equal(stage21IceThorns.filter((thorn) => thorn.orientation === 'floor').length, 19);
assert.deepEqual(stage21TransferDoor.sourceBounds, {
  left: -83.75, right: 83.25, top: -109.15, bottom: 54.3,
});
assert.equal(STAGE21_GROUND_TOP_Y, 519.0501981);
assert.equal(stage21MovementPlatforms.length, 5);
assert.equal(getStage21TravelRight(0), stage21StopPoints[0].x);
assert.equal(getStage21CameraScrollX(stage21StopPoints[0].x, 0), stage21StopPoints[0].x - STAGE21_SCREEN_RIGHT_X);
assert.equal(hasReachedStage21StopPoint(stage21StopPoints[0].x - 0.01, 0), false);
assert.equal(hasReachedStage21StopPoint(stage21StopPoints[0].x, 0), true);
assert.equal(canEnterStage21({ unlockedStage: 1, unlockedLevel: 3 }, 'progression'), false);
assert.equal(canEnterStage21({ unlockedStage: 2, unlockedLevel: 1 }, 'progression'), true);
assert.equal(normalizeStage21PlayerCount(2), 2);
assert.equal(normalizeStage21PlayerCount(undefined), 1);

function drainActiveWave(flow: Stage21FlowModel): number {
  const start = flow.generatedCount;
  for (let guard = 0; guard < 200 && flow.activeStopPointIdx !== undefined; guard += 1) {
    const spawned = updateStage21Spawners(flow, 10_000);
    for (const enemy of spawned) defeatStage21Enemy(flow, enemy.id);
  }
  assert.equal(flow.activeStopPointIdx, undefined, 'wave must finish inside guard');
  return flow.generatedCount - start;
}

const single = createStage21Flow(1, { unlockedStage: 2, unlockedLevel: 1 });
assert.equal(single.maxMonstersOnScreen, 6);
for (let idx = 0; idx < 4; idx += 1) {
  assert.equal(touchStage21StopPoint(single, idx), true);
  assert.equal(drainActiveWave(single), [10, 12, 14, 16][idx]);
}
assert.equal(touchStage21StopPoint(single, 4), true);
const bossSpawn = updateStage21Spawners(single, 10_000);
assert.equal(bossSpawn.length, 1);
assert.equal(bossSpawn[0]?.enemyType, 6);
assert.equal(bossSpawn[0]?.maxHp, 4_957);
assert.equal(defeatStage21Enemy(single, bossSpawn[0]!.id), true);
assert.equal(single.doorVisible, true);
assert.equal(single.generatedCount, 53);
assert.equal(tryCompleteStage21(single, true, true), true);
assert.deepEqual(single.unlockProgress, { unlockedStage: 2, unlockedLevel: 2 });
assert.equal(tryCompleteStage21(single, true, true), false);

const capped = createStage21Flow(2);
assert.equal(touchStage21StopPoint(capped, 0), true);
for (let index = 0; index < 8; index += 1) updateStage21Spawners(capped, 10_000);
assert.equal(capped.aliveEnemies.size, 8);
assert.equal(updateStage21Spawners(capped, 10_000).length, 0);

const failure = createStage21Flow(2, { unlockedStage: 2, unlockedLevel: 1 });
assert.equal(updateStage21PartyFailure(failure, 0, 16), 'failure-pending');
assert.equal(updateStage21PartyFailure(failure, 0, Stage21FailureDelayMs), 'failed');
assert.deepEqual(failure.unlockProgress, { unlockedStage: 2, unlockedLevel: 1 });

const hazards = createStage21IceHazards();
assert.equal(hazards.length, 38);
const ceiling = hazards[0]!;
const triggerTarget = {
  slot: 'p1' as const,
  x: ceiling.source.x + Stage21IceTuning.triggerDistanceX,
  y: ceiling.source.y + 54,
  width: 48,
  height: 96,
  facingX: 1 as const,
  alive: true,
};
updateStage21IceHazards([ceiling], [triggerTarget], 0, () => 0);
assert.equal(ceiling.frame, 2, 'ceiling thorn triggers at the 200px horizontal threshold');
const hitTarget = { ...triggerTarget, x: ceiling.source.x + 20, y: ceiling.source.y + 60 };
const firstHits = updateStage21IceHazards([ceiling], [hitTarget], 0, () => 0);
assert.equal(firstHits.length, 1);
assert.equal(firstHits[0]?.damage, 10);
assert.equal(firstHits[0]?.knockbackX, 10);
assert.equal(updateStage21IceHazards([ceiling], [hitTarget], 0, () => 0).length, 0);
ceiling.attackElapsedMs = Stage21IceTuning.attackIdIntervalMs - 1;
const repeatHits = updateStage21IceHazards(
  [ceiling],
  [{ ...hitTarget, facingX: -1 }],
  1,
  () => 0.999,
);
assert.equal(repeatHits.length, 1);
assert.ok(repeatHits[0]!.damage >= 10 && repeatHits[0]!.damage < 20);
assert.equal(repeatHits[0]?.knockbackX, -10);
const floorHazard = hazards.find((hazard) => hazard.source.orientation === 'floor')!;
updateStage21IceHazards([floorHazard], [], 10_000);
assert.equal(floorHazard.frame, 1, 'floor thorn remains on static frame 1');

const gameplayBridge = readFileSync(
  path.join(repoRoot, 'src/scenes/stage21/Stage21GameplayBridge.ts'),
  'utf8',
);
assert.ok(gameplayBridge.includes('createStage21IceHazards'));
assert.ok(gameplayBridge.includes('getStage21EnemyConfig') === false);
assert.ok(gameplayBridge.includes('/53'));
assert.ok(gameplayBridge.includes('placeholder-combat') === false);
const worldBridge = readFileSync(path.join(repoRoot, 'src/scenes/stage21/Stage21WorldBridge.ts'), 'utf8');
assert.ok(worldBridge.includes("setName('floorBg2')"));
assert.ok(worldBridge.includes("setName('sl21')"));
assert.ok(worldBridge.includes('stage21TransferDoor.rasterPadding'));
const mapSystem = readFileSync(path.join(repoRoot, 'src/systems/HeavenMapSystem.ts'), 'utf8');
assert.ok(mapSystem.includes("routeKey: 'Stage21Scene'"));
const sceneSource = readFileSync(path.join(repoRoot, 'src/scenes/Stage21Scene.ts'), 'utf8');
assert.ok(sceneSource.includes('Monster6/9/10/19 与弹体为现代占位表现'));

console.log('Stage 2-1 resources, layout, traversal, hazards, waves, result, and route tests passed.');
