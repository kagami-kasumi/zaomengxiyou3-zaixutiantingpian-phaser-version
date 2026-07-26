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
assert.match(overlaySource, /new Phaser\.Geom\.Rectangle\(-2,\s*-2,\s*104,\s*34\.1\)/);
assert.match(overlaySource, /add\.zone\(0,\s*0,\s*940,\s*590\).*setInteractive\(\)/);
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
