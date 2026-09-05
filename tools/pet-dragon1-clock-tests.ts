import assert from 'node:assert/strict';
import { createPetDragon1AnimationClock } from '../src/systems/PetDragonAnimationClock';
import { getPetDragonBodyAction, getPetDragonBodyFrame } from '../src/assets/PetDragonAnimationAssets';

// Independent source anchors: PetDragon1.as holds at line75, enter at181-243,
// completion at145-170; enter occurs before decrement (BaseBitmapDataClip:473-512).
const expected = [
  { action: 'normal', ticks: 16, hit: [7], completion: 'complete', route: 'wait' },
  { action: 'fs', ticks: 18, hit: [17], completion: 'complete', route: 'wait' },
  { action: 'hurt', ticks: 8, hit: [], completion: 'complete', route: 'wait' },
  { action: 'dead', ticks: 16, hit: [], completion: 'dead-complete', route: 'dead' },
] as const;

for (const hostFps of [20, 24, 30]) {
  for (const contract of expected) {
    const clock = createPetDragon1AnimationClock();
    clock.select(contract.action, 41);
    const hits: number[] = [];
    const completions: number[] = [];
    for (let tick = 1; tick <= contract.ticks; tick++) {
      const cell = getPetDragonBodyFrame(1, contract.action, tick - 1);
      const before = clock.snapshot();
      assert.equal(before.row, cell.row);
      assert.equal(before.column, cell.column);
      assert.equal(before.remainingHoldCount, cell.remainingHoldCount);
      for (const event of clock.advance(1000 / hostFps, hostFps)) {
        assert.equal(event.action, contract.action);
        assert.equal(event.actionToken, 41);
        assert.equal(event.elapsedHostTick, tick);
        if (event.eventName === 'hit') hits.push(tick);
        else { assert.equal(event.eventName, contract.completion); completions.push(tick); }
      }
    }
    assert.deepEqual(hits, contract.hit);
    assert.deepEqual(completions, [contract.ticks]);
    assert.equal(clock.snapshot().action, contract.route);
    if (contract.action === 'dead') {
      assert.equal(clock.snapshot().complete, true);
      assert.deepEqual(clock.advance(5000, hostFps), []);
    }
  }
  const clock = createPetDragon1AnimationClock();
  clock.advance(500 / hostFps, hostFps);
  assert.equal(clock.snapshot().remainingHoldCount, 2);
  clock.advance(500 / hostFps, hostFps);
  assert.equal(clock.snapshot().remainingHoldCount, 1);
  clock.select('walk', 1);
  assert.equal(clock.snapshot().remainingHoldCount, 1, 'same row must preserve countdown');
  clock.advance(1000 / hostFps, hostFps);
  assert.equal(clock.snapshot().column, 1);
  clock.select('wait', 2);
  assert.equal(clock.snapshot().column, 1, 'same row must preserve cell');
  assert.equal(clock.snapshot().keyFrameIndex, 0, 'state change resets logical key count independently');
  clock.advance((getPetDragonBodyAction(1, 'wait').totalHostTicks - 2) * 1000 / hostFps, hostFps);
  assert.equal(clock.snapshot().column, 0);
  assert.equal(clock.snapshot().keyFrameIndex, 5, 'physical column wraps before logical frameOver');
  clock.select('wait', 2);
  assert.equal(clock.snapshot().keyFrameIndex, 5, 'repeating the same state preserves logical progress');
  clock.advance(2 * 1000 / hostFps, hostFps);
  assert.equal(clock.snapshot().column, 0, 'frameOver resets physical column only after all logical cells');
  assert.equal(clock.snapshot().keyFrameIndex, 0);
  clock.select('normal', 3);
  clock.advance(6 * 1000 / hostFps, hostFps);
  clock.select('hurt', 4);
  assert.ok(clock.advance(8 * 1000 / hostFps, hostFps).every((event) => event.eventName !== 'hit'),
    'interrupted normal must not emit its abandoned hit');
}
console.log('Dragon1 clock: all cells, enter-before-decrement hits, completions, same-row preservation and interruption passed at 20/24/30fps.');
