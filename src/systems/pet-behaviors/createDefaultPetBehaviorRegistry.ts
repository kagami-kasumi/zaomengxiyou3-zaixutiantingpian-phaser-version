import { PetBehaviorRegistry } from '../PetBehaviorRegistry';
import { HorsePetBehavior, type HorsePetForm } from './HorsePetBehavior';
import { MonkeyPetBehavior, type MonkeyPetForm } from './MonkeyPetBehavior';

const monkeyForms = [1, 2, 3, 4] as const satisfies readonly MonkeyPetForm[];
const horseForms = [1, 2, 3, 4] as const satisfies readonly HorsePetForm[];

export function createDefaultPetBehaviorRegistry(): PetBehaviorRegistry {
  return new PetBehaviorRegistry([
    ...monkeyForms.map((form) => ({
      species: 'monkey',
      form,
      create: () => new MonkeyPetBehavior(form),
    })),
    ...horseForms.map((form) => ({
      species: 'horse',
      form,
      create: () => new HorsePetBehavior(form),
    })),
  ]);
}
