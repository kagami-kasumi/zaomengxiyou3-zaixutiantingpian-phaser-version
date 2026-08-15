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
  spawnRole1ShadowActionProjectiles,
  spawnRole1ShadowsFromQsezHit,
  startRole1ShadowHit1,
  updateRole1ShadowRuntime,
} from '../../src/systems/Role1ShadowSkillSystem';
import { Role1ShadowTruth } from '../../src/systems/Role1ShadowTruth';
import { projectRole1ShadowVisual } from '../../src/systems/Role1ShadowVisualSystem';
import {
  createHeroPartyRuntimeModel,
  destroyHeroPartyRuntime,
  resolveHeroPartyAttacks,
  setHeroPartySkillLoadout,
  updateHeroPartyRuntime,
} from '../../src/systems/HeroPartyRuntimeSystem';
import { createStage1CombatEnemy } from '../../src/systems/Stage1CombatSystem';

export function runRole1ShadowSkillTests(): void {
  testVerifiedTruthProjection();
  testQsezLocksMovementAndFixesCandidate();
  testHit1TickEmissionAndDestroy();
  testHit2TickEmissionsAndDestroy();
  testLifetimeReentryAndOwnerIdentity();
  testFormalRuntimeOwnerInputTargetAndDestroyLifecycle();
  testFormalRuntimeHit1AndHit2Reachability();
}

function testVerifiedTruthProjection(): void {
  assert.equal(Role1ShadowTruth.truthId, 'task-settings-173.role1-shadow');
  assert.equal(Role1ShadowTruth.tickRate, 30);
  assert.deepEqual(Role1ShadowTruth.actions.walk.map((state) => state.holdTicks), [72, 72, 72, 72, 72]);
  assert.deepEqual(Role1ShadowTruth.actions.hit1.map((state) => state.holdTicks), [2, 3, 2, 3]);
  assert.deepEqual(Role1ShadowTruth.actions.hit2.map((state) => state.holdTicks), [2, 12, 16]);

  const runtime = createHeroSkillModel(emptyLoadout(), 2_000).role1ShadowRuntime;
  const [left] = spawnRole1ShadowsFromQsezHit(
    runtime,
    'p1',
    { id: 'm30', x: 470, y: 350, isBoss: false, isAlive: true },
    -1,
    7,
    sequenceRandom(0.75, 0.5, 0.85),
  );
  assert.ok(left);
  const leftProjection = projectRole1ShadowVisual(left);
  assert.equal(leftProjection.stateId, 'walk-4-left');
  assert.equal(leftProjection.frame, 4);
  assert.equal(leftProjection.x, 470);
  assert.equal(leftProjection.y, 350);
  assert.equal(leftProjection.originX, 0.575);
  assert.equal(leftProjection.originY, 0.525);
  assert.equal(leftProjection.flipX, false);

  left.facingX = 1;
  const rightProjection = projectRole1ShadowVisual(left);
  assert.equal(rightProjection.stateId, 'walk-4-right');
  assert.equal(rightProjection.originX, 0.425);
  assert.equal(rightProjection.flipX, true);
}

function testQsezLocksMovementAndFixesCandidate(): void {
  const fixture = createFixture({ slots: [null, null, null, { skillName: 'qsez', level: 7 }, null] });
  const target = { id: 'm30', x: fixture.movement.x + 120, y: fixture.movement.y, isBoss: false, isAlive: true };
  const event = requestRole1ShadowSkillFromInput({
    ...fixture,
    input: input(3),
    previousInput: input(),
    targets: [target],
    timeMs: 500,
    random: sequenceRandom(0.75, 0.25, 0.62),
  });
  assert.ok(event);
  assert.equal(event.mpCost, getRole1QsezMpCost({ skillName: 'qsez', level: 7 }));
  assert.equal(fixture.movement.skillMovementLockedUntilMs, 500 + Role1ShadowSkillTuning.qsezActionMs);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 1);
  const shadow = fixture.skill.role1ShadowRuntime.shadows[0]!;
  assert.equal(shadow.candidate, 3);
  assert.equal(shadow.action, 'walk');
  assert.equal(shadow.facingX, fixture.movement.facingX);
  assert.equal(shadow.x, target.x - 37.5);
  updateRole1ShadowRuntime(fixture.skill.role1ShadowRuntime, Role1ShadowTruth.tickMs * 72);
  assert.equal(shadow.candidate, 3);
  assert.equal(shadow.action, 'walk');
  assert.equal(projectRole1ShadowVisual(shadow).frame, 3);
}

function testHit1TickEmissionAndDestroy(): void {
  const fixture = createFixture(emptyLoadout());
  const [shadow] = spawnRole1ShadowsFromQsezHit(
    fixture.skill.role1ShadowRuntime,
    fixture.combat.id,
    { id: 'm30', x: 410, y: 260, isBoss: false, isAlive: true },
    -1,
    7,
    sequenceRandom(0.75, 0.5, 0.1),
  );
  assert.ok(shadow);
  assert.equal(startRole1ShadowHit1(fixture.skill.role1ShadowRuntime, 400), 1);
  assert.equal(updateRole1ShadowRuntime(fixture.skill.role1ShadowRuntime, Role1ShadowTruth.tickMs).length, 0);
  const events = updateRole1ShadowRuntime(fixture.skill.role1ShadowRuntime, Role1ShadowTruth.tickMs);
  assert.deepEqual(events.map((event) => event.kind), ['hit1']);
  const spawned = spawnRole1ShadowActionProjectiles(events, fixture);
  assert.equal(spawned.length, 2);
  assert.deepEqual(spawned.map((projectile) => projectile.actionName), ['hit8_1', 'hit8_2_1']);
  assert.ok(spawned.every((projectile) => projectile.sourceId === fixture.combat.id));
  assert.ok(spawned.every((projectile) => projectile.facingX === -1));
  assert.equal(spawned[0]!.damage, 125);
  assert.equal(shadow.actionTick, 2);
  assert.equal(projectRole1ShadowVisual(shadow).stateId, 'hit1-1-left');
  assert.equal(updateRole1ShadowRuntime(
    fixture.skill.role1ShadowRuntime,
    Role1ShadowTruth.tickMs * 8,
  ).length, 0);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 0);
}

function testHit2TickEmissionsAndDestroy(): void {
  const fixture = createFixture({ slots: [null, null, null, null, { skillName: 'zz', level: 8 }] });
  spawnRole1ShadowsFromQsezHit(
    fixture.skill.role1ShadowRuntime,
    fixture.combat.id,
    { id: 'm30', x: 380, y: 240, isBoss: false, isAlive: true },
    fixture.movement.facingX,
    7,
    sequenceRandom(0.75, 0.5, 0.4),
  );
  const event = requestRole1ShadowSkillFromInput({
    ...fixture,
    input: input(4),
    previousInput: input(),
    targets: [],
  });
  assert.ok(event);
  assert.equal(event.reentered, true);
  assert.equal(event.spawnedProjectiles?.length, 2);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows[0]?.action, 'hit2');

  const firstEvents = updateRole1ShadowRuntime(
    fixture.skill.role1ShadowRuntime,
    Role1ShadowTruth.tickMs * 2,
  );
  assert.deepEqual(firstEvents.map((candidate) => candidate.kind), ['hit2-first']);
  const first = spawnRole1ShadowActionProjectiles(firstEvents, fixture);
  assert.equal(first.length, 1);
  assert.equal(first[0]?.actionName, 'hit14_1');
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 1);

  assert.equal(updateRole1ShadowRuntime(
    fixture.skill.role1ShadowRuntime,
    Role1ShadowTruth.tickMs * 27,
  ).length, 0);
  const secondEvents = updateRole1ShadowRuntime(
    fixture.skill.role1ShadowRuntime,
    Role1ShadowTruth.tickMs,
  );
  assert.deepEqual(secondEvents.map((candidate) => candidate.kind), ['hit2-second']);
  const second = spawnRole1ShadowActionProjectiles(secondEvents, fixture);
  assert.equal(second.length, 1);
  assert.equal(second[0]?.actionName, 'hit14_2_1');
  assert.equal(second[0]?.x, 380 + 145);
  assert.equal(fixture.skill.role1ShadowRuntime.shadows.length, 0);
}

function testLifetimeReentryAndOwnerIdentity(): void {
  const p1 = createHeroSkillModel(emptyLoadout(), 2_000).role1ShadowRuntime;
  const p2 = createHeroSkillModel(emptyLoadout(), 2_000).role1ShadowRuntime;
  const target = { id: 'boss', x: 500, y: 300, isBoss: true, isAlive: true };
  const p1First = spawnRole1ShadowsFromQsezHit(
    p1,
    'p1',
    target,
    -1,
    4,
    sequenceRandom(0.75, 0.5, 0.1, 0.5, 0.2, 0.5, 0.3, 0.5, 0.4),
  );
  const p2First = spawnRole1ShadowsFromQsezHit(
    p2,
    'p2',
    target,
    1,
    4,
    sequenceRandom(0.75, 0.5, 0.1, 0.5, 0.2, 0.5, 0.3, 0.5, 0.4),
  );
  assert.equal(p1First.length, 4);
  assert.equal(p2First.length, 4);
  assert.ok(p1First.every((shadow) => shadow.id.startsWith('p1-shadow-') && shadow.sourceId === 'p1'));
  assert.ok(p2First.every((shadow) => shadow.id.startsWith('p2-shadow-') && shadow.sourceId === 'p2'));
  const reentered = spawnRole1ShadowsFromQsezHit(
    p1,
    'p1',
    { ...target, isBoss: false },
    1,
    4,
    sequenceRandom(0.75, 0.5, 0.9),
  );
  assert.equal(reentered[0]?.id, 'p1-shadow-5');
  updateRole1ShadowRuntime(p1, Role1ShadowTruth.tickMs * Role1ShadowTruth.lifetimeTicks);
  assert.equal(p1.shadows.length, 0);
  assert.equal(p2.shadows.length, 4);
}

function testFormalRuntimeOwnerInputTargetAndDestroyLifecycle(): void {
  const runtime = createFormalRuntime({ skillName: 'qsez', level: 7 });
  const [p1, p2] = runtime.members;
  p1!.combat.skill.mp = p1!.combat.mp = 2_000;
  p2!.combat.skill.mp = p2!.combat.mp = 2_000;
  const target = createStage1CombatEnemy({ id: 'formal-target', enemyType: 30, x: 420, y: 200 });
  updateHeroPartyRuntime(runtime, formalFrame({
    p1: input(3, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [target],
    random: sequenceRandom(0.75, 0.5, 0.2),
  }));
  assert.equal(p1!.combat.skill.role1ShadowRuntime.shadows.length, 1);
  assert.equal(p2!.combat.skill.role1ShadowRuntime.shadows.length, 0);
  assert.equal(p1!.combat.skill.role1ShadowRuntime.shadows[0]?.sourceId, 'p1');
  assert.ok(runtime.projectiles.projectiles.every((projectile) => projectile.sourceId === 'p1'));
  const hpBefore = target.hp;
  resolveHeroPartyAttacks(runtime, [target], 16);
  assert.ok(target.hp < hpBefore);
  assert.equal(target.lastHitBy, 'p1');

  updateHeroPartyRuntime(runtime, formalFrame({
    p1: input(undefined, 'p1'),
    p2: input(3, 'p2'),
    targets: [createStage1CombatEnemy({ id: 'formal-p2-target', enemyType: 30, x: 400, y: 200 })],
    random: sequenceRandom(0.75, 0.5, 0.4),
  }));
  assert.equal(p2!.combat.skill.role1ShadowRuntime.shadows.length, 1);
  assert.equal(p2!.combat.skill.role1ShadowRuntime.shadows[0]?.sourceId, 'p2');
  assert.notEqual(
    p1!.combat.skill.role1ShadowRuntime.shadows[0]?.id,
    p2!.combat.skill.role1ShadowRuntime.shadows[0]?.id,
  );

  destroyHeroPartyRuntime(runtime);
  assert.equal(runtime.members.length, 0);
  assert.equal(runtime.projectiles.projectiles.length, 0);
  assert.equal(runtime.destroyed, true);
}

function testFormalRuntimeHit1AndHit2Reachability(): void {
  const hit1Runtime = createFormalRuntime({ skillName: 'qsez', level: 7 });
  const hit1Player = hit1Runtime.members[0]!;
  hit1Player.combat.skill.mp = hit1Player.combat.mp = 2_000;
  const target = createStage1CombatEnemy({ id: 'hit1-target', enemyType: 30, x: 420, y: 200 });
  updateHeroPartyRuntime(hit1Runtime, formalFrame({
    p1: input(3, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [target],
    random: sequenceRandom(0.75, 0.5, 0.1),
  }));
  updateHeroPartyRuntime(hit1Runtime, formalFrame({
    p1: input(undefined, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [target],
    deltaMs: 1_300,
  }));
  setHeroPartySkillLoadout(hit1Runtime, 'p1', {
    slots: [null, null, null, { skillName: 'lyfb', level: 7 }, null],
  });
  updateHeroPartyRuntime(hit1Runtime, formalFrame({
    p1: input(3, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [target],
  }));
  assert.equal(hit1Player.combat.skill.role1ShadowRuntime.shadows[0]?.action, 'hit1');

  const hit2Runtime = createFormalRuntime({ skillName: 'qsez', level: 7 });
  const hit2Player = hit2Runtime.members[0]!;
  hit2Player.combat.skill.mp = hit2Player.combat.mp = 2_000;
  updateHeroPartyRuntime(hit2Runtime, formalFrame({
    p1: input(3, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [createStage1CombatEnemy({ id: 'hit2-target', enemyType: 30, x: 420, y: 200 })],
    random: sequenceRandom(0.75, 0.5, 0.1),
  }));
  updateHeroPartyRuntime(hit2Runtime, formalFrame({
    p1: input(undefined, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [],
    deltaMs: 1_300,
  }));
  setHeroPartySkillLoadout(hit2Runtime, 'p1', {
    slots: [null, null, null, null, { skillName: 'zz', level: 7 }],
  });
  updateHeroPartyRuntime(hit2Runtime, formalFrame({
    p1: input(4, 'p1'),
    p2: input(undefined, 'p2'),
    targets: [],
  }));
  assert.equal(hit2Player.combat.skill.role1ShadowRuntime.shadows[0]?.action, 'hit2');
  assert.ok(hit2Runtime.projectiles.projectiles.some((projectile) =>
    projectile.variant === 'role1-zz-hit14-1'));
}

function createFormalRuntime(binding: { skillName: 'qsez'; level: number }) {
  const loadout: HeroSkillLoadout = { slots: [null, null, null, binding, null] };
  return createHeroPartyRuntimeModel([
    { slot: 'p1', heroId: 1, x: 300, y: 200, width: 80, skillLoadout: loadout },
    { slot: 'p2', heroId: 1, x: 280, y: 200, width: 80, skillLoadout: loadout },
  ]);
}

function formalFrame(params: {
  p1: PlayerInputState;
  p2: PlayerInputState;
  targets: ReturnType<typeof createStage1CombatEnemy>[];
  deltaMs?: number;
  random?: () => number;
}) {
  return {
    timeMs: 16,
    deltaMs: params.deltaMs ?? 16,
    inputs: [params.p1, params.p2],
    monsterTargets: params.targets,
    random: params.random,
    environmentFor: () => ({
      platforms: [],
      bounds: { left: 0, right: 1_000 },
    }),
  };
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

function emptyLoadout(): HeroSkillLoadout {
  return { slots: [null, null, null, null, null] };
}

function sequenceRandom(...values: number[]): () => number {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)] ?? 0;
}

function input(pressedSlot?: number, slot: PlayerInputState['slot'] = 'p1'): PlayerInputState {
  return {
    slot,
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
