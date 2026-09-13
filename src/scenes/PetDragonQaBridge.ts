import { createSeedPetRoster } from '../systems/PetRosterSystem';

export function isPetDragonQaEnabled(): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(globalThis.location?.hostname ?? '')
    && new URLSearchParams(globalThis.location?.search ?? '').get('qaPetDragon') === '1';
}

export function isPetDragonQaOwnerProtected(): boolean {
  return isPetDragonQaEnabled()
    && new URLSearchParams(globalThis.location?.search ?? '').get('qaPetDragonMortal') !== '1';
}

/** Ephemeral dev-party fixture; never reads or writes a save slot. */
export function createPetDragonQaRoster(slot: 'p1' | 'p2') {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) {
    pet.id = `${slot}-${pet.id}`;
    pet.isActive = pet.species === 'dragon' && pet.form === 1;
    if (pet.isActive) Object.assign(pet, { hp: 5000, maxHp: 10000, mp: 1000, maxMp: 1000,
      atk: 30, def: 100, skills: ['fs'] });
  }
  return roster;
}
