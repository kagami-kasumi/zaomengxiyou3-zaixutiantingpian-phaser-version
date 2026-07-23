import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { craftingAssets } from '../src/assets/AssetManifest';
import {
  DeadEquipmentMakingBookFillName,
  EquipmentMakingRecipes,
  EquipmentMakingRecipeRegistry,
  createEquipmentMakingDefinitionRegistry,
} from '../src/systems/EquipmentMakingRegistry';
import {
  closeEquipmentMakingSession,
  createEquipmentMakingStatsOverride,
  createEquipmentMakingSession,
  rollEquipmentMakingGemBonus,
  stageEquipmentMakingEntry,
  submitEquipmentMaking,
} from '../src/systems/EquipmentMakingSystem';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import {
  addStackByFillName,
  createInventoryStore,
  getStackQuantityByFillName,
} from '../src/systems/InventorySystem';
import {
  createFormalWorkshopPage,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopMaking,
  selectFormalWorkshopEntry,
  setFormalWorkshopOwner,
  setFormalWorkshopTab,
  stageFormalWorkshopMaking,
} from '../src/systems/FormalWorkshopPageSystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const registry = createEquipmentMakingDefinitionRegistry(createSeedEquipmentRegistry());

function testRegistryCoverageAndDeadBranch(): void {
  assert.equal(EquipmentMakingRecipes.length, 78);
  assert.equal(Object.keys(EquipmentMakingRecipeRegistry).length, 78);
  assert.equal(EquipmentMakingRecipeRegistry[DeadEquipmentMakingBookFillName], undefined);
  assert.equal(registry[DeadEquipmentMakingBookFillName], undefined);
  for (const recipe of EquipmentMakingRecipes) {
    assert.ok(registry[recipe.bookFillName], `missing book definition ${recipe.bookFillName}`);
    assert.ok(registry[recipe.productFillName], `missing product definition ${recipe.productFillName}`);
    for (const material of recipe.requiredMaterials) {
      assert.ok(registry[material.fillName], `missing material definition ${material.fillName}`);
    }
  }
}

function testGemBoundaries(): void {
  assert.equal(rollEquipmentMakingGemBonus('sms1', () => 0), 20);
  assert.equal(rollEquipmentMakingGemBonus('sms1', () => 0.999), 35);
  assert.equal(rollEquipmentMakingGemBonus('mfs3', () => 0), 195);
  assert.equal(rollEquipmentMakingGemBonus('gjs3', () => 0.999), 40);
  assert.equal(rollEquipmentMakingGemBonus('fys3', () => 0.999), 90);
  assert.equal(rollEquipmentMakingGemBonus('wptlz', () => 0), 0.01);
  assert.ok(rollEquipmentMakingGemBonus('wptlz', () => 0.999) < 0.02);
  assert.equal(rollEquipmentMakingGemBonus('wphlz', () => 0.999), 9);
  assert.equal(rollEquipmentMakingGemBonus('wpflz', () => 0.999), 0.01);
  assert.equal(rollEquipmentMakingGemBonus('wpslz', () => 0), 4);
  const values = [0.5];
  const override = createEquipmentMakingStatsOverride(registry.whg, ['wpflz', 'sms1'], () => values.shift() ?? 0);
  assert.equal(override.missPercent, registry.whg.stats.missPercent + 0.01);
  assert.equal(override.maxHp, registry.whg.stats.maxHp + 28);
}

function testAtomicTransactionAndReturn(): void {
  const store = createInventoryStore(20, 'making');
  addStackByFillName(store, registry, 'whgzzs', 1);
  addStackByFillName(store, registry, 'wptm', 20);
  addStackByFillName(store, registry, 'sms1', 2);
  addStackByFillName(store, registry, 'gjs1', 1);
  addStackByFillName(store, registry, 'fys1', 1);
  const session = createEquipmentMakingSession('p1');
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'whgzzs')), true);
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'sms1')), true);
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'gjs1')), true);
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'fys1')), true);
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'sms1')), false);

  const lowSoul = submitEquipmentMaking({ session, store, registry, soul: 199, random: () => 0 });
  assert.equal(lowSoul.ok, false);
  assert.equal(lowSoul.soulAfter, 199);
  assert.equal(getStackQuantityByFillName(store, 'wptm'), 20);
  assert.equal(session.book?.definition.fillName, 'whgzzs');
  assert.equal(session.gems.length, 3);

  const result = submitEquipmentMaking({ session, store, registry, soul: 200, random: () => 0 });
  assert.equal(result.ok, true);
  assert.equal(result.soulAfter, 0);
  assert.equal(getStackQuantityByFillName(store, 'wptm'), 0);
  assert.equal(result.product?.definition.fillName, 'whg');
  assert.equal(result.product?.baseStatsOverride?.maxHp, registry.whg.stats.maxHp + 20);
  assert.equal(result.product?.baseStatsOverride?.power, registry.whg.stats.power + 9);
  assert.equal(result.product?.baseStatsOverride?.defense, registry.whg.stats.defense + 14);
  assert.equal(session.book, undefined);
  assert.equal(session.gems.length, 0);

  addStackByFillName(store, registry, 'whgzzs', 1);
  addStackByFillName(store, registry, 'sms1', 1);
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'whgzzs')), true);
  assert.equal(stageEquipmentMakingEntry(session, store, findStack(store, 'sms1')), true);
  closeEquipmentMakingSession(session, store);
  assert.equal(getStackQuantityByFillName(store, 'whgzzs'), 1);
  assert.equal(getStackQuantityByFillName(store, 'sms1'), 2);
}

function testFormalOwnersPersistenceAndTruePage(): void {
  const storage = createStorage();
  const save = createDefaultGameSave();
  save.player1.skillLearning.soulCount = 1_000;
  save.player2.skillLearning.soulCount = 1_000;
  save.player1.inventory.categories.items.unshift(
    { kind: 'stack', fillName: 'whgzzs', stackId: 'p1-whg-book', quantity: 1 },
    { kind: 'stack', fillName: 'wptm', stackId: 'p1-making-timber', quantity: 20 },
  );
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalWorkshopPage(storage, 'p1')!;
  const p2Before = JSON.stringify(model.sourceSave.player2);
  setFormalWorkshopTab(model, 'making');
  selectFillName(model, 'whgzzs');
  assert.equal(stageFormalWorkshopMaking(model), true);
  selectFillName(model, 'sms1');
  assert.equal(stageFormalWorkshopMaking(model), true);
  assert.equal(runFormalWorkshopMaking(model, storage, () => 0), true);
  assert.equal(getFormalWorkshopPlayer(model).skillLearning.soulCount, 800);
  assert.equal(JSON.stringify(loadActiveGame(storage)!.player2), p2Before);

  const reloaded = createFormalWorkshopPage(storage, 'p1')!;
  const product = getFormalWorkshopEntries(reloaded).find(
    (entry) => entry.kind === 'equipment' && entry.definition.fillName === 'whg',
  );
  assert.ok(product?.kind === 'equipment');
  assert.equal(product.baseStatsOverride?.maxHp, registry.whg.stats.maxHp + 20);
  setFormalWorkshopOwner(reloaded, 'p2');
  assert.equal(getFormalWorkshopEntries(reloaded).some((entry) => entry.definition.fillName === 'whg'), false);

  assert.equal(craftingAssets.makingPanel.sourceCharacterId, 152);
  assert.equal(craftingAssets.makingPanel.sourceSymbol, 'export.strength.Making');
  assert.ok(existsSync(path.join(process.cwd(), 'public', craftingAssets.makingPanel.path)));
  const view = readFileSync(path.join(process.cwd(), 'src/scenes/feature-ui/FormalWorkshopPageView.ts'), 'utf8');
  assert.match(view, /craftingAssets\.makingPanel/);
  assert.match(view, /FormalWorkshopCommitHitAreas\.making/);
  assert.match(view, /workshop-commit-making/);
}

function findStack(store: ReturnType<typeof createInventoryStore>, fillName: string) {
  return Object.values(store.categories).flat().find(
    (entry) => entry.kind === 'stack' && entry.definition.fillName === fillName,
  );
}

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function selectFillName(model: NonNullable<ReturnType<typeof createFormalWorkshopPage>>, fillName: string): void {
  const index = getFormalWorkshopEntries(model).findIndex((entry) => entry.definition.fillName === fillName);
  assert.ok(index >= 0, `${fillName} should exist`);
  selectFormalWorkshopEntry(model, index);
}

testRegistryCoverageAndDeadBranch();
testGemBoundaries();
testAtomicTransactionAndReturn();
testFormalOwnersPersistenceAndTruePage();
console.log('Equipment making registry, dead branch, gem ranges, atomic transaction, dual owner, V4, and true page tests passed.');
