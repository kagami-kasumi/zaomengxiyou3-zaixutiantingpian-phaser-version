import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDamageEvent } from '../src/systems/CombatSystem';
import { applyHeroDamage, applyHeroMagicShield } from '../src/systems/HeroCombatSystem';
import { createHeroPartyRuntimeModel, applyHeroPartyEnvironmentHits, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { recordIncomingDamageFeedback } from '../src/systems/IncomingDamageFeedbackSystem';
import { applyOwnedHeroDamage } from '../src/systems/PetBattleOwnershipSystem';
import { createSettlementFixture } from './incoming-settlement-cases';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime, resolveStage1EnemyPetAttack } from '../src/systems/Stage1CombatSystem';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json', 'utf8'));
assert.equal(truth.status, 'verified');
const transfer = truth.behavior.fixtures.find((f: { id: string }) => f.id === 'hero-petturtle-transfer').expected;
const party = (slot: 'p1' | 'p2') => createHeroPartyRuntimeModel([{ slot, heroId: 1, x: 300, y: 400 }]);
const damage = (slot: string, amount: number, attackId = 'attack') => createDamageEvent({ sourceId: 'monster-30', targetId: slot,
  attackId, actionName: 'hit1', amount, attackKind: 'magic', knockbackX: 0, knockbackY: 0, occurredAtMs: 100 });

for (const slot of ['p1', 'p2'] as const) for (const amount of [0, 12, 999]) {
  const model = party(slot); const hero = model.members[0].combat.combat; hero.hp = 200;
  applyHeroDamage(hero, damage(slot, amount), 105);
  const [event] = model.incoming.trace;
  assert.equal(model.incoming.trace.length, 1);
  assert.equal(event.settledDamage, amount);
  assert.equal(event.displayValue, amount, 'lethal display is not clamped to HP decrease');
  assert.equal(event.hpBefore, 200); assert.equal(event.hpAfter, Math.max(0, 200 - amount));
  assert.equal(event.ownerSlot, slot); assert.equal(event.targetKind, 'hero');
  assert.equal(event.sourceId, 'monster-30'); assert.equal(event.attackId, 'attack');
  assert.equal(event.targetId, slot);
  assert.deepEqual(event.worldAnchor, { x: 300, y: 400 });
  assert.equal(event.occurredAtMs, 100); assert.equal(event.settledAtMs, 105);
  const input = { sourceId: event.sourceId, attackId: event.attackId, producerKind: event.producerKind,
    occurredAtMs: 100, settledAtMs: 105, settledDamage: amount, hpBefore: 200, hpAfter: event.hpAfter };
  assert.equal(recordIncomingDamageFeedback(hero.incomingFeedback, input), undefined, 'same producer replay deduplicates');
  recordIncomingDamageFeedback(hero.incomingFeedback, { ...input, producerKind: 'environment-explicit', producerOrdinal: 1 });
  assert.equal(model.incoming.trace.length, 2, 'distinct explicit producer is not collapsed');
  destroyHeroPartyRuntime(model);
  assert.equal(model.incoming.trace.length, 0);
  assert.equal(recordIncomingDamageFeedback(hero.incomingFeedback, { ...input, attackId: 'after-destroy' }), undefined);
}
for (const mode of ['invulnerable', 'full', 'exact', 'shield-zero', 'overflow'] as const) {
  const model = party('p1'); const hero = model.members[0].combat.combat; hero.hp = 200;
  if (mode === 'invulnerable') hero.invulnerableUntilMs = 1000;
  else applyHeroMagicShield(hero, { kind: 'magicUmbrellaDefend', sourceName: 'fixture',
    initialAmount: mode === 'overflow' ? 50 : mode === 'exact' ? 101 : 200,
    remainingAmount: mode === 'overflow' ? 50 : mode === 'exact' ? 101 : 200, totalMs: 1000, remainingMs: 1000 });
  applyHeroDamage(hero, damage('p1', mode === 'shield-zero' ? 0 : 101), 105);
  assert.equal(model.incoming.trace.length, mode === 'overflow' ? 1 : 0, mode);
  if (mode === 'overflow') assert.equal(model.incoming.trace[0].displayValue, 51);
}
for (const slot of ['p1', 'p2'] as const) {
  const model = party(slot); const fixture = createSettlementFixture({ id: 'transfer', heroHp: 105, petHp: 194 }, slot);
  fixture.hero.incomingFeedback = model.members[0].combat.combat.incomingFeedback;
  const pet = fixture.pets[slot === 'p1' ? 0 : 1];
  const petRuntime = createPetRuntime(pet, { x: 500, y: 300, facingX: 1 });
  applyOwnedHeroDamage(fixture.hero, damage(slot, 101), 105, slot, fixture.rosters, petRuntime);
  assert.deepEqual(model.incoming.trace.map(e => [e.producerKind, e.displayValue]), [
    ['turtle-transfer', transfer.petDamage], ['hero-reduce-hp', transfer.heroDamageAfterTransfer],
  ]);
  assert.deepEqual(model.incoming.trace[0].worldAnchor, { x: petRuntime.x, y: petRuntime.y });
  assert.equal(model.incoming.trace[0].ownerSlot, slot);
  assert.notEqual(model.incoming.trace[0].eventId, model.incoming.trace[1].eventId);
}
const environment = party('p2'); environment.members[0].combat.combat.hp = 200;
applyHeroPartyEnvironmentHits(environment, [{ target: 'p2', damage: 46.5, knockbackX: 10,
  bounds: { left: 0, right: 1000 }, deathReason: 'movement-trap',
  source: { hazardId: 'fire-3', attackId: 2, kind: 'fire-thorn', timeMs: 200 } }]);
assert.deepEqual(environment.incoming.trace.map(e => [e.sourceId, e.attackId, e.settledDamage, e.displayValue, e.hpAfter]),
  [['fire-3', 'fire-3:2', 46, 46, 154]]);
for (const slot of ['p1', 'p2'] as const) {
  const model = party(slot); const roster = createSeedPetRoster();
  const pet = roster.pets.find(p => p.isActive)!; pet.hp = 10;
  const runtime = new PetCombatRuntime();
  const frame = { roster, owner: { x: 300, y: 400, facingX: 1 as const }, targets: [], deltaMs: 0,
    incomingFeedback: { model: model.incoming, ownerSlot: slot, timeMs: 300 } };
  const snapshot = runtime.update(frame);
  const enemy = createStage1CombatEnemy({ id: 'pet-attacker', enemyType: 30, x: snapshot.runtime!.x, y: 400 });
  enemy.phase = 'active'; enemy.activeAttack = { attackId: 'pet-hit', actionName: 'hit1', attackKind: 'magic', damage: 99, attackRange: 100 };
  const event = resolveStage1EnemyPetAttack({ runtime: createStage1CombatRuntime(), enemy, timeMs: 250,
    target: { runtimeKey: snapshot.runtime!.runtimeKey, x: snapshot.runtime!.x, defense: 0, hp: pet.hp } })!;
  runtime.update({ ...frame, damageEvents: [event], deltaMs: 1000 / 30 });
  const [feedback] = model.incoming.trace;
  assert.equal(feedback.displayValue, 99); assert.equal(feedback.hpBefore, 10); assert.equal(feedback.hpAfter, 0);
  assert.equal(feedback.targetRuntimeId, snapshot.runtime!.runtimeKey); assert.equal(feedback.ownerSlot, slot);
  assert.equal(feedback.sourceId, 'pet-attacker'); assert.equal(feedback.attackId, 'pet-hit');
  assert.equal(feedback.targetId, pet.id);
  assert.deepEqual(feedback.worldAnchor, { x: snapshot.runtime!.x, y: snapshot.runtime!.y });
  assert.equal(feedback.occurredAtMs, 250); assert.equal(feedback.settledAtMs, 300);
  assert.equal(runtime.snapshot().phase, 'dead-playing');
}
console.log('216B real hero/environment/transfer/pet settlement producers, identity, zero/lethal/shield and disposal passed');
