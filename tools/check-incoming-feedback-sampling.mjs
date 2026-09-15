import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const files=['display-verification.json','implementation-mutations.json','display-comparison.png'];
const root='docs/tasks/evidence/TASK-SLICE-216A/';
const hashes=files.map(f=>createHash('sha256').update(readFileSync(root+f)).digest('hex'));
const browser=spawnSync(process.execPath,['tools/run-incoming-feedback-browser.mjs','--mutation'],{encoding:'utf8',windowsHide:true});
assert.equal(browser.status,0,browser.stderr);
const verifier=spawnSync('python',['tools/verify-incoming-feedback-display.py','--mutation'],{encoding:'utf8',windowsHide:true});
assert.notEqual(verifier.status,0,'disabled sampling escaped browser pixel gate');
assert.match(verifier.stderr,/raster mismatch/,'mutation must fail on actual rendered pixels');
assert.deepEqual(files.map(f=>createHash('sha256').update(readFileSync(root+f)).digest('hex')),hashes,
  'negative run must not overwrite any normal report');
writeFileSync(root+'sampling-mutation.json',JSON.stringify({
  killed:'disabled native bitmap sampling',failure:'actual WebGL/Canvas raster mismatch',
  normalReportsUnchanged:true,files,
},null,2)+'\n');
console.log('216A: native sampling implementation mutation killed by browser pixels; normal reports unchanged');
