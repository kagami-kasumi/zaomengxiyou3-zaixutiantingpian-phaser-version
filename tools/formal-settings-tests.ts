import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  activateGlobalSettingsForTests,
  cycleGlobalSetting,
  DefaultGlobalSettings,
  getGlobalSettings,
  GlobalSettingsStorageKey,
  loadGlobalSettings,
  type GlobalSettingsStorage,
} from '../src/systems/GlobalSettingsSystem';
import {
  assertVerifiedSettingsPageTruth,
  getSettingsTruthBounds,
  getSettingsTruthCharacterId,
  getSettingsTruthLocalOffset,
  getSettingsTruthStateIds,
  getSettingsTruthTextStyle,
  SettingsPageTruthId,
  SettingsTruthObjectIds,
} from '../src/scenes/heaven-map/FormalSettingsPageTruth';

class MemoryStorage implements GlobalSettingsStorage {
  public readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();
activateGlobalSettingsForTests();
assert.deepEqual(loadGlobalSettings(storage), DefaultGlobalSettings);
assert.doesNotThrow(() => assertVerifiedSettingsPageTruth());
assert.equal(SettingsPageTruthId, 'task-settings-175g.settings-page');
assert.equal(getSettingsTruthStateIds().length, 23);
assert.equal(getSettingsTruthCharacterId(SettingsTruthObjectIds.root), 148);
assert.equal(getSettingsTruthCharacterId(SettingsTruthObjectIds.overlay), 134);
assert.equal(getSettingsTruthCharacterId(SettingsTruthObjectIds.overlayHit), 133);
assert.equal(getSettingsTruthCharacterId(SettingsTruthObjectIds.close), 144);
assert.deepEqual(getSettingsTruthBounds(SettingsTruthObjectIds.overlayHit), {
  left: 0, top: 0, width: 940, height: 590,
});
assert.deepEqual(getSettingsTruthBounds(SettingsTruthObjectIds.rows.difficulty.label), {
  left: 364.85, top: 196.8, width: 139.689, height: 36.4,
});
assert.deepEqual(getSettingsTruthBounds(SettingsTruthObjectIds.rows.defaultVol.value), {
  left: 500.4, top: 383.65, width: 104, height: 34.1,
});
assert.deepEqual(getSettingsTruthBounds(SettingsTruthObjectIds.close), {
  left: 590, top: 131.95, width: 40, height: 42,
});
assert.deepEqual(getSettingsTruthLocalOffset(SettingsTruthObjectIds.rows.difficulty.text), {
  x: 2, y: 2,
});
assert.deepEqual(getSettingsTruthTextStyle(SettingsTruthObjectIds.rows.difficulty.text), {
  fontFamily: 'FZCuYuan-M03',
  fontSize: 25,
  color: '#ffffff',
  hoverColor: '#ffff00',
  dynamic: true,
  source: 'gameSetting.refreshTxt.difficulty',
});

assert.equal(cycleGlobalSetting('difficulty', storage).difficulty, 1);
assert.equal(cycleGlobalSetting('difficulty', storage).difficulty, 2);
assert.equal(cycleGlobalSetting('difficulty', storage).difficulty, 0);
assert.equal(cycleGlobalSetting('bgmEnabled', storage).bgmEnabled, false);
assert.equal(cycleGlobalSetting('bgmEnabled', storage).bgmEnabled, true);
assert.equal(cycleGlobalSetting('skillSoundEnabled', storage).skillSoundEnabled, false);
assert.equal(cycleGlobalSetting('skillSoundEnabled', storage).skillSoundEnabled, true);
assert.equal(cycleGlobalSetting('frameRate', storage).frameRate, 24);
assert.equal(cycleGlobalSetting('frameRate', storage).frameRate, 20);
assert.equal(cycleGlobalSetting('frameRate', storage).frameRate, 30);

cycleGlobalSetting('difficulty', storage);
cycleGlobalSetting('bgmEnabled', storage);
cycleGlobalSetting('skillSoundEnabled', storage);
cycleGlobalSetting('frameRate', storage);
activateGlobalSettingsForTests();
assert.deepEqual(loadGlobalSettings(storage), {
  difficulty: 1,
  bgmEnabled: false,
  skillSoundEnabled: false,
  frameRate: 24,
});

storage.values.set(GlobalSettingsStorageKey, '{"difficulty":99}');
assert.deepEqual(loadGlobalSettings(storage), DefaultGlobalSettings);
storage.values.set(GlobalSettingsStorageKey, 'not-json');
assert.deepEqual(loadGlobalSettings(storage), DefaultGlobalSettings);

const repoRoot = process.cwd();
const overlaySource = readFileSync(
  path.join(repoRoot, 'src/scenes/heaven-map/FormalSettingsOverlay.ts'),
  'utf8',
);
const truthSource = readFileSync(
  path.join(repoRoot, 'src/scenes/heaven-map/FormalSettingsPageTruth.ts'),
  'utf8',
);
const mapSource = readFileSync(path.join(repoRoot, 'src/scenes/HeavenMapScene.ts'), 'utf8');
const manifestSource = readFileSync(path.join(repoRoot, 'src/assets/AssetManifest.ts'), 'utf8');
const bundleSource = readFileSync(path.join(repoRoot, 'src/assets/SceneAssetBundles.ts'), 'utf8');
const rootSvg = readFileSync(
  path.join(repoRoot, 'public/assets/ui/map-services/settings/root-static.svg'),
  'utf8',
);

assert.match(mapSource, /new FormalSettingsOverlay/);
assert.match(mapSource, /settingsOverlay\?\.open\(\)/);
assert.match(mapSource, /263\.95,\s*508,\s*66,\s*66/);
assert.match(overlaySource, /assertVerifiedSettingsPageTruth/);
assert.match(overlaySource, /getSettingsTruthBounds/);
assert.match(overlaySource, /getSettingsTruthLocalOffset/);
assert.match(overlaySource, /getSettingsTruthTextStyle/);
assert.doesNotMatch(overlaySource, /(?:364\.85|384\.05|352\.85|501\.4|500\.4|383\.65|34\.1)/);
assert.doesNotMatch(overlaySource, /text\.on\('pointerdown'/);
assert.match(truthSource, /task-settings-175g-settings-page\.json/);
assert.match(truthSource, /displayObjects\.find/);
assert.match(overlaySource, /'示 例'/);
for (const label of ['游戏难度：', '背景音效：', '技能音效：', '画面质量：', '默认音量：']) {
  assert.match(overlaySource, new RegExp(label));
}
assert.match(overlaySource, /settingsUiAssets\.close\.(?:up|over|down)/);
assert.doesNotMatch(overlaySource, /owner|player1|player2|SaveSystem|SaveSlot/);
assert.match(manifestSource, /map-service\.settings\.root/);
assert.match(bundleSource, /settingsUiAssets/);
assert.doesNotMatch(rootSvg, /id="(?:xClick|difficulty|bgmStay|skillStay|quality|defaultVol)"/);
for (const state of ['up', 'over', 'down']) {
  const closeSvg = readFileSync(
    path.join(repoRoot, `public/assets/ui/map-services/settings/close-${state}.svg`),
    'utf8',
  );
  assert.match(closeSvg, new RegExp(`button-frame-${state} \\{ opacity: 1 !important; \\}`));
}

console.log('formal settings cycles, global persistence, native assets, and overlay wiring tests passed');
