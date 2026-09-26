import assert from 'node:assert/strict';
import type { PetBehaviorContext } from '../src/systems/PetBehavior';
import { MonkeyPetBehavior } from '../src/systems/pet-behaviors/MonkeyPetBehavior';
import { HorsePetBehavior } from '../src/systems/pet-behaviors/HorsePetBehavior';
import './pet-normal-attack-session-tests';

// The family command has no second phase/chance owner. Source boundary tests
// above run the real Session; these assertions reject accidental duplication.
for (const behavior of [new MonkeyPetBehavior(1), new HorsePetBehavior(1)]) {
  const context = { target: undefined, hostTick: 23, hostFps: 24,
    random: () => { throw Error('Family command must not own ordinary AI RNG'); },
  } as unknown as PetBehaviorContext;
  assert.equal(behavior.basicAttack(context), undefined);
  assert.equal(behavior.basicAttack({ ...context, target: { id: 'target', x: 0, y: 0, isAlive: true } })?.type, 'basic-attack');
}
console.log('Family basic attack commands have no duplicate phase or RNG owner.');
