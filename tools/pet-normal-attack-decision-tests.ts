import assert from 'node:assert/strict';
import type { PetBehaviorContext } from '../src/systems/PetBehavior';
import { MonkeyPetBehavior } from '../src/systems/pet-behaviors/MonkeyPetBehavior';
import { HorsePetBehavior } from '../src/systems/pet-behaviors/HorsePetBehavior';

// Exercise both real consumers: RNG consumption is part of the existing behavior.
for (const create of [() => new MonkeyPetBehavior(1), () => new HorsePetBehavior(1)]) {
  const behavior = create();
  const events: string[] = [];
  let rolls: number[] = [];
  let calls = 0;
  const context = {
    target: undefined,
    deltaMs: 0,
    random: () => {
      calls++;
      assert.ok(rolls.length > 0, 'unexpected random draw');
      return rolls.shift()!;
    },
    emit: (event: { type: string }) => events.push(event.type),
  } as unknown as PetBehaviorContext;
  const advance = (deltaMs: number) => behavior.updateEffects({ ...context, deltaMs });
  assert.equal(behavior.basicAttack(context), undefined);
  assert.equal(calls, 0, 'no target must not consume RNG or start the interval');
  const targeted = { ...context, target: { id: 'target' } } as PetBehaviorContext;
  rolls = [0.7];
  assert.equal(behavior.basicAttack(targeted)?.type, 'basic-attack');
  assert.equal(calls, 1, 'successful attack consumes only the first roll');
  assert.equal(behavior.basicAttack(targeted), undefined);
  advance(999);
  assert.equal(behavior.basicAttack(targeted), undefined);
  assert.equal(calls, 1);
  advance(1);
  rolls = [0.700001, 0.299999];
  assert.equal(behavior.basicAttack(targeted), undefined);
  assert.deepEqual(events, ['wait']);
  assert.equal(calls, 3);
  advance(1000);
  rolls = [1, 0.3];
  assert.equal(behavior.basicAttack(targeted), undefined);
  assert.deepEqual(events, ['wait', 'chase']);
  assert.equal(calls, 5, 'second roll is conditional and preserves the strict wait boundary');

  // A separate owner's behavior must not share the first owner's throttle.
  const other = create();
  rolls = [0];
  assert.equal(other.basicAttack(targeted)?.type, 'basic-attack');
  assert.equal(behavior.basicAttack(targeted), undefined);
}

// Preserve horse's existing destroy reset without changing monkey's lifecycle contract.
const horse = new HorsePetBehavior(1);
const context = {
  target: { id: 'target' }, random: () => 0, emit: () => {},
} as unknown as PetBehaviorContext;
assert.equal(horse.basicAttack(context)?.type, 'basic-attack');
horse.destroy('runtime-destroyed');
assert.equal(horse.basicAttack(context)?.type, 'basic-attack');
console.log('Pet normal attack decision: both consumers, RNG boundaries, interval, owner isolation and horse reset passed.');
