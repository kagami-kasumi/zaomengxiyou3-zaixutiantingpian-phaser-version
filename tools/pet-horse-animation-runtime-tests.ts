import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assertVerifiedPetHorseAnimationTruth,
  getPetHorseBodyActionForProjectile,
  getPetHorseEffectUsage,
  getPetHorseIceEffectAsset,
  petHorseBodyAssets,
  petHorseEffectAssets,
} from '../src/assets/PetHorseAnimationAssets';
import { requireRuntimeAssetOwner } from '../src/systems/AssetBundleCoordinator';

assertVerifiedPetHorseAnimationTruth();
assert.deepEqual(petHorseBodyAssets[1].actions.wait.holds, [2, 2, 2, 3, 2, 4]);
assert.deepEqual(petHorseBodyAssets[2].actions.walk.holds, [4, 4, 4, 4]);
assert.deepEqual(petHorseBodyAssets[3].actions['hit4-bz'].holds, [2, 2, 20]);
assert.deepEqual(petHorseBodyAssets[4].actions['hit5-tmaoyi'].holds, [2, 2, 10]);
assert.equal(petHorseBodyAssets[1].registrationOrigin.x, 41 / 80);
assert.equal(petHorseBodyAssets[4].columns, 6);

assert.equal(getPetHorseBodyActionForProjectile(1, 'pet-skill.horse1.sp'), 'hit2-sp');
assert.equal(getPetHorseBodyActionForProjectile(2, 'pet-skill.horse2.bd'), 'hit2-bd');
assert.equal(getPetHorseBodyActionForProjectile(3, 'pet-skill.horse3.bz'), 'hit4-bz');
assert.equal(getPetHorseBodyActionForProjectile(4, 'pet-skill.horse4.tmaoyi'), 'hit5-tmaoyi');
assert.equal(getPetHorseEffectUsage('pet-skill.horse1.sp')?.asset.symbol, 'PetHorse1Bullet2');
assert.equal(getPetHorseEffectUsage('pet-skill.horse4.tmaoyi')?.asset.frames.length, 8);
assert.equal(getPetHorseEffectUsage('pet-skill.horse4.tmaoyi.explode')?.asset.frames.length, 30);
assert.equal(getPetHorseIceEffectAsset().symbol, 'PetHorseIceEffect');

for (const asset of Object.values(petHorseBodyAssets)) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'combat-common');
  assert.ok(existsSync(path.join(process.cwd(), 'public', asset.path)));
}
for (const asset of Object.values(petHorseEffectAssets)) {
  for (const frame of asset.frames) {
    assert.equal(requireRuntimeAssetOwner(frame.key), 'combat-common');
    assert.ok(existsSync(path.join(process.cwd(), 'public', frame.path)));
  }
}

const testSceneViews = readFileSync('src/scenes/test-scene/TestSceneViews.ts', 'utf8');
assert.ok(testSceneViews.includes("view.kind === 'horse-native'"));
assert.ok(testSceneViews.includes("projectile.assetKey.startsWith('pet-skill.horse')"));
const formalSource = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8');
assert.ok(formalSource.includes('createFormalPetHorseBodyBridge'));
for (const file of [
  'src/scenes/stage12/Stage12GameplayBridge.ts',
  'src/scenes/stage13/Stage13GameplayBridge.ts',
  'src/scenes/stage21/Stage21GameplayBridge.ts',
  'src/scenes/stage22/Stage22GameplayBridge.ts',
]) {
  assert.ok(readFileSync(file, 'utf8').includes('createHeroPartyRuntime'));
}
assert.ok(readFileSync('src/scenes/test-scene/TestScenePetProjectileVisualBridge.ts', 'utf8')
  .includes("'object.shared-ice.active'"));

console.log('pet horse animation runtime tests passed');
