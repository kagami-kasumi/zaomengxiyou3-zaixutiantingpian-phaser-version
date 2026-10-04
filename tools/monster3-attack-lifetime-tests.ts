import assert from 'node:assert/strict';
import { createMonster3AttackRuntime, stepMonster3AttackBody, destroyMonster3Attacks, syncMonster3BodyState } from '../src/systems/Monster3AttackRuntime';

for (const action of ['hit1', 'hit2'] as const) for (const facingX of [-1, 1] as const) {
  const runtime = createMonster3AttackRuntime();
  const host = { id: 'source', parentId: 'world', x: 300, y: 200, state: action, facingX, attackSerial: 1 };
  const source = { boss: true, hit: 0, criticalPercent: 0, flower: false, magicDefenseReduction: 0, random: () => 0.97 };
  for (let i = 0; i < (action === 'hit1' ? 7 : 6); i++) stepMonster3AttackBody(runtime, host, false, source, i * 1000 / 30, 30, 0);
  assert.equal(runtime.attacks.length, 1);
  const attack = runtime.attacks[0]!;
  for (let i = 0; i < 10; i++) syncMonster3BodyState(runtime, host);
  assert.equal(runtime.attacks.length, 1); assert.equal(attack.age, 0);
  destroyMonster3Attacks(runtime);
  assert.equal(runtime.attacks.length, 0); assert.equal(attack.source, undefined); assert.equal(attack.parentId, undefined);
  assert.equal(attack.frame, 0);
}
console.log('Monster3 live attack destroy/reference cleanup and repeated read-only refresh: both actions/directions passed.');
