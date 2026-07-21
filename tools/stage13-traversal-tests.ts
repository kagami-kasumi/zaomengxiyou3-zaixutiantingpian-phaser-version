import assert from 'node:assert/strict';
import type { PlayerInputState } from '../src/systems/InputSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
} from '../src/systems/LevelHeroMovementSystem';
import {
  STAGE13_GROUND_PLATFORM_ID,
  STAGE13_GROUND_TOP_Y,
  stage13StopPoints,
} from '../src/systems/Stage13Layout';
import {
  getStage13CameraScrollX,
  getStage13TravelRight,
  hasReachedStage13StopPoint,
  stage13MovementPlatforms,
  STAGE13_SCREEN_RIGHT_X,
} from '../src/systems/Stage13TraversalSystem';

assert.equal(STAGE13_GROUND_TOP_Y, 501.0003962);
const firstStopX = stage13StopPoints[0].x;
assert.equal(getStage13TravelRight(0), firstStopX);
assert.equal(getStage13CameraScrollX(firstStopX, 0), firstStopX - STAGE13_SCREEN_RIGHT_X);
assert.equal(hasReachedStage13StopPoint(firstStopX - 0.01, 0), false);
assert.equal(hasReachedStage13StopPoint(firstStopX, 0), true);

const runtime = createLevelHeroMovementRuntime([
  { x: 100, y: STAGE13_GROUND_TOP_Y, width: 96, currentPlatformId: STAGE13_GROUND_PLATFORM_ID },
  { x: 100, y: STAGE13_GROUND_TOP_Y, width: 96, currentPlatformId: STAGE13_GROUND_PLATFORM_ID },
]);
const idle = input('p1');
const p2Idle = input('p2');
updateLevelHeroMovementRuntime(
  runtime,
  [{ ...idle, jump: true }, { ...p2Idle, jump: true }],
  [true, true],
  () => ({ platforms: stage13MovementPlatforms, bounds: { left: -30, right: firstStopX + 48 } }),
  16,
  16,
);
assert.equal(runtime.members[0].movement.jumpCount, 1, 'P1 K contract uses shared jump runtime');
assert.equal(runtime.members[1].movement.jumpCount, 1, 'P2 keypad 2 contract uses shared jump runtime');
const frozenY = runtime.members[1].movement.y;
updateLevelHeroMovementRuntime(
  runtime,
  [idle, p2Idle],
  [true, false],
  () => ({ platforms: stage13MovementPlatforms, bounds: { left: -30, right: firstStopX + 48 } }),
  32,
  16,
);
assert.equal(runtime.members[1].movement.y, frozenY, 'disabled/dead players are not moved');

function input(slot: 'p1' | 'p2'): PlayerInputState {
  return {
    slot, moveX: 0, down: false, up: false, attack: false, jump: false,
    skillSlots: [false, false, false, false, false], special: false, magicWeapon: false,
  };
}

console.log('Stage 1-3 traversal and shared level hero movement tests passed.');
