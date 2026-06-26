import assert from 'node:assert/strict';
import {
  createHeroNormalAttack,
  requestRole5MarkedTeleport,
  Role5NormalAttackTuning,
  setHeroWeaponMode,
  setRole5EnergyThreshold,
  updateHeroNormalAttack,
  updateRole5NormalAttackState,
} from '../../src/systems/HeroNormalAttackSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';

export function runRole5NormalAttackTests(): void {
  testSwordAndSpearNormalAttackFamilies();
  testRole5SpearEnergyUsesExplicitThreshold();
  testRole5MarkedTeleportSwitchesSwordToSpearAndClearsMarks();
}

function testSwordAndSpearNormalAttackFamilies(): void {
  const model = createHeroNormalAttack(5);
  const movement = createHeroMovement(300, 200);

  let event = attack(model, movement, 0);
  assert.equal(event?.attack.actionName, 'hit18');
  assert.equal(event?.attack.sourceSymbol, 'swordhit1');

  event = attack(model, movement, 250);
  assert.equal(event?.attack.actionName, 'hit19');

  setHeroWeaponMode(model, 'spear');
  event = attack(model, movement, 1_000);
  assert.equal(event?.attack.actionName, 'hit1');
  assert.equal(event?.attack.sourceSymbol, 'doSingleHit unresolved');

  movement.grounded = false;
  event = attack(model, movement, 1_250);
  assert.equal(event?.attack.actionName, 'hit5');

  movement.grounded = true;
  movement.runningDirection = 1;
  event = attack(model, movement, 1_500);
  assert.equal(event?.attack.actionName, 'hit114');
  assert.equal(event?.attack.sourceSymbol, 'Role5runattack');
}

function testRole5SpearEnergyUsesExplicitThreshold(): void {
  const model = createHeroNormalAttack(5);
  const movement = createHeroMovement(300, 200);
  setHeroWeaponMode(model, 'spear');

  attack(model, movement, 0);
  attack(model, movement, 250);
  attack(model, movement, 500);
  assert.equal(model.role5EnergyHits, 0);
  assert.equal(model.role5HitAddRemainingMs, 0);

  setRole5EnergyThreshold(model, 2);
  attack(model, movement, 1_000);
  attack(model, movement, 1_250);
  assert.equal(model.role5EnergyHits, 2);
  assert.equal(model.role5HitAddRemainingMs, 0);

  attack(model, movement, 1_500);
  assert.equal(model.role5EnergyHits, 0);
  assert.equal(model.role5HitAddRemainingMs, Role5NormalAttackTuning.hitAddDurationMs);

  updateRole5NormalAttackState(model, 900);
  assert.equal(model.role5HitAddRemainingMs, Role5NormalAttackTuning.hitAddDurationMs - 900);
  updateRole5NormalAttackState(model, 10_000);
  assert.equal(model.role5HitAddRemainingMs, 0);
}

function testRole5MarkedTeleportSwitchesSwordToSpearAndClearsMarks(): void {
  const model = createHeroNormalAttack(5);
  const movement = createHeroMovement(100, 100);
  const targets = [
    { id: 'high-ratio', x: 500, y: 480, hp: 90, maxHp: 100, role5Skill5RemainingMs: 1_000 },
    { id: 'low-ratio', x: 260, y: 520, hp: 20, maxHp: 100, role5Skill5RemainingMs: 800 },
    { id: 'unmarked', x: 900, y: 100, hp: 1, maxHp: 100 },
  ];

  const teleport = requestRole5MarkedTeleport(model, movement, targets);
  assert.deepEqual(teleport, {
    targetId: 'low-ratio',
    x: 260,
    y: 450,
    switchedToSpear: true,
  });
  assert.equal(model.weaponMode, 'spear');
  assert.equal(movement.x, 260);
  assert.equal(movement.y, 450);
  assert.equal(targets[0].role5Skill5RemainingMs, 0);
  assert.equal(targets[1].role5Skill5RemainingMs, 0);

  assert.equal(requestRole5MarkedTeleport(model, movement, targets), undefined);
}

function attack(
  model: ReturnType<typeof createHeroNormalAttack>,
  movement: ReturnType<typeof createHeroMovement>,
  timeMs: number,
) {
  return updateHeroNormalAttack(
    model,
    input(true),
    input(false),
    movement,
    timeMs,
  );
}

function input(attackPressed: boolean): PlayerInputState {
  return {
    slot: 'p1',
    moveX: 0,
    down: false,
    up: false,
    attack: attackPressed,
    jump: false,
    skillSlots: [false, false, false, false, false],
    special: false,
    magicWeapon: false,
  };
}
