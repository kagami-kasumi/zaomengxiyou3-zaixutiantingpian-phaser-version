import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  createMonster2AttackRuntime,
  destroyMonster2Attacks,
  enterMonster2AttackDisplay,
  type Monster2Attack,
  type Monster2RawSpawn,
} from '../src/systems/Monster2AttackRuntime';
import { stepMonster2World } from '../src/systems/Monster2WorldStep';
import { createMonster2Selection } from '../src/systems/Monster2Selection';
import { createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';
import {
  createMonster2RawDisplay,
  enterMonster2RawDisplay,
  exitMonster2RawDisplay,
  type Monster2RawDisplay,
} from '../src/systems/Monster2RawDisplay';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-256/phase.json', 'utf8')) as any;
const actualChecks: any[] = [];
let states = 0;

for (const fps of [20, 24, 30]) for (const attack of ['hit1', 'hit2'] as const)
  for (const scenario of ['normal', 'lethal', 'pause', 'destroy-after'] as const) {
    const rows = native.rows.filter((row: any) => row.fps === fps && row.attack === attack && row.scenario === scenario);
    const runtime = createMonster2AttackRuntime();
    const selection = createMonster2Selection(fps, false, 0);
    const host = { id: 'monster2', parentId: 'world', x: 300, y: 200, hp: 100,
      state: attack, facingX: 1 as const, attackSerial: 1 };
    const source = { boss: false, hit: 0, criticalPercent: 0, flower: false,
      magicDefenseReduction: 0, random: () => 0.97 };
    const all: Monster2Attack[] = [];
    const raws: Monster2RawDisplay[] = [];
    const tweens: any[] = [];
    const controls: any[] = [];
    let hits = 0;
    const receive = () => {
      hits++;
      return { accepted: true, missed: false, returnVoid: false, amount: 0, hpBefore: 100, hpAfter: 100 };
    };
    const targets = [
      { hero: { ids: [], receive }, pet: { ids: [], receive } },
      { hero: { ids: [], receive }, pet: { ids: [], receive } },
    ];
    const effects = createMonsterPetTargetEffectState((hurt) => {
      host.hp = Math.max(0, host.hp - (hurt | 0));
      if (host.hp === 0) host.state = 'dead';
    });
    // 256 PhaseProbe injects a controlled one-shot damage service at birth. It
    // does not exercise the natural petmonkey_fire cadence. Keep the real
    // effect clock first, then reproduce that fixture service at the birth tick.
    const originalEffectStep = effects.effects.step.bind(effects.effects);
    let worldTick = 0;
    effects.effects.step = ((frameClips?: number) => {
      originalEffectStep(frameClips);
      if (scenario === 'lethal' && worldTick === birth) {
        host.hp = 0;
        host.state = 'dead';
      }
    }) as typeof effects.effects.step;
    const uid = new Map<Monster2Attack, number>();
    let paused = false;
    const birth = attack === 'hit1' ? 5 : 7;

    const snapshotBullets = () => all.map((item) => ({
      uid: uid.get(item), frame: item.frame, ready: item.frame === 0,
      total: item.frame === 0 ? 0 : item.attack === 1 ? 14 : 20, parentPresent: item.parentId !== undefined,
    }));
    const snapshotVisuals = () => raws.map((item) => ({
      // Raw display has no Phaser playback state; false is the phase
      // projection constant, not proof of a real Phaser pause.
      frame: item.frame, playing: false, total: 14,
      parentPresent: !item.destroyed,
    }));
    const compare = (phase: string, tick: number) => {
      const expected = native.rows.find((item: any) => item.fps === fps && item.attack === attack
        && item.scenario === scenario && item.phase === phase && item.tick === tick);
      assert.ok(expected, `${fps}/${attack}/${scenario}/${phase}/${tick} expected row`);
      assert.deepEqual(snapshotBullets(), expected.bullets, `${fps}/${attack}/${scenario}/${phase}/${tick} bullets`);
      assert.deepEqual(snapshotVisuals(), expected.visuals, `${fps}/${attack}/${scenario}/${phase}/${tick} visuals`);
      assert.deepEqual(tweens, expected.tweens, `${fps}/${attack}/${scenario}/${phase}/${tick} tweens`);
      assert.deepEqual(controls, expected.controls, `${fps}/${attack}/${scenario}/${phase}/${tick} controls`);
      assert.equal(host.hp, expected.hp, `${fps}/${attack}/${scenario}/${phase}/${tick} hp`);
      assert.equal(host.state, expected.body, `${fps}/${attack}/${scenario}/${phase}/${tick} body`);
      assert.equal(hits, expected.hits, `${fps}/${attack}/${scenario}/${phase}/${tick} fixture hits`);
    };

    for (let tick = 1; tick <= 48; tick++) {
      if (!paused) enterMonster2AttackDisplay(runtime);
      for (const raw of raws) enterMonster2RawDisplay(raw);

      if (scenario === 'pause' && tick === birth + 2) {
        paused = true;
        controls.push({ tweens: true, tick, kind: 'pause', delays: true });
      }
      if (scenario === 'pause' && tick === birth + 5) {
        paused = false;
        controls.push({ tick, kind: 'resume' });
      }
      if (scenario === 'destroy-after' && tick === birth + 1) destroyMonster2Attacks(runtime);
      compare('before-world', tick);

      if (!paused && !runtime.destroyed) {
        worldTick = tick;
        stepMonster2World({
          runtime,
          host,
          effects,
          selection,
          source,
          deltaMs: 1000 / fps,
          timeMs: tick * 1000 / fps,
          difficulty: 0,
          targets: (item) => {
            if (!uid.has(item)) uid.set(item, all.length + 1);
            actualChecks.push({ tick, phase: {
              uid: uid.get(item), frame: item.frame, ready: item.frame === 0,
              total: item.frame === 0 ? 0 : item.attack === 1 ? 14 : 20, parentPresent: item.parentId !== undefined,
            } });
            return targets;
          },
          readDecisionTarget: () => undefined,
          ready: () => false,
          afterSelection: () => undefined,
          emitRaw: (spawn: Monster2RawSpawn) => raws.push(createMonster2RawDisplay(spawn)),
          gather: (point) => {
            for (const target of ['p1', 'p2']) tweens.push({ y: point.y, duration: 1, tick, x: point.x, target });
          },
        });
        for (const item of runtime.attacks) if (!all.includes(item)) {
          all.push(item); uid.set(item, all.length);
        }
      }
      compare('after-world', tick);
      for (const raw of raws) exitMonster2RawDisplay(raw);
      compare('exit', tick);
      states += 3;
    }
    destroyMonster2Attacks(runtime);
    assert.equal(runtime.attacks.length, 0, `${fps}/${attack}/${scenario} runtime cleanup`);
  }

assert.deepEqual(actualChecks, native.checks, 'Monster2 native checkAttack sequence');
assert.equal(states, 3456, 'Monster2 phase states');
assert.equal(actualChecks.length, 246, 'Monster2 checkAttack calls');

// Independent production-clock samples; these are not part of the 256 phase
// expected rows and do not claim native fire cadence equivalence.
const fireHurt: number[] = [];
const fire = createMonsterPetTargetEffectState((hurt) => fireHurt.push(hurt));
fire.effects.add({ name: 'petmonkey_fire', time: 1, hurt: 100 });
fire.pendingTicks = 0;
for (let tick = 0; tick < 2; tick++) {
  fire.pendingTicks += 1;
  fire.effects.step(20);
}
assert.deepEqual(fireHurt, [100], 'real petmonkey_fire one-shot clock sample');
const iceVisible: boolean[] = [];
const ice = createMonsterPetTargetEffectState(() => undefined);
ice.effects.add({ name: 'pethorse_ice', time: 2 });
for (let tick = 0; tick < 4; tick++) {
  iceVisible.push(!!ice.effects.snapshot('pethorse_ice'));
  ice.effects.step(20);
}
assert.deepEqual(iceVisible, [true, true, true, false], 'real pethorse_ice stop clock sample');
console.log(`Monster2 attack phase verified: ${states} states and ${actualChecks.length} native detection phases.`);
