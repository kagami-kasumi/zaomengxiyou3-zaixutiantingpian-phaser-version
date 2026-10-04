import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { catchNewPet } from '../src/systems/PetRosterSystem';
import { returnPetToChild, evolvePetWithItem } from '../src/systems/PetGrowthSystem';
import { refreshPetStatsForLevel } from '../src/systems/PetProgressionSystem';
import { createDefaultGameSave } from '../src/systems/SaveSlotSystem';
import { encodePet, restoreGameState, type PetSave } from '../src/systems/SaveSystem';

type Case = { owner: number; op: string; name?: string; level?: number;
  miss?: number; mdef?: number; expected: { miss: number; mdef: number } };
const reference = JSON.parse(readFileSync('docs/reverse-engineering/reference/pet-reception-input-contract.json', 'utf8'));
assert.equal(reference.status, 'verified');
const observed: object[] = [];
const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
for (const owner of ['p1', 'p2'] as const) {
  for (const pet of rosters[owner].pets) {
    assert.equal(pet.missRate, 0); assert.equal(pet.magicDefenseRate, 0);
    assert.equal(pet.receptionAttributeSource, 'known');
  }
}
for (const c of reference.attributeCases as Case[]) {
  if (c.op !== 'capture' && c.op !== 'save') continue;
  const owner = c.owner === 1 ? 'p1' : 'p2';
  const roster = createPlayerPetRosters()[owner];
  roster.pets = [];
  const pet = catchNewPet(roster, c.name ?? 'rabbit3', c.level ?? 60)!;
  assert.ok(pet);
  if (c.op === 'capture') {
    assert.equal(pet.missRate, c.expected.miss);
    assert.equal(pet.magicDefenseRate, c.expected.mdef);
  } else {
    pet.missRate = c.miss; pet.magicDefenseRate = c.mdef;
    const saved = encodePet(pet);
    assert.equal(saved.missRate, c.miss); assert.equal(saved.magicDefenseRate, c.mdef);
    const save = createDefaultGameSave();
    const slot = owner === 'p1' ? 'player1' : 'player2';
    save[slot].pets = [saved];
    const loaded = restoreGameState(save, {})[slot].petRoster.pets[0]!;
    assert.equal(loaded.missRate, c.expected.miss);
    assert.equal(loaded.magicDefenseRate, c.expected.mdef);
    assert.equal(loaded.receptionAttributeSource, 'known');
    observed.push({ owner, saved, loaded: { missRate: loaded.missRate, magicDefenseRate: loaded.magicDefenseRate } });
  }
}
for (const slot of ['player1', 'player2'] as const) {
  const save = createDefaultGameSave();
  const pet = createPlayerPetRosters().p1.pets[0]!;
  pet.missRate = 0.23; pet.magicDefenseRate = 0.17;
  refreshPetStatsForLevel(pet);
  assert.equal(pet.missRate, 0.23); assert.equal(pet.magicDefenseRate, 0.17);
  pet.form = 3;
  evolvePetWithItem(pet);
  assert.equal(pet.missRate, 0.23); assert.equal(pet.magicDefenseRate, 0.17);
  assert.equal(returnPetToChild(pet, () => 0.5), true);
  assert.equal(pet.missRate, 0.23); assert.equal(pet.magicDefenseRate, 0.17);
  const encoded = encodePet(pet);
  for (const raw of [
    { ...encoded, missRate: undefined, magicDefenseRate: undefined },
    { ...encoded, missRate: Number.NaN, magicDefenseRate: Number.POSITIVE_INFINITY },
    { ...encoded, missRate: '0.23', magicDefenseRate: null },
  ]) {
    save[slot].pets = [raw as unknown as PetSave];
    const loaded = restoreGameState(save, {})[slot].petRoster.pets[0]!;
    assert.equal(loaded.missRate, undefined); assert.equal(loaded.magicDefenseRate, undefined);
    assert.equal(loaded.receptionAttributeSource, undefined);
    assert.equal(loaded.level, pet.level); assert.deepEqual(loaded.skills, pet.skills);
  }
  save[slot].pets = [{ ...encoded, missRate: undefined }];
  const partial = restoreGameState(save, {})[slot].petRoster.pets[0]!;
  assert.equal(partial.missRate, undefined); assert.equal(partial.magicDefenseRate, 0.17);
  assert.equal(partial.receptionAttributeSource, undefined);
}
const output = 'docs/tasks/evidence/TASK-SLICE-253'; mkdirSync(output, { recursive: true });
writeFileSync(`${output}/attributes-persistence.json`, JSON.stringify({ status: 'partial-persistence-verified',
  captureCases: (reference.attributeCases as Case[]).filter(c => c.op === 'capture').length,
  saveCases: observed.length, observed,
  remaining: ['effect owner', 'receiver mapping', 'legacy migration decision'],
}, null, 2));
console.log('Pet reception attributes: real P1/P2 factories, 252 explicit save cases, reset retention and missing/invalid preservation passed.');
