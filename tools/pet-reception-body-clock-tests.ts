import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetReceptionBodyClock, type PetReceptionBodyForm } from '../src/systems/PetReceptionBodyClock';

type NativeState = { tick: number; action: string; state: string; x: number; y: number;
  hold: number; key: number; dead: boolean; statics: number; cleanup: number };
type NativeCase = { id: string; states: NativeState[]; ignored?: boolean; mode?: string; baseId?: string };
const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json', 'utf8')) as {
  status: string; clock: NativeCase[]; pause: NativeCase[]; receptions: NativeCase[];
  guards: { id: string; before: NativeState; after: NativeState }[];
};
assert.equal(truth.status, 'verified');
let checkedStates = 0;

function setup(id: string) {
  const fields = id.split(':');
  const form = fields[0] as PetReceptionBodyForm;
  const action = fields.at(-2) as 'hurt' | 'dead', fps = Number(fields.at(-1));
  const guard = fields[1] === 'hit2' ? truth.guards.find(g => g.id === id)! : undefined;
  let dead = false, statics = 0, cleanup = 0;
  const clock = new PetReceptionBodyClock(form, {
    action: guard ? 'hit2' : 'wait', row: guard?.before.y ?? Number(fields[1]),
    column: guard?.before.x ?? Number(fields[2]),
  }, { setStatic: () => { statics++; }, destroy: () => { dead = true; },
    cleanup: kind => { if (kind === 'phoenix-aoyi') cleanup++; } });
  return { clock, action, fps, compare(expected: NativeState, label: string) {
    const s = clock.snapshot();
    assert.deepEqual({ action: s.action, state: s.action, x: s.column, y: s.row,
      hold: s.remainingHoldCount, key: s.keyFrameIndex, dead, statics, cleanup },
    { action: expected.action, state: expected.state, x: expected.x, y: expected.y,
      hold: expected.hold, key: expected.key, dead: expected.dead,
      statics: expected.statics, cleanup: expected.cleanup }, `${label}: tick ${expected.tick}`);
    checkedStates++;
  } };
}

assert.equal(truth.clock.length, 2910);
for (const c of truth.clock) {
  const subject = setup(c.id);
  assert.equal(!subject.clock.select(subject.action), c.ignored, c.id);
  for (const state of c.states) {
    if (state.tick) subject.clock.step(subject.fps);
    subject.compare(state, c.id);
  }
}
assert.equal(truth.pause.length, 228);
for (const c of truth.pause) {
  const subject = setup(c.baseId!);
  if (c.mode === 'pause-before-entry') subject.clock.pause();
  subject.clock.select(subject.action);
  for (const state of c.states) {
    if (state.tick === 3 && c.mode === 'pause-during') subject.clock.pause();
    if (state.tick === (c.mode === 'pause-during' ? 6 : 4)) subject.clock.resume();
    if (state.tick) subject.clock.step(subject.fps);
    subject.compare(state, c.id);
  }
}
assert.equal(truth.receptions.length, 114);
for (const c of truth.receptions) {
  const subject = setup(c.id);
  subject.clock.select(subject.action);
  for (const state of c.states) {
    if (state.tick === 3 && subject.action === 'hurt') subject.clock.repeatHurt();
    if (state.tick) subject.clock.step(subject.fps);
    subject.compare(state, c.id);
  }
}
console.log(`Pet reception body clock: ${checkedStates} native states match (2910 entry, 228 pause, 114 reception traces). HP/protection/cleanup owners are separate gates.`);
