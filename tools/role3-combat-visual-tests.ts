import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  CombatHudAssetKeys,
  HeroNormalAttackEffectKeys,
  role3CombatAtlases,
  role3NormalAttackAssets,
  role3ShieldBuffAsset,
  role3SkillVisualAssets,
  SkillProjectileEffectKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  getRole3BodyActionDurationMs,
  projectRole3ShieldFrame,
  readRole3HeldFrame,
  Role3BodyAnimations,
} from '../src/systems/Role3CombatVisualSystem';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', role3CombatAtlases.body.path)), {
  width: 1800,
  height: 2800,
});
assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', role3CombatAtlases.equipment.path)), {
  width: 1800,
  height: 2800,
});
assert.equal(Object.keys(role3NormalAttackAssets).length, 3);
assert.equal(Object.keys(role3SkillVisualAssets).length, 12);
assert.equal(
  Object.values(role3NormalAttackAssets).reduce((sum, asset) => sum + asset.frameKeys.length, 0),
  29,
);
assert.equal(
  Object.values(role3SkillVisualAssets).reduce((sum, asset) => sum + asset.frameKeys.length, 0),
  349,
);
assert.equal(role3ShieldBuffAsset.frameKeys.length, 19);

const allRole3FrameAssets = [
  ...Object.values(role3NormalAttackAssets),
  ...Object.values(role3SkillVisualAssets),
  role3ShieldBuffAsset,
];
for (const asset of allRole3FrameAssets) {
  assert.equal(asset.frameKeys.length, asset.framePaths.length);
  assert.ok(Number.isFinite(asset.registrationOrigin.x));
  assert.ok(Number.isFinite(asset.registrationOrigin.y));
  for (const framePath of asset.framePaths) {
    const dimensions = pngDimensions(path.join(repoRoot, 'public', framePath));
    assert.ok(dimensions.width > 0 && dimensions.height > 0, `${framePath} must be non-empty`);
  }
}

for (const key of [
  HeroNormalAttackEffectKeys.role3Hit1,
  HeroNormalAttackEffectKeys.role3Hit2,
  HeroNormalAttackEffectKeys.role3Hit3,
]) {
  assert.ok(key in role3NormalAttackAssets, `${key} must not fall back to Arc/Text placeholders`);
}
for (const key of Object.values(SkillProjectileEffectKeys).filter((candidate) => candidate.includes('role3.'))) {
  if (key === SkillProjectileEffectKeys.role3XgqHit11Cast) continue;
  assert.ok(key in role3SkillVisualAssets, `${key} must not fall back to placeholder projectiles`);
}
assert.equal(
  SkillProjectileEffectKeys.role3XgqHit11Cast in role3SkillVisualAssets,
  false,
  'Role3_hit11 is an audio key and must not gain a standalone visual',
);

const combatBundleKeys = new Set([
  ...sceneAssetBundles['combat-hero-3'].assets,
  ...sceneAssetBundles['combat-hero-3-skills'].assets,
].map((asset) => asset.key));
for (const atlas of Object.values(role3CombatAtlases)) assert.ok(combatBundleKeys.has(atlas.key));
for (const asset of allRole3FrameAssets) {
  for (const frameKey of asset.frameKeys) assert.ok(combatBundleKeys.has(frameKey));
}
assert.equal(
  sceneAssetBundles['combat-hero-3'].assets.find((asset) => asset.key === CombatHudAssetKeys.role3Portrait)?.kind,
  'image',
);

assert.equal(readRole3HeldFrame(Role3BodyAnimations.wait!, 0), 0);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.wait!, 15 * (1000 / 30)), 6);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.wait!, 46 * (1000 / 30)), 11);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.wait!, 47 * (1000 / 30)), 0);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.hit1!, 4 * (1000 / 30)), 38);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.hit2!, 4 * (1000 / 30)), 44);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.hit3!, 6 * (1000 / 30)), 51);
assert.equal(readRole3HeldFrame(Role3BodyAnimations.hit11!, 2 * (1000 / 30)), 29);
assert.equal(getRole3BodyActionDurationMs('hit10'), 32 * (1000 / 30));
assert.equal(Role3BodyAnimations.death, undefined, 'Role3 must not invent a death animation');
assert.equal(projectRole3ShieldFrame(19 * (1000 / 24)), 0);

const viewsSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneViews.ts'),
  'utf8',
);
assert.match(viewsSource, /role3NormalAttackAssets/);
assert.match(viewsSource, /role3SkillVisualAssets/);
assert.match(viewsSource, /role3XgqHit11Cast\) return undefined/);
const manifestSource = readFileSync(path.join(repoRoot, 'src', 'assets', 'AssetManifest.ts'), 'utf8');
assert.doesNotMatch(manifestSource, /role3SkillProjectiles:\s*\{[\s\S]*?status:\s*'missing-original'/);
assert.doesNotMatch(manifestSource, /sourceSymbols:\s*\[[^\]]*'Role3Bullet1'/);
const bridgeSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'Role3CombatVisualBridge.ts'), 'utf8');
assert.match(bridgeSource, /setOrigin\(0\.55, 0\.5\)/);
assert.match(bridgeSource, /facingX > 0 \? 0\.55 : 0\.45/);
assert.match(bridgeSource, /runtime\.shieldTier > 0/);
assert.match(bridgeSource, /ultimate\?\.stage === 'released'/);
assert.doesNotMatch(bridgeSource, /setTint\(/);

const runtimeSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'PlayableLevelRuntime.ts'), 'utf8');
assert.match(runtimeSource, /createHeroCombatVisual\(scene, view, heroId\)/);
for (const stage of ['stage12', 'stage13', 'stage21', 'stage22']) {
  const source = readFileSync(
    path.join(repoRoot, 'src', 'scenes', stage, `${stage[0]!.toUpperCase()}${stage.slice(1)}GameplayBridge.ts`),
    'utf8',
  );
  assert.match(source, /syncHeroCombatVisual/);
}
const hudSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'stage1', 'Stage1CombatHudBridge.ts'), 'utf8');
assert.match(hudSource, /player\.heroId === 3/);
assert.match(hudSource, /CombatHudAssetKeys\.role3Portrait/);
const bootSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'BootScene.ts'), 'utf8');
assert.match(bootSource, /qaStage'\) === '1-1-role3'/);
assert.match(bootSource, /createFormalDevParty\(2, 1, 3\)/);

const skillDirectory = path.join(repoRoot, 'public', 'assets', 'combat', 'role3', 'skills');
assert.equal(readdirSync(skillDirectory).length, 16);

console.log('role3 combat visual tests passed');
