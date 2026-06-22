import assert from 'node:assert/strict';
import { createDamageEvent } from '../../src/systems/CombatSystem';
import { applyHeroDamage, createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  calculateRole3DjDamage,
  getRole3SkillMpCost,
  requestRole3DefenseSkillFromInput,
  syncRole3DefenseState,
  tryRole3RjHealOnHit,
  updateRole3DefenseRuntime,
  type Role3PullTarget,
} from '../../src/systems/Role3DefenseSkillSystem';
import {
  calculateRole3SyzqDamage,
  consumeRole3NextDamageMultiplier,
  getRole3ZznhDamageMultiplier,
  requestRole3ControlSkillFromInput,
  updateRole3PullEffects,
} from '../../src/systems/Role3ControlSkillSystem';
import {
  calculateRole3JspDamage,
  calculateRole3SspDamage,
  requestRole3ImpactSkillFromInput,
  Role3ImpactTuning,
} from '../../src/systems/Role3ImpactSkillSystem';
import {
  calculateRole3DgqDamage,
  calculateRole3XgqDamage,
  isRole3XgqHidden,
  requestRole3MobilitySkillFromInput,
  updateRole3Mobility,
} from '../../src/systems/Role3MobilitySkillSystem';
import {
  calculateRole3TmcDamage,
  getRole3TmcMpCost,
  requestRole3UltimateSkillFromInput,
  Role3UltimateTuning,
  type Role3UltimateTarget,
} from '../../src/systems/Role3UltimateSkillSystem';

export function runRole3DefenseSkillTests(): void {
  testDjCastDamageMpAndGates();
  testSdCyclesShieldReductionAndExpiry();
  testRjDefenseAndHitHealing();
  testRole3OwnershipIsolation();
  testZznhPullAndOneShotMultiplier();
  testSyzqMovingProjectileAndBoost();
  testSspSlotAndComboEntrypoints();
  testJspStunChanceAndDamage();
  testDgqDashDamageAndStop();
  testXgqHiddenSecondStageAndRestore();
  testTmcGuardReentryRingAndCleanup();
  testTmcFallbackTarget();
}

function testDjCastDamageMpAndGates(): void {
  const fixture = createFixture(loadout('dj', 3));
  const mpCost = getRole3SkillMpCost({ skillName: 'dj', level: 3 });
  const event = cast(fixture, 0);
  assert.ok(event);
  assert.equal(event.actionName, 'hit4');
  assert.equal(event.mpCost, mpCost);
  assert.equal(event.projectile.sourceSymbol, 'Role3Bullet4');
  assert.equal(event.projectile.attackKind, 'physics');
  assert.equal(event.projectile.damage, calculateRole3DjDamage(3, fixture.sourcePower));
  assert.equal(event.projectile.knockbackX, 7);
  assert.equal(cast(fixture, 0), undefined);
  fixture.skill.role3Runtime.actionRemainingMs = 0;
  fixture.skill.mp = mpCost - 1;
  assert.equal(cast(fixture, 0), undefined);
  assert.match(fixture.skill.lastResult, /mp/);
}

function testSdCyclesShieldReductionAndExpiry(): void {
  const fixture = createFixture(loadout('sd', 12));
  fixture.combat.hp = 100;
  for (const tier of [1, 2, 3, 1]) {
    fixture.skill.role3Runtime.actionRemainingMs = 0;
    assert.ok(cast(fixture, 0));
    assert.equal(fixture.skill.role3Runtime.shieldTier, tier);
  }
  syncRole3DefenseState(fixture.skill.role3Runtime, fixture.combat, 0);
  assert.equal(fixture.combat.role3DamageReduction, 0.08);
  assert.equal(fixture.combat.role3KnockbackImmune, true);
  applyHeroDamage(fixture.combat, createDamageEvent({
    sourceId: 'monster', targetId: 'p1', attackId: 'sd-reduce', actionName: 'hit1',
    amount: 50, attackKind: 'physics', knockbackX: 5, knockbackY: -2, occurredAtMs: 0,
  }), 0);
  assert.equal(fixture.combat.hp, 54);
  assert.equal(fixture.combat.knockbackVelocityX, 0);
  updateRole3DefenseRuntime(fixture.skill.role3Runtime, fixture.combat, 10_000);
  assert.equal(fixture.skill.role3Runtime.shieldTier, 0);
  assert.equal(fixture.combat.role3DamageReduction, 0);
  assert.equal(fixture.combat.role3KnockbackImmune, false);
}

function testRjDefenseAndHitHealing(): void {
  const fixture = createFixture(loadout('dj', 1));
  fixture.combat.hp = 20;
  syncRole3DefenseState(fixture.skill.role3Runtime, fixture.combat, 6);
  assert.equal(fixture.skill.role3Runtime.defenseBonus, 300);
  assert.equal(fixture.combat.role3DefenseBonus, 300);
  const healed = tryRole3RjHealOnHit({
    runtime: fixture.skill.role3Runtime,
    combat: fixture.combat,
    sourcePower: 80,
    random: () => 0.12,
  });
  assert.equal(healed, 16);
  assert.equal(fixture.combat.hp, 36);
  assert.equal(tryRole3RjHealOnHit({
    runtime: fixture.skill.role3Runtime,
    combat: fixture.combat,
    sourcePower: 80,
    random: () => 0.99,
  }), 0);
}

function testRole3OwnershipIsolation(): void {
  const p1 = createFixture(loadout('sd', 1), 'p1');
  const p2 = createFixture(loadout('sd', 1), 'p2');
  assert.ok(cast(p1, 0));
  syncRole3DefenseState(p1.skill.role3Runtime, p1.combat, 1);
  syncRole3DefenseState(p2.skill.role3Runtime, p2.combat, 0);
  assert.equal(p1.combat.role3KnockbackImmune, true);
  assert.equal(p2.combat.role3KnockbackImmune, false);
  assert.equal(p2.skill.role3Runtime.shieldTier, 0);
}

function testZznhPullAndOneShotMultiplier(): void {
  const fixture = createFixture(loadoutAny('zznh', 5));
  const normal = target('normal', 500, 200, false);
  const immune = target('immune', 600, 200, true);
  const event = castControl(fixture, [normal.model, immune.model]);
  assert.ok(event);
  assert.equal(event.actionName, 'hit6');
  assert.equal(event.projectile.damage, 0);
  assert.equal(normal.suspended(), true);
  assert.equal(immune.suspended(), false);
  updateRole3PullEffects(fixture.skill.role3Runtime, 900);
  assert.equal(normal.x(), 400);
  assert.equal(normal.y(), 150);
  updateRole3PullEffects(fixture.skill.role3Runtime, 900);
  assert.equal(normal.x(), 300);
  assert.equal(normal.y(), 100);
  assert.equal(normal.suspended(), false);
  assert.equal(
    consumeRole3NextDamageMultiplier(fixture.skill.role3Runtime),
    getRole3ZznhDamageMultiplier(5),
  );
  assert.equal(consumeRole3NextDamageMultiplier(fixture.skill.role3Runtime), 1);
}

function testSyzqMovingProjectileAndBoost(): void {
  const fixture = createFixture(loadoutAny('syzq', 3));
  fixture.skill.role3Runtime.nextDamageMultiplier = 1.2;
  const event = castControl(fixture, []);
  assert.ok(event);
  assert.equal(event.actionName, 'hit7');
  assert.equal(event.projectile.sourceSymbol, 'Role3Bullet7_2');
  assert.equal(event.projectile.velocityX, 12);
  assert.equal(event.projectile.remainingDistance, 999);
  assert.equal(event.projectile.remainingHits, 11);
  assert.equal(event.projectile.damage, calculateRole3SyzqDamage(3, fixture.sourcePower) * 1.2);
  assert.equal(fixture.projectiles.projectiles.some((projectile) =>
    projectile.sourceSymbol === 'Role3Bullet7_1' && projectile.damage === 0
  ), true);
  assert.equal(fixture.skill.role3Runtime.nextDamageMultiplier, 1);
}

function testSspSlotAndComboEntrypoints(): void {
  const fixture = createFixture(loadoutImpact('ssp', 4));
  fixture.skill.role3Runtime.nextDamageMultiplier = 1.1;
  let event = castImpact(fixture, { slot: 0 });
  assert.ok(event);
  assert.equal(event.actionName, 'hit8');
  assert.equal(event.projectile.sourceSymbol, 'Role3Bullet8_2');
  assert.equal(event.projectile.damage, calculateRole3SspDamage(4, fixture.sourcePower) * 1.1);
  assert.equal(fixture.projectiles.projectiles.some((projectile) =>
    projectile.sourceSymbol === 'Role3Bullet8_1' && projectile.damage === 0
  ), true);

  const airborne = createFixture(loadoutImpact('ssp', 1));
  airborne.movement.grounded = false;
  assert.equal(castImpact(airborne, { slot: 0 }), undefined);
  assert.match(airborne.skill.lastResult, /ground/);

  const combo = createFixture(loadoutImpact('jsp', 1));
  combo.movement.grounded = false;
  combo.skill.role3Runtime.sspLevel = 3;
  const mpBefore = combo.skill.mp;
  event = castImpact(combo, { combo: true });
  assert.ok(event);
  assert.equal(event.reentered, true);
  assert.equal(event.mpCost, Role3ImpactTuning.comboMpCost);
  assert.equal(event.mpAfter, mpBefore - 20);
  assert.equal(event.projectile.damage, calculateRole3SspDamage(3, combo.sourcePower));
}

function testJspStunChanceAndDamage(): void {
  const proc = createFixture(loadoutImpact('jsp', 2));
  const event = castImpact(proc, { slot: 0, random: () => 0.05 });
  assert.ok(event);
  assert.equal(event.projectile.damage, calculateRole3JspDamage(2, proc.sourcePower));
  assert.equal(event.projectile.attackKind, 'physics');
  assert.equal(event.projectile.magicStunMs, Role3ImpactTuning.jspStunMs);

  const miss = createFixture(loadoutImpact('jsp', 2));
  assert.equal(castImpact(miss, { slot: 0, random: () => 0.5 })?.projectile.magicStunMs, undefined);
}

function testDgqDashDamageAndStop(): void {
  const fixture = createFixture(loadoutMobility('dgq', 3));
  fixture.skill.role3Runtime.nextDamageMultiplier = 1.1;
  const event = castMobility(fixture);
  assert.ok(event);
  assert.equal(event.actionName, 'hit10');
  assert.equal(event.projectile.damage, calculateRole3DgqDamage(3, fixture.sourcePower) * 1.1);
  const startX = fixture.movement.x;
  updateRole3Mobility(fixture.skill.role3Runtime, fixture.projectiles, 100);
  assert.ok(fixture.movement.x > startX);
  updateRole3Mobility(fixture.skill.role3Runtime, fixture.projectiles, 320);
  assert.equal(fixture.skill.role3Runtime.mobility, undefined);
  assert.equal(fixture.movement.velocityX, 0);
}

function testXgqHiddenSecondStageAndRestore(): void {
  const fixture = createFixture(loadoutMobility('xgq', 2));
  const event = castMobility(fixture);
  assert.ok(event);
  assert.equal(event.projectile.damage, 0);
  assert.equal(isRole3XgqHidden(fixture.skill.role3Runtime), true);
  assert.equal(updateRole3Mobility(fixture.skill.role3Runtime, fixture.projectiles, 299).length, 0);
  const spawned = updateRole3Mobility(fixture.skill.role3Runtime, fixture.projectiles, 1);
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0]?.sourceSymbol, 'Role3Bullet11');
  assert.equal(spawned[0]?.damage, calculateRole3XgqDamage(2, fixture.sourcePower));
  updateRole3Mobility(fixture.skill.role3Runtime, fixture.projectiles, 600);
  assert.equal(isRole3XgqHidden(fixture.skill.role3Runtime), false);
}

function testTmcGuardReentryRingAndCleanup(): void {
  const fixture = createFixture(loadoutUltimate(3));
  fixture.skill.role3Runtime.sdLevel = 5;
  fixture.skill.role3Runtime.nextDamageMultiplier = 1.1;
  const target: Role3UltimateTarget = { id: 'monster-a', x: 500, y: 120, isAlive: true };
  const mpBefore = fixture.skill.mp;
  let event = castUltimate(fixture, [target], () => 0);
  assert.ok(event);
  assert.equal(event.reentered, false);
  assert.equal(event.mpCost, getRole3TmcMpCost({ skillName: 'tmc', level: 3 }));
  assert.equal(event.mpAfter, mpBefore - event.mpCost);
  assert.equal(event.projectile.sourceSymbol, 'Role3Bullet12_1');
  assert.equal(fixture.combat.role3DamageReduction, 0.05);
  assert.equal(fixture.combat.role3KnockbackImmune, true);

  const mpBeforeReentry = fixture.skill.mp;
  event = castUltimate(fixture, [target], () => 0);
  assert.ok(event);
  assert.equal(event.reentered, true);
  assert.equal(event.mpCost, 0);
  assert.equal(fixture.skill.mp, mpBeforeReentry);
  const stabs = fixture.projectiles.projectiles.filter((projectile) =>
    projectile.sourceSymbol === 'Role3Bullet12_2'
  );
  assert.equal(stabs.length, Role3UltimateTuning.projectileCount);
  assert.equal(stabs.every((projectile) => projectile.trackingTargetId === target.id), true);
  assert.equal(stabs[0]?.x, fixture.movement.x);
  assert.equal(stabs[0]?.y, fixture.movement.y - Role3UltimateTuning.ringRadius);
  assert.ok(Math.abs(
    (stabs[0]?.damage ?? 0) -
    calculateRole3TmcDamage(3, fixture.sourcePower) * 1.1 * Role3UltimateTuning.zznhHurtAddMultiplier,
  ) < 0.000001);
  assert.equal(castUltimate(fixture, [target], () => 0), undefined);
  updateRole3DefenseRuntime(fixture.skill.role3Runtime, fixture.combat, 700);
  assert.equal(fixture.skill.role3Runtime.ultimate, undefined);
  assert.equal(fixture.combat.role3KnockbackImmune, false);
}

function testTmcFallbackTarget(): void {
  const fixture = createFixture(loadoutUltimate(1));
  assert.ok(castUltimate(fixture, []));
  assert.ok(castUltimate(fixture, []));
  const stabs = fixture.projectiles.projectiles.filter((projectile) =>
    projectile.sourceSymbol === 'Role3Bullet12_2'
  );
  assert.equal(stabs.length, 10);
  assert.equal(stabs.every((projectile) => projectile.trackingTargetId === 'fallback'), true);
}

function createFixture(skillLoadout: HeroSkillLoadout, slot: 'p1' | 'p2' = 'p1') {
  const movement = createHeroMovement(300, 200);
  const combat = createHeroCombat(slot);
  combat.maxHp = 120;
  combat.hp = 120;
  const normalAttack = createHeroNormalAttack(3);
  const skill = createHeroSkillModel(skillLoadout, 4_000);
  const projectiles = createProjectileSystem();
  return { slot, movement, combat, normalAttack, skill, projectiles, sourcePower: 80 };
}

function cast(fixture: ReturnType<typeof createFixture>, slotIndex: number) {
  return requestRole3DefenseSkillFromInput({
    skill: fixture.skill,
    input: input(fixture.slot, slotIndex),
    previousInput: input(fixture.slot),
    movement: fixture.movement,
    combat: fixture.combat,
    normalAttack: fixture.normalAttack,
    projectiles: fixture.projectiles,
    sourcePower: fixture.sourcePower,
  });
}

function loadout(skillName: 'dj' | 'sd', level: number): HeroSkillLoadout {
  return { slots: [{ skillName, level }, null, null, null, null] };
}

function loadoutAny(skillName: 'zznh' | 'syzq', level: number): HeroSkillLoadout {
  return { slots: [{ skillName, level }, null, null, null, null] };
}

function loadoutImpact(skillName: 'ssp' | 'jsp', level: number): HeroSkillLoadout {
  return { slots: [{ skillName, level }, null, null, null, null] };
}

function loadoutMobility(skillName: 'dgq' | 'xgq', level: number): HeroSkillLoadout {
  return { slots: [{ skillName, level }, null, null, null, null] };
}

function loadoutUltimate(level: number): HeroSkillLoadout {
  return { slots: [{ skillName: 'tmc', level }, null, null, null, null] };
}

function castUltimate(
  fixture: ReturnType<typeof createFixture>,
  targets: readonly Role3UltimateTarget[],
  random?: () => number,
) {
  return requestRole3UltimateSkillFromInput({
    skill: fixture.skill,
    input: input(fixture.slot, 0),
    previousInput: input(fixture.slot),
    movement: fixture.movement,
    combat: fixture.combat,
    normalAttack: fixture.normalAttack,
    projectiles: fixture.projectiles,
    sourcePower: fixture.sourcePower,
    targets,
    random,
  });
}

function castMobility(fixture: ReturnType<typeof createFixture>) {
  return requestRole3MobilitySkillFromInput({
    skill: fixture.skill,
    input: input(fixture.slot, 0),
    previousInput: input(fixture.slot),
    movement: fixture.movement,
    combat: fixture.combat,
    normalAttack: fixture.normalAttack,
    projectiles: fixture.projectiles,
    sourcePower: fixture.sourcePower,
  });
}

function castImpact(
  fixture: ReturnType<typeof createFixture>,
  options: { slot?: number; combo?: boolean; random?: () => number },
) {
  const current = input(fixture.slot, options.slot);
  if (options.combo) {
    current.up = true;
    current.attack = true;
  }
  return requestRole3ImpactSkillFromInput({
    skill: fixture.skill,
    input: current,
    previousInput: input(fixture.slot),
    movement: fixture.movement,
    combat: fixture.combat,
    normalAttack: fixture.normalAttack,
    projectiles: fixture.projectiles,
    sourcePower: fixture.sourcePower,
    random: options.random,
  });
}

function castControl(
  fixture: ReturnType<typeof createFixture>,
  targets: readonly Role3PullTarget[],
) {
  return requestRole3ControlSkillFromInput({
    skill: fixture.skill,
    input: input(fixture.slot, 0),
    previousInput: input(fixture.slot),
    movement: fixture.movement,
    combat: fixture.combat,
    normalAttack: fixture.normalAttack,
    projectiles: fixture.projectiles,
    sourcePower: fixture.sourcePower,
    targets,
  });
}

function target(id: string, startX: number, startY: number, isImmune: boolean) {
  let x = startX;
  let y = startY;
  let suspended = false;
  const model: Role3PullTarget = {
    id, x, y, isAlive: true, isImmune,
    setPosition: (nextX, nextY) => { x = nextX; y = nextY; },
    setSuspended: (value) => { suspended = value; },
  };
  return { model, x: () => x, y: () => y, suspended: () => suspended };
}

function input(slot: 'p1' | 'p2', pressedSlot?: number): PlayerInputState {
  return {
    slot, moveX: 0, down: false, up: false, attack: false, jump: false,
    skillSlots: [0, 1, 2, 3, 4].map((index) => index === pressedSlot),
    special: false, magicWeapon: false,
  };
}
