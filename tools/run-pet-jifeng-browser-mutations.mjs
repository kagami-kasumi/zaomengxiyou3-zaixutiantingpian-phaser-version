import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const out = 'docs/tasks/evidence/TASK-SLICE-253/browser';
mkdirSync(out, { recursive: true });
const results = [];
for (const mutation of ['owner-death', 'scene-exit', 'party-exit', undefined]) {
  const env = { ...process.env }; delete env.PET_JIFENG_BROWSER_MUTATION;
  if (mutation) env.PET_JIFENG_BROWSER_MUTATION = mutation;
  const run = spawnSync(process.execPath, ['tools/run-pet-jifeng-browser.mjs'], { env, encoding: 'utf8', timeout: 180000 });
  if (run.error) throw run.error;
  const log = run.stdout + run.stderr;
  writeFileSync(`${out}/${mutation ?? 'restored'}.log`, log);
  if (mutation) {
    assert.notEqual(run.status, 0, `${mutation} survived`);
    assert.match(log, /AssertionError/);
    assert.doesNotMatch(log, /Surviving browser mutant|Missing mutation anchor/);
    const report = JSON.parse(readFileSync(`${out}/mutation-${mutation}.json`, 'utf8'));
    assert.deepEqual(report.errors, [], 'Runtime errors cannot count as mutation rejection');
    results.push({ mutation, rejected: true });
  } else assert.equal(run.status, 0, log);
}
writeFileSync(`${out}/mutations.json`, JSON.stringify(results, null, 2));
console.log('Three browser lifecycle mutants rejected by behavior; unmodified browser build passed.');
