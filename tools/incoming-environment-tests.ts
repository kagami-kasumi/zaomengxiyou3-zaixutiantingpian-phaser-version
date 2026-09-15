import assert from 'node:assert/strict';
import { createHeroPartyRuntimeModel, applyHeroPartyEnvironmentHits, snapshotHeroParty } from '../src/systems/HeroPartyRuntimeSystem';
import { applyHeroMagicShield } from '../src/systems/HeroCombatSystem';
import { createStage21IceHazards, updateStage21IceHazards } from '../src/systems/Stage21IceHazardSystem';
import { createStage22FireHazards, updateStage22FireHazards } from '../src/systems/Stage22FireHazardSystem';

// Expected values are source arithmetic, independent of production settlement helpers.
for (const slot of ['p1', 'p2'] as const) for (const row of [
  { damage: 16.5, hp: 184, state: 'hurt' },
  { damage: 46.5, hp: 154, state: 'hurt' },
  { damage: 16.5, shield: 100, hp: 200, shieldAfter: 84, state: 'ready' },
  { damage: 46.5, shield: 30, hp: 184, state: 'hurt' },
  { damage: 16.5, shield: 16, hp: 200, state: 'ready' },
  { damage: 16.5, reduction: .08, hp: 186, state: 'ready' },
  { damage: 46.5, reduction: .01, shield: 30, hp: 186, state: 'ready' },
  { damage: 0, hp: 200, state: 'ready' },
  { damage: 501.9, hp: 0, state: 'dead' },
  { damage: 16.5, flat: 10, hp: 194, state: 'hurt' },
]) {
  const runtime = createHeroPartyRuntimeModel((['p1', 'p2'] as const).map(slot => ({ slot, heroId: 1, x: 100, y: 500 })));
  runtime.members.forEach(m => { m.combat.combat.hp = m.combat.combat.maxHp = 200; });
  const index = slot === 'p1' ? 0 : 1;
  const hero = runtime.members[index].combat.combat;
  hero.role3DamageReduction = row.reduction;
  hero.role3KnockbackImmune = Boolean(row.reduction);
  hero.role3DefenseBonus = row.flat;
  hero.invulnerableUntilMs = 9999; // Normal monster-hit window must not swallow direct environment damage.
  if (row.shield) applyHeroMagicShield(hero, { kind: 'magicUmbrellaDefend', sourceName: 'fixture', initialAmount: row.shield,
    remainingAmount: row.shield, totalMs: 1000, remainingMs: 1000 });
  applyHeroPartyEnvironmentHits(runtime, [{ target: slot, damage: row.damage, knockbackX: 10,
    bounds: { left: 0, right: 1000 }, deathReason: 'movement-trap',
    source: { hazardId: 'ice-7', attackId: 3, kind: 'ice-thorn', timeMs: 100 } }]);
  assert.equal(hero.hp, row.hp, JSON.stringify(row));
  assert.equal(hero.magicShield?.remainingAmount ?? 0, row.shieldAfter ?? 0);
  assert.equal(hero.state, row.state);
  assert.equal(runtime.members[1 - index].combat.combat.hp, 200);
  assert.equal(runtime.members[index].movement.x, row.reduction ? 100 : 110);
  assert.equal(hero.lastDamageEvent?.sourceId, 'ice-7');
  assert.equal(hero.lastDamageEvent?.attackId, 'ice-7:3');
  assert.equal(hero.lastDamageEvent?.targetId, slot);
  assert.equal(hero.lastDamageEvent?.occurredAtMs, 100);
}
for (const kind of ['ice', 'fire'] as const) for (const slot of ['p1', 'p2'] as const) {
  const runtime = createHeroPartyRuntimeModel([{ slot, heroId: 1, x: 100, y: 500 }]);
  const hero = runtime.members[0].combat.combat;
  hero.magicInvulnerability = { sourceName: 'magic-ring', totalMs: 1000, remainingMs: 1000 };
  const ice = createStage21IceHazards()[0]; ice.frame = 2;
  const fire = createStage22FireHazards()[0]; fire.frame = 2;
  const target = () => ({ slot, x: ice.source.x + 20, y: ice.source.y + 60, width: 48, height: 96,
    facingX: 1 as const, alive: true, isYourFather: snapshotHeroParty(runtime)[0].environmentProtected });
  const hit = () => kind === 'ice'
    ? updateStage21IceHazards([ice], [target()], 0, () => .65)
    : updateStage22FireHazards([fire], [target()], 0, () => true, () => .65);
  assert.equal(hit().length, 0);
  assert.equal((kind === 'ice' ? ice : fire).hitKeys.size, 0, 'protected hit must not consume ID');
  hero.magicInvulnerability = undefined;
  assert.equal(hit().length, 1, 'same attack becomes eligible after explicit protection ends');
  assert.equal(hit().length, 0, 'same attack is deduplicated after acceptance');
}
const concurrent = createStage21IceHazards()[0]; concurrent.frame = 2;
const second = { ...concurrent, source: { ...concurrent.source, id: `${concurrent.source.id}-second` }, hitKeys: new Set<string>() };
const hits = updateStage21IceHazards([concurrent, second], [{ slot: 'p1', x: concurrent.source.x + 20,
  y: concurrent.source.y + 60, width: 48, height: 96, facingX: 1, alive: true }], 0, () => .65);
assert.equal(hits.length, 2, 'different hazards sharing an attack number remain independent');
assert.notEqual(hits[0].hazardId, hits[1].hazardId);
assert.equal(hits[0].attackId, hits[1].attackId);
console.log('216B2: 20 direct settlement/owner cases, four real hazard protection/retry sequences and concurrent sources passed');
