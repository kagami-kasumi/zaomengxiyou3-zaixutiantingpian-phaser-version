import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createEmptyEquipmentLoadout, createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { createHeroSkillModel } from '../src/systems/HeroSkillSystem';
import { createSeedPetRoster } from '../src/systems/PetSystem';
import { createHeroProgression } from '../src/systems/ProgressionSystem';
import { createHeroMovement, updateHeroMovement } from '../src/systems/HeroMovementSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';
import { createStage11MovementPlatforms } from '../src/systems/Stage11Layout';
import {
  activateBossArena,
  createBossArena,
  createVerticalClimbState,
  isBossZoneTriggered,
  markBossTriggered,
  revealTransferDoor,
  tryClearArena,
  updateVerticalClimbCamera,
} from '../src/systems/LevelSystem';
import {
  createGameSave,
  GameSaveVersion,
  parseGameSave,
  restoreGameState,
} from '../src/systems/SaveSystem';
import { createSkillLearningState } from '../src/systems/SkillUISystem';
import {
  completeStage11,
  createStage11Flow,
  Stage11FailureDelayMs,
  updateStage11PartyFailure,
} from '../src/systems/Stage11FlowSystem';

function testSinglePlayerFailureDelayIsOneShot(): void {
  const flow = createStage11Flow(1);
  assert.equal(updateStage11PartyFailure(flow, 0, 16), 'failure-pending');
  assert.equal(flow.failureDelayRemainingMs, Stage11FailureDelayMs);
  assert.equal(updateStage11PartyFailure(flow, 0, Stage11FailureDelayMs - 1), 'failure-pending');
  assert.equal(updateStage11PartyFailure(flow, 0, 1), 'failed');
  assert.equal(updateStage11PartyFailure(flow, 0, 10_000), 'failed');
}

function testTwoPlayerFailureRequiresWholeParty(): void {
  const flow = createStage11Flow(2);
  assert.equal(updateStage11PartyFailure(flow, 1, 10_000), 'playing');
  assert.equal(updateStage11PartyFailure(flow, 0, 16), 'failure-pending');
  assert.equal(updateStage11PartyFailure(flow, 1, 500), 'playing');
  assert.equal(flow.failureDelayRemainingMs, 0);
  assert.equal(updateStage11PartyFailure(flow, 0, 16), 'failure-pending');
  assert.equal(updateStage11PartyFailure(flow, 0, Stage11FailureDelayMs), 'failed');
}

function testVictoryUnlockIsIdempotent(): void {
  const flow = createStage11Flow(1);
  assert.equal(completeStage11(flow), true);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  assert.equal(completeStage11(flow), false);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
}

function testReplayingStage11DoesNotDowngradeStage13Unlock(): void {
  const flow = createStage11Flow(1, { unlockedStage: 1, unlockedLevel: 3 });
  assert.equal(completeStage11(flow), true);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 3 });
}

function testTransferDoorClearsOnlyOnce(): void {
  const arena = createBossArena();
  arena.state = 'active';
  revealTransferDoor(arena);
  const doorCenterX = arena.door.x + arena.door.width / 2;
  const doorCenterY = arena.door.y + arena.door.height / 2;
  assert.equal(tryClearArena(arena, doorCenterX, doorCenterY, false), false);
  assert.equal(tryClearArena(arena, doorCenterX - arena.door.width, doorCenterY, true), false);
  assert.equal(tryClearArena(arena, doorCenterX, arena.door.y + arena.door.height + 0.5, true), true);
  arena.state = 'active';
  assert.equal(tryClearArena(arena, doorCenterX, doorCenterY, true), true);
  assert.equal(arena.state, 'cleared');
  assert.equal(tryClearArena(arena, doorCenterX, doorCenterY, true), false);
}

function testBossSpawnOverlapsRole1GroundAttackHeight(): void {
  const arena = createBossArena();
  const boss = activateBossArena(arena);
  const bossBottom = boss.y + 35;
  const role1GroundAttackTop = 497.6 - 72 - 112 / 2;
  assert.ok(bossBottom > role1GroundAttackTop);
}

function testStage11LargestPlatformStepHasReliableDoubleJumpMargin(): void {
  const platforms = createStage11MovementPlatforms();
  const source = platforms.find((platform) => platform.id === 'stage11-through-4');
  assert.ok(source);
  const hero = createHeroMovement(492, source.top);
  hero.currentPlatformId = source.id;
  let previousInput: PlayerInputState | undefined;

  for (let frame = 0; frame < 80; frame += 1) {
    const input = createMovementInput(frame < 20 ? -1 : 0, frame === 0 || frame === 14);
    updateHeroMovement(hero, input, previousInput, platforms, { left: 0, right: 940, bottom: 2868.551 }, frame * 16, 16);
    previousInput = input;
  }

  assert.equal(hero.currentPlatformId, 'stage11-through-5');
}

function testCameraFollowsClimberWhileStopWaveIsAlive(): void {
  const viewportHeight = 590;
  const climb = createVerticalClimbState(viewportHeight);
  climb.activeStopIndex = 2;
  climb.stopPoints[2].waveSpawned = true;
  climb.stopPoints[2].waveHadActiveMonsters = true;

  updateVerticalClimbCamera(climb, 620, 1_000, viewportHeight);

  assert.equal(climb.stopPoints[2].cleared, false);
  assert.equal(climb.activeStopIndex, 2);
  assert.equal(climb.targetCameraY, 384);
  assert.equal(climb.cameraY, 384);
}

function testBossTriggersAtHighestLayerWhileStopWaveIsAlive(): void {
  const climb = createVerticalClimbState(590);
  climb.activeStopIndex = 3;
  climb.stopPoints[3].waveSpawned = true;
  climb.stopPoints[3].waveHadActiveMonsters = true;

  assert.equal(isBossZoneTriggered(climb, 471), false);
  assert.equal(isBossZoneTriggered(climb, 470), true);
  assert.equal(climb.stopPoints[3].cleared, false);
}

function testBossCameraUsesOriginalLowerScreenComposition(): void {
  const viewportHeight = 590;
  const climb = createVerticalClimbState(viewportHeight);
  climb.cameraY = 234;

  updateVerticalClimbCamera(climb, 470, 0, viewportHeight);

  assert.equal(climb.targetCameraY, 50);
  assert.equal(climb.cameraY, 234);

  markBossTriggered(climb);
  updateVerticalClimbCamera(climb, 650, 1_000, viewportHeight);
  assert.equal(climb.cameraY, 142);
  assert.equal(climb.bossCameraTweenRemainingMs, 1_000);

  updateVerticalClimbCamera(climb, 650, 1_000, viewportHeight);
  assert.equal(climb.targetCameraY, 50);
  assert.equal(climb.cameraY, 50);
  assert.equal(470 - climb.cameraY, 420);
}

function testFormalStage11DoorAndResultContractRemainsConnected(): void {
  const bossBridge = readFileSync(
    path.join(process.cwd(), 'src/scenes/test-scene/TestSceneBossArena.ts'),
    'utf8',
  );
  const viewsSource = readFileSync(
    path.join(process.cwd(), 'src/scenes/test-scene/TestSceneViews.ts'),
    'utf8',
  );
  const resultBridge = readFileSync(
    path.join(process.cwd(), 'src/scenes/test-scene/TestSceneStage11FlowBridge.ts'),
    'utf8',
  );
  const sceneSource = readFileSync(
    path.join(process.cwd(), 'src/scenes/TestScene.ts'),
    'utf8',
  );

  assert.match(bossBridge, /input\[player\.slot as PlayerSlot\]\.up/);
  assert.match(bossBridge, /this\.showClearOverlay\(\)/);
  assert.doesNotMatch(bossBridge, /stopPoints\.every/);
  assert.match(viewsSource, /createTransferDoorView[\s\S]*Stage13AssetKeys\.transferDoor/);
  assert.doesNotMatch(viewsSource, /'DOOR\\n\[↑\]'/);
  assert.match(resultBridge, /title: '关卡胜利'/);
  assert.match(resultBridge, /'重玩 1-1'/);
  assert.match(resultBridge, /'返回天庭地图'/);
  assert.doesNotMatch(sceneSource, /catch-monster72|Monster72 monkey1/);
}

function createMovementInput(moveX: -1 | 0 | 1, jump: boolean): PlayerInputState {
  return {
    slot: 'p1',
    moveX,
    down: false,
    up: false,
    attack: false,
    jump,
    skillSlots: [false, false, false, false, false],
    special: false,
    magicWeapon: false,
  };
}

function testSaveV4RoundTripAndV1V2Migration(): void {
  const current = createTestSave();
  assert.equal(current.version, GameSaveVersion);
  assert.deepEqual(current.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  const parsed = parseGameSave(JSON.stringify(current));
  assert.ok(parsed);
  assert.deepEqual(
    restoreGameState(parsed, createSeedEquipmentRegistry()).levelUnlockProgress,
    { unlockedStage: 1, unlockedLevel: 2 },
  );

  const v2 = { ...current, version: 2 } as Record<string, unknown>;
  delete v2.levelUnlockProgress;
  const migratedV2 = parseGameSave(JSON.stringify(v2));
  assert.ok(migratedV2);
  assert.equal(migratedV2.version, GameSaveVersion);
  assert.deepEqual(migratedV2.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 1 });

  const v1 = { version: 1, savedAt: current.savedAt, player1: current.player1 };
  const migratedV1 = parseGameSave(JSON.stringify(v1));
  assert.ok(migratedV1);
  assert.equal(migratedV1.version, GameSaveVersion);
  assert.deepEqual(migratedV1.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 1 });
}

function createTestSave() {
  return createGameSave({
    progression: createHeroProgression(1),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(),
    equipmentLoadout: createEmptyEquipmentLoadout(),
    petRoster: createSeedPetRoster(),
    levelUnlockProgress: { unlockedStage: 1, unlockedLevel: 2 },
    now: new Date('2026-07-19T08:00:00.000Z'),
  });
}

testSinglePlayerFailureDelayIsOneShot();
testTwoPlayerFailureRequiresWholeParty();
testVictoryUnlockIsIdempotent();
testReplayingStage11DoesNotDowngradeStage13Unlock();
testTransferDoorClearsOnlyOnce();
testBossSpawnOverlapsRole1GroundAttackHeight();
testStage11LargestPlatformStepHasReliableDoubleJumpMargin();
testCameraFollowsClimberWhileStopWaveIsAlive();
testBossTriggersAtHighestLayerWhileStopWaveIsAlive();
testBossCameraUsesOriginalLowerScreenComposition();
testFormalStage11DoorAndResultContractRemainsConnected();
testSaveV4RoundTripAndV1V2Migration();

console.log('Stage 1-1 flow tests passed.');
