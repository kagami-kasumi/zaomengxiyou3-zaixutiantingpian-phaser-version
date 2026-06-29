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
  calculateRole1HmzLianZhanDamage,
  calculateRole1HmzZaDiDamage,
  calculateRole1HyjjDamage,
  getRole1HmzMpCost,
  getRole1HyjjMpCost,
  pickHyjjTarget,
  requestRole1FinisherSkillFromInput,
  syncRole1FinisherLearnedSkills,
  updateRole1FinisherRuntime,
  type Role1FinisherTarget,
} from '../../src/systems/Role1FinisherSkillSystem';

export function runRole1FinisherSkillTests(): void {
  testHmzLocalChainAndEvidenceBoundary();
  testHyjjFacingTargetPollingAndDelayedExplosions();
  testHyjjGroundMpAndTargetGates();
  testRole1FinisherOwnershipIsolation();
}

function testHmzLocalChainAndEvidenceBoundary(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [{ skillName: 'hmz', level: 4 }, null, null, null, null],
  };
  syncRole1FinisherLearnedSkills(fixture.skill.role1FinisherRuntime, { hmzLevel: 4, hyjjLevel: 0 });
  fixture.movement.facingX = -1;
  const event = cast(fixture, input('p1', { slot: 0 }), [], 10_000);
  assert.ok(event);
  assert.equal(event.skillName, 'hmz');
  assert.equal(event.actionName, 'hit10');
  assert.equal(event.mpCost, getRole1HmzMpCost({ skillName: 'hmz', level: 4 }));
  assert.equal(event.spawnedProjectiles?.length, 2);
  const [lianZhan, zaDi] = event.spawnedProjectiles ?? [];
  assert.equal(lianZhan.sourceSymbol, 'Role1Bullet10_2');
  assert.equal(lianZhan.actionName, 'hit10_2');
  assert.equal(lianZhan.attackKind, 'physics');
  assert.equal(lianZhan.knockbackX, 1);
  assert.equal(lianZhan.hitIntervalFrames, 3);
  assert.equal(lianZhan.x, fixture.movement.x - 150);
  assert.equal(lianZhan.damage, calculateRole1HmzLianZhanDamage(4, fixture.sourcePower));
  assert.equal(zaDi.sourceSymbol, 'Role1Bullet10_4');
  assert.equal(zaDi.actionName, 'hit10_4');
  assert.equal(zaDi.attackKind, 'physics');
  assert.equal(zaDi.knockbackX, 13);
  assert.equal(zaDi.knockbackY, -15);
  assert.equal(zaDi.activeAfterMs, 520);
  assert.equal(zaDi.damage, calculateRole1HmzZaDiDamage(4, fixture.sourcePower));
  assert.equal(fixture.projectiles.projectiles.some((item) => item.actionName === 'hit10_3'), false);
  assert.ok(fixture.movement.skillGravitySuspendedUntilMs >= 10_640);
  assert.equal(cast(fixture, input('p1', { slot: 0 }), [], 10_020), undefined);
  updateRole1FinisherRuntime(fixture.skill.role1FinisherRuntime, 1_640);
}

function testHyjjFacingTargetPollingAndDelayedExplosions(): void {
  const fixture = createFixture('p1');
  fixture.skill.loadout = {
    slots: [null, { skillName: 'hyjj', level: 5 }, null, null, null],
  };
  syncRole1FinisherLearnedSkills(fixture.skill.role1FinisherRuntime, { hmzLevel: 0, hyjjLevel: 5 });
  fixture.movement.facingX = 1;
  const targets: Role1FinisherTarget[] = [
    { id: 'behind', x: fixture.movement.x - 30, y: 100, isAlive: true },
    { id: 'front-a', x: fixture.movement.x + 80, y: 110, isAlive: true },
    { id: 'front-b', x: fixture.movement.x + 160, y: 120, isAlive: true },
  ];
  const firstTarget = pickHyjjTarget(fixture.skill.role1FinisherRuntime, fixture.movement, targets);
  assert.equal(firstTarget?.id, 'front-a');
  const secondTarget = pickHyjjTarget(fixture.skill.role1FinisherRuntime, fixture.movement, targets);
  assert.equal(secondTarget?.id, 'front-b');
  fixture.skill.role1FinisherRuntime.hyjjTargetCursor = 0;

  const event = cast(fixture, input('p1', { slot: 1 }), targets, 20_000);
  assert.ok(event);
  assert.equal(event.skillName, 'hyjj');
  assert.equal(event.actionName, 'hit12');
  assert.equal(event.mpCost, getRole1HyjjMpCost({ skillName: 'hyjj', level: 5 }));
  const projectiles = event.spawnedProjectiles ?? [];
  const explosions = projectiles.filter((projectile) => !projectile.visualOnly);
  const visual = projectiles.find((projectile) => projectile.visualOnly);
  assert.equal(explosions.length, 4);
  assert.equal(visual?.sourceSymbol, 'Role1Bullet12_1_1');
  assert.deepEqual(explosions.map((projectile) => projectile.activeAfterMs), [0, 1_200, 2_400, 3_600]);
  for (const explosion of explosions) {
    assert.equal(explosion.sourceSymbol, 'Role1Bullet12');
    assert.equal(explosion.actionName, 'hit12');
    assert.equal(explosion.attackKind, 'magic');
    assert.equal(explosion.hitIntervalFrames, 5);
    assert.equal(explosion.remainingHits, 15);
    assert.equal(explosion.knockbackX, 0);
    assert.equal(explosion.knockbackY, 0);
    assert.equal(explosion.x, targets[1].x);
    assert.equal(explosion.y, targets[1].y);
    assert.equal(explosion.damage, calculateRole1HyjjDamage(5, fixture.sourcePower));
    assert.equal(explosion.destroyWhenSourceHurt, false);
  }
  assert.ok(fixture.movement.skillMovementLockedUntilMs >= 20_680);
}

function testHyjjGroundMpAndTargetGates(): void {
  const air = createFixture('p1');
  air.skill.loadout = {
    slots: [{ skillName: 'hyjj', level: 2 }, null, null, null, null],
  };
  air.movement.grounded = false;
  assert.equal(cast(air, input('p1', { slot: 0 }), [{ id: 'm', x: 130, y: 100, isAlive: true }]), undefined);
  assert.equal(air.skill.lastResult, 'hyjj ground');

  const noTarget = createFixture('p1');
  noTarget.skill.loadout = {
    slots: [{ skillName: 'hyjj', level: 2 }, null, null, null, null],
  };
  assert.equal(cast(noTarget, input('p1', { slot: 0 }), [{ id: 'm', x: 70, y: 100, isAlive: true }]), undefined);
  assert.equal(noTarget.skill.lastResult, 'hyjj target');

  const poor = createFixture('p1');
  poor.skill.loadout = {
    slots: [{ skillName: 'hyjj', level: 18 }, null, null, null, null],
  };
  poor.skill.mp = 1;
  assert.equal(cast(poor, input('p1', { slot: 0 }), [{ id: 'm', x: 130, y: 100, isAlive: true }]), undefined);
  assert.match(poor.skill.lastResult, /mp/);
}

function testRole1FinisherOwnershipIsolation(): void {
  const p1 = createFixture('p1');
  const p2 = createFixture('p2');
  p1.skill.loadout = {
    slots: [{ skillName: 'hyjj', level: 3 }, null, null, null, null],
  };
  p2.skill.loadout = {
    slots: [{ skillName: 'hyjj', level: 3 }, null, null, null, null],
  };
  const p1Event = cast(p1, input('p1', { slot: 0 }), [{ id: 'p1-target', x: 160, y: 100, isAlive: true }]);
  assert.ok(p1Event);
  assert.equal(p1.projectiles.projectiles.length, 5);
  assert.equal(p2.projectiles.projectiles.length, 0);
  assert.equal(p2.skill.role1FinisherRuntime.actionRemainingMs, 0);

  p2.movement.facingX = -1;
  const p2Event = cast(p2, input('p2', { slot: 0 }), [{ id: 'p2-target', x: 40, y: 100, isAlive: true }]);
  assert.ok(p2Event);
  assert.equal(p2.projectiles.projectiles.filter((item) => !item.visualOnly).length, 4);
  assert.equal(p1.skill.role1FinisherRuntime.actionRemainingMs > 0, true);
}

function createFixture(slot: 'p1' | 'p2') {
  const skill = createHeroSkillModel(createTestRole1SkillLoadout(), 2_000);
  return {
    skill,
    movement: createHeroMovement(100, 100),
    combat: createHeroCombat(slot),
    normalAttack: createHeroNormalAttack(1),
    projectiles: createProjectileSystem(),
    sourcePower: 80,
  };
}

function cast(
  fixture: ReturnType<typeof createFixture>,
  nextInput: PlayerInputState,
  targets: readonly Role1FinisherTarget[],
  timeMs = 0,
) {
  return requestRole1FinisherSkillFromInput({
    ...fixture,
    input: nextInput,
    previousInput: input(nextInput.slot),
    targets,
    timeMs,
  });
}

function input(
  slot: 'p1' | 'p2',
  options: { slot?: number } = {},
): PlayerInputState {
  const slots = [false, false, false, false, false];
  if (options.slot !== undefined) slots[options.slot] = true;
  return {
    slot, moveX: 0, down: false, up: false,
    attack: false, jump: false, skillSlots: slots,
    special: false, magicWeapon: false,
  };
}
