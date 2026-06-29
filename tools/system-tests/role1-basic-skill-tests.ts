import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import {
  createHeroSkillModel,
  createTestRole1SkillLoadout,
} from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  calculateRole1HytjDamage,
  calculateRole1JdyDamage,
  calculateRole1LysDamage,
  calculateRole1LyfbDamage,
  calculateRole1SlzDamage,
  getRole1HytjMpCost,
  getRole1JdyMpCost,
  getRole1LysMpCost,
  getRole1LyfbMpCost,
  getRole1SlzMpCost,
  isRole1HytjRunAttackRequested,
  isRole1SlzComboRequested,
  requestRole1BasicSkillFromInput,
  syncRole1LearnedSkills,
  tryRole1SxLifeSteal,
  updateRole1BasicRuntime,
} from '../../src/systems/Role1BasicSkillSystem';
import { spawnRole1LyfbProjectiles } from '../../src/systems/Role1SkillProjectileFactory';
import {
  calculateRole1QsezDamage,
  calculateRole1ShadowZzDamage,
  calculateRole1ZzDamage,
  getRole1QsezMpCost,
  getRole1ZzMpCost,
  requestRole1ShadowSkillFromInput,
  Role1ShadowSkillTuning,
  spawnRole1ShadowsFromQsezHit,
  updateRole1ShadowRuntime,
} from '../../src/systems/Role1ShadowSkillSystem';

export function runRole1BasicSkillTests(): void {
  testSlzSlotCastAndGates();
  testSlzComboAndFallbackBoundary();
  testLysSlotUpwardGateAndMobility();
  testHytjSlotAndRunAttackFallback();
  testLyfbDualProjectilesAndShadowDerivative();
  testJdySecondStageReentryAndCleanup();
  testQsezTargetClassificationAndShadowLifetime();
  testZzBodyWindowsAndShadowSync();
  testSxSyncAndPhysicalLifeSteal();
  testRole1OwnershipIsolation();
}

function testSlzSlotCastAndGates(): void {
  const fixture = createFixture('p1');
  const event = cast(fixture, input('p1', { slot: 0 }));
  assert.ok(event);
  assert.equal(event.actionName, 'hit6');
  assert.equal(event.slotIndex, 0);
  assert.equal(event.projectile.sourceSymbol, 'Role1Bullet6');
  assert.equal(event.projectile.attackKind, 'physics');
  assert.equal(event.projectile.knockbackX, 5);
  assert.equal(event.projectile.knockbackY, -20);
  assert.equal(event.projectile.damage, calculateRole1SlzDamage(3, fixture.sourcePower));
  assert.equal(event.mpCost, getRole1SlzMpCost({ skillName: 'slz', level: 3 }));
  assert.equal(cast(fixture, input('p1', { slot: 0 })), undefined);
  updateRole1BasicRuntime(fixture.skill.role1Runtime, 650);
  fixture.skill.mp = event.mpCost - 1;
  assert.equal(cast(fixture, input('p1', { slot: 0 })), undefined);
  assert.match(fixture.skill.lastResult, /mp/);
}

function testSlzComboAndFallbackBoundary(): void {
  const fixture = createFixture('p1');
  syncRole1LearnedSkills(fixture.skill.role1Runtime, { slzLevel: 4, sxLevel: 0 });
  const comboInput = input('p1', { attack: true, up: true });
  assert.equal(isRole1SlzComboRequested({
    heroId: 1,
    skill: fixture.skill,
    input: comboInput,
    previousInput: input('p1'),
  }), true);
  const event = cast(fixture, comboInput);
  assert.ok(event);
  assert.equal(event.slotIndex, -1);
  assert.equal(event.reentered, true);
  assert.equal(event.mpCost, getRole1SlzMpCost({ skillName: 'slz', level: 4 }));

  const insufficient = createFixture('p1');
  syncRole1LearnedSkills(insufficient.skill.role1Runtime, { slzLevel: 4, sxLevel: 0 });
  insufficient.skill.mp = 0;
  assert.equal(isRole1SlzComboRequested({
    heroId: 1,
    skill: insufficient.skill,
    input: comboInput,
    previousInput: input('p1'),
  }), false);
}

function testLysSlotUpwardGateAndMobility(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, { skillName: 'lys', level: 2 }, null, null, null],
  };
  syncRole1LearnedSkills(fixture.skill.role1Runtime, { slzLevel: 0, lysLevel: 2, hytjLevel: 0, sxLevel: 0 });
  fixture.movement.facingX = -1;
  const event = cast(fixture, input('p1', { slot: 1, up: true }), 1_000);
  assert.ok(event);
  assert.equal(event.skillName, 'lys');
  assert.equal(event.actionName, 'hit9');
  assert.equal(event.projectile.sourceSymbol, 'Role1Bullet9');
  assert.equal(event.projectile.attackKind, 'physics');
  assert.equal(event.projectile.x, fixture.movement.x + 60);
  assert.equal(event.projectile.damage, calculateRole1LysDamage(2, fixture.sourcePower));
  assert.equal(event.mpCost, getRole1LysMpCost({ skillName: 'lys', level: 2 }));
  assert.ok(fixture.movement.skillGravitySuspendedUntilMs >= 1_360);

  updateRole1BasicRuntime(fixture.skill.role1Runtime, 100, fixture.movement);
  assert.equal(fixture.movement.velocityY, -900);
  assert.equal(fixture.movement.velocityX, 0);
  assert.equal(cast(fixture, input('p1', { slot: 1 }), 1_020), undefined);
  assert.match(fixture.skill.lastResult, /attacking|gate/);

  updateRole1BasicRuntime(fixture.skill.role1Runtime, 360, fixture.movement);
  fixture.skill.mp = fixture.skill.maxMp;
  const gated = cast(fixture, input('p1', { slot: 1 }), 1_030);
  assert.equal(gated, undefined);
  assert.equal(fixture.skill.lastResult, 'lys gate');
}

function testHytjSlotAndRunAttackFallback(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, null, { skillName: 'hytj', level: 4 }, null, null],
  };
  syncRole1LearnedSkills(fixture.skill.role1Runtime, { slzLevel: 0, lysLevel: 0, hytjLevel: 4, sxLevel: 0 });
  fixture.movement.facingX = 1;
  const slotEvent = cast(fixture, input('p1', { slot: 2 }), 2_000);
  assert.ok(slotEvent);
  assert.equal(slotEvent.skillName, 'hytj');
  assert.equal(slotEvent.actionName, 'hit7');
  assert.equal(slotEvent.projectile.sourceSymbol, 'Role1Bullet7');
  assert.equal(slotEvent.projectile.attackKind, 'magic');
  assert.equal(slotEvent.projectile.hitIntervalFrames, 4);
  assert.equal(slotEvent.projectile.remainingHits, 4);
  assert.equal(slotEvent.projectile.damage, calculateRole1HytjDamage(4, fixture.sourcePower));
  assert.equal(slotEvent.mpCost, getRole1HytjMpCost({ skillName: 'hytj', level: 4 }));

  const runFixture = createFixture('p1');
  syncRole1LearnedSkills(runFixture.skill.role1Runtime, { slzLevel: 0, lysLevel: 0, hytjLevel: 4, sxLevel: 0 });
  runFixture.movement.runningDirection = 1;
  runFixture.movement.facingX = 1;
  const runInput = input('p1', { attack: true });
  assert.equal(isRole1HytjRunAttackRequested({
    heroId: 1,
    skill: runFixture.skill,
    input: runInput,
    previousInput: input('p1'),
    movement: runFixture.movement,
  }), true);
  const runEvent = cast(runFixture, runInput, 3_000);
  assert.ok(runEvent);
  assert.equal(runEvent.slotIndex, -1);
  assert.equal(runEvent.reentered, true);
  updateRole1BasicRuntime(runFixture.skill.role1Runtime, 100, runFixture.movement);
  assert.equal(runFixture.movement.velocityX, 900);

  const poor = createFixture('p1');
  syncRole1LearnedSkills(poor.skill.role1Runtime, { slzLevel: 0, lysLevel: 0, hytjLevel: 4, sxLevel: 0 });
  poor.skill.mp = 0;
  poor.movement.runningDirection = 1;
  assert.equal(isRole1HytjRunAttackRequested({
    heroId: 1,
    skill: poor.skill,
    input: runInput,
    previousInput: input('p1'),
    movement: poor.movement,
  }), false);
}

function testLyfbDualProjectilesAndShadowDerivative(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, null, null, { skillName: 'lyfb', level: 5 }, null],
  };
  syncRole1LearnedSkills(fixture.skill.role1Runtime, {
    slzLevel: 0, lysLevel: 0, hytjLevel: 0, lyfbLevel: 5, jdyLevel: 0, sxLevel: 0,
  });
  fixture.movement.facingX = -1;
  const event = cast(fixture, input('p1', { slot: 3 }), 4_000);
  assert.ok(event);
  assert.equal(event.skillName, 'lyfb');
  assert.equal(event.actionName, 'hit8');
  assert.equal(event.spawnedProjectiles?.length, 2);
  const [follow, moving] = event.spawnedProjectiles ?? [];
  assert.equal(follow.sourceSymbol, 'Role1Bullet8_1');
  assert.equal(follow.attackKind, 'physics');
  assert.equal(follow.knockbackX, 8);
  assert.equal(follow.remainingHits, 12);
  assert.equal(moving.sourceSymbol, 'Role1Bullet8_2');
  assert.equal(moving.actionName, 'hit8_2');
  assert.equal(moving.attackKind, 'magic');
  assert.equal(moving.velocityX, -15);
  assert.equal(moving.remainingDistance, 600);
  assert.equal(follow.damage, calculateRole1LyfbDamage(5, fixture.sourcePower));
  assert.equal(moving.damage, follow.damage);
  assert.equal(event.mpCost, getRole1LyfbMpCost({ skillName: 'lyfb', level: 5 }));

  const [shadowFollow, shadowMoving] = spawnRole1LyfbProjectiles({
    projectiles: createProjectileSystem(),
    combat: fixture.combat,
    movement: fixture.movement,
    damage: calculateRole1LyfbDamage(5, fixture.sourcePower),
    shadowDerived: true,
  });
  assert.equal(shadowFollow.actionName, 'hit8_1');
  assert.equal(shadowMoving.actionName, 'hit8_2_1');
  assert.equal(shadowFollow.damage, calculateRole1LyfbDamage(5, fixture.sourcePower) * 0.3125);
}

function testJdySecondStageReentryAndCleanup(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, null, null, null, { skillName: 'jdy', level: 6 }],
  };
  syncRole1LearnedSkills(fixture.skill.role1Runtime, {
    slzLevel: 0, lysLevel: 0, hytjLevel: 0, lyfbLevel: 0, jdyLevel: 6, sxLevel: 0,
  });
  fixture.movement.facingX = 1;
  const first = cast(fixture, input('p1', { slot: 4 }), 5_000);
  assert.ok(first);
  assert.equal(first.actionName, 'hit11_1');
  assert.equal(first.projectile.sourceSymbol, 'Role1Bullet11_1');
  assert.equal(first.projectile.attackKind, 'magic');
  assert.equal(first.projectile.remainingHits, 13);
  assert.equal(first.projectile.damage, calculateRole1JdyDamage(6, fixture.sourcePower));
  assert.equal(first.mpCost, getRole1JdyMpCost({ skillName: 'jdy', level: 6 }));

  const mpAfterFirst = fixture.skill.mp;
  const second = cast(fixture, input('p1', { slot: 4 }), 5_120);
  assert.ok(second);
  assert.equal(second.actionName, 'hit11_2');
  assert.equal(second.mpCost, 0);
  assert.equal(second.mpBefore, mpAfterFirst);
  assert.equal(second.mpAfter, mpAfterFirst);
  assert.equal(second.reentered, true);
  assert.equal(first.projectile.isExpired, true);
  assert.equal(second.projectile.sourceSymbol, 'Role1Bullet11_2');
  assert.equal(second.projectile.knockbackY, -25);
  updateRole1BasicRuntime(fixture.skill.role1Runtime, 100, fixture.movement);
  assert.equal(fixture.movement.velocityY, -750);
  assert.equal(fixture.skill.role1Runtime.jdyStage, undefined);
}

function testQsezTargetClassificationAndShadowLifetime(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, null, null, { skillName: 'qsez', level: 7 }, null],
  };
  const target = { id: 'm30', x: fixture.movement.x + 120, y: fixture.movement.y, isBoss: false, isAlive: true };
  const event = castShadow(fixture, input('p1', { slot: 3 }), [target], () => 0.75);
  assert.ok(event);
  assert.equal(event.skillName, 'qsez');
  assert.equal(event.actionName, 'hit13');
  assert.equal(event.projectile.sourceSymbol, 'Role1Bullet13');
  assert.equal(event.projectile.damage, calculateRole1QsezDamage(7, fixture.sourcePower));
  assert.equal(event.mpCost, getRole1QsezMpCost({ skillName: 'qsez', level: 7 }));
  assert.equal(fixture.movement.skillMovementLockedUntilMs, Role1ShadowSkillTuning.qsezActionMs);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 1);
  updateRole1ShadowRuntime(fixture.skill.role1ShadowRuntime, 2_999);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 1);
  updateRole1ShadowRuntime(fixture.skill.role1ShadowRuntime, 1);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 0);

  const bossFixture = createFixture('p1');
  const boss = { id: 'boss', x: bossFixture.movement.x + 120, y: bossFixture.movement.y, isBoss: true, isAlive: true };
  bossFixture.skill.loadout = {
    slots: [null, null, null, { skillName: 'qsez', level: 7 }, null],
  };
  const randomValues = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  castShadow(bossFixture, input('p1', { slot: 3 }), [boss], () => randomValues.shift() ?? 0.5);
  assert.equal(bossFixture.skill.role1ShadowRuntime.shadows.length, 5);
}

function testZzBodyWindowsAndShadowSync(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, null, null, null, { skillName: 'zz', level: 8 }],
  };
  const target = { id: 'm30', x: fixture.movement.x + 100, y: fixture.movement.y, isBoss: false, isAlive: true };
  spawnRole1ShadowsFromQsezHit(
    fixture.skill.role1ShadowRuntime,
    fixture.combat.id,
    target,
    fixture.movement.facingX,
    7,
    () => 0.25,
  );
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 2);
  const event = castShadow(fixture, input('p1', { slot: 4 }), [target], () => 0.75);
  assert.ok(event);
  assert.equal(event.skillName, 'zz');
  assert.equal(event.actionName, 'hit14');
  assert.equal(event.spawnedProjectiles?.length, 6);
  const [bodyFirst, bodySecond, shadowFirst, shadowSecond] = event.spawnedProjectiles ?? [];
  assert.equal(bodyFirst.sourceSymbol, 'Role1Bullet14_1');
  assert.equal(bodyFirst.damage, calculateRole1ZzDamage(8, fixture.sourcePower));
  assert.equal(bodySecond.sourceSymbol, 'Role1Bullet14_2');
  assert.equal(bodySecond.damage, bodyFirst.damage);
  assert.equal(shadowFirst.sourceSymbol, 'Role1Bullet14_1');
  assert.equal(shadowFirst.damage, calculateRole1ShadowZzDamage(7, fixture.sourcePower));
  assert.equal(shadowSecond.actionName, 'hit14_1');
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 0);

  const p2 = createFixture('p2');
  assert.equal(p2.skill.role1ShadowRuntime.shadows.length, 0);
}

function testSxSyncAndPhysicalLifeSteal(): void {
  const fixture = createFixture('p1');
  fixture.combat.hp = 20;
  syncRole1LearnedSkills(fixture.skill.role1Runtime, { slzLevel: 0, sxLevel: 5 });
  assert.ok(Math.abs(fixture.skill.role1Runtime.lifeStealPercent - 1.2) < 1e-9);
  assert.equal(fixture.skill.role1Runtime.critBonusPercent, 8);
  assert.equal(tryRole1SxLifeSteal({
    runtime: fixture.skill.role1Runtime,
    combat: fixture.combat,
    actualDamage: 1_000,
    attackKind: 'physics',
  }), 12);
  assert.equal(fixture.combat.hp, 32);
  assert.equal(tryRole1SxLifeSteal({
    runtime: fixture.skill.role1Runtime,
    combat: fixture.combat,
    actualDamage: 1_000,
    attackKind: 'magic',
  }), 0);
  syncRole1LearnedSkills(fixture.skill.role1Runtime, { slzLevel: 0, sxLevel: 0 });
  assert.equal(fixture.skill.role1Runtime.lifeStealPercent, 0);
  assert.equal(fixture.skill.role1Runtime.critBonusPercent, 0);
}

function testRole1OwnershipIsolation(): void {
  const p1 = createFixture('p1');
  const p2 = createFixture('p2');
  syncRole1LearnedSkills(p1.skill.role1Runtime, { slzLevel: 1, sxLevel: 9 });
  syncRole1LearnedSkills(p2.skill.role1Runtime, { slzLevel: 0, sxLevel: 0 });
  p1.combat.hp = 50;
  p2.combat.hp = 50;
  tryRole1SxLifeSteal({
    runtime: p1.skill.role1Runtime, combat: p1.combat,
    actualDamage: 1_000, attackKind: 'physics',
  });
  assert.equal(p1.combat.hp, 66);
  assert.equal(p2.combat.hp, 50);
  assert.equal(p2.skill.role1Runtime.critBonusPercent, 0);
}

function createFixture(slot: 'p1' | 'p2') {
  const skill = createHeroSkillModel(createTestRole1SkillLoadout(), 2_000);
  skill.loadout = {
    slots: [
      { skillName: 'slz', level: 3 },
      { skillName: 'lys', level: 3 },
      { skillName: 'hytj', level: 3 },
      { skillName: 'lyfb', level: 3 },
      { skillName: 'jdy', level: 3 },
    ],
  };
  return {
    skill,
    movement: createHeroMovement(100, 100),
    combat: createHeroCombat(slot),
    normalAttack: createHeroNormalAttack(1),
    projectiles: createProjectileSystem(),
    sourcePower: 80,
  };
}

function cast(fixture: ReturnType<typeof createFixture>, nextInput: PlayerInputState, timeMs = 0) {
  return requestRole1BasicSkillFromInput({
    ...fixture,
    input: nextInput,
    previousInput: input(nextInput.slot),
    timeMs,
  });
}

function castShadow(
  fixture: ReturnType<typeof createFixture>,
  nextInput: PlayerInputState,
  targets: Parameters<typeof requestRole1ShadowSkillFromInput>[0]['targets'],
  random: () => number,
) {
  return requestRole1ShadowSkillFromInput({
    ...fixture,
    input: nextInput,
    previousInput: input(nextInput.slot),
    targets,
    random,
  });
}

function input(
  slot: 'p1' | 'p2',
  options: { slot?: number; attack?: boolean; up?: boolean } = {},
): PlayerInputState {
  const slots = [false, false, false, false, false];
  if (options.slot !== undefined) slots[options.slot] = true;
  return {
    slot, moveX: 0, down: false, up: options.up ?? false,
    attack: options.attack ?? false, jump: false, skillSlots: slots,
    special: false, magicWeapon: false,
  };
}
