import assert from 'node:assert/strict';
import { createEmptyEquipmentLoadout, createSeedEquipmentRegistry } from '../../src/systems/EquipmentSystem';
import { createHeroSkillModel } from '../../src/systems/HeroSkillSystem';
import { createPlayerPetRosters } from '../../src/systems/PetOwnershipSystem';
import { createHeroProgression } from '../../src/systems/ProgressionSystem';
import {
  createGameSave,
  GameSaveVersion,
  parseGameSave,
  restoreGameState,
} from '../../src/systems/SaveSystem';
import { createSkillLearningState } from '../../src/systems/SkillUISystem';

export function runDualPlayerPetSaveTests(): void {
  testV2RoundTripRestoresBothPetOwners();
  testV1MigrationPreservesP1AndCreatesEmptyP2();
  testV2RejectsDamagedP2WithoutContaminatingP1();
}

function testV2RoundTripRestoresBothPetOwners(): void {
  const rosters = createPlayerPetRosters();
  rosters.p1.pets[0].level = 7;
  rosters.p2.pets[0].level = 11;
  rosters.p2.pets[0].skillState!.monkey1Xj.cooldownMs = 999;
  rosters.p2.pets[0].magicFlowerBuff = {
    kind: 'magicFlowerAddBuff', sourceName: 'transient', attackMultiplier: 1.1,
    totalMs: 1000, remainingMs: 500,
  };
  const save = createTestSave(rosters.p1, rosters.p2);
  assert.equal(save.version, GameSaveVersion);
  assert.equal((save.player2.pets[0] as any).skillState, undefined);
  assert.equal((save.player2.pets[0] as any).magicFlowerBuff, undefined);

  const parsed = parseGameSave(JSON.stringify(save));
  assert.ok(parsed);
  const restored = restoreGameState(parsed, createSeedEquipmentRegistry());
  assert.equal(restored.petRoster.pets[0].level, 7);
  assert.equal(restored.player2PetRoster.pets[0].level, 11);
  assert.ok(restored.player2PetRoster.pets[0].id.startsWith('p2-'));
  assert.notStrictEqual(restored.petRoster, restored.player2PetRoster);
  assert.notStrictEqual(restored.petRoster.pets[0], restored.player2PetRoster.pets[0]);
  assert.equal(restored.player2PetRoster.pets[0].skillState?.monkey1Xj.cooldownMs, 0);
  assert.equal(restored.player2PetRoster.pets[0].magicFlowerBuff, undefined);
}

function testV1MigrationPreservesP1AndCreatesEmptyP2(): void {
  const rosters = createPlayerPetRosters();
  rosters.p1.pets[0].level = 19;
  const current = createTestSave(rosters.p1, rosters.p2);
  const legacy = {
    version: 1,
    savedAt: current.savedAt,
    player1: current.player1,
  };
  const migrated = parseGameSave(JSON.stringify(legacy));
  assert.ok(migrated);
  assert.equal(migrated.version, 3);
  const restored = restoreGameState(migrated, createSeedEquipmentRegistry());
  assert.equal(restored.petRoster.pets[0].level, 19);
  assert.equal(restored.player2PetRoster.pets.length, 0);
  assert.equal(restored.player2PetRoster.selectedIndex, 0);
}

function testV2RejectsDamagedP2WithoutContaminatingP1(): void {
  const rosters = createPlayerPetRosters();
  const save = createTestSave(rosters.p1, rosters.p2) as any;
  save.player2.pets = 'damaged';
  assert.equal(parseGameSave(JSON.stringify(save)), undefined);
}

function createTestSave(
  player1PetRoster: ReturnType<typeof createPlayerPetRosters>['p1'],
  player2PetRoster: ReturnType<typeof createPlayerPetRosters>['p2'],
) {
  return createGameSave({
    progression: createHeroProgression(2),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(),
    equipmentLoadout: createEmptyEquipmentLoadout(),
    petRoster: player1PetRoster,
    player2PetRoster,
    now: new Date('2026-06-20T08:00:00.000Z'),
  });
}
