import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  role1CombatAtlases,
  role1SkillVisualAssets,
  SkillProjectileEffectKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(
  pngDimensions(path.join(repoRoot, 'public', role1CombatAtlases.body.path)),
  { width: 1200, height: 2800 },
);
assert.deepEqual(
  pngDimensions(path.join(repoRoot, 'public', role1CombatAtlases.equipment.path)),
  { width: 1200, height: 2800 },
);
assert.deepEqual(
  pngDimensions(path.join(repoRoot, 'public', role1CombatAtlases.shadow.path)),
  { width: 1000, height: 600 },
);
assert.equal(Object.keys(role1SkillVisualAssets).length, 14, 'every implemented Role1 effect stable key must be mapped');
assert.equal(
  Object.values(role1SkillVisualAssets).reduce((sum, asset) => sum + asset.frameKeys.length, 0),
  249,
  'Role1 skill bundle must retain every frame, including both hyjj start objects',
);
for (const asset of Object.values(role1SkillVisualAssets)) {
  assert.equal(asset.frameKeys.length, asset.framePaths.length);
  for (const framePath of asset.framePaths) {
    assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', framePath)), pngDimensions(path.join(repoRoot, 'public', framePath)));
  }
}

const expectedKeys = Object.values(SkillProjectileEffectKeys).filter((key) => key.includes('role1.'));
for (const key of expectedKeys) {
  assert.ok(key in role1SkillVisualAssets, `${key} must not fall back to Arc/Text placeholders`);
}
const combatBundleKeys = new Set(sceneAssetBundles['combat-common'].assets.map((asset) => asset.key));
for (const atlas of Object.values(role1CombatAtlases)) assert.ok(combatBundleKeys.has(atlas.key));
for (const asset of Object.values(role1SkillVisualAssets)) {
  for (const frameKey of asset.frameKeys) assert.ok(combatBundleKeys.has(frameKey));
}

const viewsSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneViews.ts'),
  'utf8',
);
assert.match(viewsSource, /if \(role1Asset\)/, 'Role1 must branch to true frame images before generic projectile shapes');
assert.match(viewsSource, /scene\.add\.image\(projectile\.x, projectile\.y, role1Asset\.frameKeys\[0\]!\)/);
const manifestSource = readFileSync(path.join(repoRoot, 'src', 'assets', 'AssetManifest.ts'), 'utf8');
assert.doesNotMatch(manifestSource, /role1SkillProjectiles:\s*\{[\s\S]*?status:\s*'missing-original'/);
const bootSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'BootScene.ts'), 'utf8');
assert.match(bootSource, /qaStage'\) === '1-1-role1'/);
assert.match(bootSource, /createFormalDevParty\(2, 2, 1\)/, 'legal 2P QA must place Role1 in the mirrored P2 slot');

const skillDirectory = path.join(repoRoot, 'public', 'assets', 'combat', 'role1', 'skills');
assert.ok(readdirSync(skillDirectory).length >= 14, 'selective Role1 derived resource directories must be present');

console.log('role1 combat visual tests passed');
