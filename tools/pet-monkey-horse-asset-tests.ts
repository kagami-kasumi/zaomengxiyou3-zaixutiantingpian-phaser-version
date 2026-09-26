import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type Phaser from 'phaser';
import { monkeyHorseCollisionAsset } from '../src/assets/PetMonkeyHorseCollisionPackage';
import { discardIncompleteMonkeyHorseAssets, hasMonkeyHorseAssets, prepareMonkeyHorseAssets,
  requireMonkeyHorseAssets } from '../src/scenes/PetMonkeyHorseAssetBridge';

const bytes = readFileSync(`public${monkeyHorseCollisionAsset.path}`);
function fixture(input = bytes) {
  const copy = Uint8Array.from(input);
  const entries = new Map<string, ArrayBuffer>([[monkeyHorseCollisionAsset.key, copy.buffer]]);
  const scene = { cache: { binary: {
    get: (key: string) => entries.get(key), remove: (key: string) => entries.delete(key),
  } } } as unknown as Phaser.Scene;
  return { scene, entries };
}

const ready = fixture();
assert.equal(hasMonkeyHorseAssets(ready.scene), false);
assert.throws(() => requireMonkeyHorseAssets(ready.scene), /not ready/);
await prepareMonkeyHorseAssets(ready.scene, () => false);
assert.equal(hasMonkeyHorseAssets(ready.scene), true);
const loaded = requireMonkeyHorseAssets(ready.scene);
await prepareMonkeyHorseAssets(ready.scene, () => false);
assert.equal(requireMonkeyHorseAssets(ready.scene), loaded, 'one decoded owner per cache');
discardIncompleteMonkeyHorseAssets(ready.scene);
assert.equal(ready.entries.size, 1, 'successful shared resources survive cleanup');

const cancelled = fixture();
await assert.rejects(prepareMonkeyHorseAssets(cancelled.scene, () => true), /cancelled/);
assert.equal(hasMonkeyHorseAssets(cancelled.scene), false);
discardIncompleteMonkeyHorseAssets(cancelled.scene);
assert.equal(cancelled.entries.size, 0);
assert.equal(requireMonkeyHorseAssets(ready.scene), loaded, 'shutdown in another cache cannot release ready assets');

const corrupt = Buffer.from(bytes); corrupt[20] ^= 1;
const failed = fixture(corrupt);
await assert.rejects(prepareMonkeyHorseAssets(failed.scene, () => false), /integrity mismatch/);
assert.equal(hasMonkeyHorseAssets(failed.scene), false);
discardIncompleteMonkeyHorseAssets(failed.scene);
assert.equal(failed.entries.size, 0);
console.log('Monkey/horse collision asset readiness, cache ownership, shutdown and corrupt-byte rejection passed.');
