import type { PetState } from './PetTypes';
export function encodePetSkillSaveString(skills: readonly string[]): string {
  return skills.join('~');
}

export function decodePetSkillSaveString(value: string): string[] {
  if (value === '') {
    return [];
  }

  return value.split('~');
}


export function applyPetSkillSaveString(pet: PetState, value: string): void {
  pet.skills = decodePetSkillSaveString(value);
}


