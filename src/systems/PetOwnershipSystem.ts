import type { PlayerSlot } from './InputSystem';
import {
  createSeedPetRoster,
  selectPet,
  toggleSelectedPetActive,
} from './PetRosterSystem';
import type { PetRoster } from './PetTypes';

export type PlayerPetRosters = Record<PlayerSlot, PetRoster>;

export type PetPanelSession = {
  owner?: PlayerSlot;
};

export const PetUiKeyCodes = {
  p1Panel: 66,
  p2Panel: 109,
  p2SkillPanel: 106,
} as const;

export function createPlayerPetRosters(
  options: { includeSkillShowcase?: boolean } = {},
): PlayerPetRosters {
  const rosters = {
    p1: createSeedPetRoster(),
    p2: createOwnedSeedRoster('p2'),
  };
  if (!options.includeSkillShowcase) {
    rosters.p1.pets = rosters.p1.pets.slice(0, 1);
    rosters.p2.pets = rosters.p2.pets.slice(0, 1);
    rosters.p1.selectedIndex = 0;
    rosters.p2.selectedIndex = 0;
  }
  return rosters;
}

export function createPetPanelSession(): PetPanelSession {
  return {};
}

export function getPlayerPetRoster(
  rosters: PlayerPetRosters,
  owner: PlayerSlot,
): PetRoster {
  return rosters[owner];
}

export function togglePetPanelForOwner(
  session: PetPanelSession,
  rosters: PlayerPetRosters,
  owner: PlayerSlot,
): boolean {
  const roster = getPlayerPetRoster(rosters, owner);
  if (session.owner === owner) {
    session.owner = undefined;
    roster.message = `${owner.toUpperCase()} pet panel closed`;
    return false;
  }

  session.owner = owner;
  roster.message = `${owner.toUpperCase()} pet panel opened`;
  return true;
}

export function closePetPanel(session: PetPanelSession): void {
  session.owner = undefined;
}

export function selectOwnedPet(
  rosters: PlayerPetRosters,
  owner: PlayerSlot,
  direction: 1 | -1,
): void {
  selectPet(getPlayerPetRoster(rosters, owner), direction);
}

export function toggleOwnedPetActive(
  rosters: PlayerPetRosters,
  owner: PlayerSlot,
): boolean {
  return toggleSelectedPetActive(getPlayerPetRoster(rosters, owner));
}

function createOwnedSeedRoster(owner: PlayerSlot): PetRoster {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) {
    pet.id = `${owner}-${pet.id}`;
  }
  roster.message = `${owner.toUpperCase()} pet ready`;
  return roster;
}
