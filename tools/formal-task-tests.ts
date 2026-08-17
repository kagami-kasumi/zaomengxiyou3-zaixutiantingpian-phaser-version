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
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';
import {
  assertVerifiedTaskPageTruth,
  getTaskRewardTruthBounds,
  getTaskTileTruthBounds,
  getTaskTruthBounds,
  getTaskTruthCharacterId,
  getTaskTruthHitArea,
  getTaskTruthStateIds,
  getTaskTruthTextStyle,
  TaskPageTruthId,
  TaskTruthObjectIds,
} from '../src/scenes/task/FormalTaskPageTruth';

class MemoryStorage implements SaveStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
  public removeItem(key: string): void { this.values.delete(key); }
}

assert.equal(DailyTaskDefinitions.length, 43);
assert.deepEqual(DailyTaskDefinitions.map((task) => task.id), Array.from({ length: 43 }, (_, index) => index + 1));
assert.deepEqual(DormantActivityTaskIds, [101, 102, 103, 104]);
assert.doesNotThrow(() => assertVerifiedTaskPageTruth());
assert.equal(TaskPageTruthId, 'task-settings-175h.task-page');
assert.deepEqual(getTaskTruthStateIds(), [
  'daily-initial',
  'daily-tab-hover',
  'daily-tab-pressed',
  'activity-tab-hover',
  'activity-tab-pressed',
  'daily-selected',
  'tile-hover',
  'tile-pressed',
  'completed-unclaimed',
  'claim-pressed',
  'claimed-selected',
  'claimed-p1-p2',
  'reward-three-candidates',
  'reward-four-candidates',
  'previous-hover',
  'previous-pressed',
  'next-hover',
  'next-pressed',
  'daily-page2-same-row',
  'daily-last-page-three-tiles',
  'daily-last-page-stale-row4',
  'next-last-boundary',
  'activity-empty',
  'activity-empty-stale-detail',
  'close-hover',
  'close-pressed',
  'closed',
  'reopened-daily',
]);
assert.equal(getTaskTruthCharacterId(TaskTruthObjectIds.root), 85);
assert.deepEqual(getTaskTruthBounds(TaskTruthObjectIds.dailyTab), {
  left: 182.3, top: 138, width: 110, height: 44,
});
assert.deepEqual(getTaskTruthHitArea(TaskTruthObjectIds.close), {
  left: 690.95, top: 79.45, width: 40, height: 40,
});
assert.deepEqual(getTaskTileTruthBounds(4), {
  left: 187.45, top: 365.95, width: 204, height: 40,
});
assert.deepEqual(getTaskTileTruthBounds(4, 'received'), {
  left: 337.95, top: 365.95, width: 63, height: 47,
});
assert.deepEqual(getTaskRewardTruthBounds(3, 'icon'), {
  left: 564.5, top: 328.85, width: 50, height: 50,
});
assert.deepEqual(getTaskTruthTextStyle(TaskTruthObjectIds.description), {
  fontFamily: 'FZCuYuan-M03', fontSize: 15, color: '#ffffff', dynamic: true,
  source: 'Task.getrwdict()',
});
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

const dualStorage = new MemoryStorage();
const dualParty = createPartyConfiguration(2, 1, 2)!;
assert.equal(createSaveSlot(
  dualStorage,
  0,
  createDefaultGameSave(new Date(2026, 6, 26), dualParty),
), true);
dualStorage.setItem(ActiveSaveSlotStorageKey, '0');
const dualPage = createFormalTaskPage(dualStorage, new Date(2026, 6, 26))!;
changeFormalTaskPage(dualPage, 1);
assert.equal(dualPage.page, 2);
assert.equal(selectFormalTaskRow(dualPage, 0), true);
dualPage.tasks.daily[5]!.progress = [25, 25];
dualPage.tasks.daily[5]!.isComplete = true;
assert.equal(claimSelectedFormalTask(
  dualPage,
  dualStorage,
  () => 1,
  new Date(2026, 6, 26),
), true);
assert.equal(dualPage.restored.player1.petRoster.pets[dualPage.restored.player1.petRoster.selectedIndex]!.exp, 600);
assert.equal(dualPage.restored.player2.petRoster.pets[dualPage.restored.player2.petRoster.selectedIndex]!.exp, 600);
const dualReloaded = loadActiveGame(dualStorage)!;
assert.equal(dualReloaded.partyTasks?.daily[5]?.hasClaimed, true);
const dualReloadedPage = createFormalTaskPage(dualStorage, new Date(2026, 6, 26))!;
assert.equal(
  dualReloadedPage.restored.player1.petRoster.pets[dualReloadedPage.restored.player1.petRoster.selectedIndex]!.exp,
  600,
);
assert.equal(
  dualReloadedPage.restored.player2.petRoster.pets[dualReloadedPage.restored.player2.petRoster.selectedIndex]!.exp,
  600,
);

const root = process.cwd();
const scene = readFileSync(path.join(root, 'src/scenes/TaskScene.ts'), 'utf8');
const map = readFileSync(path.join(root, 'src/scenes/HeavenMapScene.ts'), 'utf8');
const manifest = readFileSync(path.join(root, 'src/assets/AssetManifest.ts'), 'utf8');
assert.match(map, /330,\s*508,\s*66,\s*66/);
assert.match(map, /'TaskScene'/);
assert.match(scene, /taskUiAssets\.tile\.(?:selected|normal)/);
assert.match(scene, /taskUiAssets\.claim\.(?:enabled|disabled)/);
assert.match(scene, /getFormalTaskVisibleDefinitions/);
assert.match(scene, /assertVerifiedTaskPageTruth/);
assert.match(scene, /getTaskTruthBounds/);
assert.match(scene, /getTaskTileTruthBounds/);
assert.match(scene, /getTaskRewardTruthBounds/);
assert.doesNotMatch(scene, /(?:TileY|AwardPositions|182\.35|228\.35|273\.35|320\.35|365\.95|431\.45|560\.95|690\.95|414\.8|397\.8)/);
assert.doesNotMatch(scene, /活动说明|在线服务|owner selector/i);
assert.match(manifest, /map-service\.tasks\.root/);
for (const file of ['root-static.svg', 'daily-selected.svg', 'activity-selected.svg', 'tile-selected.svg', 'claim-enabled.svg']) {
  assert.ok(readFileSync(path.join(root, 'public/assets/ui/map-services/tasks', file)).length > 1_000);
}
const staticRoot = readFileSync(
  path.join(root, 'public/assets/ui/map-services/tasks/root-static.svg'),
  'utf8',
);
assert.doesNotMatch(staticRoot, /id="(?:dailymc|activitymc|getaward|btn_close|t[1-5]|txtinstr|txtcur|alist[1-4]|prepage|nextpage|txtpage)"/);

console.log('formal task catalog, progress, cross-day reset, native assets, and map wiring tests passed');
