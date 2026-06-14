import type { PetMagicFlowerBuff, PetState } from './PetTypes';
export function applyPetMagicFlowerBuff(
  pet: PetState,
  buff: PetMagicFlowerBuff,
): void {
  pet.magicFlowerBuff = {
    ...buff,
    attackMultiplier: Math.max(1, buff.attackMultiplier),
    totalMs: Math.max(0, buff.totalMs),
    remainingMs: Math.max(0, buff.remainingMs),
  };
}

export function clearPetMagicFlowerBuff(pet: PetState): void {
  pet.magicFlowerBuff = undefined;
}


