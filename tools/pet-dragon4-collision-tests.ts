import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sampleDragonEffectCollision } from '../src/systems/PetDragonEffectCollisionSystem';

const oracle = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-220/air-original/measurement.json', 'utf8'));
let pixels = 0;
for (const item of oracle.actual) {
  const result = sampleDragonEffectCollision(item.symbol, item.frame, item.sourceRoot,
    item.sign === 1 ? -1 : 1, item.target);
  assert.equal(result.hit, item.actual, item.id);
  assert.equal(result.pixels, item.cyanPixels, item.id);
  pixels += Math.max(0, Math.trunc(item.intersection.width)) * Math.max(0, Math.trunc(item.intersection.height));
}
assert.equal(oracle.actual.length, 11520);
assert.equal(pixels, 78373320);
console.log('Dragon4 production collision: 11520 original inputs / 78373320 pixels, zero residual');
