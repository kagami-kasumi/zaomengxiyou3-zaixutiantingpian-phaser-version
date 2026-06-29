import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  getRole1QsezMpCost,
  requestRole1ShadowSkillFromInput,
  Role1ShadowSkillTuning,
  spawnRole1ShadowsFromQsezHit,
  updateRole1ShadowRuntime,
} from '../../src/systems/Role1ShadowSkillSystem';

export function runRole1ShadowSkillTests(): void {
  testQsezLocksMovementAndSpawnsShadow();
  testZzConsumesShadowLifetime();
}

function testQsezLocksMovementAndSpawnsShadow(): void {
  const fixture = createFixture({ slots: [null, null, null, { skillName: 'qsez', level: 7 }, null] });
  const target = { id: 'm30', x: fixture.movement.x + 120, y: fixture.movement.y, isBoss: false, isAlive: true };
  const event = requestRole1ShadowSkillFromInput({
    ...fixture,
    input: input(3),
    previousInput: input(),
    targets: [target],
    timeMs: 500,
  });
  assert.ok(event);
  assert.equal(event.mpCost, getRole1QsezMpCost({ skillName: 'qsez', level: 7 }));
  assert.equal(fixture.movement.skillMovementLockedUntilMs, 500 + Role1ShadowSkillTuning.qsezActionMs);
  assert.ok(fixture.skill.role1ShadowRuntime.shadows.length > 0);
}

function testZzConsumesShadowLifetime(): void {
  const fixture = createFixture({ slots: [null, null, null, null, { skillName: 'zz', level: 8 }] });
  const target = { id: 'm30', x: fixture.movement.x + 80, y: fixture.movement.y, isBoss: false, isAlive: true };
  spawnRole1ShadowsFromQsezHit(
    fixture.skill.role1ShadowRuntime,
    fixture.combat.id,
    target,
    fixture.movement.facingX,
    7,
    () => 0.5,
  );
  assert.ok(fixture.skill.role1ShadowRuntime.shadows.length > 0);
  const event = requestRole1ShadowSkillFromInput({
    ...fixture,
    input: input(4),
    previousInput: input(),
    targets: [target],
  });
  assert.ok(event);
  updateRole1ShadowRuntime(fixture.skill.role1ShadowRuntime, Role1ShadowSkillTuning.zzActionMs);
  assert.equal(fixture.skill.role1ShadowRuntime.actionRemainingMs, 0);
}

function createFixture(loadout: HeroSkillLoadout) {
  return {
    skill: createHeroSkillModel(loadout, 2_000),
    movement: createHeroMovement(300, 200),
    combat: createHeroCombat('p1'),
    normalAttack: createHeroNormalAttack(1),
    projectiles: createProjectileSystem(),
    sourcePower: 80,
  };
}

function input(pressedSlot?: number): PlayerInputState {
  return {
    slot: 'p1',
    moveX: 0,
    down: false,
    up: false,
    attack: false,
    jump: false,
    skillSlots: [0, 1, 2, 3, 4].map((index) => index === pressedSlot),
    special: false,
    magicWeapon: false,
  };
}
