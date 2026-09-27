import type { HeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';
import type { PetRoster } from '../systems/PetTypes';
import type { PlayerSlot } from '../systems/InputSystem';
import { encodePet, type SaveStorage } from '../systems/SaveSystem';
import { loadActiveGame, saveActiveGame } from '../systems/SaveSlotSystem';

/** Persist the actual party's progression and roster through the existing save codec. */
export function persistHeroPartyExperience(storage: SaveStorage | undefined, model: HeroPartyRuntimeModel,
  rosters: Partial<Record<PlayerSlot, PetRoster>>): void {
  if (!storage) return;
  const save = loadActiveGame(storage);
  if (!save) return;
  for (const member of model.members) {
    const key = member.combat.slot === 'p1' ? 'player1' : 'player2';
    if (save[key].heroId !== member.combat.progression.heroId) continue;
    const roster = rosters[member.combat.slot];
    save[key] = { ...save[key], level: member.combat.progression.level, currentExp: member.combat.progression.currentExp,
      ...(roster ? { pets: roster.pets.map(encodePet), selectedPetIndex: roster.selectedIndex } : {}) };
  }
  saveActiveGame(storage, { ...save, savedAt: new Date().toISOString() });
}
