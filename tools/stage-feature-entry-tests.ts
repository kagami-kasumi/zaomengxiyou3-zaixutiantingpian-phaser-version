import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  stageSettingsAssets,
  stageFeatureEntryButtonAssets,
} from '../src/assets/AssetManifest';
import {
  activateGlobalSettingsForTests,
  DefaultGlobalSettings,
} from '../src/systems/GlobalSettingsSystem';
import {
  closeStageHelp,
  createStageSettingsModel,
  cycleStageSpawnSpeed,
  isStageSoundEnabled,
  openStageHelp,
  showStageHelpFrame,
  toggleStageSound,
} from '../src/systems/StageSettingsSystem';
import {
  routeStageFeatureEntry,
} from '../src/systems/StageFeatureEntryRouterSystem';
import {
  closeFeatureUi,
  createFeatureUiHostModel,
  openFeatureUi,
} from '../src/systems/FeatureUiHostSystem';

const root = process.cwd();
const source = (relativePath: string): string =>
  readFileSync(path.join(root, relativePath), 'utf8');

for (const [entry, states] of Object.entries(stageFeatureEntryButtonAssets)) {
  assert.deepEqual(Object.keys(states), ['up', 'over', 'down', 'hit']);
  for (const asset of Object.values(states)) {
    assert.equal(asset.status, 'ready');
    assert.equal(asset.source, 'extracted-flash');
    assert.equal(asset.sourcePackage, 'assets/OtherMat1.swf');
    assert.ok([549, 555, 561, 567, 573].includes(asset.sourceCharacterId));
    assert.ok(existsSync(path.join(root, 'public', asset.path)), `${entry}:${asset.path}`);
  }
}

for (const asset of [
  stageSettingsAssets.root,
  ...stageSettingsAssets.helpFrames,
  ...stageSettingsAssets.spawnSpeedFrames,
  ...Object.values(stageSettingsAssets.buttons).flatMap((states) => Object.values(states)),
  ...Object.values(stageSettingsAssets.helpButtons).flatMap((states) => Object.values(states)),
]) {
  assert.equal(asset.status, 'ready');
  assert.equal(asset.sourcePackage, 'assets/OtherMat1.swf');
  assert.ok(existsSync(path.join(root, 'public', asset.path)), asset.path);
}

activateGlobalSettingsForTests(DefaultGlobalSettings);
const settingsModel = createStageSettingsModel();
assert.equal(isStageSoundEnabled(), true);
assert.equal(toggleStageSound(), false);
assert.equal(isStageSoundEnabled(), false);
assert.deepEqual(
  [cycleStageSpawnSpeed(settingsModel), cycleStageSpawnSpeed(settingsModel), cycleStageSpawnSpeed(settingsModel)],
  [2, 4, 1],
);
openStageHelp(settingsModel);
assert.equal(settingsModel.page, 'help-action');
showStageHelpFrame(settingsModel, 'pet');
assert.equal(settingsModel.page, 'help-pet');
closeStageHelp(settingsModel);
assert.equal(settingsModel.page, 'settings');

const ready = {
  playerCount: 2 as const,
  ownerAlive: true,
  magicWeaponEquipped: true,
};
const formalStageScenePaths = [
  'src/scenes/test-scene/TestSceneStage11FlowBridge.ts',
  'src/scenes/PlayableLevelRuntime.ts',
] as const;

for (const stage of ['12', '13', '21', '22']) {
  assert.match(source(`src/scenes/Stage${stage}Scene.ts`), /createPlayableLevelRuntime\(/);
}

assert.deepEqual(
  routeStageFeatureEntry(
    { entry: 'backpack', owner: 'p2', source: 'pointer' },
    ready,
  ),
  {
    status: 'open-page',
    page: 'backpack',
    owner: 'p2',
    request: { entry: 'backpack', owner: 'p2', source: 'pointer' },
  },
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'skills', owner: 'p2', source: 'keyboard' },
    ready,
  ).status,
  'open-page',
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'skills', owner: 'p2', source: 'keyboard' },
    ready,
  ).owner,
  'p1',
);
assert.deepEqual(
  routeStageFeatureEntry(
    { entry: 'settings', owner: 'p2', source: 'pointer' },
    ready,
  ),
  {
    status: 'settings-pending',
    owner: 'p1',
    request: { entry: 'settings', owner: 'p2', source: 'pointer' },
  },
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'backpack', owner: 'p2', source: 'pointer' },
    { ...ready, playerCount: 1 },
  ).status,
  'blocked',
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'backpack', owner: 'p1', source: 'keyboard' },
    { ...ready, ownerAlive: false },
  ).status,
  'blocked',
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'magic-weapon', owner: 'p1', source: 'pointer' },
    { ...ready, magicWeaponEquipped: false },
  ).status,
  'blocked',
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'pets', owner: 'p1', source: 'pointer' },
    { ...ready, ownerAlive: false },
  ).status,
  'open-page',
);
assert.equal(
  routeStageFeatureEntry(
    { entry: 'backpack', owner: 'p1', source: 'pointer' },
    { ...ready, blocksInventoryPages: true },
  ).status,
  'blocked',
);

const bridge = source('src/scenes/feature-ui/FormalFeatureUiEntryBridge.ts');
for (const contract of [
  "KeyCodes.ESC, 'settings', 'p1'",
  "P2_BACKPACK_KEY_CODE, 'backpack', 'p2'",
  "P2_SKILLS_KEY_CODE, 'skills', 'p2'",
  "KeyCodes.NUMPAD_SUBTRACT, 'pets', 'p2'",
  "createStageFeatureEntryButtons(scene, 'p2'",
  'routeStageFeatureEntry(',
  'setStageFeatureEntryOwnerAlive',
  'StageFeatureSettingsRequestedEvent',
  'launchStageSettings(scene, config)',
  '.setScrollFactor(0)',
]) {
  assert.ok(bridge.includes(contract), contract);
}
assert.doesNotMatch(bridge, /syncHitToCamera|scene\.cameras\.main\.scroll[XY]/);
assert.doesNotMatch(bridge, /P2_.*MAGIC|P2_.*SETTINGS/);

for (const scenePath of formalStageScenePaths) {
  const scene = source(scenePath);
  assert.equal(
    scene.match(/installFormalFeatureUiEntries\(/g)?.length,
    1,
    `${scenePath}: shared feature-entry installation`,
  );
  assert.match(scene, /originKind:\s*'combat'/, `${scenePath}: combat origin`);
  assert.match(scene, /party:\s*(?:this\.)?(?:formalPartyRuntime|partyRuntime)\.party/, `${scenePath}: formal party`);
  assert.doesNotMatch(source(scenePath), /keydown-ESC/);
}

for (const originSceneKey of [
  'TestScene',
  'Stage12Scene',
  'Stage13Scene',
  'Stage21Scene',
  'Stage22Scene',
]) {
  const host = createFeatureUiHostModel();
  const p1Backpack = routeStageFeatureEntry(
    { entry: 'backpack', owner: 'p1', source: 'keyboard' },
    ready,
  );
  assert.equal(p1Backpack.status, 'open-page');
  if (p1Backpack.status !== 'open-page') throw new Error('Expected P1 backpack route');
  assert.equal(openFeatureUi(host, {
    page: p1Backpack.page,
    owner: p1Backpack.owner,
    originSceneKey,
    originKind: 'combat',
    playerCount: 2,
  }).status, 'opened');

  const p2Pet = routeStageFeatureEntry(
    { entry: 'pets', owner: 'p2', source: 'pointer' },
    ready,
  );
  assert.equal(p2Pet.status, 'open-page');
  if (p2Pet.status !== 'open-page') throw new Error('Expected P2 pet route');
  assert.equal(openFeatureUi(host, {
    page: p2Pet.page,
    owner: p2Pet.owner,
    originSceneKey,
    originKind: 'combat',
    playerCount: 2,
  }).status, 'busy');
  assert.equal(host.active?.page, 'backpack');
  assert.equal(host.active?.owner, 'p1');
  assert.equal(closeFeatureUi(host)?.originSceneKey, originSceneKey);

  const p2Skills = routeStageFeatureEntry(
    { entry: 'skills', owner: 'p2', source: 'keyboard' },
    ready,
  );
  assert.equal(p2Skills.status, 'open-page');
  assert.equal(p2Skills.owner, 'p1');

  const settings = routeStageFeatureEntry(
    { entry: 'settings', owner: 'p2', source: 'pointer' },
    ready,
  );
  assert.equal(settings.status, 'settings-pending');
  assert.equal(settings.owner, 'p1');
}

const settingsScene = source('src/scenes/StageSettingsScene.ts');
for (const contract of [
  'stageSettingsAssets.root.key',
  'stageSettingsAssets.helpFrames',
  'toggleStageSound',
  'cycleStageSpawnSpeed',
  "this.routeAway('HeavenMapScene')",
  "this.routeAway('SaveSlotScene')",
  "this.input.keyboard?.on('keydown-ESC'",
]) {
  assert.ok(settingsScene.includes(contract), contract);
}

const featureScene = source('src/scenes/FeatureUiScene.ts');
assert.ok(featureScene.includes("this.session.originKind === 'map'"));
assert.ok(featureScene.includes("binding.page === this.session?.page"));
assert.ok(featureScene.includes("this.input.keyboard?.on('keydown-ESC', this.closeHost, this)"));
assert.match(
  featureScene,
  /if \(this\.session\.originKind === 'map'\)[\s\S]*keydown-ESC[\s\S]*else \{[\s\S]*binding\.page === this\.session\?\.page/,
);
assert.doesNotMatch(
  featureScene,
  /originKind === 'combat'[\s\S]{0,160}(?:switchFeatureUi|keydown-ESC|createMapHostChrome)/,
);
assert.ok(source('src/main.ts').includes('StageSettingsScene'));

const assetBundles = source('src/assets/SceneAssetBundles.ts');
assert.ok(assetBundles.includes('const sharedStage2MonsterAssets = ['));
assert.match(
  assetBundles,
  /'stage-2-monsters': \{[\s\S]*assets: sharedStage2MonsterAssets/,
);
assert.match(
  assetBundles,
  /'stage-22': \{[\s\S]*dependencies: \['combat-common', 'stage-2-common', 'stage-2-monsters'\]/,
);

console.log('stage-feature-entry-tests: ok');
