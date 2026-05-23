import assert from 'node:assert/strict';
import {
  createHitRegistry,
  resolveHitOnce,
} from '../src/systems/CombatSystem';
import {
  createVerticalClimbState,
  updateVerticalClimbCamera,
  updateVerticalClimbSpawn,
} from '../src/systems/LevelSystem';
import {
  createMonster30,
  updateMonster30,
} from '../src/systems/Monster30System';

testMonster30StableIds();
testHitRegistryAllowsDistinctTargets();
testStopPointRequiresSpawnedWaveBeforeClearing();

console.log('System tests passed.');

function testMonster30StableIds(): void {
  const first = createMonster30(0, 0, 'm30-a');
  const second = createMonster30(0, 0, 'm30-b');
  first.attackDecisionTimerMs = 0;
  second.attackDecisionTimerMs = 0;

  const targets = [{ slot: 'p1' as const, x: 0, y: 0 }];
  updateMonster30(first, targets, 1, () => 0);
  updateMonster30(second, targets, 1, () => 0);

  assert.equal(first.id, 'm30-a');
  assert.equal(second.id, 'm30-b');
  assert.equal(first.activeAttack?.attackId, 'm30-a-hit1-1');
  assert.equal(second.activeAttack?.attackId, 'm30-b-hit1-1');
}

function testHitRegistryAllowsDistinctTargets(): void {
  const registry = createHitRegistry();
  const attackId = 'p1-normal-1';

  assert.equal(resolveHitOnce(registry, attackId, 'm30-a'), true);
  assert.equal(resolveHitOnce(registry, attackId, 'm30-a'), false);
  assert.equal(resolveHitOnce(registry, attackId, 'm30-b'), true);
}

function testStopPointRequiresSpawnedWaveBeforeClearing(): void {
  const state = createVerticalClimbState(600);

  updateVerticalClimbCamera(state, 2000, 16, 600);
  assert.equal(state.activeStopIndex, 0);

  assert.equal(updateVerticalClimbSpawn(state, 16, 0, 1), true);
  assert.equal(state.stopPoints[0].waveSpawned, true);
  assert.equal(state.stopPoints[0].cleared, false);
  assert.equal(state.activeStopIndex, 0);

  assert.equal(updateVerticalClimbSpawn(state, 16, 2, 1), false);
  assert.equal(state.stopPoints[0].cleared, false);

  assert.equal(updateVerticalClimbSpawn(state, 16, 0, 1), false);
  assert.equal(state.stopPoints[0].cleared, true);
  assert.equal(state.activeStopIndex, -1);
}
