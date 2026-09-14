import truth from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json';
import { getPetDragonBodyAsset } from '../assets/PetDragonAnimationAssets';
import { PetAnimationClock, type PetAnimationDefinition } from './PetAnimationClock';

/** The initial form's unconditional completion routes; later forms require their own verified conditions. */
export function createPetDragon1AnimationClock(): PetAnimationClock {
  return createPetDragonAnimationClock(1);
}

export function createPetDragonAnimationClock(formNumber: 1 | 2 | 3 | 4): PetAnimationClock {
  const body = getPetDragonBodyAsset(formNumber);
  const form = truth.forms.find(({ id }) => id === `dragon${formNumber}`)!;
  const definitions: Record<string, PetAnimationDefinition> = {};
  for (const action of body.timeline.actions) {
    const emit = Object.entries(form.actions).find(([id]) => id === action.id)?.[1].emitTiming;
    const routes = action.completion.routes;
    const conditional = routes.some(({ when }) => when.length > 0) || routes.length > 1;
    if (conditional && formNumber !== 4) throw new Error('Unexpected conditional dragon route.');
    const qlaoyi = formNumber === 4 && action.id === 'qlaoyi'
      ? truth.forms[3]!.actions.qlaoyi?.emitTiming : undefined;
    const linked = formNumber === 4 && ['sdcc', 'ltwj', 'qlaoyi', 'qlaoyi-ltwj-link'].includes(action.id);
    definitions[action.id] = {
      row: action.row, holds: action.cells.map(({ holdTicks }) => holdTicks), loops: action.loops,
      completionAction: action.completion.destroys || linked ? undefined : routes[0]?.target,
      completionEvent: action.loops ? undefined : action.completion.destroys ? 'dead-complete' : 'complete',
      completionStatic: action.completion.setStatic,
      hit: emit && 'remainingHoldCount' in emit && typeof emit.remainingHoldCount === 'number'
        ? { column: emit.sequence!, remaining: emit.remainingHoldCount } : undefined,
      hits: qlaoyi?.cloneRemainingCounts?.map(remaining => ({ column: 0, remaining })),
      enterEvent: action.id === 'qlaoyi-ltwj-link',
    };
  }
  return new PetAnimationClock(definitions, 'wait');
}
