import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  runtimeAssetBundleOwners,
  sceneAssetBundles,
  sceneBundleBySceneKey,
  validateSceneAssetBundles,
  type BundleAssetDefinition,
} from '../src/assets/SceneAssetBundles';
import {
  AssetBundleCoordinator,
  requireRuntimeAssetOwner,
  type AssetBundleLoadAdapter,
} from '../src/systems/AssetBundleCoordinator';

const repoRoot = process.cwd();
const requiredBundles = [
  'shell',
  'heaven-map',
  'inventory-items-immortality',
  'map-service-immortality',
  'inventory-items-shop',
  'map-service-shop',
  'map-service-tasks',
  'feature-ui',
  'feature-ui-backpack',
  'feature-ui-skills-common',
  'feature-ui-skills-hero-1',
  'feature-ui-skills-hero-5',
  'stage-11',
  'stage-1-monsters',
  'stage-12',
  'stage-13',
  'stage-21',
  'stage-22',
] as const;

for (const bundleId of requiredBundles) assert.ok(sceneAssetBundles[bundleId]);
assert.equal(sceneAssetBundles.shell.assets.length, 3);
assert.equal(sceneAssetBundles.shell.dependencies.length, 0);
assert.equal(sceneBundleBySceneKey.SaveSlotScene, 'shell');
assert.equal(sceneBundleBySceneKey.HeavenMapScene, 'heaven-map');
assert.equal(sceneBundleBySceneKey.ImmortalityScene, 'map-service-immortality');
assert.equal(sceneBundleBySceneKey.ShopScene, 'map-service-shop');
assert.equal(sceneBundleBySceneKey.TaskScene, 'map-service-tasks');
assert.equal(sceneBundleBySceneKey.FeatureUiScene, 'feature-ui');
assert.equal(sceneAssetBundles['feature-ui'].assets.length, 2);
assert.equal(sceneAssetBundles['feature-ui-backpack'].assets.length, 378);
assert.equal(sceneAssetBundles['inventory-items-immortality'].assets.length, 25);
assert.equal(sceneAssetBundles['inventory-items-shop'].assets.length, 49);
assert.deepEqual(
  sceneAssetBundles['feature-ui-backpack'].dependencies,
  ['feature-ui', 'inventory-items-immortality', 'inventory-items-shop'],
);
assert.deepEqual(
  sceneAssetBundles['map-service-immortality'].dependencies,
  ['shell', 'inventory-items-immortality'],
);
assert.deepEqual(
  sceneAssetBundles['map-service-shop'].dependencies,
  ['shell', 'inventory-items-shop', 'feature-ui'],
);
assert.deepEqual(
  sceneAssetBundles['map-service-tasks'].dependencies,
  ['shell', 'heaven-map', 'feature-ui-backpack'],
);
assert.equal(
  sceneAssetBundles.shell.assets.some((asset) => asset.key.startsWith('inventory-item.')),
  false,
);
assert.equal(requireRuntimeAssetOwner('inventory-item.ptdcz'), 'feature-ui-backpack');
assert.equal(requireRuntimeAssetOwner('inventory-item.wpsmd1'), 'inventory-items-immortality');
assert.equal(requireRuntimeAssetOwner('inventory-item.wpqhs1'), 'inventory-items-shop');
assert.ok(sceneAssetBundles['feature-ui-skills-common'].assets.length < 80);
assert.equal(sceneAssetBundles['feature-ui-skills-hero-1'].assets.length, 30);
assert.equal(sceneAssetBundles['feature-ui-skills-hero-5'].assets.length, 30);
for (const characterId of [597, 608]) {
  for (let frame = 1; frame <= 5; frame += 1) {
    assert.ok(
      sceneAssetBundles['feature-ui-skills-common'].assets.some(
        (asset) => asset.key === `full-ui.skill-native.sprite-${characterId}-${frame}`,
      ),
      `Missing heart-method selector ${characterId} frame ${frame}.`,
    );
  }
}
assert.deepEqual(
  sceneAssetBundles['feature-ui-skills-hero-1'].dependencies,
  ['feature-ui-skills-common'],
);
assert.equal(sceneBundleBySceneKey.TestScene, 'stage-11');
assert.equal(sceneBundleBySceneKey.Stage22DevScene, 'stage-22');
assert.ok(runtimeAssetBundleOwners.size > 250);
assert.equal(requireRuntimeAssetOwner('save-slots.start-menu'), 'shell');
assert.equal(requireRuntimeAssetOwner('monster.stage1.monster30.atlas'), 'stage-1-monsters');
assert.equal(requireRuntimeAssetOwner('monster.stage1.monster5.atlas'), 'stage-1-monsters');
assert.equal(requireRuntimeAssetOwner('stage.stage1-1.transfer-door.frame-01'), 'stage-11');
assert.equal(requireRuntimeAssetOwner('stage.stage1-3.transfer-door'), 'stage-13');
assert.equal(requireRuntimeAssetOwner('monster.stage2-1.monster6.atlas'), 'stage-2-monsters');
assert.equal(requireRuntimeAssetOwner('monster.stage2-2.monster16.atlas'), 'stage-22');
assert.throws(
  () => requireRuntimeAssetOwner('ready-but-unowned'),
  /has no bundle owner/,
);

assert.throws(
  () => validateSceneAssetBundles({
    shell: {
      dependencies: [],
      assets: [{ kind: 'image', key: 'duplicate', path: '/a.png' }],
    },
    'save-party': {
      dependencies: [],
      assets: [{ kind: 'image', key: 'duplicate', path: '/b.png' }],
    },
  }),
  /multiple bundle owners/,
);

{
  const coordinator = new AssetBundleCoordinator();
  const loadedKeys = new Set<string>();
  const calls: string[] = [];
  const adapter: AssetBundleLoadAdapter = {
    has: (asset) => loadedKeys.has(asset.key),
    load: async (bundleId, assets) => {
      calls.push(bundleId);
      for (const asset of assets) loadedKeys.add(asset.key);
    },
  };
  await coordinator.ensure('stage-12', adapter);
  assert.deepEqual(calls, ['combat-common', 'stage-1-common', 'stage-1-monsters', 'stage-12']);
  assert.equal(coordinator.isLoaded('stage-12'), true);
  await coordinator.ensure('stage-12', adapter);
  assert.deepEqual(calls, ['combat-common', 'stage-1-common', 'stage-1-monsters', 'stage-12']);
}

{
  const coordinator = new AssetBundleCoordinator();
  const loadedKeys = new Set<string>();
  const adapter: AssetBundleLoadAdapter = {
    has: (asset) => loadedKeys.has(asset.key),
    load: async (_bundleId, assets) => {
      for (const asset of assets) loadedKeys.add(asset.key);
    },
  };
  await coordinator.ensure('stage-11', adapter);
  assert.equal(
    loadedKeys.has('stage.stage1-1.transfer-door.frame-01'),
    true,
    'Stage 1-1 must load its own character 45/41/44 transfer-door frames',
  );
}

{
  const coordinator = new AssetBundleCoordinator();
  const loadedKeys = new Set<string>();
  let releaseLoad: (() => void) | undefined;
  let loadCalls = 0;
  const adapter: AssetBundleLoadAdapter = {
    has: (asset) => loadedKeys.has(asset.key),
    load: async (_bundleId, assets) => {
      loadCalls += 1;
      await new Promise<void>((resolve) => {
        releaseLoad = () => {
          for (const asset of assets) loadedKeys.add(asset.key);
          resolve();
        };
      });
    },
  };
  const first = coordinator.ensure('shell', adapter);
  const second = coordinator.ensure('shell', adapter);
  assert.strictEqual(first, second);
  releaseLoad?.();
  await Promise.all([first, second]);
  assert.equal(loadCalls, 1);
}

{
  const retryAsset: BundleAssetDefinition = {
    kind: 'image',
    key: 'retry.asset',
    path: '/retry.png',
  };
  const coordinator = new AssetBundleCoordinator({
    shell: { dependencies: [], assets: [retryAsset] },
  } as ConstructorParameters<typeof AssetBundleCoordinator>[0]);
  let attempts = 0;
  let loaded = false;
  const adapter: AssetBundleLoadAdapter = {
    has: () => loaded,
    load: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('planned failure');
      loaded = true;
    },
  };
  await assert.rejects(coordinator.ensure('shell', adapter), /planned failure/);
  assert.equal(coordinator.getStatus('shell'), 'failed');
  await coordinator.ensure('shell', adapter);
  assert.equal(coordinator.getStatus('shell'), 'loaded');
  assert.equal(attempts, 2);
}

const source = (relativePath: string): string =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8');
const bootSource = source('src/scenes/BootScene.ts');
assert.match(bootSource, /queueSceneAssetBundleForPreload\(this, 'shell'\)/);
assert.doesNotMatch(
  bootSource,
  /stage11Assets|stage12Assets|stage13Assets|stage21Assets|stage22Assets|heavenMapAssets|fullFeatureUiAssets/,
);
assert.doesNotMatch(bootSource, /Object\.values\(/);
const bridgeSource = source('src/scenes/SceneAssetBundleBridge.ts');
const stage11WorldSource = source('src/scenes/test-scene/TestSceneStage11Bridge.ts');
assert.match(stage11WorldSource, /sourceCharacterIds: \[45, 41, 44\]/);
assert.doesNotMatch(stage11WorldSource, /Stage13AssetKeys\.transferDoor/);
assert.ok(
  sceneAssetBundles['stage-11'].dependencies.includes('stage-1-common'),
  'Stage 1-1 must still load the shared Stage 1 floor owner',
);
assert.match(bridgeSource, /Phaser\.Scenes\.Events\.SHUTDOWN/);
assert.match(bridgeSource, /FILE_LOAD_ERROR/);
assert.match(source('src/scenes/SaveSlotScene.ts'), /ensureSceneAssetBundle\(this, 'save-party'/);
assert.match(source('src/scenes/SaveSlotScene.ts'), /startSceneWithBundle\(this, 'HeavenMapScene'/);
assert.match(source('src/scenes/HeavenMapScene.ts'), /startSceneWithBundle\(this, node\.routeKey/);
assert.match(
  source('src/scenes/feature-ui/FormalFeatureUiEntryBridge.ts'),
  /getFeatureUiAssetBundleId\(page, heroId\)/,
);

console.log('Asset bundle catalog, coordinator, retry, route, and Boot boundary tests passed.');
