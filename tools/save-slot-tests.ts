import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { saveSlotAssets } from '../src/assets/AssetManifest';
import {
  ActiveSaveSlotStorageKey,
  createDefaultGameSave,
  createSaveSlot,
  deleteSaveSlot,
  getActiveSaveSlotId,
  getSaveSlotStorageKey,
  inspectSaveSlot,
  listSaveSlots,
  loadActiveGame,
  migrateLegacySingleSave,
  saveActiveGame,
  saveActiveLevelUnlockProgress,
  selectSaveSlot,
} from '../src/systems/SaveSlotSystem';
import {
  GameSaveStorageKey,
  GameSaveVersion,
  serializeGameSave,
  type SaveStorage,
} from '../src/systems/SaveSystem';

const repoRoot = process.cwd();

function createMemoryStorage(initial: Record<string, string> = {}): SaveStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

{
  const storage = createMemoryStorage();
  const slots = listSaveSlots(storage);
  assert.equal(slots.length, 6);
  assert.deepEqual(slots.map((slot) => slot.status), Array(6).fill('empty'));
  assert.deepEqual(slots.map((slot) => slot.displayNumber), [1, 2, 3, 4, 5, 6]);

  assert.equal(createSaveSlot(storage, 2, createDefaultGameSave(new Date('2026-07-22T01:02:03.000Z'))), true);
  assert.equal(getActiveSaveSlotId(storage), 2);
  assert.equal(inspectSaveSlot(storage, 2).status, 'valid');
  assert.equal(inspectSaveSlot(storage, 1).status, 'empty');
  assert.equal(createSaveSlot(storage, 2), false, 'valid slots must not be silently overwritten');
  assert.equal(loadActiveGame(storage)?.savedAt, '2026-07-22T01:02:03.000Z');

  const updated = loadActiveGame(storage)!;
  updated.player1.level = 7;
  assert.equal(saveActiveGame(storage, updated), true);
  assert.equal(inspectSaveSlot(storage, 2).save?.player1.level, 7);
  assert.equal(inspectSaveSlot(storage, 1).status, 'empty');

  deleteSaveSlot(storage, 2);
  assert.equal(inspectSaveSlot(storage, 2).status, 'empty');
  assert.equal(storage.getItem(ActiveSaveSlotStorageKey), null);
}

{
  const corruptKey = getSaveSlotStorageKey(4);
  const storage = createMemoryStorage({ [corruptKey]: '{broken-json' });
  assert.equal(inspectSaveSlot(storage, 4).status, 'corrupt');
  assert.equal(selectSaveSlot(storage, 4), undefined);
  assert.equal(createSaveSlot(storage, 4), false, 'corrupt slots require explicit deletion');
  assert.equal(storage.getItem(corruptKey), '{broken-json');
  deleteSaveSlot(storage, 4);
  assert.equal(createSaveSlot(storage, 4), true);
}

for (const sourceVersion of [1, 2, 3] as const) {
  const save = createDefaultGameSave(new Date('2026-07-21T00:00:00.000Z'));
  const legacy = { ...save, version: sourceVersion } as Record<string, unknown>;
  if (sourceVersion === 1) {
    delete legacy.player2;
    delete legacy.levelUnlockProgress;
  } else if (sourceVersion === 2) {
    delete legacy.levelUnlockProgress;
  }
  const key = getSaveSlotStorageKey(0);
  const storage = createMemoryStorage({ [key]: JSON.stringify(legacy) });
  const before = inspectSaveSlot(storage, 0);
  assert.equal(before.status, 'valid');
  assert.equal(before.sourceVersion, sourceVersion);
  assert.ok(selectSaveSlot(storage, 0));
  const persisted = JSON.parse(storage.getItem(key)!);
  assert.equal(persisted.version, GameSaveVersion);
  assert.deepEqual(persisted.levelUnlockProgress, { unlockedStage: 1, unlockedLevel: 1 });
}

{
  const save = createDefaultGameSave(new Date('2026-07-20T00:00:00.000Z'));
  const storage = createMemoryStorage({ [GameSaveStorageKey]: serializeGameSave(save) });
  assert.equal(migrateLegacySingleSave(storage), 'imported');
  assert.equal(storage.getItem(GameSaveStorageKey), null);
  assert.equal(inspectSaveSlot(storage, 0).status, 'valid');
  assert.equal(getActiveSaveSlotId(storage), 0);
}

{
  const storage = createMemoryStorage({ [GameSaveStorageKey]: '{broken' });
  assert.equal(migrateLegacySingleSave(storage), 'legacy-corrupt');
  assert.equal(storage.getItem(GameSaveStorageKey), '{broken');
  assert.equal(inspectSaveSlot(storage, 0).status, 'empty');
}

{
  const storage = createMemoryStorage({ [GameSaveStorageKey]: serializeGameSave(createDefaultGameSave()) });
  assert.equal(createSaveSlot(storage, 3), true);
  assert.equal(migrateLegacySingleSave(storage), 'slots-not-empty');
  assert.ok(storage.getItem(GameSaveStorageKey), 'legacy data must remain when slots already exist');
  assert.equal(saveActiveLevelUnlockProgress(storage, { unlockedStage: 1, unlockedLevel: 3 }, new Date('2026-07-22T04:05:06.000Z')), true);
  assert.equal(loadActiveGame(storage)?.levelUnlockProgress.unlockedLevel, 3);
  assert.equal(loadActiveGame(storage)?.savedAt, '2026-07-22T04:05:06.000Z');
}

for (const asset of Object.values(saveSlotAssets)) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.match(asset.sourcePackage, /\.swf$/);
  const assetPath = path.join(repoRoot, 'public', asset.path);
  assert.ok(existsSync(assetPath));
  assert.match(readFileSync(assetPath, 'utf8'), /<svg\b/);
}

const bootSource = readFileSync(path.join(repoRoot, 'src/scenes/BootScene.ts'), 'utf8');
assert.match(bootSource, /this\.scene\.start\('SaveSlotScene'\)/);
const mainSource = readFileSync(path.join(repoRoot, 'src/main.ts'), 'utf8');
assert.match(mainSource, /BootScene, SaveSlotScene, HeavenMapScene/);
const sceneSource = readFileSync(path.join(repoRoot, 'src/scenes/SaveSlotScene.ts'), 'utf8');
assert.match(sceneSource, /createSaveSlot\(this\.storage, slotId\)/);
assert.match(sceneSource, /openDeleteConfirmation\(snapshot\.id\)/);
assert.match(sceneSource, /deleteSaveSlot\(this\.storage!, slotId\)/);
assert.match(sceneSource, /status === 'corrupt'/);
assert.match(sceneSource, /saveSlotAssets\.slotPanel\.key/);
assert.match(sceneSource, /saveSlotAssets\.confirmDialog\.key/);
assert.match(sceneSource, /this\.scene\.start\('HeavenMapScene'\)/);

for (const relativePath of [
  'src/scenes/Stage11EntryScene.ts',
  'src/scenes/stage12/Stage12GameplayBridge.ts',
  'src/scenes/stage13/Stage13GameplayBridge.ts',
]) {
  assert.match(readFileSync(path.join(repoRoot, relativePath), 'utf8'), /loadActiveGame\(storage\)/);
}
for (const relativePath of [
  'src/scenes/stage12/Stage12ResultBridge.ts',
  'src/scenes/stage13/Stage13ResultBridge.ts',
]) {
  assert.match(readFileSync(path.join(repoRoot, relativePath), 'utf8'), /saveActiveLevelUnlockProgress\(storage, progress\)/);
}
const saveBridgeSource = readFileSync(path.join(repoRoot, 'src/scenes/test-scene/TestSceneSaveBridge.ts'), 'utf8');
assert.match(saveBridgeSource, /loadActiveGame\(storage\)/);
assert.match(saveBridgeSource, /saveActiveGame\(storage/);

console.log('Save slot system tests passed.');
