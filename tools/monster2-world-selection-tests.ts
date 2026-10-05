import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMonster2Selection } from '../src/systems/Monster2Selection';
import { createMonster2AttackRuntime } from '../src/systems/Monster2AttackRuntime';
import { stepMonster2World } from '../src/systems/Monster2WorldStep';
import { createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';

type AnyRecord = Record<string, any>;
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as AnyRecord;
const baseline = read('docs/tasks/evidence/TASK-SETTINGS-256/selection-baseline.json');

let cases = 0;
let states = 0;
let rawSpawns = 0;
let gatherRequests = 0;

for (const row of baseline.rows.filter((candidate: AnyRecord) =>
  ['natural', 'normal', 'pause'].includes(candidate.scenario))) {
  const initialState = row.states[0];
  const firstInput = initialState.before;
  const selection = createMonster2Selection(row.fps, row.boss, row.difficulty);
  selection.count = row.scenario === 'natural' ? 0 : row.fps - 1;
  selection.cooldown = row.scenario === 'natural' ? row.fps : row.scenario === 'normal' ? row.fps * 20 : 0;
  const runtime = createMonster2AttackRuntime();
  const effects = createMonsterPetTargetEffectState(() => {});
  let inSelection = false;
  const source = {
    boss: row.boss, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
    flower: false,
    random: () => {
      if (!inSelection) return 0.97;
      const expected = row.states[currentTick]?.random ?? [];
      return expected[randomIndex++];
    },
  };
  const currentTarget: AnyRecord = targetFor(row, firstInput);
  const host: {
    id: string; parentId: string; x: number; y: number; hp: number;
    state: any; facingX: -1 | 1; attackSerial: number;
  } = {
    id: `${row.owner}:${row.scenario}`, parentId: 'selection-fixture', x: 300, y: 200,
    hp: row.init.hp, state: firstInput.action,
    facingX: firstInput.direct === 0 ? -1 : 1, attackSerial: firstInput.serial,
  };
  let currentTick = 0;
  let randomIndex = 0;
  let elapsedMs = 0;

  for (let index = 0; index < row.states.length; index++) {
    currentTick = index;
    randomIndex = 0;
    const expected = row.states[index];
    const before = expected.before;
    const target = currentTarget;
    const rawBefore = rawSpawns;
    const gatherBefore = gatherRequests;
    const paused = row.scenario === 'pause' && index >= 2 && index <= 4;
    const deltaMs = paused ? 0 : 1000 / row.fps;
    elapsedMs += deltaMs;
    stepMonster2World({
      runtime, host, effects, selection, source, deltaMs, timeMs: elapsedMs,
      difficulty: row.difficulty, targets: () => [], readDecisionTarget: () => { inSelection = true; return target; },
      ready: () => false, afterSelection: () => { inSelection = false; },
      emitRaw: () => { rawSpawns++; }, gather: () => { gatherRequests++; },
    });

    assert.deepEqual({ action: host.state, cd: selection.cooldown, count: selection.count,
      serial: host.attackSerial, direct: host.facingX === -1 ? 0 : 1 },
    { action: expected.after.action, cd: expected.after.cd, count: expected.after.count,
      serial: expected.after.serial, direct: expected.after.direct },
    `${row.fps}/${row.owner}/${row.scenario} selection tick=${expected.tick}`);
    assert.equal(runtime.body.action, host.state,
      `${row.fps}/${row.owner}/${row.scenario} body/selection action tick=${expected.tick}`);
    assert.equal(randomIndex, expected.random.length,
      `${row.fps}/${row.owner}/${row.scenario} random calls tick=${expected.tick}`);
    if (paused) {
      assert.equal(selection.count, index === 0 ? expected.after.count : row.states[index - 1].after.count,
        `${row.fps}/${row.owner}/${row.scenario} paused count tick=${expected.tick}`);
      assert.equal(rawSpawns, rawBefore, 'raw callback during pause');
      assert.equal(gatherRequests, gatherBefore, 'gather callback during pause');
    }
    states++;
  }
  cases++;
}

assert(cases > 0, 'no natural/normal/pause fixtures selected');
assert.equal(cases, 108, 'Monster2 continuous fixtures');
assert.equal(states, 21312, 'Monster2 continuous states');
console.log(`Monster2 continuous world selection: ${cases} fixtures / ${states} states; raw=${rawSpawns}, gather=${gatherRequests}.`);

function targetFor(row: AnyRecord, state: AnyRecord): AnyRecord {
  return {
    x: 300 + (row.direct === 0 ? -row.x : row.x), y: 200 + row.y,
    dead: row.scenario === 'target-dead' && state.target === (row.owner === 'p2' ? 'p2' : 'p1'),
  };
}
