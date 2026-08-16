import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fullFeatureUiAssets, magicWeaponNativeUiAssets } from '../src/assets/AssetManifest';
import {
  assertVerifiedMagicWeaponPageTruth,
  getMagicWeaponTruthBounds,
  getMagicWeaponTruthStateIds,
  MagicWeaponPageTruthId,
} from '../src/scenes/feature-ui/FormalMagicWeaponPageTruth';
import { createSeedEquipmentRegistry, type EquipmentInstance } from '../src/systems/EquipmentSystem';
import {
  MagicWeaponResetElement,
  cancelFormalMagicWeaponAction,
  confirmFormalMagicWeaponAction,
  createFormalMagicWeaponPage,
  getFormalMagicWeaponPanelState,
  getFormalMagicWeaponPlayer,
  getMagicWeaponUpgradeRequirement,
  requestFormalMagicWeaponElementReset,
  requestFormalMagicWeaponUpgrade,
} from '../src/systems/FormalMagicWeaponPageSystem';
import { getStackQuantityByFillName } from '../src/systems/InventorySystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
  type SaveSlotId,
} from '../src/systems/SaveSlotSystem';
import type { GameSave, SaveStorage } from '../src/systems/SaveSystem';

const root = process.cwd();
const registry = createSeedEquipmentRegistry();

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function createReadyPage(configure?: (save: GameSave) => void) {
  const storage = createStorage();
  const save = createDefaultGameSave(new Date('2026-07-22T00:00:00.000Z'));
  configure?.(save);
  assert.equal(createSaveSlot(storage, 0 as SaveSlotId, save), true);
  const model = createFormalMagicWeaponPage(storage);
  assert.ok(model);
  return { storage, model };
}

function setEquippedMagicWeapon(
  save: GameSave,
  fillName: string,
  level: number,
  element = '木',
): void {
  save.player1.equipment.magicWeapon = {
    fillName,
    instanceId: `p1-${fillName}`,
    magicWeapon: { level, element, growthRate: registry[fillName]?.magicWeapon?.growthRate ?? 1 },
  };
}

function setStackQuantity(save: GameSave, fillName: string, quantity: number): void {
  for (const category of Object.values(save.player1.inventory.categories)) {
    const stack = category.find((entry) => entry.kind === 'stack' && entry.fillName === fillName);
    if (stack) {
      stack.quantity = quantity;
      return;
    }
  }
  save.player1.inventory.categories.items.push({
    kind: 'stack', fillName, stackId: `stack-${fillName}`, quantity,
  });
}

function instanceAt(fillName: string, level: number): EquipmentInstance {
  const definition = registry[fillName];
  assert.ok(definition?.magicWeapon);
  return {
    kind: 'equipment', instanceId: `requirement-${fillName}`, quantity: 1,
    definition: { ...definition, magicWeapon: { ...definition.magicWeapon, level } },
  };
}

function testEquipmentGateAndP1OnlyContract(): void {
  const { model } = createReadyPage((save) => { save.player1.equipment.magicWeapon = null; });
  const panel = getFormalMagicWeaponPanelState(model);
  assert.equal(model.owner, 'p1');
  assert.equal(panel.equipped, false);
  assert.equal(requestFormalMagicWeaponElementReset(model), 'rejected');
  assert.match(model.message, /未装备法宝/);
}

function testSoulUpgradeAndCurrentRoundTrip(): void {
  const { storage, model } = createReadyPage((save) => {
    setEquippedMagicWeapon(save, 'kyl', 1);
    save.player1.soulCount = 1_500;
    save.player2.soulCount = 777;
  });
  assert.equal(requestFormalMagicWeaponUpgrade(model, storage), 'upgraded');
  const panel = getFormalMagicWeaponPanelState(model);
  assert.equal(panel.level, 2);
  assert.equal(panel.soul, 500);
  assert.equal(panel.stats.power, 4);

  const persisted = loadActiveGame(storage);
  assert.ok(persisted);
  assert.equal(persisted.player1.equipment.magicWeapon?.magicWeapon?.level, 2);
  assert.equal(persisted.player1.equipment.magicWeapon?.baseStatsOverride?.power, 4);
  assert.equal(persisted.player2.soulCount, 777);
  const reloaded = createFormalMagicWeaponPage(storage);
  assert.ok(reloaded);
  assert.equal(getFormalMagicWeaponPanelState(reloaded).level, 2);
  assert.equal(getFormalMagicWeaponPanelState(reloaded).stats.power, 4);
}

function testInsufficientSoulRejectsWithoutMutation(): void {
  const { storage, model } = createReadyPage((save) => {
    setEquippedMagicWeapon(save, 'kyl', 1);
    save.player1.soulCount = 999;
  });
  assert.equal(requestFormalMagicWeaponUpgrade(model, storage), 'rejected');
  assert.equal(getFormalMagicWeaponPanelState(model).level, 1);
  assert.equal(getFormalMagicWeaponPanelState(model).soul, 999);
  assert.equal(loadActiveGame(storage)?.player1.soulCount, 999);
}

function testAuthoritativeSpecialUpgradeBranches(): void {
  const zs5 = getMagicWeaponUpgradeRequirement(instanceAt('zsTimer', 5));
  assert.deepEqual(zs5.cost, { kind: 'material', fillName: 'zsTimerup2', name: '烛时星魄2', quantity: 2 });
  const god5 = getMagicWeaponUpgradeRequirement(instanceAt('mdhf', 5));
  assert.deepEqual(god5.cost, { kind: 'material', fillName: 'kly5', name: '5级昆仑玉', quantity: 2 });
  const bagua1 = getMagicWeaponUpgradeRequirement(instanceAt('tjbg', 1));
  assert.equal(bagua1.cost?.quantity, 2);
  assert.equal(getMagicWeaponUpgradeRequirement(instanceAt('tjbg', 9)).available, false);
  const qpj3 = getMagicWeaponUpgradeRequirement(instanceAt('fbqpj', 3));
  assert.deepEqual(qpj3.cost, { kind: 'material', fillName: 'qpjy', name: '青萍精元', quantity: 1 });
  assert.equal(getMagicWeaponUpgradeRequirement(instanceAt('fbqpj', 9)).available, false);
  const regular10 = getMagicWeaponUpgradeRequirement(instanceAt('kyl', 10));
  assert.deepEqual(regular10.cost, { kind: 'material', fillName: 'wplvdyl', name: '龙女的眼泪', quantity: 3 });
  assert.equal(getMagicWeaponUpgradeRequirement(instanceAt('stlp', 10)).available, false);
}

function testMaterialConfirmCancelAndAtomicCommit(): void {
  const { storage, model } = createReadyPage((save) => {
    setEquippedMagicWeapon(save, 'zsTimer', 1);
    setStackQuantity(save, 'zsTimerup1', 1);
  });
  const player = getFormalMagicWeaponPlayer(model);
  assert.equal(requestFormalMagicWeaponUpgrade(model, storage), 'pending');
  assert.equal(cancelFormalMagicWeaponAction(model), 'cancelled');
  assert.equal(getStackQuantityByFillName(player.inventoryStore, 'zsTimerup1'), 1);
  assert.equal(getFormalMagicWeaponPanelState(model).level, 1);

  assert.equal(requestFormalMagicWeaponUpgrade(model, storage), 'pending');
  assert.equal(confirmFormalMagicWeaponAction(model, storage), 'upgraded');
  assert.equal(getStackQuantityByFillName(player.inventoryStore, 'zsTimerup1'), 0);
  assert.equal(getFormalMagicWeaponPanelState(model).level, 2);
}

function testElementResetKeepsLevelRebuildsStatsAndPersists(): void {
  const { storage, model } = createReadyPage((save) => {
    setEquippedMagicWeapon(save, 'kyl', 2, '木');
    save.player1.equipment.magicWeapon!.baseStatsOverride = { maxHp: 20, maxMp: 20, power: 4, defense: 2 };
    setStackQuantity(save, 'wpccfq', 3);
  });
  const player = getFormalMagicWeaponPlayer(model);
  assert.equal(requestFormalMagicWeaponElementReset(model), 'pending');
  assert.equal(confirmFormalMagicWeaponAction(model, storage), 'reset');
  const panel = getFormalMagicWeaponPanelState(model);
  assert.equal(panel.level, 2);
  assert.equal(panel.element, MagicWeaponResetElement);
  assert.equal(panel.stats.power, 8);
  assert.equal(getStackQuantityByFillName(player.inventoryStore, 'wpccfq'), 0);

  const reloaded = createFormalMagicWeaponPage(storage);
  assert.ok(reloaded);
  const reloadedPanel = getFormalMagicWeaponPanelState(reloaded);
  assert.equal(reloadedPanel.level, 2);
  assert.equal(reloadedPanel.element, MagicWeaponResetElement);
  assert.equal(reloadedPanel.stats.power, 8);
}

function testTrueAssetAndSceneWiring(): void {
  assertVerifiedMagicWeaponPageTruth();
  assert.equal(MagicWeaponPageTruthId, 'task-settings-175b.magic-weapon-page');
  assert.equal(getMagicWeaponTruthStateIds().length, 21);
  assert.deepEqual(getMagicWeaponTruthBounds('magic-weapon-page-root.btn_sj'), {
    left: 395.95, top: 403.75, width: 67, height: 34,
  });
  assert.equal(fullFeatureUiAssets.magicWeaponPage.sourceCharacterId, 596);
  assert.ok(existsSync(path.join(root, 'public', fullFeatureUiAssets.magicWeaponPage.path)));
  for (const overlay of Object.values(magicWeaponNativeUiAssets.overlays)) {
    assert.ok(existsSync(path.join(root, 'public', overlay.path)));
  }
  for (const states of Object.values(magicWeaponNativeUiAssets.buttons)) {
    for (const asset of Object.values(states)) {
      assert.ok(existsSync(path.join(root, 'public', asset.path)));
    }
  }
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  assert.match(scene, /session\.page === 'magic-weapon'/);
  assert.match(scene, /createFormalMagicWeaponPageView/);
  assert.match(scene, /syncFormalMagicWeaponRuntime/);
  const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalMagicWeaponPageView.ts'), 'utf8');
  assert.match(view, /fullFeatureUiAssets\.magicWeaponPage/);
  assert.match(view, /assertVerifiedMagicWeaponPageTruth/);
  assert.match(view, /getMagicWeaponTruthBounds/);
  assert.match(view, /magicWeaponNativeUiAssets/);
  assert.match(view, /result === 'rejected'\) return/);
  assert.doesNotMatch(view, /scene\.add\.rectangle/);
  assert.doesNotMatch(view, /fontFamily:\s*'Arial'/);
  assert.doesNotMatch(view, /P1 法宝强化与五行重置|原版仅有 P1 N|关闭并重算返回/);
}

testEquipmentGateAndP1OnlyContract();
testSoulUpgradeAndCurrentRoundTrip();
testInsufficientSoulRejectsWithoutMutation();
testAuthoritativeSpecialUpgradeBranches();
testMaterialConfirmCancelAndAtomicCommit();
testElementResetKeepsLevelRebuildsStatsAndPersists();
testTrueAssetAndSceneWiring();
console.log('Formal magic-weapon gate, upgrade branches, reset, P1 owner, current round-trip, true asset, and scene tests passed.');
