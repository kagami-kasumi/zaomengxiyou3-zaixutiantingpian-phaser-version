import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assertVerifiedPetMonkeyAnimationTruth,
  getPetMonkeyBodyActionForProjectile,
  getPetMonkeyEffectUsages,
  petMonkeyBodyAssets,
  petMonkeyEffectAssets,
} from '../src/assets/PetMonkeyAnimationAssets';
import { requireRuntimeAssetOwner } from '../src/systems/AssetBundleCoordinator';

assertVerifiedPetMonkeyAnimationTruth();
assert.deepEqual(petMonkeyBodyAssets[1].actions.wait.holds, [2, 2, 2, 2]);
assert.deepEqual(petMonkeyBodyAssets[2].actions.wait.holds, [2, 2, 2, 3, 2, 4]);
assert.deepEqual(petMonkeyBodyAssets[3].actions['hit2-lyq'].holds, [2, 9, 15]);
assert.deepEqual(petMonkeyBodyAssets[4].actions['hit5-jgaoyi'].holds, [2, 2, 2]);
assert.equal(petMonkeyBodyAssets[1].registrationOrigin.x, 27 / 70);
assert.equal(petMonkeyBodyAssets[4].columns, 6);

assert.equal(getPetMonkeyBodyActionForProjectile(1, 'pet-skill.monkey1.xj'), 'hit2-xj');
assert.equal(getPetMonkeyBodyActionForProjectile(2, 'pet-skill.monkey2.lj'), 'hit2-lj');
assert.equal(getPetMonkeyBodyActionForProjectile(4, 'pet-skill.monkey4.jgaoyi'), 'hit5-jgaoyi');
assert.deepEqual(
  getPetMonkeyEffectUsages('pet-skill.monkey2.lj').map((usage) => usage.objectId),
  ['monkey2-lj-prelude', 'monkey2-lj-damage'],
);
assert.deepEqual(
  getPetMonkeyEffectUsages('pet-skill.monkey3.lj').map((usage) => usage.objectId),
  ['monkey3-lj-prelude', 'monkey3-lj-damage'],
);
assert.equal(getPetMonkeyEffectUsages('pet-skill.monkey2.xj')[0]?.asset.symbol, 'PetMonkey1Bullet2');
assert.equal(getPetMonkeyEffectUsages('pet-skill.monkey1.xj')[0]?.loopsForFourSeconds, true);
assert.equal(getPetMonkeyEffectUsages('pet-skill.monkey4.jgaoyi').length, 0);

for (const asset of Object.values(petMonkeyBodyAssets)) {
  assert.equal(requireRuntimeAssetOwner(asset.key), 'combat-common');
  assert.ok(existsSync(path.join(process.cwd(), 'public', asset.path)));
}
for (const asset of Object.values(petMonkeyEffectAssets)) {
  for (const [index, framePath] of asset.framePaths.entries()) {
    assert.equal(requireRuntimeAssetOwner(asset.frameKeys[index]!), 'combat-common');
    assert.ok(existsSync(path.join(process.cwd(), 'public', framePath)));
  }
}

const projectileSource = readFileSync('src/systems/ProjectileSystem.ts', 'utf8');
assert.equal(projectileSource.includes("sourceSymbol: 'PetMonkey2Bullet3'"), false);
assert.equal(projectileSource.includes("runtimeName: 'PetMonkey4Hit5'"), false);
const viewSource = readFileSync('src/scenes/test-scene/TestSceneViews.ts', 'utf8');
assert.ok(viewSource.includes("projectile.assetKey.startsWith('pet-skill.monkey')"));
const formalSource = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8');
assert.ok(formalSource.includes('createFormalPetMonkeyBodyBridge'));
for (const file of [
  'src/scenes/stage12/Stage12GameplayBridge.ts',
  'src/scenes/stage13/Stage13GameplayBridge.ts',
  'src/scenes/stage21/Stage21GameplayBridge.ts',
  'src/scenes/stage22/Stage22GameplayBridge.ts',
]) {
  assert.ok(readFileSync(file, 'utf8').includes('createHeroPartyRuntime'));
}
assert.ok(readFileSync('src/scenes/test-scene/TestScenePetViewBridge.ts', 'utf8')
  .includes('syncPetViewPresentation'));

console.log('pet monkey animation runtime tests passed');
