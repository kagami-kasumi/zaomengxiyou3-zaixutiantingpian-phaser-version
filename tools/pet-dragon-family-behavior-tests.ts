import assert from 'node:assert/strict';
import { writeFileSync } from './write-dragon-evidence';
import { createDragonRuntimeFixture } from './pet-dragon-runtime-fixture';

const traces: unknown[] = [];
for (const form of [1, 2, 3, 4]) for (const owner of ['p1', 'p2'] as const) {
  const make = (skills: string[] = []) => createDragonRuntimeFixture(skills, 24, owner, form, trace => traces.push(trace));
  const range = make(); range.enemy.x = 600;
  const targets = [{ id: range.enemy.id, x: 600, y: range.enemy.y, isAlive: true }];
  let chased = false;
  for (let tick = 0; tick < 400 && !range.combat.audit.damageEvents.length; tick++) {
    const before = range.runtime.snapshot().runtime!;
    const snapshot = range.step({ targets });
    if (snapshot.runtime!.x > before.x) chased = true;
    if (range.runtime.events().some(e => e.type === 'action' && e.action?.type === 'normal')) {
      assert.ok(Math.hypot(before.x - 600, before.y - range.enemy.y) <= 150, `dragon${form} early attack`);
    }
  }
  assert.ok(chased && range.combat.audit.damageEvents.length > 0, `dragon${form} chase -> real HP decrease`);
  assert.equal(range.enemy.lastHitBy, owner);
  assert.equal(range.combat.audit.damageEvents[0]!.sourceId, range.pet.id);
  range.finish('range-hit');

  const flower = make();
  flower.pet.magicFlowerBuff = { attackMultiplier: 1.5, totalMs: 10000, remainingMs: 10000 };
  flower.until(() => flower.combat.audit.damageEvents.length > 0);
  assert.equal(flower.combat.audit.damageEvents[0]!.amount, form === 4 ? 145 : 97,
    'PetDragon4.getRealPower applies BasePet.hurtBaseEffectRate; forms 1..3 do not');
  flower.finish('flower-damage');

  const follow = make();
  follow.frame.targets = [];
  follow.frame.owner = { x: 700, y: 0, facingX: 1 };
  for (let i = 0; i < 25; i++) follow.step();
  assert.ok(follow.runtime.snapshot().runtime!.x > 0, 'owner beyond 640 initiates follow');
  const beforeWarp = follow.runtime.snapshot().groundMotion!;
  follow.frame.owner = { x: 3000, y: 0, facingX: 1 };
  follow.frame.groundEnvironment = { ownerRootOffsetY: 0, walls: [] };
  follow.step();
  assert.equal(beforeWarp.velocityX, 0, 'next owner attempt stops inside 640');
  assert.equal(follow.runtime.snapshot().runtime!.x, 3000);
  assert.equal(follow.runtime.snapshot().runtime!.y, -30 + beforeWarp.velocityY);
  follow.finish('follow-owner-and-warp');

  for (const roll of [0.7, 0.700001]) {
    const rate = make();
    for (let i = 0; i < 25; i++) rate.step({ random: () => roll });
    assert.equal(rate.runtime.snapshot().animation!.action === 'normal', roll === 0.7,
      'constructor-final attackRate is 0.7, not the obsolete field initializer 0.8');
    rate.finish(`normal-roll:${roll}`);
  }

  const priority = make(['fs', 'sdcc', 'ltwj', 'qlaoyi']);
  for (const key of ['dragon1Fs', 'dragon2Sdcc', 'dragon3Ltwj', 'dragon4Qlaoyi'] as const) priority.pet.skillState![key].cooldownMs = 0;
  priority.step(); assert.ok(!priority.runtime.events().some(e => e.type === 'action'));
  priority.step();
  assert.equal(priority.runtime.snapshot().animation!.action, 'fs', 'source slot order takes first eligible skill');
  assert.equal(priority.pet.mp, 980);
  assert.ok(Math.abs(priority.pet.skillState!.dragon1Fs.cooldownMs - (10000 - 1000 / 24)) < 1e-6);
  priority.finish('priority-and-cd-order');

  const sticky = make();
  const ordered = [{ id: 'far-first', x: 600, y: -15, isAlive: true }, { id: 'near-second', x: 90, y: -15, isAlive: true }];
  sticky.step({ targets: ordered }); assert.equal(sticky.runtime.snapshot().target!.id, 'far-first');
  const root = sticky.runtime.snapshot().runtime!;
  const changed = [{ ...ordered[0]!, x: root.x + 1200, y: root.y }, ordered[1]!];
  sticky.step({ targets: changed }); assert.equal(sticky.runtime.snapshot().target, undefined);
  sticky.step({ targets: [ordered[1]!] }); assert.equal(sticky.runtime.snapshot().target!.id, 'near-second');
  sticky.finish('ordered-sticky-loss-next-tick');

  const death = make();
  const key = death.runtime.snapshot().runtime!.runtimeKey;
  death.step({ damageEvents: [{ runtimeKey: key, amount: death.pet.hp }] });
  assert.equal(death.runtime.snapshot().phase, 'dead-playing');
  const cd = death.pet.skillState!.dragon1Fs.cooldownMs;
  for (let i = 0; i < 4; i++) death.step();
  assert.equal(death.pet.skillState!.dragon1Fs.cooldownMs, cd);
  for (let i = 0; i < 30; i++) death.step();
  assert.equal(death.runtime.snapshot().runtime, undefined);
  death.finish('death-animation-and-cd-freeze');
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-214E/family-runtime-traces.json', JSON.stringify({ status: 'passed', traces }, null, 2) + '\n');
console.log('Dragon family: eight range-to-damage chains, ordered targets, loss, priority, CD and death passed');
