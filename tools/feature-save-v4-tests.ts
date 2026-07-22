import assert from 'node:assert/strict';
import { createEmptyEquipmentLoadout, createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { createHeroSkillModel } from '../src/systems/HeroSkillSystem';
import { addEquipmentByFillName, addStackByFillName, createInventoryStore } from '../src/systems/InventorySystem';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { createHeroProgression } from '../src/systems/ProgressionSystem';
import { createGameSave, GameSaveVersion, parseGameSave, restoreGameState } from '../src/systems/SaveSystem';
import { createSkillLearningState } from '../src/systems/SkillUISystem';

const registry = createSeedEquipmentRegistry();

function testV4RoundTripKeepsBothFeatureOwners(): void {
  const rosters = createPlayerPetRosters();
  const p1Inventory = createInventoryStore(125, 'p1-eq');
  const p2Inventory = createInventoryStore(125, 'p2-eq');
  addStackByFillName(p1Inventory, registry, 'sms1', 7);
  const p2Equipment = addEquipmentByFillName(p2Inventory, registry, 'ptdcz');
  assert.ok(p2Equipment);

  const p1Loadout = createEmptyEquipmentLoadout();
  const p2Loadout = createEmptyEquipmentLoadout();
  p2Loadout.weapon = p2Equipment;
  p2Inventory.categories.equipment = p2Inventory.categories.equipment.filter(
    (entry) => entry !== p2Equipment,
  );

  const p1Skills = createHeroSkillModel().loadout;
  const p2Skills = createHeroSkillModel().loadout;
  p1Skills.slots[0] = { skillName: 'slz', level: 2 };
  p2Skills.slots[0] = { skillName: 'sgq', level: 4 };
  const p1Learning = createSkillLearningState(8, 123);
  const p2Learning = createSkillLearningState(12, 456);
  p2Learning.trees[0].treeLevel = 1;
  p2Learning.trees[0].learnedSkills.push({ skillName: 'sgq', level: 4 });
  rosters.p1.pets[0].level = 3;
  rosters.p2.pets[0].level = 9;

  const save = createGameSave({
    progression: createHeroProgression(1, 8, 20),
    skillLoadout: p1Skills,
    skillLearning: p1Learning,
    inventoryStore: p1Inventory,
    equipmentLoadout: p1Loadout,
    petRoster: rosters.p1,
    player2Progression: createHeroProgression(2, 12, 30),
    player2SkillLoadout: p2Skills,
    player2SkillLearning: p2Learning,
    player2InventoryStore: p2Inventory,
    player2EquipmentLoadout: p2Loadout,
    player2PetRoster: rosters.p2,
  });
  const restored = restoreGameState(parseGameSave(JSON.stringify(save))!, registry);

  assert.equal(save.version, GameSaveVersion);
  assert.equal(restored.player1.progression.level, 8);
  assert.equal(restored.player2.progression.heroId, 2);
  assert.equal(restored.player2.progression.level, 12);
  assert.deepEqual(restored.player2.skillLoadout.slots[0], { skillName: 'sgq', level: 4 });
  assert.equal(restored.player2.skillLearning.soulCount, 456);
  assert.equal(restored.player1.inventoryStore.categories.items[0]?.quantity, 7);
  assert.equal(restored.player2.equipmentLoadout.weapon?.definition.fillName, 'ptdcz');
  assert.equal(restored.player1.petRoster.pets[0].level, 3);
  assert.equal(restored.player2.petRoster.pets[0].level, 9);
  assert.notStrictEqual(restored.player1, restored.player2);
}

function testV1V2V3MigrationUsesSafeFeatureDefaults(): void {
  const current = createGameSave({
    progression: createHeroProgression(3, 17, 42),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(17, 99),
    equipmentLoadout: createEmptyEquipmentLoadout(),
    petRoster: createPlayerPetRosters().p1,
    player2PetRoster: createPlayerPetRosters().p2,
  });
  for (const version of [1, 2, 3] as const) {
    const legacy: any = {
      version,
      savedAt: current.savedAt,
      player1: { ...current.player1 },
      player2: { pets: current.player2.pets, selectedPetIndex: current.player2.selectedPetIndex },
      levelUnlockProgress: { unlockedStage: 1, unlockedLevel: 3 },
    };
    delete legacy.player1.inventory;
    if (version === 1) delete legacy.player2;
    if (version < 3) delete legacy.levelUnlockProgress;
    const migrated = parseGameSave(JSON.stringify(legacy));
    assert.ok(migrated);
    assert.equal(migrated.version, GameSaveVersion);
    const restored = restoreGameState(migrated, registry);
    assert.equal(restored.player1.progression.heroId, 3);
    assert.equal(restored.player1.progression.level, 17);
    assert.equal(restored.player1.inventoryStore.categories.items.length, 0);
    assert.equal(restored.player2.progression.level, 1);
    assert.equal(restored.player2.skillLearning.soulCount, 0);
    assert.equal(restored.player2.inventoryStore.categories.equipment.length, 0);
    assert.equal(restored.player2.equipmentLoadout.weapon, null);
    assert.equal(restored.levelUnlockProgress.unlockedLevel, version === 3 ? 3 : 1);
  }
}

function testUnknownInventoryDefinitionsAreDropped(): void {
  const save = createGameSave({
    progression: createHeroProgression(1),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(),
    equipmentLoadout: createEmptyEquipmentLoadout(),
    petRoster: createPlayerPetRosters().p1,
  });
  save.player1.inventory.categories.items.push({
    kind: 'stack', fillName: 'unknown-definition', stackId: 'bad', quantity: 10,
  });
  (save.player2 as any).inventory = { damaged: true };
  const restored = restoreGameState(parseGameSave(JSON.stringify(save))!, registry);
  assert.equal(restored.player1.inventoryStore.categories.items.length, 0);
  assert.equal(restored.player2.inventoryStore.categories.items.length, 0);
}

testV4RoundTripKeepsBothFeatureOwners();
testV1V2V3MigrationUsesSafeFeatureDefaults();
testUnknownInventoryDefinitionsAreDropped();
console.log('V4 dual-player feature save and migration tests passed.');
