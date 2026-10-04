import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createMonster3AttackRuntime, stepMonster3AttackBody,
  pauseMonster3AttackDisplay, destroyMonster3Attacks, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';
import { advanceMonsterPetTargetEffects, createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';
import { createMonster3Selection, stepMonster3Selection } from '../src/systems/Monster3Selection';
import { stepMonster3World } from '../src/systems/Monster3WorldStep';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-247/phase.json', 'utf8'));
const actualChecks: { tick: number; frame: number; total: number }[] = [];
let states = 0;
for (const fps of [20, 24, 30]) for (const action of ['hit1', 'hit2'] as const) for (const scenario of ['normal', 'lethal', 'pause']) {
  const rows = native.rows.filter((r: any) => r.fps === fps && r.attack === action && r.scenario === scenario && r.phase === 'after-world');
  const runtime = createMonster3AttackRuntime();
  const host = { id: 'monster3', parentId: 'world', x: 300, y: 200, hp: 100, state: action as any, facingX: 1 as const, attackSerial: 1 };
  const source = { boss: false, hit: 0, criticalPercent: 0, flower: false, magicDefenseReduction: 0, random: () => 0.97 };
  const effects = createMonsterPetTargetEffectState(() => { throw new Error('No effect damage expected in native phase fixture'); });
  const selection = createMonster3Selection(fps, false, 0);
  const birth = action === 'hit1' ? 7 : 6;
  const all: Monster3Attack[] = [];
  for (let tick = 1; tick <= 30; tick++) {
    if (scenario === 'pause' && tick === birth + 2) pauseMonster3AttackDisplay(runtime);
    if (!(scenario === 'pause' && tick >= birth + 2 && tick <= birth + 4)) {
      stepMonster3World({ runtime, host, effects, selection, source,
        timeMs: tick * 1000 / fps, deltaMs: 1000 / fps, difficulty: 0,
        targets: attack => {
          actualChecks.push({ tick, frame: attack.frame, total: attack.action === 'hit1' ? 5 : 10 }); return [];
        }, readDecisionTarget: () => undefined, ready: () => false,
        afterSelection: () => {
          if (scenario === 'lethal' && tick === birth) host.state = 'dead';
        },
      });
      for (const attack of runtime.attacks) if (!all.includes(attack)) all.push(attack);
    }
    const row = rows[tick - 1];
    assert.deepEqual(all.map(a => [a.frame, !!a.parentId]), row.bullets.map((b: any) => [b.frame, b.parentPresent]), `${fps}/${action}/${scenario}/${tick}`);
    states++;
  }
  destroyMonster3Attacks(runtime);
  assert(all.every(a => !a.parentId && !a.source));
  const count = all.length;
  stepMonster3AttackBody(runtime, host, false, source, 2000, fps, 0);
  assert.equal(runtime.attacks.length, 0); assert.equal(count, 1);
}
assert.deepEqual(actualChecks, native.checks.map((c: any) => ({ tick: c.tick, frame: c.phase.frame, total: c.phase.total })));
assert.equal(actualChecks.length, 135);
console.log(`Monster3 production attack clock: ${states} after-world states and all 135 native detection phases; source-death retention / pause / destroy.`);

// Exercise the actual shared effect accumulator: AI must run after EACH effect
// tick, rather than once after all catch-up ticks. Expiry permits AI immediately
// while the body's expiry tick remains stopped.
for (const fps of [20, 24, 30]) {
  const host = { x: 0, y: 0, hp: 100, state: 'wait', facingX: 1 as -1 | 1, attackSerial: 0 };
  const effects = createMonsterPetTargetEffectState(amount => { host.hp -= amount; });
  const selection = createMonster3Selection(fps, false, 0);
  selection.cooldown = 0;
  effects.effects.add({ name: 'pethorse_ice', time: 1 });
  const observations: unknown[] = [];
  advanceMonsterPetTargetEffects(effects, 3000 / fps, fps,
    stopped => observations.push(['body', stopped, host.state]),
    () => {
      stepMonster3Selection(selection, host, { x: 100, y: 0, dead: false },
        !!effects.effects.snapshot('pethorse_ice'), false, () => 0.97);
      observations.push(['ai', selection.count, host.state, selection.cooldown]);
    });
  assert.deepEqual(observations, [
    ['body', false, 'wait'], ['ai', 1, 'wait', 0],
    ['body', true, 'wait'], ['ai', 2, 'hit2', 4 * fps - 1],
    ['body', false, 'hit2'], ['ai', 3, 'hit2', 4 * fps - 2],
  ], `effect expiry/catch-up order at ${fps}fps`);
  const before = observations.length;
  advanceMonsterPetTargetEffects(effects, 0, fps,
    () => observations.push('unexpected body'), () => observations.push('unexpected ai'));
  assert.equal(observations.length, before, 'read-only refresh must not run world callbacks');

  const lethal = createMonsterPetTargetEffectState(amount => { host.hp -= amount; host.state = 'dead'; });
  host.state = 'wait'; selection.cooldown = 0;
  lethal.effects.add({ name: 'petmonkey_fire', time: 1, hurt: 100 });
  let draws = 0;
  advanceMonsterPetTargetEffects(lethal, 1000 / fps, fps, () => assert.equal(host.hp, 100),
    () => stepMonster3Selection(selection, host, { x: 100, y: 0, dead: false }, false, false,
      () => { draws++; return 0; }));
  assert.equal(host.hp, 0);
  assert.equal(host.state, 'dead');
  assert.equal(draws, 0, 'same-tick lethal effect must prevent natural selection');
}
console.log('Monster3 shared world clock: per-tick effect expiry, catch-up AI/CD, lethal effects and zero-delta refresh passed.');
