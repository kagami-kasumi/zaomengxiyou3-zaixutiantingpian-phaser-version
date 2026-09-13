import { PetBehaviorRegistry } from '../PetBehaviorRegistry';
import { HorsePetBehavior, type HorsePetForm } from './HorsePetBehavior';
import { MonkeyPetBehavior, type MonkeyPetForm } from './MonkeyPetBehavior';
import { Dragon1PetBehavior } from './Dragon1PetBehavior';

const monkeyForms = [1, 2, 3, 4] as const satisfies readonly MonkeyPetForm[];
const horseForms = [1, 2, 3, 4] as const satisfies readonly HorsePetForm[];

export function createDefaultPetBehaviorRegistry(): PetBehaviorRegistry {
  return new PetBehaviorRegistry([
    { species: 'dragon', form: 1, create: () => new Dragon1PetBehavior() },
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
