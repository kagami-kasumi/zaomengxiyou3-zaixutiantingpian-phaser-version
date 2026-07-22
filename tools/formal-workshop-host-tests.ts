import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { craftingAssets } from '../src/assets/AssetManifest';
import {
  closeFormalWorkshopPage,
  createFormalWorkshopPage,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopFusion,
  selectFormalWorkshopEntry,
  setFormalWorkshopOwner,
  setFormalWorkshopTab,
  stageFormalWorkshopFusion,
} from '../src/systems/FormalWorkshopPageSystem';
import { getStackQuantityByFillName } from '../src/systems/InventorySystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const root = process.cwd();

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function createReadyModel() {
  const storage = createStorage();
  const save = createDefaultGameSave();
  save.player1.skillLearning.soulCount = 2_000;
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalWorkshopPage(storage, 'p1');
  assert.ok(model);
  return { storage, model };
}

function selectFillName(model: NonNullable<ReturnType<typeof createFormalWorkshopPage>>, fillName: string): void {
  const index = getFormalWorkshopEntries(model).findIndex((entry) => entry.definition.fillName === fillName);
  assert.ok(index >= 0, `${fillName} should exist`);
  selectFormalWorkshopEntry(model, index);
}

function testStageWithdrawTabCloseAndOwnerIsolation(): void {
  const { model } = createReadyModel();
  assert.equal(model.tab, 'strength');
  setFormalWorkshopTab(model, 'fusion');
  const p1Store = getFormalWorkshopPlayer(model).inventoryStore;
  const before = getStackQuantityByFillName(p1Store, 'tlzsp');
  selectFillName(model, 'tlzsp');
  assert.equal(stageFormalWorkshopFusion(model), true);
  assert.equal(getStackQuantityByFillName(p1Store, 'tlzsp'), before - 1);
  setFormalWorkshopTab(model, 'strength');
  assert.equal(getStackQuantityByFillName(p1Store, 'tlzsp'), before);
  assert.equal(model.fusionSessions.p1.slots.length, 0);

  setFormalWorkshopTab(model, 'fusion');
  selectFillName(model, 'tlzsp');
  assert.equal(stageFormalWorkshopFusion(model), true);
  setFormalWorkshopOwner(model, 'p2');
  assert.equal(model.tab, 'strength');
  assert.equal(getStackQuantityByFillName(p1Store, 'tlzsp'), before);
  assert.equal(model.fusionSessions.p1.slots.length, 0);
  assert.notEqual(getFormalWorkshopPlayer(model).inventoryStore, p1Store);
  closeFormalWorkshopPage(model);
}

function testExistingFusionPersistsThroughFormalHost(): void {
  const { storage, model } = createReadyModel();
  setFormalWorkshopTab(model, 'fusion');
  const productBefore = getStackQuantityByFillName(getFormalWorkshopPlayer(model).inventoryStore, 'wptlz');
  for (let index = 0; index < 3; index += 1) {
    selectFillName(model, 'tlzsp');
    assert.equal(stageFormalWorkshopFusion(model), true);
  }
  assert.equal(runFormalWorkshopFusion(model, storage), true);
  assert.equal(getStackQuantityByFillName(getFormalWorkshopPlayer(model).inventoryStore, 'tlzsp'), 0);
  assert.equal(getStackQuantityByFillName(getFormalWorkshopPlayer(model).inventoryStore, 'wptlz'), productBefore + 1);
  const persisted = loadActiveGame(storage);
  assert.ok(persisted);
  assert.equal(persisted.player1.skillLearning.soulCount, 1_000);
  assert.equal(persisted.player2.skillLearning.soulCount, 0);
}

function testTrueContainerFusionAndSceneWiring(): void {
  assert.equal(craftingAssets.container.sourceCharacterId, 119);
  assert.equal(craftingAssets.fusionPanel.sourceCharacterId, 169);
  assert.ok(existsSync(path.join(root, 'public', craftingAssets.container.path)));
  assert.ok(existsSync(path.join(root, 'public', craftingAssets.fusionPanel.path)));
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  assert.match(scene, /session\.page === 'workshop'/);
  assert.match(scene, /createFormalWorkshopPageView/);
  assert.match(scene, /closeFormalWorkshopPage/);
  const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalWorkshopPageView.ts'), 'utf8');
  assert.match(view, /strength.*fusion.*resolution.*making/);
  assert.match(view, /craftingAssets\.container/);
  assert.match(view, /craftingAssets\.fusionPanel/);
}

testStageWithdrawTabCloseAndOwnerIsolation();
testExistingFusionPersistsThroughFormalHost();
testTrueContainerFusionAndSceneWiring();
console.log('Formal workshop host, Fusion, owner isolation, return protocol, save, and true asset tests passed.');
