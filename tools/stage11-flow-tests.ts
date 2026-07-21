import assert from 'node:assert/strict';
import { createEmptyEquipmentLoadout, createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { createHeroSkillModel } from '../src/systems/HeroSkillSystem';
import { createSeedPetRoster } from '../src/systems/PetSystem';
import { createHeroProgression } from '../src/systems/ProgressionSystem';
import { createBossArena, revealTransferDoor, tryClearArena } from '../src/systems/LevelSystem';
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
  assert.equal(tryClearArena(arena, doorCenterX, doorCenterY, true), true);
  assert.equal(arena.state, 'cleared');
  assert.equal(tryClearArena(arena, doorCenterX, doorCenterY, true), false);
}

function testSaveV3RoundTripAndV1V2Migration(): void {
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
  assert.equal(migratedV2.version, 3);
  assert.deepEqual(migratedV2.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 1 });

  const v1 = { version: 1, savedAt: current.savedAt, player1: current.player1 };
  const migratedV1 = parseGameSave(JSON.stringify(v1));
  assert.ok(migratedV1);
  assert.equal(migratedV1.version, 3);
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
testSaveV3RoundTripAndV1V2Migration();

console.log('Stage 1-1 flow tests passed.');
