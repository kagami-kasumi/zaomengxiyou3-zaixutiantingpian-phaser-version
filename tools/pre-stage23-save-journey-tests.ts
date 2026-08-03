import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  craftFormalImmortality,
  createFormalImmortalityPage,
  eatFormalImmortality,
  openFormalImmortalityExchange,
  setFormalImmortalityOwner,
} from '../src/systems/FormalImmortalityPageSystem';
import {
  confirmFormalShopPurchase,
  createFormalShopPage,
  openFormalShopConfirmation,
  setFormalShopOwner,
  setFormalShopTypedQuantity,
} from '../src/systems/FormalShopPageSystem';
import {
  claimSelectedFormalTask,
  createFormalTaskPage,
  selectFormalTaskRow,
} from '../src/systems/FormalTaskPageSystem';
import {
  createFormalSkillPage,
  getFormalSkillPlayer,
  setFormalSkillOwner,
  upgradeFormalSkillTree,
} from '../src/systems/FormalSkillPageSystem';
import {
  activateGlobalSettingsForTests,
  cycleGlobalSetting,
  getGlobalSettings,
  GlobalSettingsStorageKey,
  loadGlobalSettings,
  type GlobalSettingsStorage,
} from '../src/systems/GlobalSettingsSystem';
import {
  closeFeatureUi,
  createFeatureUiHostModel,
  openFeatureUi,
} from '../src/systems/FeatureUiHostSystem';
import {
  routeStageFeatureEntry,
  StageFeatureEntries,
} from '../src/systems/StageFeatureEntryRouterSystem';
import { createHeavenMapSnapshot, findHeavenMapNode } from '../src/systems/HeavenMapSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import {
  ActiveSaveSlotStorageKey,
  createDefaultGameSave,
  createSaveSlot,
  getSaveSlotStorageKey,
  inspectSaveSlot,
  loadActiveGame,
  saveActiveLevelUnlockProgress,
  selectSaveSlot,
} from '../src/systems/SaveSlotSystem';
import { createStage11Flow } from '../src/systems/Stage11FlowSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';
import { createTestLevelCompletionAttempt } from './level-lifecycle-test-helpers';

class RestartableMemoryStorage implements SaveStorage, GlobalSettingsStorage {
  public readonly values: Map<string, string>;

  public constructor(seed?: ReadonlyMap<string, string>) {
    this.values = new Map(seed);
  }

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }

  public restart(): RestartableMemoryStorage {
    return new RestartableMemoryStorage(this.values);
  }
}

function collectObjectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (!value || typeof value !== 'object') return keys;
  if (Array.isArray(value)) {
    for (const entry of value) collectObjectKeys(entry, keys);
    return keys;
  }
  for (const [key, entry] of Object.entries(value)) {
    keys.add(key);
    collectObjectKeys(entry, keys);
  }
  return keys;
}

const journeyDate = new Date(2026, 7, 3, 10, 0, 0);
const storage = new RestartableMemoryStorage();
const party = createPartyConfiguration(2, 2, 5)!;
const save = createDefaultGameSave(journeyDate, party);
save.player1.level = 20;
save.player1.skillLearning.heroLevel = 20;
save.player1.soulCount = 1_000_000;
save.player2.level = 20;
save.player2.skillLearning.heroLevel = 20;
save.player2.soulCount = 1_000_000;
save.player1.inventory.categories.items.push({
  kind: 'stack', fillName: 'wpsmd1', stackId: 'journey-p1-wpsmd1', quantity: 1,
});
save.player2.inventory.categories.items.push(
  { kind: 'stack', fillName: 'wplh', stackId: 'journey-p2-wplh', quantity: 40 },
  { kind: 'stack', fillName: 'wpll', stackId: 'journey-p2-wpll', quantity: 40 },
);
assert.equal(createSaveSlot(storage, 0, save), true);

// 天庭地图四服务入口：丹药与商城分别执行双方事务，任务写共享进度，设置走独立全局 owner。
const immortality = createFormalImmortalityPage(storage)!;
assert.equal(setFormalImmortalityOwner(immortality, 'p1'), true);
assert.equal(eatFormalImmortality(immortality, storage, 0, 0), true);
assert.equal(setFormalImmortalityOwner(immortality, 'p2'), true);
openFormalImmortalityExchange(immortality, 1);
assert.equal(craftFormalImmortality(immortality, storage, 0, () => 0.5), true);

const shop = createFormalShopPage(storage)!;
assert.equal(setFormalShopTypedQuantity(shop, 'wpqhs1', 2), true);
assert.equal(openFormalShopConfirmation(shop, 'wpqhs1'), true);
assert.equal(confirmFormalShopPurchase(shop, storage), true);
assert.equal(setFormalShopOwner(shop, 'p2'), true);
assert.equal(setFormalShopTypedQuantity(shop, 'ptnmwsz', 1), true);
assert.equal(openFormalShopConfirmation(shop, 'ptnmwsz'), true);
assert.equal(confirmFormalShopPurchase(shop, storage), true);

const tasks = createFormalTaskPage(storage, journeyDate)!;
assert.equal(selectFormalTaskRow(tasks, 0), true);
tasks.tasks.daily[0]!.progress[0] = 20;
tasks.tasks.daily[0]!.isComplete = true;
assert.equal(claimSelectedFormalTask(tasks, storage, () => 0.9, journeyDate), true);

activateGlobalSettingsForTests();
cycleGlobalSetting('difficulty', storage);
cycleGlobalSetting('bgmEnabled', storage);
cycleGlobalSetting('skillSoundEnabled', storage);
cycleGlobalSetting('frameRate', storage);
assert.deepEqual(getGlobalSettings(), {
  difficulty: 1,
  bgmEnabled: false,
  skillSoundEnabled: false,
  frameRate: 24,
});

// 双方技能事务以及关卡内五入口都复用当前槽与同一页面 host。
const skills = createFormalSkillPage(storage, 'p1')!;
assert.equal(upgradeFormalSkillTree(skills, storage), true);
assert.equal(setFormalSkillOwner(skills, 'p2'), true);
assert.equal(upgradeFormalSkillTree(skills, storage), true);
assert.equal(getFormalSkillPlayer(skills).soulCount < 1_000_000, true);

for (const owner of ['p1', 'p2'] as const) {
  for (const entry of StageFeatureEntries) {
    const route = routeStageFeatureEntry(
      { entry, owner, source: 'pointer' },
      { playerCount: 2, ownerAlive: true, magicWeaponEquipped: true },
    );
    if (entry === 'settings') {
      assert.equal(route.status, 'settings-pending');
      assert.equal(route.owner, 'p1');
      continue;
    }
    assert.equal(route.status, 'open-page');
    if (route.status !== 'open-page') throw new Error(`${entry} should open`);
    const host = createFeatureUiHostModel();
    assert.equal(openFeatureUi(host, {
      page: route.page,
      owner: route.owner,
      originSceneKey: 'TestScene',
      originKind: 'combat',
      playerCount: 2,
    }).status, 'opened');
    assert.equal(closeFeatureUi(host)?.originSceneKey, 'TestScene');
  }
}

const beforeClear = loadActiveGame(storage)!;
const stage11 = createStage11Flow(2, beforeClear.levelUnlockProgress);
assert.equal(stage11.tryComplete(createTestLevelCompletionAttempt()), true);
assert.equal(saveActiveLevelUnlockProgress(storage, stage11.unlockProgress, journeyDate), true);

// 新 storage 实例模拟关闭应用后重开；V6、双方 owner、共享进度和全局设置均从持久值恢复。
const restarted = storage.restart();
assert.equal(selectSaveSlot(restarted, 0)?.version, 6);
const reloaded = loadActiveGame(restarted)!;
assert.deepEqual(reloaded.party, party);
assert.deepEqual(reloaded.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
assert.equal(findHeavenMapNode(createHeavenMapSnapshot(reloaded.levelUnlockProgress), '1-2')?.status, 'current');
assert.equal(reloaded.player1.immortalityFlags[0][0], 1);
assert.equal(reloaded.player2.inventory.categories.items.some((entry) => entry.fillName === 'wpmfd1'), true);
assert.equal(reloaded.player1.inventory.categories.items.find((entry) => entry.fillName === 'wpqhs1')?.quantity, 5);
assert.equal(reloaded.player2.inventory.categories.fashion.filter((entry) => entry.fillName === 'ptnmwsz').length, 2);
assert.equal(reloaded.player1.skillLearning.trees[0].treeLevel, 1);
assert.equal(reloaded.player2.skillLearning.trees[0].treeLevel, 1);
assert.equal(reloaded.partyTasks?.daily[0]?.hasClaimed, true);
activateGlobalSettingsForTests();
assert.deepEqual(loadGlobalSettings(restarted), {
  difficulty: 1,
  bgmEnabled: false,
  skillSoundEnabled: false,
  frameRate: 24,
});
assert.equal(JSON.parse(restarted.getItem(getSaveSlotStorageKey(0))!).version, 6);
assert.equal(JSON.parse(restarted.getItem(getSaveSlotStorageKey(0))!)[GlobalSettingsStorageKey], undefined);

const savedKeys = collectObjectKeys(reloaded);
for (const transientKey of ['animation', 'animationState', 'attackPhase', 'cooldown', 'cooldownRemaining']) {
  assert.equal(savedKeys.has(transientKey), false, `${transientKey} must remain runtime-only`);
}

// 损坏槽必须保持可见且不可覆盖/选中，不能伤及当前有效槽。
restarted.setItem(getSaveSlotStorageKey(4), '{broken-json');
assert.equal(inspectSaveSlot(restarted, 4).status, 'corrupt');
assert.equal(selectSaveSlot(restarted, 4), undefined);
assert.equal(createSaveSlot(restarted, 4), false);
assert.equal(restarted.getItem(getSaveSlotStorageKey(4)), '{broken-json');
assert.equal(restarted.getItem(ActiveSaveSlotStorageKey), '0');
assert.equal(inspectSaveSlot(restarted, 0).status, 'valid');

// 浏览器边界仍由正式地图四入口、共享关卡 Runtime 和六槽启动页持有。
const source = (relativePath: string): string =>
  readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const mapSource = source('src/scenes/HeavenMapScene.ts');
for (const owner of ['ImmortalityScene', 'ShopScene', 'FormalSettingsOverlay', 'TaskScene']) {
  assert.match(mapSource, new RegExp(owner));
}
assert.match(source('src/scenes/PlayableLevelRuntime.ts'), /installFormalFeatureUiEntries/);
assert.match(source('src/scenes/SaveSlotScene.ts'), /status === 'corrupt'/);

console.log('Pre-Stage-2-3 V6 restart, service, combat-entry, owner, and corruption journey tests passed.');
