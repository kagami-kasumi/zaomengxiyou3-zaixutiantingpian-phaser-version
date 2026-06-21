import assert from 'node:assert/strict';
import { applyHeroDamage, createHeroCombat, updateHeroMagicShield } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement, updateHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createDamageEvent } from '../../src/systems/CombatSystem';
import { createHeroNormalAttack } from '../../src/systems/HeroNormalAttackSystem';
import {
  createHeroSkillModel,
  getSkillMpCost,
  requestRole2SkillFromInput,
  type HeroSkillLoadout,
  type SkillBinding,
} from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState } from '../../src/systems/InputSystem';
import { createProjectileSystem, getActiveProjectiles } from '../../src/systems/ProjectileSystem';
import {
  calculateRole2MyhcHealPerTick,
  calculateRole2TjglHeal,
  calculateRole2TjglShield,
  updateRole2HealingOverTime,
  type Role2SupportTarget,
} from '../../src/systems/Role2SupportSkillSystem';
import {
  consumeRole2NextDamageMultiplier,
  getRole2JgzNextDamageMultiplier,
  updateRole2PullEffects,
  type Role2ControlTarget,
} from '../../src/systems/Role2ControlSkillSystem';
import {
  calculateRole2JhsjDamage,
  Role2JhsjTuning,
  updateRole2Jhsj,
} from '../../src/systems/Role2JhsjSkillSystem';
import { updateRole2Shadow, Role2ShadowTuning } from '../../src/systems/Role2ShadowSkillSystem';
import { takeRole2RuntimeProjectiles } from '../../src/systems/Role2SkillRuntimeSystem';
import { calculateRole2XbzDamage } from '../../src/systems/Role2XbzSkillSystem';

export function runRole2CompleteSkillTests(): void {
  testMyhcHealingAndGates();
  testTjglGroupHealPetAndShield();
  testJgzPullImmunityAndOneShotMultiplier();
  testJhsjTwoTimedWindows();
  testShyCreateRecallExpiryAndXbzSync();
  testShadowJhsjAndSupportSync();
  testShadowOwnershipIsolation();
}

function testMyhcHealingAndGates(): void {
  const fixture = createFixture({ skillName: 'myhc', level: 3 });
  let hp = 20;
  const target = supportTarget('ally', 305, 180, 100, () => hp, (value) => { hp = value; });
  const farTarget = supportTarget('far', 900, 900, 100, () => 20, () => undefined);
  const mpBefore = fixture.skill.mp;
  const event = cast(fixture, [target, farTarget]);
  assert.ok(event);
  assert.equal(event.actionName, 'hit6');
  assert.equal(event.mpAfter, mpBefore - getSkillMpCost({ skillName: 'myhc', level: 3 }));
  assert.equal(fixture.skill.role2Runtime.healingOverTime.length, 1);
  updateRole2HealingOverTime(fixture.skill.role2Runtime, 1_000);
  assert.equal(hp, 20 + calculateRole2MyhcHealPerTick(3, fixture.combat.maxHp));
  updateRole2HealingOverTime(fixture.skill.role2Runtime, 3_000);
  assert.equal(fixture.skill.role2Runtime.healingOverTime.length, 0);

  const noTargets = createFixture({ skillName: 'myhc', level: 1 });
  assert.ok(cast(noTargets, []));
  assert.equal(noTargets.skill.role2Runtime.healingOverTime.length, 0);
}

function testTjglGroupHealPetAndShield(): void {
  const fixture = createFixture({ skillName: 'tjgl', level: 4 });
  fixture.skill.isGxp = true;
  fixture.combat.hp = 30;
  let petHp = 40;
  const hero = supportTarget('p1', 300, 200, fixture.combat.maxHp, () => fixture.combat.hp, (value) => { fixture.combat.hp = value; });
  const pet = supportTarget('pet-p1', 320, 190, 160, () => petHp, (value) => { petHp = value; });
  const event = cast(fixture, [hero, pet]);
  assert.ok(event);
  assert.equal(event.actionName, 'hit8');
  assert.equal(fixture.combat.hp, 30 + calculateRole2TjglHeal(4, fixture.combat.maxHp, true));
  assert.equal(petHp, 40 + calculateRole2TjglHeal(4, 160, true));
  assert.equal(
    fixture.combat.magicShield?.remainingAmount,
    calculateRole2TjglShield(4, fixture.combat.maxHp),
  );
  const hpBeforeDamage = fixture.combat.hp;
  assert.equal(applyHeroDamage(fixture.combat, createDamageEvent({
    sourceId: 'monster', targetId: 'p1', attackId: 'tjgl-shield-test',
    actionName: 'hit1', amount: 10, attackKind: 'physics',
    knockbackX: 0, knockbackY: 0, occurredAtMs: 0,
  }), 0), true);
  assert.equal(fixture.combat.hp, hpBeforeDamage);
  updateHeroMagicShield(fixture.combat, 7_000);
  assert.equal(fixture.combat.magicShield, undefined);
}

function testJgzPullImmunityAndOneShotMultiplier(): void {
  const fixture = createFixture({ skillName: 'jgz', level: 5 });
  const normal = controlTarget('normal', 500, 220, false);
  const immune = controlTarget('immune', 500, 220, true);
  const far = controlTarget('far', 1_000, 220, false);
  const dead = controlTarget('dead', 500, 220, false);
  dead.target.isAlive = false;
  const event = cast(fixture, undefined, [normal.target, immune.target, far.target, dead.target]);
  assert.ok(event);
  assert.equal(event.actionName, 'hit7');
  assert.equal(fixture.skill.role2Runtime.pullEffects.length, 1);
  assert.equal(normal.suspended(), true);
  assert.equal(immune.suspended(), false);
  updateRole2PullEffects(fixture.skill.role2Runtime, 625);
  assert.equal(normal.x(), 500);
  assert.equal(normal.y(), 100);
  updateRole2PullEffects(fixture.skill.role2Runtime, 625);
  assert.equal(normal.y(), 90);
  assert.equal(normal.suspended(), false);
  fixture.skill.activeAction = undefined;
  for (const projectile of fixture.projectiles.projectiles) projectile.isExpired = true;
  fixture.skill.loadout = loadout({ skillName: 'xbz', level: 2 });
  const boosted = cast(fixture);
  assert.ok(boosted);
  assert.equal(
    boosted.projectile.damage,
    calculateRole2XbzDamage(2, fixture.sourcePower) * getRole2JgzNextDamageMultiplier(5),
  );
  assert.equal(consumeRole2NextDamageMultiplier(fixture.skill.role2Runtime), 1);
}

function testJhsjTwoTimedWindows(): void {
  const fixture = createFixture({ skillName: 'jhsj', level: 3 });
  fixture.skill.learnedRole2Skills.sjtLevel = 0;
  fixture.movement.grounded = false;
  fixture.movement.velocityY = 200;
  const event = cast(fixture);
  assert.ok(event);
  assert.equal(event.actionName, 'hit9');
  const yBeforeLock = fixture.movement.y;
  updateHeroMovement(
    fixture.movement,
    { ...input('p1', false), moveX: 1 },
    input('p1', false),
    [],
    { left: 0, right: 1_000, bottom: 1_000 },
    500,
    100,
  );
  assert.equal(fixture.movement.y, yBeforeLock);
  updateHeroMovement(
    fixture.movement,
    input('p1', false),
    input('p1', false),
    [],
    { left: 0, right: 1_000, bottom: 1_000 },
    1_200,
    100,
  );
  assert.ok(fixture.movement.y > yBeforeLock);
  assert.equal(updateRole2Jhsj(fixture.skill.role2Runtime, fixture.projectiles, 700).length, 0);
  let spawned = updateRole2Jhsj(
    fixture.skill.role2Runtime,
    fixture.projectiles,
    Role2JhsjTuning.hit9_2DelayMs - 700,
  );
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0]?.actionName, 'hit9_2');
  assert.equal(spawned[0]?.x, 450);
  assert.equal(spawned[0]?.y, 50);
  assert.equal(spawned[0]?.hitIntervalFrames, 5);
  assert.equal(spawned[0]?.damage, calculateRole2JhsjDamage(3, fixture.sourcePower, true));
  spawned = updateRole2Jhsj(
    fixture.skill.role2Runtime,
    fixture.projectiles,
    Role2JhsjTuning.hit9_1DelayMs - Role2JhsjTuning.hit9_2DelayMs,
  );
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0]?.actionName, 'hit9_1');
  assert.equal(spawned[0]?.x, 320);
  assert.equal(spawned[0]?.y, 180);
  assert.equal(fixture.skill.role2Runtime.pendingJhsj, undefined);
}

function testShyCreateRecallExpiryAndXbzSync(): void {
  const fixture = createFixture({ skillName: 'shy', level: 2 });
  const mpBefore = fixture.skill.mp;
  let event = cast(fixture);
  assert.ok(event);
  assert.equal(event.mpAfter, mpBefore - getSkillMpCost({ skillName: 'shy', level: 2 }));
  assert.ok(fixture.skill.role2Runtime.shadow);
  assert.equal(event.projectile.sourceId, 'p1-shadow');

  fixture.skill.loadout = loadout({ skillName: 'xbz', level: 2 });
  event = cast(fixture);
  assert.ok(event);
  assert.equal(
    takeRole2RuntimeProjectiles(fixture.skill.role2Runtime).some((projectile) =>
      projectile.variant === 'role2-shadow-xbz-hit3-2'
    ),
    true,
  );

  fixture.skill.activeAction = undefined;
  for (const projectile of fixture.projectiles.projectiles) {
    if (projectile.sourceId === 'p1') projectile.isExpired = true;
  }
  fixture.skill.loadout = loadout({ skillName: 'shy', level: 2 });
  fixture.movement.x = 700;
  fixture.movement.y = 500;
  const mpBeforeRecall = fixture.skill.mp;
  event = cast(fixture);
  assert.ok(event);
  assert.equal(event.mpCost, 0);
  assert.equal(fixture.skill.mp, mpBeforeRecall);
  assert.equal(fixture.movement.x, 300);
  assert.equal(fixture.movement.y, 200);
  assert.equal(fixture.skill.role2Runtime.shadow, undefined);

  const expiring = createFixture({ skillName: 'shy', level: 1 });
  assert.ok(cast(expiring));
  updateRole2Shadow(expiring.skill.role2Runtime, expiring.projectiles, Role2ShadowTuning.lifetimeMs);
  assert.equal(expiring.skill.role2Runtime.shadow, undefined);
}

function testShadowJhsjAndSupportSync(): void {
  const fixture = createFixture({ skillName: 'shy', level: 3 });
  assert.ok(cast(fixture));
  fixture.skill.loadout = loadout({ skillName: 'myhc', level: 2 });
  let hp = 10;
  const target = supportTarget('between', 300, 200, 100, () => hp, (value) => { hp = value; });
  assert.ok(cast(fixture, [target]));
  assert.equal(fixture.skill.role2Runtime.healingOverTime.length, 2);
  fixture.skill.activeAction = undefined;
  for (const projectile of fixture.projectiles.projectiles) {
    if (projectile.sourceId === 'p1') projectile.isExpired = true;
  }

  hp = 10;
  fixture.skill.loadout = loadout({ skillName: 'tjgl', level: 2 });
  assert.ok(cast(fixture, [target]));
  assert.equal(
    hp,
    10 + calculateRole2TjglHeal(2, 100, false) + calculateRole2TjglHeal(3, 100, false, 0.55),
  );
  fixture.skill.activeAction = undefined;
  for (const projectile of fixture.projectiles.projectiles) {
    if (projectile.sourceId === 'p1') projectile.isExpired = true;
  }

  fixture.skill.loadout = loadout({ skillName: 'jhsj', level: 2 });
  assert.ok(cast(fixture));
  const spawned = updateRole2Jhsj(
    fixture.skill.role2Runtime,
    fixture.projectiles,
    Role2JhsjTuning.hit9_1DelayMs,
  );
  assert.equal(spawned.length, 4);
  assert.equal(spawned.filter((projectile) => projectile.sourceId === 'p1-shadow').length, 2);
  assert.equal(spawned.some((projectile) => projectile.actionName === 'hit9_1_2'), true);
  assert.equal(spawned.some((projectile) => projectile.actionName === 'hit9_2_2'), true);
}

function testShadowOwnershipIsolation(): void {
  const p1 = createFixture({ skillName: 'shy', level: 1 }, 'p1');
  const p2 = createFixture({ skillName: 'shy', level: 1 }, 'p2');
  assert.ok(cast(p1));
  assert.ok(cast(p2));
  assert.equal(p1.skill.role2Runtime.shadow?.id, 'p1-shadow');
  assert.equal(p2.skill.role2Runtime.shadow?.id, 'p2-shadow');
  updateRole2Shadow(p1.skill.role2Runtime, p1.projectiles, Role2ShadowTuning.lifetimeMs);
  assert.equal(p1.skill.role2Runtime.shadow, undefined);
  assert.ok(p2.skill.role2Runtime.shadow);
}

function createFixture(binding: SkillBinding, slot: 'p1' | 'p2' = 'p1') {
  const movement = createHeroMovement(300, 200);
  const skill = createHeroSkillModel(loadout(binding), 5_000);
  const fixture = {
    skill,
    movement,
    combat: createHeroCombat(slot),
    normalAttack: createHeroNormalAttack(2),
    projectiles: createProjectileSystem(),
    sourcePower: 28,
    slot,
  };
  fixture.combat.maxHp = 200;
  fixture.combat.hp = 200;
  return fixture;
}

function cast(
  fixture: ReturnType<typeof createFixture>,
  supportTargets?: readonly Role2SupportTarget[],
  controlTargets?: readonly Role2ControlTarget[],
) {
  return requestRole2SkillFromInput({
    skill: fixture.skill,
    input: input(fixture.slot, true),
    previousInput: input(fixture.slot, false),
    movement: fixture.movement,
    combat: fixture.combat,
    normalAttack: fixture.normalAttack,
    projectiles: fixture.projectiles,
    sourcePower: fixture.sourcePower,
    supportTargets,
    controlTargets,
  });
}

function loadout(binding: SkillBinding): HeroSkillLoadout {
  return { slots: [binding, null, null, null, null] };
}

function input(slot: 'p1' | 'p2', pressed: boolean): PlayerInputState {
  return {
    slot, moveX: 0, down: false, up: false, attack: false, jump: false,
    skillSlots: [pressed, false, false, false, false], special: false, magicWeapon: false,
  };
}

function supportTarget(
  id: string,
  x: number,
  y: number,
  maxHp: number,
  getHp: () => number,
  setHp: (value: number) => void,
): Role2SupportTarget {
  return {
    id, x, y, maxHp, isAlive: true,
    heal: (amount) => setHp(Math.min(maxHp, getHp() + amount)),
  };
}

function controlTarget(id: string, initialX: number, initialY: number, isImmune: boolean) {
  let x = initialX;
  let y = initialY;
  let suspended = false;
  return {
    target: {
      id, x, y, isAlive: true, isImmune,
      setPosition: (nextX: number, nextY: number) => { x = nextX; y = nextY; },
      setSuspended: (value: boolean) => { suspended = value; },
    } satisfies Role2ControlTarget,
    x: () => x,
    y: () => y,
    suspended: () => suspended,
  };
}
