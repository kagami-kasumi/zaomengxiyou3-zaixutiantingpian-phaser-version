import assert from 'node:assert/strict';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { createDefaultGameSave } from '../src/systems/SaveSlotSystem';
import {
  GameSaveVersion,
  parseGameSave,
  serializeGameSave,
} from '../src/systems/SaveSystem';

function testCurrentSchemaRoundTripAndOwnerIsolation(): void {
  const save = createDefaultGameSave(
    new Date('2026-08-15T11:00:00.000Z'),
    createPartyConfiguration(2, 3, 5)!,
  );
  save.player1.soulCount = 12_345;
  save.player2.soulCount = 67_890;
  const parsed = parseGameSave(serializeGameSave(save));
  assert.ok(parsed);
  assert.equal(parsed.version, GameSaveVersion);
  assert.equal(parsed.player1.soulCount, 12_345);
  assert.equal(parsed.player2.soulCount, 67_890);
}

function testEveryNonCurrentVersionIsRejected(): void {
  const save = createDefaultGameSave();
  for (const version of [1, 2, 3, 4, 5, 6, GameSaveVersion + 1, undefined]) {
    const incompatible = { ...save, version };
    assert.equal(parseGameSave(JSON.stringify(incompatible)), undefined, String(version));
  }
}

function testInvalidCurrentSoulValuesAreRejected(): void {
  const save = createDefaultGameSave();
  for (const invalid of [-1, 12.75, null, '100', Number.MAX_SAFE_INTEGER + 1]) {
    const candidate = structuredClone(save) as unknown as Record<string, any>;
    candidate.player1.soulCount = invalid;
    assert.equal(parseGameSave(JSON.stringify(candidate)), undefined);
  }

  const dualSource = structuredClone(save) as unknown as Record<string, any>;
  dualSource.player1.skillLearning.soulCount = dualSource.player1.soulCount;
  assert.equal(parseGameSave(JSON.stringify(dualSource)), undefined);
}

testCurrentSchemaRoundTripAndOwnerIsolation();
testEveryNonCurrentVersionIsRejected();
testInvalidCurrentSoulValuesAreRejected();
console.log('Single current save schema, old-version rejection, safe souls, and owner isolation tests passed.');
