import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { craftingAssets } from '../src/assets/AssetManifest';
import {
  createEmptyEquipmentLoadout,
  createSeedEquipmentRegistry,
  getEquipmentInstanceStats,
  type EquipmentDefinition,
  type EquipmentInstance,
} from '../src/systems/EquipmentSystem';
import {
  EquipmentStrengtheningTuning,
  canStrengthenEquipment,
  closeEquipmentStrengtheningSession,
  createEquipmentStrengtheningSession,
  getStrengtheningChance,
  stageEquipmentStrengtheningEntry,
  submitEquipmentStrengthening,
} from '../src/systems/EquipmentStrengtheningSystem';
import {
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  createFormalWorkshopPage,
  runFormalWorkshopStrengthening,
  selectFormalWorkshopEntry,
  setFormalWorkshopInventoryPage,
  stageFormalWorkshopStrengthening,
} from '../src/systems/FormalWorkshopPageSystem';
import {
  addEquipmentByFillName,
  addStackByFillName,
  createInventoryStore,
  getStackQuantityByFillName,
  removeEquipmentInstance,
} from '../src/systems/InventorySystem';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { createHeroProgression } from '../src/systems/ProgressionSystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import { createGameSave, parseGameSave, restoreGameState, type SaveStorage } from '../src/systems/SaveSystem';
import { createHeroSkillModel } from '../src/systems/HeroSkillSystem';
import { createSkillLearningState } from '../src/systems/SkillUISystem';

const registry = createSeedEquipmentRegistry();

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function findEntry(store: ReturnType<typeof createInventoryStore>, fillName: string) {
  return Object.values(store.categories).flat().find((entry) => entry.definition.fillName === fillName);
}

function testProbabilityMatrixAndAdmission(): void {
  for (let stoneLevel = 1; stoneLevel <= 5; stoneLevel += 1) {
    for (let targetLevel = 0; targetLevel <= 6; targetLevel += 1) {
      assert.equal(
        getStrengtheningChance(targetLevel, [stoneLevel]),
        EquipmentStrengtheningTuning.stoneChances[stoneLevel - 1]![targetLevel],
      );
    }
  }
  assert.equal(getStrengtheningChance(1, [1, 1, 2]), 0.5624);
  assert.ok(Math.abs(getStrengtheningChance(1, [1, 1, 2], true) - 0.703) < 1e-12);
  assert.equal(getStrengtheningChance(0, [1, 1, 1], true), 1);

  const weapon = equipmentInstance(registry.ptdcz!);
  assert.equal(canStrengthenEquipment(weapon), true);
  weapon.strengthLevel = 7;
  assert.match(String(canStrengthenEquipment(weapon)), /\+7/);
  const title = equipmentInstance({ ...registry.ptdcz!, fillName: 'title', type: 'zbtx' });
  assert.match(String(canStrengthenEquipment(title)), /头衔/);
  const artifact = equipmentInstance({ ...registry.ptdcz!, fillName: 'hy-test', quality: '神 器' });
  assert.match(String(canStrengthenEquipment(artifact)), /白名单/);
}

function testSuccessFailureProtectionAndReturn(): void {
  const store = createInventoryStore(20, 'strength');
  const loadout = createEmptyEquipmentLoadout();
  const target = addEquipmentByFillName(store, registry, 'ptdcz')!;
  addStackByFillName(store, registry, 'wpqhs1', 3);
  const session = createEquipmentStrengtheningSession('p1');
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, target), true);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, findEntry(store, 'wpqhs1')!), true);
  const success = submitEquipmentStrengthening({ session, store, loadout, soul: 1_000, random: () => 0 });
  assert.equal(success.outcome, 'success');
  assert.equal(success.soulAfter, 800);
  assert.equal(target.strengthLevel, 1);
  assert.equal(getEquipmentInstanceStats(target).power, 8);
  assert.equal(getStackQuantityByFillName(store, 'wpqhs1'), 2);

  target.strengthLevel = 3;
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, target), true);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, findEntry(store, 'wpqhs1')!), true);
  const failure = submitEquipmentStrengthening({ session, store, loadout, soul: 5_000, random: () => 0.99 });
  assert.equal(failure.outcome, 'failure');
  assert.equal(failure.levelAfter, 2);

  target.strengthLevel = 3;
  addStackByFillName(store, registry, 'wpbdf', 1);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, target), true);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, findEntry(store, 'wpqhs1')!), true);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, findEntry(store, 'wpbdf')!), true);
  const protectedFailure = submitEquipmentStrengthening({ session, store, loadout, soul: 5_000, random: () => 0.99 });
  assert.equal(protectedFailure.outcome, 'protected-failure');
  assert.equal(protectedFailure.levelAfter, 3);
  assert.equal(getStackQuantityByFillName(store, 'wpbdf'), 0);

  removeEquipmentInstance(store, target.instanceId);
  loadout.weapon = target;
  addStackByFillName(store, registry, 'wpqhs1', 1);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, target), true);
  assert.equal(loadout.weapon, null);
  assert.equal(stageEquipmentStrengtheningEntry(session, store, loadout, findEntry(store, 'wpqhs1')!), true);
  closeEquipmentStrengtheningSession(session, store, loadout);
  assert.equal(loadout.weapon, target);
  assert.equal(getStackQuantityByFillName(store, 'wpqhs1'), 1);
}

function testRejectedTransactionKeepsStaging(): void {
  const store = createInventoryStore(20, 'reject');
  const loadout = createEmptyEquipmentLoadout();
  const target = addEquipmentByFillName(store, registry, 'ptdcz')!;
  addStackByFillName(store, registry, 'wpqhs1', 1);
  const session = createEquipmentStrengtheningSession('p1');
  stageEquipmentStrengtheningEntry(session, store, loadout, target);
  stageEquipmentStrengtheningEntry(session, store, loadout, findEntry(store, 'wpqhs1')!);
  const result = submitEquipmentStrengthening({ session, store, loadout, soul: 199, random: () => 0 });
  assert.equal(result.ok, false);
  assert.equal(result.soulAfter, 199);
  assert.equal(session.target, target);
  assert.equal(session.stones.length, 1);
  assert.equal(target.strengthLevel, undefined);
}

function testFormalOwnerTransactionAndPersistence(): void {
  const storage = createStorage();
  const save = createDefaultGameSave();
  save.player1.skillLearning.soulCount = 1_000;
  save.player2.skillLearning.soulCount = 1_000;
  save.player1.inventory.categories.equipment.unshift({
    kind: 'equipment', fillName: 'ptdcz', instanceId: 'p1-strength-target', quantity: 1,
  });
  save.player1.inventory.categories.items.unshift({
    kind: 'stack', fillName: 'wpqhs1', stackId: 'p1-strength-stones', quantity: 2,
  });
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalWorkshopPage(storage, 'p1')!;
  const p2Before = JSON.stringify(model.sourceSave.player2.inventory);
  setFormalWorkshopInventoryPage(model, 999);
  assert.ok(model.inventoryPage > 0);
  setFormalWorkshopInventoryPage(model, 0);
  selectModelEntry(model, 'ptdcz');
  assert.equal(stageFormalWorkshopStrengthening(model), true);
  selectModelEntry(model, 'wpqhs1');
  assert.equal(stageFormalWorkshopStrengthening(model), true);
  assert.equal(runFormalWorkshopStrengthening(model, storage, () => 0), true);
  assert.equal(getFormalWorkshopPlayer(model).skillLearning.soulCount, 800);
  const persisted = loadActiveGame(storage)!;
  const strengthened = persisted.player1.inventory.categories.equipment.find((entry) => entry.instanceId === 'p1-strength-target');
  assert.equal(strengthened?.strengthLevel, 1);
  assert.equal(JSON.stringify(persisted.player2.inventory), p2Before);
}

function testV4EnhancementRoundTripAndInPlaceMigration(): void {
  const store = createInventoryStore(20, 'save');
  const target = addEquipmentByFillName(store, registry, 'ptdcz')!;
  target.strengthLevel = 4;
  target.baseStatsOverride = { power: 11, maxHp: 9 };
  const save = createGameSave({
    progression: createHeroProgression(1),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(),
    inventoryStore: store,
    equipmentLoadout: createEmptyEquipmentLoadout(),
    petRoster: createPlayerPetRosters().p1,
  });
  const restored = restoreGameState(parseGameSave(JSON.stringify(save))!, registry);
  const roundTripped = findEntry(restored.player1.inventoryStore, 'ptdcz') as EquipmentInstance;
  assert.equal(roundTripped.strengthLevel, 4);
  assert.deepEqual(roundTripped.baseStatsOverride, { maxHp: 9, power: 11 });
  assert.equal(getEquipmentInstanceStats(roundTripped).power, 23);

  const legacyV4 = JSON.parse(JSON.stringify(save));
  delete legacyV4.player1.inventory.categories.equipment[0].strengthLevel;
  delete legacyV4.player1.inventory.categories.equipment[0].baseStatsOverride;
  const migrated = restoreGameState(parseGameSave(JSON.stringify(legacyV4))!, registry);
  const safeDefault = findEntry(migrated.player1.inventoryStore, 'ptdcz') as EquipmentInstance;
  assert.equal(safeDefault.strengthLevel, undefined);
  assert.equal(safeDefault.baseStatsOverride, undefined);
  assert.equal(getEquipmentInstanceStats(safeDefault).power, 5);
}

function testTrueStrengthAsset(): void {
  assert.equal(craftingAssets.strengthPanel.sourceCharacterId, 198);
  assert.equal(craftingAssets.strengthPanel.sourceSymbol, 'export.strength.Strength');
  assert.ok(existsSync(path.join(process.cwd(), 'public', craftingAssets.strengthPanel.path)));
}

function equipmentInstance(definition: EquipmentDefinition): EquipmentInstance {
  return { kind: 'equipment', instanceId: `test-${definition.fillName}`, definition, quantity: 1 };
}

function selectModelEntry(model: NonNullable<ReturnType<typeof createFormalWorkshopPage>>, fillName: string): void {
  const index = getFormalWorkshopEntries(model).findIndex((entry) => entry.definition.fillName === fillName);
  assert.ok(index >= 0, `${fillName} should exist`);
  selectFormalWorkshopEntry(model, index);
}

testProbabilityMatrixAndAdmission();
testSuccessFailureProtectionAndReturn();
testRejectedTransactionKeepsStaging();
testFormalOwnerTransactionAndPersistence();
testV4EnhancementRoundTripAndInPlaceMigration();
testTrueStrengthAsset();
console.log('Equipment strengthening matrix, transactions, owner isolation, V4 migration, stats, and true asset tests passed.');
