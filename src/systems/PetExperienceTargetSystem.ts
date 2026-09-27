import type { MonsterAttackTarget } from './MonsterExperienceSystem';
import type { PlayerSlot } from './InputSystem';
import type { PetRuntimeModel, PetState, PetRoster } from './PetTypes';
import { addPetExperience } from './PetProgressionSystem';

// Metadata on the existing compatibility runtime, not another pet runtime owner.
const targets = new WeakMap<PetRuntimeModel, { target: MonsterAttackTarget; retired: boolean; pet: PetState }>();
let serial = 0;

export function bindLegacyPetExperience(runtime: PetRuntimeModel, roster: PetRoster, ownerSlot: PlayerSlot): MonsterAttackTarget {
  const index = roster.pets.findIndex(pet => pet.id === runtime.petId);
  const pet = roster.pets[index];
  if (!pet) throw new Error('Pet experience binding requires its actual roster object');
  const existing = targets.get(runtime);
  if (existing) {
    if (existing.pet !== pet) Object.assign(existing.pet, pet);
    roster.pets[index] = existing.pet;
    return existing.target;
  }
  const state = { pet, retired: false, target: undefined as unknown as MonsterAttackTarget };
  state.target = Object.freeze({ kind: 'pet', ownerSlot, petId: pet.id,
    runtimeId: `legacy-pet:${++serial}:${runtime.runtimeKey}`,
    position: () => ({ x: runtime.x, y: runtime.y }),
    isDead: () => pet.hp <= 0, isReadyToDestroy: () => state.retired,
    addExperience: (amount: number) => { addPetExperience(pet, amount); },
  });
  targets.set(runtime, state);
  return state.target;
}

export function retireLegacyPetExperience(runtime: PetRuntimeModel | undefined): void {
  const state = runtime && targets.get(runtime);
  if (state) state.retired = true;
}

export function readLegacyPetExperience(runtime: PetRuntimeModel | undefined): MonsterAttackTarget | undefined {
  const state = runtime && targets.get(runtime);
  return state && !state.retired ? state.target : undefined;
}
