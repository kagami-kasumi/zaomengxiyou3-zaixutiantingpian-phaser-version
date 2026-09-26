import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPetNativeFrameReader } from '../src/systems/PetNativeClipClock';

const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/aoyi-world-pause-native.json', 'utf8'));
let checked = 0;
for (const report of source.reports) for (const owner of ['P1', 'P2']) for (const mode of ['natural', 'pause']) {
  let tick = 0;
  const frame = createPetNativeFrameReader(() => tick, 14);
  let removed = false;
  assert.equal(frame(), 1);
  for (const row of report.rows.filter((r: any) => r.id === `AoyiBuff_follow-${owner}-0-${mode}`)) {
    tick = row.tick;
    if (!removed) assert.equal(frame(), row.before.frame, 'phase at entry comes from original native clip');
    if (!row.paused && frame() === 14) removed = true;
    assert.equal(removed, row.state.dead, 'resume cleanup uses native phase, not elapsed combat ticks');
    if (!removed) assert.equal(frame(), row.state.frame);
    checked++;
  }
}
assert.throws(() => createPetNativeFrameReader(() => 0, 0));
console.log(`${checked} original AoyiBuff pause/resume frame and cleanup states matched; helper only, production world port/view not yet claimed.`);
