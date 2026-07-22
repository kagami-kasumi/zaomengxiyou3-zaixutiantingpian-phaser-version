import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  createStage12FbEnter,
  registerStage12FbEnterHit,
  Stage12FbEnterFrameCount,
  Stage12FbEnterHitCooldownMs,
  Stage12FbEnterRequiredHits,
  Stage12FbEnterStayFrames,
  updateStage12FbEnter,
} from '../src/systems/Stage12FbEnterSystem';

function testFiveHitsWithSharedOneSecondCooldown(): void {
  const entrance = createStage12FbEnter();
  assert.equal(entrance.remainingHits, Stage12FbEnterRequiredHits);
  for (let hit = 1; hit <= Stage12FbEnterRequiredHits; hit += 1) {
    assert.equal(registerStage12FbEnterHit(entrance), true);
    assert.equal(entrance.remainingHits, Stage12FbEnterRequiredHits - hit);
    assert.equal(registerStage12FbEnterHit(entrance), false, 'cooldown must reject duplicate hits');
    if (hit < Stage12FbEnterRequiredHits) {
      updateStage12FbEnter(entrance, Stage12FbEnterHitCooldownMs - 1, 0);
      assert.equal(registerStage12FbEnterHit(entrance), false);
      updateStage12FbEnter(entrance, 1, 0);
    }
  }
  assert.equal(entrance.phase, 'opening');
  assert.equal(entrance.frameIndex, 1, 'the fifth hit starts playback at source frame 2');
  assert.equal(registerStage12FbEnterHit(entrance), false, 'opening entrance ignores further bullets');
}

function testFinalFrameGatesSharedSeventyTwoFrameStay(): void {
  const entrance = openEntrance();
  assert.equal(entrance.phase, 'opening');
  assert.equal(updateStage12FbEnter(entrance, 0, 1), false, 'stay is ignored before final frame');
  assert.equal(entrance.stayFramesRemaining, Stage12FbEnterStayFrames);

  updateStage12FbEnter(entrance, 2_000, 0);
  assert.equal(entrance.phase, 'open');
  assert.equal(entrance.frameIndex, Stage12FbEnterFrameCount - 1);

  for (let frame = 0; frame < 30; frame += 1) {
    assert.equal(updateStage12FbEnter(entrance, 16, frame % 2 === 0 ? 1 : 2), false);
  }
  assert.equal(entrance.stayFramesRemaining, 42, 'either or alternating players share one stay counter');
  updateStage12FbEnter(entrance, 16, 0);
  assert.equal(entrance.stayFramesRemaining, Stage12FbEnterStayFrames, 'all players leaving resets stay');

  for (let frame = 1; frame < Stage12FbEnterStayFrames; frame += 1) {
    assert.equal(updateStage12FbEnter(entrance, 16, 1), false);
  }
  assert.equal(updateStage12FbEnter(entrance, 16, 2), true);
  assert.equal(entrance.phase, 'transitioned');
  assert.equal(updateStage12FbEnter(entrance, 16, 2), false, 'transition is one-shot');
}

function testSceneTransitionDoesNotUseVictoryOrSavePath(): void {
  const repoRoot = process.cwd();
  const sceneSource = readFileSync(path.join(repoRoot, 'src/scenes/Stage12Scene.ts'), 'utf8');
  const transitionSource = readFileSync(
    path.join(repoRoot, 'src/scenes/Stage51TransitionScene.ts'),
    'utf8',
  );
  const bridgeSource = readFileSync(
    path.join(repoRoot, 'src/scenes/stage12/Stage12FbEnterBridge.ts'),
    'utf8',
  );
  const transitionBranch = sceneSource.slice(
    sceneSource.indexOf("if (result === 'fb-entered')"),
    sceneSource.indexOf('this.resultOverlay = showStage12Result'),
  );
  assert.ok(transitionBranch.includes("this.scene.start('Stage51TransitionScene')"));
  assert.ok(!transitionBranch.includes('showStage12Result'));
  assert.ok(!transitionBranch.includes('saveLevelUnlockProgress'));
  assert.ok(transitionSource.includes("this.scene.start('HeavenMapScene')"));
  assert.ok(!transitionSource.includes("this.scene.start('Stage12Scene')"));
  assert.ok(bridgeSource.includes('createProjectile(scene, player.x, player.y)'));
  assert.ok(bridgeSource.includes('Math.min(previousX, projectile.view.x) <= collisionWorldX + 18'));
  assert.ok(bridgeSource.includes('registerStage12FbEnterHit(model)'));
}

function openEntrance() {
  const entrance = createStage12FbEnter();
  for (let hit = 0; hit < Stage12FbEnterRequiredHits; hit += 1) {
    registerStage12FbEnterHit(entrance);
    if (hit < Stage12FbEnterRequiredHits - 1) {
      updateStage12FbEnter(entrance, Stage12FbEnterHitCooldownMs, 0);
    }
  }
  return entrance;
}

testFiveHitsWithSharedOneSecondCooldown();
testFinalFrameGatesSharedSeventyTwoFrameStay();
testSceneTransitionDoesNotUseVictoryOrSavePath();

console.log('Stage 1-2 fbEnter hit, animation, stay, and transition tests passed.');
