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
  calculateRole1SlzDamage,
  getRole1SlzMpCost,
  isRole1SlzComboRequested,
  requestRole1BasicSkillFromInput,
  syncRole1LearnedSkills,
  tryRole1SxLifeSteal,
  updateRole1BasicRuntime,
} from '../../src/systems/Role1BasicSkillSystem';

export function runRole1BasicSkillTests(): void {
  testSlzSlotCastAndGates();
  testSlzComboAndFallbackBoundary();
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
    slots: [{ skillName: 'slz', level: 3 }, null, null, null, null],
  };
  return {
    skill,
    movement: createHeroMovement(),
    combat: createHeroCombat(slot),
    normalAttack: createHeroNormalAttack(1),
    projectiles: createProjectileSystem(),
    sourcePower: 80,
  };
}

function cast(fixture: ReturnType<typeof createFixture>, nextInput: PlayerInputState) {
  return requestRole1BasicSkillFromInput({
    ...fixture,
    input: nextInput,
    previousInput: input(nextInput.slot),
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
