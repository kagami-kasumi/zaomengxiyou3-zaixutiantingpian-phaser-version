import assert from 'node:assert/strict';
import { calculateDragonPhysicalDamage, calculateDragonHitHeal,
  refreshDragonDamageCache, consumeDragonDamageCache } from '../src/systems/PetDragonDamageSystem';
import { createStage1CombatRuntime, createStage1CombatEnemy,
  resolveStage1PetHit } from '../src/systems/Stage1CombatSystem';

// Source anchors: BaseBullet refresh 433-458 and hit 300-325;
// BaseMonster physical branch 1387-1400; PetDragon1 addHurt 258-264.
let calls = 0;
const original = refreshDragonDamageCache({ attack: 100, magicAdd: 3.9, gxp: true },
  () => ++calls === 1);
assert.equal(calls, 2);
assert.equal(refreshDragonDamageCache({ attack: 11, magicAdd: 0, gxp: false }, () => false).attack, 30);
assert.deepEqual(original, { hurt: 247, attack: 280, critical: true });
assert.equal(calculateDragonPhysicalDamage(original, 280), 0);
assert.equal(calculateDragonPhysicalDamage(original, 281), 1);
assert.equal(calculateDragonPhysicalDamage(original, 140), 123);
assert.equal(calculateDragonPhysicalDamage({ hurt: 1, attack: 10, critical: false }, 9), 0);
assert.equal(calculateDragonPhysicalDamage({ hurt: 0, attack: 0, critical: false }, 0), 0);
assert.equal(calculateDragonHitHeal(100, 100, 1), 21);
const order: string[] = [];
const next = { hurt: 80, attack: 140, critical: false };
let heals = 0;
const consumed = consumeDragonDamageCache(original, {
  accept: (cached) => {
    order.push('accept-old');
    assert.equal(cached, original);
    assert.equal(calculateDragonPhysicalDamage(cached, 280), 0);
    return true;
  },
  refresh: () => { order.push('refresh'); return next; },
  onAccepted: (cached) => { order.push('heal'); assert.equal(cached, next); heals++; },
});
assert.equal(consumed, next);
assert.equal(heals, 1);
assert.deepEqual(order, ['accept-old', 'refresh', 'heal']);
assert.equal(consumeDragonDamageCache(next, {
  accept: () => false,
  refresh: () => { throw new Error('rejection rerolled damage'); },
  onAccepted: () => { throw new Error('rejection healed'); },
}), next);
const runtime = createStage1CombatRuntime();
const enemy = createStage1CombatEnemy({ id: 'source-zero', enemyType: 2, x: 0, y: 0 });
const request = { runtime, enemy, ownerSlot: 'p2' as const, petId: 'p2-dragon-clone',
  attackId: 'clone:1', actionName: 'hit1', attackKind: 'physics' as const,
  damage: 100, knockbackX: 2, knockbackY: -2, timeMs: 100,
  sourceBullet: { cache: { hurt: 100, attack: 8, critical: false },
    protected: false, dodgeProbability: 0, random: () => 0.5 } };
const hp = enemy.hp;
const acceptedZero = resolveStage1PetHit(request);
assert.ok(acceptedZero);
assert.equal(acceptedZero.amount, 0);
assert.equal(enemy.hp, hp);
assert.equal(acceptedZero.sourceId, 'p2-dragon-clone');
assert.equal(enemy.lastHitBy, 'p2');
assert.equal(runtime.audit.damageEvents.length, 1);
assert.equal(resolveStage1PetHit(request), undefined, 'accepted zero consumes attack ID');
const dodged = { ...request, attackId: 'clone:2',
  sourceBullet: { ...request.sourceBullet, dodgeProbability: 1 } };
assert.equal(resolveStage1PetHit(dodged), undefined);
assert.equal(resolveStage1PetHit({ ...request, attackId: 'clone:2' }), undefined, 'Dodge consumes ID');
const protectedHit = { ...request, attackId: 'clone:3',
  sourceBullet: { ...request.sourceBullet, protected: true } };
assert.equal(resolveStage1PetHit(protectedHit), undefined);
assert.ok(resolveStage1PetHit({ ...request, attackId: 'clone:3' }), 'protection does not consume ID');
assert.equal(resolveStage1PetHit({ ...request, sourceBullet: undefined, attackId: 'old-path' })!.amount, 92,
  'existing pet damage path stays compatible');
console.log('Dragon source damage: cached value, zero damage, critical RNG and accepted-hit ordering passed.');
