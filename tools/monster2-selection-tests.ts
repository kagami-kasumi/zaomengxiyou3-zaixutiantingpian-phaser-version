import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createMonster2Selection, stepMonster2Selection } from '../src/systems/Monster2Selection';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as any;
const baseline = read('docs/tasks/evidence/TASK-SETTINGS-256/selection-baseline.json');
let decisionStates = 0;

for (const row of baseline.rows) {
  const initial = createMonster2Selection(row.fps, row.boss, row.difficulty);
  assert.equal(initial.count, row.init.count, `${row.scenario} initial count`);
  assert.equal(initial.cooldown, row.init.cd, `${row.scenario} initial cooldown`);
  assert.equal(initial.rate, row.init.rate, `${row.scenario} initial rate`);

  for (let index = 0; index < row.states.length; index++) {
    const state = row.states[index];
    const input = state.body ?? state.before;
    const selection = { ...initial, count: input.count, cooldown: input.cd };
    const host = {
      x: 300,
      y: 200,
      hp: input.hp,
      state: input.action,
      facingX: (input.direct === 0 ? -1 : 1) as -1 | 1,
      attackSerial: input.serial,
    };
    let randomCalls = 0;
    // Independent fixture input (selection.py), not the observed expected stream.
    const consumed: number[] = [];
    const random = () => {
      const value = ++randomCalls === 1 ? 0.97 : row.roll;
      consumed.push(value);
      return value;
    };
    const target = input.target === null ? undefined : {
      x: 300 + (row.direct === 0 ? -row.x : row.x),
      y: 200 + row.y,
      dead: row.scenario === 'target-dead' && input.target === (row.owner === 'p2' ? 'p2' : 'p1'),
    };

    if (state.body !== null) {
      stepMonster2Selection(selection, host, target, input.frozen, input.ready, random);
    }

    assert.deepEqual(consumed, state.random, `${row.scenario} tick=${state.tick} random stream`);
    assert.equal(randomCalls, state.random.length, `${row.scenario} tick=${state.tick} random calls`);
    assert.deepEqual([
      host.state,
      selection.cooldown,
      selection.count,
      host.attackSerial,
      host.facingX === -1 ? 0 : 1,
    ], [
      state.after.action,
      state.after.cd,
      state.after.count,
      state.after.serial,
      state.after.direct,
    ], `${row.scenario} tick=${state.tick}`);
    decisionStates++;
  }
}

assert.equal(baseline.rows.length, 1764, 'Monster2 selection cases');
assert.equal(decisionStates, 27936, 'Monster2 selection states');
console.log(`Monster2 selection verified: ${baseline.rows.length} cases / ${decisionStates} decision states.`);
