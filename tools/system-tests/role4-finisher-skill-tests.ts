import assert from 'node:assert/strict';
import { createDamageEvent } from '../../src/systems/CombatSystem';
import {
  applyHeroDamage,
  createHeroCombat,
} from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import {
  createHeroNormalAttack,
  setHeroWeaponMode,
} from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  calculateRole4MmwDamage,
  getRole4FinisherMpCost,
  hasRole4LybjMarker,
  requestRole4FinisherSkillFromInput,
  Role4FinisherSkillTuning,
  updateRole4FinisherSkill,
  type Role4FinisherSkillName,
  type Role4FinisherWeaponMode,
} from '../../src/systems/Role4FinisherSkillSystem';

export function runRole4FinisherSkillTests(): void {
  testLybjMarkerLifecycleAndTeleportCost();
  testLybjOffscreenCleanupConsumesReentryCost();
  testMmwShovelFinisherAndAntiKnockbackWithoutInvulnerability();
  testMmwArrowWavesAndSegmentedMovement();
  testFinisherRecoveryGatesAndPlayerIsolation();
}

function testLybjMarkerLifecycleAndTeleportCost(): void {
  const value = fixture('p1', 'lybj', 1, 'shovel');
  const event = cast(value)!;
  const firstCost = getRole4FinisherMpCost({ skillName: 'lybj', level: 1 }, value.skill.maxMp);
  assert.equal(event.projectile.sourceSymbol, 'Role4Bullet11');
  assert.equal(event.projectile.visualOnly, true);
  assert.equal(event.mpCost, firstCost);
  assert.equal(value.skill.mp, value.skill.maxMp - firstCost);
  assert.equal(hasRole4LybjMarker(value.skill.role4FinisherRuntime), true);

  value.movement.x = 640;
  value.movement.y = 360;
  value.skill.role4Runtime.actionRemainingMs = 0;
  const reentry = cast(value)!;
  assert.equal(reentry.reentered, true);
  assert.equal(reentry.mpCost, Math.floor(firstCost * Role4FinisherSkillTuning.lybjReentryMpRatio));
  assert.equal(value.movement.x, 300);
  assert.equal(value.movement.y, 200);
  assert.equal(hasRole4LybjMarker(value.skill.role4FinisherRuntime), false);
  assert.equal(event.projectile.isExpired, true);

  const expiring = fixture('p1', 'lybj', 1, 'shovel');
  const markerEvent = cast(expiring)!;
  update(expiring, Role4FinisherSkillTuning.markerLifetimeMs);
  assert.equal(hasRole4LybjMarker(expiring.skill.role4FinisherRuntime), false);
  assert.equal(markerEvent.projectile.isExpired, true);
}

function testLybjOffscreenCleanupConsumesReentryCost(): void {
  const value = fixture('p1', 'lybj', 1, 'shovel');
  const event = cast(value)!;
  const firstCost = event.mpCost;
  const marker = value.skill.role4FinisherRuntime.marker!;
  marker.x = 20;
  value.movement.x = 700;
  value.movement.y = 300;
  value.skill.role4Runtime.actionRemainingMs = 0;
  const reentry = cast(value)!;
  assert.equal(reentry.reentered, true);
  assert.equal(reentry.mpCost, Math.floor(firstCost * Role4FinisherSkillTuning.lybjReentryMpRatio));
  assert.equal(value.movement.x, 700);
  assert.equal(value.movement.y, 300);
  assert.equal(hasRole4LybjMarker(value.skill.role4FinisherRuntime), false);
  assert.equal(event.projectile.isExpired, true);
}

function testMmwShovelFinisherAndAntiKnockbackWithoutInvulnerability(): void {
  const value = fixture('p1', 'mmw', 4, 'shovel');
  const event = cast(value)!;
  assert.equal(event.projectile.sourceSymbol, 'Role4Bullet12');
  assert.equal(event.projectile.lifetimeMs, Role4FinisherSkillTuning.hit12ShovelActionMs);
  assert.equal(event.projectile.remainingHits, 999);
  assert.equal(event.projectile.hitIntervalFrames, 18);
  assert.equal(event.projectile.damage, calculateRole4MmwDamage(4, value.power, 'shovel'));
  assert.equal(value.combat.role4Hit12KnockbackImmune, true);

  const applied = applyHeroDamage(value.combat, createDamageEvent({
    sourceId: 'monster30',
    targetId: value.combat.id,
    attackId: 'monster30-hit',
    actionName: 'hit1',
    amount: 10,
    attackKind: 'physical',
    knockbackX: -4,
    knockbackY: -2,
    occurredAtMs: 1_000,
  }), 1_000);
  assert.equal(applied, true);
  assert.equal(value.combat.hp, value.combat.maxHp - 10);
  assert.equal(value.combat.state, 'ready');
  assert.equal(value.combat.invulnerableUntilMs, 0);
  assert.equal(value.combat.knockbackVelocityX, 0);

  update(value, Role4FinisherSkillTuning.hit12ShovelActionMs);
  assert.equal(value.combat.role4Hit12KnockbackImmune, false);
  assert.equal(value.skill.role4FinisherRuntime.active, undefined);
}

function testMmwArrowWavesAndSegmentedMovement(): void {
  const value = fixture('p1', 'mmw', 5, 'arrow');
  const event = cast(value)!;
  assert.equal(value.projectiles.projectiles.length, 2);
  assert.equal(value.projectiles.projectiles[0].sourceSymbol, 'Role4BulletArrow12_1');
  assert.equal(value.projectiles.projectiles[0].visualOnly, true);
  assert.equal(event.projectile.sourceSymbol, 'Role4BulletArrow12_2');
  assert.equal(event.projectile.damage, calculateRole4MmwDamage(5, value.power, 'arrow'));

  update(value, Role4FinisherSkillTuning.hit12ArrowRiseMs);
  assert.equal(value.movement.grounded, false);
  assertNearlyEqual(value.movement.y, 200 +
    Role4FinisherSkillTuning.hit12ArrowVelocityY *
      Role4FinisherSkillTuning.hit12ArrowRiseMs / 1_000);
  update(value, Role4FinisherSkillTuning.hit12ArrowSlideEndMs -
    Role4FinisherSkillTuning.hit12ArrowRiseMs);
  assertNearlyEqual(value.movement.x, 300 +
    Role4FinisherSkillTuning.hit12ArrowVelocityX *
      (Role4FinisherSkillTuning.hit12ArrowSlideEndMs -
        Role4FinisherSkillTuning.hit12ArrowSlideStartMs) / 1_000);

  update(value, Role4FinisherSkillTuning.hit12ArrowWaveMs[0] -
    Role4FinisherSkillTuning.hit12ArrowSlideEndMs);
  assert.equal(countRingProjectiles(value), 10);
  update(value, Role4FinisherSkillTuning.hit12ArrowWaveMs[1] -
    Role4FinisherSkillTuning.hit12ArrowWaveMs[0]);
  assert.equal(countRingProjectiles(value), 20);
  update(value, Role4FinisherSkillTuning.hit12ArrowWaveMs[2] -
    Role4FinisherSkillTuning.hit12ArrowWaveMs[1]);
  assert.equal(countRingProjectiles(value), 30);
}

function testFinisherRecoveryGatesAndPlayerIsolation(): void {
  const p1 = fixture('p1', 'mmw', 1, 'arrow');
  const p2 = fixture('p2', 'mmw', 1, 'arrow');
  assert.ok(cast(p1));
  assert.equal(p2.skill.role4FinisherRuntime.active, undefined);
  assert.equal(cast(p1), undefined);
  assert.match(p1.skill.lastResult, /attacking/);

  p2.combat.state = 'hurt';
  assert.equal(cast(p2), undefined);
  p2.combat.state = 'ready';
  p2.skill.mp = 0;
  assert.equal(cast(p2), undefined);
  assert.match(p2.skill.lastResult, /mp/);
}

function fixture(
  slot: PlayerSlot,
  skillName: Role4FinisherSkillName,
  level: number,
  weaponMode: Role4FinisherWeaponMode,
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
  return requestRole4FinisherSkillFromInput({
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
  updateRole4FinisherSkill({
    runtime: value.skill.role4FinisherRuntime,
    movement: value.movement,
    combat: value.combat,
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

function countRingProjectiles(value: ReturnType<typeof fixture>): number {
  return value.projectiles.projectiles.filter((projectile) =>
    projectile.sourceSymbol === 'Role4BulletArrow12_3').length;
}

function assertNearlyEqual(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`);
}
