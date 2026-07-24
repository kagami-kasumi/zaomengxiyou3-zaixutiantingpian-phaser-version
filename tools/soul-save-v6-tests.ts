import assert from 'node:assert/strict';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { createDefaultGameSave } from '../src/systems/SaveSlotSystem';
import {
  FeatureGameSaveVersion,
  GameSaveVersion,
  LegacyGameSaveVersion,
  PartyGameSaveVersion,
  PetOwnerGameSaveVersion,
  PreviousGameSaveVersion,
  parseGameSave,
  serializeGameSave,
  type PlayerFeatureSaveV6,
} from '../src/systems/SaveSystem';

function toLegacyPlayer(player: PlayerFeatureSaveV6) {
  const { soulCount, ...withoutSoul } = player;
  return {
    ...withoutSoul,
    skillLearning: {
      ...player.skillLearning,
      soulCount,
    },
  };
}

function testV1ThroughV5SoulMigration(): void {
  const current = createDefaultGameSave(
    new Date('2026-07-24T10:00:00.000Z'),
    createPartyConfiguration(2, 1, 2)!,
  );
  current.player1.soulCount = 111;
  current.player2.soulCount = 222;
  const player1 = toLegacyPlayer(current.player1);
  const player2 = toLegacyPlayer(current.player2);
  const legacyByVersion = [
    {
      version: LegacyGameSaveVersion,
      savedAt: current.savedAt,
      player1,
    },
    {
      version: PetOwnerGameSaveVersion,
      savedAt: current.savedAt,
      player1,
      player2: { pets: player2.pets, selectedPetIndex: player2.selectedPetIndex },
    },
    {
      version: PreviousGameSaveVersion,
      savedAt: current.savedAt,
      player1,
      player2: { pets: player2.pets, selectedPetIndex: player2.selectedPetIndex },
      levelUnlockProgress: current.levelUnlockProgress,
    },
    {
      version: FeatureGameSaveVersion,
      savedAt: current.savedAt,
      player1,
      player2,
      levelUnlockProgress: current.levelUnlockProgress,
    },
    {
      version: PartyGameSaveVersion,
      savedAt: current.savedAt,
      party: current.party,
      player1,
      player2,
      levelUnlockProgress: current.levelUnlockProgress,
    },
  ];

  for (const legacy of legacyByVersion) {
    const migrated = parseGameSave(JSON.stringify(legacy));
    assert.ok(migrated, `V${legacy.version} must migrate`);
    assert.equal(migrated.version, GameSaveVersion);
    assert.equal(migrated.player1.soulCount, 111);
    assert.equal(migrated.player2.soulCount, legacy.version >= FeatureGameSaveVersion ? 222 : 0);
    assert.equal('soulCount' in migrated.player1.skillLearning, false);
    assert.equal('soulCount' in migrated.player2.skillLearning, false);
  }
}

function testV6RoundTripAndOwnerIsolation(): void {
  const save = createDefaultGameSave(
    new Date('2026-07-24T11:00:00.000Z'),
    createPartyConfiguration(2, 3, 5)!,
  );
  save.player1.soulCount = 12_345;
  save.player2.soulCount = 67_890;
  const parsed = parseGameSave(serializeGameSave(save));
  assert.ok(parsed);
  assert.equal(parsed.player1.soulCount, 12_345);
  assert.equal(parsed.player2.soulCount, 67_890);
  assert.equal('soulCount' in parsed.player1.skillLearning, false);
  assert.equal('soulCount' in parsed.player2.skillLearning, false);
}

function testCorruptAndDualSourceSoulValuesAreRejected(): void {
  const save = createDefaultGameSave();
  for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY, '100']) {
    const candidate = structuredClone(save) as unknown as Record<string, any>;
    candidate.player1.soulCount = invalid;
    assert.equal(parseGameSave(JSON.stringify(candidate)), undefined);
  }

  const dualSource = structuredClone(save) as unknown as Record<string, any>;
  dualSource.player1.skillLearning.soulCount = dualSource.player1.soulCount;
  assert.equal(parseGameSave(JSON.stringify(dualSource)), undefined);

  const legacy = {
    version: PartyGameSaveVersion,
    savedAt: save.savedAt,
    party: save.party,
    player1: { ...toLegacyPlayer(save.player1), skillLearning: { ...save.player1.skillLearning, soulCount: -1 } },
    player2: toLegacyPlayer(save.player2),
    levelUnlockProgress: save.levelUnlockProgress,
  };
  assert.equal(parseGameSave(JSON.stringify(legacy)), undefined);
}

testV1ThroughV5SoulMigration();
testV6RoundTripAndOwnerIsolation();
testCorruptAndDualSourceSoulValuesAreRejected();
console.log('V6 player-owned soul schema, V1..V5 migration, isolation, and corruption tests passed.');
