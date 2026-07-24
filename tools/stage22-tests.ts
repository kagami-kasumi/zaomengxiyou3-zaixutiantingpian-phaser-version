import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assetBundles,
  stage22Assets,
  stage22Monster16Atlas,
  stage22Monster16AttackAssets,
  Stage22AssetKeys,
} from '../src/assets/AssetManifest';
import {
  isStage22LocalQaHost,
  normalizeStage22PlayerCount,
  readStage22DevOptions,
  readStage22QaOptions,
} from '../src/systems/Stage22EntrySystem';
import {
  createStage22Flow,
  defeatStage22Enemy,
  Stage22ConfiguredEnemyCount,
  Stage22FailureDelayMs,
  Stage22OrdinaryEnemyCount,
  touchStage22StopPoint,
  tryCompleteStage22,
  updateStage22PartyFailure,
  updateStage22Spawners,
} from '../src/systems/Stage22FlowSystem';
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
  stage22SpawnPoints,
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
import {
  createMonster16Visual,
  getMonster16AtlasFrame,
  Monster16VisualTickMs,
  updateMonster16Visual,
} from '../src/systems/Stage22Monster16VisualSystem';
import {
  createStage1CombatEnemy,
  getStage1EnemyConfig,
  updateStage1Enemy,
} from '../src/systems/Stage1CombatSystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
  saveActiveLevelUnlockProgress,
} from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

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
assert.deepEqual(
  {
    characterId: stage22Monster16Atlas.sourceCharacterId,
    columns: stage22Monster16Atlas.columns,
    rows: stage22Monster16Atlas.rows,
    reachable: stage22Monster16Atlas.reachableFrameCount,
  },
  { characterId: 6, columns: 6, rows: 8, reachable: 36 },
);
assert.deepEqual(
  Object.values(stage22Monster16AttackAssets).map((asset) => [
    asset.sourceCharacterId,
    asset.frameCount,
  ]),
  [[235, 20], [229, 4], [225, 29], [191, 15], [160, 16], [143, 20]],
);
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
assert.equal(stage22SpawnPoints.length, 25);
assert.deepEqual(
  stage22StopPoints.map((stop) =>
    stage22SpawnPoints
      .filter((spawn) => spawn.stopPointIdx === stop.idx)
      .reduce((sum, spawn) => sum + spawn.totalNum, 0)),
  [11, 13, 13, 16, 1],
);
assert.equal(
  stage22SpawnPoints.reduce((sum, spawn) => sum + spawn.totalNum, 0),
  Stage22ConfiguredEnemyCount,
);
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
assert.equal(normalizeStage22PlayerCount(2), 2);
assert.equal(normalizeStage22PlayerCount('2'), 1);
assert.deepEqual(readStage22QaOptions('?qaFastClear=1&qaNoDamage=1&qaFailParty=1', true), {
  fastClear: true,
  noDamage: true,
  failParty: true,
});
assert.deepEqual(readStage22QaOptions('?qaBossState=hit4&qaBossTick=9', true), {
  fastClear: false,
  noDamage: false,
  failParty: false,
  bossState: 'hit4',
  bossTick: 9,
  bossFacing: -1,
});
assert.deepEqual(readStage22QaOptions('?qaFastClear=1', false), {});

const onePlayerCap = createStage22Flow(1);
assert.equal(touchStage22StopPoint(onePlayerCap, 0), true);
assert.equal(updateStage22Spawners(onePlayerCap, 2_999).length, 0);
assert.equal(updateStage22Spawners(onePlayerCap, 4_001).length, 6);
assert.equal(onePlayerCap.aliveEnemies.size, 6);
assert.equal(updateStage22Spawners(onePlayerCap, 1_000).length, 0, '1P keeps ready spawners at cap');

const twoPlayerCap = createStage22Flow(2);
assert.equal(touchStage22StopPoint(twoPlayerCap, 0), true);
assert.equal(updateStage22Spawners(twoPlayerCap, 7_000).length, 6);
assert.equal(updateStage22Spawners(twoPlayerCap, 1_000).length, 2);
assert.equal(twoPlayerCap.aliveEnemies.size, 8);

const fullFlow = createStage22Flow(2);
for (const stopIdx of [0, 1, 2, 3] as const) {
  assert.equal(touchStage22StopPoint(fullFlow, stopIdx), true);
  for (let guard = 0; guard < 20 && fullFlow.activeStopPointIdx !== undefined; guard += 1) {
    updateStage22Spawners(fullFlow, 10_000);
    for (const id of [...fullFlow.aliveEnemies.keys()]) {
      assert.equal(defeatStage22Enemy(fullFlow, id), true);
      assert.equal(defeatStage22Enemy(fullFlow, id), false, 'ordinary rewards stay idempotent');
    }
  }
}
assert.equal(fullFlow.generatedCount, Stage22OrdinaryEnemyCount);
assert.equal(fullFlow.defeatedCount, Stage22OrdinaryEnemyCount);
assert.equal(fullFlow.nextStopPointIdx, 4);
assert.equal(touchStage22StopPoint(fullFlow, 4), true);
assert.equal(updateStage22Spawners(fullFlow, 3_999).length, 0);
assert.equal(fullFlow.phase, 'playing');
const bossSpawn = updateStage22Spawners(fullFlow, 1);
assert.equal(bossSpawn.length, 1);
assert.equal(bossSpawn[0]?.enemyType, 16);
assert.equal(bossSpawn[0]?.maxHp, 24_189);
assert.equal(fullFlow.phase, 'boss');
assert.equal(fullFlow.generatedCount, Stage22ConfiguredEnemyCount);
const bossId = bossSpawn[0]!.id;
assert.equal(defeatStage22Enemy(fullFlow, bossId), true);
assert.equal(defeatStage22Enemy(fullFlow, bossId), false, 'Monster16 reward and door stay idempotent');
assert.equal(fullFlow.doorVisible, true);
assert.equal(tryCompleteStage22(fullFlow, true, false), false);
assert.equal(tryCompleteStage22(fullFlow, true, true), true);
assert.deepEqual(fullFlow.unlockProgress, { unlockedStage: 2, unlockedLevel: 3 });
assert.equal(tryCompleteStage22(fullFlow, true, true), false, '2-3 progress cannot advance twice');
const saveValues = new Map<string, string>();
const saveStorage: SaveStorage = {
  getItem: (key) => saveValues.get(key) ?? null,
  setItem: (key, value) => { saveValues.set(key, value); },
  removeItem: (key) => { saveValues.delete(key); },
};
assert.equal(createSaveSlot(saveStorage, 0, createDefaultGameSave()), true);
assert.equal(saveActiveLevelUnlockProgress(saveStorage, fullFlow.unlockProgress), true);
assert.deepEqual(loadActiveGame(saveStorage)?.levelUnlockProgress, {
  unlockedStage: 2,
  unlockedLevel: 3,
});
assert.equal(
  saveActiveLevelUnlockProgress(saveStorage, fullFlow.unlockProgress),
  true,
  're-saving the same 2-3 unlock remains an idempotent round-trip',
);

assert.deepEqual(getStage1EnemyConfig(16), {
  enemyType: 16,
  maxHp: 24_189,
  physicalDefense: 34,
  moveSpeed: 5,
  attackRange: 150,
  attackKind: 'physics',
  attackDamage: 185,
  actionName: 'hit1',
  windupMs: 420,
  activeMs: 200,
  recoveryMs: 680,
  isBoss: true,
  displayName: 'Monster16',
});
const bossCombat = createStage1CombatEnemy({ id: 'boss-cycle', enemyType: 16, x: 0, y: 0 });
for (const expected of [
  ['hit1', 'physics', 185, 150],
  ['hit2', 'magic', 68, 200],
  ['hit3', 'magic', 47.6, 800],
  ['hit4', 'magic', 57.6, 800],
] as const) {
  bossCombat.phase = 'approach';
  updateStage1Enemy({
    enemy: bossCombat,
    targets: [{ slot: 'p1', x: 100, alive: true }],
    deltaMs: 0,
  });
  assert.deepEqual(
    [
      bossCombat.activeAttack?.actionName,
      bossCombat.activeAttack?.attackKind,
      bossCombat.activeAttack?.damage,
      bossCombat.activeAttack?.attackRange,
    ],
    expected,
  );
}

const expectedMonster16Visuals = [
  { action: 'hit1', ticks: 20, families: ['monster16Hit1'] },
  { action: 'hit2', ticks: 36, families: ['monster16Hit2Start', 'monster16Hit2Followup'] },
  { action: 'hit3', ticks: 30, families: ['monster16Hit3'] },
  { action: 'hit4', ticks: 31, families: ['monster16Hit4Start', 'monster16Hit4Followup'] },
] as const;
expectedMonster16Visuals.forEach((expected, index) => {
  const visual = createMonster16Visual();
  const events = updateMonster16Visual(visual, {
    phase: 'windup',
    attackSerial: index + 1,
    attackAction: expected.action,
    facingX: -1,
    moving: false,
  }, expected.ticks * Monster16VisualTickMs + 0.001);
  assert.deepEqual(events.map((event) => event.family), expected.families);
  assert.equal(visual.action, 'wait');
});
const deadVisual = createMonster16Visual();
updateMonster16Visual(deadVisual, {
  phase: 'dead',
  attackSerial: 0,
  facingX: 1,
  moving: false,
}, 15 * Monster16VisualTickMs + 0.001);
assert.equal(deadVisual.completed, true);
assert.equal(getMonster16AtlasFrame(deadVisual), 3 * 6 + 4);

const failureFlow = createStage22Flow(1);
assert.equal(updateStage22PartyFailure(failureFlow, 0, 0), 'failure-pending');
assert.equal(failureFlow.failureDelayRemainingMs, Stage22FailureDelayMs);
assert.equal(updateStage22PartyFailure(failureFlow, 1, 100), 'playing');
assert.equal(updateStage22PartyFailure(failureFlow, 0, 0), 'failure-pending');
assert.equal(updateStage22PartyFailure(failureFlow, 0, Stage22FailureDelayMs - 1), 'failure-pending');
assert.equal(updateStage22PartyFailure(failureFlow, 0, 1), 'failed');

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
assert.ok(mapSource.includes('Stage22Scene'), '150B exposes the formal Stage 2-2 route');
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
assert.equal(gameplaySource.includes('createStage22Flow'), false, 'the layout-only DEV bridge remains isolated');
assert.equal(gameplaySource.includes('Monster16'), false);
assert.equal(gameplaySource.includes('SaveSystem'), false);
const formalGameplaySource = readFileSync(
  path.join(repoRoot, 'src/scenes/stage22/Stage22GameplayBridge.ts'),
  'utf8',
);
assert.ok(formalGameplaySource.includes('createStage22Flow'));
assert.ok(formalGameplaySource.includes('createStage21MonsterView'));
assert.ok(formalGameplaySource.includes('createMonster16View'));
assert.ok(formalGameplaySource.includes('tryCompleteStage22'));
const formalSceneSource = readFileSync(path.join(repoRoot, 'src/scenes/Stage22Scene.ts'), 'utf8');
assert.ok(formalSceneSource.includes('showStage22Result'));
assert.ok(formalSceneSource.includes("this.scene.start('HeavenMapScene')"));
assert.ok(formalSceneSource.includes('import.meta.env.DEV || isStage22LocalQaHost'));

console.log('Stage 2-2 scene, 54-definition flow, ordinary combat route, and fire tests passed.');
