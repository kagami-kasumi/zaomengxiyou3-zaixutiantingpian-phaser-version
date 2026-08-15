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
  createStage11Flow,
  Stage11FailureDelayMs,
} from '../src/systems/Stage11FlowSystem';
import { createTestLevelCompletionAttempt } from './level-lifecycle-test-helpers';

function testSinglePlayerFailureDelayIsOneShot(): void {
  const flow = createStage11Flow(1);
  assert.equal(flow.updatePartyFailure(0, 16), 'failure-pending');
  assert.equal(flow.failureDelayRemainingMs, Stage11FailureDelayMs);
  assert.equal(flow.updatePartyFailure(0, Stage11FailureDelayMs - 1), 'failure-pending');
  assert.equal(flow.updatePartyFailure(0, 1), 'failed');
  assert.equal(flow.updatePartyFailure(0, 10_000), 'failed');
}

function testTwoPlayerFailureRequiresWholeParty(): void {
  const flow = createStage11Flow(2);
  assert.equal(flow.updatePartyFailure(1, 10_000), 'playing');
  assert.equal(flow.updatePartyFailure(0, 16), 'failure-pending');
  assert.equal(flow.updatePartyFailure(1, 500), 'playing');
  assert.equal(flow.failureDelayRemainingMs, 0);
  assert.equal(flow.updatePartyFailure(0, 16), 'failure-pending');
  assert.equal(flow.updatePartyFailure(0, Stage11FailureDelayMs), 'failed');
}

function testVictoryUnlockIsIdempotent(): void {
  const flow = createStage11Flow(1);
  assert.equal(flow.tryComplete(createTestLevelCompletionAttempt()), true);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  assert.equal(flow.tryComplete(createTestLevelCompletionAttempt()), false);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
}

function testReplayingStage11DoesNotDowngradeStage13Unlock(): void {
  const flow = createStage11Flow(1, { unlockedStage: 1, unlockedLevel: 3 });
  assert.equal(flow.tryComplete(createTestLevelCompletionAttempt()), true);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 3 });
}

function testTransferDoorRevealDoesNotOwnLevelCompletion(): void {
  const arena = createBossArena();
  arena.state = 'active';
  revealTransferDoor(arena);
  assert.equal(arena.door.visible, true);
  assert.equal(arena.state, 'active');
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
  const runtimeAdapter = readFileSync(
    path.join(process.cwd(), 'src/scenes/test-scene/TestSceneStage11RuntimeAdapter.ts'),
    'utf8',
  );
  const runtimeSource = readFileSync(
    path.join(process.cwd(), 'src/scenes/PlayableLevelRuntime.ts'), 'utf8');
  const sceneSource = readFileSync(
    path.join(process.cwd(), 'src/scenes/TestScene.ts'),
    'utf8',
  );

  assert.match(bossBridge, /createCompletionAttempt/);
  assert.match(bossBridge, /input: input\[player\.slot as PlayerSlot\]/);
  assert.doesNotMatch(bossBridge, /showClearOverlay/);
  assert.doesNotMatch(bossBridge, /stopPoints\.every/);
  assert.match(runtimeAdapter, /createPlayableLevelRuntime/);
  assert.match(runtimeAdapter, /world\.transferDoor/);
  assert.match(runtimeSource, /showLevelResult\(scene, \{/);
  assert.doesNotMatch(sceneSource, /Stage13AssetKeys\.transferDoor/);
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

function testCurrentSaveRoundTripAndOldVersionRejection(): void {
  const current = createTestSave();
  assert.equal(current.version, GameSaveVersion);
  assert.deepEqual(current.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  const parsed = parseGameSave(JSON.stringify(current));
  assert.ok(parsed);
  assert.deepEqual(
    restoreGameState(parsed, createSeedEquipmentRegistry()).levelUnlockProgress,
    { unlockedStage: 1, unlockedLevel: 2 },
  );

  const { soulCount, ...player1 } = current.player1;
  const legacyPlayer1 = {
    ...player1,
    skillLearning: { ...current.player1.skillLearning, soulCount },
  };
  const v2 = { ...current, version: 2, player1: legacyPlayer1 } as Record<string, unknown>;
  delete v2.levelUnlockProgress;
  assert.equal(parseGameSave(JSON.stringify(v2)), undefined);

  const v1 = { version: 1, savedAt: current.savedAt, player1: legacyPlayer1 };
  assert.equal(parseGameSave(JSON.stringify(v1)), undefined);
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
testTransferDoorRevealDoesNotOwnLevelCompletion();
testBossSpawnOverlapsRole1GroundAttackHeight();
testStage11LargestPlatformStepHasReliableDoubleJumpMargin();
testCameraFollowsClimberWhileStopWaveIsAlive();
testBossTriggersAtHighestLayerWhileStopWaveIsAlive();
testBossCameraUsesOriginalLowerScreenComposition();
testFormalStage11DoorAndResultContractRemainsConnected();
testCurrentSaveRoundTripAndOldVersionRejection();

console.log('Stage 1-1 flow tests passed.');
