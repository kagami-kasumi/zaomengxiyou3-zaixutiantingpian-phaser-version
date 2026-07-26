import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  createPartyTaskModel,
  DailyTaskDefinitions,
  DormantActivityTaskIds,
  encodePartyTaskModel,
  recordTaskMonsterDefeat,
} from '../src/systems/PartyTaskSystem';
import {
  changeFormalTaskPage,
  claimSelectedFormalTask,
  createFormalTaskPage,
  getFormalTaskPageCount,
  getFormalTaskVisibleDefinitions,
  selectFormalTaskRow,
  setFormalTaskTab,
} from '../src/systems/FormalTaskPageSystem';
import {
  ActiveSaveSlotStorageKey,
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
} from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

class MemoryStorage implements SaveStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
  public removeItem(key: string): void { this.values.delete(key); }
}

assert.equal(DailyTaskDefinitions.length, 43);
assert.deepEqual(DailyTaskDefinitions.map((task) => task.id), Array.from({ length: 43 }, (_, index) => index + 1));
assert.deepEqual(DormantActivityTaskIds, [101, 102, 103, 104]);
assert.equal(DailyTaskDefinitions[2]!.needs[1]!.producerKey, 'Monster3');
assert.equal(DailyTaskDefinitions[24]!.rewards.length, 4);
assert.equal(DailyTaskDefinitions[38]!.needs.length, 3);

const tasks = createPartyTaskModel(new Date(2026, 6, 26));
assert.equal(recordTaskMonsterDefeat(tasks, 'Monster8', 2), 0);
for (let index = 0; index < 25; index += 1) recordTaskMonsterDefeat(tasks, 'Monster8', 0);
assert.equal(tasks.daily[0]!.progress[0], 20);
assert.equal(tasks.daily[0]!.isComplete, true);
assert.equal(tasks.daily[2]!.progress[0], 25);
assert.equal(tasks.daily[2]!.isComplete, false);

const encoded = encodePartyTaskModel(tasks);
const sameDay = createPartyTaskModel(new Date(2026, 6, 26), encoded);
assert.equal(sameDay.daily[0]!.progress[0], 20);
const nextDay = createPartyTaskModel(new Date(2026, 6, 27), encoded);
assert.equal(nextDay.daily[0]!.progress[0], 0);
assert.equal(nextDay.daily[0]!.hasClaimed, false);

const storage = new MemoryStorage();
assert.equal(createSaveSlot(storage, 0, createDefaultGameSave(new Date(2026, 6, 26))), true);
storage.setItem(ActiveSaveSlotStorageKey, '0');
const page = createFormalTaskPage(storage, new Date(2026, 6, 26))!;
assert.equal(getFormalTaskPageCount(page), 9);
assert.equal(getFormalTaskVisibleDefinitions(page).length, 5);
changeFormalTaskPage(page, 99);
assert.equal(page.page, 2);
for (let index = 0; index < 20; index += 1) changeFormalTaskPage(page, 1);
assert.equal(page.page, 9);
assert.equal(getFormalTaskVisibleDefinitions(page).length, 3);
assert.equal(selectFormalTaskRow(page, 4), false);
setFormalTaskTab(page, 'activity');
assert.equal(getFormalTaskPageCount(page), 1);
assert.equal(getFormalTaskVisibleDefinitions(page).length, 0);

setFormalTaskTab(page, 'daily');
assert.equal(selectFormalTaskRow(page, 0), true);
setFormalTaskTab(page, 'activity');
assert.equal(page.selectedTaskId, 1, 'empty activity keeps the original stale detail selection');
setFormalTaskTab(page, 'daily');
page.tasks.daily[0]!.progress[0] = 20;
page.tasks.daily[0]!.isComplete = true;
assert.equal(claimSelectedFormalTask(page, storage, () => 0.9, new Date(2026, 6, 26)), true);
assert.equal(page.tasks.daily[0]!.hasClaimed, true);
assert.equal(page.restored.player1.soulCount, 250);
assert.equal(claimSelectedFormalTask(page, storage, () => 0.9, new Date(2026, 6, 26)), false);
const reloaded = loadActiveGame(storage)!;
assert.equal(reloaded.partyTasks?.daily[0]?.hasClaimed, true);
assert.equal(reloaded.player1.soulCount, 250);

const root = process.cwd();
const scene = readFileSync(path.join(root, 'src/scenes/TaskScene.ts'), 'utf8');
const map = readFileSync(path.join(root, 'src/scenes/HeavenMapScene.ts'), 'utf8');
const manifest = readFileSync(path.join(root, 'src/assets/AssetManifest.ts'), 'utf8');
assert.match(map, /330,\s*508,\s*66,\s*66/);
assert.match(map, /'TaskScene'/);
assert.match(scene, /taskUiAssets\.tile\.(?:selected|normal)/);
assert.match(scene, /taskUiAssets\.claim\.(?:enabled|disabled)/);
assert.match(scene, /getFormalTaskVisibleDefinitions/);
assert.doesNotMatch(scene, /活动说明|在线服务|owner selector/i);
assert.match(manifest, /map-service\.tasks\.root/);
for (const file of ['root.svg', 'daily-selected.svg', 'activity-selected.svg', 'tile-selected.svg', 'claim-enabled.svg']) {
  assert.ok(readFileSync(path.join(root, 'public/assets/ui/map-services/tasks', file)).length > 1_000);
}

console.log('formal task catalog, progress, cross-day reset, native assets, and map wiring tests passed');
