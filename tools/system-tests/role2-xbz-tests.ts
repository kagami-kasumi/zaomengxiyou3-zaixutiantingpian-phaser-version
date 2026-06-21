import assert from 'node:assert/strict';
import { applyMonster30Hit, createMonster30 } from '../../src/systems/Monster30System';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import {
  createHeroSkillModel,
  getSkillMpCost,
  requestRole2SkillFromInput,
  type HeroSkillLoadout,
  type SkillBinding,
} from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';
import {
  createProjectileSystem,
  getActiveProjectiles,
  updateProjectiles,
} from '../../src/systems/ProjectileSystem';
import {
  calculateRole2XbzDamage,
  Role2XbzTuning,
} from '../../src/systems/Role2XbzSkillSystem';

export function runRole2XbzSystemTests(): void {
  testXbzBindingMpAndSpawn();
  testXbzGatesAndDamage();
  testXbzSurvivesHurtAndExpires();
}

function testXbzBindingMpAndSpawn(): void {
  const binding = { skillName: 'xbz', level: 1 } as const satisfies SkillBinding;
  const fixture = createFixture(binding);
  const mpBefore = fixture.skill.mp;
  const event = requestRole2SkillFromInput({
    ...fixture,
    input: createInput(true),
    previousInput: createInput(false),
  });

  assert.ok(event);
  assert.equal(event.actionName, 'hit3');
  assert.equal(event.mpCost, getSkillMpCost(binding));
  assert.equal(event.mpAfter, mpBefore - getSkillMpCost(binding));
  assert.equal(event.projectile.variant, 'role2-xbz-hit3');
  assert.equal(event.projectile.runtimeName, 'Role2Bullet3');
  assert.equal(event.projectile.assetKey, 'skill-projectile.role2.xbz.hit3');
  assert.equal(event.projectile.x, fixture.movement.x);
  assert.equal(event.projectile.y, fixture.movement.y + Role2XbzTuning.offsetY);
  assert.equal(event.projectile.attackKind, 'magic');
  assert.equal(event.projectile.hitIntervalFrames, 250);
  assert.equal(event.projectile.knockbackX, 4);
  assert.equal(event.projectile.knockbackY, -4);
}

function testXbzGatesAndDamage(): void {
  const binding = { skillName: 'xbz', level: 3 } as const satisfies SkillBinding;
  const fixture = createFixture(binding);
  fixture.skill.mp = getSkillMpCost(binding) - 1;
  let event = requestRole2SkillFromInput({
    ...fixture,
    input: createInput(true),
    previousInput: createInput(false),
  });
  assert.equal(event, undefined);
  assert.match(fixture.skill.lastResult, /mp/);

  fixture.skill.mp = fixture.skill.maxMp;
  fixture.combat.state = 'hurt';
  event = requestRole2SkillFromInput({
    ...fixture,
    input: createInput(true),
    previousInput: createInput(false),
  });
  assert.equal(event, undefined);
  assert.match(fixture.skill.lastResult, /blocked by hurt/);

  fixture.combat.state = 'ready';
  event = requestRole2SkillFromInput({
    ...fixture,
    input: createInput(true),
    previousInput: createInput(false),
  });
  assert.ok(event);
  const expectedDamage = calculateRole2XbzDamage(binding.level, fixture.sourcePower);
  assert.equal(event.projectile.damage, expectedDamage);
  const monster = createMonster30(0, 0, 'xbz-target');
  assert.equal(applyMonster30Hit(monster, event.projectile.damage), true);
  assert.equal(monster.hp, Math.max(0, monster.maxHp - expectedDamage));

  const repeated = requestRole2SkillFromInput({
    ...fixture,
    input: createInput(true),
    previousInput: createInput(false),
  });
  assert.equal(repeated, undefined);
  assert.match(fixture.skill.lastResult, /attacking/);
}

function testXbzSurvivesHurtAndExpires(): void {
  const fixture = createFixture({ skillName: 'xbz', level: 1 });
  const event = requestRole2SkillFromInput({
    ...fixture,
    input: createInput(true),
    previousInput: createInput(false),
  });
  assert.ok(event);

  updateProjectiles(fixture.projectiles, [{ id: fixture.combat.id, state: 'hurt' }], 100);
  assert.equal(getActiveProjectiles(fixture.projectiles).length, 1);
  updateProjectiles(
    fixture.projectiles,
    [{ id: fixture.combat.id, state: 'ready' }],
    Role2XbzTuning.lifetimeMs,
  );
  assert.equal(getActiveProjectiles(fixture.projectiles).length, 0);
}

function createFixture(binding: SkillBinding) {
  const loadout: HeroSkillLoadout = { slots: [null, null, binding, null, null] };
  const movement = createHeroMovement(300, 200);
  const skill = createHeroSkillModel(loadout, 500);
  skill.learnedRole2Skills.sjtLevel = 0;
  return {
    skill,
    movement,
    combat: createHeroCombat('p1'),
    normalAttack: createHeroNormalAttack(2),
    projectiles: createProjectileSystem(),
    sourcePower: 28,
  };
}

function createInput(skillPressed: boolean): PlayerInputState {
  return {
    slot: 'p1',
    moveX: 0,
    down: false,
    up: false,
    attack: false,
    jump: false,
    skillSlots: [false, false, skillPressed, false, false],
    special: false,
    magicWeapon: false,
  };
}
