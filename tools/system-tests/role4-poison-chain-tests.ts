import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  getRole4MbyjMpCost,
  requestRole4MbyjFromInput,
  Role4PoisonChainTuning,
  selectRole4MbyjFirstTarget,
  updateRole4PoisonChains,
  type Role4PoisonChainTarget,
} from '../../src/systems/Role4PoisonChainSystem';

export function runRole4PoisonChainTests(): void {
  testFirstTargetUsesFacingArrayOrderAndRadius();
  testNoTargetConsumesMpThenFades();
  testEightHopsCanReturnToEarlierTargetWithoutDirectDamage();
  testStunProbabilityBoundaryAndArrivalValidation();
  testMpActionAndPlayerIsolation();
}

function testFirstTargetUsesFacingArrayOrderAndRadius(): void {
  const firstInArray = target('array-first', 700, 200);
  const nearer = target('nearer', 350, 200);
  const left = target('left', 200, 200);
  const tooFar = target('too-far', 801, 200);
  assert.equal(
    selectRole4MbyjFirstTarget([firstInArray, nearer], 300, 200, 1)?.id,
    'array-first',
  );
  assert.equal(
    selectRole4MbyjFirstTarget([tooFar, left], 300, 200, 1),
    undefined,
  );
  assert.equal(
    selectRole4MbyjFirstTarget([nearer, left], 300, 200, -1)?.id,
    'left',
  );
}

function testNoTargetConsumesMpThenFades(): void {
  const value = fixture('p1', 3);
  const mpBefore = value.skill.mp;
  const event = cast(value, []);
  assert.ok(event);
  assert.equal(event.mpCost, getRole4MbyjMpCost({ skillName: 'mbyj', level: 3 }));
  assert.equal(value.skill.mp, mpBefore - event.mpCost);
  assert.equal(event.projectile.sourceSymbol, 'Role4Bullet6');
  assert.equal(event.projectile.visualOnly, true);
  assert.equal(value.skill.role4PoisonChainRuntime.chains.length, 1);

  update(value, [], 999);
  assert.equal(value.skill.role4PoisonChainRuntime.chains.length, 1);
  update(value, [], 1);
  assert.equal(value.skill.role4PoisonChainRuntime.chains.length, 0);
  assert.equal(event.projectile.isExpired, true);
}

function testEightHopsCanReturnToEarlierTargetWithoutDirectDamage(): void {
  const value = fixture('p1');
  const a = target('a', 400, 200);
  const b = target('b', 450, 200);
  cast(value, [a, b]);
  const events = update(value, [a, b], 10_000, () => 1);
  assert.equal(events.length, Role4PoisonChainTuning.maxHops);
  assert.deepEqual(events.map((event) => event.targetId), ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b']);
  assert.deepEqual(events.map((event) => event.hop), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(a.poisonDurations.length, 4);
  assert.equal(b.poisonDurations.length, 4);
  assert.equal(a.poisonDurations.every((duration) => duration === 7_000), true);
  assert.equal(a.damageTaken, 0);
  assert.equal(b.damageTaken, 0);
  assert.equal(value.skill.role4PoisonChainRuntime.chains.length, 0);
}

function testStunProbabilityBoundaryAndArrivalValidation(): void {
  const value = fixture('p1');
  const a = target('a', 400, 200);
  const b = target('b', 450, 200);
  cast(value, [a, b]);
  const rolls = [0.78, 0.780001];
  const events = update(value, [a, b], 300, () => rolls.shift() ?? 1);
  assert.equal(events.length, 2);
  assert.deepEqual(events.map((event) => event.stunned), [true, false]);
  assert.deepEqual(a.stunDurations, [Role4PoisonChainTuning.stunDurationMs]);
  assert.deepEqual(b.stunDurations, []);

  const missed = fixture('p1');
  const moving = target('moving', 400, 200);
  cast(missed, [moving]);
  moving.x = 500;
  assert.equal(update(missed, [moving], 500).length, 0);
  assert.equal(moving.poisonDurations.length, 0);
  assert.equal(missed.skill.role4PoisonChainRuntime.chains.length, 0);
}

function testMpActionAndPlayerIsolation(): void {
  const p1 = fixture('p1');
  const p2 = fixture('p2');
  const a = target('shared-a', 400, 200);
  const b = target('shared-b', 450, 200);
  assert.ok(cast(p1, [a, b]));
  assert.equal(p2.skill.role4PoisonChainRuntime.chains.length, 0);

  p2.combat.state = 'hurt';
  assert.equal(cast(p2, [a, b]), undefined);
  assert.match(p2.skill.lastResult, /attacking/);
  p2.combat.state = 'ready';
  p2.skill.mp = 0;
  assert.equal(cast(p2, [a, b]), undefined);
  assert.match(p2.skill.lastResult, /mp/);

  const p1Events = update(p1, [a, b], 10_000, () => 1);
  assert.equal(p1Events.length, 8);
  assert.equal(p2.skill.role4PoisonChainRuntime.chains.length, 0);
}

function fixture(slot: PlayerSlot, level = 1) {
  const loadout: HeroSkillLoadout = {
    slots: [{ skillName: 'mbyj', level }, null, null, null, null],
  };
  return {
    slot,
    movement: createHeroMovement(300, 200),
    combat: createHeroCombat(slot),
    normalAttack: createHeroNormalAttack(4),
    skill: createHeroSkillModel(loadout, 5_000),
    projectiles: createProjectileSystem(),
  };
}

function cast(
  value: ReturnType<typeof fixture>,
  targets: readonly Role4PoisonChainTarget[],
) {
  return requestRole4MbyjFromInput({
    skill: value.skill,
    input: input(value.slot, 0),
    previousInput: input(value.slot),
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    targets,
  });
}

function update(
  value: ReturnType<typeof fixture>,
  targets: readonly Role4PoisonChainTarget[],
  deltaMs: number,
  random: () => number = () => 1,
) {
  return updateRole4PoisonChains({
    runtime: value.skill.role4PoisonChainRuntime,
    projectiles: value.projectiles,
    targets,
    deltaMs,
    random,
  });
}

type TestTarget = Role4PoisonChainTarget & {
  poisonDurations: number[];
  stunDurations: number[];
  damageTaken: number;
};

function target(id: string, x: number, y: number): TestTarget {
  const value: TestTarget = {
    id,
    x,
    y,
    isAlive: true,
    poisonDurations: [],
    stunDurations: [],
    damageTaken: 0,
    applyPoison: (durationMs) => value.poisonDurations.push(durationMs),
    applyStun: (durationMs) => value.stunDurations.push(durationMs),
  };
  return value;
}

function input(slot: PlayerSlot, pressedSlot?: number): PlayerInputState {
  return {
    slot, moveX: 0, down: false, up: false, attack: false, jump: false,
    skillSlots: [0, 1, 2, 3, 4].map((index) => index === pressedSlot),
    special: false, magicWeapon: false,
  };
}
