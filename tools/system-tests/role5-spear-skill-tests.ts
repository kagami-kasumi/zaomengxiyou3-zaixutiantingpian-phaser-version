import assert from 'node:assert/strict';
import { createHeroCombat } from '../../src/systems/HeroCombatSystem';
import { createHeroMovement } from '../../src/systems/HeroMovementSystem';
import { createHeroNormalAttack, setHeroWeaponMode } from '../../src/systems/HeroNormalAttackSystem';
import { createHeroSkillModel, type HeroSkillLoadout } from '../../src/systems/HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from '../../src/systems/InputSystem';
import { createProjectileSystem } from '../../src/systems/ProjectileSystem';
import {
  calculateRole5CompanionArrowDamage,
  calculateRole5SpearSkillDamage,
  calculateRole5SwordSkillDamage,
  getRole5CompanionSkillMpCost,
  getRole5LoongSwordDamageMultiplier,
  getRole5StatusSkillMpCost,
  getRole5SwordSkillMpCost,
  getRole5YybStatusDurationMs,
  getRole5SpearSkillMpCost,
  isRole5YybComboRequested,
  requestRole5CompanionSkillFromInput,
  requestRole5StatusSkillFromInput,
  requestRole5SpearSkillFromInput,
  requestRole5SwordSkillFromInput,
  Role5SkillTuning,
  triggerRole5JrjlArrow,
  updateRole5SkillRuntime,
} from '../../src/systems/Role5SkillSystem';

export function runRole5SpearSkillTests(): void {
  testXlcMpDamageProjectileAndDash();
  testLxuanjProjectileMovement();
  testXkjzSelectsFacingTarget();
  testSpearSkillGatesAndPlayerIsolation();
  testYybSlotAndComboStatus();
  testTljStatusAndGates();
  testPkzChainAndLoongSwordEnhancement();
  testPkzLoongSwordUsesJrjlMultiplier();
  testLxjStateAndMlszFiveStageArray();
  testLyshCompanionCreateShootAndRebuild();
  testJrjlCompanionTriggerAndIsolation();
}

function testXlcMpDamageProjectileAndDash(): void {
  const value = fixture('p1', 'xlc');
  const event = cast(value, 0)!;
  assert.equal(event.actionName, 'hit6');
  assert.equal(event.mpCost, getRole5SpearSkillMpCost({ skillName: 'xlc', level: 1 }));
  assert.equal(value.skill.mp, value.skill.maxMp - event.mpCost);
  assert.equal(event.projectile.sourceSymbol, 'sword_xlc');
  assert.equal(event.projectile.knockbackX, -1);
  assert.equal(event.projectile.damage, calculateRole5SpearSkillDamage('xlc', 1, value.power));

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: 100,
  });
  assert.equal(value.movement.x, 300 + Role5SkillTuning.xlcDashVelocityX * 0.1);
  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.xlcDurationMs,
    skill: value.skill,
  });
  assert.equal(value.skill.role5Runtime.active, undefined);
  assert.equal(value.skill.activeAction, undefined);
}

function testLxuanjProjectileMovement(): void {
  const value = fixture('p1', 'lxuanj');
  const event = cast(value, 1_000)!;
  assert.equal(event.actionName, 'hit7');
  assert.equal(event.projectile.sourceSymbol, 'sword_lxuanj1');
  assert.equal(event.projectile.velocityX, 36);
  assert.equal(event.projectile.remainingDistance, 999);
  assert.equal(event.projectile.hitIntervalFrames, 4);
  assert.equal(event.projectile.damage, calculateRole5SpearSkillDamage('lxuanj', 1, value.power));
}

function testXkjzSelectsFacingTarget(): void {
  const value = fixture('p1', 'xkjz');
  const event = cast(value, 2_000)!;
  assert.equal(event.actionName, 'hit10');
  assert.equal(event.projectile.sourceSymbol, 'sword_xkjz');
  assert.equal(event.projectile.x, 620 + 208);
  assert.equal(event.projectile.y, 240 - 465);

  const noTarget = fixture('p1', 'xkjz');
  noTarget.targets = [];
  const fallback = cast(noTarget, 2_500)!;
  assert.equal(fallback.projectile.x, 300 + 486);
  assert.equal(fallback.projectile.y, 200 - 465);
}

function testSpearSkillGatesAndPlayerIsolation(): void {
  const p1 = fixture('p1', 'xlc');
  const p2 = fixture('p2', 'xlc');
  assert.ok(cast(p1, 3_000));
  assert.equal(p2.skill.role5Runtime.active, undefined);
  assert.equal(cast(p1, 3_010), undefined);
  assert.match(p1.skill.lastResult, /attacking/);

  const hurt = fixture('p1', 'xlc');
  hurt.combat.state = 'hurt';
  assert.equal(cast(hurt, 4_000), undefined);

  const poor = fixture('p1', 'xlc');
  poor.skill.mp = 0;
  assert.equal(cast(poor, 5_000), undefined);
  assert.match(poor.skill.lastResult, /mp/);
}

function testYybSlotAndComboStatus(): void {
  const value = fixture('p1', 'yyb');
  const slotEvent = castStatus(value, input('p1', 0), input('p1'), 6_000)!;
  assert.equal(slotEvent.actionName, 'hit9');
  assert.equal(slotEvent.projectile.sourceSymbol, 'Role5Bullet9');
  assert.equal(slotEvent.projectile.visualOnly, true);
  assert.equal(slotEvent.mpCost, getRole5StatusSkillMpCost({ skillName: 'yyb', level: 1 }));
  assert.equal(value.skill.role5Runtime.yybRemainingMs, getRole5YybStatusDurationMs(1));
  assert.equal(value.skill.role5Runtime.yybInverted, true);

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: 1_000,
  });
  assert.equal(value.skill.role5Runtime.yybRemainingMs, getRole5YybStatusDurationMs(1) - 1_000);
  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.yybDurationMs,
  });
  value.skill.activeAction = undefined;

  const comboInput = input('p1');
  comboInput.attack = true;
  comboInput.up = true;
  assert.equal(isRole5YybComboRequested({
    heroId: 5,
    skill: value.skill,
    input: comboInput,
    previousInput: input('p1'),
  }), true);
  const comboEvent = castStatus(value, comboInput, input('p1'), 7_000)!;
  assert.equal(comboEvent.slotIndex, -1);
  assert.equal(comboEvent.skillName, 'yyb');
  assert.equal(value.skill.role5Runtime.yybInverted, false);
}

function testTljStatusAndGates(): void {
  const value = fixture('p1', 'tlj');
  const event = castStatus(value, input('p1', 0), input('p1'), 8_000)!;
  assert.equal(event.actionName, 'hit11');
  assert.equal(event.projectile.sourceSymbol, 'role5_tlj');
  assert.equal(event.projectile.visualOnly, true);
  assert.equal(value.skill.role5Runtime.tljRemainingMs, getRole5YybStatusDurationMs(1));
  assert.equal(castStatus(value, input('p1', 0), input('p1'), 8_010), undefined);
  assert.match(value.skill.lastResult, /attacking/);

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.tljDurationMs,
  });
  const poor = fixture('p1', 'tlj');
  poor.skill.mp = 0;
  assert.equal(castStatus(poor, input('p1', 0), input('p1'), 9_000), undefined);
  assert.match(poor.skill.lastResult, /mp/);
}

function testPkzChainAndLoongSwordEnhancement(): void {
  const value = fixture('p1', 'pkz');
  const event = castSword(value, input('p1', 0), input('p1'), 10_000)!;
  assert.equal(event.actionName, 'hit24_1');
  assert.equal(event.spawnedProjectiles?.length, 3);
  assert.deepEqual(
    event.spawnedProjectiles?.map((projectile) => projectile.sourceSymbol),
    ['swordskill2_1', 'swordskill2_2', 'swordskill2_3'],
  );
  assert.equal(event.projectile.damage, calculateRole5SwordSkillDamage('pkz', 1, value.power) / 3);
  assert.equal(event.mpCost, getRole5SwordSkillMpCost({ skillName: 'pkz', level: 1 }));

  const enhanced = fixture('p1', 'pkz');
  enhanced.skill.role5Runtime.loongSwordRemainingMs = 5_000;
  enhanced.skill.role5Runtime.loongSwordLevel = 2;
  const enhancedEvent = castSword(enhanced, input('p1', 0), input('p1'), 11_000)!;
  assert.equal(enhancedEvent.projectile.sourceSymbol, 'swordskill2_1');
  assert.equal(enhancedEvent.projectile.assetKey, 'skill-projectile.role5.pkz.hit24_1.enhanced');
  assert.equal(enhanced.skill.role5Runtime.loongSwordFeijianOpportunities, 1);
  assert.equal(
    enhancedEvent.projectile.damage,
    calculateRole5SwordSkillDamage('pkz', 1, enhanced.power, enhanced.skill.role5Runtime) / 3,
  );
}

function testPkzLoongSwordUsesJrjlMultiplier(): void {
  const value = fixture('p1', 'pkz');
  value.skill.role5Runtime.loongSwordRemainingMs = 5_000;
  value.skill.role5Runtime.loongSwordLevel = 2;
  value.skill.role5Runtime.jrjlLevel = 4;
  const event = castSword(value, input('p1', 0), input('p1'), 11_500)!;
  assert.equal(
    event.projectile.damage,
    calculateRole5SwordSkillDamage(
      'pkz',
      1,
      value.power,
      value.skill.role5Runtime,
      value.skill.role5Runtime.jrjlLevel,
    ) / 3,
  );
}

function testLxjStateAndMlszFiveStageArray(): void {
  const value = fixture('p1', 'lxj');
  const lxjEvent = castSword(value, input('p1', 0), input('p1'), 12_000)!;
  assert.equal(lxjEvent.actionName, 'hit26');
  assert.equal(lxjEvent.projectile.sourceSymbol, 'swordskill4');
  assert.equal(lxjEvent.projectile.damage, 0);
  assert.equal(value.skill.role5Runtime.loongSwordRemainingMs, getRole5YybStatusDurationMs(1));
  assert.equal(getRole5LoongSwordDamageMultiplier(value.skill.role5Runtime), 1.098);

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.lxjDurationMs,
  });
  value.skill.activeAction = undefined;
  value.skill.loadout = {
    slots: [{ skillName: 'mlsz', level: 1 }, null, null, null, null],
  };
  const mlszEvent = castSword(value, input('p1', 0), input('p1'), 13_000)!;
  assert.equal(mlszEvent.actionName, 'hit29');
  assert.equal(mlszEvent.spawnedProjectiles?.length, 5);
  assert.deepEqual(
    mlszEvent.spawnedProjectiles?.map((projectile) => projectile.sourceSymbol),
    ['sword_mlsz1_1', 'sword_mlsz2_1', 'sword_mlsz3_1', 'sword_mlsz4_1', 'sword_mlsz5_1'],
  );
  assert.equal(mlszEvent.projectile.assetKey, 'skill-projectile.role5.mlsz.hit29.enhanced');
  assert.equal(value.skill.role5Runtime.loongSwordFeijianOpportunities, 1);
}

function testLyshCompanionCreateShootAndRebuild(): void {
  const value = fixture('p1', 'lysh');
  const create = castCompanion(value, input('p1', 0), input('p1'), 14_000)!;
  assert.equal(create.actionName, 'hit27_1');
  assert.equal(create.projectile.sourceSymbol, 'swordskill5_3');
  assert.equal(create.projectile.visualOnly, true);
  assert.equal(create.mpCost, getRole5CompanionSkillMpCost({ skillName: 'lysh', level: 1 }));
  assert.equal(value.skill.role5Runtime.lyshArrows.created, true);
  assert.equal(value.skill.role5Runtime.lyshArrows.charged, 0);

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.lyshCreateDurationMs,
  });
  value.skill.activeAction = undefined;
  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.lyshArrowChargeMs * Role5SkillTuning.lyshArrowCount,
  });
  const shoot = castCompanion(value, input('p1', 0), input('p1'), 15_000)!;
  assert.equal(shoot.actionName, 'hit27_2');
  assert.equal(shoot.mpCost, 0);
  assert.equal(shoot.spawnedProjectiles?.length, 4);
  assert.equal(shoot.projectile.sourceSymbol, 'swordskill5_2');
  assert.equal(shoot.projectile.velocityX, 22);
  assert.equal(shoot.projectile.remainingDistance, 2_000);
  assert.equal(shoot.projectile.damage, calculateRole5CompanionArrowDamage('lysh', 1, value.power) / 4);
  assert.equal(value.skill.role5Runtime.lyshArrows.created, false);

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.lyshShootDurationMs,
  });
  value.skill.activeAction = undefined;
  const rebuild = castCompanion(value, input('p1', 0), input('p1'), 16_000)!;
  assert.equal(rebuild.actionName, 'hit27_1');
  assert.equal(rebuild.mpCost, getRole5CompanionSkillMpCost({ skillName: 'lysh', level: 1 }));
}

function testJrjlCompanionTriggerAndIsolation(): void {
  const value = fixture('p1', 'jrjl');
  const create = castCompanion(value, input('p1', 0), input('p1'), 17_000)!;
  assert.equal(create.actionName, 'hit28');
  assert.equal(create.projectile.sourceSymbol, 'sword_jrjlsf');
  assert.equal(value.skill.role5Runtime.jrjlArrows.created, true);
  assert.equal(value.skill.role5Runtime.jrjlLevel, 1);

  updateRole5SkillRuntime({
    runtime: value.skill.role5Runtime,
    movement: value.movement,
    deltaMs: Role5SkillTuning.jrjlArrowChargeMs * Role5SkillTuning.jrjlArrowCount,
  });
  assert.equal(value.skill.role5Runtime.jrjlArrows.charged, 3);
  const shot = triggerRole5JrjlArrow({
    runtime: value.skill.role5Runtime,
    projectiles: value.projectiles,
    point: { sourceId: value.combat.id, x: value.movement.x, y: value.movement.y, facingX: value.movement.facingX },
    sourcePower: value.power,
  })!;
  assert.equal(shot.sourceSymbol, 'sword_jrjljq');
  assert.equal(shot.velocityX, 60);
  assert.equal(shot.remainingDistance, 2_000);
  assert.equal(shot.damage, calculateRole5CompanionArrowDamage('jrjl', 1, value.power));
  assert.equal(value.skill.role5Runtime.jrjlArrows.charged, 2);

  const p2 = fixture('p2', 'jrjl');
  assert.equal(triggerRole5JrjlArrow({
    runtime: p2.skill.role5Runtime,
    projectiles: p2.projectiles,
    point: { sourceId: p2.combat.id, x: p2.movement.x, y: p2.movement.y, facingX: p2.movement.facingX },
    sourcePower: p2.power,
  }), undefined);
}

function fixture(
  slot: PlayerSlot,
  skillName: 'xlc' | 'lxuanj' | 'xkjz' | 'yyb' | 'tlj' | 'pkz' | 'lxj' | 'mlsz' | 'lysh' | 'jrjl',
) {
  const loadout: HeroSkillLoadout = {
    slots: [{ skillName, level: 1 }, null, null, null, null],
  };
  const normalAttack = createHeroNormalAttack(5);
  setHeroWeaponMode(normalAttack, 'spear');
  return {
    slot,
    movement: createHeroMovement(300, 200),
    combat: createHeroCombat(slot),
    normalAttack,
    skill: createHeroSkillModel(loadout, 10_000),
    projectiles: createProjectileSystem(),
    power: 90,
    targets: [
      { id: 'behind', x: 120, y: 210, hp: 30, maxHp: 100, alive: true },
      { id: 'facing', x: 620, y: 240, hp: 80, maxHp: 100, alive: true },
    ],
  };
}

function cast(value: ReturnType<typeof fixture>, timeMs: number) {
  return requestRole5SpearSkillFromInput({
    skill: value.skill,
    input: input(value.slot, 0),
    previousInput: input(value.slot),
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    targets: value.targets,
    sourcePower: value.power,
    timeMs,
  });
}

function castStatus(
  value: ReturnType<typeof fixture>,
  nextInput: PlayerInputState,
  previousInput: PlayerInputState,
  timeMs: number,
) {
  return requestRole5StatusSkillFromInput({
    skill: value.skill,
    input: nextInput,
    previousInput,
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    timeMs,
  });
}

function castSword(
  value: ReturnType<typeof fixture>,
  nextInput: PlayerInputState,
  previousInput: PlayerInputState,
  timeMs: number,
) {
  return requestRole5SwordSkillFromInput({
    skill: value.skill,
    input: nextInput,
    previousInput,
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    sourcePower: value.power,
    jrjlLevel: value.skill.role5Runtime.jrjlLevel,
    timeMs,
  });
}

function castCompanion(
  value: ReturnType<typeof fixture>,
  nextInput: PlayerInputState,
  previousInput: PlayerInputState,
  timeMs: number,
) {
  return requestRole5CompanionSkillFromInput({
    skill: value.skill,
    input: nextInput,
    previousInput,
    movement: value.movement,
    combat: value.combat,
    normalAttack: value.normalAttack,
    projectiles: value.projectiles,
    sourcePower: value.power,
    timeMs,
  });
}

function input(slot: PlayerSlot, pressedSlot?: number): PlayerInputState {
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
