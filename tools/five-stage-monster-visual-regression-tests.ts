import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  stage11MonsterAtlases,
  stage11MonsterAttackAssets,
  stage12MonsterAtlases,
  stage12MonsterAttackAssets,
  stage13Monster5Atlas,
  stage13Monster5AttackAssets,
  stage21MonsterAtlases,
  stage21AttackAssets,
  stage22Monster16Atlas,
  stage22Monster16AttackAssets,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  AssetBundleCoordinator,
  requireRuntimeAssetOwner,
  type AssetBundleLoadAdapter,
} from '../src/systems/AssetBundleCoordinator';

const sum = <T>(values: readonly T[], project: (value: T) => number): number =>
  values.reduce((total, value) => total + project(value), 0);

const stage1Atlases = [
  ...Object.values(stage11MonsterAtlases),
  ...Object.values(stage12MonsterAtlases),
  stage13Monster5Atlas,
];
const stage1Attacks = [
  ...Object.values(stage11MonsterAttackAssets),
  ...Object.values(stage12MonsterAttackAssets),
  ...Object.values(stage13Monster5AttackAssets),
];
assert.equal(sum(stage1Atlases, (asset) => asset.reachableFrameCount), 167);
assert.equal(sum(stage1Attacks, (asset) => asset.frameCount), 171);
for (const asset of stage1Atlases) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'stage-1-monsters');
}
for (const asset of stage1Attacks) {
  for (const key of asset.frameKeys) {
    assert.equal(requireRuntimeAssetOwner(key), 'stage-1-monsters');
  }
}

assert.equal(
  sum(Object.values(stage21MonsterAtlases), (asset) => asset.reachableFrameCount),
  94,
);
assert.equal(sum(Object.values(stage21AttackAssets), (asset) => asset.frameCount), 132);
for (const asset of Object.values(stage21MonsterAtlases)) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'stage-2-monsters');
}
for (const asset of Object.values(stage21AttackAssets)) {
  for (const key of asset.frameKeys) {
    assert.equal(requireRuntimeAssetOwner(key), 'stage-2-monsters');
  }
}

assert.equal(stage22Monster16Atlas.reachableFrameCount, 36);
assert.equal(sum(Object.values(stage22Monster16AttackAssets), (asset) => asset.frameCount), 104);
assert.equal(requireRuntimeAssetOwner(stage22Monster16Atlas.key), 'stage-22');
for (const asset of Object.values(stage22Monster16AttackAssets)) {
  for (const key of asset.frameKeys) assert.equal(requireRuntimeAssetOwner(key), 'stage-22');
}

assert.deepEqual(sceneAssetBundles['stage-11'].dependencies,
  ['combat-common', 'stage-1-common', 'stage-1-monsters']);
assert.deepEqual(sceneAssetBundles['stage-12'].dependencies,
  ['combat-common', 'stage-1-common', 'stage-1-monsters']);
assert.deepEqual(sceneAssetBundles['stage-13'].dependencies,
  ['combat-common', 'stage-1-common', 'stage-1-monsters']);
assert.deepEqual(sceneAssetBundles['stage-21'].dependencies,
  ['combat-common', 'stage-2-common', 'stage-2-monsters']);
assert.deepEqual(sceneAssetBundles['stage-22'].dependencies,
  ['combat-common', 'stage-2-common', 'stage-2-monsters']);

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
  assert.equal(loadCounts.get('stage-1-monsters'), 1);
  assert.equal(loadCounts.get('stage-2-monsters'), 1);
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
