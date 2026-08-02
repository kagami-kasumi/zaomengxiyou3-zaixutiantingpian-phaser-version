import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  CombatHudAssetKeys,
  HeroNormalAttackEffectKeys,
  role2CombatAtlases,
  role2NormalAttackAssets,
  role2SkillVisualAssets,
  SkillProjectileEffectKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  getRole2ShadowActionDurationMs,
  projectRole2ChargeBarState,
  projectRole2ShadowFrame,
  Role2BodyAnimations,
  readRole2HeldFrame,
} from '../src/systems/Role2CombatVisualSystem';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', role2CombatAtlases.body.path)), { width: 1200, height: 2600 });
assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', role2CombatAtlases.equipment.path)), { width: 1200, height: 2600 });
assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', role2CombatAtlases.shadow.path)), { width: 800, height: 1000 });
assert.equal(Object.keys(role2NormalAttackAssets).length, 2, 'both Role2 normal-attack visuals must be mapped');
assert.equal(Object.keys(role2SkillVisualAssets).length, 9, 'every implemented Role2 skill effect must be mapped');
assert.equal(
  Object.values(role2SkillVisualAssets).reduce((sum, asset) => sum + asset.frameKeys.length, 0),
  464,
  'Role2 skill bundle must retain every TangSeng1 effect frame',
);

for (const asset of [...Object.values(role2NormalAttackAssets), ...Object.values(role2SkillVisualAssets)]) {
  assert.equal(asset.frameKeys.length, asset.framePaths.length);
  for (const framePath of asset.framePaths) {
    const dimensions = pngDimensions(path.join(repoRoot, 'public', framePath));
    assert.ok(dimensions.width > 0 && dimensions.height > 0, `${framePath} must be non-empty`);
  }
}

for (const key of [HeroNormalAttackEffectKeys.role2Hit1, HeroNormalAttackEffectKeys.role2Hit2]) {
  assert.ok(key in role2NormalAttackAssets, `${key} must not fall back to Arc/Text placeholders`);
}
for (const key of Object.values(SkillProjectileEffectKeys).filter((candidate) => candidate.includes('role2.'))) {
  if (key === SkillProjectileEffectKeys.role2ShyShadow) continue;
  assert.ok(key in role2SkillVisualAssets, `${key} must not fall back to Arc/Text placeholders`);
}

const combatBundleKeys = new Set([
  ...sceneAssetBundles['combat-hero-2'].assets,
  ...sceneAssetBundles['combat-hero-2-skills'].assets,
].map((asset) => asset.key));
const role2PortraitBundleAsset = sceneAssetBundles['combat-hero-2'].assets
  .find((asset) => asset.key === CombatHudAssetKeys.role2Portrait);
assert.equal(role2PortraitBundleAsset?.kind, 'image', 'Role2 PNG portrait must use the image loader');
for (const atlas of Object.values(role2CombatAtlases)) assert.ok(combatBundleKeys.has(atlas.key));
for (const asset of [...Object.values(role2NormalAttackAssets), ...Object.values(role2SkillVisualAssets)]) {
  for (const frameKey of asset.frameKeys) assert.ok(combatBundleKeys.has(frameKey));
}

assert.equal(readRole2HeldFrame(Role2BodyAnimations.hit1!, 0), 36);
assert.equal(readRole2HeldFrame(Role2BodyAnimations.hit1!, 6 * (1000 / 30)), 38);
assert.equal(readRole2HeldFrame(Role2BodyAnimations.hit2!, 6 * (1000 / 30)), 38);
assert.equal(readRole2HeldFrame(Role2BodyAnimations.wait!, 15 * (1000 / 30)), 6);
assert.equal(readRole2HeldFrame(Role2BodyAnimations.wait!, 23 * (1000 / 30)), 9);
assert.equal(projectRole2ShadowFrame('hit1', 9 * (1000 / 30)), 7);
assert.equal(projectRole2ShadowFrame('hit2', 4 * (1000 / 30)), 10);
assert.equal(projectRole2ShadowFrame('hit3', 0), 12);
assert.equal(projectRole2ShadowFrame('hit4', 0), 16);
assert.equal(projectRole2ShadowFrame('hit1', 29 * (1000 / 30)), 0);
assert.equal(getRole2ShadowActionDurationMs('hit1'), 29 * (1000 / 30));
assert.equal(Role2BodyAnimations.hurt?.holds[0], 15);
assert.equal(Role2BodyAnimations.death, undefined, 'Role2 must not invent a death animation');
const chargeState = projectRole2ChargeBarState({
  actionName: 'hit1',
  role2ChargePrepared: true,
  startedAtMs: 100,
  endsAtMs: 1_100,
}, 485, true);
assert.equal(chargeState.visible, true);
assert.equal(chargeState.progress, 0.5);
assert.equal(projectRole2ChargeBarState(undefined, 0, true).visible, false);
assert.equal(projectRole2ChargeBarState({
  actionName: 'hit2',
  role2ChargePrepared: true,
  startedAtMs: 0,
  endsAtMs: 500,
}, 100, true).visible, false);

const viewsSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneViews.ts'), 'utf8');
assert.match(viewsSource, /const frameAsset = role1Asset \?\? role2Asset/);
assert.match(viewsSource, /projectile\.assetKey === Role2CombatAssetKeys\.shadow/);
const manifestSource = readFileSync(path.join(repoRoot, 'src', 'assets', 'AssetManifest.ts'), 'utf8');
assert.doesNotMatch(manifestSource, /role2SkillProjectiles:\s*\{[\s\S]*?status:\s*'missing-original'/);
const visualBridgeSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'Role2CombatVisualBridge.ts'),
  'utf8',
);
assert.match(visualBridgeSource, /rectangle\(anchor\.x, anchor\.y - 70, 50, 9/);
assert.match(visualBridgeSource, /text\(anchor\.x, rootY - 90, '唐僧'/);
assert.match(visualBridgeSource, /fontFamily: '\"FZCuYuan-M03\", sans-serif'/);
assert.match(visualBridgeSource, /strokeThickness: 5/);
assert.match(visualBridgeSource, /setDisplaySize\(48 \* state\.progress, 7\)/);
const testSceneSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'TestScene.ts'), 'utf8');
assert.match(
  testSceneSource,
  /player\.label\.setVisible\(player\.normalAttack\.heroId !== 2 && player\.normalAttack\.heroId !== 3\)/,
);
const bootSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'BootScene.ts'), 'utf8');
assert.match(bootSource, /qaStage'\) === '1-1-role2'/);
assert.match(bootSource, /createFormalDevParty\(2, 1, 2\)/, 'legal 2P QA must place Role2 in P2');

const skillDirectory = path.join(repoRoot, 'public', 'assets', 'combat', 'role2', 'skills');
assert.equal(readdirSync(skillDirectory).length, 11, 'all TangSeng1 effect directories must be present');

console.log('role2 combat visual tests passed');
