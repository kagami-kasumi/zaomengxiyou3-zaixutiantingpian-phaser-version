// boundary: all formal levels share this horse presentation adapter. It reads
// existing roster/runtime owners and never owns pet rules, combat, or saves.
import Phaser from 'phaser';
import { getActivePet } from '../systems/PetRosterSystem';
import { syncPetRuntimeWithRoster, updatePetRuntime } from '../systems/PetRuntimeSystem';
import type { PetRoster, PetRuntimeModel } from '../systems/PetTypes';
import {
  createPetHorseAnimationView,
  isSupportedPetHorse,
  syncPetHorseAnimationView,
  type PetHorseAnimationView,
} from './PetHorseAnimationView';

type Slot = 'p1' | 'p2';
type FormalPetHorseMember = Readonly<{
  slot: Slot;
  x: number;
  y: number;
  facingX: -1 | 1;
  dead: boolean;
}>;
type SlotPresentation = {
  runtime?: PetRuntimeModel;
  view?: PetHorseAnimationView;
  lastTimeMs?: number;
};

export type FormalPetHorseBodyBridge = Readonly<{
  update: (members: readonly FormalPetHorseMember[], timeMs: number) => void;
  destroy: () => void;
}>;

export function createFormalPetHorseBodyBridge(
  scene: Phaser.Scene,
  rosterFor: (slot: Slot) => PetRoster | undefined,
): FormalPetHorseBodyBridge {
  const slots: Record<Slot, SlotPresentation> = { p1: {}, p2: {} };
  const destroySlot = (slot: Slot) => {
    slots[slot].view?.root.destroy(true);
    slots[slot] = {};
  };
  return {
    update: (members, timeMs) => {
      for (const slot of ['p1', 'p2'] as const) {
        const presentation = slots[slot];
        const owner = members.find((member) => member.slot === slot);
        const roster = rosterFor(slot);
        const pet = roster ? getActivePet(roster) : undefined;
        if (!owner || owner.dead || !roster || !pet || !isSupportedPetHorse(pet)) {
          destroySlot(slot);
          continue;
        }
        const ownerSnapshot = { x: owner.x, y: owner.y, facingX: owner.facingX };
        presentation.runtime = syncPetRuntimeWithRoster(roster, presentation.runtime, ownerSnapshot);
        if (!presentation.runtime) {
          destroySlot(slot);
          continue;
        }
        const deltaMs = presentation.lastTimeMs === undefined ? 0 : Math.max(0, timeMs - presentation.lastTimeMs);
        presentation.lastTimeMs = timeMs;
        updatePetRuntime(presentation.runtime, pet, ownerSnapshot, deltaMs);
        if (!presentation.view || presentation.view.petId !== pet.id || presentation.view.form !== pet.form) {
          presentation.view?.root.destroy(true);
          presentation.view = createPetHorseAnimationView(
            scene,
            pet,
            presentation.runtime.x,
            presentation.runtime.y,
            timeMs,
          );
        }
        syncPetHorseAnimationView(
          presentation.view,
          pet,
          presentation.runtime,
          [],
          timeMs,
          scene.game.loop.targetFps,
        );
      }
    },
    destroy: () => {
      destroySlot('p1');
      destroySlot('p2');
    },
  };
}
