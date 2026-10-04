import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStage1CombatPlayer } from '../src/systems/Stage1CombatSystem';
import { readHeroMonsterReceptionInput, receiveHeroMonsterDamage } from '../src/systems/HeroMonsterDamageReception';
import { createIncomingDamageFeedbackModel } from '../src/systems/IncomingDamageFeedbackSystem';
import type { MonsterDamageRequest } from '../src/systems/MonsterDamageReception';
import type { HeroId } from '../src/systems/HeroNormalAttackSystem';
const reference = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster3-reception-contract.json', 'utf8'));
let cases = 0;
for (const slot of ['p1', 'p2'] as const) for (const heroId of [1, 2, 3, 4, 5] as const) {
  for (const scenario of ['normal', 'dodge', 'magic-quarter', 'shield-partial', 'shield-full', 'fatal', 'protected']) {
    const id = `Role${heroId}-${slot}-0-2-${scenario}`;
    const index = reference.inputs.rows.findIndex((row: unknown[]) => row[0] === id);
    assert(index >= 0);
    const f = Object.fromEntries(reference.inputs.fields.map((key: string, i: number) => [key, reference.inputs.rows[index][i]]));
    const expected = Object.fromEntries(reference.expected.fields.map((key: string, i: number) => [key, reference.expected.rows[index][i]]));
    const player = createStage1CombatPlayer(slot, heroId as HeroId);
    player.combat.hp = f.hp; player.combat.maxHp = 1000;
    const model = createIncomingDamageFeedbackModel();
    player.combat.incomingFeedback = { model, targetKind: 'hero', ownerSlot: slot,
      targetId: slot, targetRuntimeId: slot, worldAnchor: () => ({ x: 1, y: 2 }) };
    // Replace the existing current-stat object, proving the port doesn't cache defaults.
    player.effectiveStats = { ...player.effectiveStats, defense: f.defense,
      missPercent: f.miss, magicDefensePercent: f.magicDefense };
    if (f.shield) player.combat.magicShield = { kind: 'magicUmbrellaDefend', remainingAmount: f.shield,
      initialAmount: f.shield, totalMs: 1000, remainingMs: 1000, sourceName: 'fixture' };
    const draws: number[] = [];
    const request: MonsterDamageRequest = { source: { boss: false, hit: 0, criticalPercent: 0,
      flower: false, magicDefenseReduction: 0, random: () => { draws.push(f.roll); return f.roll; } },
      sourceId: 'monster3', attackId: 'attack-1', actionName: 'hit2', power: 18, attackKind: 'magic',
      geometryHit: f.geometry, bingo: false, difficulty: 0, timeMs: 1000,
      hostFps: 30, knockbackX: -5, knockbackY: 0 };
    const input = readHeroMonsterReceptionInput(player, { gxp: false, protected: f.protected });
    assert.equal(input.heroId, heroId);
    assert.equal(input.missRate, f.miss / 100);
    assert.equal(input.magicDefenseRate, f.magicDefense / 100);
    const result = receiveHeroMonsterDamage(player.combat, input, request);
    assert.equal(result.accepted, expected.accepted, id);
    assert.equal(player.combat.hp, expected.hp, id);
    assert.deepEqual(draws, expected.random, id);
    const feedbackExpected = result.accepted && !result.missed && !f.shield;
    assert.equal(model.trace.length, feedbackExpected ? 1 : 0, id);
    if (model.trace.length) {
      assert.equal(model.trace[0]!.hpBefore, f.hp);
      assert.equal(model.trace[0]!.hpAfter, expected.hp);
    }
    cases++;
  }
}
console.log(`Monster3 reception: ${cases} real Stage1CombatPlayer stat/identity/HP/feedback cases.`);
