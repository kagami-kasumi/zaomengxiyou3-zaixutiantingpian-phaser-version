import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  CombatHudAssetKeys,
  HeroNormalAttackEffectKeys,
  Role4CombatAssetKeys,
  role4BodyFamilyAssets,
  role4MdsBombAsset,
  role4NormalAttackAssets,
  role4SkillVisualAssets,
  role4SpeedUpAsset,
  SkillProjectileEffectKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  getRole4BodyActionDurationMs,
  projectRole4SpeedUpFrame,
  readRole4HeldFrame,
  Role4BodyAnimations,
} from '../src/systems/Role4CombatVisualSystem';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const bodyAssets = Object.values(role4BodyFamilyAssets);
assert.equal(bodyAssets.filter((asset) => asset.form === 'shovel').length, 18);
assert.equal(bodyAssets.filter((asset) => asset.form === 'arrow').length, 18);
assert.equal(bodyAssets.filter((asset) => asset.form === 'equipment').length, 14);
for (const asset of bodyAssets) {
  assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', asset.path)), {
    width: 1200,
    height: 2800,
  });
}

assert.equal(Object.keys(role4NormalAttackAssets).length, 5);
assert.equal(Object.keys(role4SkillVisualAssets).length, 22);
assert.equal(
  Object.values(role4NormalAttackAssets).reduce((sum, asset) => sum + asset.frameKeys.length, 0),
  49,
);
assert.equal(
  Object.values(role4SkillVisualAssets).reduce((sum, asset) => sum + asset.frameKeys.length, 0),
  812,
);
assert.equal(role4MdsBombAsset.frameKeys.length, 20);
assert.equal(role4SpeedUpAsset.frameKeys.length, 16);
assert.equal(49 + 812 + 20 + 16, 897);

const frameAssets = [
  ...Object.values(role4NormalAttackAssets),
  ...Object.values(role4SkillVisualAssets),
  role4MdsBombAsset,
  role4SpeedUpAsset,
];
for (const asset of frameAssets) {
  assert.equal(asset.frameKeys.length, asset.framePaths.length);
  assert.ok(Number.isFinite(asset.registrationOrigin.x));
  assert.ok(Number.isFinite(asset.registrationOrigin.y));
  for (const framePath of asset.framePaths) {
    assert.ok(existsSync(path.join(repoRoot, 'public', framePath)), `${framePath} must exist`);
  }
}

for (const key of [
  HeroNormalAttackEffectKeys.role4ShovelHit1,
  HeroNormalAttackEffectKeys.role4ShovelHit2,
  HeroNormalAttackEffectKeys.role4ShovelHit3,
  HeroNormalAttackEffectKeys.role4ArrowHit1,
  HeroNormalAttackEffectKeys.role4ArrowHit3,
]) assert.ok(key in role4NormalAttackAssets, `${key} must not use an Arc/Text fallback`);

for (const key of Object.values(SkillProjectileEffectKeys).filter((value) => value.includes('role4.'))) {
  assert.ok(key in role4SkillVisualAssets, `${key} must not use a placeholder projectile`);
}

const combatBundleKeys = new Set([
  ...sceneAssetBundles['combat-hero-4'].assets,
  ...sceneAssetBundles['combat-hero-4-skills'].assets,
].map((asset) => asset.key));
  for (const asset of [
    role4BodyFamilyAssets.shovel0,
    role4BodyFamilyAssets.arrow0,
    role4BodyFamilyAssets.equipment0,
    role4BodyFamilyAssets.equipment4,
  ]) assert.ok(combatBundleKeys.has(asset.key));
for (const asset of frameAssets) {
  for (const key of asset.frameKeys) assert.ok(combatBundleKeys.has(key));
}
assert.equal(
  sceneAssetBundles['combat-hero-4'].assets.find((asset) => asset.key === CombatHudAssetKeys.role4Portrait)?.kind,
  'image',
);

assert.equal(readRole4HeldFrame(Role4BodyAnimations.shovel.wait!, 0), 0);
assert.equal(readRole4HeldFrame(Role4BodyAnimations.shovel.wait!, 90 * (1000 / 30)), 6);
assert.equal(readRole4HeldFrame(Role4BodyAnimations.shovel.hit3!, 5 * (1000 / 30)), 48);
assert.equal(readRole4HeldFrame(Role4BodyAnimations.arrow.hit3!, 10 * (1000 / 30)), 47);
assert.equal(getRole4BodyActionDurationMs('hit12', 'shovel'), 18 * (1000 / 30));
assert.equal(getRole4BodyActionDurationMs('hit12', 'arrow'), 50 * (1000 / 30));
assert.equal(Role4BodyAnimations.shovel.death, undefined, 'Role4 must not invent a death animation');
assert.equal(projectRole4SpeedUpFrame(16 * (1000 / 24)), 0);

const manifestSource = readFileSync(path.join(repoRoot, 'src', 'assets', 'AssetManifest.ts'), 'utf8');
assert.doesNotMatch(manifestSource, /role4NormalAttackEffects:\s*\{[\s\S]*?status:\s*'missing-original'/);
assert.doesNotMatch(manifestSource, /role4FinisherProjectiles:\s*\{[\s\S]*?status:\s*'missing-original'/);
const viewsSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneViews.ts'), 'utf8');
const attackVisualSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'HeroNormalAttackVisualBridge.ts'),
  'utf8',
);
assert.match(attackVisualSource, /role4NormalAttackAssets/);
assert.match(viewsSource, /role4SkillVisualAssets/);
const pipelineSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneHeroSkillPipeline.ts'),
  'utf8',
);
assert.match(pipelineSource, /event\.source !== 'poison-bomb'/);
assert.match(pipelineSource, /role4MdsBombAsset\.frameKeys/);
const bridgeSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'Role4CombatVisualBridge.ts'), 'utf8');
assert.match(bridgeSource, /facingX > 0 \? 0\.575 : 0\.425/);
assert.match(bridgeSource, /speedEffectRemainingMs > 0/);
assert.doesNotMatch(bridgeSource, /setTint\(/);
const hudSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'stage1', 'Stage1CombatHudBridge.ts'), 'utf8');
assert.match(hudSource, /player\.heroId === 4/);
assert.match(hudSource, /CombatHudAssetKeys\.role4Portrait/);
const bootSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'BootScene.ts'), 'utf8');
assert.match(bootSource, /qaStage'\) === '1-1-role4'/);
assert.match(bootSource, /createFormalDevParty\(2, 1, 4\)/);
assert.equal(readdirSync(path.join(repoRoot, 'public', 'assets', 'combat', 'role4', 'skills')).length, 27);
assert.equal(Role4CombatAssetKeys.shovelBody0, role4BodyFamilyAssets.shovel0.key);
assert.equal(Role4CombatAssetKeys.arrowBody0, role4BodyFamilyAssets.arrow0.key);
assert.equal(Role4CombatAssetKeys.shovelEquipment0, role4BodyFamilyAssets.equipment0.key);
assert.equal(Role4CombatAssetKeys.arrowEquipment4, role4BodyFamilyAssets.equipment4.key);

console.log('role4 combat visual tests passed');
