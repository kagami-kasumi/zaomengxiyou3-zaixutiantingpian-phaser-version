import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import {
  createHeroNormalAttack,
  setHeroWeaponMode,
} from '../../src/systems/HeroNormalAttackSystem';
import {
  createHeroSkillModel,
  type HeroSkillLoadout,
} from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from '../../src/systems/InputSystem';
import {
  createProjectileSystem,
  type ProjectileModel,
} from '../../src/systems/ProjectileSystem';
import {
  applyRole4PoisonProjectileHit,
  calculateRole4JdzDamage,
  calculateRole4MdsBombDamage,
  calculateRole4ZqDamage,
  getRole4PoisonMpCost,
  requestRole4PoisonSkillFromInput,
  Role4PoisonTuning,
  updateRole4PoisonSkillRuntime,
  type Role4PoisonTarget,
} from '../../src/systems/Role4PoisonSkillSystem';

export function runRole4PoisonSkillTests(): void {
  testZqWeaponModesAndMp();
  testJdzGroundGateAndThreeProjectiles();
  testPoisonTicksRefreshesAndExpires();
  testMdsBombHealShieldAndVisualSpeedEffect();
  testMdsRejectsWhenUnlearnedAndPlayersStayIsolated();
}

function testZqWeaponModesAndMp(): void {
  const shovel = fixture('zq', 3);
  const shovelEvent = cast(shovel, 0);
  assert.ok(shovelEvent);
  assert.equal(shovelEvent.mpCost, getRole4PoisonMpCost({ skillName: 'zq', level: 3 }));
  assert.equal(shovelEvent.projectile.sourceSymbol, 'Role4Bullet4');
  assert.equal(shovelEvent.projectile.damage, calculateRole4ZqDamage(3, shovel.power, 'shovel'));
  assert.equal(shovelEvent.projectile.remainingHits, 2);

  const arrow = fixture('zq', 3);
  setHeroWeaponMode(arrow.normalAttack, 'arrow');
  const arrowEvent = cast(arrow, 0);
  assert.ok(arrowEvent);
  assert.equal(arrowEvent.projectile.sourceSymbol, 'Role4BulletArrow4');
  assert.equal(arrowEvent.projectile.damage, calculateRole4ZqDamage(3, arrow.power, 'arrow'));
  assert.equal(arrowEvent.projectile.damage, shovelEvent.projectile.damage * 2);
  assert.equal(arrowEvent.projectile.remainingHits, 1);
}

function testJdzGroundGateAndThreeProjectiles(): void {
  const airborne = fixture('jdz', 2);
  airborne.movement.grounded = false;
  assert.equal(cast(airborne, 0), undefined);
  assert.match(airborne.skill.lastResult, /ground/);

  const grounded = fixture('jdz', 2);
  const event = cast(grounded, 0);
  assert.ok(event);
  assert.equal(event.mpCost, getRole4PoisonMpCost({ skillName: 'jdz', level: 2 }));
  const damage = grounded.projectiles.projectiles.filter((item) =>
    item.sourceSymbol === 'Role4Bullet7_2');
  assert.equal(damage.length, 3);
  assert.equal(damage.every((item) =>
    item.damage === calculateRole4JdzDamage(2, grounded.power) && item.remainingHits === 20), true);
  assert.equal(grounded.projectiles.projectiles.some((item) =>
    item.sourceSymbol === 'Role4Bullet7_1' && item.damage === 0), true);
}

function testPoisonTicksRefreshesAndExpires(): void {
  const value = fixture('zq', 1);
  const projectile = cast(value, 0)!.projectile;
  const target = createTarget('monster-a', 5_000);
  applyRole4PoisonProjectileHit({
    runtime: value.skill.role4Runtime,
    projectile,
    target,
    hero: value.combat,
    sourcePower: value.power,
  });
  const state = value.skill.role4Runtime.poisonByTarget[target.id];
  assert.equal(state.stacks, 1);
  const poisonDamage = state.damagePerSecond;
  let events = updateRole4PoisonSkillRuntime({
    runtime: value.skill.role4Runtime,
    targets: [target],
    deltaMs: 1_000,
  });
  assert.equal(events.length, 1);
  assert.equal(events[0]?.amount, poisonDamage);
  assert.equal(target.hp(), 5_000 - poisonDamage);

  applyRole4PoisonProjectileHit({
    runtime: value.skill.role4Runtime,
    projectile,
    target,
    hero: value.combat,
    sourcePower: value.power,
  });
  assert.equal(state.stacks, 2);
  assert.equal(state.remainingMs, Role4PoisonTuning.poisonDurationMs);
  events = updateRole4PoisonSkillRuntime({
    runtime: value.skill.role4Runtime,
    targets: [target],
    deltaMs: Role4PoisonTuning.poisonDurationMs,
  });
  assert.equal(events.length, 5);
  assert.equal(value.skill.role4Runtime.poisonByTarget[target.id], undefined);
}

function testMdsBombHealShieldAndVisualSpeedEffect(): void {
  const value = fixture('zq', 4);
  value.skill.role4Runtime.mdsLevel = 3;
  value.skill.role4Runtime.mbyjLevel = 2;
  value.combat.maxHp = 200;
  value.combat.hp = 100;
  const projectile = cast(value, 0)!.projectile;
  const target = createTarget('monster-b', 50_000);
  for (let index = 0; index < 2; index += 1) {
    assert.equal(applyPoison(value, projectile, target), undefined);
  }
  const bomb = applyPoison(value, projectile, target);
  assert.ok(bomb);
  assert.equal(bomb.source, 'poison-bomb');
  assert.equal(bomb.amount, calculateRole4MdsBombDamage({
    mdsLevel: 3,
    mbyjLevel: 2,
    sourcePower: value.power,
  }));
  assert.equal(value.combat.hp, 130);
  assert.equal(value.combat.magicShield?.kind, 'role4Mds');
  assert.equal(value.combat.magicShield?.remainingAmount, 30 * 1.252);
  assert.equal(value.skill.role4Runtime.speedEffectRemainingMs, 3_000);
  updateRole4PoisonSkillRuntime({
    runtime: value.skill.role4Runtime,
    targets: [target],
    deltaMs: 3_000,
  });
  assert.equal(value.skill.role4Runtime.speedEffectRemainingMs, 0);
}

function testMdsRejectsWhenUnlearnedAndPlayersStayIsolated(): void {
  const p1 = fixture('zq', 1, 'p1');
  const p2 = fixture('zq', 1, 'p2');
  const target = createTarget('monster-shared', 50_000);
  const projectile = cast(p1, 0)!.projectile;
  for (let index = 0; index < 3; index += 1) {
    assert.equal(applyPoison(p1, projectile, target), undefined);
  }
  assert.equal(p1.skill.role4Runtime.poisonByTarget[target.id]?.stacks, 3);
  assert.equal(p2.skill.role4Runtime.poisonByTarget[target.id], undefined);
  assert.equal(p1.combat.magicShield, undefined);

  p2.skill.mp = 0;
  assert.equal(cast(p2, 0), undefined);
  assert.match(p2.skill.lastResult, /mp/);
  assert.equal(p1.skill.mp < p1.skill.maxMp, true);
}

function fixture(skillName: 'zq' | 'jdz', level: number, slot: PlayerSlot = 'p1') {
  const loadout: HeroSkillLoadout = {
    slots: [{ skillName, level }, null, null, null, null],
  };
  return {
    slot,
    movement: createHeroMovement(300, 200),
    combat: createHeroCombat(slot),
    normalAttack: createHeroNormalAttack(4),
    skill: createHeroSkillModel(loadout, 5_000),
    projectiles: createProjectileSystem(),
    power: 80,
  };
}

function cast(value: ReturnType<typeof fixture>, slotIndex: number) {
  return requestRole4PoisonSkillFromInput({
    skill: value.skill,
    input: input(value.slot, slotIndex),
    previousInput: input(value.slot),
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    sourcePower: value.power,
  });
}

function applyPoison(
  value: ReturnType<typeof fixture>,
  projectile: ProjectileModel,
  target: ReturnType<typeof createTarget>,
) {
  return applyRole4PoisonProjectileHit({
    runtime: value.skill.role4Runtime,
    projectile,
    target,
    hero: value.combat,
    sourcePower: value.power,
  });
}

function createTarget(id: string, maxHp: number) {
  let hp = maxHp;
  const target: Role4PoisonTarget & { hp: () => number } = {
    id,
    isAlive: true,
    hp: () => hp,
    applyDamage: (amount) => {
      const applied = Math.min(hp, Math.max(0, amount));
      hp -= applied;
      target.isAlive = hp > 0;
      return applied;
    },
  };
  return target;
}

function input(slot: PlayerSlot, pressedSlot?: number): PlayerInputState {
  return {
    slot, moveX: 0, down: false, up: false, attack: false, jump: false,
    skillSlots: [0, 1, 2, 3, 4].map((index) => index === pressedSlot),
    special: false, magicWeapon: false,
  };
}
