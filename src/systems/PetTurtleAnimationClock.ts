import type { PetTurtleAssets } from '../assets/PetTurtleAssets';
import { PetAnimationClock, type PetAnimationDefinition } from './PetAnimationClock';

/** 223 supplies cells; the existing EntitySession owns their countdown and callbacks. */
export function createPetTurtleAnimationClock(assets: PetTurtleAssets, form: 1 | 2 | 3 | 4): PetAnimationClock {
  const definitions: Record<string, PetAnimationDefinition> = {};
  for (const action of ['wait', 'walk', 'hurt', 'hit1', 'hit2', 'dead']) {
    const source = assets.bodyAnimation(form, action);
    const loops = action === 'wait' || action === 'walk';
    definitions[action] = {
      row: source.row,
      holds: source.cells.map(cell => cell.holdTicks),
      loops,
      completionAction: loops || action === 'dead' ? undefined : 'wait',
      completionEvent: loops ? undefined : action === 'dead' ? 'dead-complete' : 'complete',
      completionStatic: action === 'hurt',
      // PetTurtle{1..4}.enterFrameFunc: normal differs after evolution; SLD does not.
      hit: action === 'hit1' ? { column: form === 1 ? 2 : 3, remaining: 10 }
        : action === 'hit2' ? { column: 2, remaining: 10 } : undefined,
    };
  }
  return new PetAnimationClock(definitions, 'wait');
}
