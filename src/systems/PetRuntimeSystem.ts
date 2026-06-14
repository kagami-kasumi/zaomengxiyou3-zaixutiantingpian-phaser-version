import { PetTuning } from './PetTuning';
import type { PetOwnerSnapshot, PetRoster, PetRuntimeModel, PetState } from './PetTypes';
export function createPetRuntime(
  pet: PetState,
  owner: PetOwnerSnapshot,
): PetRuntimeModel {
  return {
    petId: pet.id,
    runtimeKey: getPetRuntimeKey(pet),
    x: owner.x - owner.facingX * PetTuning.followOffsetX,
    y: owner.y + PetTuning.warpOffsetY,
    facingX: owner.facingX,
    state: 'idle',
  };
}

export function syncPetRuntimeWithRoster(
  roster: PetRoster,
  runtime: PetRuntimeModel | undefined,
  owner: PetOwnerSnapshot,
): PetRuntimeModel | undefined {
  const activePet = getActivePet(roster);
  if (!activePet) {
    return undefined;
  }

  if (!runtime || runtime.petId !== activePet.id || runtime.runtimeKey !== getPetRuntimeKey(activePet)) {
    return createPetRuntime(activePet, owner);
  }

  return runtime;
}

export function updatePetRuntime(
  runtime: PetRuntimeModel,
  pet: PetState,
  owner: PetOwnerSnapshot,
  deltaMs: number,
): void {
  const desiredX = owner.x - owner.facingX * PetTuning.followOffsetX;
  const desiredY = owner.y - PetTuning.followOffsetY;
  const dx = desiredX - runtime.x;
  const dy = desiredY - runtime.y;
  const distance = Math.hypot(dx, dy);

  runtime.facingX = dx < 0 ? -1 : dx > 0 ? 1 : owner.facingX;

  if (distance >= PetTuning.warpDistance) {
    runtime.x = owner.x;
    runtime.y = owner.y + PetTuning.warpOffsetY;
    runtime.state = 'warp';
    return;
  }

  if (distance <= PetTuning.followMinDistance) {
    runtime.state = 'idle';
    return;
  }

  const speedPxPerSecond = pet.moveSpeed * 90;
  const step = Math.min(distance, speedPxPerSecond * (deltaMs / 1000));
  runtime.x += (dx / distance) * step;
  runtime.y += (dy / distance) * step;
  runtime.state = 'follow';
}


function getPetRuntimeKey(pet: PetState): string {
  return `${pet.id}:${pet.species}:${pet.form}`;
}

function getActivePet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive && pet.lifetime > 0);
}
