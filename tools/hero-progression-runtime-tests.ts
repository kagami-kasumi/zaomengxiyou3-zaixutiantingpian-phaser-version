import assert from 'node:assert/strict';
import heroProgressionCatalog from '../docs/reverse-engineering/reference/hero-progression-catalog-1.1.json';
import { persistStage1RewardProgression } from '../src/scenes/stage1/Stage1RewardBridge';
import {
  createEmptyEquipmentLoadout,
  createSeedEquipmentRegistry,
  type EquipmentInstance,
} from '../src/systems/EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from '../src/systems/InventoryResourceCatalog';
import {
  addHeroExperience,
  createHeroProgression,
  getHeroBaseStats,
  getHeroExperienceToNextLevel,
} from '../src/systems/ProgressionSystem';
import {
  createStage1CombatPlayer,
  awardStage1CombatPlayerExperience,
} from '../src/systems/Stage1CombatSystem';
import {
  createPartySaveSlot,
  loadActiveGame,
  saveActiveGame,
} from '../src/systems/SaveSlotSystem';
import {
  GameSaveVersion,
  parseGameSave,
  restoreGameState,
  type SaveStorage,
} from '../src/systems/SaveSystem';

function createMemoryStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

for (const role of heroProgressionCatalog.roles) {
  for (const expected of role.levels) {
    const actual = getHeroBaseStats(role.heroId as 1 | 2 | 3 | 4 | 5, expected.level);
    assert.deepEqual(actual, {
      maxHp: expected.maxHp,
      maxMp: expected.maxMp,
      power: expected.power,
      defense: expected.defense,
    }, `R${role.heroId} Lv.${expected.level} stats must come from the verified catalog`);
    assert.equal(getHeroExperienceToNextLevel(expected.level), expected.expToNext);
  }
}

for (const vector of heroProgressionCatalog.transitionTests) {
  const progression = createHeroProgression(1, vector.start.level, vector.start.currentExp);
  addHeroExperience(progression, vector.addedExperience);
  assert.deepEqual(
    { level: progression.level, currentExp: progression.currentExp },
    vector.expected,
    vector.id,
  );
}

for (let level = 1; level <= 90; level += 1) {
  assert.equal(Number.isInteger(getHeroBaseStats(5, level).defense), true);
}
assert.equal(getHeroBaseStats(5, 2).defense, 3);
assert.equal(getHeroBaseStats(5, 90).defense, 135);

{
  const registry = createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry());
  const loadout = createEmptyEquipmentLoadout();
  const weapon: EquipmentInstance = {
    kind: 'equipment',
    instanceId: 'p1-growth-weapon',
    definition: registry.whg!,
    quantity: 1,
    baseStatsOverride: { maxHp: 17, maxMp: 19, power: 23, defense: 29 },
  };
  loadout.weapon = weapon;
  const p1 = createStage1CombatPlayer('p1', 1, {
    progression: createHeroProgression(1, 1, 130),
    equipmentLoadout: loadout,
  });
  const p2 = createStage1CombatPlayer('p2', 5, {
    progression: createHeroProgression(5, 1, 0),
  });
  p1.combat.hp = 1;
  p1.mp = 1;
  awardStage1CombatPlayerExperience(p1, 5);
  assert.equal(p1.progression.level, 2);
  assert.equal(p1.effectiveStats.maxHp, getHeroBaseStats(1, 2).maxHp + 17);
  assert.equal(p1.effectiveStats.maxMp, getHeroBaseStats(1, 2).maxMp + 19);
  assert.equal(p1.effectiveStats.power, getHeroBaseStats(1, 2).power + 23);
  assert.equal(p1.effectiveStats.defense, getHeroBaseStats(1, 2).defense + 29);
  assert.equal(p1.combat.hp, p1.effectiveStats.maxHp);
  assert.equal(p1.mp, p1.effectiveStats.maxMp);
  assert.deepEqual(
    { level: p2.progression.level, exp: p2.progression.currentExp, hp: p2.combat.hp },
    { level: 1, exp: 0, hp: getHeroBaseStats(5, 1).maxHp },
  );
}

{
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 0, 2, 1, 5), true);
  const save = loadActiveGame(storage)!;
  assert.equal(saveActiveGame(storage, {
    ...save,
    player1: { ...save.player1, level: 12, currentExp: 874 },
    player2: { ...save.player2, level: 89, currentExp: 999_999_998 },
  }), true);
  const p1 = createStage1CombatPlayer('p1', 1, {
    progression: createHeroProgression(1, 12, 874),
  });
  const p2 = createStage1CombatPlayer('p2', 5, {
    progression: createHeroProgression(5, 89, 999_999_998),
  });
  awardStage1CombatPlayerExperience(p1, 1);
  awardStage1CombatPlayerExperience(p2, 1);
  persistStage1RewardProgression(storage, p1);
  persistStage1RewardProgression(storage, p2);
  const roundTripped = loadActiveGame(storage)!;
  assert.deepEqual(
    [roundTripped.player1.level, roundTripped.player1.currentExp],
    [13, 0],
  );
  assert.deepEqual(
    [roundTripped.player2.level, roundTripped.player2.currentExp],
    [90, 0],
  );
  const restored = restoreGameState(
    roundTripped,
    createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry()),
  );
  assert.deepEqual(
    [restored.player1.progression.level, restored.player2.progression.level],
    [13, 90],
  );
  assert.equal(parseGameSave(JSON.stringify({ ...roundTripped, version: GameSaveVersion - 1 })), undefined);
  assert.equal(parseGameSave(JSON.stringify({
    ...roundTripped,
    player2: { ...roundTripped.player2, currentExp: 'broken' },
  })), undefined);
}

console.log('hero-progression-runtime-tests: ok');
