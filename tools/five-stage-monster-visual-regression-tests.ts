import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  monsterFamily330Atlases,
  monsterFamily330AttackAssets,
  monsterFamily2478Atlases,
  monsterFamily2478AttackAssets,
  monster5Atlas,
  monster5AttackAssets,
  monsterFamily691019Atlases,
  monsterFamily691019AttackAssets,
  monster16Atlas,
  monster16AttackAssets,
} from '../src/assets/MonsterAssetCatalog';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  AssetBundleCoordinator,
  requireRuntimeAssetOwner,
  type AssetBundleLoadAdapter,
} from '../src/systems/AssetBundleCoordinator';

const sum = <T>(values: readonly T[], project: (value: T) => number): number =>
  values.reduce((total, value) => total + project(value), 0);

const stage1Atlases = [
  ...Object.values(monsterFamily330Atlases),
  ...Object.values(monsterFamily2478Atlases),
  monster5Atlas,
];
const stage1Attacks = [
  ...Object.values(monsterFamily330AttackAssets),
  ...Object.values(monsterFamily2478AttackAssets),
  ...Object.values(monster5AttackAssets),
];
assert.equal(sum(stage1Atlases, (asset) => asset.reachableFrameCount), 167);
assert.equal(sum(stage1Attacks, (asset) => asset.frameCount), 171);
for (const asset of Object.values(monsterFamily330Atlases)) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'monster-family-3-30');
}
for (const asset of Object.values(monsterFamily2478Atlases)) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'monster-family-2-4-7-8');
}
assert.equal(requireRuntimeAssetOwner(monster5Atlas.key), 'monster-5');
for (const [index, asset] of stage1Attacks.entries()) {
  const owner = index < Object.values(monsterFamily330AttackAssets).length
    ? 'monster-family-3-30'
    : index < Object.values(monsterFamily330AttackAssets).length + Object.values(monsterFamily2478AttackAssets).length
      ? 'monster-family-2-4-7-8'
      : 'monster-5';
  for (const key of asset.frameKeys) {
    assert.equal(requireRuntimeAssetOwner(key), owner);
  }
}

assert.equal(
  sum(Object.values(monsterFamily691019Atlases), (asset) => asset.reachableFrameCount),
  94,
);
assert.equal(sum(Object.values(monsterFamily691019AttackAssets), (asset) => asset.frameCount), 132);
for (const asset of Object.values(monsterFamily691019Atlases)) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'monster-family-6-9-10-19');
}
for (const asset of Object.values(monsterFamily691019AttackAssets)) {
  for (const key of asset.frameKeys) {
    assert.equal(requireRuntimeAssetOwner(key), 'monster-family-6-9-10-19');
  }
}

assert.equal(monster16Atlas.reachableFrameCount, 36);
assert.equal(sum(Object.values(monster16AttackAssets), (asset) => asset.frameCount), 104);
assert.equal(requireRuntimeAssetOwner(monster16Atlas.key), 'monster-16');
for (const asset of Object.values(monster16AttackAssets)) {
  for (const key of asset.frameKeys) assert.equal(requireRuntimeAssetOwner(key), 'monster-16');
}

assert.deepEqual(sceneAssetBundles['stage-11'].dependencies,
  ['combat-common', 'stage-1-common', 'monster-family-3-30']);
assert.deepEqual(sceneAssetBundles['stage-12'].dependencies,
  ['combat-common', 'stage-1-common', 'monster-family-2-4-7-8']);
assert.deepEqual(sceneAssetBundles['stage-13'].dependencies,
  ['combat-common', 'stage-1-common', 'monster-family-3-30', 'monster-family-2-4-7-8', 'monster-5']);
assert.deepEqual(sceneAssetBundles['stage-21'].dependencies,
  ['combat-common', 'stage-2-common', 'monster-family-6-9-10-19']);
assert.deepEqual(sceneAssetBundles['stage-22'].dependencies,
  ['combat-common', 'stage-2-common', 'monster-family-6-9-10-19', 'monster-16']);

{
  const coordinator = new AssetBundleCoordinator();
  const loaded = new Set<string>();
  const loadCounts = new Map<string, number>();
  const adapter: AssetBundleLoadAdapter = {
    has: (asset) => loaded.has(asset.key),
    load: async (bundleId, assets) => {
      loadCounts.set(bundleId, (loadCounts.get(bundleId) ?? 0) + 1);
      for (const asset of assets) loaded.add(asset.key);
    },
  };
  for (const bundleId of ['stage-11', 'stage-12', 'stage-13', 'stage-21', 'stage-22'] as const) {
    await coordinator.ensure(bundleId, adapter);
    await coordinator.ensure(bundleId, adapter);
    assert.equal(coordinator.isLoaded(bundleId), true);
    assert.equal(loadCounts.get(bundleId), 1, `${bundleId} must load only once across re-entry`);
  }
  assert.equal(loadCounts.get('monster-family-3-30'), 1);
  assert.equal(loadCounts.get('monster-family-2-4-7-8'), 1);
  assert.equal(loadCounts.get('monster-5'), 1);
  assert.equal(loadCounts.get('monster-family-6-9-10-19'), 1);
  assert.equal(loadCounts.get('monster-16'), 1);
}

const repoRoot = process.cwd();
const visualBridgeSources = [
  'src/scenes/stage11/Stage11MonsterVisualBridge.ts',
  'src/scenes/stage12/Stage12MonsterVisualBridge.ts',
  'src/scenes/stage13/Stage13MonsterVisualBridge.ts',
  'src/scenes/stage13/Stage13Monster5VisualBridge.ts',
  'src/scenes/stage21/Stage21MonsterVisualBridge.ts',
  'src/scenes/stage22/Stage22Monster16VisualBridge.ts',
].map((file) => readFileSync(path.join(repoRoot, file), 'utf8'));
for (const source of visualBridgeSources) {
  assert.equal(source.includes('.add.arc('), false, 'monster visuals must not restore Arc placeholders');
  assert.equal(source.includes('.add.text('), false, 'monster visuals must not restore Text placeholders');
}

console.log('Five-stage monster frame, owner, re-entry, and placeholder regression tests passed.');
