import truth from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json';
import { getPetDragonBodyAsset } from '../assets/PetDragonAnimationAssets';
import { PetAnimationClock, type PetAnimationDefinition } from './PetAnimationClock';

/** The initial form's unconditional completion routes; later forms require their own verified conditions. */
export function createPetDragon1AnimationClock(): PetAnimationClock {
  return createPetDragonAnimationClock(1);
}

export function createPetDragonAnimationClock(formNumber: 1 | 2 | 3): PetAnimationClock {
  const body = getPetDragonBodyAsset(formNumber);
  const form = truth.forms.find(({ id }) => id === `dragon${formNumber}`)!;
  const definitions: Record<string, PetAnimationDefinition> = {};
  for (const action of body.timeline.actions) {
    const emit = Object.entries(form.actions).find(([id]) => id === action.id)?.[1].emitTiming;
    const routes = action.completion.routes;
    if (routes.some(({ when }) => when.length > 0) || routes.length > 1) {
      throw new Error('Dragon1 clock requires an unconditional verified completion route.');
    }
    definitions[action.id] = {
      row: action.row, holds: action.cells.map(({ holdTicks }) => holdTicks), loops: action.loops,
      completionAction: action.completion.destroys ? undefined : routes[0]?.target,
      completionEvent: action.loops ? undefined : action.completion.destroys ? 'dead-complete' : 'complete',
      completionStatic: action.completion.setStatic,
      hit: emit ? { column: emit.sequence, remaining: emit.remainingHoldCount } : undefined,
    };
  }
  return new PetAnimationClock(definitions, 'wait');
}
