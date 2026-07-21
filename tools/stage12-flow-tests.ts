import assert from 'node:assert/strict';
import { createEmptyEquipmentLoadout, createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { createHeroSkillModel } from '../src/systems/HeroSkillSystem';
import { createSeedPetRoster } from '../src/systems/PetSystem';
import { createHeroProgression } from '../src/systems/ProgressionSystem';
import {
  createGameSave,
  loadGame,
  restoreGameState,
  saveGame,
  saveLevelUnlockProgress,
  type SaveStorage,
} from '../src/systems/SaveSystem';
import { createSkillLearningState } from '../src/systems/SkillUISystem';
import {
  createStage12Flow,
  defeatStage12Enemy,
  Stage12FailureDelayMs,
  touchStage12StopPoint,
  tryCompleteStage12,
  updateStage12PartyFailure,
  updateStage12Spawners,
} from '../src/systems/Stage12FlowSystem';

const expectedWaveCounts = [8, 11, 12, 13, 2] as const;

function testFiveStopPointsAndBossDoorGate(): void {
  const flow = createStage12Flow(1, { unlockedStage: 1, unlockedLevel: 2 });
  assert.equal(touchStage12StopPoint(flow, 1), false, 'waves cannot be skipped');

  for (let idx = 0; idx < expectedWaveCounts.length; idx += 1) {
    assert.equal(touchStage12StopPoint(flow, idx), true);
    assert.equal(touchStage12StopPoint(flow, idx), false, 'an active stop point is one-shot');
    const spawned = updateStage12Spawners(flow, 100_000);
    assert.equal(spawned.length, expectedWaveCounts[idx]);
    assert.equal(flow.aliveEnemies.size, expectedWaveCounts[idx]);

    if (idx === 4) {
      assert.deepEqual(spawned.map((enemy) => enemy.enemyType).sort(), [2, 4]);
      assert.deepEqual(spawned.map((enemy) => enemy.maxHp).sort((a, b) => a - b), [1_481, 1_500]);
      assert.equal(defeatStage12Enemy(flow, spawned[0].id), true);
      assert.equal(flow.doorVisible, false, 'one living boss must keep the door hidden');
      assert.equal(defeatStage12Enemy(flow, spawned[1].id), true);
      assert.equal(flow.doorVisible, true);
    } else {
      for (const enemy of spawned) defeatStage12Enemy(flow, enemy.id);
      assert.equal(flow.nextStopPointIdx, idx + 1);
    }
  }
  assert.equal(flow.defeatedCount, 46);
  assert.equal(tryCompleteStage12(flow, true, false), false);
  assert.equal(tryCompleteStage12(flow, false, true), false);
  assert.equal(tryCompleteStage12(flow, true, true), true);
  assert.deepEqual(flow.unlockProgress, { unlockedStage: 1, unlockedLevel: 3 });
  assert.equal(tryCompleteStage12(flow, true, true), false, 'victory must be idempotent');
}

function testWaveCannotFinishBeforeGenerationAndClear(): void {
  const flow = createStage12Flow(1);
  touchStage12StopPoint(flow, 0);
  assert.equal(updateStage12Spawners(flow, 2_999).length, 0);
  const firstPair = updateStage12Spawners(flow, 1).map((enemy) => enemy.id);
  assert.equal(firstPair.length, 2);
  firstPair.forEach((id) => defeatStage12Enemy(flow, id));
  assert.equal(flow.activeStopPointIdx, 0, 'clearing early spawns cannot finish the wave');
  assert.equal(touchStage12StopPoint(flow, 1), false);
  const remainder = updateStage12Spawners(flow, 10_000);
  remainder.forEach((enemy) => defeatStage12Enemy(flow, enemy.id));
  assert.equal(flow.activeStopPointIdx, undefined);
  assert.equal(flow.nextStopPointIdx, 1);
}

function testOneAndTwoPlayerFailure(): void {
  const single = createStage12Flow(1);
  assert.equal(updateStage12PartyFailure(single, 0, 16), 'failure-pending');
  assert.equal(updateStage12PartyFailure(single, 0, Stage12FailureDelayMs - 1), 'failure-pending');
  assert.equal(updateStage12PartyFailure(single, 0, 1), 'failed');
  assert.deepEqual(single.unlockProgress, { unlockedStage: 1, unlockedLevel: 1 });

  const double = createStage12Flow(2);
  assert.equal(updateStage12PartyFailure(double, 1, 10_000), 'playing');
  assert.equal(updateStage12PartyFailure(double, 0, 16), 'failure-pending');
  assert.equal(updateStage12PartyFailure(double, 1, 500), 'playing');
  assert.equal(updateStage12PartyFailure(double, 0, 16), 'failure-pending');
  assert.equal(updateStage12PartyFailure(double, 0, Stage12FailureDelayMs), 'failed');
}

function testV3UnlockPersistencePreservesSave(): void {
  const storage = createMemoryStorage();
  const original = createGameSave({
    progression: createHeroProgression(1),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(),
    equipmentLoadout: createEmptyEquipmentLoadout(),
    petRoster: createSeedPetRoster(),
    levelUnlockProgress: { unlockedStage: 1, unlockedLevel: 2 },
    now: new Date('2026-07-20T00:00:00.000Z'),
  });
  saveGame(storage, original);
  assert.equal(saveLevelUnlockProgress(
    storage,
    { unlockedStage: 1, unlockedLevel: 3 },
    new Date('2026-07-20T01:00:00.000Z'),
  ), true);
  const loaded = loadGame(storage);
  assert.ok(loaded);
  assert.equal(loaded.savedAt, '2026-07-20T01:00:00.000Z');
  assert.equal(loaded.player1.heroId, original.player1.heroId);
  assert.deepEqual(
    restoreGameState(loaded, createSeedEquipmentRegistry()).levelUnlockProgress,
    { unlockedStage: 1, unlockedLevel: 3 },
  );
}

function createMemoryStorage(): SaveStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

testFiveStopPointsAndBossDoorGate();
testWaveCannotFinishBeforeGenerationAndClear();
testOneAndTwoPlayerFailure();
testV3UnlockPersistencePreservesSave();

console.log('Stage 1-2 flow, boss gate, failure, and save tests passed.');
