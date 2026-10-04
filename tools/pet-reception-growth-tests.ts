import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { addPetExperience, getPetExperienceToNextLevel, refreshPetStatsForLevel } from '../src/systems/PetProgressionSystem';
import { growPetReceptionAttributes } from '../src/systems/PetReceptionAttributes';
import { returnPetToChild } from '../src/systems/PetGrowthSystem';
import { usePetConsumable } from '../src/systems/PetConsumableSystem';

type Case = { id: number; owner: number; op: string; level?: number; miss?: number; mdef?: number;
  roll?: number; rolls?: number[]; expected: { miss: number; mdef: number; level?: number; calls?: number[] } };
const reference = JSON.parse(readFileSync('docs/reverse-engineering/reference/pet-reception-input-contract.json', 'utf8'));
const near = (actual: number | undefined, expected: number) => assert.ok(
  typeof actual === 'number' && Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
function cost(from: number, until: number): number {
  let total = 0;
  for (let level = from; level < until; level++) total += getPetExperienceToNextLevel(level);
  return total;
}
const rows: object[] = [];
for (const c of reference.attributeCases as Case[]) {
  if (!['recalc', 'upgrade', 'continuous', 'child-grow'].includes(c.op)) continue;
  const pet = createPlayerPetRosters()[c.owner === 1 ? 'p1' : 'p2'].pets[0]!;
  pet.level = c.level ?? 60; pet.exp = 0; pet.perception = 0;
  pet.missRate = c.miss; pet.magicDefenseRate = c.mdef; pet.critBonusRate = 0.27;
  const queue = [...(c.rolls ?? [])]; const calls: number[] = [];
  const random = () => { const value = queue.shift() ?? c.roll ?? 0; calls.push(value); return value; };
  if (c.op === 'recalc') {
    const callerPet = structuredClone(pet);
    growPetReceptionAttributes(pet, random);
    if (callerPet.level > 1) {
      callerPet.level--;
      const callerQueue = [...(c.rolls ?? [])]; const callerCalls: number[] = [];
      addPetExperience(callerPet, getPetExperienceToNextLevel(callerPet.level), () => {
        const value = callerQueue.shift() ?? c.roll ?? 0; callerCalls.push(value); return value;
      });
      near(callerPet.missRate, c.expected.miss); near(callerPet.magicDefenseRate, c.expected.mdef);
      assert.deepEqual(callerCalls, c.expected.calls);
      assert.equal(callerPet.critBonusRate, 0.27);
    }
  }
  else if (c.op === 'upgrade') addPetExperience(pet, pet.level === 90 ? 1 : getPetExperienceToNextLevel(pet.level), random);
  else if (c.op === 'continuous') addPetExperience(pet, cost(pet.level, 90), random);
  else {
    assert.equal(returnPetToChild(pet, () => 0.5), true);
    pet.perception = 0;
    addPetExperience(pet, cost(1, 60), random);
  }
  near(pet.missRate, c.expected.miss); near(pet.magicDefenseRate, c.expected.mdef);
  if (c.expected.level !== undefined) assert.equal(pet.level, c.expected.level);
  if (c.expected.calls) assert.deepEqual(calls, c.expected.calls);
  if (c.op !== 'child-grow') assert.equal(pet.critBonusRate, 0.27, 'Source crit draw must not alter passive bonus');
  const before = [pet.missRate, pet.magicDefenseRate, calls.length];
  refreshPetStatsForLevel(pet); refreshPetStatsForLevel(pet);
  assert.deepEqual([pet.missRate, pet.magicDefenseRate, calls.length], before);
  rows.push({ id: c.id, op: c.op, level: pet.level, missRate: pet.missRate, magicDefenseRate: pet.magicDefenseRate, calls });
}
for (const owner of ['p1', 'p2'] as const) {
  const roster = createPlayerPetRosters()[owner]; const pet = roster.pets[0]!;
  pet.level = 59; pet.exp = getPetExperienceToNextLevel(59) - 1;
  let calls = 0;
  const result = usePetConsumable(roster, 'djyys', () => { calls++; return 0.9; });
  assert.equal(result.ok, true); assert.equal(pet.level, 60);
  near(pet.missRate, 0.01); near(pet.magicDefenseRate, 0.01); assert.equal(calls, 3);
  pet.level = 59; pet.exp = 0; delete pet.missRate; delete pet.magicDefenseRate; delete pet.receptionAttributeSource;
  calls = 0;
  addPetExperience(pet, getPetExperienceToNextLevel(59), () => { calls++; return 0.9; });
  assert.equal(pet.missRate, undefined); assert.equal(pet.magicDefenseRate, undefined);
  assert.equal(pet.receptionAttributeSource, undefined); assert.equal(calls, 3);
}
const out = 'docs/tasks/evidence/TASK-SLICE-253'; mkdirSync(out, { recursive: true });
writeFileSync(`${out}/attribute-growth.json`, JSON.stringify({ status: 'growth-verified', sourceCases: rows.length, rows,
  scope: '252 reception attributes only; no claim of complete skill-learning/crit migration or selected legacy fallback.' }, null, 2));
console.log(`Pet reception growth: ${rows.length} native-reference cases plus real consumable/unknown-state paths passed.`);
