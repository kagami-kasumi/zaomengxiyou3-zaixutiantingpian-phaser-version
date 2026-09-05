import assert from 'node:assert/strict';
import { getPetDragonCollision } from '../src/assets/PetDragonAnimationAssets';
import { stepPetGroundMotion, type PetGroundMotion, type PetGroundWall } from '../src/systems/PetGroundMovementSystem';

// Source: BaseObject.move:601-610, nearToWall:551-596, isWalkOrRun:1041-1043.
// These are the static axis-aligned branch only, not a claim about slopes or full game movement.
const collision = getPetDragonCollision(1);
const profile = { collision, gravity: 1.5, speed: 5, attacking: false, hurt: false,
  mayMoveDuringGroundAttack: false };
const floor: PetGroundWall = { id: 'floor', left: -100, right: 100, top: 100, bottom: 120, usesWallTolerance: true };
const state = (changes: Partial<PetGroundMotion> = {}): PetGroundMotion => ({
  x: 0, y: 0, velocityX: 0, velocityY: 0, direction: 1, ...changes,
});
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

const falling = state();
for (let i = 0; i < 3; i++) stepPetGroundMotion(falling, { ...profile, walls: [] });
close(falling.x, 15);
close(falling.y, 4.5);
close(falling.velocityY, 4.5);

const groundY = 100 - 0.1 - collision.height / 2;
const standing = state({ y: groundY, velocityY: 1.5, standingOn: 'floor' });
const landing = stepPetGroundMotion(standing, { ...profile, walls: [floor] });
assert.equal(landing.landed, true);
close(standing.y, groundY);
close(standing.velocityY, 1.5);
assert.equal(standing.standingOn, floor.id);
close(standing.x, 5);

const attacking = state({ y: groundY, velocityY: 1.5, standingOn: 'floor' });
stepPetGroundMotion(attacking, { ...profile, walls: [floor], attacking: true });
assert.equal(attacking.x, 0, 'ground attack zeros speed before moving');
stepPetGroundMotion(attacking, { ...profile, walls: [floor], attacking: false });
assert.equal(attacking.x, 5, 'completion preserves direction and resumes the same tick');

const airborneAttack = state();
stepPetGroundMotion(airborneAttack, { ...profile, walls: [], attacking: true });
assert.equal(airborneAttack.x, 5, 'ground attack restriction must not freeze airborne horizontal motion');

const wall: PetGroundWall = { id: 'wall', left: 100, right: 120, top: 0, bottom: 100, usesWallTolerance: true };
const right = state({ x: 84, y: 50 });
assert.equal(stepPetGroundMotion(right, { ...profile, walls: [wall] }).hitSide, true);
close(right.x, wall.left - 2 - collision.width / 2);
assert.equal(right.velocityX, 0);
const left = state({ x: 137, y: 50, direction: -1 });
assert.equal(stepPetGroundMotion(left, { ...profile, walls: [wall] }).hitSide, true);
close(left.x, wall.right + 2 + collision.width / 2);

const ceiling: PetGroundWall = { ...floor, id: 'ceiling', top: 0, bottom: 20 };
const rising = state({ y: 37, velocityY: -5, direction: 0 });
assert.equal(stepPetGroundMotion(rising, { ...profile, walls: [ceiling] }).hitHead, true);
close(rising.y, 20 + 0.1 + collision.height / 2);
const passing = state({ y: 37, velocityY: -5, direction: 0 });
assert.equal(stepPetGroundMotion(passing, { ...profile, walls: [{ ...ceiling, through: true }] }).hitHead, false);
close(passing.y, 32);
const throughDown = state({ y: groundY, velocityY: 1.5, direction: 0 });
assert.equal(stepPetGroundMotion(throughDown, { ...profile, walls: [{ ...floor, throughDown: true }] }).landed, false);
assert.equal(throughDown.standingOn, undefined);

const drifting = state({ direction: 0, velocityX: 7 });
stepPetGroundMotion(drifting, { ...profile, walls: [] });
close(drifting.x, 7);
const hurtAttack = state({ velocityX: 7, standingOn: 'floor', y: groundY, velocityY: 1.5 });
stepPetGroundMotion(hurtAttack, { ...profile, walls: [floor], hurt: true, attacking: true });
close(hurtAttack.x, 7);
// A marker-only object does not receive the actual ThroughWall class landing exception.
const edge = state({ x: -120, y: groundY, velocityX: 30, velocityY: 1.5, direction: 0 });
assert.equal(stepPetGroundMotion({ ...edge }, { ...profile, walls: [{ ...floor, through: true }] }).landed, false);
assert.equal(stepPetGroundMotion({ ...edge }, { ...profile, walls: [{ ...floor, through: true,
  isThroughWallClass: true }] }).landed, true);

console.log('Pet static-wall motion: source gravity order, registration versus snap, attack ground/air, side/head and through flags passed.');
