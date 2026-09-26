/** Shared physics only: native action flags are inputs, family/Session mapping is separate. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { groundMotionComparison } from './pet-monkey-horse-ground-preflight';

const report = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/ground-native.json', 'utf8')) as {
  sources: { path: string; fileSha256: string }[];
  sourceSwf: { path: string; sha256: string };
  configurations: { truthPath: string; truthSha256: string }[];
};
const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
for (const source of report.sources) assert.equal(hash(source.path), source.fileSha256);
assert.equal(hash(report.sourceSwf.path), report.sourceSwf.sha256);
for (const config of report.configurations) assert.equal(hash(config.truthPath), config.truthSha256);
assert.equal(groundMotionComparison.quantize, false, 'No diagnostic postprocessing may hide production coordinates');
assert.equal(groundMotionComparison.totalStates, 25920);
assert.equal(groundMotionComparison.failedStates, 0, JSON.stringify(groundMotionComparison.counts));
console.log('25920 original static-wall movement states matched production physics with native collider/action inputs; family integration excluded.');
