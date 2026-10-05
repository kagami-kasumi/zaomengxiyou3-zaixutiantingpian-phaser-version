import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMonster2AttackRuntime, destroyMonster2Attacks, monster2AttackRequest, syncMonster2BodyState,
  type Monster2Attack } from '../src/systems/Monster2AttackRuntime';
import { createStage12Flow, removeStage12Monster2 } from '../src/systems/Stage12FlowSystem';
import { createMonster2RawDisplay } from '../src/systems/Monster2RawDisplay';
import { createMonster2Selection } from '../src/systems/Monster2Selection';
import { stepMonster2World } from '../src/systems/Monster2WorldStep';
import { createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';

type AnyRecord = Record<string, any>;
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as AnyRecord;
const baseline = read('docs/tasks/evidence/TASK-SETTINGS-256/source-baseline.json');
const holds: Record<string, number[]> = {
  hit1: [2, 2, 15, 16], hit2: [2, 2, 2, 14],
  hurt: [15], dead: [2, 2, 2, 2, 2, 7],
};

let cases = 0;
let states = 0;
let rawCallbacks = 0;
let gatherCallbacks = 0;

for (const row of baseline.rows as AnyRecord[]) {
  const attack = row.attack as 'hit1' | 'hit2';
  const birth = attack === 'hit1' ? 5 : 7;
  const initialAction = ['dead-before'].includes(row.scenario) ? 'dead'
    : ['hurt-before'].includes(row.scenario) ? 'hurt' : attack;
  const serial = initialAction === 'hit1' ? 1 : initialAction === 'hit2' ? 2 : 0;
  const host: AnyRecord = {
    id: `${row.owner}:${row.scenario}:${row.fps}:${row.direct}`, parentId: 'body-fixture',
    x: 300, y: 200, hp: row.scenario === 'dead-before' ? 0 : row.scenario === 'hurt-before' ? 99 : 100,
    state: initialAction,
    facingX: row.direct === 0 ? -1 : 1, attackSerial: serial,
  };
  const runtime = createMonster2AttackRuntime();
  const selection = createMonster2Selection(row.fps, false, 0);
  const source = { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
    flower: false, random: () => 0.97 };
  const effects = createMonsterPetTargetEffectState(hurt => {
    host.hp = Math.max(0, host.hp - hurt);
    if (host.hp === 0) host.state = 'dead';
  });
  let timeMs = 0;
  let expectedRaw = 0;
  let expectedGather = 0;
  let rawSeen = 0;
  let gatherSeen = 0;
  const seenAttacks: Monster2Attack[] = [];
  const seenAttackIds = new Set<string>();
  const seenGatherPoints: AnyRecord[] = [];
  let fixtureEffectApplied = false;
  const hits: AnyRecord[] = [], attempts: AnyRecord[] = [];
  const rawDisplays: ReturnType<typeof createMonster2RawDisplay>[] = [];
  const flow = createStage12Flow(1);
  let removed = false;
  const targetIds = new Map<string, string[]>();
  const playerIds = row.owner === 'both' ? ['p1', 'p2'] : [row.owner];
  syncMonster2BodyState(runtime, host);

  if (row.scenario === 'frozen-before' || row.scenario === 'thaw') {
    effects.effects.add({ name: 'pethorse_ice', time: 999 });
    effects.effects.step(); effects.iceVisible = true;
  }
  if (row.scenario === 'destroy-before') destroyMonster2Attacks(runtime);

  for (let index = 0; index < row.states.length; index++) {
    const state = row.states[index];
    const tick = index + 1;
    const paused = row.scenario === 'pause-after' && tick >= birth + 2 && tick <= birth + 4;

    // 256's controlled body fixture writes these service inputs at the
    // designated tick; it does not claim the live PetTargetEffects fire
    // cadence. Keep the real effect implementation covered separately.
    fixtureEffectApplied = false;
    if (row.scenario === 'hurt-after' && tick === birth + 1) { host.hp--; host.state = 'hurt'; }
    if (row.scenario === 'dead-after' && tick === birth + 1) { host.hp = 0; host.state = 'dead'; }
    if (row.scenario === 'hurt-cut' && tick === birth + 1) {
      host.hp--; host.state = 'hurt';
      for (const attack of seenAttacks) attack.hurtCanCutDownEffect = true;
    }
    if (row.scenario === 'destroy-after' && tick === birth + 1) destroyMonster2Attacks(runtime);
    if (row.scenario === 'repeat-action' && tick === 40) { host.attackSerial++; host.state = attack; }
    // Config.isStopGame in the low-level fixture does not stop Monster2's
    // body clock; it only changes the world-side service path. The modern
    // world step therefore receives an ordinary body tick here.

    const rawAtStart = rawSeen;
    const gatherAtStart = gatherSeen;
    const deltaMs = paused ? 0 : 1000 / row.fps;
    timeMs += deltaMs;
    stepMonster2World({
      runtime, host, effects, selection, source, deltaMs, timeMs, difficulty: 0,
      registeredAttacksPaused: row.scenario === 'low-level-pause' && tick >= birth+2 && tick <= birth+4,
      targets: attackRef => playerIds.map((owner: string) => {
        const target = (id: string) => {
          if (!targetIds.has(id)) targetIds.set(id, []);
          return { ids: targetIds.get(id)!, receive: () => {
            const event = { tick, uid: seenAttacks.indexOf(attackRef)+1, target: id };
            attempts.push(event);
            const accepted = row.scenario !== 'target-reject';
            if (accepted) hits.push({ ...event, x: attackRef.x, y: attackRef.y, sourceDead: host.hp <= 0 });
            return { accepted, missed: false, returnVoid: false, amount: 0, hpBefore: 0, hpAfter: 0 };
          } };
        };
        return { hero: target(owner), pet: target(owner+'-pet') };
      }), readDecisionTarget: () => {
        // This callback is reached after the body's beforeEffects callback and
        // PetTargetEffects.step, but before selection and syncBody(0). It is
        // the controlled Probe service boundary for HP/ice writes.
        if (!fixtureEffectApplied && tick === birth) {
          if (row.scenario === 'lethal-emission') { host.hp = 0; host.state = 'dead'; }
          if (row.scenario === 'nonlethal-emission') host.hp = 99;
          if (row.scenario === 'freeze-emission') effects.iceVisible = true;
          fixtureEffectApplied = true;
        }
        // Probe writes thaw before the world call, but the service's hide is
        // observed by the body clock at the end of this controlled step.
        if (row.scenario === 'thaw' && tick === 2) effects.effects.cancel();
        return undefined;
      }, ready: () => false,
      afterSelection: () => {},
      emitRaw: spawn => {
        rawCallbacks++; rawSeen++; assert.equal(spawn.parentId, 'body-fixture');
        rawDisplays.push(createMonster2RawDisplay(spawn));
        const original = state.visuals[rawSeen - 1];
        assert(original, 'original naked MC birth');
        assert.deepEqual([spawn.x, spawn.y, spawn.facingX === -1 ? 1 : -1],
          [original.x, original.y, original.scaleX], `${row.scenario} raw birth root/direction`);
      },
      gather: point => {
        gatherCallbacks++; gatherSeen++;
        for (const target of (row.owner === 'both' ? ['p1', 'p2'] : [row.owner]))
          seenGatherPoints.push({ tick, target, duration: 1, x: point.x, y: point.y });
      },
    });
    {
      const expectedAction = state.action as string;
      assert.equal(runtime.body.action, expectedAction,
        `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} action tick=${tick}`);
      assert.equal(runtime.body.frameIndex, state.bodyFrame,
        `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} frame tick=${tick}`);
      const definition = holds[expectedAction];
      if (definition) assert.equal(definition[runtime.body.frameIndex]! - runtime.body.frameTick, state.hold,
        `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} hold tick=${tick}`);
    }
    const expectedCreated = state.created;
    expectedRaw = state.visuals.length;
    expectedGather = attack === 'hit2' ? state.tweens.length : 0;
    for (const attackRef of runtime.attacks) {
      if (seenAttackIds.has(attackRef.id)) continue;
      seenAttackIds.add(attackRef.id); seenAttacks.push(attackRef);
      // Original synchronous Probe manually sets ages[newBullet]=1, then
      // inspectFrame(++age) before each world call. Native ENTER timing is
      // independently covered by monster2-attack-phase-tests.
      attackRef.age = 1;
      const expectedBullet = state.bullets.find((bullet: AnyRecord) =>
        bullet.uid === seenAttacks.length);
      assert(expectedBullet, `${row.scenario} missing source bullet ${seenAttacks.length}`);
      assert.deepEqual({ x: attackRef.x, y: attackRef.y,
        facingX: attackRef.facingX, interval: attackRef.reception.interval,
        sourceId: attackRef.sourceId, sourcePresent: !!attackRef.source },
      { x: expectedBullet.x, y: expectedBullet.y,
        facingX: row.direct === 0 ? -1 : 1, interval: 999,
        sourceId: host.id, sourcePresent: true },
      `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} attack root`);
      const request = monster2AttackRequest(attackRef, timeMs, row.fps, 0);
      assert.equal(request.attackKind, 'physics', 'Monster2 attack kind');
      assert.equal(request.actionName, 'hit1', 'Monster2 attack action');
    }
    assert.equal(seenAttacks.length, expectedCreated,
      `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} created tick=${tick}`);
    if (row.scenario === 'destroy-before' || (row.scenario === 'destroy-after' && tick >= birth + 1)) {
      assert.equal(rawSeen, rawAtStart,
        `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} destroyed body emitted raw callback tick=${tick}`);
      assert.equal(gatherSeen, gatherAtStart,
        `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} destroyed body emitted gather callback tick=${tick}`);
    } else if (attack === 'hit1') {
      assert.equal(seenAttacks.length, expectedCreated, 'registered attack creation count');
    } else {
      assert.equal(rawSeen, expectedRaw, `${row.scenario} raw callback count tick=${tick}`);
      assert.equal(seenGatherPoints.length, expectedGather, `${row.scenario} gather request count tick=${tick}`);
      assert.deepEqual(seenGatherPoints, state.tweens,
        `${row.fps}/${attack}/${row.scenario}/${row.owner}/${row.direct} gather schedule tick=${tick}`);
    }
    if (paused) {
      assert.equal(rawSeen, rawAtStart, 'pause advanced raw callback');
      assert.equal(gatherSeen, gatherAtStart, 'pause advanced gather callback');
    }
    if (runtime.destroyed && !removed) {
      removed = true; removeStage12Monster2(flow, host.id, row.owner === 'p1', []);
    }
    const actualBullets = seenAttacks.map((bullet, index) => ({
      count: bullet.reception.count, ready: !bullet.parentId, scaleX: bullet.facingX === -1 ? 1 : -1,
      parentPresent: !!bullet.parentId, action: 'hit1', sourcePresent: !!bullet.source,
      interval: bullet.reception.interval, total: bullet.parentId ? (bullet.attack === 1 ? 14 : 20) : 0,
      frame: bullet.frame, x: bullet.x, y: bullet.y, uid: index+1,
    }));
    assert.deepEqual(actualBullets, state.bullets, `${row.scenario}/${attack}@${tick} complete bullet records`);
    assert.equal(runtime.attacks.length, state.enrolled, `${row.scenario}@${tick} enrollment`);
    assert.equal(runtime.destroyed, state.ready, `${row.scenario}@${tick} source ready`);
    assert.equal(Number(!runtime.destroyed), state.worldCount, `${row.scenario}@${tick} retained source`);
    assert.equal(flow.doorVisible, state.door, `${row.scenario}@${tick} source door`);
    assert.equal(host.hp, state.hp, `${row.scenario}@${tick} fixture HP`);
    assert.equal(effects.iceVisible, state.frozen, `${row.scenario}@${tick} stopped body clock`);
    assert.equal(hits.length, state.hits, `${row.scenario}@${tick} cumulative accepted hits`);
    assert.deepEqual(rawDisplays.map(raw => ({ frame: raw.frame, parentPresent: !!raw.parentId,
      x: raw.x, y: raw.y, scaleX: raw.facingX === -1 ? 1 : -1 })), state.visuals,
      `${row.scenario}@${tick} raw display (no ENTER in synchronous fixture)`);
    host.x += 1;
    states++;
  }
  assert.deepEqual(attempts, row.attempts, `${row.scenario}/${attack} complete attempt schedule`);
  assert.deepEqual(hits, row.hits.map((event: AnyRecord) => Object.fromEntries(
    ['tick','uid','target','x','y','sourceDead'].map(key => [key,event[key]]))), `${row.scenario}/${attack} hits`);
  cases++;
}

assert.equal(cases, 648, 'Monster2 body fixtures');
assert.equal(states, 45360, 'Monster2 body states');
console.log(`Monster2 body contract: ${cases} fixtures / ${states} states; raw=${rawCallbacks}, gather=${gatherCallbacks}.`);
