import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { writeFileSync } from './write-dragon-evidence';
import { createDragonRuntimeFixture } from './pet-dragon-runtime-fixture';
import { createPetDragonAnimationClock } from '../src/systems/PetDragonAnimationClock';

const traces: unknown[] = [];
function setup(skills: string[], fps = 24, owner: 'p1' | 'p2' = 'p1') {
  return createDragonRuntimeFixture(skills, fps, owner, 4, trace => traces.push(trace));
}

// Independent AS3 anchors: PetDragon4 initBBDC/enterFrameFunc, remaining counts rather than render FPS.
for (const fps of [20, 24, 30]) {
  for (const [action, total, hits] of [['normal', 25, [5]], ['fs', 18, [17]], ['sdcc', 30, [7]],
    ['ltwj', 34, [15]], ['qlaoyi', 48, [1, 13, 25, 37]]] as const) {
    const clock = createPetDragonAnimationClock(4); clock.select(action, 8);
    const events = clock.advance(total * 1000 / fps, fps);
    assert.deepEqual(events.filter(e => e.eventName === 'hit').map(e => e.elapsedHostTick), hits);
    assert.deepEqual(events.filter(e => e.eventName === 'complete').map(e => e.elapsedHostTick), [total]);
  }
  const s = setup([], fps);
  s.until(() => s.combat.audit.damageEvents.length > 0);
  const normal = s.named('dragon4-normal-emitted')[0];
  assert.equal(normal.tick, fps + 5);
  assert.equal(normal.event.behaviorEvent.payload.x, 65);
  assert.equal(normal.event.behaviorEvent.payload.y, Math.trunc(s.runtime.snapshot().runtime!.y * 20) / 20 - 15);
  assert.equal(s.pet.hp, 200, 'type0 normal has no healing callback');
  assert.equal(s.combat.audit.damageEvents[0]!.amount, 97);
  s.finish('normal');
}

for (const owner of ['p1', 'p2'] as const) for (const skills of [[], ['fs'], ['sdcc'], ['ltwj'],
  ['fs', 'sdcc'], ['fs', 'ltwj'], ['sdcc', 'ltwj'], ['fs', 'sdcc', 'ltwj']]) {
  const s = setup(['qlaoyi', ...skills], 24, owner);
  s.pet.mp = 30;
  // Keep inherited cooldowns closed to isolate the qlaoyi gate, without directly invoking a skill.
  for (const key of ['dragon1Fs', 'dragon2Sdcc', 'dragon3Ltwj'] as const) s.pet.skillState![key].cooldownMs = 100000;
  s.pet.skillState!.dragon4Qlaoyi.cooldownMs = 0;
  s.until(() => s.named('dragon4-qlaoyi-cast').length > 0);
  const cast = s.tick();
  const root = s.runtime.snapshot().runtime!;
  const startY = root.y, startX = root.x;
  assert.equal(s.pet.mp, 30);
  assert.equal(s.named('dragon4-qlaoyi-emitted').length, 1, 'trigger first enter even without fs');
  const trigger = s.projectiles.projectiles.find(p => p.sourceSymbol === 'PetDragonBullet4')!;
  assert.equal(trigger.actionName, 'hit4'); assert.equal(trigger.destroyWhenSourceHurt, false);
  for (let i = 0; i < 47; i++) s.step();
  const clones = s.named('dragon4-clone-spawned');
  assert.deepEqual(clones.map(e => e.tick - cast + 1), skills.includes('fs') ? [1, 13, 25, 37] : []);
  if (clones.length) {
    assert.deepEqual(clones.map(e => e.event.behaviorEvent.payload.facingX), [-1, 1, -1, 1]);
    const copied = clones[0].event.behaviorEvent.payload;
    assert.equal(copied.hp, 4000); assert.equal(copied.maxHp, 80000);
    assert.equal(copied.mp, 2970); assert.equal(copied.maxMp, 294030);
    assert.deepEqual(copied.skills, ['qlaoyi', ...skills]);
    assert.ok(s.runtime.snapshot().summons!.every(c => c.sourcePetId === s.pet.id));
    if (skills.includes('sdcc')) {
      for (const clone of clones) {
        const key = clone.event.behaviorEvent.payload.handle.runtimeKey;
        const initial = s.events.find(e => e.event.runtimeKey === key && e.event.type === 'action');
        assert.equal(initial.event.action.type, 'sdcc');
        const emitted = s.named('dragon4-sdcc-emitted').find(e => e.event.runtimeKey === key);
        assert.equal(emitted.tick - clone.tick, 7, 'child starts stepping the host tick after birth');
        assert.equal(emitted.event.behaviorEvent.payload.facingX, clone.event.behaviorEvent.payload.facingX);
      }
    }
  }
  const snapshot = s.runtime.snapshot();
  assert.equal(snapshot.runtime!.y, startY - 47 * 5, 'qlaoyi enters assign vertical velocity before integration');
  if (skills.includes('sdcc')) assert.equal(snapshot.animation!.action, 'sdcc');
  else if (skills.includes('ltwj')) assert.equal(snapshot.animation!.action, 'qlaoyi-ltwj-link');
  else assert.equal(snapshot.animation!.action, 'wait');
  assert.equal(s.pet.mp, 30, 'owner free chain never debits MP');
  assert.equal(trigger.petHostTick, 47);
  s.step(); assert.equal(trigger.isExpired, true, '48th collision precedes expiry');
  assert.ok(s.combat.audit.damageEvents.some(e => e.actionName === 'hit4' && e.sourceId === s.pet.id && e.amount === 624));
  assert.ok(!s.named('dragon4-hit-heal').some(e => e.event.behaviorEvent.payload.action === 'qlaoyi'));
  if (skills.includes('ltwj')) {
    s.until(() => s.named('dragon4-ltwj-emitted').some(e => e.event.sourcePetId === s.pet.id && !e.event.parentRuntimeKey));
    for (let i = 0; i < 22; i++) s.step();
    assert.equal(s.named('dragon4-ltwj-emitted').filter(e => !e.event.parentRuntimeKey).length, 9);
    assert.equal(s.pet.mp, 30);
  }
  assert.ok(Number.isFinite(startX));
  s.finish(`qlaoyi:${skills.join('+') || 'trigger-only'}`);
}

// Source range gate and ordered-first selection run through public Runtime, with a real enemy at a distance.
for (const owner of ['p1', 'p2'] as const) {
  const s = setup([], 24, owner);
  s.enemy.x = 600;
  const targets = [{ id: s.enemy.id, x: s.enemy.x, y: s.enemy.y, isAlive: true }];
  let approached = false;
  for (let i = 0; i < 400 && !s.combat.audit.damageEvents.length; i++) {
    const before = s.runtime.snapshot().runtime!;
    s.step({ targets });
    const snap = s.runtime.snapshot();
    if (snap.runtime!.x > before.x) approached = true;
    const normal = s.runtime.events().find(e => e.type === 'action' && e.action?.type === 'normal');
    if (normal) assert.ok(Math.hypot(before.x - s.enemy.x, before.y - s.enemy.y) <= 150);
  }
  assert.ok(approached && s.combat.audit.damageEvents.length > 0);
  assert.equal(s.enemy.lastHitBy, owner);
  s.finish('range-to-real-hit');
}

// Enter-frame state replacement must decrement the new row this tick (BaseBitmapDataClip.step:473-477).
{
  const clock = createPetDragonAnimationClock(4); clock.select('qlaoyi-ltwj-link', 1);
  clock.advance(1000 / 24, 24, event => { if (event.eventName === 'enter') clock.select('ltwj', 2); });
  assert.equal(clock.snapshot().action, 'ltwj'); assert.equal(clock.snapshot().remainingHoldCount, 1);
  const events = clock.advance(14 * 1000 / 24, 24);
  assert.equal(events.find(e => e.eventName === 'hit')?.elapsedHostTick, 15);
}

for (const reason of ['expired', 'dead'] as const) {
  const s = setup(['fs']);
  s.until(() => s.named('dragon4-clone-spawned').length > 0);
  const child = s.runtime.snapshot().summons![0]!;
  s.pet.skills = [];
  if (reason === 'expired') {
    for (let i = 0; i < 287; i++) s.step();
    assert.equal(s.runtime.snapshot().summons!.length, 1);
    s.step();
  } else s.step({ damageEvents: [{ runtimeKey: child.runtime.runtimeKey, amount: child.hp }] });
  assert.equal(s.runtime.snapshot().summons!.length, 0);
  assert.equal(s.named('dragon4-clone-removal-heal').length, 1);
  assert.equal(s.pet.hp, 236);
  s.finish(`fs:${reason}`);
}

const hurt = setup(['qlaoyi', 'fs', 'sdcc', 'ltwj']);
for (const key of ['dragon1Fs', 'dragon2Sdcc', 'dragon3Ltwj'] as const) hurt.pet.skillState![key].cooldownMs = 100000;
hurt.pet.skillState!.dragon4Qlaoyi.cooldownMs = 0;
hurt.until(() => hurt.named('dragon4-qlaoyi-emitted').length > 0);
const trigger = hurt.projectiles.projectiles.find(p => p.sourceSymbol === 'PetDragonBullet4')!;
hurt.step({ damageEvents: [{ runtimeKey: hurt.runtime.snapshot().runtime!.runtimeKey, amount: 1 }] });
assert.equal(hurt.runtime.snapshot().animation!.action, 'hurt');
assert.equal(trigger.isExpired, false);
for (let i = 0; i < 55; i++) hurt.step();
assert.equal(hurt.named('dragon4-clone-spawned').length, 1, 'hurt cancels remaining clone callbacks');
assert.ok(!hurt.named('dragon4-free-chain').some(e => !e.event.parentRuntimeKey), 'hurt clears owner chain flag');
hurt.finish('hurt');

mkdirSync('docs/tasks/evidence/TASK-SLICE-214E', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-214E/runtime-traces.json', JSON.stringify({ status: 'passed', traces }, null, 2) + '\n');
console.log('Dragon4 Runtime: clocks, 16 P1/P2 combinations, real damage, gate-only MP, clone removal and hurt passed');
