import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assetBundles,
  stage21AttackAssets,
  stage21Assets,
  stage21MonsterAtlases,
  Stage21AssetKeys,
} from '../src/assets/AssetManifest';
import {
  canEnterStage21,
  normalizeStage21PlayerCount,
  readStage21QaOptions,
} from '../src/systems/Stage21EntrySystem';
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
import {
  chooseStage21MonsterAttack,
  createStage21MonsterVisual,
  getStage21MonsterActionDefinition,
  getStage21MonsterAtlasFrame,
  getStage21MonsterFootY,
  getStage21MonsterSpriteOrigin,
  isStage21MonsterAttackAction,
  Stage21MonsterVisualProvenance,
  Stage21VisualTickMs,
  updateStage21MonsterVisual,
  type Stage21MonsterType,
  type Stage21MonsterAction,
} from '../src/systems/Stage21MonsterVisualSystem';

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
assert.equal(assetBundles.stage21.length, 17);
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

assert.deepEqual(
  Object.values(stage21MonsterAtlases).map((asset) => asset.sourceCharacterId),
  [4, 2, 1, 5],
);
assert.deepEqual(
  Object.values(stage21MonsterAtlases).map((asset) => asset.reachableFrameCount),
  [32, 20, 20, 22],
);
assert.equal(
  Object.values(stage21MonsterAtlases).reduce(
    (sum, asset) => sum + asset.reachableFrameCount,
    0,
  ),
  94,
);
for (const asset of Object.values(stage21MonsterAtlases)) {
  assert.deepEqual(
    pngDimensions(path.join(repoRoot, 'public', asset.path)),
    { width: asset.cellWidth * asset.columns, height: asset.cellHeight * asset.rows },
  );
}
assert.deepEqual(
  Object.values(stage21AttackAssets).map((asset) => asset.frameCount),
  [5, 43, 30, 21, 4, 4, 25],
);
assert.equal(
  Object.values(stage21AttackAssets).reduce((sum, asset) => sum + asset.frameCount, 0),
  132,
);
for (const asset of Object.values(stage21AttackAssets)) {
  assert.equal(asset.frameKeys.length, asset.frameCount);
  assert.equal(asset.framePaths.length, asset.frameCount);
  for (const framePath of asset.framePaths) {
    assert.ok(readFileSync(path.join(repoRoot, 'public', framePath)).length > 20);
  }
}
const attackGeometry = readFileSync(
  path.join(repoRoot, 'public/assets/stage21/bullet-frame-geometry.csv'),
  'utf8',
).trim().split(/\r?\n/);
assert.equal(attackGeometry.length, 133);
const attackDirectoryBySymbol: Readonly<Record<string, string>> = {
  Monster6Bullet1: 'monster6-hit1',
  Monster6Bullet2_1: 'monster6-hit2-start',
  Monster6Bullet2_2: 'monster6-hit2-rain',
  Monster6Bullet3: 'monster6-hit3',
  Monster9Bullet1: 'monster9-hit1',
  Monster10Bullet1: 'monster10-hit1',
  Monster19Bullet1: 'monster19-hit1',
};
for (const line of attackGeometry.slice(1)) {
  const [symbol, , frame, , , , , exportWidth, exportHeight] = line.split(',');
  const directory = symbol ? attackDirectoryBySymbol[symbol] : undefined;
  assert.ok(directory && frame && exportWidth && exportHeight);
  assert.deepEqual(
    pngDimensions(path.join(
      repoRoot,
      `public/assets/stage21/attacks/${directory}/${frame}.png`,
    )),
    { width: Math.ceil(Number(exportWidth)), height: Math.ceil(Number(exportHeight)) },
    `${symbol} frame ${frame} keeps the registered export canvas`,
  );
}
assert.deepEqual(
  [9, 10, 19].map((enemyType) =>
    Stage21MonsterVisualProvenance[enemyType as 9 | 10 | 19].height),
  [100, 100, 100],
);
assert.equal(Stage21MonsterVisualProvenance[6].height, 130);
assert.equal(getStage21MonsterFootY(9, 200), 250);
assert.equal(getStage21MonsterFootY(6, 200), 265);

const actionsByMonster: Readonly<Record<Stage21MonsterType, readonly Stage21MonsterAction[]>> = {
  6: ['wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2', 'hit3'],
  9: ['wait', 'walk', 'hurt', 'dead', 'hit1'],
  10: ['wait', 'walk', 'hurt', 'dead', 'hit1'],
  19: ['wait', 'walk', 'hurt', 'dead', 'hit1'],
};
const expectedReachableFrames: Readonly<Record<Stage21MonsterType, number>> = {
  6: 32, 9: 20, 10: 20, 19: 22,
};
for (const enemyType of [6, 9, 10, 19] as const) {
  const provenance = Stage21MonsterVisualProvenance[enemyType];
  const origin = getStage21MonsterSpriteOrigin(enemyType);
  assert.ok(Math.abs(
    -origin.x * provenance.cellWidth
      - (-provenance.cellWidth / 2 - provenance.offsetX),
  ) < 0.000_001);
  assert.ok(Math.abs(
    -origin.y * provenance.cellHeight
      - (-provenance.cellHeight / 2 + provenance.offsetY),
  ) < 0.000_001);
  assert.equal(
    actionsByMonster[enemyType].reduce(
      (sum, action) => sum + getStage21MonsterActionDefinition(enemyType, action).holdTicks.length,
      0,
    ),
    expectedReachableFrames[enemyType],
  );
}
assert.deepEqual(
  ['wait', 'walk', 'hurt', 'dead', 'hit1', 'hit2', 'hit3'].map((action) =>
    getStage21MonsterActionDefinition(6, action as Stage21MonsterAction)
      .holdTicks.reduce((sum, ticks) => sum + ticks, 0)),
  [15, 16, 15, 30, 15, 73, 32],
);

function tickVisual(
  enemyType: Stage21MonsterType,
  attackSerial: number,
  ticks: number,
  facingX: -1 | 1 = -1,
) {
  const model = createStage21MonsterVisual(enemyType);
  return {
    model,
    events: updateStage21MonsterVisual(model, {
      phase: 'windup',
      attackSerial,
      facingX,
      moving: false,
    }, Stage21VisualTickMs * ticks),
  };
}

assert.deepEqual(
  [1, 2, 3, 4].map((serial) => chooseStage21MonsterAttack(6, serial)),
  ['hit1', 'hit2', 'hit3', 'hit1'],
);
assert.equal(chooseStage21MonsterAttack(10, 2), 'hit1', 'Monster10 hit2 stays unreachable');
assert.equal(isStage21MonsterAttackAction('hit2'), true);
assert.equal(isStage21MonsterAttackAction('wait'), false);
const monster9Left = tickVisual(9, 1, 7, -1);
assert.deepEqual(monster9Left.events, [{
  family: 'monster9Hit1', offsetX: -85, offsetY: -82, facingX: -1,
  attackKind: 'physics', damage: 90, attackInterval: 666,
}]);
const monster9Right = tickVisual(9, 1, 7, 1);
assert.deepEqual(monster9Right.events, [{
  family: 'monster9Hit1', offsetX: 85, offsetY: -82, facingX: 1,
  attackKind: 'physics', damage: 90, attackInterval: 666,
}]);
assert.equal(monster9Left.model.frameIndex, 3);
assert.equal(getStage21MonsterAtlasFrame(monster9Left.model), 27);
assert.deepEqual(tickVisual(10, 1, 7).events, [{
  family: 'monster10Hit1', offsetX: -65, offsetY: -71, facingX: -1,
  attackKind: 'physics', damage: 90, attackInterval: 666,
}]);
assert.deepEqual(tickVisual(19, 1, 7).events, [{
  family: 'monster19Hit1', offsetX: -105, offsetY: -30, facingX: -1,
  attackKind: 'magic', damage: 36, attackInterval: 999,
}]);
assert.deepEqual(tickVisual(6, 1, 7).events, [{
  family: 'monster6Hit1', offsetX: -155, offsetY: -70, facingX: -1,
  attackKind: 'physics', damage: 157, attackInterval: 999,
}]);
const monster6Hit2 = tickVisual(6, 2, 44);
assert.equal(monster6Hit2.events[0]?.family, 'monster6Hit2Start');
assert.deepEqual(monster6Hit2.events.slice(1), [
  {
    family: 'monster6Hit2Rain', offsetX: -200, offsetY: -500, facingX: -1,
    attackKind: 'magic', damage: 22, attackInterval: 4,
  },
  {
    family: 'monster6Hit2Rain', offsetX: 0, offsetY: -500, facingX: -1,
    attackKind: 'magic', damage: 22, attackInterval: 4,
  },
  {
    family: 'monster6Hit2Rain', offsetX: 200, offsetY: -500, facingX: -1,
    attackKind: 'magic', damage: 22, attackInterval: 4,
  },
]);
assert.deepEqual(tickVisual(6, 3, 16, 1).events, [{
  family: 'monster6Hit3', offsetX: 55, offsetY: -95, facingX: 1,
  attackKind: 'magic', damage: 37, attackInterval: 12,
}]);
const deadVisual = createStage21MonsterVisual(6);
updateStage21MonsterVisual(deadVisual, {
  phase: 'dead', attackSerial: 0, facingX: -1, moving: false,
}, Stage21VisualTickMs * 29);
assert.equal(deadVisual.completed, false);
updateStage21MonsterVisual(deadVisual, {
  phase: 'dead', attackSerial: 0, facingX: -1, moving: false,
}, Stage21VisualTickMs);
assert.equal(deadVisual.completed, true, 'Monster6 is removed only after all 30 dead ticks');

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
assert.deepEqual(readStage21QaOptions('?qaFastClear=1&qaNoDamage=1&qaShowcase=1&qaHoldEnemy=19&qaEnemyState=hurt', true), {
  fastClear: true,
  noDamage: true,
  showcase: true,
  holdEnemyType: 19,
  forcedEnemyState: 'hurt',
});
assert.deepEqual(readStage21QaOptions('?qaFastClear=1&qaHoldEnemy=10&qaEnemyState=dead', false), {});
assert.equal(readStage21QaOptions('?qaHoldEnemy=11', true).holdEnemyType, undefined);
assert.equal(readStage21QaOptions('?qaEnemyState=wait', true).forcedEnemyState, undefined);

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
assert.ok(gameplayBridge.includes('scene.add.circle') === false);
assert.ok(gameplayBridge.includes('Phaser.GameObjects.Arc') === false);
assert.ok(gameplayBridge.includes('defeatReported'));
assert.ok(gameplayBridge.includes('view.visual.completed'));
assert.ok(gameplayBridge.includes('holdRecoveryForVisual'));
assert.ok(gameplayBridge.includes('!monster.view.visual.completed'));
const monsterVisualBridge = readFileSync(
  path.join(repoRoot, 'src/scenes/stage21/Stage21MonsterVisualBridge.ts'),
  'utf8',
);
assert.ok(monsterVisualBridge.includes('setFlipX(combat.facingX === 1)'));
assert.ok(monsterVisualBridge.includes('attack.image.destroy()'));
const worldBridge = readFileSync(path.join(repoRoot, 'src/scenes/stage21/Stage21WorldBridge.ts'), 'utf8');
assert.ok(worldBridge.includes("setName('floorBg2')"));
assert.ok(worldBridge.includes("setName('sl21')"));
assert.ok(worldBridge.includes('stage21TransferDoor.rasterPadding'));
const mapSystem = readFileSync(path.join(repoRoot, 'src/systems/HeavenMapSystem.ts'), 'utf8');
assert.ok(mapSystem.includes("routeKey: 'Stage21Scene'"));
const sceneSource = readFileSync(path.join(repoRoot, 'src/scenes/Stage21Scene.ts'), 'utf8');
assert.ok(sceneSource.includes('现代占位表现') === false);

console.log('Stage 2-1 true monster visuals, attacks, layout, flow, and route tests passed.');
