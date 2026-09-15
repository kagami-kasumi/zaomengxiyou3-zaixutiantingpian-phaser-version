import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHeroPartyRuntimeModel, applyHeroPartyEnvironmentHits } from '../src/systems/HeroPartyRuntimeSystem';
import { applyHeroMagicShield } from '../src/systems/HeroCombatSystem';

// Historical preflight of the actual party environment consumer, not a visual/gameplay trace.
// Original calls use reduceHp(int,true): IceThron:75, FireThron:74;
// defenses execute in Role3:1201..1222 and BaseHero:795..823.
const inputs = [
  { id: 'ice-fractional', damage: 16.5, expectedHp: 184, expectedShield: 0 },
  { id: 'fire-fractional', damage: 46.5, expectedHp: 154, expectedShield: 0 },
  { id: 'ice-full-shield', damage: 16.5, shield: 100, expectedHp: 200, expectedShield: 84 },
  { id: 'fire-overflow', damage: 46.5, shield: 30, expectedHp: 184, expectedShield: 0 },
  { id: 'ice-role3-sd8', damage: 16.5, reduction: .08, expectedHp: 186, expectedShield: 0 },
];
const rows = inputs.map(input => {
  const runtime = createHeroPartyRuntimeModel([{ slot: 'p1', heroId: 1, x: 100, y: 500 }]);
  const hero = runtime.members[0].combat.combat;
  hero.hp = hero.maxHp = 200;
  hero.role3DamageReduction = input.reduction;
  if (input.shield) applyHeroMagicShield(hero, { kind: 'magicUmbrellaDefend', sourceName: 'preflight',
    initialAmount: input.shield, remainingAmount: input.shield, totalMs: 1000, remainingMs: 1000 });
  applyHeroPartyEnvironmentHits(runtime, [{ target: 'p1', damage: input.damage, knockbackX: 10,
    bounds: { left: 0, right: 1000 }, deathReason: 'movement-trap' }]);
  return { id: input.id, input, expected: { hp: input.expectedHp, shield: input.expectedShield },
    actual: { hp: hero.hp, shield: hero.magicShield?.remainingAmount ?? 0 } };
});
const out = 'docs/tasks/evidence/TASK-SLICE-216B';
mkdirSync(out, { recursive: true });
if (!process.argv.includes('--verify')) writeFileSync(`${out}/environment-preflight.json`, JSON.stringify({
  scope: 'Real applyHeroPartyEnvironmentHits; source-derived integer/defense expectations; not a full scene trace', rows,
}, null, 2) + '\n');
console.log(JSON.stringify(rows, null, 2));
if (process.argv.includes('--verify')) for (const row of rows) assert.deepEqual(row.actual, row.expected, row.id);
