import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const base = 'docs/tasks/evidence/';
const rows: { id: string; tests: string[]; evidence: string[] }[] = [];
function cover(ids: string, tests: string[], evidence: string[]) {
  for (const id of ids.split('|')) rows.push({ id, tests: tests.map(t => `tools/${t}.ts`),
    evidence: evidence.map(e => base + e) });
}
cover('owner.body|owner.effects|owner.collision|visual.states|visual.baselines',
  ['pet-dragon-animation-assets-tests', 'pet-dragon1-presentation-tests', 'pet-dragon23-presentation-tests', 'pet-dragon4-presentation-tests'],
  ['TASK-SLICE-214A/handoff.md', 'TASK-SLICE-214C5/visual-diff.json', 'TASK-SLICE-214D/visual-diff.json', 'TASK-SLICE-214E/visual-diff.json']);
cover('runtime.update-order|runtime.follow-owner|runtime.warp|runtime.normal-roll',
  ['pet-ground-session-tests', 'pet-dragon-family-behavior-tests'],
  ['TASK-SLICE-214C3/movement-traces.json', 'TASK-SLICE-214E/family-runtime-traces.json']);
cover('runtime.target-order|runtime.target-loss|runtime.follow-target|runtime.action-priority|runtime.cooldown-order|runtime.death',
  ['pet-dragon-family-behavior-tests'], ['TASK-SLICE-214E/family-runtime-traces.json']);
cover('runtime.hurt', ['pet-dragon1-runtime-tests', 'pet-dragon4-runtime-tests'],
  ['TASK-SLICE-214C4/runtime-traces.json', 'TASK-SLICE-214E/runtime-traces.json']);
cover('runtime.destroy|runtime.p1-p2', ['pet-dragon-family-consumer-tests', 'formal-pet-journey-tests'],
  ['TASK-SLICE-214E/consumer-traces.json']);
cover('runtime.projectile-collision', ['pet-dragon-collision-tests', 'pet-dragon23-collision-tests', 'pet-dragon4-collision-tests'],
  ['TASK-SETTINGS-218/handoff.md', 'TASK-SETTINGS-219/handoff.md', 'TASK-SETTINGS-220/handoff.md']);
cover('runtime.attack-id-dedup|runtime.damage-pipeline|runtime.heal-on-hit',
  ['pet-dragon-damage-tests', 'pet-dragon1-runtime-tests', 'pet-dragon23-runtime-tests', 'pet-dragon4-runtime-tests', 'pet-dragon-family-behavior-tests'],
  ['TASK-SLICE-214C4/runtime-traces.json', 'TASK-SLICE-214D/runtime-traces.json', 'TASK-SLICE-214E/runtime-traces.json', 'TASK-SLICE-214E/family-runtime-traces.json']);
cover('runtime.clone-owner|dragon1.normal|dragon1.fs|dragon1.fs-expiry-heal',
  ['pet-dragon1-runtime-tests', 'pet-dragon1-mutation-tests', 'pet-dragon4-runtime-tests'],
  ['TASK-SLICE-214C4/runtime-traces.json', 'TASK-SLICE-214E/runtime-traces.json']);
cover('dragon2.normal|dragon2.fs|dragon2.sdcc|dragon3.normal|dragon3.fs|dragon3.sdcc|dragon3.ltwj|dragon3.ltwj-nine-object-wave',
  ['pet-dragon23-runtime-tests', 'pet-dragon23-mutation-tests'], ['TASK-SLICE-214D/runtime-traces.json']);
cover('dragon4.normal|dragon4.fs|dragon4.sdcc|dragon4.ltwj|dragon4.qlaoyi|dragon4.qlaoyi-trigger|dragon4.qlaoyi-clones|dragon4.qlaoyi-chain|dragon4.qlaoyi-no-mp-debit|dragon4.cleanup',
  ['pet-dragon4-runtime-tests', 'pet-dragon4-mutation-tests', 'pet-dragon-family-consumer-tests'],
  ['TASK-SLICE-214E/runtime-traces.json', 'TASK-SLICE-214E/mutation-results.json', 'TASK-SLICE-214E/consumer-traces.json']);

const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const declared = readFileSync(base + 'TASK-SLICE-214E/parent-contract.md', 'utf8').match(/CONTRACT_SET:([^\r\n`]+)/)![1]!.split('|');
assert.equal(rows.length, 44); assert.equal(new Set(rows.map(r => r.id)).size, 44);
assert.deepEqual(rows.map(r => r.id).sort(), declared.sort());
const truth = json('docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json');
assert.equal(truth.status, 'verified');
assert.deepEqual(rows.map(r => r.id).sort(), truth.contractMatrix.map((r: any) => r.id).sort());
for (const row of rows) for (const file of [...row.tests, ...row.evidence]) assert.ok(existsSync(file), file);
const family = json(base + 'TASK-SLICE-214E/family-runtime-traces.json');
assert.equal(family.status, 'passed'); assert.equal(family.traces.length, 64);
for (const trace of family.traces) {
  assert.ok(trace.frames.length); assert.equal(trace.cleanup.activeProjectiles, 0);
  assert.equal(trace.cleanup.destroyed, true);
}
const fourth = json(base + 'TASK-SLICE-214E/runtime-traces.json');
assert.equal(fourth.status, 'passed');
assert.equal(fourth.traces.filter((t: any) => t.name.startsWith('qlaoyi:')).length, 16);
const consumers = json(base + 'TASK-SLICE-214E/consumer-traces.json').rows;
assert.equal(consumers.length, 60);
for (const row of consumers) {
  assert.equal(row.remainingDisplays, 0); assert.equal(row.remainingProjectiles, 0);
  assert.ok(row.damage > 0); assert.deepEqual(row.owners, ['p1', 'p2']);
}
const visuals = ['TASK-SLICE-214C5', 'TASK-SLICE-214D', 'TASK-SLICE-214E']
  .map(task => json(`${base}${task}/visual-diff.json`));
assert.deepEqual(visuals.map(v => v.states), [72, 174, 99]);
assert.equal(visuals.reduce((sum, v) => sum + v.states, 0), 345);
assert.ok(visuals.every(v => v.differentPixels === 0));
const mutations = json(base + 'TASK-SLICE-214E/mutation-results.json');
assert.equal(mutations.length, 20); assert.ok(mutations.every((m: any) => m.rejected));
const hashes = Object.fromEntries([...new Set(rows.flatMap(r => r.evidence))].map(file =>
  [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
writeFileSync(base + 'TASK-SLICE-214E/family-contract-audit.json', JSON.stringify({
  status: 'passed', scope: '44 runtime and projection contracts; browser observations are separately recorded in runtime-audit.md',
  truthId: truth.truthId, rows, evidenceSha256: hashes,
  limitations: ['219 four-effect approved approximation retains 104 finite-sample pixel residuals',
    'Source projection baselines are independent renders, not original-game video',
    'Consumer tests execute production closures; actual browser representative is Stage1-2 and TestScene'],
}, null, 2) + '\n');
console.log('Dragon family audit: 44 exact contracts, 64 traces, 60 consumers, 345 visual states, 20 mutation kills');
