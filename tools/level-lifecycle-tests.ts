import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  LevelLifecycle,
  doLevelBoundsOverlap,
} from '../src/systems/LevelLifecycleSystem';
import { createTestLevelCompletionAttempt } from './level-lifecycle-test-helpers';

function testFailureLifecycleIsSharedAndRecoverable(): void {
  const lifecycle = createLifecycle();
  assert.equal(lifecycle.updatePartyFailure(0, 16), 'failure-pending');
  assert.equal(lifecycle.failureDelayRemainingMs, 2_500);
  assert.equal(lifecycle.updatePartyFailure(1, 1_000), 'playing');
  assert.equal(lifecycle.failureDelayRemainingMs, 0);
  assert.equal(lifecycle.updatePartyFailure(0, 0), 'failure-pending');
  assert.equal(lifecycle.updatePartyFailure(0, 2_499), 'failure-pending');
  assert.equal(lifecycle.updatePartyFailure(0, 1), 'failed');
  assert.equal(lifecycle.updatePartyFailure(1, 10_000), 'failed');
}

function testDefaultExitStrategyRequiresVisibleOverlapUpAndEligibility(): void {
  for (const attempt of [
    createTestLevelCompletionAttempt({ exitAvailable: false }),
    createTestLevelCompletionAttempt({ inside: false }),
    createTestLevelCompletionAttempt({ upPressed: false }),
    createTestLevelCompletionAttempt({ eligible: false }),
  ]) {
    assert.equal(createLifecycle().tryComplete(attempt), false);
  }

  const lifecycle = createLifecycle();
  assert.equal(lifecycle.tryComplete(createTestLevelCompletionAttempt()), true);
  assert.equal(lifecycle.phase, 'cleared');
  assert.deepEqual(lifecycle.unlockProgress, { unlockedStage: 1, unlockedLevel: 2 });
  assert.equal(lifecycle.tryComplete(createTestLevelCompletionAttempt()), false);
}

function testAnyEligiblePlayerCanUseTheExit(): void {
  const lifecycle = createLifecycle(2);
  const attempt = createTestLevelCompletionAttempt();
  assert.equal(lifecycle.tryComplete({
    ...attempt,
    players: [
      { ...attempt.players[0]!, upPressed: false },
      { ...attempt.players[0]!, upPressed: true },
    ],
  }), true);
}

function testSpecialLevelCanInjectANarrowCompletionStrategy(): void {
  const lifecycle = new LevelLifecycle({
    playerCount: 1,
    unlockProgress: { unlockedStage: 1, unlockedLevel: 1 },
    unlockTarget: { unlockedStage: 1, unlockedLevel: 2 },
    completionStrategy: (attempt) => attempt.exitAvailable && attempt.players.length === 2,
  });
  const attempt = createTestLevelCompletionAttempt({ inside: false, upPressed: false });
  assert.equal(lifecycle.tryComplete(attempt), false);
  assert.equal(lifecycle.tryComplete({ ...attempt, players: [...attempt.players, attempt.players[0]!] }), true);
}

function testBoundsUseAreaOverlapInsteadOfSpriteOriginPoints(): void {
  assert.equal(doLevelBoundsOverlap(
    { left: 80, right: 120, top: 220, bottom: 280 },
    { left: 100, right: 200, top: 100, bottom: 240 },
  ), true);
  assert.equal(doLevelBoundsOverlap(
    { left: 80, right: 99.9, top: 220, bottom: 280 },
    { left: 100, right: 200, top: 100, bottom: 240 },
  ), false);
}

function testCompletedLevelsCannotReintroducePrivateLifecycleOwners(): void {
  const flowFiles = ['11', '12', '13', '21', '22'].map((id) => path.join(
    process.cwd(),
    'src',
    'systems',
    `Stage${id}FlowSystem.ts`,
  ));
  const bridgeFiles = [
    'src/scenes/test-scene/TestSceneBossArena.ts',
    'src/scenes/stage12/Stage12GameplayBridge.ts',
    'src/scenes/stage13/Stage13GameplayBridge.ts',
    'src/scenes/stage21/Stage21GameplayBridge.ts',
    'src/scenes/stage22/Stage22GameplayBridge.ts',
  ];
  const flowSources = flowFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
  const bridgeSources = bridgeFiles
    .map((file) => readFileSync(path.join(process.cwd(), file), 'utf8'))
    .join('\n');

  assert.doesNotMatch(flowSources, /tryCompleteStage\d+/);
  assert.doesNotMatch(flowSources, /updateStage\d+PartyFailure/);
  assert.doesNotMatch(flowSources, /failureDelayRemainingMs\s*=/);
  assert.equal((flowSources.match(/extends LevelLifecycle/g) ?? []).length, 5);
  const directAttempts = (bridgeSources.match(/createLevelCompletionAttempt/g) ?? []).length;
  const transferDoorAttempts = (bridgeSources.match(/\.createCompletionAttempt/g) ?? []).length;
  assert.equal(directAttempts + transferDoorAttempts >= 5, true);
}

function createLifecycle(playerCount: 1 | 2 = 1): LevelLifecycle {
  return new LevelLifecycle({
    playerCount,
    unlockProgress: { unlockedStage: 1, unlockedLevel: 1 },
    unlockTarget: { unlockedStage: 1, unlockedLevel: 2 },
  });
}

testFailureLifecycleIsSharedAndRecoverable();
testDefaultExitStrategyRequiresVisibleOverlapUpAndEligibility();
testAnyEligiblePlayerCanUseTheExit();
testSpecialLevelCanInjectANarrowCompletionStrategy();
testBoundsUseAreaOverlapInsteadOfSpriteOriginPoints();
testCompletedLevelsCannotReintroducePrivateLifecycleOwners();

console.log('Level lifecycle and completed-level architecture tests passed.');
