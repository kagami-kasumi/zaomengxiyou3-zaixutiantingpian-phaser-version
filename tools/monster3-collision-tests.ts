import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { sampleMonster3Collision } from '../src/systems/Monster3CollisionSystem';

let cases = 0;
let pixels = 0, residuals = 0;
for (const attack of [1, 2] as const) {
  const native = JSON.parse(readFileSync(`docs/tasks/evidence/TASK-SETTINGS-248/attack${attack}/native.json`, 'utf8'));
  const approved = JSON.parse(readFileSync(`docs/tasks/evidence/TASK-SETTINGS-248/attack${attack}/candidate-pixel-differences.json`, 'utf8'));
  const buffer = inflateSync(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-248/attack${attack}/air/buffers.deflate`));
  const mismatches: string[] = [];
  const differences: unknown[] = [];
  for (const row of native.cases) {
    const points: unknown[] = [];
    let visited = 0;
    const actual = sampleMonster3Collision(attack, row.frame, row.sign, row.sourceRoot, row.profile, row.targetRoot, (x, y, candidate) => {
      const offset = y * Math.trunc(row.intersection.width) + x;
      const native = !!(buffer[row.bufferOffset + (offset >> 3)]! & (1 << (offset & 7)));
      if (native !== candidate) points.push({ x, y, native, candidate });
      pixels++; visited++;
    });
    assert.equal(visited, Math.max(0, Math.trunc(row.intersection.width)) * Math.max(0, Math.trunc(row.intersection.height)), row.id + ' ROI');
    if (points.length) {
      differences.push({ ...Object.fromEntries(['id', 'frame', 'sign', 'profile', 'sourceRoot', 'targetRoot', 'intersection'].map(k => [k, row[k]])), points });
      residuals += points.length;
    }
    if (actual !== row.hit) mismatches.push(row.id);
    cases++;
  }
  assert.equal(mismatches.length, 0, JSON.stringify(mismatches.slice(0, 20)));
  assert.deepEqual(differences, approved.differences, `attack${attack} exact approved collision residual tuples`);
}
assert.equal(cases, 140880);
assert.equal(residuals, 451);
console.log(`Monster3 production collision: ${cases} native cases / ${pixels} pixels, zero Boolean differences; exact 451 approved residual pixels.`);
