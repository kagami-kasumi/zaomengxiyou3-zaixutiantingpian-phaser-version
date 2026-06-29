import assert from 'node:assert/strict';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import {
  createHeroNormalAttack,
  updateHeroNormalAttack,
} from '../../src/systems/HeroNormalAttackSystem';
import {
  calculateRole2BlbDamage,
  getRole2BlbMpCost,
  getRole2SjtDamageMultiplier,
  Role2PassiveTuning,
  updateRole2ChargedAttack,
  type Role2ChargeAttack,
} from '../../src/systems/Role2PassiveSkillSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';

export function runRole2PassiveSystemTests(): void {
  testBlbRequiresLearningMpAndHold();
  testSjtShortensChargeAndBoostsDamage();
  testBlbEarlyReleaseAndReentry();
  testChargedAttackUpdateReturnsNewAttack();
}

function testBlbRequiresLearningMpAndHold(): void {
  const movement = createHeroMovement(100, 200);
  const model = createHeroNormalAttack(2);
  const resource = { mp: 100, lastResult: '' };
  let event = updateHeroNormalAttack(
    model,
    input(true),
    input(false),
    movement,
    0,
    { blbLevel: 0, sjtLevel: 0, sourcePower: 12, resource },
  );
  assert.ok(event);
  assert.equal(event.attack.actionName, 'hit1');

  model.activeAttack = undefined;
  model.cooldownUntilMs = 0;
  resource.mp = getRole2BlbMpCost(1) - 1;
  event = updateHeroNormalAttack(
    model, input(true), input(false), movement, 1000,
    { blbLevel: 1, sjtLevel: 0, sourcePower: 12, resource },
  );
  assert.ok(event);
  assert.match(resource.lastResult, /blb mp/);
  assert.equal(event.attack.actionName, 'hit1');

  resource.mp = 100;
  model.activeAttack = undefined;
  model.cooldownUntilMs = 0;
  updateHeroNormalAttack(
    model, input(true), input(false), movement, 2000,
    { blbLevel: 1, sjtLevel: 0, sourcePower: 12, resource },
  );
  event = updateHeroNormalAttack(
    model, input(true), input(true), movement,
    2000 + Role2PassiveTuning.normalChargeFrames * 1000 / 60,
    { blbLevel: 1, sjtLevel: 0, sourcePower: 12, resource },
  );
  assert.ok(event);
  assert.equal(event.attack.actionName, 'hit2');
  assert.equal(resource.mp, 100 - getRole2BlbMpCost(1));
}

function testSjtShortensChargeAndBoostsDamage(): void {
  const movement = createHeroMovement(100, 200);
  const model = createHeroNormalAttack(2);
  const resource = { mp: 100, lastResult: '' };
  const options = { blbLevel: 3, sjtLevel: 4, sourcePower: 28, resource };
  updateHeroNormalAttack(model, input(true), input(false), movement, 0, options);
  const event = updateHeroNormalAttack(
    model, input(true), input(true), movement,
    Role2PassiveTuning.sjtChargeFrames * 1000 / 60,
    options,
  );
  assert.ok(event);
  assert.equal(event.attack.actionName, 'hit2');
  assert.equal(
    event.attack.damage,
    calculateRole2BlbDamage(3, 28, getRole2SjtDamageMultiplier(4)),
  );
}

function testBlbEarlyReleaseAndReentry(): void {
  const movement = createHeroMovement(100, 200);
  const model = createHeroNormalAttack(2);
  const resource = { mp: 100, lastResult: '' };
  const options = { blbLevel: 1, sjtLevel: 0, sourcePower: 12, resource };
  updateHeroNormalAttack(model, input(true), input(false), movement, 0, options);
  assert.equal(
    updateHeroNormalAttack(model, input(false), input(true), movement, 100, options),
    undefined,
  );
  assert.equal(model.activeAttack?.actionName, 'hit1');
  assert.match(resource.lastResult, /released early/);
  assert.equal(
    updateHeroNormalAttack(model, input(true), input(false), movement, 110, options),
    undefined,
  );
}

function testChargedAttackUpdateReturnsNewAttack(): void {
  const resource = { mp: 100, lastResult: '' };
  const attack = createRole2Hit1Attack();
  const charging = updateRole2ChargedAttack({
    attack,
    attackHeld: true,
    timeMs: 100,
    blbLevel: 1,
    sjtLevel: 0,
    sourcePower: 12,
    resource,
  });
  assert.ok(charging);
  assert.notEqual(charging.attack, attack);
  assert.equal(attack.hitboxActiveFromMs, 40);
  assert.equal(charging.attack.actionName, 'hit1');

  const converted = updateRole2ChargedAttack({
    attack,
    attackHeld: true,
    timeMs: Role2PassiveTuning.normalChargeFrames * 1000 / 60,
    blbLevel: 1,
    sjtLevel: 0,
    sourcePower: 12,
    resource,
  });
  assert.ok(converted);
  assert.notEqual(converted.attack, attack);
  assert.equal(attack.actionName, 'hit1');
  assert.equal(converted.attack.actionName, 'hit2');
}

function createRole2Hit1Attack(): Role2ChargeAttack {
  return {
    heroId: 2,
    actionName: 'hit1',
    effectKey: 'role2-hit1',
    sourceSymbol: 'Role2Bullet1',
    startedAtMs: 0,
    hitboxActiveFromMs: 40,
    hitboxActiveUntilMs: 120,
    endsAtMs: 220,
    damage: 10,
    attackKind: 'physics',
    hitboxOffsetX: 40,
    hitboxOffsetY: 0,
    hitboxWidth: 100,
    hitboxHeight: 80,
  };
}

function input(attack: boolean): PlayerInputState {
  return {
    slot: 'p1', moveX: 0, down: false, up: false, attack, jump: false,
    skillSlots: [false, false, false, false, false], special: false, magicWeapon: false,
  };
}
