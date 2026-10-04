import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createDefaultGameSave } from '../src/systems/SaveSlotSystem';
import { encodePet, restoreGameState } from '../src/systems/SaveSystem';
import { addPetExperience, getPetExperienceToNextLevel } from '../src/systems/PetProgressionSystem';

const pet = createSeedPetRoster().pets[0]!;
const initial = { miss: 'missRate' in pet, magicDefense: 'magicDefenseRate' in pet };
assert.deepEqual(initial, { miss: true, magicDefense: true });
pet.level = 59; pet.exp = 0; pet.expToNext = getPetExperienceToNextLevel(59);
addPetExperience(pet, pet.expToNext);
assert.equal(pet.level, 60);
const growth = { miss: 'missRate' in pet, magicDefense: 'magicDefenseRate' in pet };
assert.deepEqual(growth, initial);
// 253 persists explicit attributes; independent growth/effect suites supply their own gates.
const encoded = encodePet(Object.assign(pet, { missRate: 0.23, magicDefenseRate: 0.17 }));
const results = [];
for (const slot of ['player1', 'player2'] as const) {
  const save = createDefaultGameSave(); save[slot].pets = [encoded];
  const loaded = restoreGameState(save, {})[slot].petRoster.pets[0]!;
  assert.equal(loaded.missRate, 0.23); assert.equal(loaded.magicDefenseRate, 0.17);
  results.push({ slot, saved: { missRate: 0.23, magicDefenseRate: 0.17 },
    restored: { miss: 'missRate' in loaded, magicDefense: 'magicDefenseRate' in loaded } });
}
const output = 'docs/tasks/evidence/TASK-SLICE-253'; mkdirSync(output, { recursive: true });
writeFileSync(`${output}/pet-input-preflight.json`, JSON.stringify({ status: 'persistence-fixed-effect-pending', initial, growth, results,
  scope: 'Modern production seed/59-to-60 progression/save restore; not original growth oracle or migration approval.' }, null, 2) + '\n');
console.log('Monster3 pet input preflight: explicit fields persist; original growth/effect integration requires separate acceptance.');
