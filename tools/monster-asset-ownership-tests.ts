import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  monsterResourceCatalog,
  monsterResourceFamilies,
  type MonsterResourceFamilyId,
  type MonsterResourceId,
} from '../src/assets/MonsterAssetCatalog';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import { monsterDefinitionCatalog } from '../src/systems/MonsterDefinitionCatalog';

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'public');
const monsterRoot = path.join(publicRoot, 'assets', 'monsters');

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
  });
}

const diskPaths = listFiles(monsterRoot)
  .map((absolutePath) => `/${path.relative(publicRoot, absolutePath).replaceAll('\\', '/')}`)
  .sort();
const runtimeDeclarations = Object.entries(sceneAssetBundles).flatMap(([bundleId, bundle]) =>
  bundle.assets
    .filter((asset) => asset.path.startsWith('/assets/monsters/'))
    .map((asset) => ({ bundleId, key: asset.key, path: asset.path })),
);
const runtimePaths = runtimeDeclarations.map((asset) => asset.path).sort();

assert.equal(diskPaths.length, 424, 'the monster domain must retain all 424 visual and geometry files');
assert.equal(new Set(runtimePaths).size, runtimePaths.length, 'each monster file needs one runtime owner');
assert.deepEqual(runtimePaths, diskPaths, 'monster disk files and runtime declarations must match exactly');
assert.ok(runtimePaths.every((assetPath) => !assetPath.includes('/stage')));
assert.ok(runtimeDeclarations.every(({ bundleId }) => !bundleId.startsWith('stage-')));

const allowedPrefixByFamily: Readonly<Record<MonsterResourceFamilyId, string>> = {
  'monster-family-2-4-7-8': '/assets/monsters/family-2-4-7-8/',
  'monster-family-3-30': '/assets/monsters/family-3-30/',
  'monster-5': '/assets/monsters/monster-5/',
  'monster-family-6-9-10-19': '/assets/monsters/family-6-9-10-19/',
  'monster-16': '/assets/monsters/monster-16/',
};

for (const declaration of runtimeDeclarations) {
  const familyId = declaration.bundleId as MonsterResourceFamilyId;
  const prefix = allowedPrefixByFamily[familyId];
  assert.ok(prefix, `monster asset must have a monster-family bundle owner: ${declaration.bundleId}`);
  assert.ok(declaration.path.startsWith(prefix), `${familyId} cannot own ${declaration.path}`);
}

const expectedMonsterIds: readonly MonsterResourceId[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 30];
assert.deepEqual(
  Object.keys(monsterResourceCatalog).map(Number).sort((left, right) => left - right),
  expectedMonsterIds,
  'every migrated monster id must have exactly one catalog entry',
);
assert.deepEqual(
  Object.keys(monsterDefinitionCatalog).map(Number).sort((left, right) => left - right),
  expectedMonsterIds,
  'combat definitions and resource catalog must cover the same monster ids',
);
for (const monsterId of expectedMonsterIds) {
  const familyId = monsterResourceCatalog[monsterId].familyId;
  assert.ok(monsterResourceFamilies[familyId].monsterIds.includes(monsterId));
}

for (const [familyId, family] of Object.entries(monsterResourceFamilies) as [
  MonsterResourceFamilyId,
  (typeof monsterResourceFamilies)[MonsterResourceFamilyId],
][]) {
  const bundle = sceneAssetBundles[familyId];
  assert.deepEqual(bundle.dependencies, []);
  assert.ok(bundle.assets.some((asset) => asset.key === family.geometry.key));
  for (const atlas of Object.values(family.atlases)) {
    assert.ok(bundle.assets.some((asset) => asset.key === atlas.key));
  }
  for (const attack of Object.values(family.attacks)) {
    for (const key of attack.frameKeys) assert.ok(bundle.assets.some((asset) => asset.key === key));
  }
}

const stageRoot = path.join(publicRoot, 'assets', 'stages');
assert.equal(
  readdirSync(stageRoot, { recursive: true, withFileTypes: true })
    .some((entry) => entry.isDirectory() && entry.name === 'monsters'),
  false,
  'public/assets/stages cannot regain a monster-owned directory',
);
for (const retiredBundleId of [
  'stage-1-monsters-11',
  'stage-1-monsters-12',
  'stage-1-monsters-13',
  'stage-2-monsters',
]) {
  assert.equal(retiredBundleId in sceneAssetBundles, false, `retired stage monster bundle returned: ${retiredBundleId}`);
}

for (const consumer of [
  'src/scenes/stage11/Stage11MonsterVisualBridge.ts',
  'src/scenes/stage12/Stage12MonsterVisualBridge.ts',
  'src/scenes/stage13/Stage13Monster5VisualBridge.ts',
  'src/scenes/stage21/Stage21MonsterVisualBridge.ts',
  'src/scenes/stage22/Stage22Monster16VisualBridge.ts',
]) {
  const source = readFileSync(path.join(repoRoot, consumer), 'utf8');
  assert.ok(source.includes('assets/MonsterAssetCatalog'), `${consumer} must consume the monster catalog`);
}

const combatFacade = readFileSync(path.join(repoRoot, 'src/systems/Stage1CombatSystem.ts'), 'utf8');
assert.ok(combatFacade.includes("from './MonsterDefinitionCatalog'"));
assert.equal(combatFacade.includes('const enemyConfigs'), false, 'stage combat cannot regain monster definitions');

assert.equal(existsSync(path.join(publicRoot, 'assets', 'monsters')), true);
console.log('Monster catalog, bundle ownership, disk parity, and stage-boundary tests passed.');
