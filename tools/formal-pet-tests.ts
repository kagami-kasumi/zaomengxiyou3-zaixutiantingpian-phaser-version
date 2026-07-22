import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fullFeatureUiAssets } from '../src/assets/AssetManifest';
import { syncFormalPetRuntime } from '../src/scenes/feature-ui/FormalPetRuntimeBridge';
import {
  changeFormalPetPage,
  createFormalPetPage,
  deployFormalPet,
  getFormalPetPageCount,
  getFormalPetPagePets,
  getFormalPetPlayer,
  releaseFormalPet,
  restFormalPet,
  selectFormalPet,
  setFormalPetOwner,
  useFormalPetConsumable,
} from '../src/systems/FormalPetPageSystem';
import { getStackQuantityByFillName } from '../src/systems/InventorySystem';
import { buildPetSkillSlotViews } from '../src/systems/PetPanelSystem';
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
  const seed = save.player1.pets[0];
  assert.ok(seed);
  save.player1.pets = Array.from({ length: 10 }, (_, index) => ({
    ...structuredClone(seed),
    id: `formal-p1-pet-${index + 1}`,
    displayName: `P1 宠物 ${index + 1}`,
    isActive: index === 0,
    form: index === 5 ? 3 : seed.form,
    skills: index === 5 ? ['tsml', 'xj', 'lj'] : [...seed.skills],
  }));
  save.player1.selectedPetIndex = 0;
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalPetPage(storage, 'p1');
  assert.ok(model);
  return { storage, model };
}

function testFiveByTwoDeployRestReleaseAndReload(): void {
  const { storage, model } = createReadyModel();
  assert.equal(getFormalPetPageCount(model), 2);
  assert.equal(getFormalPetPagePets(model).length, 5);
  changeFormalPetPage(model, storage, 1);
  assert.equal(getFormalPetPlayer(model).petRoster.selectedIndex, 5);
  selectFormalPet(model, storage, 2);
  assert.equal(getFormalPetPlayer(model).petRoster.selectedIndex, 7);
  assert.equal(deployFormalPet(model, storage), true);
  const roster = getFormalPetPlayer(model).petRoster;
  assert.equal(roster.pets.filter((pet) => pet.isActive).length, 1);
  assert.equal(roster.pets[7].isActive, true);
  assert.equal(restFormalPet(model, storage), true);
  assert.equal(roster.pets.some((pet) => pet.isActive), false);

  const releaseId = roster.pets[7].id;
  assert.equal(releaseFormalPet(model, storage), false);
  assert.equal(roster.pets.some((pet) => pet.id === releaseId), true);
  assert.equal(releaseFormalPet(model, storage), true);
  assert.equal(roster.pets.some((pet) => pet.id === releaseId), false);
  assert.equal(roster.pets.length, 9);

  const reloaded = createFormalPetPage(storage, 'p1');
  assert.ok(reloaded);
  assert.equal(reloaded.restored.player1.petRoster.pets.length, 9);
  assert.equal(reloaded.restored.player1.petRoster.pets.some((pet) => pet.id === releaseId), false);
}

function testGrowthItemsEightSlotsAndOwnerIsolation(): void {
  const { storage, model } = createReadyModel();
  changeFormalPetPage(model, storage, 1);
  const selected = getFormalPetPlayer(model).petRoster.pets[5];
  assert.equal(buildPetSkillSlotViews(selected).length, 8);
  assert.equal(deployFormalPet(model, storage), true);

  const inventory = getFormalPetPlayer(model).inventoryStore;
  const growthBefore = getStackQuantityByFillName(inventory, 'cwzzxld');
  assert.equal(useFormalPetConsumable(model, storage, 'cwzzxld', () => 0.25), true);
  assert.equal(getStackQuantityByFillName(inventory, 'cwzzxld'), growthBefore - 1);
  const skillBefore = getStackQuantityByFillName(inventory, 'cwjnxld');
  assert.equal(useFormalPetConsumable(model, storage, 'cwjnxld', () => 0.2), true);
  assert.equal(getStackQuantityByFillName(inventory, 'cwjnxld'), skillBefore - 1);
  const formBefore = selected.form;
  assert.equal(useFormalPetConsumable(model, storage, 'nianjhd'), true);
  assert.equal(selected.form, formBefore + 1);

  const p1Count = model.restored.player1.petRoster.pets.length;
  setFormalPetOwner(model, 'p2');
  assert.equal(deployFormalPet(model, storage), true);
  assert.equal(model.restored.player1.petRoster.pets.length, p1Count);
  const persisted = loadActiveGame(storage);
  assert.ok(persisted);
  assert.equal(persisted.player1.pets.length, p1Count);
  assert.equal(persisted.player2.pets[0]?.isActive, true);
}

function testRuntimeSyncAndTrueAssetWiring(): void {
  const { model } = createReadyModel();
  const destroyed: string[] = [];
  const emitted: unknown[] = [];
  const fakeScene = {
    playerPetRosters: { p1: { pets: [], selectedIndex: 0, message: '' }, p2: { pets: [], selectedIndex: 0, message: '' } },
    petRoster: { pets: [], selectedIndex: 0, message: '' },
    petRuntime: { petId: 'old', runtimeKey: 'old', x: 0, y: 0, facingX: 1, state: 'idle' },
    destroyPetView: () => destroyed.push('p1'),
    events: { emit: (...args: unknown[]) => emitted.push(args) },
  };
  syncFormalPetRuntime(fakeScene as never, model);
  assert.equal(fakeScene.playerPetRosters.p1, getFormalPetPlayer(model).petRoster);
  assert.equal(fakeScene.petRoster, getFormalPetPlayer(model).petRoster);
  assert.equal(fakeScene.petRuntime, undefined);
  assert.deepEqual(destroyed, ['p1']);
  assert.equal(emitted.length, 1);

  const asset = fullFeatureUiAssets.petPage;
  assert.equal(asset.status, 'ready');
  assert.equal(asset.sourcePackage, 'assets/pet1.swf');
  assert.equal(asset.sourceCharacterId, 932);
  assert.ok(existsSync(path.join(root, 'public', asset.path)));
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  assert.match(scene, /createFormalPetPageView/);
  assert.match(scene, /syncFormalPetRuntime/);
  assert.match(scene, /session\.page === 'pets'/);
}

testFiveByTwoDeployRestReleaseAndReload();
testGrowthItemsEightSlotsAndOwnerIsolation();
testRuntimeSyncAndTrueAssetWiring();
console.log('Formal pet paging, actions, growth, owner, runtime, save, and true asset tests passed.');
