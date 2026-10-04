import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const output = 'docs/tasks/evidence/TASK-SLICE-249B/display-mutations';
mkdirSync(output, { recursive: true });
const results = [];
for (const mutation of ['display-origin', 'display-alpha', 'display-direction', 'display-frame']) {
  const env = { ...process.env, M3_SCENE: 'TestScene', M3_FPS: '30', M3_MODE: 'normal', M3_VISUAL: '1',
    M3_VISUAL_MUTATION: mutation, M3_VERIFY_SCENE: 'TestScene', PET_RECEPTION_SCENE: '', PET_RECEPTION_VISUAL: '' };
  const capture = spawnSync(process.execPath, ['tools/run-monster3-browser.mjs'], { encoding: 'utf8', timeout: 180000, env });
  assert.equal(capture.status, 0, capture.stdout + capture.stderr);
  const verification = spawnSync('python', ['tools/monster3-collision/verify_display.py'], { encoding: 'utf8', timeout: 60000, env });
  assert.notEqual(verification.status, 0, `${mutation}: production mutant survived`);
  assert.match(verification.stderr, /AssertionError/);
  writeFileSync(`${output}/${mutation}.log`, verification.stdout + verification.stderr);
  results.push({ mutation, captured: true, rejectedByNativeGeometryOrPixels: true });
}
writeFileSync(`${output}/report.json`, JSON.stringify({ status: 'passed', results }, null, 2));
console.log('Four compiled production Monster3 display mutants captured and rejected against native baselines.');
