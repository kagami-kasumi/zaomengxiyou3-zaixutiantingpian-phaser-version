import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyOwnedHeroDamage } from '../src/systems/PetBattleOwnershipSystem';
import { applyHeroDamage } from '../src/systems/HeroCombatSystem';
import { createSettlementFixture, expectedSettlement, settlementCases, settlementSnapshot } from './incoming-settlement-cases';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json', 'utf8'));
assert.equal(truth.status, 'verified');
const transfer = truth.behavior.fixtures.find((row: { id: string }) => row.id === 'hero-petturtle-transfer');
assert.equal(200 - settlementCases[0].heroHp, transfer.expected.heroDamageAfterTransfer);
assert.equal(200 - settlementCases[0].petHp, transfer.expected.petDamage);
for (const row of settlementCases) for (const slot of ['p1', 'p2'] as const) {
  const fixture = createSettlementFixture(row, slot);
  const accepted = applyOwnedHeroDamage(fixture.hero, fixture.event, 0, slot, fixture.rosters);
  assert.deepEqual(settlementSnapshot(fixture, accepted), expectedSettlement(row), `${row.id}/${slot}`);
}
// Existing direct HeroCombat consumers retain their API and modern flat defense.
const direct = createSettlementFixture({ id: 'direct', reduction: .01, heroHp: 101, petHp: 200 }, 'p1');
assert.equal(applyHeroDamage(direct.hero, direct.event, 0), true);
assert.equal(direct.hero.hp, 101);
assert.equal(direct.pets[0].hp, 200);
const flat = createSettlementFixture({ id: 'modern-flat', heroHp: 0, petHp: 0 }, 'p1');
flat.hero.role3DefenseBonus = 10;
applyHeroDamage(flat.hero, flat.event, 0);
assert.equal(flat.hero.hp, 109, 'existing modern flat-defense compatibility, not a source claim');
console.log(`216B1 settlement: ${settlementCases.length * 2} source-boundary/owner cases + direct consumers passed`);
