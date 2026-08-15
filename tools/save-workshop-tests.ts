import assert from 'node:assert/strict';

import { getEquipmentInstanceStats } from '../src/systems/EquipmentSystem';
import {
  createFormalWorkshopPage,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopFusion,
  runFormalWorkshopMaking,
  selectFormalWorkshopEntry,
  setFormalWorkshopOwner,
  setFormalWorkshopTab,
  stageFormalWorkshopFusion,
  stageFormalWorkshopMaking,
} from '../src/systems/FormalWorkshopPageSystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
} from '../src/systems/SaveSlotSystem';
import { GameSaveVersion, type SaveStorage } from '../src/systems/SaveSystem';

function testInheritedSutraStatsSurviveFormalDoubleSave(): void {
  const storage = createStorage();
  const save = createDefaultGameSave();
  save.player1.soulCount = 5_000;
  save.player2.soulCount = 5_000;
  save.player2.inventory.categories.items.unshift(
    { kind: 'stack', fillName: 'whgzzs', stackId: 'p2-v7-whg-book', quantity: 1 },
    { kind: 'stack', fillName: 'wptm', stackId: 'p2-v7-making-timber', quantity: 20 },
    { kind: 'stack', fillName: 'sms1', stackId: 'p2-v7-life-gem', quantity: 1 },
  );
  assert.equal(createSaveSlot(storage, 0, save), true);

  const model = createFormalWorkshopPage(storage, 'p1');
  assert.ok(model);
  const staticKylStats = structuredClone(model.registry.kyl.stats);
  setFormalWorkshopTab(model, 'fusion');
  for (const fillName of ['kyg', 'kyz', 'kys']) {
    selectFillName(model, fillName);
    assert.equal(stageFormalWorkshopFusion(model), true, fillName);
  }
  assert.equal(runFormalWorkshopFusion(model, storage), true);
  assert.equal(getFormalWorkshopPlayer(model).soulCount, 4_000);

  const reloaded = createFormalWorkshopPage(storage, 'p1');
  assert.ok(reloaded);
  const inherited = findEquipment(reloaded, 'kyl');
  assert.ok(inherited.baseStatsOverride);
  assert.deepEqual(inherited.definition.stats, staticKylStats);
  assert.deepEqual(getEquipmentInstanceStats(inherited), inherited.baseStatsOverride);
  const inheritedSnapshot = structuredClone(inherited.baseStatsOverride);

  setFormalWorkshopOwner(reloaded, 'p2');
  setFormalWorkshopTab(reloaded, 'making');
  selectFillName(reloaded, 'whgzzs');
  assert.equal(stageFormalWorkshopMaking(reloaded), true);
  selectFillName(reloaded, 'sms1');
  assert.equal(stageFormalWorkshopMaking(reloaded), true);
  assert.equal(runFormalWorkshopMaking(reloaded, storage, () => 0), true);

  const savedAgain = createFormalWorkshopPage(storage, 'p1');
  assert.ok(savedAgain);
  const roundTripped = findEquipment(savedAgain, 'kyl');
  assert.deepEqual(roundTripped.baseStatsOverride, inheritedSnapshot);
  assert.deepEqual(roundTripped.definition.stats, staticKylStats);
  assert.equal(getFormalWorkshopPlayer(savedAgain).soulCount, 4_000);
  setFormalWorkshopOwner(savedAgain, 'p2');
  assert.equal(getFormalWorkshopPlayer(savedAgain).soulCount, 4_800);
  assert.equal(loadActiveGame(storage)?.version, GameSaveVersion);
}

function findEquipment(
  model: NonNullable<ReturnType<typeof createFormalWorkshopPage>>,
  fillName: string,
) {
  const entry = getFormalWorkshopEntries(model).find(
    (candidate) => candidate.kind === 'equipment' &&
      candidate.definition.fillName === fillName && candidate.baseStatsOverride !== undefined,
  );
  assert.ok(entry?.kind === 'equipment', `${fillName} should be a persisted inherited equipment instance`);
  return entry;
}

function selectFillName(
  model: NonNullable<ReturnType<typeof createFormalWorkshopPage>>,
  fillName: string,
): void {
  const index = getFormalWorkshopEntries(model).findIndex(
    (entry) => entry.definition.fillName === fillName,
  );
  assert.ok(index >= 0, `${fillName} should be selectable`);
  selectFormalWorkshopEntry(model, index);
}

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

testInheritedSutraStatsSurviveFormalDoubleSave();
console.log('Current-schema formal workshop inheritance, double-save, and P1/P2 isolation tests passed.');
