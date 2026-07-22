import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { craftingAssets } from '../src/assets/AssetManifest';
import { createSeedCraftingItemDefinitions } from '../src/systems/CraftingSystem';
import {
  createEmptyEquipmentLoadout,
  createEmptyEquipmentStats,
  createSeedEquipmentRegistry,
  type EquipmentDefinition,
  type EquipmentInstance,
} from '../src/systems/EquipmentSystem';
import {
  EquipmentResolutionSoulCost,
  canResolveEquipment,
  closeEquipmentResolutionSession,
  createEquipmentResolutionSession,
  resolveEquipmentProducts,
  stageEquipmentResolutionTarget,
  submitEquipmentResolution,
} from '../src/systems/EquipmentResolutionSystem';
import {
  addEquipmentDefinition,
  createInventoryStore,
  getStackQuantityByFillName,
} from '../src/systems/InventorySystem';
import {
  createFormalWorkshopPage,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopResolution,
  selectFormalWorkshopEntry,
  setFormalWorkshopOwner,
  setFormalWorkshopTab,
  stageFormalWorkshopResolution,
} from '../src/systems/FormalWorkshopPageSystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const equipmentRegistry = createSeedEquipmentRegistry();
const registry = { ...equipmentRegistry, ...createSeedCraftingItemDefinitions(equipmentRegistry) };

function definition(fillName: string, quality: string, type: EquipmentDefinition['type'], user = '悟空'): EquipmentDefinition {
  return {
    showId: 1,
    name: fillName,
    fillName,
    type,
    user,
    quality,
    color: '0xFFFFFF',
    stats: createEmptyEquipmentStats(),
    description: '分解专项测试装备',
  };
}

function instance(fillName: string, quality: string, type: EquipmentDefinition['type'], user = '悟空'): EquipmentInstance {
  return { kind: 'equipment', instanceId: `resolution-${fillName}`, definition: definition(fillName, quality, type, user), quantity: 1 };
}

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

function testQualityTypeRoleAndGemMatrix(): void {
  assert.deepEqual(resolveEquipmentProducts(instance('normal', '普 通', 'zbwq'), () => 0), ['wptm']);
  assert.deepEqual(resolveEquipmentProducts(instance('excellent', '优秀', 'zbsp'), sequence(0, 0.5, 0)), ['wptm', 'wpxt']);
  assert.deepEqual(resolveEquipmentProducts(instance('fine', '精 良', 'zbfj', '唐僧'), sequence(0, 0, 0)), ['wpsc', 'wpsc', 'wpsc', 'sms1']);
  assert.deepEqual(resolveEquipmentProducts(instance('epic', '史诗', 'zbfj', '沙僧'), sequence(0, 0, 0)), ['wpsc', 'wpsc', 'wpsc', 'wpsc', 'sms1']);
  assert.deepEqual(resolveEquipmentProducts(instance('evil', '邪 灵', 'zbfj', '八戒'), sequence(0, 0, 0)), ['wpxt', 'wpxt', 'wpxt', 'wpxt', 'sms1']);

  assert.deepEqual(resolveEquipmentProducts(instance('legend-weapon', '传说', 'zbwq'), sequence(0, 0, 0, 0)), ['tss', 'tss', 'tss', 'wptm', 'sms1']);
  assert.deepEqual(resolveEquipmentProducts(instance('legend-armor', '传说', 'zbfj', '白龙'), sequence(0.9, 0, 0, 0)), ['yhs', 'yhs', 'yhs', 'wpxt', 'sms1']);
  assert.deepEqual(resolveEquipmentProducts(instance('legend-accessory', '传说', 'zbsp'), sequence(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)), ['sms1', 'sms1', 'sms1', 'sms1', 'sms1']);

  assert.deepEqual(resolveEquipmentProducts(instance('sq-weapon', '神 器', 'zbwq'), sequence(0.207, 0, 0, 0)), ['wpycjh', 'wpxty', 'wptm', 'sms1']);
  assert.deepEqual(resolveEquipmentProducts(instance('sq-armor', '神器', 'zbfj', '悟空'), sequence(0.203, 0.9, 0, 0)), ['wpycjh', 'wpzty', 'wpxt', 'sms1']);
  assert.deepEqual(resolveEquipmentProducts(instance('artifact-accessory', '神器', 'zbsp'), sequence(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)), ['sms1', 'sms1', 'sms1', 'sms1', 'sms1']);

  assert.deepEqual(resolveEquipmentProducts(instance('wk-armor', '普通', 'zbfj', '悟空'), () => 0), ['wpsc']);
  assert.deepEqual(resolveEquipmentProducts(instance('bl-armor', '普通', 'zbfj', '白龙'), () => 0.5), ['wpxt']);
  assert.deepEqual(resolveEquipmentProducts(instance('ts-armor', '普通', 'zbfj', '唐僧'), () => 0.99), ['wpsc']);
  assert.deepEqual(resolveEquipmentProducts(instance('ss-armor', '普通', 'zbfj', '沙僧'), () => 0.99), ['wpsc']);
  assert.deepEqual(resolveEquipmentProducts(instance('bj-armor', '普通', 'zbfj', '八戒'), () => 0), ['wpxt']);

  const fine = instance('gem-distribution', '精良', 'zbfj', '唐僧');
  assert.equal(resolveEquipmentProducts(fine, sequence(0, 0.2, 1)).at(-1), 'mfs1');
  assert.equal(resolveEquipmentProducts(fine, sequence(0, 0.6, 1)).at(-1), 'gjs1');
  assert.equal(resolveEquipmentProducts(fine, sequence(0, 0.99, 1)).at(-1), 'fys1');
}

function testAdmissionReturnAndAtomicRejection(): void {
  const store = createInventoryStore(20, 'resolution');
  const loadout = createEmptyEquipmentLoadout();
  const target = addEquipmentDefinition(store, definition('target', '普通', 'zbwq'))!;
  const session = createEquipmentResolutionSession('p1');
  assert.equal(canResolveEquipment(instance('magic', '普通', 'zbfb')), 'magic 不是可分解的武器、防具或饰品');
  assert.equal(stageEquipmentResolutionTarget(session, store, loadout, target), true);
  assert.equal(store.categories.equipment.includes(target), false);
  const lowSoul = submitEquipmentResolution({ session, store, registry, soul: 99, random: () => 0 });
  assert.equal(lowSoul.ok, false);
  assert.equal(lowSoul.soulAfter, 99);
  assert.equal(session.target, target);

  store.capacityPerCategory = 0;
  const full = submitEquipmentResolution({ session, store, registry, soul: 100, random: () => 0 });
  assert.equal(full.ok, false);
  assert.equal(full.soulAfter, 100);
  assert.equal(session.target, target);
  assert.equal(getStackQuantityByFillName(store, 'wptm'), 0);
  store.capacityPerCategory = 20;
  closeEquipmentResolutionSession(session, store, loadout);
  assert.equal(store.categories.equipment.includes(target), true);
}

function testAtomicCommitAndEquippedReturn(): void {
  const store = createInventoryStore(20, 'resolution-commit');
  const loadout = createEmptyEquipmentLoadout();
  const target = instance('sq-target', '神器', 'zbwq');
  loadout.weapon = target;
  const session = createEquipmentResolutionSession('p1');
  assert.equal(stageEquipmentResolutionTarget(session, store, loadout, target), true);
  assert.equal(loadout.weapon, null);
  closeEquipmentResolutionSession(session, store, loadout);
  assert.equal(loadout.weapon, target);

  assert.equal(stageEquipmentResolutionTarget(session, store, loadout, target), true);
  const result = submitEquipmentResolution({ session, store, registry, soul: 500, random: sequence(0, 0, 0, 0) });
  assert.equal(result.ok, true);
  assert.equal(result.soulAfter, 400);
  assert.deepEqual(result.productFillNames, ['wpycjh', 'wpxty', 'wptm', 'sms1']);
  assert.equal(loadout.weapon, null);
  assert.equal(getStackQuantityByFillName(store, 'wpycjh'), 1);
  assert.equal(getStackQuantityByFillName(store, 'wpxty'), 1);
  assert.equal(getStackQuantityByFillName(store, 'wptm'), 1);
  assert.equal(getStackQuantityByFillName(store, 'sms1'), 1);
}

function testFormalOwnerIsolationPersistenceAndTruePage(): void {
  const storage = createStorage();
  const save = createDefaultGameSave();
  save.player1.skillLearning.soulCount = 1_000;
  save.player2.skillLearning.soulCount = 1_000;
  save.player1.inventory.categories.equipment.unshift({
    kind: 'equipment', fillName: 'ptdcz', instanceId: 'p1-resolution-target', quantity: 1,
  });
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalWorkshopPage(storage, 'p1')!;
  const p2Before = JSON.stringify(model.sourceSave.player2);
  setFormalWorkshopTab(model, 'resolution');
  selectFillName(model, 'ptdcz');
  assert.equal(stageFormalWorkshopResolution(model), true);
  assert.equal(runFormalWorkshopResolution(model, storage, () => 0), true);
  assert.equal(getFormalWorkshopPlayer(model).skillLearning.soulCount, 900);
  assert.equal(getStackQuantityByFillName(getFormalWorkshopPlayer(model).inventoryStore, 'wptm'), 1);
  const persisted = loadActiveGame(storage)!;
  assert.equal(persisted.player1.inventory.categories.equipment.some((entry) => entry.instanceId === 'p1-resolution-target'), false);
  assert.equal(JSON.stringify(persisted.player2), p2Before);
  setFormalWorkshopOwner(model, 'p2');
  assert.equal(getStackQuantityByFillName(getFormalWorkshopPlayer(model).inventoryStore, 'wptm'), 0);

  assert.equal(EquipmentResolutionSoulCost, 100);
  assert.equal(craftingAssets.resolutionPanel.sourceCharacterId, 177);
  assert.equal(craftingAssets.resolutionPanel.sourceSymbol, 'export.strength.Resolution');
  assert.ok(existsSync(path.join(process.cwd(), 'public', craftingAssets.resolutionPanel.path)));
  const view = readFileSync(path.join(process.cwd(), 'src/scenes/feature-ui/FormalWorkshopPageView.ts'), 'utf8');
  assert.match(view, /craftingAssets\.resolutionPanel/);
  assert.match(view, /提交分解/);
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

testQualityTypeRoleAndGemMatrix();
testAdmissionReturnAndAtomicRejection();
testAtomicCommitAndEquippedReturn();
testFormalOwnerIsolationPersistenceAndTruePage();
console.log('Equipment resolution matrix, injected randomness, atomic transaction, owner isolation, save, and true page tests passed.');
