import ground from '../assets/pet-monkey-horse-ground.json';
import { getPetMonkeyHorseActionAliases } from './PetMonkeyHorseAnimationClock';
import type { PetGroundMovementDefinition } from './PetGroundSessionMovement';

type SourceFlags = Readonly<{ attacking: boolean; hurt: boolean; immobileOnFloor: boolean; suppressMove: boolean }>;

/** Original movement facts, with exactly the same public aliases as the body clock. */
export function getPetMonkeyHorseGroundDefinition(
  family: 'monkey' | 'horse', form: 1 | 2 | 3 | 4,
): PetGroundMovementDefinition {
  const input = ground.forms[family][form];
  const initialFacingX = input.movement.initialFacingX;
  if (initialFacingX !== -1 && initialFacingX !== 1) throw new Error('Invalid original pet facing');
  const actions: Record<string, SourceFlags> = { ...input.sourceActions };
  for (const [alias, source] of Object.entries(getPetMonkeyHorseActionAliases(family, form))) {
    const flags = actions[source];
    if (!flags) throw new Error(`Missing original movement action ${family}${form}/${source}`);
    actions[alias] = flags;
  }
  const matching = (key: keyof SourceFlags) => Object.entries(actions).filter(([, flags]) => flags[key]).map(([action]) => action);
  return Object.freeze({
    collision: input.collision, ...input.movement, initialFacingX,
    attackActions: matching('attacking'), hurtActions: matching('hurt'),
    immobileGroundActions: matching('immobileOnFloor'), suppressMoveActions: matching('suppressMove'),
  });
}
