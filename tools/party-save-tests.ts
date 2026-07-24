import assert from 'node:assert/strict';
import {
  createPartyConfiguration,
  getPartyHeroId,
  getPartyPlayerSlots,
  parsePartyConfiguration,
} from '../src/systems/PartyConfigurationSystem';
import {
  ActiveSaveSlotStorageKey,
  createDefaultGameSave,
  createPartySaveSlot,
  getActivePartyConfiguration,
  getActiveSaveSlotId,
  getSaveSlotStorageKey,
  inspectSaveSlot,
  selectSaveSlot,
} from '../src/systems/SaveSlotSystem';
import {
  FeatureGameSaveVersion,
  GameSaveVersion,
  parseGameSave,
  serializeGameSave,
  type SaveStorage,
} from '../src/systems/SaveSystem';

function createMemoryStorage(): SaveStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

for (const heroId of [1, 2, 3, 4, 5] as const) {
  const party = createPartyConfiguration(1, heroId);
  assert.ok(party);
  const save = createDefaultGameSave(new Date('2026-07-24T00:00:00.000Z'), party);
  const parsed = parseGameSave(serializeGameSave(save));
  assert.equal(parsed?.party.members.p1.heroId, heroId);
  assert.deepEqual(getPartyPlayerSlots(parsed!.party), ['p1']);
  assert.equal(getPartyHeroId(parsed!.party, 'p2'), undefined);
}

{
  const party = createPartyConfiguration(2, 2, 5)!;
  const save = createDefaultGameSave(new Date('2026-07-24T00:00:00.000Z'), party);
  const parsed = parseGameSave(serializeGameSave(save));
  assert.equal(parsed?.version, GameSaveVersion);
  assert.deepEqual(getPartyPlayerSlots(parsed!.party), ['p1', 'p2']);
  assert.equal(getPartyHeroId(parsed!.party, 'p1'), 2);
  assert.equal(getPartyHeroId(parsed!.party, 'p2'), 5);
  assert.equal(parsed?.player1.heroId, 2);
  assert.equal(parsed?.player2.heroId, 5);
}

for (const invalid of [
  createPartyConfiguration(0, 1),
  createPartyConfiguration(3, 1),
  createPartyConfiguration(1, 0),
  createPartyConfiguration(1, 6),
  createPartyConfiguration(2, 1, 1),
  createPartyConfiguration(2, 1),
]) {
  assert.equal(invalid, undefined);
}
assert.equal(parsePartyConfiguration({ playerCount: 1, members: { p1: { heroId: 1 }, p2: { heroId: 2 } } }), undefined);

{
  const current = createDefaultGameSave(new Date('2026-07-23T00:00:00.000Z'));
  current.player1.level = 17;
  current.player2.heroId = 4;
  current.player2.level = 23;
  current.player2.soulCount = 9876;
  current.player2.inventory.categories.items.push({
    kind: 'stack',
    fillName: 'sms1',
    stackId: 'legacy-p2-stack',
    quantity: 9,
  });
  const legacyV4 = {
    ...current,
    version: FeatureGameSaveVersion,
    party: undefined,
    player1: {
      ...current.player1,
      skillLearning: { ...current.player1.skillLearning, soulCount: current.player1.soulCount },
    },
    player2: {
      ...current.player2,
      skillLearning: { ...current.player2.skillLearning, soulCount: current.player2.soulCount },
    },
  };
  delete Reflect.get(legacyV4, 'party');
  delete Reflect.get(legacyV4.player1, 'soulCount');
  delete Reflect.get(legacyV4.player2, 'soulCount');
  const migrated = parseGameSave(JSON.stringify(legacyV4));
  assert.ok(migrated);
  assert.equal(migrated.party.playerCount, 1);
  assert.equal(migrated.party.members.p1.heroId, 1);
  assert.equal(migrated.player1.level, 17);
  assert.equal(migrated.player2.heroId, 4);
  assert.equal(migrated.player2.level, 23);
  assert.equal(migrated.player2.soulCount, 9876);
  assert.equal(
    migrated.player2.inventory.categories.items.find((entry) => entry.stackId === 'legacy-p2-stack')?.quantity,
    9,
  );
  assert.deepEqual(parseGameSave(serializeGameSave(migrated)), migrated, 'migration must be idempotent');
}

{
  const save = createDefaultGameSave();
  const malformed = JSON.parse(serializeGameSave(save));
  delete malformed.party;
  assert.equal(parseGameSave(JSON.stringify(malformed)), undefined);
  malformed.party = { playerCount: 2, members: { p1: { heroId: 1 }, p2: { heroId: 1 } } };
  assert.equal(parseGameSave(JSON.stringify(malformed)), undefined);
  malformed.party = { playerCount: 1, members: { p1: { heroId: 2 } } };
  assert.equal(parseGameSave(JSON.stringify(malformed)), undefined, 'party/player hero mismatch is corrupt');
}

{
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 0, 1, 3, undefined, new Date('2026-07-24T01:00:00.000Z')), true);
  assert.equal(createPartySaveSlot(storage, 1, 2, 2, 5, new Date('2026-07-24T02:00:00.000Z')), true);
  assert.equal(getActiveSaveSlotId(storage), 1);
  assert.deepEqual(getActivePartyConfiguration(storage), createPartyConfiguration(2, 2, 5));
  assert.ok(selectSaveSlot(storage, 0));
  assert.deepEqual(getActivePartyConfiguration(storage), createPartyConfiguration(1, 3));
  assert.equal(inspectSaveSlot(storage, 1).save?.party.playerCount, 2, 'slot selection must not mutate another party');
}

{
  const values = new Map<string, string>();
  let rejectActiveWrite = true;
  const storage: SaveStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === ActiveSaveSlotStorageKey && rejectActiveWrite) {
        rejectActiveWrite = false;
        throw new Error('simulated active-slot write failure');
      }
      values.set(key, value);
    },
    removeItem: (key) => { values.delete(key); },
  };
  assert.equal(createPartySaveSlot(storage, 4, 1, 1), false);
  assert.equal(values.has(getSaveSlotStorageKey(4)), false, 'failed create must roll back the slot');
  assert.equal(values.has(ActiveSaveSlotStorageKey), false, 'failed create must not leave an active slot');
}

console.log('Party configuration, V5 migration, active query, and atomic slot tests passed.');
