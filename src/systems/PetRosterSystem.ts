import { CapturablePetDefinitions, PetTuning } from './PetTuning';
import {
  createDefaultPetQualities,
  getPetBaseStats,
  getPetExperienceToNextLevel,
} from './PetProgressionSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type { CapturableMonsterId, CapturablePetDefinition, PetRoster, PetState } from './PetTypes';
function createSeedPet(params: {
  id: string;
  species: 'monkey' | 'horse' | 'dragon' | 'turtle';
  form: number;
  displayName: string;
  isActive: boolean;
  skills: string[];
}): PetState {
  const qualities = createDefaultPetQualities();
  const stats = getPetBaseStats(params.species, 1, qualities);
  return {
    id: params.id,
    species: params.species,
    form: params.form,
    displayName: params.displayName,
    level: 1,
    exp: 0,
    expToNext: getPetExperienceToNextLevel(1),
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mp: stats.maxMp,
    maxMp: stats.maxMp,
    atk: stats.atk,
    def: stats.def,
    critBonusRate: 0,
    skillDamageBonus: 0,
    moveSpeed: 5,
    lifetime: 100,
    quality: 1,
    ...qualities,
    perception: 1,
    technique: 1,
    warpower: 1,
    isActive: params.isActive,
    skills: params.skills,
    skillState: createPetSkillState(),
  };
}

export function createSeedPetRoster(): PetRoster {
  return {
    pets: [
      createSeedPet({
        id: 'pet-monkey-1',
        species: 'monkey',
        form: 1,
        displayName: '小猴',
        isActive: true,
        skills: ['tsml', 'xj'],
      }),
      createSeedPet({
        id: 'pet-monkey-2',
        species: 'monkey',
        form: 2,
        displayName: '小猴 F2',
        isActive: false,
        skills: ['tsml', 'lj', 'xj'],
      }),
      createSeedPet({
        id: 'pet-monkey-3',
        species: 'monkey',
        form: 3,
        displayName: '小猴 F3',
        isActive: false,
        skills: ['tsml', 'lyq', 'xj', 'lj'],
      }),
      createSeedPet({
        id: 'pet-monkey-4',
        species: 'monkey',
        form: 4,
        displayName: '小猴 F4',
        isActive: false,
        skills: ['tsml', 'xj', 'lj', 'lyq', 'jgaoyi'],
      }),
      createSeedPet({
        id: 'pet-horse-1',
        species: 'horse',
        form: 1,
        displayName: '小马',
        isActive: false,
        skills: ['tsml', 'sp'],
      }),
      createSeedPet({
        id: 'pet-horse-2',
        species: 'horse',
        form: 2,
        displayName: '小马 F2',
        isActive: false,
        skills: ['tsml', 'sp', 'bd'],
      }),
      createSeedPet({
        id: 'pet-horse-3',
        species: 'horse',
        form: 3,
        displayName: '小马 F3',
        isActive: false,
        skills: ['tsml', 'sp', 'bd', 'bz'],
      }),
      createSeedPet({
        id: 'pet-horse-4',
        species: 'horse',
        form: 4,
        displayName: '小马 F4',
        isActive: false,
        skills: ['tsml', 'sp', 'bd', 'bz', 'tmaoyi'],
      }),
      createSeedPet({
        id: 'pet-dragon-1',
        species: 'dragon',
        form: 1,
        displayName: '小龙',
        isActive: false,
        skills: ['tsml', 'fs'],
      }),
      createSeedPet({
        id: 'pet-dragon-2',
        species: 'dragon',
        form: 2,
        displayName: '小龙 F2',
        isActive: false,
        skills: ['tsml', 'fs', 'sdcc'],
      }),
      createSeedPet({
        id: 'pet-dragon-3',
        species: 'dragon',
        form: 3,
        displayName: '小龙 F3',
        isActive: false,
        skills: ['tsml', 'fs', 'sdcc', 'ltwj'],
      }),
      createSeedPet({
        id: 'pet-dragon-4',
        species: 'dragon',
        form: 4,
        displayName: '小龙 F4',
        isActive: false,
        skills: ['tsml', 'fs', 'sdcc', 'ltwj', 'qlaoyi'],
      }),
      createSeedPet({
        id: 'pet-turtle-1',
        species: 'turtle',
        form: 1,
        displayName: '小龟',
        isActive: false,
        skills: ['tsml', 'sld'],
      }),
      createSeedPet({
        id: 'pet-turtle-2',
        species: 'turtle',
        form: 2,
        displayName: '小龟 F2',
        isActive: false,
        skills: ['tsml', 'sld', 'txlj'],
      }),
    ],
    selectedIndex: 0,
    message: 'Pet ready',
  };
}


export function getSelectedPet(roster: PetRoster): PetState | undefined {
  return roster.pets[roster.selectedIndex];
}

export function getActivePet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive && pet.lifetime > 0);
}

export function getCurrentPet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive);
}

export function selectPet(roster: PetRoster, direction: 1 | -1): void {
  if (roster.pets.length === 0) {
    roster.selectedIndex = 0;
    roster.message = 'No pets';
    return;
  }

  roster.selectedIndex =
    (roster.selectedIndex + direction + roster.pets.length) % roster.pets.length;
  roster.message = `Selected ${roster.pets[roster.selectedIndex].displayName}`;
}

export function setSelectedPetActive(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  if (selected.hp <= 0) {
    roster.message = `${selected.displayName} needs rest`;
    return false;
  }

  if (selected.lifetime <= 0) {
    roster.message = `${selected.displayName} has no lifetime`;
    return false;
  }

  for (const pet of roster.pets) {
    pet.isActive = pet.id === selected.id;
  }
  roster.message = `${selected.displayName} deployed`;
  return true;
}

export function restSelectedPet(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  selected.isActive = false;
  roster.message = `${selected.displayName} resting`;
  return true;
}

export function toggleSelectedPetActive(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  return selected.isActive ? restSelectedPet(roster) : setSelectedPetActive(roster);
}

export function catchNewPet(
  roster: PetRoster,
  petName: string,
  level = 1,
): PetState | undefined {
  if (roster.pets.length >= PetTuning.maxSeats) {
    roster.message = '宠物栏已满！';
    return undefined;
  }

  const definition = findCapturablePetDefinitionByPetName(petName);
  const pet = createPetStateFromDefinition(
    definition ?? createFallbackPetDefinition(petName),
    level,
    roster.pets.length + 1,
  );
  roster.pets.push(pet);
  roster.selectedIndex = roster.pets.length - 1;
  roster.message = `捕捉成功：${pet.displayName}`;
  return pet;
}


function createCapturablePetDefinition(
  monsterId: CapturableMonsterId,
  petName: string,
  displayName: string,
  species: string,
  form: number,
  probability: number,
): CapturablePetDefinition {
  return { monsterId, petName, displayName, species, form, probability };
}

function findCapturablePetDefinitionByPetName(
  petName: string,
): CapturablePetDefinition | undefined {
  return Object.values(CapturablePetDefinitions).find((definition) =>
    definition.petName === petName
  );
}

function createFallbackPetDefinition(petName: string): CapturablePetDefinition {
  const form = Number.parseInt(petName.match(/\d+$/)?.[0] ?? '1', 10);
  const species = petName.replace(/\d+$/, '') || petName;
  return createCapturablePetDefinition('Monster72', petName, petName, species, form, 1);
}

function createPetStateFromDefinition(
  definition: CapturablePetDefinition,
  level: number,
  serial: number,
): PetState {
  const normalizedLevel = Math.max(1, Math.floor(level));
  const qualities = createDefaultPetQualities();
  const stats = getPetBaseStats(definition.species, normalizedLevel, qualities);

  return {
    id: `pet-${definition.petName}-${serial}`,
    species: definition.species,
    form: definition.form,
    displayName: definition.displayName,
    level: normalizedLevel,
    exp: 0,
    expToNext: getPetExperienceToNextLevel(normalizedLevel),
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mp: stats.maxMp,
    maxMp: stats.maxMp,
    atk: stats.atk,
    def: stats.def,
    critBonusRate: 0,
    skillDamageBonus: 0,
    moveSpeed: 5,
    lifetime: 100,
    quality: normalizedLevel === 1 ? 1 : 2,
    ...qualities,
    perception: 1,
    technique: 1,
    warpower: 1,
    isActive: false,
    skills: ['tsml'],
    skillState: createPetSkillState(),
  };
}


