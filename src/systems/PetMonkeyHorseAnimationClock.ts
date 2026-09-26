import body from '../assets/pet-monkey-horse-body.json';
import { PetAnimationClock, type PetAnimationDefinition } from './PetAnimationClock';

const skillActions = {
  monkey: [['xj'], ['lj', 'xj'], ['lyq', 'xj', 'lj'], ['lyq', 'xj', 'lj', 'jgaoyi']],
  horse: [['sp'], ['bd', 'sp'], ['bd', 'sp', 'bz'], ['bd', 'sp', 'bz', 'tmaoyi']],
} as const;

export function getPetMonkeyHorseActionAliases(family: 'monkey' | 'horse', form: 1 | 2 | 3 | 4): Readonly<Record<string, string>> {
  const aliases: Record<string, string> = { 'basic-attack': 'hit1' };
  for (const [index, skill] of skillActions[family][form - 1]!.entries()) {
    aliases[`${family}${form}-${skill}`] = `hit${index + 2}`;
    if (family === 'monkey' && form === 4 && skill !== 'jgaoyi') aliases[`monkey3-${skill}`] = `hit${index + 2}`;
  }
  return Object.freeze(aliases);
}

/** Source rows are data; the existing EntitySession owns the only body clock. */
export function createPetMonkeyHorseAnimationClock(family: 'monkey' | 'horse', form: 1 | 2 | 3 | 4): PetAnimationClock {
  const definitions: Record<string, PetAnimationDefinition> = {
    ...body[family][form].actions as Readonly<Record<string, PetAnimationDefinition>>,
  };
  for (const [alias, source] of Object.entries(getPetMonkeyHorseActionAliases(family, form))) {
    definitions[alias] = definitions[source]!;
  }
  return new PetAnimationClock(definitions, 'wait');
}
