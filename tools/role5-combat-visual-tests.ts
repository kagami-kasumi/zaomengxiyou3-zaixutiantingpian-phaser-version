import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CombatHudAssetKeys,
  getRole5SkillVisualAsset,
  HeroNormalAttackEffectKeys,
  role5NormalAttackAssets,
  role5SkillVisualAssets,
  role5SpearBodyFamilyAssets,
  role5SwordBodyAssets,
  SkillProjectileEffectKeys,
} from '../src/assets/AssetManifest';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import {
  getRole5BodyActionDurationMs,
  readRole5HeldIndex,
  Role5SpearBodyAnimations,
  Role5SwordBodyAnimations,
} from '../src/systems/Role5CombatVisualSystem';

const repoRoot = process.cwd();

function pngDimensions(filePath: string): { width: number; height: number } {
  const bytes = readFileSync(filePath);
  assert.equal(bytes.toString('ascii', 1, 4), 'PNG', `${filePath} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.equal(Object.values(role5SpearBodyFamilyAssets).filter((asset) => asset.form === 'body').length, 13);
assert.equal(Object.values(role5SpearBodyFamilyAssets).filter((asset) => asset.form === 'equipment').length, 12);
for (const asset of Object.values(role5SpearBodyFamilyAssets)) {
  assert.deepEqual(pngDimensions(path.join(repoRoot, 'public', asset.path)), { width: 2800, height: 5950 });
  assert.equal(asset.cellWidth, 350);
  assert.equal(asset.cellHeight, 350);
}

for (const asset of Object.values(role5SwordBodyAssets)) {
  assert.equal(asset.frameKeys.length, asset.framePaths.length);
  for (const framePath of asset.framePaths) {
    const source = readFileSync(path.join(repoRoot, 'public', framePath), 'utf8');
    assert.match(source, /height="290px" width="290px" viewBox="0 0 290 290"/);
  }
}

for (const asset of [...Object.values(role5NormalAttackAssets), ...Object.values(role5SkillVisualAssets)]) {
  assert.equal(asset.frameKeys.length, asset.framePaths.length);
  assert.ok(asset.frameKeys.length > 0);
  for (const framePath of asset.framePaths) {
    assert.ok(existsSync(path.join(repoRoot, 'public', framePath)), `${framePath} must exist`);
  }
}

for (const key of [
  HeroNormalAttackEffectKeys.role5SpearHit1,
  HeroNormalAttackEffectKeys.role5SpearHit2,
  HeroNormalAttackEffectKeys.role5SpearHit3,
  HeroNormalAttackEffectKeys.role5SpearHit4,
  HeroNormalAttackEffectKeys.role5SpearHit5,
  HeroNormalAttackEffectKeys.role5SwordHit1,
  HeroNormalAttackEffectKeys.role5SwordRunHit,
]) assert.ok(key in role5NormalAttackAssets, `${key} must not use an Arc/Text fallback`);
assert.equal(HeroNormalAttackEffectKeys.role5SpearRunMissing, 'normal-attack-effect.hero5.spear.unresolved');

for (const [sourceSymbol, enhanced] of [
  ['sword_mlsz1', false],
  ['sword_mlsz5', false],
  ['sword_mlsz1_1', true],
  ['sword_mlsz5_1', true],
] as const) {
  const asset = getRole5SkillVisualAsset(
    enhanced ? SkillProjectileEffectKeys.role5MlszHit29Enhanced : SkillProjectileEffectKeys.role5MlszHit29,
    sourceSymbol,
  );
  assert.ok(asset, `${sourceSymbol} must resolve to its own true sequence`);
  assert.equal(asset.sourceSymbol, sourceSymbol);
}

for (const key of [
  SkillProjectileEffectKeys.role5XlcHit6,
  SkillProjectileEffectKeys.role5LxuanjHit7_1,
  SkillProjectileEffectKeys.role5XkjzHit10,
  SkillProjectileEffectKeys.role5PkzHit24_1,
  SkillProjectileEffectKeys.role5LxjHit26,
  SkillProjectileEffectKeys.role5LyshCompanion,
  SkillProjectileEffectKeys.role5JrjlCompanion,
  SkillProjectileEffectKeys.role5JrjlShot,
]) assert.ok(getRole5SkillVisualAsset(key, ''), `${key} must not use a placeholder projectile`);

const combatBundleKeys = new Set([
  ...sceneAssetBundles['combat-hero-5'].assets,
  ...sceneAssetBundles['combat-hero-5-skills'].assets,
].map((asset) => asset.key));
for (const asset of [role5SpearBodyFamilyAssets.body0, role5SpearBodyFamilyAssets.equipment0]) {
  assert.ok(combatBundleKeys.has(asset.key));
}
for (const asset of [...Object.values(role5NormalAttackAssets), ...Object.values(role5SkillVisualAssets)]) {
  for (const key of asset.frameKeys) assert.ok(combatBundleKeys.has(key));
}
assert.equal(
  sceneAssetBundles['combat-hero-5'].assets.find((asset) => asset.key === CombatHudAssetKeys.role5Portrait)?.kind,
  'image',
);

assert.equal(readRole5HeldIndex(Role5SpearBodyAnimations.wait!.holds, 0, true), 0);
assert.equal(readRole5HeldIndex(Role5SpearBodyAnimations.wait!.holds, 20 * (1000 / 30), true), 0);
assert.equal(readRole5HeldIndex(Role5SwordBodyAnimations.hit21!.holds, 10 * (1000 / 30), false), 2);
for (const [action, sequence] of Object.entries(Role5SwordBodyAnimations)) {
  assert.equal(
    new Set(sequence.frameKeys).size,
    1,
    `${action} outer frames select clothes and must not rotate appearance with time`,
  );
}
assert.equal(getRole5BodyActionDurationMs('hit4', 'spear'), 23 * (1000 / 30));
assert.equal(getRole5BodyActionDurationMs('hit21', 'sword'), 19 * (1000 / 30));
assert.equal(Role5SpearBodyAnimations.death, undefined, 'Role5 must not invent a death animation');
assert.equal(Role5SwordBodyAnimations.death, undefined, 'Role5 must not invent a death animation');

const manifestSource = readFileSync(path.join(repoRoot, 'src', 'assets', 'AssetManifest.ts'), 'utf8');
assert.doesNotMatch(manifestSource, /role5NormalAttackAnimations:\s*\{[\s\S]*?status:\s*'missing-original'/);
assert.doesNotMatch(manifestSource, /role5NormalAttackEffects:\s*\{[\s\S]*?status:\s*'missing-original'/);
const normalAttackSource = readFileSync(path.join(repoRoot, 'src', 'systems', 'HeroNormalAttackSystem.ts'), 'utf8');
assert.match(normalAttackSource, /Role5Bullet1/);
assert.match(normalAttackSource, /role5SpearRunMissing/);
assert.doesNotMatch(normalAttackSource, /doSingleHit unresolved/);
const bridgeSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'Role5CombatVisualBridge.ts'), 'utf8');
assert.match(bridgeSource, /runtime\.lyshArrows\.created/);
assert.match(bridgeSource, /runtime\.jrjlArrows\.created/);
assert.match(bridgeSource, /input\.combat\.state !== 'dead'/);
assert.doesNotMatch(bridgeSource, /setTint\(/);
const viewsSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'test-scene', 'TestSceneViews.ts'), 'utf8');
const attackVisualSource = readFileSync(
  path.join(repoRoot, 'src', 'scenes', 'HeroNormalAttackVisualBridge.ts'),
  'utf8',
);
assert.match(attackVisualSource, /suppressMissingRole5RunEffect/);
assert.match(viewsSource, /getRole5SkillVisualAsset/);
const hudSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'stage1', 'Stage1CombatHudBridge.ts'), 'utf8');
assert.match(hudSource, /player\.heroId === 5/);
assert.match(hudSource, /CombatHudAssetKeys\.role5Portrait/);
const bootSource = readFileSync(path.join(repoRoot, 'src', 'scenes', 'BootScene.ts'), 'utf8');
assert.match(bootSource, /qaStage'\) === '1-1-role5'/);
assert.match(bootSource, /createFormalDevParty\(2, 1, 5\)/);

console.log('role5 combat visual tests passed');
