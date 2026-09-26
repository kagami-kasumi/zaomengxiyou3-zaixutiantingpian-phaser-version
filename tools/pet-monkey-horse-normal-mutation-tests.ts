import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const result = spawnSync('python', ['tools/pet226-body/normal_mutations.py'], { encoding: 'utf8', timeout: 360000 });
assert.equal(result.status, 0, result.stdout + result.stderr);
console.log(result.stdout.trim());
