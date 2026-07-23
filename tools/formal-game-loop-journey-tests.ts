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
  createSaveSlot,
  loadActiveGame,
  saveActiveGame,
  saveActiveLevelUnlockProgress,
  selectSaveSlot,
} from '../src/systems/SaveSlotSystem';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { restoreGameState, type SaveStorage } from '../src/systems/SaveSystem';
import {
  completeStage11,
  createStage11Flow,
} from '../src/systems/Stage11FlowSystem';

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

function assertEveryFeaturePageForBothOwners(): void {
  const host = createFeatureUiHostModel();
  for (const owner of ['p1', 'p2'] as const) {
    for (const page of FeatureUiPages) {
      const result = openFeatureUi(host, {
        page,
        owner,
        originSceneKey: 'HeavenMapScene',
        originKind: 'map',
        playerCount: 2,
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
  assert.equal(createSaveSlot(storage, 0), true);
  const initialSave = loadActiveGame(storage);
  assert.ok(initialSave);

  // 地图 → 当前 1-1 可进入；完整功能 UI 对 P1/P2 均可用且关闭后返回地图。
  const initialMap = createHeavenMapSnapshot(initialSave.levelUnlockProgress);
  assert.equal(findHeavenMapNode(initialMap, '1-1')?.status, 'current');
  assert.equal(findHeavenMapNode(initialMap, '1-1')?.routeKey, 'TestScene');
  assertEveryFeaturePageForBothOwners();

  // 在同一正式槽位写入双方独立功能数据，随后进入并结算 Stage 1-1。
  const featureSave = structuredClone(initialSave);
  featureSave.player1.skillLearning.soulCount = 111;
  featureSave.player2.skillLearning.soulCount = 222;
  assert.equal(saveActiveGame(storage, featureSave), true);

  const stage11 = createStage11Flow(2, featureSave.levelUnlockProgress);
  assert.equal(completeStage11(stage11), true);
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
  assert.equal(restored.player1.skillLearning.soulCount, 111);
  assert.equal(restored.player2.skillLearning.soulCount, 222);
  assert.notStrictEqual(restored.player1, restored.player2);
}

// 场景接线是同一旅程的浏览器边界：启动、地图、结算返回、再次读档都必须存在。
const source = (relativePath: string): string =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8');
assert.match(source('src/scenes/BootScene.ts'), /scene\.start\('SaveSlotScene'\)/);
assert.match(source('src/scenes/SaveSlotScene.ts'), /scene\.start\('HeavenMapScene'\)/);
assert.match(source('src/scenes/HeavenMapScene.ts'), /scene\.start\(node\.routeKey, \{ playerCount \}\)/);
assert.match(source('src/scenes/test-scene/TestSceneStage11FlowBridge.ts'), /saveSceneNow\(\)/);
assert.match(source('src/scenes/test-scene/TestSceneStage11FlowBridge.ts'), /scene\.start\('HeavenMapScene'\)/);

console.log('Formal game-loop end-to-end journey tests passed.');
