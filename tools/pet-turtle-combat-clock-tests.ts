import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { createPetTurtleAnimationClock } from '../src/systems/PetTurtleAnimationClock';

const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const native = JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-222A/body-native.json.gz')).toString());
const contract = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-221/behavior-contract.json', 'utf8'));
let comparisons = 0;
for (const form of [1, 2, 3, 4] as const) {
  const provenance = contract.forms.find((row: any) => row.form === form).source;
  const source = readFileSync(provenance.path);
  assert.equal(createHash('sha256').update(source).digest('hex'), provenance.sha256);
  const text = source.toString('utf8');
  const enter = text.slice(text.indexOf('function enterFrameFunc'), text.indexOf('function beforeSkill1Start'));
  for (const action of ['wait', 'walk', 'hurt', 'hit1', 'hit2', 'dead']) {
    for (const direct of [0, 1]) {
      const clock = createPetTurtleAnimationClock(assets, form);
      clock.select(action, 7);
      const initial = clock.snapshot();
      const observations = native.clocks.filter((row: any) => row.form === form && row.row === initial.row && row.direct === direct);
      assert(observations.length > 1);
      const hitEvents: number[] = [];
      // Last native observation loops the isolated row; production instead routes completion.
      for (const observation of observations.slice(0, -1)) {
        const entered = clock.snapshot();
        assert.equal(entered.column, observation.events[0].column, `${form}/${action}/${observation.tick} column`);
        assert.equal(entered.remainingHoldCount, observation.events[0].count, `${form}/${action}/${observation.tick} countdown`);
        clock.advance(1000 / 24, 24, event => { if (event.eventName === 'hit') hitEvents.push(observation.tick); });
        comparisons++;
      }
      if (action.startsWith('hit')) {
        const branch = enter.split(`case "${action}":`)[1]!.split('break;')[0]!;
        const column = Number(branch.match(/param1\.x == (\d+)/)![1]);
        const remaining = Number(branch.match(/getCurFrameCount\(\) == (\d+)/)![1]);
        const expected = observations.filter((row: any) => row.events[0].column === column && row.events[0].count === remaining).map((row: any) => row.tick);
        assert.deepEqual(hitEvents, expected, `${form}/${action} original enterFrameFunc callback`);
        assert.equal(hitEvents.length, 1);
      } else assert.deepEqual(hitEvents, []);
      assert.equal(clock.snapshot().action, ['hurt', 'hit1', 'hit2'].includes(action) ? 'wait' : action);
    }
  }
  const clock = createPetTurtleAnimationClock(assets, form);
  clock.advance(1000 / 24, 24);
  const before = clock.snapshot();
  clock.select('walk', 1);
  if (form === 1) assert.equal(clock.snapshot().remainingHoldCount, before.remainingHoldCount);
  else assert.equal(clock.snapshot().column, 0);
}
assert.deepEqual([1, 2, 3, 4].map(form => assets.bodyCollision(form)), [
  { width: 31.1, height: 30, registration: { x: 15.55, y: 15 } },
  { width: 35, height: 70, registration: { x: 17.5, y: 35 } },
  { width: 50, height: 100, registration: { x: 25, y: 50 } },
  { width: 50, height: 100, registration: { x: 25, y: 50 } },
]);
assert.throws(() => assets.bodyCollision(0));
console.log(`Turtle combat animation: ${comparisons} native countdown comparisons; 16 source callback cases passed`);
