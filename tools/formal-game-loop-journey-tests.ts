import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  closeFeatureUi,
  createFeatureUiHostModel,
  FeatureUiPages,
  openFeatureUi,
} from '../src/systems/FeatureUiHostSystem';
import {
  createHeavenMapSnapshot,
  findHeavenMapNode,
} from '../src/systems/HeavenMapSystem';
import {
  createDefaultGameSave,
  createPartySaveSlot,
  createSaveSlot,
  loadActiveGame,
  saveActiveGame,
  saveActiveLevelUnlockProgress,
  selectSaveSlot,
} from '../src/systems/SaveSlotSystem';
import {
  createFormalPartyRetryData,
  resolveFormalPartyRuntime,
} from '../src/systems/FormalPartyRuntimeSystem';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import {
  createFormalSkillPage,
  getFormalSkillPlayer,
  setFormalSkillOwner,
  upgradeFormalSkillTree,
} from '../src/systems/FormalSkillPageSystem';
import {
  createFormalWorkshopPage,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopResolution,
  selectFormalWorkshopEntry,
  setFormalWorkshopTab,
  stageFormalWorkshopResolution,
} from '../src/systems/FormalWorkshopPageSystem';
import {
  createFormalMagicWeaponPage,
  getFormalMagicWeaponPanelState,
  requestFormalMagicWeaponUpgrade,
} from '../src/systems/FormalMagicWeaponPageSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { restoreGameState, type SaveStorage } from '../src/systems/SaveSystem';
import { createStage11Flow } from '../src/systems/Stage11FlowSystem';
import { createTestLevelCompletionAttempt } from './level-lifecycle-test-helpers';

const repoRoot = process.cwd();

function createMemoryStorage(): SaveStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function assertEveryFeaturePageForBothOwners(playerCount: 1 | 2): void {
  const host = createFeatureUiHostModel();
  const owners = playerCount === 2 ? ['p1', 'p2'] as const : ['p1'] as const;
  for (const owner of owners) {
    for (const page of FeatureUiPages) {
      const result = openFeatureUi(host, {
        page,
        owner,
        originSceneKey: 'HeavenMapScene',
        originKind: 'map',
        playerCount,
      });
      assert.equal(result.status, 'opened', `${owner} should open ${page}`);
      assert.equal(host.active?.owner, owner);
      assert.equal(host.active?.page, page);
      assert.equal(closeFeatureUi(host)?.originSceneKey, 'HeavenMapScene');
      assert.equal(host.active, undefined);
    }
  }
}

{
  const storage = createMemoryStorage();

  // 启动 → 新建并读取一个独立槽位。
  assert.equal(createPartySaveSlot(storage, 0, 2, 2, 5), true);
  const initialSave = loadActiveGame(storage);
  assert.ok(initialSave);

  // 地图 → 当前 1-1 可进入；完整功能 UI 对 P1/P2 均可用且关闭后返回地图。
  const initialMap = createHeavenMapSnapshot(initialSave.levelUnlockProgress);
  assert.equal(findHeavenMapNode(initialMap, '1-1')?.status, 'current');
  assert.equal(findHeavenMapNode(initialMap, '1-1')?.routeKey, 'TestScene');
  const formalParty = resolveFormalPartyRuntime(storage, undefined, false);
  assert.equal(formalParty?.playerCount, 2);
  assert.deepEqual(formalParty?.members, [
    { slot: 'p1', heroId: 2 },
    { slot: 'p2', heroId: 5 },
  ]);
  assert.equal(createFormalPartyRetryData(formalParty), undefined);
  assertEveryFeaturePageForBothOwners(formalParty!.playerCount);

  // 在同一正式槽位写入双方独立功能数据，随后进入并结算 Stage 1-1。
  const featureSave = structuredClone(initialSave);
  featureSave.player1.soulCount = 111;
  featureSave.player2.soulCount = 222;
  assert.equal(saveActiveGame(storage, featureSave), true);

  const stage11 = createStage11Flow(2, featureSave.levelUnlockProgress);
  assert.equal(stage11.tryComplete(createTestLevelCompletionAttempt()), true);
  assert.deepEqual(stage11.unlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  assert.equal(
    saveActiveLevelUnlockProgress(
      storage,
      stage11.unlockProgress,
      new Date('2026-07-23T08:00:00.000Z'),
    ),
    true,
  );

  // 结算 → 解锁 → 返回地图。
  const returnedMap = createHeavenMapSnapshot(loadActiveGame(storage)!.levelUnlockProgress);
  assert.equal(findHeavenMapNode(returnedMap, '1-1')?.status, 'completed');
  assert.equal(findHeavenMapNode(returnedMap, '1-2')?.status, 'current');
  assert.equal(findHeavenMapNode(returnedMap, '1-2')?.canActivate, true);

  // 再次读档（模拟启动页重新选槽）仍保留解锁和双方功能数据。
  const reloadedSave = selectSaveSlot(storage, 0);
  assert.ok(reloadedSave);
  const restored = restoreGameState(reloadedSave, createSeedEquipmentRegistry());
  assert.deepEqual(restored.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  assert.equal(restored.player1.soulCount, 111);
  assert.equal(restored.player2.soulCount, 222);
  assert.notStrictEqual(restored.player1, restored.player2);
}

{
  const storage = createMemoryStorage();
  const party = createPartyConfiguration(2, 1, 2);
  assert.ok(party);
  const save = createDefaultGameSave(new Date('2026-07-24T09:00:00.000Z'), party);
  save.player1.level = 20;
  save.player1.skillLearning.heroLevel = 20;
  save.player1.soulCount = 4_000;
  save.player2.level = 20;
  save.player2.skillLearning.heroLevel = 20;
  save.player2.soulCount = 2_000;
  const registry = createSeedEquipmentRegistry();
  assert.ok(registry.kyl?.magicWeapon);
  save.player1.equipment.magicWeapon = {
    fillName: 'kyl',
    instanceId: 'journey-p1-kyl',
    magicWeapon: { ...registry.kyl.magicWeapon, level: 1 },
  };
  save.player1.inventory.categories.equipment.unshift({
    kind: 'equipment',
    fillName: 'ptdcz',
    instanceId: 'journey-p1-resolution-target',
    quantity: 1,
  });
  assert.equal(createSaveSlot(storage, 0, save), true);

  const skillPage = createFormalSkillPage(storage, 'p1');
  assert.ok(skillPage);
  assert.equal(upgradeFormalSkillTree(skillPage, storage), true);
  assert.equal(getFormalSkillPlayer(skillPage).soulCount, 3_900);

  const workshopPage = createFormalWorkshopPage(storage, 'p1');
  assert.ok(workshopPage);
  setFormalWorkshopTab(workshopPage, 'resolution');
  const targetIndex = getFormalWorkshopEntries(workshopPage)
    .findIndex((entry) => entry.definition.fillName === 'ptdcz');
  assert.ok(targetIndex >= 0);
  selectFormalWorkshopEntry(workshopPage, targetIndex);
  assert.equal(stageFormalWorkshopResolution(workshopPage), true);
  assert.equal(runFormalWorkshopResolution(workshopPage, storage, () => 0), true);
  assert.equal(getFormalWorkshopPlayer(workshopPage).soulCount, 3_800);

  const magicWeaponPage = createFormalMagicWeaponPage(storage);
  assert.ok(magicWeaponPage);
  assert.equal(requestFormalMagicWeaponUpgrade(magicWeaponPage, storage), 'upgraded');
  assert.equal(getFormalMagicWeaponPanelState(magicWeaponPage).soul, 2_800);

  const p2SkillPage = createFormalSkillPage(storage, 'p1');
  assert.ok(p2SkillPage);
  assert.equal(setFormalSkillOwner(p2SkillPage, 'p2'), true);
  assert.equal(upgradeFormalSkillTree(p2SkillPage, storage), true);
  assert.equal(getFormalSkillPlayer(p2SkillPage).soulCount, 1_900);

  const reloaded = selectSaveSlot(storage, 0);
  assert.ok(reloaded);
  assert.equal(reloaded.player1.soulCount, 2_800);
  assert.equal(reloaded.player2.soulCount, 1_900);
  assert.equal(reloaded.player1.skillLearning.trees[0].treeLevel, 1);
  assert.equal(reloaded.player2.skillLearning.trees[0].treeLevel, 1);
  assert.equal(reloaded.player1.equipment.magicWeapon?.magicWeapon?.level, 2);
}

{
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 0, 1, 4), true);
  const runtime = resolveFormalPartyRuntime(storage, undefined, false);
  assert.deepEqual(runtime?.members, [{ slot: 'p1', heroId: 4 }]);
  assertEveryFeaturePageForBothOwners(1);
  const host = createFeatureUiHostModel();
  assert.equal(openFeatureUi(host, {
    page: 'skills',
    owner: 'p2',
    originSceneKey: 'HeavenMapScene',
    originKind: 'map',
    playerCount: runtime!.playerCount,
  }).status, 'invalid-owner');
}

// 场景接线是同一旅程的浏览器边界：启动、地图、结算返回、再次读档都必须存在。
const source = (relativePath: string): string =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8');
assert.match(source('src/scenes/BootScene.ts'), /scene\.start\('SaveSlotScene'\)/);
assert.match(source('src/scenes/SaveSlotScene.ts'), /startSceneWithBundle\(this, 'HeavenMapScene'/);
assert.match(source('src/scenes/HeavenMapScene.ts'), /startSceneWithBundle\(this, node\.routeKey/);
assert.doesNotMatch(source('src/scenes/HeavenMapScene.ts'), /openPlayerCountChooser|node\.routeKey, \{ playerCount \}/);
assert.match(source('src/scenes/test-scene/TestSceneStage11RuntimeAdapter.ts'), /saveSceneNow\(\)/);
assert.match(
  source('src/scenes/PlayableLevelRuntime.ts'),
  /startSceneWithBundle\(scene, definition\.routes\.back\)/,
);

console.log('Formal game-loop end-to-end journey tests passed.');
