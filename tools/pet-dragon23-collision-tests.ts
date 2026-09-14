import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sampleDragonEffectCollision } from '../src/systems/PetDragonEffectCollisionSystem';

const folder = 'docs/tasks/evidence/TASK-SETTINGS-219';
const allowed = JSON.parse(readFileSync(`${folder}/approved-buffer-differences.json`, 'utf8'));
let count = 0;
for (const dataset of ['air-original', 'edge-probe', 'roots-probe']) {
  const report = JSON.parse(readFileSync(`${folder}/${dataset}/measurement.json`, 'utf8'));
  for (const item of report.actual) {
    const result = sampleDragonEffectCollision(item.symbol, item.frame, item.sourceRoot,
      item.sign === 1 ? -1 : 1, item.target);
    const residual = allowed.differences[dataset].find((row: any) => row.id === item.id);
    const correction = residual?.points.reduce((sum: number, point: any) =>
      sum + Number(point.approximation) - Number(point.source), 0) ?? 0;
    assert.equal(result.hit, item.actual, item.id);
    assert.equal(result.pixels, item.cyanPixels + correction, item.id);
    count++;
  }
}
assert.equal(count, 6448);
console.log(`Dragon23 production collision: ${count} native cases, only explicitly approved residuals`);
