import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const output = 'docs/tasks/evidence/TASK-SLICE-255/visual/mutations';
mkdirSync(output, { recursive: true });
const results = [];
for (const mutation of ['direction', 'registration']) {
  const capture = spawnSync(process.execPath, ['tools/run-monster3-browser.mjs'], { encoding: 'utf8', timeout: 180000,
    env: { ...process.env, M3_SCENE: 'TestScene', M3_FPS: '30', M3_MODE: 'normal',
      PET_RECEPTION_SCENE: '', PET_RECEPTION_VISUAL: '1', PET_RECEPTION_MUTATION: mutation } });
  assert.equal(capture.status, 0, capture.stdout + capture.stderr);
  const verification = spawnSync('python', ['tools/verify-pet-reception-visual.py', `TestScene/mutations/${mutation}`],
    { encoding: 'utf8', timeout: 60000 });
  assert.notEqual(verification.status, 0, `${mutation}: production mutant survived`);
  assert.match(verification.stderr, /AssertionError.*mouse1-dead-r3-x0-d0/);
  writeFileSync(`${output}/${mutation}.log`, verification.stdout + verification.stderr);
  results.push({ mutation, captured: true, rejectedByNativePixels: true });
}
writeFileSync(`${output}/report.json`, JSON.stringify({ status: 'passed', results }, null, 2));
console.log('Two compiled production display mutants captured and rejected by native pixel comparison.');
