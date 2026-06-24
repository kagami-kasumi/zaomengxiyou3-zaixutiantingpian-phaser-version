import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import {
  createHeroNormalAttack,
  setHeroWeaponMode,
} from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  calculateRole4MobilityDamage,
  getRole4MobilityMpCost,
  requestRole4MobilitySkillFromInput,
  Role4MobilitySkillTuning,
  updateRole4MobilitySkill,
  type Role4MobilitySkillName,
  type Role4MobilityWeaponMode,
} from '../../src/systems/Role4MobilitySkillSystem';

export function runRole4MobilitySkillTests(): void {
  testQljPreservesDynamicCheckAndExtraDeduction();
  testQljWeaponModesAndBackwardLeap();
  testTkjWeaponModesAndVerticalPhases();
  testDzjWeaponModesAndForwardDash();
  testRecoveryGatesAndPlayerIsolation();
}

function testQljPreservesDynamicCheckAndExtraDeduction(): void {
  const totalCost = getRole4MobilityMpCost({ skillName: 'qlj', level: 4 });
  const dynamicCost = totalCost - Role4MobilitySkillTuning.qljExtraMp;
  const exactDynamic = fixture('p1', 'qlj', 4, 'shovel');
  exactDynamic.skill.mp = dynamicCost;
  const event = cast(exactDynamic);
  assert.ok(event);
  assert.equal(event.mpCost, totalCost);
  assert.equal(event.mpAfter, 0);

  const insufficient = fixture('p1', 'qlj', 4, 'shovel');
  insufficient.skill.mp = dynamicCost - 1;
  assert.equal(cast(insufficient), undefined);
  assert.equal(insufficient.skill.mp, dynamicCost - 1);
}

function testQljWeaponModesAndBackwardLeap(): void {
  const shovel = fixture('p1', 'qlj', 3, 'shovel');
  const shovelEvent = cast(shovel)!;
  assert.equal(shovelEvent.projectile.sourceSymbol, 'Role4Bullet8');
  assert.equal(shovelEvent.projectile.damage,
    calculateRole4MobilityDamage('qlj', 3, shovel.power, 'shovel'));
  assert.equal(shovelEvent.projectile.remainingHits, 1);
  assert.equal(shovelEvent.projectile.activeAfterMs, 167);
  assert.equal(shovel.movement.skillMovementLockedUntilMs, 0);
  shovel.movement.x = 360;
  update(shovel, 10);
  assert.equal(shovelEvent.projectile.x, 485);

  const arrow = fixture('p1', 'qlj', 3, 'arrow');
  const arrowEvent = cast(arrow)!;
  assert.equal(arrow.projectiles.projectiles.length, 2);
  assert.equal(arrow.projectiles.projectiles.some((projectile) =>
    projectile.sourceSymbol === 'Role4BulletArrow8_1' && projectile.visualOnly), true);
  assert.equal(arrowEvent.projectile.sourceSymbol, 'Role4BulletArrow8_2');
  assert.equal(arrowEvent.projectile.damage, shovelEvent.projectile.damage);
  update(arrow, Role4MobilitySkillTuning.qljArrowLeapMs);
  assert.equal(arrow.movement.x, 160);
  assert.equal(arrow.movement.y, 60);
  assert.equal(arrow.movement.grounded, false);
}

function testTkjWeaponModesAndVerticalPhases(): void {
  const shovel = fixture('p1', 'tkj', 2, 'shovel');
  const shovelEvent = cast(shovel)!;
  assert.equal(shovel.projectiles.projectiles.length, 2);
  assert.equal(shovelEvent.projectile.sourceSymbol, 'Role4Bullet9_2');
  assert.equal(shovelEvent.projectile.remainingHits, 1);
  assert.equal(shovelEvent.projectile.activeAfterMs, 472);
  update(shovel, Role4MobilitySkillTuning.tkjShovelRiseFromMs);
  assert.equal(shovel.movement.y, 200);
  update(shovel, 100);
  assert.equal(shovel.movement.y, 100);

  const arrow = fixture('p1', 'tkj', 2, 'arrow');
  const arrowEvent = cast(arrow)!;
  assert.equal(arrowEvent.projectile.sourceSymbol, 'Role4BulletArrow9_2');
  assert.equal(arrowEvent.projectile.remainingHits, 5);
  assert.equal(arrowEvent.projectile.damage,
    calculateRole4MobilityDamage('tkj', 2, arrow.power, 'arrow'));
  assertNearlyEqual(shovelEvent.projectile.damage, arrowEvent.projectile.damage * 5);
  update(arrow, Role4MobilitySkillTuning.tkjArrowRiseMs);
  assertNearlyEqual(arrow.movement.y, 200 +
    Role4MobilitySkillTuning.tkjArrowVelocityY *
      Role4MobilitySkillTuning.tkjArrowRiseMs / 1_000);
  const yAfterRise = arrow.movement.y;
  update(arrow, 100);
  assert.equal(arrow.movement.y, yAfterRise);
}

function testDzjWeaponModesAndForwardDash(): void {
  const shovel = fixture('p1', 'dzj', 5, 'shovel');
  const shovelEvent = cast(shovel)!;
  assert.equal(shovelEvent.projectile.sourceSymbol, 'Role4Bullet10');
  assert.equal(shovelEvent.projectile.remainingHits, 5);
  assert.equal(shovelEvent.projectile.activeAfterMs, 56);
  update(shovel, Role4MobilitySkillTuning.dzjShovelDashMs);
  assert.equal(shovel.movement.x, 522);

  const arrow = fixture('p1', 'dzj', 5, 'arrow');
  const arrowEvent = cast(arrow)!;
  assert.equal(arrow.projectiles.projectiles.length, 2);
  assert.equal(arrowEvent.projectile.sourceSymbol, 'Role4BulletArrow10_2');
  assert.equal(arrowEvent.projectile.remainingHits, 1);
  assert.equal(arrowEvent.projectile.activeAfterMs, 972);
  assert.equal(arrowEvent.projectile.x, 525);
  assert.equal(arrowEvent.projectile.y, 120);
  assertNearlyEqual(arrowEvent.projectile.damage, shovelEvent.projectile.damage * 5);
  update(arrow, 1_000);
  assert.equal(arrow.movement.x, 300);
  assert.equal(arrow.movement.y, 200);
}

function testRecoveryGatesAndPlayerIsolation(): void {
  const p1 = fixture('p1', 'tkj', 1, 'arrow');
  const p2 = fixture('p2', 'tkj', 1, 'arrow');
  assert.ok(cast(p1));
  assert.equal(p2.skill.role4MobilityRuntime.active, undefined);
  assert.equal(cast(p1), undefined);
  assert.match(p1.skill.lastResult, /attacking/);

  update(p1, Role4MobilitySkillTuning.actionMs.arrow.tkj);
  assert.equal(p1.skill.role4MobilityRuntime.active, undefined);
  assert.equal(p1.movement.velocityX, 0);
  assert.equal(p1.movement.velocityY, 0);

  p2.combat.state = 'hurt';
  assert.equal(cast(p2), undefined);
  p2.combat.state = 'ready';
  p2.skill.mp = 0;
  assert.equal(cast(p2), undefined);
  assert.match(p2.skill.lastResult, /mp/);
}

function fixture(
  slot: PlayerSlot,
  skillName: Role4MobilitySkillName,
  level: number,
  weaponMode: Role4MobilityWeaponMode,
) {
  const loadout: HeroSkillLoadout = {
    slots: [{ skillName, level }, null, null, null, null],
  };
  const normalAttack = createHeroNormalAttack(4);
  setHeroWeaponMode(normalAttack, weaponMode);
  return {
    slot,
    movement: createHeroMovement(300, 200),
    combat: createHeroCombat(slot),
    normalAttack,
    skill: createHeroSkillModel(loadout, 10_000),
    projectiles: createProjectileSystem(),
    power: 90,
  };
}

function cast(value: ReturnType<typeof fixture>) {
  return requestRole4MobilitySkillFromInput({
    skill: value.skill,
    input: input(value.slot, 0),
    previousInput: input(value.slot),
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    sourcePower: value.power,
    timeMs: 1_000,
  });
}

function update(value: ReturnType<typeof fixture>, deltaMs: number): void {
  updateRole4MobilitySkill({
    runtime: value.skill.role4MobilityRuntime,
    movement: value.movement,
    projectiles: value.projectiles,
    deltaMs,
  });
}

function input(slot: PlayerSlot, pressedSlot?: number): PlayerInputState {
  return {
    slot, moveX: 0, down: false, up: false, attack: false, jump: false,
    skillSlots: [0, 1, 2, 3, 4].map((index) => index === pressedSlot),
    special: false, magicWeapon: false,
  };
}

function assertNearlyEqual(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`);
}
