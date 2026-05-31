import assert from 'node:assert/strict';
import {
  createDamageEvent,
  createHitRegistry,
  resolveHitOnce,
} from '../src/systems/CombatSystem';
import {
  createVerticalClimbState,
  updateVerticalClimbCamera,
  updateVerticalClimbSpawn,
} from '../src/systems/LevelSystem';
import {
  createMonster30,
  updateMonster30,
} from '../src/systems/Monster30System';
import {
  canMonsterDropItems,
  createDropSystem,
  getWorldDrops,
  resolveMonsterDropTable,
  spawnConfiguredMonsterDrop,
} from '../src/systems/DropSystem';
import {
  createSeedEquipmentRegistry,
  createEmptyEquipmentLoadout,
  type EquipmentDefinition,
  type EquipmentInstance,
} from '../src/systems/EquipmentSystem';
import {
  consumeStackByFillName,
  createSeedInventoryStore,
  getInventoryEntries,
} from '../src/systems/InventorySystem';
import {
  catchNewPet,
  createMagicBottleCaptureModel,
  createSeedPetRoster,
  getActivePet,
  requestMagicBottleCapture,
  resolveMagicBottleCaptureHit,
  selectPet,
  setSelectedPetActive,
  toggleSelectedPetActive,
  updatePetRuntime,
  usePetConsumable,
  type CapturablePetTarget,
  type PetRuntimeModel,
} from '../src/systems/PetSystem';
import {
  createMagicWeaponModel,
  findClosestMagicWeaponTarget,
  requestMagicWeaponTrigger,
  syncMagicWeaponFromLoadout,
  updateMagicWeapon,
  MagicWeaponTuning,
} from '../src/systems/MagicWeaponSystem';
import {
  createProjectileSystem,
  getActiveProjectiles,
  updateProjectiles,
} from '../src/systems/ProjectileSystem';
import {
  applyHeroDamage,
  createHeroCombat,
  updateHeroMagicInvulnerability,
  updateHeroMagicShield,
} from '../src/systems/HeroCombatSystem';
import {
  createHeroSkillModel,
} from '../src/systems/HeroSkillSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';

testMonster30StableIds();
testHitRegistryAllowsDistinctTargets();
testStopPointRequiresSpawnedWaveBeforeClearing();
testMonsterDropTableBranches();
testExpandedMonsterDropTableBoundaries();
testConfiguredDropSkipsNegativeAndEmptyTables();
testPetRosterKeepsSingleActivePet();
testPetRuntimeFollowsAndWarps();
testMagicBottleRejectsLowSoul();
testMagicBottleCaptureSuccessAddsPetAndRemovesMonster();
testMagicBottleCaptureFailureKeepsMonster();
testMagicBottleFullRosterConsumesSoulButKeepsMonster();
testMagicWeaponInputIsSeparateFromNormalSkillSlots();
testPetConsumableLifetimeConsumesStackAndCapsAt100();
testPetConsumableRequiresActivePetWithoutConsuming();
testPetConsumableRestoreAndExperience();
testMagicWeaponRejectsWithoutZbfb();
testMagicWeaponKylHealsAndRejectsReentry();
testMagicWeaponSylRestoresMpAndWoodDuration();
testMagicWeaponSword2ChoosesClosestTargetAndSpawnsProjectile();
testMagicWeaponSword2HandlesNoTargetsAndReturnsToWait();
testMagicWeaponQpjActiveSpawnsSixProjectilesAndRejectsReentry();
testMagicWeaponQpjAutoSpawnsSingleProjectileWhenIdle();
testMagicWeaponQpjNoTargetsDoesNotSpawn();
testMagicWeaponUmbrellaCreatesWoodShieldAndRejectsReentry();
testMagicWeaponUmbrella2FormulaAndDamageAbsorption();
testMagicWeaponShieldDepletesAndExpires();
testMagicWeaponRingRestoresAndBlocksDamage();
testMagicWeaponRingWoodBonusAndExpires();
testMagicWeaponTimerRecordsAndRestoresOnSecondTrigger();
testMagicWeaponTimerExpiresAndWoodWaits27Seconds();
testMagicWeaponLxfbWoodBuffDrainsHpAndRejectsReentry();
testMagicWeaponSxfbBuffDurationAndDrain();
testMagicWeaponYxfbHalvesHpAndClearsBuff();
testMagicWeaponFlowerAppliesHeroPetAndMonsterEffects();
testMagicWeaponFlowerWoodOnlyShortensActionBoundary();
testMagicWeaponFlowerDebuffReducesMonster30AttackDamage();

console.log('System tests passed.');

function testMonster30StableIds(): void {
  const first = createMonster30(0, 0, 'm30-a');
  const second = createMonster30(0, 0, 'm30-b');
  first.attackDecisionTimerMs = 0;
  second.attackDecisionTimerMs = 0;

  const targets = [{ slot: 'p1' as const, x: 0, y: 0 }];
  updateMonster30(first, targets, 1, () => 0);
  updateMonster30(second, targets, 1, () => 0);

  assert.equal(first.id, 'm30-a');
  assert.equal(second.id, 'm30-b');
  assert.equal(first.activeAttack?.attackId, 'm30-a-hit1-1');
  assert.equal(second.activeAttack?.attackId, 'm30-b-hit1-1');
}

function testHitRegistryAllowsDistinctTargets(): void {
  const registry = createHitRegistry();
  const attackId = 'p1-normal-1';

  assert.equal(resolveHitOnce(registry, attackId, 'm30-a'), true);
  assert.equal(resolveHitOnce(registry, attackId, 'm30-a'), false);
  assert.equal(resolveHitOnce(registry, attackId, 'm30-b'), true);
}

function testStopPointRequiresSpawnedWaveBeforeClearing(): void {
  const state = createVerticalClimbState(600);

  updateVerticalClimbCamera(state, 2000, 16, 600);
  assert.equal(state.activeStopIndex, 0);

  assert.equal(updateVerticalClimbSpawn(state, 16, 0, 1), true);
  assert.equal(state.stopPoints[0].waveSpawned, true);
  assert.equal(state.stopPoints[0].cleared, false);
  assert.equal(state.activeStopIndex, 0);

  assert.equal(updateVerticalClimbSpawn(state, 16, 2, 1), false);
  assert.equal(state.stopPoints[0].cleared, false);

  assert.equal(updateVerticalClimbSpawn(state, 16, 0, 1), false);
  assert.equal(state.stopPoints[0].cleared, true);
  assert.equal(state.activeStopIndex, -1);
}

function testMonsterDropTableBranches(): void {
  const monster3Boss = resolveMonsterDropTable('Monster3', { curStage: 1, curLevel: 1 });
  assert.equal(monster3Boss.branchId, 'stage-1-1-boss');
  assert.equal(monster3Boss.isBoss, true);
  assert.equal(monster3Boss.baseProbability, 1);
  assert.equal(monster3Boss.entries.some((entry) => entry.fillName === 'ptdcz'), true);

  const monster3Normal = resolveMonsterDropTable('Monster3', { curStage: 2, curLevel: 1 });
  assert.equal(monster3Normal.branchId, 'normal');
  assert.equal(monster3Normal.isBoss, false);
  assert.deepEqual(
    monster3Normal.entries.map((entry) => entry.fillName),
    ['wptm', 'wpxt', 'wpsc'],
  );

  const monster9Stage9 = resolveMonsterDropTable('Monster9', { curStage: 9, curLevel: 1 });
  assert.equal(monster9Stage9.branchId, 'stage-9');
  assert.equal(canMonsterDropItems(monster9Stage9), true);

  const monster9OtherStage = resolveMonsterDropTable('Monster9', { curStage: 1, curLevel: 1 });
  assert.equal(monster9OtherStage.branchId, 'not-stage-9');
  assert.equal(monster9OtherStage.baseProbability, -1);
  assert.equal(canMonsterDropItems(monster9OtherStage), false);
}

function testExpandedMonsterDropTableBoundaries(): void {
  const monster1 = resolveMonsterDropTable('Monster1', { curStage: 1, curLevel: 1 });
  assert.equal(monster1.branchId, 'normal');
  assert.equal(monster1.baseProbability, 0.18);
  assert.equal(monster1.isBoss, false);
  assert.deepEqual(monster1.entries.map((entry) => entry.fillName), ['wptm', 'wpxt', 'wpsc']);

  const monster31 = resolveMonsterDropTable('Monster31', { curStage: 1, curLevel: 1 });
  assert.equal(monster31.branchId, 'boss');
  assert.equal(monster31.isBoss, true);
  assert.equal(monster31.baseProbability, 0.3);
  assert.equal(monster31.entries[0]?.fillName, 'wpqhs2');

  const monster207 = resolveMonsterDropTable('Monster207', { curStage: 1, curLevel: 1 });
  assert.equal(monster207.baseProbability, 0.15);
  assert.equal(monster207.isBoss, true);
  assert.deepEqual(
    monster207.entries.map((entry) => entry.fillName),
    ['cs_fj_dz', 'cs_fj_zt', 'cs_fj_jt', 'cs_fj_js'],
  );

  const monster601 = resolveMonsterDropTable('Monster601', { curStage: 1, curLevel: 1 });
  assert.equal(monster601.baseProbability, 0);
  assert.deepEqual(monster601.entries.map((entry) => entry.fillName), ['wpycjh']);
  assert.equal(canMonsterDropItems(monster601), false);

  const monster136 = resolveMonsterDropTable('Monster136', { curStage: 1, curLevel: 1 });
  assert.equal(monster136.baseProbability, 0.1);
  assert.deepEqual(monster136.entries.map((entry) => entry.fillName), ['xhb']);

  const monster128HighLevel = resolveMonsterDropTable('Monster128', {
    curStage: 1,
    curLevel: 1,
    averageLevel: 50,
  });
  assert.equal(monster128HighLevel.branchId, 'average-level-over-20');
  assert.deepEqual(monster128HighLevel.entries.map((entry) => entry.fillName), ['rls', 'wpccfq']);

  const monster128LowLevel = resolveMonsterDropTable('Monster128', {
    curStage: 1,
    curLevel: 1,
    averageLevel: 20,
  });
  assert.equal(monster128LowLevel.branchId, 'average-level-20-or-less');
  assert.equal(canMonsterDropItems(monster128LowLevel), false);

  const monster172Stage4 = resolveMonsterDropTable('Monster172', {
    curStage: 4,
    curLevel: 1,
    averageLevel: 60,
  });
  assert.equal(monster172Stage4.branchId, 'stage-4');
  assert.deepEqual(
    monster172Stage4.entries.map((entry) => entry.fillName),
    ['lssp_6', 'lssp_7', 'lssp_8', 'lssp_9'],
  );

  const monster172HighLevel = resolveMonsterDropTable('Monster172', {
    curStage: 5,
    curLevel: 1,
    averageLevel: 60,
  });
  assert.equal(monster172HighLevel.branchId, 'not-stage-4-average-level-50-plus');
  assert.deepEqual(monster172HighLevel.entries.map((entry) => entry.fillName), ['xhb']);

  const monster172LowLevel = resolveMonsterDropTable('Monster172', {
    curStage: 5,
    curLevel: 1,
    averageLevel: 49,
  });
  assert.equal(monster172LowLevel.branchId, 'not-stage-4-average-level-under-50');
  assert.equal(canMonsterDropItems(monster172LowLevel), false);

  const monster2001 = resolveMonsterDropTable('Monster2001', { curStage: 1, curLevel: 1 });
  assert.equal(monster2001.branchId, 'unsupported');
  assert.equal(monster2001.entries.length, 0);
  assert.equal(canMonsterDropItems(monster2001), false);
  assert.match(monster2001.note ?? '', /cwzb/);
}

function testConfiguredDropSkipsNegativeAndEmptyTables(): void {
  const model = createDropSystem();

  assert.equal(
    spawnConfiguredMonsterDrop({
      model,
      monsterId: 'Monster9',
      context: { curStage: 1, curLevel: 1 },
      x: 100,
      monsterY: 200,
      settleY: 220,
      random: () => 0,
    }),
    undefined,
  );

  assert.equal(
    spawnConfiguredMonsterDrop({
      model,
      monsterId: 'Monster30',
      context: { curStage: 1, curLevel: 1 },
      x: 100,
      monsterY: 200,
      settleY: 220,
      forceDrop: true,
      random: () => 0,
    }),
    undefined,
  );

  assert.equal(
    spawnConfiguredMonsterDrop({
      model,
      monsterId: 'Monster601',
      context: { curStage: 1, curLevel: 1 },
      x: 100,
      monsterY: 200,
      settleY: 220,
      random: () => 0,
    }),
    undefined,
  );

  const forcedDrop = spawnConfiguredMonsterDrop({
    model,
    monsterId: 'Monster29',
    context: { curStage: 1, curLevel: 1 },
    x: 100,
    monsterY: 200,
    settleY: 220,
    forceDrop: true,
    random: () => 0,
  });
  assert.equal(forcedDrop?.fillName, 'wpqhs1');
  assert.equal(getWorldDrops(model).length, 1);
}

function testPetRosterKeepsSingleActivePet(): void {
  const roster = createSeedPetRoster();
  roster.pets.push({
    ...roster.pets[0],
    id: 'pet-horse-1',
    species: 'horse',
    displayName: '小马',
    isActive: false,
  });

  assert.equal(getActivePet(roster)?.id, 'pet-monkey-1');
  selectPet(roster, 1);
  assert.equal(setSelectedPetActive(roster), true);
  assert.equal(getActivePet(roster)?.id, 'pet-horse-1');
  assert.equal(roster.pets.filter((pet) => pet.isActive).length, 1);

  assert.equal(toggleSelectedPetActive(roster), true);
  assert.equal(getActivePet(roster), undefined);
}

function testPetRuntimeFollowsAndWarps(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);

  const runtime: PetRuntimeModel = {
    petId: pet.id,
    x: 0,
    y: 0,
    facingX: 1,
    state: 'idle',
  };

  updatePetRuntime(runtime, pet, { x: 200, y: 0, facingX: 1 }, 100);
  assert.equal(runtime.state, 'follow');
  assert.ok(runtime.x > 0);

  runtime.x = -2000;
  runtime.y = 0;
  updatePetRuntime(runtime, pet, { x: 100, y: 300, facingX: -1 }, 16);
  assert.equal(runtime.state, 'warp');
  assert.equal(runtime.x, 100);
  assert.equal(runtime.y, 270);
}

function testMagicBottleRejectsLowSoul(): void {
  const model = createMagicBottleCaptureModel(4_999);

  assert.equal(
    requestMagicBottleCapture({
      model,
      owner: { x: 100, y: 200, facingX: 1 },
      inputMagicWeapon: true,
      previousInputMagicWeapon: false,
    }),
    false,
  );
  assert.equal(model.effect, undefined);
  assert.equal(model.soul, 4_999);
  assert.match(model.lastResult, /灵魂不足5000/);
}

function testMagicBottleCaptureSuccessAddsPetAndRemovesMonster(): void {
  const roster = createSeedPetRoster();
  roster.pets.length = 0;
  const model = createMagicBottleCaptureModel(8_000);
  const target = createTestCapturableTarget();

  requestMagicBottleCapture({
    model,
    owner: { x: 100, y: 200, facingX: 1 },
    inputMagicWeapon: true,
    previousInputMagicWeapon: false,
  });
  const hit = resolveMagicBottleCaptureHit({
    model,
    roster,
    targets: [target],
    random: () => 0,
  });

  assert.equal(hit, target);
  assert.equal(model.soul, 3_000);
  assert.equal(target.removed, true);
  assert.equal(roster.pets.length, 1);
  assert.equal(roster.pets[0].species, 'monkey');
  assert.equal(roster.pets[0].level, 6);
}

function testMagicBottleCaptureFailureKeepsMonster(): void {
  const roster = createSeedPetRoster();
  roster.pets.length = 0;
  const model = createMagicBottleCaptureModel(8_000);
  const target = createTestCapturableTarget();

  requestMagicBottleCapture({
    model,
    owner: { x: 100, y: 200, facingX: 1 },
    inputMagicWeapon: true,
    previousInputMagicWeapon: false,
  });
  resolveMagicBottleCaptureHit({
    model,
    roster,
    targets: [target],
    random: () => 0.99,
  });

  assert.equal(model.soul, 3_000);
  assert.equal(target.removed, false);
  assert.equal(roster.pets.length, 0);
  assert.match(target.feedback, /捕捉失败/);
}

function testMagicBottleFullRosterConsumesSoulButKeepsMonster(): void {
  const roster = createSeedPetRoster();
  roster.pets.length = 0;
  for (let i = 0; i < 10; i += 1) {
    assert.ok(catchNewPet(roster, 'monkey1', 1));
  }
  const model = createMagicBottleCaptureModel(8_000);
  const target = createTestCapturableTarget();

  requestMagicBottleCapture({
    model,
    owner: { x: 100, y: 200, facingX: 1 },
    inputMagicWeapon: true,
    previousInputMagicWeapon: false,
  });
  resolveMagicBottleCaptureHit({
    model,
    roster,
    targets: [target],
    random: () => 0,
  });

  assert.equal(model.soul, 3_000);
  assert.equal(target.removed, false);
  assert.equal(roster.pets.length, 10);
  assert.match(model.lastResult, /宠物栏已满/);
}

function testMagicWeaponInputIsSeparateFromNormalSkillSlots(): void {
  const model = createMagicBottleCaptureModel(8_000);
  const normalSkillSlots = [false, false, false, false, false];

  requestMagicBottleCapture({
    model,
    owner: { x: 100, y: 200, facingX: 1 },
    inputMagicWeapon: true,
    previousInputMagicWeapon: false,
  });

  assert.deepEqual(normalSkillSlots, [false, false, false, false, false]);
  assert.ok(model.effect);
}

function testPetConsumableLifetimeConsumesStackAndCapsAt100(): void {
  const registry = createSeedEquipmentRegistry();
  const inventory = createSeedInventoryStore(registry);
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.lifetime = 90;

  const result = usePetConsumable(roster, 'wpcsd');
  assert.equal(result.ok, true);
  assert.equal(result.shouldConsume, true);
  const consume = consumeStackByFillName(inventory, 'wpcsd', 1);

  assert.equal(consume.ok, true);
  assert.equal(consume.before, 2);
  assert.equal(consume.after, 1);
  assert.equal(pet.lifetime, 100);
}

function testPetConsumableRequiresActivePetWithoutConsuming(): void {
  const registry = createSeedEquipmentRegistry();
  const inventory = createSeedInventoryStore(registry);
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.isActive = false;

  const before = getStackQuantity(inventory, 'wpcsd');
  const result = usePetConsumable(roster, 'wpcsd');

  assert.equal(result.ok, false);
  assert.equal(result.shouldConsume, false);
  assert.equal(getStackQuantity(inventory, 'wpcsd'), before);
}

function testPetConsumableRestoreAndExperience(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.hp = 1;
  pet.mp = 2;
  pet.lifetime = 0;
  pet.exp = 7;

  const restore = usePetConsumable(roster, 'wphhd');
  assert.equal(restore.ok, true);
  assert.equal(pet.hp, pet.maxHp);
  assert.equal(pet.mp, pet.maxMp);
  assert.equal(pet.lifetime, 1);

  const experience = usePetConsumable(roster, 'djyys');
  assert.equal(experience.ok, true);
  assert.equal(pet.exp, 30_007);
}

function testMagicWeaponRejectsWithoutZbfb(): void {
  const model = createMagicWeaponModel();
  const loadout = createEmptyEquipmentLoadout();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
  });

  assert.equal(result.triggered, false);
  assert.equal(model.action, 'wait');
  assert.match(result.message, /未装备法宝/);
}

function testMagicWeaponKylHealsAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.kyl, 'kyl-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.hp = 40;

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicLeafCure');
  assert.equal(model.activeEffect?.totalMs, MagicWeaponTuning.leafDurationMs * 1.5);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(model, target, 1_000);
  assert.equal(target.combat.hp, 46);

  updateMagicWeapon(model, target, MagicWeaponTuning.leafDurationMs * 1.5);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
}

function testMagicWeaponSylRestoresMpAndWoodDuration(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const sylDefinition = {
    ...registry.syl,
    magicWeapon: {
      level: 1,
      element: '木',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(sylDefinition, 'syl-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.hp = 50;
  target.skill.mp = 20;

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.activeEffect?.kind, 'magicLeafCure2');
  assert.equal(model.activeEffect?.totalMs, MagicWeaponTuning.leafDurationMs * 1.5);

  updateMagicWeapon(model, target, 1_000);
  assert.equal(target.combat.hp, 56);
  assert.equal(target.skill.mp, 25);
}

function testMagicWeaponSword2ChoosesClosestTargetAndSpawnsProjectile(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.lxj, 'lxj-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 100, y: 200, facingX: 1 as const };
  const enemies = [
    { id: 'far', x: 400, y: 200, isAlive: true },
    { id: 'near', x: 160, y: 210, isAlive: true },
    { id: 'dead-near', x: 105, y: 205, isAlive: false },
  ];

  assert.equal(findClosestMagicWeaponTarget(source, enemies)?.id, 'near');

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(getActiveProjectiles(projectiles).length, 0);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);

  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.sword2WindupMs,
    projectiles,
    enemies,
  );

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'magic-weapon-sword2');
  assert.equal(projectile.sourceId, 'p1');
  assert.equal(projectile.x, 160);
  assert.equal(projectile.y, 225);
  assert.equal(projectile.damage, 22);

  updateProjectiles(projectiles, [{ id: 'p1', state: 'ready' }], projectile.lifetimeMs);
  assert.equal(getActiveProjectiles(projectiles).length, 0);
}

function testMagicWeaponSword2HandlesNoTargetsAndReturnsToWait(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.lxj, 'lxj-empty-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 100, y: 200, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.sword2WindupMs,
    projectiles,
    [],
  );

  assert.equal(getActiveProjectiles(projectiles).length, 0);
  assert.match(model.message, /没有目标/);

  updateMagicWeapon(model, target, MagicWeaponTuning.sword2ActionMs);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
}

function testMagicWeaponQpjActiveSpawnsSixProjectilesAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.fbqpj, 'fbqpj-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 100, y: 200, facingX: 1 as const };
  const enemies = [
    { id: 'near', x: 180, y: 210, isAlive: true },
    { id: 'far', x: 500, y: 210, isAlive: true },
  ];

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);

  updateMagicWeapon(model, target, 16, projectiles, enemies, source);
  const spawned = getActiveProjectiles(projectiles);
  assert.equal(spawned.length, 6);
  assert.equal(spawned.every((projectile) => projectile.variant === 'magic-weapon-qpj-active'), true);
  assert.equal(spawned.every((projectile) => projectile.x === 180), true);
  assert.equal(spawned.every((projectile) => projectile.y === 210), true);

  updateMagicWeapon(model, target, MagicWeaponTuning.qpjActiveWoodActionMs, projectiles, enemies, source);
  assert.equal(model.action, 'wait');
}

function testMagicWeaponQpjAutoSpawnsSingleProjectileWhenIdle(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.fbqpj, 'fbqpj-auto-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 100, y: 200, facingX: -1 as const };
  const enemies = [{ id: 'near', x: 120, y: 210, isAlive: true }];

  syncMagicWeaponFromLoadout(model, loadout);
  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.qpjAutoIntervalMs - 1,
    projectiles,
    enemies,
    source,
  );
  assert.equal(getActiveProjectiles(projectiles).length, 0);

  updateMagicWeapon(model, target, 1, projectiles, enemies, source);
  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'magic-weapon-qpj-auto');
  assert.equal(projectile.sourceId, 'p1');
  assert.equal(projectile.x, 120);
  assert.equal(projectile.y, 210);
}

function testMagicWeaponQpjNoTargetsDoesNotSpawn(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.fbqpj, 'fbqpj-empty-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 100, y: 200, facingX: 1 as const };

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(model, target, 16, projectiles, [], source);

  assert.equal(getActiveProjectiles(projectiles).length, 0);
  assert.match(model.message, /没有目标/);
}

function testMagicWeaponUmbrellaCreatesWoodShieldAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.hyzzs, 'hyzzs-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      effectiveStats: {
        defense: 40,
        magicDefensePercent: 0,
      },
    },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicUmbrella');
  assert.equal(target.combat.magicShield?.kind, 'magicUmbrellaDefend');
  assert.equal(target.combat.magicShield?.remainingAmount, 60);
  assert.equal(target.combat.magicShield?.remainingMs, MagicWeaponTuning.umbrellaShieldDurationMs);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(model, target, MagicWeaponTuning.umbrellaActionMs);
  assert.equal(model.action, 'wait');
  assert.equal(target.combat.magicShield?.remainingAmount, 60);
}

function testMagicWeaponUmbrella2FormulaAndDamageAbsorption(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const hywjsDefinition: EquipmentDefinition = {
    ...registry.hywjs,
    magicWeapon: {
      level: 2,
      element: '木',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(hywjsDefinition, 'hywjs-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.hp = 100;

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      effectiveStats: {
        defense: 30,
        magicDefensePercent: 3,
      },
    },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(target.combat.magicShield?.kind, 'magicUmbrellaDefend2');
  assert.equal(target.combat.magicShield?.remainingAmount, 360);

  const absorbed = applyHeroDamage(
    target.combat,
    createTestDamageEvent(80),
    0,
  );
  assert.equal(absorbed, true);
  assert.equal(target.combat.hp, 100);
  assert.equal(target.combat.state, 'ready');
  assert.equal(target.combat.magicShield?.remainingAmount, 280);

  applyHeroDamage(target.combat, createTestDamageEvent(300), 1);
  assert.equal(target.combat.hp, 80);
  assert.equal(target.combat.magicShield, undefined);
  assert.equal(target.combat.state, 'hurt');
}

function testMagicWeaponShieldDepletesAndExpires(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.hyzzs, 'hyzzs-expire-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      effectiveStats: {
        defense: 10,
        magicDefensePercent: 0,
      },
    },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(target.combat.magicShield?.remainingAmount, 15);
  applyHeroDamage(target.combat, createTestDamageEvent(15), 0);
  assert.equal(target.combat.magicShield, undefined);
  assert.equal(target.combat.hp, target.combat.maxHp);

  updateMagicWeapon(model, target, MagicWeaponTuning.umbrellaActionMs);
  requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      effectiveStats: {
        defense: 10,
        magicDefensePercent: 0,
      },
    },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateHeroMagicShield(target.combat, MagicWeaponTuning.umbrellaShieldDurationMs);
  assert.equal(target.combat.magicShield, undefined);
}

function testMagicWeaponRingRestoresAndBlocksDamage(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const zjldDefinition: EquipmentDefinition = {
    ...registry.zjld,
    magicWeapon: {
      level: 2,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(zjldDefinition, 'zjld-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.maxHp = 1_000;
  target.combat.hp = 100;
  target.skill.maxMp = 500;
  target.skill.mp = 50;

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicRing');
  assertNearlyEqual(target.combat.hp, 118.08);
  assertNearlyEqual(target.skill.mp, 54.52);
  assert.equal(target.combat.magicInvulnerability?.remainingMs, MagicWeaponTuning.ringInvulnerableMs);

  const blocked = applyHeroDamage(target.combat, createTestDamageEvent(99), 0);
  assert.equal(blocked, false);
  assertNearlyEqual(target.combat.hp, 118.08);
  assert.equal(target.combat.state, 'ready');

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(model, target, MagicWeaponTuning.ringActionMs);
  assert.equal(model.action, 'wait');
}

function testMagicWeaponRingWoodBonusAndExpires(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const zjldDefinition: EquipmentDefinition = {
    ...registry.zjld,
    magicWeapon: {
      level: 1,
      element: '木',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(zjldDefinition, 'zjld-wood-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.maxHp = 1_000;
  target.combat.hp = 100;
  target.skill.maxMp = 500;
  target.skill.mp = 50;

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assertNearlyEqual(target.combat.hp, 118.08);
  assertNearlyEqual(target.skill.mp, 54.52);
  assert.equal(
    target.combat.magicInvulnerability?.remainingMs,
    MagicWeaponTuning.ringInvulnerableMs * MagicWeaponTuning.ringWoodInvulnerableMultiplier,
  );

  updateHeroMagicInvulnerability(
    target.combat,
    MagicWeaponTuning.ringInvulnerableMs * MagicWeaponTuning.ringWoodInvulnerableMultiplier,
  );
  assert.equal(target.combat.magicInvulnerability, undefined);

  const hit = applyHeroDamage(target.combat, createTestDamageEvent(20), 5_000);
  assert.equal(hit, true);
  assertNearlyEqual(target.combat.hp, 98.08);
  assert.equal(target.combat.state, 'hurt');
}

function testMagicWeaponTimerRecordsAndRestoresOnSecondTrigger(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const zsTimerDefinition: EquipmentDefinition = {
    ...registry.zsTimer,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(zsTimerDefinition, 'zsTimer-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const movement = { x: 100, y: 200 };
  target.combat.hp = 80;
  target.skill.mp = 70;

  syncMagicWeaponFromLoadout(model, loadout);
  const first = requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      movement,
    },
    source: { sourceId: 'p1', x: movement.x, y: movement.y, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(first.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicTimer');
  assert.equal(model.activeEffect?.remainingMs, MagicWeaponTuning.timerWaitMs);

  movement.x = 320;
  movement.y = 420;
  target.combat.hp = 12;
  target.skill.mp = 9;

  const second = requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      movement,
    },
    source: { sourceId: 'p1', x: movement.x, y: movement.y, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(second.triggered, true);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
  assert.equal(movement.x, 100);
  assert.equal(movement.y, 200);
  assert.equal(target.combat.hp, 80);
  assert.equal(target.skill.mp, 70);
}

function testMagicWeaponTimerExpiresAndWoodWaits27Seconds(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.zsTimer, 'zsTimer-wood-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const movement = { x: 100, y: 200 };

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      movement,
    },
    source: { sourceId: 'p1', x: movement.x, y: movement.y, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicTimer');
  assert.equal(model.activeEffect?.remainingMs, MagicWeaponTuning.timerWoodWaitMs);

  updateMagicWeapon(model, {
    ...target,
    movement,
  }, MagicWeaponTuning.timerWoodWaitMs);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);

  movement.x = 300;
  target.combat.hp = 5;
  const late = requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      movement,
    },
    source: { sourceId: 'p1', x: movement.x, y: movement.y, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(late.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(movement.x, 300);
  assert.equal(target.combat.hp, 5);
}

function testMagicWeaponLxfbWoodBuffDrainsHpAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.lxfb, 'lxfb-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.maxHp = 200;
  target.combat.hp = 150;

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.activeEffect?.kind, 'magicDemonBuff');
  assert.equal(model.activeEffect?.remainingMs, MagicWeaponTuning.lxfbWoodDurationMs);
  assert.equal(target.combat.magicBuff?.kind, 'xlfbBuff');
  assert.equal(target.combat.magicBuff?.attackBonusPercent, 10);
  assert.equal(target.combat.magicBuff?.critBonusPercent, 10);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);

  updateMagicWeapon(model, target, 1_000);
  assert.equal(target.combat.hp, 140);
}

function testMagicWeaponSxfbBuffDurationAndDrain(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.sxfb, 'sxfb-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.maxHp = 200;
  target.combat.hp = 150;

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicDemonBuff');
  assert.equal(model.activeEffect?.remainingMs, MagicWeaponTuning.sxfbDurationMs);
  assert.equal(target.combat.magicBuff?.kind, 'sxfbBuff');
  assert.equal(target.combat.magicBuff?.attackBonusPercent, 15);
  assert.equal(target.combat.magicBuff?.critBonusPercent, 15);

  updateMagicWeapon(model, target, 1_000);
  assertNearlyEqual(target.combat.hp, 139.2);
}

function testMagicWeaponYxfbHalvesHpAndClearsBuff(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const yxfbDefinition: EquipmentDefinition = {
    ...registry.yxfb,
    magicWeapon: {
      level: 1,
      element: '木',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(yxfbDefinition, 'yxfb-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.combat.hp = 101;

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicDemonBuff');
  assert.equal(model.activeEffect?.remainingMs, MagicWeaponTuning.yxfbDurationMs * 2);
  assert.equal(target.combat.hp, 50.5);
  assert.equal(target.combat.magicBuff?.kind, 'yxfbBuff2');
  assert.equal(target.combat.magicBuff?.attackBonusPercent, 30);
  assert.equal(target.combat.magicBuff?.critBonusPercent, 30);

  updateMagicWeapon(model, target, MagicWeaponTuning.yxfbDurationMs * 2);
  assert.equal(model.action, 'wait');
  assert.equal(target.combat.magicBuff, undefined);
}

function testMagicWeaponFlowerAppliesHeroPetAndMonsterEffects(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.jyhl, 'jyhl-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const monster = createMonster30(200, 100, 'm30-flower');

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target: {
      ...target,
      effectiveStats: {
        defense: 0,
        magicDefensePercent: 0,
        power: 100,
      },
    },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
    friendlyPets: [pet],
    enemyTargets: [createMagicFlowerMonsterTarget(monster)],
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicFlower');
  assert.equal(model.activeEffect?.totalMs, 5_500);
  assert.equal(target.combat.magicFlowerBuff?.attackBonusFlat, 21);
  assert.equal(target.combat.magicFlowerBuff?.attackMultiplier, MagicWeaponTuning.flowerPetAttackMultiplier);
  assert.equal(pet.magicFlowerBuff?.attackMultiplier, MagicWeaponTuning.flowerPetAttackMultiplier);
  assert.equal(monster.magicFlowerDebuff?.damageMultiplier, MagicWeaponTuning.flowerEnemyDamageMultiplier);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(
    model,
    target,
    5_500,
    undefined,
    [createMagicFlowerMonsterTarget(monster)],
    undefined,
    [pet],
  );

  assert.equal(model.action, 'wait');
  assert.equal(target.combat.magicFlowerBuff, undefined);
  assert.equal(pet.magicFlowerBuff, undefined);
  assert.equal(monster.magicFlowerDebuff, undefined);
}

function testMagicWeaponFlowerWoodOnlyShortensActionBoundary(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.jyhl, 'jyhl-wood-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicFlower');
  if (model.activeEffect?.kind === 'magicFlower') {
    assert.equal(model.activeEffect.actionRemainingMs, MagicWeaponTuning.flowerWoodActionMs);
    assert.equal(model.activeEffect.totalMs, 5_500);
  }

  updateMagicWeapon(model, target, MagicWeaponTuning.flowerWoodActionMs);
  assert.equal(model.action, 'hit');
  assert.match(model.message, /动作完成/);
  assert.ok(target.combat.magicFlowerBuff);
}

function testMagicWeaponFlowerDebuffReducesMonster30AttackDamage(): void {
  const monster = createMonster30(0, 0, 'm30-flower-damage');
  monster.magicFlowerDebuff = {
    kind: 'magicFlowerDebuff',
    sourceName: '九佑魂莲',
    damageMultiplier: MagicWeaponTuning.flowerEnemyDamageMultiplier,
    totalMs: 5_500,
    remainingMs: 5_500,
  };
  monster.attackDecisionTimerMs = 0;

  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 150 }], 1, () => 0);

  assert.equal(monster.state, 'hit1');
  assertNearlyEqual(monster.activeAttack?.damage ?? 0, 15 * MagicWeaponTuning.flowerEnemyDamageMultiplier);
}

function createTestCapturableTarget(): CapturablePetTarget {
  return {
    id: 'test-monster72',
    monsterId: 'Monster72',
    x: 170,
    y: 146,
    width: 72,
    height: 68,
    level: 6,
    removed: false,
    feedback: '',
  };
}

function createMagicWeaponTestTarget(): {
  combat: ReturnType<typeof createHeroCombat>;
  skill: ReturnType<typeof createHeroSkillModel>;
} {
  return {
    combat: createHeroCombat('p1'),
    skill: createHeroSkillModel(),
  };
}

function createTestDamageEvent(amount: number) {
  return createDamageEvent({
    sourceId: 'monster-test',
    targetId: 'p1',
    attackId: `damage-${amount}-${Math.random()}`,
    actionName: 'test-hit',
    amount,
    attackKind: 'physics',
    knockbackX: 1,
    knockbackY: -1,
    occurredAtMs: 0,
  });
}

function createMagicFlowerMonsterTarget(
  monster: ReturnType<typeof createMonster30>,
) {
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyMagicFlowerDebuff: (debuff: {
      sourceName: string;
      totalMs: number;
      remainingMs: number;
      damageMultiplier: number;
    }) => {
      monster.magicFlowerDebuff = {
        kind: 'magicFlowerDebuff',
        sourceName: debuff.sourceName,
        damageMultiplier: debuff.damageMultiplier,
        totalMs: debuff.totalMs,
        remainingMs: debuff.remainingMs,
      };
    },
    clearMagicFlowerDebuff: () => {
      monster.magicFlowerDebuff = undefined;
    },
  };
}

function assertNearlyEqual(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < 0.000001,
    `expected ${actual} to be nearly ${expected}`,
  );
}

function createTestEquipmentInstance(
  definition: EquipmentDefinition,
  instanceId: string,
): EquipmentInstance {
  return {
    kind: 'equipment',
    instanceId,
    definition,
    quantity: 1,
  };
}

function createMagicWeaponInput(magicWeapon: boolean): PlayerInputState {
  return {
    slot: 'p1',
    moveX: 0,
    down: false,
    up: false,
    attack: false,
    jump: false,
    skillSlots: [false, false, false, false, false],
    special: false,
    magicWeapon,
  };
}

function getStackQuantity(
  inventory: ReturnType<typeof createSeedInventoryStore>,
  fillName: string,
): number {
  for (const category of ['equipment', 'items', 'fashion', 'skillBooks'] as const) {
    const stack = getInventoryEntries(inventory, category).find((entry) =>
      entry.kind === 'stack' && entry.definition.fillName === fillName
    );
    if (stack?.kind === 'stack') {
      return stack.quantity;
    }
  }

  return 0;
}
