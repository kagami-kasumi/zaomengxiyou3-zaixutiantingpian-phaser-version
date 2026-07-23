import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { craftingAssets } from '../src/assets/AssetManifest';
import {
  closeFormalWorkshopPage,
  createFormalWorkshopPage,
  formatFormalWorkshopTab,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopFusion,
  selectFormalWorkshopEntry,
  setFormalWorkshopOwner,
  setFormalWorkshopTab,
  stageFormalWorkshopFusion,
} from '../src/systems/FormalWorkshopPageSystem';
import {
  FormalWorkshopCommitHitAreas,
  FormalWorkshopNativeTabLayout,
  FormalWorkshopOperationCenter,
  FormalWorkshopPageHitAreas,
  FormalWorkshopReturnHitArea,
  FormalWorkshopStageHitAreas,
} from '../src/systems/FormalWorkshopNativeTabLayout';
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
  assert.equal(craftingAssets.container.path, '/assets/ui/crafting/container.png');
  assert.equal(craftingAssets.fusionPanel.sourceCharacterId, 169);
  assert.ok(existsSync(path.join(root, 'public', craftingAssets.container.path)));
  assert.ok(existsSync(path.join(root, 'public', craftingAssets.fusionPanel.path)));
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  assert.match(scene, /session\.page === 'workshop'/);
  assert.match(scene, /createFormalWorkshopPageView/);
  assert.match(scene, /closeFormalWorkshopPage/);
  const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalWorkshopPageView.ts'), 'utf8');
  assert.match(view, /FormalWorkshopNativeTabLayout/);
  assert.match(view, /originalHitZone/);
  assert.match(view, /FormalWorkshopReturnHitArea/);
  assert.match(view, /ownerLabel\(scene, 303, 86, 'P1工坊'/);
  assert.match(view, /ownerLabel\(scene, 424, 86, 'P2工坊'/);
  assert.match(view, /fontSize: '26px'/);
  assert.match(view, /craftingAssets\.container/);
  assert.match(view, /craftingAssets\.fusionPanel/);
  assert.doesNotMatch(view, /NativeTabTextures/);
  assert.doesNotMatch(view, /nativeTabButton/);
  assert.doesNotMatch(view, /关闭返回/);
  assert.doesNotMatch(view, /scene\.add\.rectangle/);
  assert.doesNotMatch(view, /rectangle\(470, 295, 940, 590/);
  assert.doesNotMatch(view, /装备工坊 ·/);
  assert.doesNotMatch(view, /348 \+ index \* 128/);
}

function testOriginalArtworkHitGeometryAndLabels(): void {
  assert.deepEqual(FormalWorkshopNativeTabLayout.map(({ tab, label, sourceCharacterId }) => ({ tab, label, sourceCharacterId })), [
    { tab: 'strength', label: '强化', sourceCharacterId: 95 },
    { tab: 'fusion', label: '合成', sourceCharacterId: 99 },
    { tab: 'resolution', label: '分解', sourceCharacterId: 109 },
    { tab: 'making', label: '打造', sourceCharacterId: 113 },
  ]);
  assert.deepEqual(FormalWorkshopNativeTabLayout.map(({ tab }) => formatFormalWorkshopTab(tab)), ['强化', '合成', '分解', '打造']);
  assert.deepEqual(FormalWorkshopOperationCenter, { x: 316, y: 310 });

  FormalWorkshopNativeTabLayout.forEach((layout, index) => {
    assert.ok(layout.x >= 0 && layout.y >= 0);
    assert.ok(layout.x + layout.width <= 940);
    assert.ok(layout.y + layout.height <= 590);
    if (index > 0) {
      const previous = FormalWorkshopNativeTabLayout[index - 1];
      assert.ok(previous && previous.x + previous.width < layout.x, `${layout.label} hit area must not overlap its predecessor`);
    }
  });
  for (const area of [
    FormalWorkshopReturnHitArea,
    ...Object.values(FormalWorkshopPageHitAreas),
    ...Object.values(FormalWorkshopCommitHitAreas),
    ...Object.values(FormalWorkshopStageHitAreas).flat(),
  ]) {
    assert.ok(area.x >= 0 && area.y >= 0);
    assert.ok(area.x + area.width <= 940);
    assert.ok(area.y + area.height <= 590);
  }
  assert.ok(FormalWorkshopReturnHitArea.x >= 840 && FormalWorkshopReturnHitArea.y < 20);
  assert.equal(existsSync(path.join(root, 'public/assets/ui/crafting/container-native-background.png')), false);
  assert.equal(existsSync(path.join(root, 'public/assets/ui/crafting/native-tabs')), false);

  const container = readFileSync(path.join(root, 'public', craftingAssets.container.path));
  assert.equal(container.readUInt32BE(16), 940);
  assert.equal(container.readUInt32BE(20), 594);
}

testStageWithdrawTabCloseAndOwnerIsolation();
testExistingFusionPersistsThroughFormalHost();
testTrueContainerFusionAndSceneWiring();
testOriginalArtworkHitGeometryAndLabels();
console.log('Formal workshop original artwork hit areas, centered operations, owner styling, host, transactions, and save tests passed.');
