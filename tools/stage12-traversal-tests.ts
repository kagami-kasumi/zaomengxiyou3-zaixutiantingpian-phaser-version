import assert from 'node:assert/strict';
import { createHeroMovement, updateHeroMovement } from '../src/systems/HeroMovementSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';
import {
  STAGE12_GROUND_PLATFORM_ID,
  STAGE12_GROUND_TOP_Y,
  stage12StopPoints,
} from '../src/systems/Stage12Layout';
import {
  getStage12CameraScrollX,
  getStage12TravelRight,
  hasReachedStage12StopPoint,
  stage12MovementPlatforms,
  STAGE12_SCREEN_RIGHT_X,
} from '../src/systems/Stage12TraversalSystem';

assert.equal(STAGE12_GROUND_TOP_Y, 501.0501981);
assert.equal(stage12MovementPlatforms[0].id, STAGE12_GROUND_PLATFORM_ID);

const firstStopX = stage12StopPoints[0].x;
assert.equal(getStage12TravelRight(0), firstStopX);
assert.equal(getStage12CameraScrollX(firstStopX, 0), firstStopX - STAGE12_SCREEN_RIGHT_X);
assert.equal(hasReachedStage12StopPoint(firstStopX - 0.01, 0), false);
assert.equal(hasReachedStage12StopPoint(firstStopX, 0), true);

const hero = createHeroMovement(100, STAGE12_GROUND_TOP_Y, 96);
hero.currentPlatformId = STAGE12_GROUND_PLATFORM_ID;
const idle: PlayerInputState = {
  slot: 'p1', moveX: 0, down: false, up: false, attack: false, jump: false,
  skillSlots: [false, false, false, false, false], special: false, magicWeapon: false,
};
const jump = { ...idle, jump: true };
updateHeroMovement(hero, jump, idle, stage12MovementPlatforms, { left: -28, right: firstStopX + 48 }, 16, 16);
assert.equal(hero.grounded, false);
assert.equal(hero.jumpCount, 1);
assert.ok(hero.y < STAGE12_GROUND_TOP_Y, 'K jump must move the hero above the ground line');

console.log('Stage 1-2 traversal, ground alignment, and jump tests passed.');
