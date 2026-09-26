import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const result = spawnSync('python', ['tools/pet226-body/mutations.py'], { encoding: 'utf8' });
assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
console.log(result.stdout.trim());
