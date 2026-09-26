import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import source from '../src/assets/pet-monkey-target-fire.json';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';

assert.equal(source.symbol, 'FireBuff');
assert.equal(source.frames.length, 20);
for (const [index, frame] of source.frames.entries()) {
  assert.equal(frame.frame, index + 1);
  const bytes = readFileSync(`public/${frame.path}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), frame.sha256);
  assert.equal(bytes.readUInt32BE(16), frame.width);
  assert.equal(bytes.readUInt32BE(20), frame.height);
  assert.equal(frame.crop.left, -100);
  assert.equal(frame.crop.top, -100);
  assert.ok(sceneAssetBundles['pet-monkey-horse'].assets.some(asset => asset.key === frame.key && asset.path === `/${frame.path}`));
}
console.log('20 native FireBuff rasters and production bundle membership passed; no timing or world-view claim.');
