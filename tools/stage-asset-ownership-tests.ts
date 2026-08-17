import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { sceneAssetBundles, type AssetBundleId } from '../src/assets/SceneAssetBundles';

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'public');
const canonicalRoot = path.join(publicRoot, 'assets', 'stages');

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
  });
}

const diskPaths = listFiles(canonicalRoot)
  .map((absolutePath) => `/${path.relative(publicRoot, absolutePath).replaceAll('\\', '/')}`)
  .sort();
const runtimeDeclarations = Object.entries(sceneAssetBundles).flatMap(([bundleId, bundle]) =>
  bundle.assets
    .filter((asset) => asset.path.startsWith('/assets/stages/'))
    .map((asset) => ({ bundleId: bundleId as AssetBundleId, key: asset.key, path: asset.path })),
);
const runtimePaths = runtimeDeclarations.map((asset) => asset.path).sort();

assert.equal(diskPaths.length, 303, 'the stage tree must contain only the 303 runtime-owned scene files');
assert.equal(
  new Set(runtimePaths).size,
  runtimePaths.length,
  'one physical stage file must have exactly one runtime bundle declaration',
);
assert.deepEqual(
  runtimePaths,
  diskPaths,
  'stage files and runtime declarations must be a bidirectional exact match',
);

for (const retiredRoot of ['stage', 'stage1', 'stage21', 'stage22']) {
  assert.equal(
    existsSync(path.join(publicRoot, 'assets', retiredRoot)),
    false,
    `retired stage asset root must not return: public/assets/${retiredRoot}`,
  );
}

const allowedPrefixByBundle: Readonly<Partial<Record<AssetBundleId, string>>> = {
  'stage-1-common': '/assets/stages/shared/floors/',
  'stage-2-common': '/assets/stages/shared/floors/',
  'stage-11': '/assets/stages/stage-1-1/',
  'stage-12': '/assets/stages/stage-1-2/',
  'stage-13': '/assets/stages/stage-1-3/',
  'stage-21': '/assets/stages/stage-2-1/',
  'stage-22': '/assets/stages/stage-2-2/',
};

for (const declaration of runtimeDeclarations) {
  const allowedPrefix = allowedPrefixByBundle[declaration.bundleId];
  assert.ok(allowedPrefix, `stage asset must have an ownership rule: ${declaration.bundleId}`);
  assert.ok(
    declaration.path.startsWith(allowedPrefix),
    `${declaration.bundleId} cannot own ${declaration.path}; expected ${allowedPrefix}`,
  );
}

assert.ok(
  runtimePaths.every((assetPath) => !assetPath.includes('/assets/stages/shared/stage-')),
  'shared directories must use stable resource-family names, not numeric stage buckets',
);
assert.ok(
  runtimePaths.every((assetPath) => !assetPath.includes('/monsters/')),
  'stage bundles cannot own monster atlases, attacks, or geometry',
);
assert.ok(
  diskPaths.every((assetPath) => !assetPath.includes('/monsters/')),
  'the physical stage tree cannot contain a monsters directory',
);

assert.ok(runtimePaths.every((assetPath) => !assetPath.includes('/transfer-door-primary/')));
assert.ok(runtimePaths.every((assetPath) => !assetPath.includes('/transfer-door-accent/')));
assert.equal(
  runtimePaths.filter((assetPath) => assetPath.includes('/stage-1-1/objects/transfer-door/frames/')).length,
  20,
);
assert.equal(
  runtimePaths.filter((assetPath) => assetPath.includes('/stage-1-2/objects/transfer-door/primary/')).length,
  20,
);
assert.equal(
  runtimePaths.filter((assetPath) => assetPath.includes('/stage-1-2/objects/transfer-door/accent/')).length,
  19,
);

console.log('Stage asset ownership, canonical paths, and dead-resource audit tests passed.');
