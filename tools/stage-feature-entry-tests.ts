import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  stageFeatureEntryButtonAssets,
} from '../src/assets/AssetManifest';
import {
  routeStageFeatureEntry,
} from '../src/systems/StageFeatureEntryRouterSystem';

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

const ready = {
  playerCount: 2 as const,
  ownerAlive: true,
  magicWeaponEquipped: true,
};

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
]) {
  assert.ok(bridge.includes(contract), contract);
}
assert.doesNotMatch(bridge, /P2_.*MAGIC|P2_.*SETTINGS/);

for (const scenePath of [
  'src/scenes/Stage12Scene.ts',
  'src/scenes/Stage13Scene.ts',
  'src/scenes/Stage21Scene.ts',
  'src/scenes/Stage22Scene.ts',
]) {
  assert.doesNotMatch(source(scenePath), /keydown-ESC/);
}
assert.doesNotMatch(
  source('src/scenes/test-scene/TestSceneStage11FlowBridge.ts'),
  /keydown-ESC/,
);

console.log('stage-feature-entry-tests: ok');
