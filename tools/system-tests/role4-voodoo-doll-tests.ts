import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  damageRole4VoodooDoll,
  getRole4VoodooDollMaxHp,
  getRole4VoodooTransferDamage,
  getRole4WdwwMpCost,
  requestRole4WdwwFromInput,
  Role4VoodooDollTuning,
  selectRole4WdwwTarget,
  updateRole4VoodooDoll,
  type Role4VoodooTarget,
} from '../../src/systems/Role4VoodooDollSystem';

export function runRole4VoodooDollTests(): void {
  testFacingNearestTargetAndNoTargetGate();
  testCastMpStatsDefenseAndVisuals();
  testReplacementFollowAndExpiration();
  testDamageTransferAndCleanup();
  testPlayerIsolationAndAttackGate();
}

function testFacingNearestTargetAndNoTargetGate(): void {
  const left = target('left', 100, 200, 1_000);
  const closeRight = target('right-close', 350, 200, 1_000);
  const farRight = target('right-far', 700, 200, 1_000);
  assert.equal(selectRole4WdwwTarget([farRight, left, closeRight], 300, 1)?.id, 'right-close');
  assert.equal(selectRole4WdwwTarget([farRight, left, closeRight], 300, -1)?.id, 'left');

  const value = fixture('p1');
  const mpBefore = value.skill.mp;
  assert.equal(cast(value, [left]), undefined);
  assert.equal(value.skill.mp, mpBefore);
  assert.match(value.skill.lastResult, /no facing target/);
}

function testCastMpStatsDefenseAndVisuals(): void {
  const value = fixture('p1', 4);
  const selected = target('monster-a', 480, 170, 2_000, 0.22, 0.31);
  const event = cast(value, [selected]);
  assert.ok(event);
  assert.equal(event.mpCost, getRole4WdwwMpCost({ skillName: 'wdww', level: 4 }));
  assert.equal(event.projectile.sourceSymbol, 'Role4Hit5');
  assert.equal(event.projectile.visualOnly, true);
  const doll = value.skill.role4VoodooRuntime.doll!;
  assert.equal(doll.targetId, selected.id);
  assert.equal(doll.maxHp, getRole4VoodooDollMaxHp(selected.maxHp, 4));
  assert.equal(doll.hp, doll.maxHp);
  assert.equal(doll.defense, selected.defense);
  assert.equal(doll.magicDefense, selected.magicDefense);
  assert.equal(doll.remainingMs, 10_000);
  assert.equal(value.projectiles.projectiles.some((item) =>
    item.sourceSymbol === 'Role4Bullet5' && item.visualOnly), true);
}

function testReplacementFollowAndExpiration(): void {
  const value = fixture('p1', 1);
  const firstTarget = target('monster-a', 700, 200, 2_000);
  cast(value, [firstTarget]);
  const firstDoll = value.skill.role4VoodooRuntime.doll!;
  const firstVisual = value.projectiles.projectiles.find((item) =>
    item.id === firstDoll.visualProjectileId)!;
  const startX = firstDoll.x;
  updateRole4VoodooDoll({
    runtime: value.skill.role4VoodooRuntime,
    projectiles: value.projectiles,
    targets: [firstTarget],
    deltaMs: 1_000,
  });
  assert.ok(firstDoll.x > startX);
  assert.equal(firstVisual.x, firstDoll.x);

  value.skill.role4Runtime.actionRemainingMs = 0;
  const secondTarget = target('monster-b', 500, 200, 2_000);
  cast(value, [secondTarget]);
  assert.equal(firstVisual.isExpired, true);
  assert.equal(value.skill.role4VoodooRuntime.doll?.targetId, secondTarget.id);

  updateRole4VoodooDoll({
    runtime: value.skill.role4VoodooRuntime,
    projectiles: value.projectiles,
    targets: [secondTarget],
    deltaMs: Role4VoodooDollTuning.lifetimeMs,
  });
  assert.equal(value.skill.role4VoodooRuntime.doll, undefined);
}

function testDamageTransferAndCleanup(): void {
  const value = fixture('p1', 6);
  const selected = target('monster-transfer', 500, 200, 5_000);
  cast(value, [selected]);
  const doll = value.skill.role4VoodooRuntime.doll!;
  const event = damageRole4VoodooDoll({
    runtime: value.skill.role4VoodooRuntime,
    projectiles: value.projectiles,
    targets: [selected],
    damage: 120,
  });
  assert.ok(event);
  assert.equal(event.dollDamage, Math.min(120, doll.maxHp));
  assert.equal(event.transferredDamage, getRole4VoodooTransferDamage(120, 6));
  assert.equal(selected.hp, 5_000 - event.transferredDamage);

  const finish = damageRole4VoodooDoll({
    runtime: value.skill.role4VoodooRuntime,
    projectiles: value.projectiles,
    targets: [selected],
    damage: doll.hp + 1,
  });
  assert.ok(finish?.dollDestroyed);
  assert.equal(value.skill.role4VoodooRuntime.doll, undefined);
}

function testPlayerIsolationAndAttackGate(): void {
  const p1 = fixture('p1');
  const p2 = fixture('p2');
  const selected = target('monster-shared', 500, 200, 5_000);
  assert.ok(cast(p1, [selected]));
  assert.equal(p2.skill.role4VoodooRuntime.doll, undefined);

  p2.combat.state = 'hurt';
  assert.equal(cast(p2, [selected]), undefined);
  assert.match(p2.skill.lastResult, /attacking/);
  p2.combat.state = 'ready';
  p2.skill.mp = 0;
  assert.equal(cast(p2, [selected]), undefined);
  assert.match(p2.skill.lastResult, /mp/);
}

function fixture(slot: PlayerSlot, level = 1) {
  const loadout: HeroSkillLoadout = {
    slots: [{ skillName: 'wdww', level }, null, null, null, null],
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

function cast(value: ReturnType<typeof fixture>, targets: readonly Role4VoodooTarget[]) {
  return requestRole4WdwwFromInput({
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

function target(
  id: string,
  x: number,
  y: number,
  maxHp: number,
  defense = 0,
  magicDefense = 0,
): Role4VoodooTarget {
  const value: Role4VoodooTarget = {
    id, x, y, hp: maxHp, maxHp, defense, magicDefense, isAlive: true,
    applyDamage: (amount) => {
      const applied = Math.min(value.hp, Math.max(0, amount));
      value.hp -= applied;
      value.isAlive = value.hp > 0;
      return applied;
    },
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
