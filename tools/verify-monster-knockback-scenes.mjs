import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'docs/tasks/evidence/TASK-SLICE-236/';
const reports = [];
for (const level of [11, 12, 13, 21, 22]) {
  const report = JSON.parse(readFileSync(`${root}stage${level}.json`, 'utf8'));
  assert.equal(report.finished, true, `${level}/finished`);
  assert.ok(report.hits.some(h => h.owner === 'p1') && report.hits.some(h => h.owner === 'p2'), `${level}/both owners`);
  assert.ok(report.lifecycle?.find(l => l.action === 'after-retry')?.oldDisposed, `${level}/retry`);
  assert.ok(report.lifecycle?.find(l => l.action === 'after-return')?.allDisposed, `${level}/return`);
  const states = report.frames.flat();
  assert.ok(states.length > 50, `${level}/actual frames`);
  assert.ok(states.every(s => s.displayMatches), `${level}/actual display coordinates`);
  assert.ok(new Set(states.map(s => s.x)).size > 10, `${level}/visible displacement`);
  reports.push({ level, frames: report.frames.length, states: states.length, hits: report.hits.length,
    types: [...new Set(report.models.map(m => m.type))], displayFailures: 0, retryAndReturn: 'passed' });
}
const boss = JSON.parse(readFileSync(`${root}testscene-boss3.json`, 'utf8'));
const bossStates = boss.frames.flat().filter(s => s.type === 3);
assert.ok(bossStates.length > 50 && bossStates.every(s => s.displayMatches));
assert.ok(bossStates.some(s => s.vx > 0) && bossStates.some(s => s.vx < 0), 'legacy Boss receives both directions');
assert.ok(boss.lifecycle.find(l => l.action === 'after-retry')?.oldDisposed);
assert.ok(boss.lifecycle.find(l => l.action === 'after-return')?.allDisposed);
writeFileSync(`${root}scene-verification.json`, JSON.stringify({ status: 'passed', reports, legacyBossStates: bossStates.length,
  scope: 'Real application scenes with controlled progression/hits. Not complete AI/body/death or pet targeting proof.' }, null, 2));
console.log(JSON.stringify(reports));
