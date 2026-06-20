import assert from 'node:assert/strict';
import { createSeedEquipmentRegistry } from '../../src/systems/EquipmentSystem';
import {
  consumeStackByFillName,
  getInventoryEntries,
  createSeedInventoryStore,
} from '../../src/systems/InventorySystem';
import {
  evolvePetWithItem,
  rerollPetGrowthAttribute,
} from '../../src/systems/PetGrowthSystem';
import {
  buildPetPanelLines,
  createPetRuntime,
  createSeedPetRoster,
  getCurrentPet,
  syncPetRuntimeWithRoster,
  usePetConsumable,
} from '../../src/systems/PetSystem';
import type { PetRoster, PetState } from '../../src/systems/PetTypes';

export function runPetGrowthSystemTests(): void {
  testGrowthConsumablesAreRegisteredAndSeeded();
  testGrowthConsumableInventoryGateConsumesOnlySuccessfulRoute();
  testGrowthAttributeRerollPreservesOriginalIndependentRollOrder();
  testGrowthAttributeConsumableChangesOnlyThreeAttributes();
  testReturnToChildRestoresOriginalMouseChildValuesAndKeepsPersistentFields();
  testEvolutionItemChangesFormAddsUltimateAndRebuildsRuntime();
  testEvolutionReweightsOriginalPassiveStats();
  testEvolutionItemPreservesOriginalFullSlotAndWrongFormBoundaries();
  testUnsupportedPotentialItemAndMissingActivePetDoNotConsume();
}

function testGrowthConsumableInventoryGateConsumesOnlySuccessfulRoute(): void {
  const registry = createSeedEquipmentRegistry();
  const inventory = createSeedInventoryStore(registry);
  const roster = createSeedPetRoster();
  const reroll = usePetConsumable(roster, 'cwzzxld', sequenceRandom(0, 0, 0));
  assert.equal(reroll.shouldConsume, true);
  assert.equal(consumeStackByFillName(inventory, 'cwzzxld', 1).ok, true);
  assert.equal(stackQuantity(inventory, 'cwzzxld'), 0);

  for (const pet of roster.pets) pet.isActive = false;
  const rejected = usePetConsumable(roster, 'nianjhd');
  assert.equal(rejected.shouldConsume, false);
  assert.equal(stackQuantity(inventory, 'nianjhd'), 1);
}

function testGrowthConsumablesAreRegisteredAndSeeded(): void {
  const registry = createSeedEquipmentRegistry();
  const inventory = createSeedInventoryStore(registry);
  for (const fillName of ['cwzzxld', 'wphtd', 'nianqld', 'nianjhd']) {
    assert.ok(Object.values(registry).some((definition) => definition.fillName === fillName));
    const stack = getInventoryEntries(inventory, 'items').find((entry) =>
      entry.kind === 'stack' && entry.definition.fillName === fillName
    );
    assert.equal(stack?.kind, 'stack');
    if (stack?.kind === 'stack') assert.equal(stack.quantity, 1);
  }
}

function testGrowthAttributeRerollPreservesOriginalIndependentRollOrder(): void {
  assert.equal(rerollPetGrowthAttribute(5, 1, sequenceRandom(0.6)), 4);
  assert.equal(rerollPetGrowthAttribute(5, 1, sequenceRandom(0.61, 0.35)), 6);
  assert.equal(rerollPetGrowthAttribute(6, 1, sequenceRandom(0.61, 0.36, 0.2)), 8);
  assert.equal(rerollPetGrowthAttribute(8, 1, sequenceRandom(0.61, 0, 0, 1)), 8);
  assert.equal(rerollPetGrowthAttribute(4, 1, sequenceRandom(0.5)), 3);
  assert.equal(rerollPetGrowthAttribute(4, 2, sequenceRandom(0.5)), 2);
}

function testGrowthAttributeConsumableChangesOnlyThreeAttributes(): void {
  const roster = createSeedPetRoster();
  const pet = requiredCurrentPet(roster);
  pet.perception = 5;
  pet.technique = 7;
  pet.warpower = 4;
  pet.hpQuality = 101;
  pet.mpQuality = 102;
  pet.atkQuality = 103;
  pet.defQuality = 104;
  pet.hp = 222;
  pet.skills = ['tsml', 'xj'];

  const before = persistentGrowthBoundary(pet);
  const result = usePetConsumable(
    roster,
    'cwzzxld',
    sequenceRandom(0.7, 0.3, 0.7, 0.4, 0.1, 0, 0.75),
  );
  assert.equal(result.ok, true);
  assert.equal(result.shouldConsume, true);
  assert.deepEqual(
    { perception: pet.perception, technique: pet.technique, warpower: pet.warpower },
    { perception: 6, technique: 3, warpower: 4 },
  );
  assert.deepEqual(persistentGrowthBoundary(pet), before);
}

function testReturnToChildRestoresOriginalMouseChildValuesAndKeepsPersistentFields(): void {
  const roster = createSeedPetRoster();
  const pet = activatePet(roster, 'pet-mouse-4');
  pet.level = 63;
  pet.exp = 4567;
  pet.quality = 2;
  pet.lifetime = 37;
  pet.hp = 12;
  pet.maxHp = 9999;
  pet.mp = 13;
  pet.maxMp = 999;
  pet.atk = 777;
  pet.def = 333;
  pet.critBonusRate = 0.5;
  pet.skillDamageBonus = 88;
  const skills = [...pet.skills];

  const result = usePetConsumable(roster, 'wphtd', sequenceRandom(0, 0, 0, 0, 0, 0, 0));
  assert.equal(result.ok, true);
  assert.equal(result.shouldConsume, true);
  assert.equal(result.rebuildRuntime, true);
  assert.equal(pet.level, 1);
  assert.equal(pet.form, 1);
  assert.equal(pet.displayName, '子鼠元帅');
  assert.equal(pet.exp, 0);
  assert.equal(pet.expToNext, 50);
  assert.equal(pet.quality, 1);
  assert.deepEqual(
    [pet.hpQuality, pet.mpQuality, pet.atkQuality, pet.defQuality],
    [910, 325, 1300, 260],
  );
  assert.deepEqual([pet.hp, pet.maxHp, pet.mp, pet.maxMp, pet.atk, pet.def], [840, 840, 800, 800, 50, 10]);
  assert.deepEqual([pet.perception, pet.technique, pet.warpower], [4, 4, 4]);
  assert.equal(pet.lifetime, 37);
  assert.equal(pet.isActive, true);
  assert.deepEqual(pet.skills, skills);
  assert.equal(pet.critBonusRate, 0);
  assert.equal(pet.skillDamageBonus, 0);
  assert.ok(buildPetPanelLines(roster).some((line) => line === '资质 HP 910  MP 325  ATK 1300  DEF 260'));
}

function testEvolutionItemChangesFormAddsUltimateAndRebuildsRuntime(): void {
  const roster = createSeedPetRoster();
  const pet = activatePet(roster, 'pet-monkey-3');
  const owner = { x: 10, y: 20, facingX: 1 as const };
  const runtimeBefore = createPetRuntime(pet, owner);
  const level = pet.level;
  const attack = pet.atk;
  const qualities = [pet.hpQuality, pet.mpQuality, pet.atkQuality, pet.defQuality];
  pet.critBonusRate = 0.25;
  pet.skillDamageBonus = 50;

  const result = usePetConsumable(roster, 'nianjhd');
  assert.equal(result.ok, true);
  assert.equal(result.shouldConsume, true);
  assert.equal(result.rebuildRuntime, true);
  assert.equal(pet.form, 4);
  assert.equal(pet.displayName, '烈焰金刚');
  assert.equal(pet.skills.at(-1), 'jgaoyi');
  assert.equal(pet.level, level);
  assert.equal(pet.atk, attack + 6 * pet.warpower);
  assert.deepEqual([pet.hpQuality, pet.mpQuality, pet.atkQuality, pet.defQuality], qualities);
  assert.equal(pet.critBonusRate, 0);
  assert.equal(pet.skillDamageBonus, 0);
  const runtimeAfter = syncPetRuntimeWithRoster(roster, runtimeBefore, owner);
  assert.notEqual(runtimeAfter, runtimeBefore);
  assert.match(runtimeAfter?.runtimeKey ?? '', /:monkey:4$/);
}

function testEvolutionReweightsOriginalPassiveStats(): void {
  const pet = createStandalonePet(3);
  pet.skills = ['tsml', 'zrsh', 'smzf', 'mfby'];
  pet.warpower = 2;
  pet.technique = 3;
  pet.atk = 100;
  pet.def = 100;
  pet.hp = 1000;
  pet.maxHp = 1000;
  pet.mp = 500;
  pet.maxMp = 500;

  const result = evolvePetWithItem(pet);
  assert.equal(result.formChanged, true);
  assert.deepEqual([pet.atk, pet.def], [112, 112]);
  assert.deepEqual([pet.hp, pet.maxHp], [1100, 1100]);
  assert.deepEqual([pet.mp, pet.maxMp], [650, 650]);
  assert.equal(pet.skills.at(-1), 'jgaoyi');
}

function testEvolutionItemPreservesOriginalFullSlotAndWrongFormBoundaries(): void {
  const full = createStandalonePet(3);
  full.skills = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fullResult = evolvePetWithItem(full);
  assert.equal(fullResult.shouldConsume, true);
  assert.equal(fullResult.formChanged, true);
  assert.equal(fullResult.ultimateAdded, false);
  assert.equal(full.form, 4);
  assert.equal(full.skills.length, 8);

  const child = createStandalonePet(1);
  const childResult = evolvePetWithItem(child);
  assert.equal(childResult.shouldConsume, true);
  assert.equal(childResult.formChanged, false);
  assert.equal(child.form, 1);

  const adult = createStandalonePet(4);
  const adultResult = evolvePetWithItem(adult);
  assert.equal(adultResult.shouldConsume, false);
  assert.equal(adultResult.formChanged, false);
}

function testUnsupportedPotentialItemAndMissingActivePetDoNotConsume(): void {
  const roster = createSeedPetRoster();
  const potential = usePetConsumable(roster, 'nianqld');
  assert.equal(potential.ok, false);
  assert.equal(potential.shouldConsume, false);
  assert.match(potential.message, /缺少潜力字段/);

  for (const pet of roster.pets) pet.isActive = false;
  for (const fillName of ['cwzzxld', 'wphtd', 'nianqld', 'nianjhd'] as const) {
    const result = usePetConsumable(roster, fillName);
    assert.equal(result.ok, false);
    assert.equal(result.shouldConsume, false);
  }
}

function sequenceRandom(...values: number[]): () => number {
  let index = 0;
  return () => {
    assert.ok(index < values.length, 'random source exhausted');
    return values[index++];
  };
}

function stackQuantity(
  inventory: ReturnType<typeof createSeedInventoryStore>,
  fillName: string,
): number {
  const stack = getInventoryEntries(inventory, 'items').find((entry) =>
    entry.kind === 'stack' && entry.definition.fillName === fillName
  );
  return stack?.kind === 'stack' ? stack.quantity : 0;
}

function requiredCurrentPet(roster: PetRoster): PetState {
  const pet = getCurrentPet(roster);
  assert.ok(pet);
  return pet;
}

function activatePet(roster: PetRoster, id: string): PetState {
  const selectedIndex = roster.pets.findIndex((pet) => pet.id === id);
  const selected = roster.pets[selectedIndex];
  assert.ok(selected);
  roster.selectedIndex = selectedIndex;
  for (const pet of roster.pets) pet.isActive = pet.id === id;
  return selected;
}

function persistentGrowthBoundary(pet: PetState): object {
  return {
    level: pet.level,
    exp: pet.exp,
    form: pet.form,
    hp: pet.hp,
    hpQuality: pet.hpQuality,
    mpQuality: pet.mpQuality,
    atkQuality: pet.atkQuality,
    defQuality: pet.defQuality,
    lifetime: pet.lifetime,
    quality: pet.quality,
    skills: [...pet.skills],
    isActive: pet.isActive,
  };
}

function createStandalonePet(form: number): PetState {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find((candidate) => candidate.id === 'pet-monkey-3');
  assert.ok(pet);
  pet.form = form;
  return pet;
}
