import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  canSpendPlayerSouls,
  spendPlayerSouls,
} from '../src/systems/PlayerSoulSystem';

const p1 = { soulCount: 1_500 };
const p2 = { soulCount: 777 };

assert.equal(canSpendPlayerSouls(p1, 1_000), true);
assert.deepEqual(spendPlayerSouls(p1, 1_000), {
  ok: true,
  soulBefore: 1_500,
  soulAfter: 500,
});
assert.equal(p1.soulCount, 500);
assert.equal(p2.soulCount, 777);

for (const invalidCost of [501, -1, 0.5, Number.NaN]) {
  assert.equal(spendPlayerSouls(p1, invalidCost).ok, false);
  assert.equal(p1.soulCount, 500);
}

const source = (relativePath: string): string =>
  readFileSync(path.join(process.cwd(), relativePath), 'utf8');

for (const consumer of [
  'src/systems/SkillUISystem.ts',
  'src/systems/FormalWorkshopPageSystem.ts',
  'src/systems/FormalMagicWeaponPageSystem.ts',
]) {
  const consumerSource = source(consumer);
  assert.match(consumerSource, /PlayerSoulSystem/);
  assert.doesNotMatch(consumerSource, /\.soulCount\s*[-+]?=/);
  assert.doesNotMatch(consumerSource, /skillLearning\.soulCount/);
}

for (const runtimeFile of [
  'src/systems/FormalSkillPageSystem.ts',
  'src/systems/FormalPetPageSystem.ts',
  'src/systems/FormalInventoryPageSystem.ts',
  'src/scenes/feature-ui/FormalMagicWeaponRuntimeBridge.ts',
]) {
  assert.doesNotMatch(source(runtimeFile), /skillLearning\.soulCount/);
}

console.log('Player soul owner, spend, isolation, invalid-cost, and consumer source gates passed.');
