import assert from 'node:assert/strict';
import {
  createStage13Flow,
  defeatStage13Enemy,
  Stage13FailureDelayMs,
  touchStage13StopPoint,
  tryCompleteStage13,
  updateStage13PartyFailure,
  updateStage13Spawners,
  type Stage13FlowModel,
} from '../src/systems/Stage13FlowSystem';

function drainActiveWave(flow: Stage13FlowModel): number {
  const start = flow.generatedCount;
  for (let guard = 0; guard < 100 && flow.activeStopPointIdx !== undefined; guard += 1) {
    const spawned = updateStage13Spawners(flow, 10_000);
    for (const enemy of spawned) defeatStage13Enemy(flow, enemy.id);
  }
  assert.equal(flow.activeStopPointIdx, undefined, 'wave must finish inside guard');
  return flow.generatedCount - start;
}

function reachFinalStop(flow: Stage13FlowModel): void {
  for (let idx = 0; idx < 4; idx += 1) {
    assert.equal(touchStage13StopPoint(flow, idx), true);
    assert.equal(drainActiveWave(flow), [9, 10, 12, 13][idx]);
  }
  assert.equal(flow.nextStopPointIdx, 4);
}

const single = createStage13Flow(1, { unlockedStage: 1, unlockedLevel: 3 });
assert.equal(single.maxMonstersOnScreen, 6);
assert.equal(touchStage13StopPoint(single, 1), false, 'waves cannot be skipped');
reachFinalStop(single);
assert.equal(touchStage13StopPoint(single, 4), true);
const firstFinalSpawn = updateStage13Spawners(single, 10_000);
assert.deepEqual(firstFinalSpawn.map((enemy) => enemy.enemyType), [5, 30, 30]);
const boss = firstFinalSpawn.find((enemy) => enemy.enemyType === 5);
assert.ok(boss);
assert.equal(boss.maxHp, 2_788);
assert.equal(defeatStage13Enemy(single, boss.id), true);
assert.equal(single.doorVisible, true, 'Monster5 alone opens the door');
assert.equal(single.aliveEnemies.size, 2, 'flying adds remain alive when the door opens');
assert.ok(single.activeSpawners.some((spawner) => spawner.remaining > 0));
assert.equal(tryCompleteStage13(single, true, true), true, 'remaining flying adds do not block victory');
assert.deepEqual(single.unlockProgress, { unlockedStage: 2, unlockedLevel: 1 });
assert.equal(tryCompleteStage13(single, true, true), false, 'victory is idempotent');

const cappedSingle = createStage13Flow(1);
reachFinalStop(cappedSingle);
touchStage13StopPoint(cappedSingle, 4);
updateStage13Spawners(cappedSingle, 10_000);
updateStage13Spawners(cappedSingle, 10_000);
updateStage13Spawners(cappedSingle, 10_000);
assert.equal(cappedSingle.aliveEnemies.size, 6);
assert.equal(updateStage13Spawners(cappedSingle, 10_000).length, 0, 'single-player cap pauses ready spawners');

const cappedDouble = createStage13Flow(2);
reachFinalStop(cappedDouble);
touchStage13StopPoint(cappedDouble, 4);
updateStage13Spawners(cappedDouble, 10_000);
updateStage13Spawners(cappedDouble, 10_000);
updateStage13Spawners(cappedDouble, 10_000);
updateStage13Spawners(cappedDouble, 10_000);
assert.equal(cappedDouble.aliveEnemies.size, 8);
assert.equal(cappedDouble.maxMonstersOnScreen, 8);

const failure = createStage13Flow(2, { unlockedStage: 1, unlockedLevel: 3 });
assert.equal(updateStage13PartyFailure(failure, 1, 10_000), 'playing');
assert.equal(updateStage13PartyFailure(failure, 0, 16), 'failure-pending');
assert.equal(updateStage13PartyFailure(failure, 0, Stage13FailureDelayMs - 1), 'failure-pending');
assert.equal(updateStage13PartyFailure(failure, 0, 1), 'failed');
assert.deepEqual(failure.unlockProgress, { unlockedStage: 1, unlockedLevel: 3 });

const ahead = createStage13Flow(1, { unlockedStage: 2, unlockedLevel: 1 });
ahead.doorVisible = true;
assert.equal(tryCompleteStage13(ahead, true, true), true);
assert.deepEqual(ahead.unlockProgress, { unlockedStage: 2, unlockedLevel: 1 });

console.log('Stage 1-3 waves, cap, boss door, failure, and unlock tests passed.');
