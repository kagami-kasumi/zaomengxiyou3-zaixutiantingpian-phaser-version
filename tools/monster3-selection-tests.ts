import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMonster3Selection, stepMonster3Selection } from '../src/systems/Monster3Selection';
import { createMonster3AttackRuntime, stepMonster3AttackBody, syncMonster3BodyState } from '../src/systems/Monster3AttackRuntime';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const truth = read('docs/reverse-engineering/reference/monster3-natural-attack-contract.json');
const baseline = read('docs/tasks/evidence/TASK-SETTINGS-250/baseline.json');
const bodyTruth = read('docs/reverse-engineering/reference/monster3-body-attack-contract.json');
let decisionStates = 0, continuousStates = 0;
for (let i = 0; i < baseline.rows.length; i++) {
  const row = baseline.rows[i], expected = truth.expectedCases[i];
  assert.deepEqual(expected.input, [row.fps, row.boss, row.direct, row.owner, row.scenario, row.difficulty, row.roll]);
  const initial = createMonster3Selection(row.fps, row.boss, row.difficulty);
  assert.equal(initial.cooldown, row.init.cd); assert.equal(initial.rate, row.init.rate);
  for (let j = 0; j < row.states.length; j++) {
    const state = row.states[j], body = state.body ?? state.before, e = expected.states[j];
    const selection = { ...initial, count: body.count, cooldown: body.cd };
    const host = { x: 300, y: 200, hp: body.hp, state: body.action,
      facingX: (body.direct === 0 ? -1 : 1) as -1 | 1, attackSerial: body.serial };
    let randomCalls = 0;
    if (state.body !== null) stepMonster3Selection(selection, host, body.target === null ? undefined : {
      x: 300 + (row.direct === 0 ? -row.x : row.x), y: 200 + row.y,
      dead: row.scenario === 'target-dead' && body.target === (row.owner === 'p2' ? 'p2' : 'p1'),
    }, body.frozen, body.ready, () => ++randomCalls === 1 ? 0.97 : row.roll);
    assert.deepEqual([host.state, selection.cooldown, selection.count, host.attackSerial,
      host.facingX === -1 ? 0 : 1, randomCalls], [e[1], e[2], e[3], e[4], e[5], e[7]], `${expected.input} tick=${j + 1}`);
    decisionStates++;
  }
  // A separate continuous production body+selection run; no resetting from source body observations.
  if (!['natural', 'normal', 'pause'].includes(row.scenario)) continue;
  const selection = { ...initial, count: row.states[0].before.count, cooldown: row.states[0].before.cd };
  const runtime = createMonster3AttackRuntime();
  const host = { id: 'monster3', parentId: 'world', x: 300, y: 200, hp: row.init.hp,
    state: 'wait' as any, facingX: (row.direct === 0 ? -1 : 1) as -1 | 1, attackSerial: 0 };
  const source = { boss: row.boss, hit: 0, criticalPercent: 0, flower: false, magicDefenseReduction: 0, random: () => 0.97 };
  for (let j = 0; j < expected.states.length; j++) {
    const e = expected.states[j]; let randomCalls = 0;
    if (!(row.scenario === 'pause' && j >= 2 && j <= 4)) {
      stepMonster3AttackBody(runtime, host, false, source, j * 1000 / row.fps, row.fps, row.difficulty);
      for (const attack of runtime.attacks) {
        const contract = bodyTruth.attacks[attack.action];
        assert.equal(attack.x, 300 + attack.facingX * contract.offsetX);
        assert.equal(attack.y, 200 + contract.offsetY);
        assert.equal(attack.facingX, row.direct === 0 ? -1 : 1);
        assert.equal(attack.reception.interval, contract.interval);
      }
      host.state = runtime.body.action;
      stepMonster3Selection(selection, host, { x: 300 + (row.direct === 0 ? -row.x : row.x), y: 200 + row.y, dead: false },
        false, false, () => ++randomCalls === 1 ? 0.97 : row.roll);
      syncMonster3BodyState(runtime, host);
    }
    assert.deepEqual([host.state, selection.cooldown, selection.count, host.attackSerial,
      host.facingX === -1 ? 0 : 1, randomCalls, runtime.attacks.length],
    [e[1], e[2], e[3], e[4], e[5], e[7], e[8]], `continuous ${expected.input} tick=${j + 1}`);
    continuousStates++;
  }
}
console.log(`Monster3 production selection: ${baseline.rows.length} cases / ${decisionStates} decision states; ${continuousStates} continuous body+selection states.`);
