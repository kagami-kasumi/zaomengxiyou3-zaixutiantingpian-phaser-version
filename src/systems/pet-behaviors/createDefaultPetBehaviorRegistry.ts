import { PetBehaviorRegistry } from '../PetBehaviorRegistry';
import { HorsePetBehavior, type HorsePetForm } from './HorsePetBehavior';
import { MonkeyPetBehavior, type MonkeyPetForm } from './MonkeyPetBehavior';
import { Dragon1PetBehavior } from './Dragon1PetBehavior';
import { Dragon4PetBehavior } from './Dragon4PetBehavior';
import { TurtlePetBehavior } from './TurtlePetBehavior';
import type { PetTurtleAssets } from '../../assets/PetTurtleAssets';

const monkeyForms = [1, 2, 3, 4] as const satisfies readonly MonkeyPetForm[];
const horseForms = [1, 2, 3, 4] as const satisfies readonly HorsePetForm[];

export function createDefaultPetBehaviorRegistry(turtleAssets?: () => PetTurtleAssets): PetBehaviorRegistry {
  return new PetBehaviorRegistry([
    { species: 'dragon', form: 1, create: () => new Dragon1PetBehavior() },
    { species: 'dragon', form: 2, create: () => new Dragon1PetBehavior(2) },
    { species: 'dragon', form: 3, create: () => new Dragon1PetBehavior(3) },
    { species: 'dragon', form: 4, create: () => new Dragon4PetBehavior() },
    ...([1, 2, 3, 4] as const).map(form => ({ species: 'turtle', form, create: () => {
      if (!turtleAssets) throw new Error('Turtle behavior requires the prepared pet-turtle bundle');
      return new TurtlePetBehavior(turtleAssets(), form);
    } })),
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
