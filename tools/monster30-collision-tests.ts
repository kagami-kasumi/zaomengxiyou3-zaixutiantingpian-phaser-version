import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sampleMonster30Collision } from '../src/systems/Monster30CollisionSystem';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-241/native.json', 'utf8'));
const mismatches: string[] = [];
for (const row of native.cases) {
  const actual = sampleMonster30Collision(row.frame, row.sign, row.sourceRoot, row.profile, row.targetRoot);
  if (actual !== row.hit) mismatches.push(row.id);
}
assert.equal(mismatches.length, 0, JSON.stringify(mismatches.slice(0, 20)));
console.log(`Monster30 production collision: ${native.cases.length} independent native cases, zero Boolean differences`);
