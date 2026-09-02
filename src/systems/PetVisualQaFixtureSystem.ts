import { createPartyConfiguration } from './PartyConfigurationSystem';
import { createPlayerPetRosters } from './PetOwnershipSystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  inspectSaveSlot,
  selectSaveSlot,
  type SaveSlotId,
} from './SaveSlotSystem';
import type { SaveStorage } from './SaveSystem';

export const AllPetsQaSaveSlot = 5 as SaveSlotId;

export type AllPetsQaSaveResult = 'created' | 'selected-existing' | 'occupied' | 'disabled';

export function seedAllPetsQaSave(
  storage: SaveStorage,
  search: string,
  hostname: string,
): AllPetsQaSaveResult {
  const local = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!local || new URLSearchParams(search).get('qaPetSave') !== 'all') return 'disabled';

  const slot = inspectSaveSlot(storage, AllPetsQaSaveSlot);
  if (slot.status === 'valid' && slot.save) {
    const allPets = createPlayerPetRosters({ includeSkillShowcase: true });
    const expectedCount = allPets.p1.pets.length;
    if (slot.save.player1.pets.length === expectedCount && slot.save.player2.pets.length === expectedCount) {
      selectSaveSlot(storage, AllPetsQaSaveSlot);
      return 'selected-existing';
    }
    return 'occupied';
  }
  if (slot.status !== 'empty') return 'occupied';

  const party = createPartyConfiguration(2, 1, 2)!;
  const save = createDefaultGameSave(new Date(), party);
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  save.player1.pets = structuredClone(rosters.p1.pets);
  save.player1.selectedPetIndex = rosters.p1.selectedIndex;
  save.player2.pets = structuredClone(rosters.p2.pets);
  save.player2.selectedPetIndex = rosters.p2.selectedIndex;
  return createSaveSlot(storage, AllPetsQaSaveSlot, save) ? 'created' : 'occupied';
}
