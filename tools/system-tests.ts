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
  applyMonster30MagicFlagCounterFromHero,
  applyMonster30Hit,
  applyMonster30MagicBaguaStun,
  applyMonster30MagicFlagDebuff,
  applyMonster30MagicPearlPoison,
  applyMonster30MagicPearlStun,
  applyMonster30MagicSnowIce,
  applyMonster30MagicZlHummerStun,
  clearMonster30MagicBaguaStun,
  clearMonster30MagicPearlPoison,
  clearMonster30MagicPearlStun,
  clearMonster30MagicZlHummerStun,
  createMonster30,
  Monster30Tuning,
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
  buildMagicWeaponUpgradePanelState,
  createSeedEquipmentRegistry,
  createEmptyEquipmentLoadout,
  upgradeEquippedMagicWeapon,
  type EquipmentDefinition,
  type EquipmentInstance,
} from '../src/systems/EquipmentSystem';
import {
  consumeStackByFillName,
  createSeedInventoryStore,
  getInventoryEntries,
} from '../src/systems/InventorySystem';
import {
  addPetExperience,
  awardMonsterExperienceWithCurrentPet,
  catchNewPet,
  createMagicBottleCaptureModel,
  createSeedPetRoster,
  applyPetSkillSaveString,
  buildPetSkillSlotViews,
  encodePetSkillSaveString,
  getActivePet,
  getPetBaseStats,
  getPetExperienceToNextLevel,
  markActivePetSkillTriggered,
  requestPetMonkey2LjSkill,
  requestPetMonkey2XjSkill,
  requestPetMonkey3LyqSkill,
  requestPetMonkey3XjSkill,
  requestPetMonkey3LjSkill,
  requestPetMonkey4JgaoyiSkill,
  requestPetMonkey1XjSkill,
  requestPetQlfjCounterAttack,
  requestMagicBottleCapture,
  resolveMagicBottleCaptureHit,
  selectPet,
  setSelectedPetActive,
  syncPetRuntimeWithRoster,
  toggleSelectedPetActive,
  updatePetAutoBuffs,
  updatePetSkillState,
  updatePetRuntime,
  usePetConsumable,
  PetTuning,
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
  getProjectileHitbox,
  updateProjectiles,
} from '../src/systems/ProjectileSystem';
import {
  addHeroExperience,
  createHeroProgression,
  getHeroBaseStats,
  getHeroExperienceToNextLevel,
  ProgressionTuning,
} from '../src/systems/ProgressionSystem';
import {
  applyHeroDamage,
  createHeroCombat,
  updateHeroMagicInvulnerability,
  updateHeroMagicShield,
} from '../src/systems/HeroCombatSystem';
import {
  createHeroSkillModel,
} from '../src/systems/HeroSkillSystem';
import {
  createHeroMovement,
  updateHeroMovement,
} from '../src/systems/HeroMovementSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';

testMonster30StableIds();
testProgressionMonster30AwardAndPlayerIsolation();
testProgressionSingleLevelRefreshesRole2Stats();
testProgressionOverflowMultipleLevels();
testProgressionRole5FormulaAndMaxBoundary();
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
testPetSkillSaveStringRoundTripEmptyAndUnknown();
testPetSkillSlotsExposeEightDisplaySlots();
testPetSkillResetConsumableRequiresActivePetWithoutConsuming();
testPetSkillResetConsumableConsumesStackAndUsesInjectedRandom();
testPetSxkbAutoBuffRequiresLearnedSkillMpAndReadyCounter();
testPetSxkbAutoBuffAppliesExpiresAndUsesShorterRetriggerCounter();
testPetGjjcAutoBuffRequiresLearnedSkillMpAndReadyCounter();
testPetGjjcAutoBuffAppliesExpiresAndRespectsRetriggerCounter();
testPetSmjcAutoBuffAppliesHpRatioAndExpires();
testPetMfjcAutoBuffRequiresLearnedSkillMpAndReadyCounter();
testPetMfjcAutoBuffAppliesMpRatioAndExpires();
testPetFyjcAutoBuffRequiresLearnedSkillMpAndReadyCounter();
testPetFyjcAutoBuffAppliesExpiresAndRespectsRetriggerCounter();
testPetQlfjCounterAttackRequiresLearnedSkillAlivePetAndChance();
testPetQlfjCounterAttackHitsMonsterWithoutMpCost();
testPetExperienceMonster30ShareWithActivePet();
testPetExperienceMonster30FullHeroAwardWithoutPet();
testPetExperienceSingleLevelRefreshesStats();
testPetExperienceOverflowAndDjyysShareUpgradePath();
testPetExperienceSpeciesBaseStats();
testPetFormChangeFromNaturalExperience();
testPetFormChangeFromDjyysRebuildsRuntime();
testPetFormDoesNotChangeBeforeThreshold();
testPetFormThreeDoesNotRepeatChange();
testPetMonkey1XjRequiresLearnedSkill();
testPetMonkey1XjRequiresMpTriggerCooldownAndTarget();
testPetMonkey1XjSpawnsProjectileAndDamagesMonster30();
testPetMonkey2LjRequiresLearnedSkillMpAndCooldown();
testPetMonkey2LjSpawnsProjectileAndDamagesMonster30();
testPetMonkey2XjRequiresLearnedSkillMpTriggerCooldownAndTarget();
testPetMonkey2XjSpawnsProjectileAndDamagesMonster30();
testPetMonkey3LyqRequiresLearnedSkillMpCooldownDistanceAndTarget();
testPetMonkey3LyqSpawnsProjectileAndDamagesMonster30();
testPetMonkey3XjRequiresLearnedSkillMpCooldownAndTarget();
testPetMonkey3XjSpawnsProjectileAndDamagesMonster30();
testPetMonkey3LjRequiresLearnedSkillMpTriggerCooldownAndTarget();
testPetMonkey3LjSpawnsProjectileAndDamagesMonster30();
testPetMonkey4JgaoyiRequiresLearnedSkillMpCooldownAndTarget();
testPetMonkey4JgaoyiSpawnsHit5FeedbackWithoutDirectDamage();
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
testMagicWeaponFlagCreatesGuardAndRejectsReentry();
testMagicWeaponFlagWoodOnlyShortensActionBoundary();
testMagicWeaponFlagCounterDebuffDamagesAndExpires();
testMagicWeaponFlagDebuffDeathClears();
testMagicWeaponPearlAttackCountAndWoodBonus();
testMagicWeaponPearlSpawnsThreeBulletsPerTargetAndActionReturnsToWait();
testMagicWeaponPearlSelectsClosestTargetEachRound();
testMagicWeaponPearlNoTargetsFallsBackToMp();
testMagicWeaponPearlStunAndPoisonEndEffects();
testMagicWeaponPearlRejectsReentryDuringChain();
testMagicWeaponBaguaRequiresLevelAtLeastOne();
testMagicWeaponBaguaStunsAllMonster30sAndRejectsReentry();
testMagicWeaponBaguaWoodStunsForEightSeconds();
testMagicWeaponBaguaStunExpiresAndRestoresMonster30();
testMagicWeaponZlHummerRequiresLevelAtLeastOne();
testMagicWeaponZlHummerSpawnsFrontHammerAndRejectsReentry();
testMagicWeaponZlHummerWoodActionBoundary();
testMagicWeaponZlHummerNoTargetsStillCleansUp();
testMagicWeaponZlHummerHitAppliesDamageAndStun();
testMagicWeaponZlHummerStunExpiresAndRestoresMonster30();
testMagicWeaponBigBottleCreatesPlatformAndRejectsReentry();
testMagicWeaponBigBottleFollowsAndExpires();
testMagicWeaponBigBottlePlatformCatchesFallingHero();
testMagicWeaponSnowSpawnsRandomFallAndRejectsReentry();
testMagicWeaponSnowHitAppliesDamageAndIce();
testMagicWeaponUpgradePanelShowsCurrentZbfb();
testMagicWeaponUpgradeConsumesSoulAndRefreshesStats();
testMagicWeaponUpgradeRejectsLowSoulAndMissingEquipment();
testMagicWeaponSystemReadsUpgradedLevel();

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

function testProgressionMonster30AwardAndPlayerIsolation(): void {
  const p1 = createHeroProgression(2);
  const p2 = createHeroProgression(3);
  const monster = createMonster30(0, 0, 'm30-exp');

  assert.equal(applyMonster30Hit(monster, monster.maxHp), true);
  assert.equal(monster.state, 'dead');

  const result = addHeroExperience(p1, monster.experience);
  assert.equal(result.appliedExp, ProgressionTuning.monster30Experience);
  assert.equal(p1.currentExp, ProgressionTuning.monster30Experience);
  assert.equal(p1.level, 1);
  assert.equal(p2.currentExp, 0);
  assert.equal(p2.level, 1);
}

function testProgressionSingleLevelRefreshesRole2Stats(): void {
  const progression = createHeroProgression(2, 1, 134);
  const result = addHeroExperience(progression, 1);

  assert.equal(result.levelsGained, 1);
  assert.equal(progression.level, 2);
  assert.equal(progression.currentExp, 0);
  assert.equal(progression.expToNext, 145);
  assert.deepEqual(result.baseStatsAfter, {
    maxHp: 70,
    maxMp: 140,
    power: 20,
    defense: 1,
  });
}

function testProgressionOverflowMultipleLevels(): void {
  const progression = createHeroProgression(1, 1, 134);
  const result = addHeroExperience(progression, 300);

  assert.equal(result.levelsGained, 2);
  assert.equal(progression.level, 3);
  assert.equal(progression.currentExp, 154);
  assert.equal(progression.expToNext, 155);
  assert.deepEqual(result.baseStatsAfter, {
    maxHp: 180,
    maxMp: 90,
    power: 20,
    defense: 6,
  });
}

function testProgressionRole5FormulaAndMaxBoundary(): void {
  assert.deepEqual(getHeroBaseStats(5, 3), {
    maxHp: 168,
    maxMp: 103,
    power: 21,
    defense: 5,
  });
  assert.equal(getHeroExperienceToNextLevel(89), ProgressionTuning.maxLevelExpToNext);

  const progression = createHeroProgression(5, 88, 349_999);
  const result = addHeroExperience(progression, 1);

  assert.equal(result.levelsGained, 1);
  assert.equal(progression.level, 89);
  assert.equal(progression.currentExp, 0);
  assert.equal(progression.expToNext, ProgressionTuning.maxLevelExpToNext);
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

  assert.equal(getActivePet(roster)?.id, 'pet-monkey-1');
  selectPet(roster, 1);
  assert.equal(setSelectedPetActive(roster), true);
  assert.equal(getActivePet(roster)?.id, 'pet-monkey-2');
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
    runtimeKey: `${pet.id}:${pet.species}:${pet.form}`,
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
  assert.equal(experience.experience?.levelsGained, 17);
  assert.equal(pet.level, 18);
  assert.equal(pet.exp, 4_738);
  assert.equal(pet.expToNext, getPetExperienceToNextLevel(18));
  assert.equal(pet.hp, pet.maxHp);
  assert.equal(pet.mp, pet.maxMp);
  assert.equal(pet.maxHp, 3_480);
}

function testPetSkillSaveStringRoundTripEmptyAndUnknown(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);

  pet.skills = [];
  assert.equal(encodePetSkillSaveString(pet.skills), '');

  applyPetSkillSaveString(pet, '');
  assert.deepEqual(pet.skills, []);

  applyPetSkillSaveString(pet, 'xj~mysterySkill');
  assert.deepEqual(pet.skills, ['xj', 'mysterySkill']);
  assert.equal(encodePetSkillSaveString(pet.skills), 'xj~mysterySkill');
}

function testPetSkillSlotsExposeEightDisplaySlots(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills = ['xj', 'mysterySkill'];

  const slots = buildPetSkillSlotViews(pet);

  assert.equal(slots.length, PetTuning.skillSlotCount);
  assert.equal(slots[0]?.slot, 1);
  assert.equal(slots[0]?.skillKey, 'xj');
  assert.equal(slots[0]?.name, '献祭');
  assert.equal(slots[0]?.isKnown, true);
  assert.equal(slots[1]?.skillKey, 'mysterySkill');
  assert.equal(slots[1]?.name, 'mysterySkill');
  assert.equal(slots[1]?.isKnown, false);
  assert.equal(slots[2]?.isEmpty, true);
  assert.equal(slots[7]?.slot, 8);
  assert.equal(slots[7]?.isEmpty, true);
}

function testPetSkillResetConsumableRequiresActivePetWithoutConsuming(): void {
  const registry = createSeedEquipmentRegistry();
  const inventory = createSeedInventoryStore(registry);
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.isActive = false;

  const before = getStackQuantity(inventory, 'cwjnxld');
  const result = usePetConsumable(roster, 'cwjnxld', () => 0);

  assert.equal(result.ok, false);
  assert.equal(result.shouldConsume, false);
  assert.equal(getStackQuantity(inventory, 'cwjnxld'), before);
}

function testPetSkillResetConsumableConsumesStackAndUsesInjectedRandom(): void {
  const registry = createSeedEquipmentRegistry();
  const inventory = createSeedInventoryStore(registry);
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.level = 5;
  pet.perception = 8;
  pet.skills = ['oldSkill'];
  const randomValues = [0.1, 0, 0.1, 0.99];
  const random = () => randomValues.shift() ?? 0;

  const result = usePetConsumable(roster, 'cwjnxld', random);
  assert.equal(result.ok, true);
  assert.equal(result.shouldConsume, true);
  assert.deepEqual(result.skillReset?.beforeSkills, ['oldSkill']);
  assert.deepEqual(result.skillReset?.afterSkills, ['tsml', 'xj']);
  assert.deepEqual(pet.skills, ['tsml', 'xj']);

  const consume = consumeStackByFillName(inventory, 'cwjnxld', 1);
  assert.equal(consume.ok, true);
  assert.equal(consume.before, 1);
  assert.equal(consume.after, 0);
  assert.equal(getStackQuantity(inventory, 'cwjnxld'), 0);
}

function testPetSxkbAutoBuffRequiresLearnedSkillMpAndReadyCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const ownerStats = { hp: 80, maxHp: 120, mp: 40, maxMp: 100, power: 100, defense: 30 };

  pet.skills = pet.skills.filter((skill) => skill !== 'sxkb');
  pet.critBonusRate = 0;
  pet.autoBuffState = {
    sxkb: { counterMs: 0 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const unlearned = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(unlearned.triggered, false);
  assert.equal(pet.critBonusRate, 0);

  pet.skills.push('sxkb');
  pet.autoBuffState.sxkb.counterMs = 100;
  const cooling = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 50 });
  assert.equal(cooling.triggered, false);
  assert.equal(pet.autoBuffState.sxkb.counterMs, 50);
  assert.equal(pet.critBonusRate, 0);

  pet.autoBuffState.sxkb.counterMs = 0;
  pet.mp = PetTuning.autoBuffSxkbMpCost - 1;
  const mpBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(mpBlocked.triggered, false);
  assert.equal(pet.mp, PetTuning.autoBuffSxkbMpCost - 1);
  assert.equal(pet.critBonusRate, 0);
}

function testPetSxkbAutoBuffAppliesExpiresAndUsesShorterRetriggerCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills.push('sxkb');
  pet.mp = 100;
  pet.form = 1;
  pet.technique = 1;
  pet.warpower = 1;
  pet.critBonusRate = 0;
  pet.autoBuffState = {
    sxkb: { counterMs: 0 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const ownerStats = { hp: 80, maxHp: 120, mp: 40, maxMp: 100, power: 100, defense: 30 };

  const triggered = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(triggered.triggered, true);
  assert.equal(triggered.mpBefore, 100);
  assert.equal(triggered.mpAfter, 80);
  assert.equal(pet.mp, 80);
  assert.ok(Math.abs((triggered.bonusCritRate ?? 0) - 0.019845) < 0.000001);
  assert.ok(Math.abs(pet.critBonusRate - 0.019845) < 0.000001);
  assert.equal(pet.autoBuffState.sxkb.active?.kind, 'sxkb');
  assert.ok(Math.abs(pet.autoBuffState.sxkb.counterMs - PetTuning.autoBuffSxkbRetriggerFrames * PetTuning.autoBuffFrameMs) < 0.0001);

  const retriggerBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(retriggerBlocked.triggered, false);
  assert.ok(Math.abs(pet.critBonusRate - 0.019845) < 0.000001);

  const expired = updatePetAutoBuffs({
    roster,
    ownerStats,
    deltaMs: pet.autoBuffState.sxkb.active?.remainingMs ?? 0,
  });
  assert.equal(expired.expired, true);
  assert.equal(expired.triggered, false);
  assert.ok(Math.abs(pet.critBonusRate) < 0.000001);
  assert.equal(pet.autoBuffState.sxkb.active, undefined);
  assert.ok(pet.autoBuffState.sxkb.counterMs > 0);
}

function testPetGjjcAutoBuffRequiresLearnedSkillMpAndReadyCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const ownerStats = { hp: 80, maxHp: 120, mp: 40, maxMp: 100, power: 100, defense: 30 };

  pet.skills = pet.skills.filter((skill) => skill !== 'gjjc');
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 0 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const unlearned = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(unlearned.triggered, false);
  assert.equal(ownerStats.power, 100);

  pet.skills.push('gjjc');
  pet.autoBuffState.gjjc.counterMs = 100;
  const cooling = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 50 });
  assert.equal(cooling.triggered, false);
  assert.equal(pet.autoBuffState.gjjc.counterMs, 50);
  assert.equal(ownerStats.power, 100);

  pet.autoBuffState.gjjc.counterMs = 0;
  pet.mp = PetTuning.autoBuffGjjcMpCost - 1;
  const mpBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(mpBlocked.triggered, false);
  assert.equal(pet.mp, PetTuning.autoBuffGjjcMpCost - 1);
  assert.equal(ownerStats.power, 100);
}

function testPetGjjcAutoBuffAppliesExpiresAndRespectsRetriggerCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills.push('gjjc');
  pet.mp = 100;
  pet.form = 1;
  pet.technique = 1;
  pet.warpower = 1;
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 0 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const ownerStats = { hp: 80, maxHp: 120, mp: 40, maxMp: 100, power: 100, defense: 30 };

  const triggered = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(triggered.triggered, true);
  assert.equal(triggered.mpBefore, 100);
  assert.equal(triggered.mpAfter, 80);
  assert.equal(pet.mp, 80);
  assert.ok(Math.abs((triggered.bonusPower ?? 0) - 6.3) < 0.0001);
  assert.ok(Math.abs(ownerStats.power - 106.3) < 0.0001);
  assert.equal(pet.autoBuffState.gjjc.active?.kind, 'gjjc');

  const retriggerBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(retriggerBlocked.triggered, false);
  assert.ok(Math.abs(ownerStats.power - 106.3) < 0.0001);

  const expired = updatePetAutoBuffs({
    roster,
    ownerStats,
    deltaMs: pet.autoBuffState.gjjc.active?.remainingMs ?? 0,
  });
  assert.equal(expired.expired, true);
  assert.equal(expired.triggered, false);
  assert.ok(Math.abs(ownerStats.power - 100) < 0.0001);
  assert.equal(pet.autoBuffState.gjjc.active, undefined);
  assert.ok(pet.autoBuffState.gjjc.counterMs > 0);
}

function testPetSmjcAutoBuffAppliesHpRatioAndExpires(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills.push('smjc');
  pet.mp = 100;
  pet.form = 1;
  pet.technique = 1;
  pet.warpower = 1;
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 0 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const ownerStats = { hp: 60, maxHp: 120, mp: 40, maxMp: 100, power: 100, defense: 30 };

  const triggered = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(triggered.triggered, true);
  assert.equal(triggered.mpBefore, 100);
  assert.equal(triggered.mpAfter, 80);
  assert.equal(pet.mp, 80);
  assert.ok(Math.abs((triggered.bonusMaxHp ?? 0) - 73.5) < 0.0001);
  assert.ok(Math.abs(ownerStats.maxHp - 193.5) < 0.0001);
  assert.ok(Math.abs(ownerStats.hp - 96.75) < 0.0001);
  assert.equal(ownerStats.power, 100);
  assert.equal(pet.autoBuffState.smjc.active?.kind, 'smjc');

  const expired = updatePetAutoBuffs({
    roster,
    ownerStats,
    deltaMs: pet.autoBuffState.smjc.active?.remainingMs ?? 0,
  });
  assert.equal(expired.expired, true);
  assert.equal(expired.triggered, false);
  assert.ok(Math.abs(ownerStats.maxHp - 120) < 0.0001);
  assert.ok(Math.abs(ownerStats.hp - 60) < 0.0001);
  assert.equal(pet.autoBuffState.smjc.active, undefined);
  assert.ok(pet.autoBuffState.smjc.counterMs > 0);
}

function testPetMfjcAutoBuffRequiresLearnedSkillMpAndReadyCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const ownerStats = { hp: 80, maxHp: 120, mp: 50, maxMp: 100, power: 100, defense: 30 };

  pet.skills = pet.skills.filter((skill) => skill !== 'mfjc');
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 0 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const unlearned = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(unlearned.triggered, false);
  assert.equal(ownerStats.maxMp, 100);
  assert.equal(ownerStats.mp, 50);

  pet.skills.push('mfjc');
  pet.autoBuffState.mfjc.counterMs = 100;
  const cooling = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 50 });
  assert.equal(cooling.triggered, false);
  assert.equal(pet.autoBuffState.mfjc.counterMs, 50);
  assert.equal(ownerStats.maxMp, 100);
  assert.equal(ownerStats.mp, 50);

  pet.autoBuffState.mfjc.counterMs = 0;
  pet.mp = PetTuning.autoBuffMfjcMpCost - 1;
  const mpBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(mpBlocked.triggered, false);
  assert.equal(pet.mp, PetTuning.autoBuffMfjcMpCost - 1);
  assert.equal(ownerStats.maxMp, 100);
  assert.equal(ownerStats.mp, 50);
}

function testPetMfjcAutoBuffAppliesMpRatioAndExpires(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills.push('mfjc');
  pet.mp = 100;
  pet.form = 1;
  pet.technique = 1;
  pet.warpower = 1;
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 0 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const ownerStats = { hp: 80, maxHp: 120, mp: 50, maxMp: 100, power: 100, defense: 30 };

  const triggered = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(triggered.triggered, true);
  assert.equal(triggered.mpBefore, 100);
  assert.equal(triggered.mpAfter, 80);
  assert.equal(pet.mp, 80);
  assert.ok(Math.abs((triggered.bonusMaxMp ?? 0) - 73.5) < 0.0001);
  assert.ok(Math.abs(ownerStats.maxMp - 173.5) < 0.0001);
  assert.ok(Math.abs(ownerStats.mp - 86.75) < 0.0001);
  assert.equal(ownerStats.hp, 80);
  assert.equal(ownerStats.maxHp, 120);
  assert.equal(ownerStats.power, 100);
  assert.equal(pet.autoBuffState.mfjc.active?.kind, 'mfjc');

  const retriggerBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(retriggerBlocked.triggered, false);
  assert.ok(Math.abs(ownerStats.maxMp - 173.5) < 0.0001);
  assert.ok(Math.abs(ownerStats.mp - 86.75) < 0.0001);

  const expired = updatePetAutoBuffs({
    roster,
    ownerStats,
    deltaMs: pet.autoBuffState.mfjc.active?.remainingMs ?? 0,
  });
  assert.equal(expired.expired, true);
  assert.equal(expired.triggered, false);
  assert.ok(Math.abs(ownerStats.maxMp - 100) < 0.0001);
  assert.ok(Math.abs(ownerStats.mp - 50) < 0.0001);
  assert.equal(pet.autoBuffState.mfjc.active, undefined);
  assert.ok(pet.autoBuffState.mfjc.counterMs > 0);
}

function testPetFyjcAutoBuffRequiresLearnedSkillMpAndReadyCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const ownerStats = { hp: 80, maxHp: 120, mp: 50, maxMp: 100, power: 100, defense: 30 };

  pet.skills = pet.skills.filter((skill) => skill !== 'fyjc');
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 0 },
    lastResult: 'ready',
  };
  const unlearned = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(unlearned.triggered, false);
  assert.equal(ownerStats.defense, 30);

  pet.skills.push('fyjc');
  pet.autoBuffState.fyjc.counterMs = 100;
  const cooling = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 50 });
  assert.equal(cooling.triggered, false);
  assert.equal(pet.autoBuffState.fyjc.counterMs, 50);
  assert.equal(ownerStats.defense, 30);

  pet.autoBuffState.fyjc.counterMs = 0;
  pet.mp = PetTuning.autoBuffFyjcMpCost - 1;
  const mpBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(mpBlocked.triggered, false);
  assert.equal(pet.mp, PetTuning.autoBuffFyjcMpCost - 1);
  assert.equal(ownerStats.defense, 30);
}

function testPetFyjcAutoBuffAppliesExpiresAndRespectsRetriggerCounter(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills.push('fyjc');
  pet.mp = 100;
  pet.form = 1;
  pet.technique = 1;
  pet.warpower = 1;
  pet.autoBuffState = {
    sxkb: { counterMs: 9999 },
    smjc: { counterMs: 9999 },
    mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 9999 },
    fyjc: { counterMs: 0 },
    lastResult: 'ready',
  };
  const ownerStats = { hp: 80, maxHp: 120, mp: 50, maxMp: 100, power: 100, defense: 30 };

  const triggered = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(triggered.triggered, true);
  assert.equal(triggered.mpBefore, 100);
  assert.equal(triggered.mpAfter, 80);
  assert.equal(pet.mp, 80);
  assert.ok(Math.abs((triggered.bonusDefense ?? 0) - 5.25) < 0.0001);
  assert.ok(Math.abs(ownerStats.defense - 35.25) < 0.0001);
  assert.equal(ownerStats.power, 100);
  assert.equal(ownerStats.hp, 80);
  assert.equal(ownerStats.maxHp, 120);
  assert.equal(ownerStats.mp, 50);
  assert.equal(ownerStats.maxMp, 100);
  assert.equal(pet.autoBuffState.fyjc.active?.kind, 'fyjc');

  const retriggerBlocked = updatePetAutoBuffs({ roster, ownerStats, deltaMs: 0 });
  assert.equal(retriggerBlocked.triggered, false);
  assert.ok(Math.abs(ownerStats.defense - 35.25) < 0.0001);

  const expired = updatePetAutoBuffs({
    roster,
    ownerStats,
    deltaMs: pet.autoBuffState.fyjc.active?.remainingMs ?? 0,
  });
  assert.equal(expired.expired, true);
  assert.equal(expired.triggered, false);
  assert.ok(Math.abs(ownerStats.defense - 30) < 0.0001);
  assert.equal(pet.autoBuffState.fyjc.active, undefined);
  assert.ok(pet.autoBuffState.fyjc.counterMs > 0);
}

function testPetQlfjCounterAttackRequiresLearnedSkillAlivePetAndChance(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const target = createPetSkillMonsterTarget(createMonster30(100, 100, 'm30-pet-qlfj-gates'));
  const mpBefore = pet.mp;

  let result = requestPetQlfjCounterAttack({
    roster,
    runtime: createTestPetRuntime(pet.id),
    targets: [target],
    random: () => 0,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned qlfj/);
  assert.equal(pet.mp, mpBefore);

  pet.skills.push('qlfj');
  pet.hp = 0;
  result = requestPetQlfjCounterAttack({
    roster,
    runtime: createTestPetRuntime(pet.id),
    targets: [target],
    random: () => 0,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /defeated/);
  assert.equal(pet.mp, mpBefore);

  pet.hp = pet.maxHp;
  result = requestPetQlfjCounterAttack({
    roster,
    runtime: createTestPetRuntime(pet.id),
    targets: [target],
    random: () => 1,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /missed/);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore);
  assert.equal(pet.mp, mpBefore);
}

function testPetQlfjCounterAttackHitsMonsterWithoutMpCost(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills.push('qlfj');
  pet.form = 1;
  pet.warpower = 1;
  const monster = createMonster30(100, 100, 'm30-pet-qlfj-hit');
  const mpBefore = pet.mp;

  const result = requestPetQlfjCounterAttack({
    roster,
    runtime: createTestPetRuntime(pet.id),
    targets: [createPetSkillMonsterTarget(monster)],
    random: () => 0,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore);
  assert.equal(pet.mp, mpBefore);
  assert.equal(result.damage, pet.atk);
  assert.equal(result.target?.id, monster.id);
  assert.equal(applyMonster30Hit(monster, result.damage ?? 0), true);
  assert.equal(monster.hp, monster.maxHp - pet.atk);
}

function testPetExperienceMonster30ShareWithActivePet(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);

  const share = awardMonsterExperienceWithCurrentPet(roster, Monster30Tuning.experience);

  assert.equal(share.heroExperience, 2);
  assert.equal(share.petExperience, 2);
  assert.equal(share.petResult?.appliedExp, 2);
  assert.equal(pet.exp, 2);
  assert.equal(pet.level, 1);
}

function testPetExperienceMonster30FullHeroAwardWithoutPet(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.isActive = false;

  const share = awardMonsterExperienceWithCurrentPet(roster, Monster30Tuning.experience);

  assert.equal(share.heroExperience, Monster30Tuning.experience);
  assert.equal(share.petExperience, 0);
  assert.equal(share.petResult, undefined);
  assert.equal(pet.exp, 0);
}

function testPetExperienceSingleLevelRefreshesStats(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.exp = 49;
  pet.hp = 1;
  pet.mp = 2;

  const result = addPetExperience(pet, 1);

  assert.equal(result.levelsGained, 1);
  assert.equal(pet.level, 2);
  assert.equal(pet.exp, 0);
  assert.equal(pet.expToNext, 100);
  assert.equal(pet.maxHp, 840);
  assert.equal(pet.hp, pet.maxHp);
  assert.equal(pet.maxMp, 150.08);
  assert.equal(pet.mp, pet.maxMp);
  assert.equal(pet.atk, 20.015);
  assert.equal(pet.def, 11);
}

function testPetExperienceOverflowAndDjyysShareUpgradePath(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.exp = 49;

  const direct = addPetExperience(pet, 101);
  assert.equal(direct.levelsGained, 2);
  assert.equal(pet.level, 3);
  assert.equal(pet.exp, 0);
  assert.equal(pet.expToNext, 150);

  pet.level = 1;
  pet.exp = 49;
  pet.expToNext = getPetExperienceToNextLevel(1);
  const consumable = usePetConsumable(roster, 'djyys');
  assert.equal(consumable.experience?.levelsGained, 17);
  assert.equal(pet.level, 18);
  assert.equal(pet.exp, 4_780);
}

function testPetExperienceSpeciesBaseStats(): void {
  assert.deepEqual(getPetBaseStats('horse', 2, {
    mpQuality: 1,
    atkQuality: 1,
  }), {
    maxHp: 840,
    maxMp: 250.08,
    atk: 25.015,
    def: 11,
  });
  assert.deepEqual(getPetBaseStats('phoenix', 1, {
    mpQuality: 2,
    atkQuality: 3,
  }), {
    maxHp: 840,
    maxMp: 200,
    atk: 32,
    def: 6,
  });
}

function testPetFormChangeFromNaturalExperience(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.level = 15;
  pet.exp = getPetExperienceToNextLevel(15) - 1;
  pet.expToNext = getPetExperienceToNextLevel(15);
  pet.form = 1;
  pet.displayName = '小猴';

  const result = addPetExperience(pet, 1);

  assert.equal(result.levelsGained, 1);
  assert.equal(pet.level, 16);
  assert.equal(pet.form, 2);
  assert.equal(result.formChanges.length, 1);
  assert.deepEqual(result.formChanges[0], {
    fromForm: 1,
    toForm: 2,
    fromDisplayName: '小猴',
    toDisplayName: '小猴 F2',
    level: 16,
  });
}

function testPetFormChangeFromDjyysRebuildsRuntime(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.level = 30;
  pet.exp = getPetExperienceToNextLevel(30) - 1;
  pet.expToNext = getPetExperienceToNextLevel(30);
  pet.form = 2;
  pet.displayName = '小猴 F2';

  const owner = { x: 100, y: 200, facingX: 1 as const };
  const runtime = syncPetRuntimeWithRoster(roster, undefined, owner);
  assert.ok(runtime);
  assert.equal(runtime.runtimeKey, 'pet-monkey-1:monkey:2');

  const consumable = usePetConsumable(roster, 'djyys');
  assert.equal(consumable.ok, true);
  assert.ok((consumable.experience?.formChanges.length ?? 0) >= 1);
  assert.equal(pet.form, 3);

  const rebuilt = syncPetRuntimeWithRoster(roster, runtime, owner);
  assert.ok(rebuilt);
  assert.notEqual(rebuilt, runtime);
  assert.equal(rebuilt.runtimeKey, 'pet-monkey-1:monkey:3');
  assert.equal(rebuilt.x, 42);
  assert.equal(rebuilt.y, 170);
}

function testPetFormDoesNotChangeBeforeThreshold(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.level = 14;
  pet.exp = getPetExperienceToNextLevel(14) - 1;
  pet.expToNext = getPetExperienceToNextLevel(14);
  pet.form = 1;
  pet.displayName = '小猴';

  const result = addPetExperience(pet, 1);

  assert.equal(pet.level, 15);
  assert.equal(pet.form, 1);
  assert.equal(pet.displayName, '小猴');
  assert.equal(result.formChanges.length, 0);
}

function testPetFormThreeDoesNotRepeatChange(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.level = 31;
  pet.exp = getPetExperienceToNextLevel(31) - 1;
  pet.expToNext = getPetExperienceToNextLevel(31);
  pet.form = 3;
  pet.displayName = '小猴 F3';

  const result = addPetExperience(pet, 1);

  assert.equal(pet.level, 32);
  assert.equal(pet.form, 3);
  assert.equal(pet.displayName, '小猴 F3');
  assert.equal(result.formChanges.length, 0);
}

function testPetMonkey1XjRequiresLearnedSkill(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  pet.skills = pet.skills.filter((skill) => skill !== 'xj');
  const projectiles = createProjectileSystem();

  assert.equal(markActivePetSkillTriggered(roster), true);
  const result = requestPetMonkey1XjSkill({
    roster,
    runtime: createTestPetRuntime(pet.id),
    targets: [createPetSkillMonsterTarget(createMonster30(100, 100, 'm30-pet-xj-unlearned'))],
    projectiles,
  });

  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned xj/);
  assert.equal(getActiveProjectiles(projectiles).length, 0);
}

function testPetMonkey1XjRequiresMpTriggerCooldownAndTarget(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id);
  const target = createPetSkillMonsterTarget(createMonster30(100, 100, 'm30-pet-xj-gates'));

  let result = requestPetMonkey1XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /trigger not ready/);

  pet.mp = PetTuning.monkey1XjMpCost - 1;
  markActivePetSkillTriggered(roster);
  result = requestPetMonkey1XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  result = requestPetMonkey1XjSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);

  result = requestPetMonkey1XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey1Xj.releaseReady, false);
  assert.equal(pet.skillState?.monkey1Xj.cooldownMs, PetTuning.monkey1XjCooldownMs);

  markActivePetSkillTriggered(roster);
  result = requestPetMonkey1XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey1XjCooldownMs);
  result = requestPetMonkey1XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
}

function testPetMonkey1XjSpawnsProjectileAndDamagesMonster30(): void {
  const roster = createSeedPetRoster();
  const pet = getActivePet(roster);
  assert.ok(pet);
  const monster = createMonster30(100, 100, 'm30-pet-xj-hit');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  markActivePetSkillTriggered(roster);
  const result = requestPetMonkey1XjSkill({
    roster,
    runtime: createTestPetRuntime(pet.id),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey1XjMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey1XjMpCost);
  assertNearlyEqual(result.damage ?? 0, pet.atk * PetTuning.monkey1XjDamageMultiplier);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey1-xj');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.runtimeName, 'PetMonkey1Bullet2');
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp - pet.atk * PetTuning.monkey1XjDamageMultiplier);
  assert.equal(pet.skillState?.monkey1Xj.releaseReady, false);
}

function testPetMonkey2LjRequiresLearnedSkillMpAndCooldown(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey2(roster);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id, 2);
  const target = createPetSkillMonsterTarget(createMonster30(100, 100, 'm30-pet-lj-gates'));

  pet.skills = pet.skills.filter((skill) => skill !== 'lj');
  let result = requestPetMonkey2LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned lj/);

  pet.skills.push('lj');
  pet.mp = PetTuning.monkey2LjMpCost - 1;
  result = requestPetMonkey2LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  result = requestPetMonkey2LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey2Lj.cooldownMs, PetTuning.monkey2LjCooldownMs);

  result = requestPetMonkey2LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey2LjCooldownMs);
  result = requestPetMonkey2LjSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);
}

function testPetMonkey2LjSpawnsProjectileAndDamagesMonster30(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey2(roster);
  const monster = createMonster30(100, 100, 'm30-pet-lj-hit');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  const result = requestPetMonkey2LjSkill({
    roster,
    runtime: createTestPetRuntime(pet.id, 2),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey2LjMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey2LjMpCost);
  assertNearlyEqual(result.damage ?? 0, pet.atk * PetTuning.monkey2LjDamageMultiplier);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey2-lj');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.runtimeName, 'PetMonkey2Bullet2');
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp - pet.atk * PetTuning.monkey2LjDamageMultiplier);
  assert.equal(pet.skillState?.monkey2Lj.cooldownMs, PetTuning.monkey2LjCooldownMs);
}

function testPetMonkey2XjRequiresLearnedSkillMpTriggerCooldownAndTarget(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey2(roster);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id, 2);
  const target = createPetSkillMonsterTarget(createMonster30(100, 100, 'm30-pet-m2-xj-gates'));

  pet.skills = pet.skills.filter((skill) => skill !== 'xj');
  markActivePetSkillTriggered(roster);
  let result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned xj/);

  pet.skills.push('xj');
  pet.mp = PetTuning.monkey2XjMpCost - 1;
  result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  pet.skillState!.monkey2Xj.releaseReady = false;
  result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /trigger not ready/);

  markActivePetSkillTriggered(roster);
  result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);

  result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey2Xj.releaseReady, false);
  assert.equal(pet.skillState?.monkey2Xj.cooldownMs, PetTuning.monkey2XjCooldownMs);

  markActivePetSkillTriggered(roster);
  result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey2XjCooldownMs);
  result = requestPetMonkey2XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
}

function testPetMonkey2XjSpawnsProjectileAndDamagesMonster30(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey2(roster);
  const monster = createMonster30(100, 100, 'm30-pet-m2-xj-hit');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  markActivePetSkillTriggered(roster);
  const result = requestPetMonkey2XjSkill({
    roster,
    runtime: createTestPetRuntime(pet.id, 2),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey2XjMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey2XjMpCost);
  assertNearlyEqual(result.damage ?? 0, pet.atk * PetTuning.monkey2XjDamageMultiplier);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey2-xj');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.actionName, 'hit3');
  assert.equal(projectile.runtimeName, 'PetMonkey2Bullet3');
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp - pet.atk * PetTuning.monkey2XjDamageMultiplier);
  assert.equal(pet.skillState?.monkey2Xj.releaseReady, false);
  assert.equal(pet.skillState?.monkey2Xj.cooldownMs, PetTuning.monkey2XjCooldownMs);
}

function testPetMonkey3LyqRequiresLearnedSkillMpCooldownDistanceAndTarget(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey3(roster);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id, 3);
  const nearTarget = createPetSkillMonsterTarget(createMonster30(100, 0, 'm30-pet-lyq-gates-near'));
  const farTarget = createPetSkillMonsterTarget(createMonster30(
    PetTuning.monkey3LyqMaxDistance + 1,
    0,
    'm30-pet-lyq-gates-far',
  ));

  pet.skills = pet.skills.filter((skill) => skill !== 'lyq');
  let result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [nearTarget],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned lyq/);

  pet.skills.push('lyq');
  pet.mp = PetTuning.monkey3LyqMpCost - 1;
  result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [nearTarget],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);

  result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [farTarget],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /too far/);

  result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [nearTarget],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey3Lyq.cooldownMs, PetTuning.monkey3LyqCooldownMs);

  result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [nearTarget],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey3LyqCooldownMs);
  result = requestPetMonkey3LyqSkill({
    roster,
    runtime,
    targets: [nearTarget],
    projectiles,
  });
  assert.equal(result.ok, true);
}

function testPetMonkey3LyqSpawnsProjectileAndDamagesMonster30(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey3(roster);
  const monster = createMonster30(100, 0, 'm30-pet-lyq-hit');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  const result = requestPetMonkey3LyqSkill({
    roster,
    runtime: createTestPetRuntime(pet.id, 3),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey3LyqMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey3LyqMpCost);
  assertNearlyEqual(result.damage ?? 0, pet.atk * PetTuning.monkey3LyqDamageMultiplier);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey3-lyq');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.actionName, 'hit2');
  assert.equal(projectile.runtimeName, 'PetMonkey3Bullet2');
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp - pet.atk * PetTuning.monkey3LyqDamageMultiplier);
  assert.equal(pet.skillState?.monkey3Lyq.cooldownMs, PetTuning.monkey3LyqCooldownMs);
}

function testPetMonkey3XjRequiresLearnedSkillMpCooldownAndTarget(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey3(roster);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id, 3);
  const target = createPetSkillMonsterTarget(createMonster30(100, 0, 'm30-pet-m3-xj-gates'));

  pet.skills = pet.skills.filter((skill) => skill !== 'xj');
  let result = requestPetMonkey3XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned xj/);

  pet.skills.push('xj');
  pet.mp = PetTuning.monkey3XjMpCost - 1;
  result = requestPetMonkey3XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  result = requestPetMonkey3XjSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);

  result = requestPetMonkey3XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey3Xj.cooldownMs, PetTuning.monkey3XjCooldownMs);

  result = requestPetMonkey3XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey3XjCooldownMs);
  result = requestPetMonkey3XjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
}

function testPetMonkey3XjSpawnsProjectileAndDamagesMonster30(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey3(roster);
  const monster = createMonster30(100, 0, 'm30-pet-m3-xj-hit');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  const result = requestPetMonkey3XjSkill({
    roster,
    runtime: createTestPetRuntime(pet.id, 3),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey3XjMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey3XjMpCost);
  assertNearlyEqual(result.damage ?? 0, pet.atk * PetTuning.monkey3XjDamageMultiplier);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey3-xj');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.actionName, 'hit3');
  assert.equal(projectile.runtimeName, 'PetMonkey1Bullet2');
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp - pet.atk * PetTuning.monkey3XjDamageMultiplier);
  assert.equal(pet.skillState?.monkey3Xj.cooldownMs, PetTuning.monkey3XjCooldownMs);
}

function testPetMonkey3LjRequiresLearnedSkillMpTriggerCooldownAndTarget(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey3(roster);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id, 3);
  const target = createPetSkillMonsterTarget(createMonster30(100, 0, 'm30-pet-m3-lj-gates'));

  pet.skills = pet.skills.filter((skill) => skill !== 'lj');
  markActivePetSkillTriggered(roster);
  let result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned lj/);

  pet.skills.push('lj');
  pet.mp = PetTuning.monkey3LjMpCost - 1;
  result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  pet.skillState!.monkey3Lj.releaseReady = false;
  result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /trigger not ready/);

  markActivePetSkillTriggered(roster);
  result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);

  result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey3Lj.releaseReady, false);
  assert.equal(pet.skillState?.monkey3Lj.cooldownMs, PetTuning.monkey3LjCooldownMs);

  markActivePetSkillTriggered(roster);
  result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey3LjCooldownMs);
  result = requestPetMonkey3LjSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
}

function testPetMonkey3LjSpawnsProjectileAndDamagesMonster30(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey3(roster);
  const monster = createMonster30(100, 0, 'm30-pet-m3-lj-hit');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  markActivePetSkillTriggered(roster);
  const result = requestPetMonkey3LjSkill({
    roster,
    runtime: createTestPetRuntime(pet.id, 3),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey3LjMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey3LjMpCost);
  assertNearlyEqual(result.damage ?? 0, pet.atk * PetTuning.monkey3LjDamageMultiplier);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey3-lj');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.actionName, 'hit4');
  assert.equal(projectile.runtimeName, 'PetMonkey3Bullet3_2');
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp - pet.atk * PetTuning.monkey3LjDamageMultiplier);
  assert.equal(pet.skillState?.monkey3Lj.releaseReady, false);
  assert.equal(pet.skillState?.monkey3Lj.cooldownMs, PetTuning.monkey3LjCooldownMs);
}

function testPetMonkey4JgaoyiRequiresLearnedSkillMpCooldownAndTarget(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey4(roster);
  const projectiles = createProjectileSystem();
  const runtime = createTestPetRuntime(pet.id, 4);
  const target = createPetSkillMonsterTarget(createMonster30(100, 0, 'm30-pet-m4-jgaoyi-gates'));

  pet.skills = pet.skills.filter((skill) => skill !== 'jgaoyi');
  let result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /has not learned jgaoyi/);

  pet.skills.push('jgaoyi');
  pet.mp = PetTuning.monkey4JgaoyiMpCost - 1;
  result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /MP not enough/);

  pet.mp = pet.maxMp;
  result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime,
    targets: [],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /no target/);

  result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
  assert.equal(pet.skillState?.monkey4Jgaoyi.cooldownMs, PetTuning.monkey4JgaoyiCooldownMs);

  result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /cooling/);

  updatePetSkillState(roster, PetTuning.monkey4JgaoyiCooldownMs);
  result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime,
    targets: [target],
    projectiles,
  });
  assert.equal(result.ok, true);
}

function testPetMonkey4JgaoyiSpawnsHit5FeedbackWithoutDirectDamage(): void {
  const roster = createSeedPetRoster();
  const pet = deploySeedMonkey4(roster);
  const monster = createMonster30(100, 0, 'm30-pet-m4-jgaoyi-hit5');
  const projectiles = createProjectileSystem();
  const mpBefore = pet.mp;

  const result = requestPetMonkey4JgaoyiSkill({
    roster,
    runtime: createTestPetRuntime(pet.id, 4),
    targets: [createPetSkillMonsterTarget(monster)],
    projectiles,
  });

  assert.equal(result.ok, true);
  assert.equal(result.mpBefore, mpBefore);
  assert.equal(result.mpAfter, mpBefore - PetTuning.monkey4JgaoyiMpCost);
  assert.equal(pet.mp, mpBefore - PetTuning.monkey4JgaoyiMpCost);
  assert.equal(result.damage, PetTuning.monkey4JgaoyiHit5Damage);
  assert.equal(getActiveProjectiles(projectiles).length, 1);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'pet-monkey4-jgaoyi');
  assert.equal(projectile.sourceId, pet.id);
  assert.equal(projectile.actionName, 'hit5');
  assert.equal(projectile.runtimeName, 'PetMonkey4Hit5');
  assert.equal(projectile.damage, 0);
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  assert.equal(applyMonster30Hit(monster, projectile.damage), true);
  assertNearlyEqual(monster.hp, monster.maxHp);
  assert.equal(pet.skillState?.monkey4Jgaoyi.cooldownMs, PetTuning.monkey4JgaoyiCooldownMs);
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

function testMagicWeaponFlagCreatesGuardAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.mdhf, 'mdhf-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicFlag');
  assert.equal(model.activeEffect?.totalMs, MagicWeaponTuning.flagGuardDurationMs);
  assert.equal(target.combat.magicFlagGuard?.remainingMs, MagicWeaponTuning.flagGuardDurationMs);
  assert.equal(target.combat.magicFlagGuard?.debuffMs, MagicWeaponTuning.flagDebuffMs);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);
}

function testMagicWeaponFlagWoodOnlyShortensActionBoundary(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.mdhf, 'mdhf-wood-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicFlag');
  if (model.activeEffect?.kind === 'magicFlag') {
    assert.equal(model.activeEffect.actionRemainingMs, MagicWeaponTuning.flagWoodActionMs);
    assert.equal(model.activeEffect.totalMs, MagicWeaponTuning.flagGuardDurationMs);
  }

  updateMagicWeapon(model, target, MagicWeaponTuning.flagWoodActionMs);
  assert.equal(model.action, 'hit');
  assert.match(model.message, /动作完成/);
  assert.ok(target.combat.magicFlagGuard);

  updateMagicWeapon(model, target, MagicWeaponTuning.flagGuardDurationMs);
  assert.equal(model.action, 'wait');
  assert.equal(target.combat.magicFlagGuard, undefined);
}

function testMagicWeaponFlagCounterDebuffDamagesAndExpires(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.mdhf, 'mdhf-counter-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const monster = createMonster30(0, 0, 'm30-flag-counter');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(applyMonster30MagicFlagCounterFromHero(monster, target.combat), true);
  assert.equal(monster.magicFlagDebuff?.remainingMs, MagicWeaponTuning.flagDebuffMs);
  assert.equal(monster.magicFlagDebuff?.hitMultiplier, Monster30Tuning.magicFlagHitMultiplier);

  updateMonster30(monster, [], 1_000);
  assertNearlyEqual(
    monster.hp,
    monster.maxHp * (1 - Monster30Tuning.magicFlagHpDamageRatePerSecond),
  );
  assertNearlyEqual(monster.magicFlagDebuff?.lastTickDamage ?? 0, monster.maxHp * 0.02);

  updateMonster30(monster, [], MagicWeaponTuning.flagDebuffMs - 1_000);
  assert.equal(monster.magicFlagDebuff, undefined);
  assert.equal(monster.state, 'wait');
}

function testMagicWeaponFlagDebuffDeathClears(): void {
  const monster = createMonster30(0, 0, 'm30-flag-death');
  monster.hp = 2;
  applyMonster30MagicFlagDebuff(monster, {
    sourceName: '摩多魂幡',
    totalMs: MagicWeaponTuning.flagDebuffMs,
    remainingMs: MagicWeaponTuning.flagDebuffMs,
  });

  updateMonster30(monster, [], 1_000);

  assert.equal(monster.state, 'dead');
  assert.equal(monster.magicFlagDebuff, undefined);
}

function testMagicWeaponPearlAttackCountAndWoodBonus(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.xhmt, 'xhmt-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.activeEffect?.kind, 'magicPearl');
  if (model.activeEffect?.kind === 'magicPearl') {
    assert.equal(model.activeEffect.attackCount, 6);
    assert.equal(model.activeEffect.pearlDamage, MagicWeaponTuning.pearlFallbackDamage);
  }
}

function testMagicWeaponPearlSpawnsThreeBulletsPerTargetAndActionReturnsToWait(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const xhmtDefinition: EquipmentDefinition = {
    ...registry.xhmt,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(xhmtDefinition, 'xhmt-fire-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const monster = createMonster30(100, 0, 'm30-pearl-one');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.pearlActionMs,
    projectiles,
    [createMagicPearlMonsterTarget(monster)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
  );
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect?.kind, 'magicPearl');

  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.pearlBeginMs + MagicWeaponTuning.pearlFlyMs + MagicWeaponTuning.pearlFrame28Ms,
    projectiles,
    [createMagicPearlMonsterTarget(monster)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
  );

  assert.deepEqual(
    getActiveProjectiles(projectiles).map((projectile) => projectile.runtimeName),
    ['MagicPearlBullet1', 'MagicPearlBullet2', 'MagicPearlBullet3'],
  );
  assert.deepEqual(
    getActiveProjectiles(projectiles).map((projectile) => projectile.actionName),
    ['fabao-pearl', 'fabao-pearl', 'fabao-pearl'],
  );
}

function testMagicWeaponPearlSelectsClosestTargetEachRound(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const xhmtDefinition: EquipmentDefinition = {
    ...registry.xhmt,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(xhmtDefinition, 'xhmt-target-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const near = createMonster30(80, 0, 'm30-near');
  const far = createMonster30(400, 0, 'm30-far');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.pearlBeginMs,
    projectiles,
    [createMagicPearlMonsterTarget(near), createMagicPearlMonsterTarget(far)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
  );
  near.state = 'dead';
  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.pearlFlyMs + MagicWeaponTuning.pearlEffectMs,
    projectiles,
    [createMagicPearlMonsterTarget(near), createMagicPearlMonsterTarget(far)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
  );

  assert.equal(model.activeEffect?.kind, 'magicPearl');
  if (model.activeEffect?.kind === 'magicPearl') {
    assert.deepEqual(model.activeEffect.targetLog.slice(0, 2), ['m30-near', 'm30-far']);
  }
}

function testMagicWeaponPearlNoTargetsFallsBackToMp(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.xhmt, 'xhmt-empty-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  target.skill.maxMp = 1_000;
  target.skill.mp = 10;

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.pearlBeginMs,
    undefined,
    [],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    [],
    () => 0.5,
  );

  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
  assert.equal(target.skill.mp, 55);
}

function testMagicWeaponPearlStunAndPoisonEndEffects(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const xhmtDefinition: EquipmentDefinition = {
    ...registry.xhmt,
    magicWeapon: {
      level: 8,
      element: '火',
    },
  };
  const stunMonster = createMonster30(100, 0, 'm30-pearl-stun');
  const poisonMonster = createMonster30(120, 0, 'm30-pearl-poison');

  loadout.magicWeapon = createTestEquipmentInstance(xhmtDefinition, 'xhmt-stun-test');
  const stunModel = createMagicWeaponModel();
  const stunTarget = createMagicWeaponTestTarget();
  syncMagicWeaponFromLoadout(stunModel, loadout);
  requestMagicWeaponTrigger({
    model: stunModel,
    target: stunTarget,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(
    stunModel,
    stunTarget,
    99_999,
    undefined,
    [createMagicPearlMonsterTarget(stunMonster)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    [],
    () => 0.5,
  );
  assert.equal(stunMonster.magicPearlStun?.remainingMs, 1_000);

  loadout.magicWeapon = createTestEquipmentInstance(xhmtDefinition, 'xhmt-poison-test');
  const poisonModel = createMagicWeaponModel();
  const poisonTarget = createMagicWeaponTestTarget();
  const poisonMagicTarget = {
    ...poisonTarget,
    effectiveStats: {
    defense: 0,
    magicDefensePercent: 0,
    power: 100,
    },
  };
  syncMagicWeaponFromLoadout(poisonModel, loadout);
  requestMagicWeaponTrigger({
    model: poisonModel,
    target: poisonMagicTarget,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(
    poisonModel,
    poisonMagicTarget,
    99_999,
    undefined,
    [createMagicPearlMonsterTarget(poisonMonster)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    [],
    () => 0.9,
  );
  assert.equal(poisonMonster.magicPearlPoison?.remainingMs, 2_000);
  updateMonster30(poisonMonster, [], 1_000);
  assertNearlyEqual(poisonMonster.hp, 150 - 100 * 8 * MagicWeaponTuning.pearlPoisonDamageRate);
}

function testMagicWeaponPearlRejectsReentryDuringChain(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.xhmt, 'xhmt-reentry-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const monster = createMonster30(100, 0, 'm30-reentry');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.pearlActionMs,
    undefined,
    [createMagicPearlMonsterTarget(monster)],
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
  );
  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.action, 'wait');
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /攻击链进行中/);
}

function testMagicWeaponBaguaRequiresLevelAtLeastOne(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const tjbgDefinition: EquipmentDefinition = {
    ...registry.tjbg,
    magicWeapon: {
      level: 0,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(tjbgDefinition, 'tjbg-low-level-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const monster = createMonster30(0, 0, 'm30-bagua-low');

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
    enemyTargets: [createMagicBaguaMonsterTarget(monster)],
  });

  assert.equal(result.triggered, false);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
  assert.equal(monster.magicBaguaStun, undefined);
  assert.match(model.message, /level too low/);
}

function testMagicWeaponBaguaStunsAllMonster30sAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const tjbgDefinition: EquipmentDefinition = {
    ...registry.tjbg,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(tjbgDefinition, 'tjbg-fire-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const first = createMonster30(0, 0, 'm30-bagua-a');
  const second = createMonster30(100, 0, 'm30-bagua-b');
  const dead = createMonster30(200, 0, 'm30-bagua-dead');
  dead.state = 'dead';

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
    enemyTargets: [
      createMagicBaguaMonsterTarget(first),
      createMagicBaguaMonsterTarget(second),
      createMagicBaguaMonsterTarget(dead),
    ],
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicBagua');
  if (model.activeEffect?.kind === 'magicBagua') {
    assert.deepEqual(model.activeEffect.affectedEnemyIds, ['m30-bagua-a', 'm30-bagua-b']);
    assert.equal(model.activeEffect.durationMs, MagicWeaponTuning.baguaStunMs);
  }
  assert.equal(first.magicBaguaStun?.remainingMs, MagicWeaponTuning.baguaStunMs);
  assert.equal(second.magicBaguaStun?.remainingMs, MagicWeaponTuning.baguaStunMs);
  assert.equal(dead.magicBaguaStun, undefined);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(model, target, MagicWeaponTuning.baguaActionMs);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
}

function testMagicWeaponBaguaWoodStunsForEightSeconds(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.tjbg, 'tjbg-wood-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const monster = createMonster30(0, 0, 'm30-bagua-wood');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
    enemyTargets: [createMagicBaguaMonsterTarget(monster)],
  });

  assert.equal(model.activeEffect?.kind, 'magicBagua');
  if (model.activeEffect?.kind === 'magicBagua') {
    assert.equal(model.activeEffect.durationMs, MagicWeaponTuning.baguaWoodStunMs);
  }
  assert.equal(monster.magicBaguaStun?.remainingMs, MagicWeaponTuning.baguaWoodStunMs);
}

function testMagicWeaponBaguaStunExpiresAndRestoresMonster30(): void {
  const monster = createMonster30(0, 0, 'm30-bagua-expire');
  monster.state = 'hit1';
  monster.activeAttack = {
    id: 1,
    attackId: 'm30-bagua-expire-hit1-1',
    actionName: 'hit1',
    elapsedMs: 0,
    hitboxActiveFromMs: 0,
    hitboxActiveUntilMs: 100,
    damage: 15,
    attackKind: 'physics',
    knockbackX: 6,
    knockbackY: -5,
    facingX: 1,
  };

  applyMonster30MagicBaguaStun(monster, {
    sourceName: '太极八卦',
    totalMs: MagicWeaponTuning.baguaStunMs,
  });

  assert.equal(monster.state, 'wait');
  assert.equal(monster.activeAttack, undefined);
  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 0 }], MagicWeaponTuning.baguaStunMs - 1, () => 0);
  assert.equal(monster.magicBaguaStun?.remainingMs, 1);
  assert.equal(monster.state, 'wait');

  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 0 }], 1, () => 1);
  assert.equal(monster.magicBaguaStun, undefined);
  assert.equal(monster.state, 'wait');
}

function testMagicWeaponZlHummerRequiresLevelAtLeastOne(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const zltcDefinition: EquipmentDefinition = {
    ...registry.zltc,
    magicWeapon: {
      level: 0,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(zltcDefinition, 'zltc-low-level-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 100, y: 200, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, false);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
  updateMagicWeapon(model, target, 16, projectiles);
  assert.equal(getActiveProjectiles(projectiles).length, 0);
  assert.match(model.message, /level too low/);
}

function testMagicWeaponZlHummerSpawnsFrontHammerAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.zltc, 'zltc-spawn-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 100, y: 200, facingX: 1 as const };

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
  assert.equal(model.activeEffect?.kind, 'magicZlHummer');

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(model, target, 1, projectiles, [], source);
  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.variant, 'magic-weapon-zltc');
  assert.equal(projectile.actionName, 'fabao-zltc');
  assert.equal(projectile.runtimeName, 'zltcskill');
  assert.equal(projectile.x, 260);
  assert.equal(projectile.y, 158);
  assert.equal(projectile.knockbackX, 2);
  assert.equal(projectile.knockbackY, -2);
  assert.equal(projectile.hitIntervalFrames, 6);
  assert.equal(projectile.magicStunMs, 4_500);

  updateMagicWeapon(model, target, MagicWeaponTuning.zlHummerActionMs, projectiles, [], source);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
}

function testMagicWeaponZlHummerWoodActionBoundary(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.zltc, 'zltc-wood-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 0, y: 0, facingX: 1 as const };

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicZlHummer');
  if (model.activeEffect?.kind === 'magicZlHummer') {
    assert.equal(model.activeEffect.totalMs, MagicWeaponTuning.zlHummerWoodActionMs);
  }
  updateMagicWeapon(model, target, MagicWeaponTuning.zlHummerWoodActionMs, projectiles, [], source);
  assert.equal(model.action, 'wait');
}

function testMagicWeaponZlHummerNoTargetsStillCleansUp(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.zltc, 'zltc-no-target-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 20, y: 40, facingX: -1 as const };

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(model, target, 1, projectiles, [], source);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.x, -140);
  updateMagicWeapon(model, target, MagicWeaponTuning.zlHummerWoodActionMs, projectiles, [], source);
  assert.equal(model.action, 'wait');
  updateProjectiles(projectiles, [{ id: 'p1', state: 'ready' }], projectile.lifetimeMs);
  assert.equal(getActiveProjectiles(projectiles).length, 0);
}

function testMagicWeaponZlHummerHitAppliesDamageAndStun(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const zltcDefinition: EquipmentDefinition = {
    ...registry.zltc,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(zltcDefinition, 'zltc-hit-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = { sourceId: 'p1', x: 100, y: 200, facingX: 1 as const };
  const monster = createMonster30(260, 158, 'm30-zltc-hit');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(model, target, 1, projectiles, [createMagicZlHummerMonsterTarget(monster)], source);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);

  const applied = applyMonster30Hit(monster, projectile.damage);
  assert.equal(applied, true);
  applyMonster30MagicZlHummerStun(monster, {
    sourceName: projectile.runtimeName,
    totalMs: projectile.magicStunMs ?? 0,
  });
  assert.equal(monster.hp, 69);
  assert.equal(monster.magicZlHummerStun?.remainingMs, 4_500);
  assert.equal(monster.state, 'hurt');
}

function testMagicWeaponZlHummerStunExpiresAndRestoresMonster30(): void {
  const monster = createMonster30(0, 0, 'm30-zltc-expire');
  monster.state = 'hit1';
  monster.activeAttack = {
    id: 1,
    attackId: 'm30-zltc-expire-hit1-1',
    actionName: 'hit1',
    elapsedMs: 0,
    hitboxActiveFromMs: 0,
    hitboxActiveUntilMs: 100,
    damage: 15,
    attackKind: 'physics',
    knockbackX: 6,
    knockbackY: -5,
    facingX: 1,
  };

  applyMonster30MagicZlHummerStun(monster, {
    sourceName: 'zltcskill',
    totalMs: 4_500,
  });

  assert.equal(monster.state, 'wait');
  assert.equal(monster.activeAttack, undefined);
  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 0 }], 4_499, () => 0);
  assert.equal(monster.magicZlHummerStun?.remainingMs, 1);
  assert.equal(monster.state, 'wait');

  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 0 }], 1, () => 1);
  assert.equal(monster.magicZlHummerStun, undefined);
  assert.equal(monster.state, 'wait');
}

function testMagicWeaponBigBottleCreatesPlatformAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.qljfb, 'qljfb-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  const result = requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 300, y: 900, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(result.triggered, true);
  assert.equal(model.action, 'hit');
  assert.equal(model.activeEffect?.kind, 'magicBigBottle');
  assert.equal(model.activeEffect?.totalMs, MagicWeaponTuning.bigBottleWoodActionMs);
  assert.equal(model.platforms.length, 1);
  assert.equal(model.platforms[0].x, 300);
  assert.equal(model.platforms[0].y, 800);
  assert.equal(model.platforms[0].width, 130);
  assert.equal(model.platforms[0].height, 20);
  assert.equal(model.platforms[0].remainingMs, MagicWeaponTuning.bigBottleDurationMs);

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 300, y: 900, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.bigBottleWoodActionMs,
    undefined,
    [],
    { sourceId: 'p1', x: 300, y: 900, facingX: 1 },
  );
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
  assert.equal(model.platforms.length, 1);
}

function testMagicWeaponBigBottleFollowsAndExpires(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const qljfbDefinition: EquipmentDefinition = {
    ...registry.qljfb,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(qljfbDefinition, 'qljfb-fire-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 100, y: 500, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });

  assert.equal(model.activeEffect?.kind, 'magicBigBottle');
  assert.equal(model.activeEffect?.totalMs, MagicWeaponTuning.bigBottleActionMs);
  updateMagicWeapon(
    model,
    target,
    16,
    undefined,
    [],
    { sourceId: 'p1', x: 160, y: 560, facingX: 1 },
  );
  assert.equal(model.platforms[0].x, 160);
  assert.equal(model.platforms[0].y, 630);
  assert.equal(model.platforms[0].remainingMs, MagicWeaponTuning.bigBottleDurationMs - 16);

  updateMagicWeapon(
    model,
    target,
    MagicWeaponTuning.bigBottleDurationMs,
    undefined,
    [],
    { sourceId: 'p1', x: 160, y: 560, facingX: 1 },
  );
  assert.equal(model.platforms.length, 0);

  requestMagicWeaponTrigger({
    model,
    target,
    source: { sourceId: 'p1', x: 220, y: 600, facingX: 1 },
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(model.platforms.length, 1);
  updateMagicWeapon(model, target, 16, undefined, [], undefined);
  assert.equal(model.platforms.length, 0);
}

function testMagicWeaponBigBottlePlatformCatchesFallingHero(): void {
  const platform = {
    id: 'magic-big-bottle-p1',
    kind: 'through' as const,
    left: 235,
    right: 365,
    top: 800,
  };
  const hero = createHeroMovement(300, 760);
  hero.grounded = false;
  hero.currentPlatformId = undefined;
  hero.velocityY = 200;

  updateHeroMovement(
    hero,
    createMagicWeaponInput(false),
    createMagicWeaponInput(false),
    [platform],
    { left: 0, right: 940, bottom: 2_500 },
    0,
    200,
  );

  assert.equal(hero.grounded, true);
  assert.equal(hero.currentPlatformId, 'magic-big-bottle-p1');
  assert.equal(hero.y, 800);
  assert.equal(hero.velocityY, 0);
}

function testMagicWeaponSnowSpawnsRandomFallAndRejectsReentry(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.stlp, 'stlp-snow-test');
  const model = createMagicWeaponModel();
  const target = createMagicWeaponTestTarget();
  const projectiles = createProjectileSystem();
  const source = {
    sourceId: 'p1',
    x: 470,
    y: 300,
    facingX: 1 as const,
    cameraX: 500,
    cameraY: 1_000,
  };

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
  assert.equal(model.activeEffect?.kind, 'magicSnow');
  if (model.activeEffect?.kind === 'magicSnow') {
    assert.equal(model.activeEffect.totalMs, MagicWeaponTuning.snowWoodActionMs);
  }

  const reentry = requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  assert.equal(reentry.triggered, false);
  assert.match(reentry.message, /正在使用/);

  updateMagicWeapon(model, target, 1, projectiles, [], source, [], () => 0);
  const activeProjectiles = getActiveProjectiles(projectiles);
  assert.equal(activeProjectiles.length, MagicWeaponTuning.snowCount);
  assert.equal(activeProjectiles.every((projectile) => projectile.variant === 'magic-weapon-snow'), true);
  assert.equal(activeProjectiles.every((projectile) => projectile.actionName === 'fabao-snow'), true);

  const first = activeProjectiles[0];
  assert.ok(first);
  assert.equal(first.runtimeName, 'ef_snow');
  assert.equal(first.x, 0);
  assert.equal(first.y, 520);
  assertNearlyEqual(first.velocityX, Math.cos(50 / 180 * Math.PI) * 10);
  assertNearlyEqual(first.velocityY, Math.sin(50 / 180 * Math.PI) * 10);
  assert.equal(first.remainingDistance, 1500);
  assert.equal(first.magicIceMs, 3_000);

  updateMagicWeapon(model, target, MagicWeaponTuning.snowWoodActionMs - 1, projectiles, [], source);
  assert.equal(model.action, 'wait');
  assert.equal(model.activeEffect, undefined);
}

function testMagicWeaponSnowHitAppliesDamageAndIce(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const stlpDefinition: EquipmentDefinition = {
    ...registry.stlp,
    magicWeapon: {
      level: 1,
      element: '火',
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(stlpDefinition, 'stlp-hit-test');
  const model = createMagicWeaponModel();
  const target = {
    ...createMagicWeaponTestTarget(),
    effectiveStats: {
      defense: 0,
      magicDefensePercent: 0,
      power: 200,
    },
  };
  const projectiles = createProjectileSystem();
  const source = {
    sourceId: 'p1',
    x: 0,
    y: 0,
    facingX: 1 as const,
    cameraX: 500,
    cameraY: 480,
  };
  const monster = createMonster30(0, 0, 'm30-snow-hit');

  syncMagicWeaponFromLoadout(model, loadout);
  requestMagicWeaponTrigger({
    model,
    target,
    source,
    input: createMagicWeaponInput(true),
    previousInput: createMagicWeaponInput(false),
  });
  updateMagicWeapon(model, target, 1, projectiles, [], source, [], () => 0);

  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(rectanglesIntersect(
    getProjectileHitbox(projectile),
    { x: monster.x - 36, y: monster.y - 28, width: 72, height: 56 },
  ), true);
  assert.equal(projectile.damage, 18);
  assert.equal(projectile.attackKind, 'magic');
  assert.equal(projectile.knockbackX, 2);
  assert.equal(projectile.knockbackY, -2);
  assert.equal(projectile.hitIntervalFrames, 999);

  const applied = applyMonster30Hit(monster, projectile.damage);
  assert.equal(applied, true);
  applyMonster30MagicSnowIce(monster, {
    sourceName: projectile.runtimeName,
    totalMs: projectile.magicIceMs ?? 0,
  });
  assert.equal(monster.hp, 132);
  assert.equal(monster.magicSnowIce?.remainingMs, 3_000);
  assert.equal(monster.state, 'hurt');

  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 0 }], 2_999, () => 0);
  assert.equal(monster.magicSnowIce?.remainingMs, 1);
  assert.equal(monster.state, 'wait');
  updateMonster30(monster, [{ slot: 'p1', x: 0, y: 0 }], 1, () => 1);
  assert.equal(monster.magicSnowIce, undefined);

  updateProjectiles(projectiles, [{ id: 'p1', state: 'ready' }], 3_000);
  assert.equal(getActiveProjectiles(projectiles).length, 0);
}

function testMagicWeaponUpgradePanelShowsCurrentZbfb(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.kyl, 'kyl-upgrade-panel');

  const panel = buildMagicWeaponUpgradePanelState(loadout, 1_000);

  assert.equal(panel.equipped, true);
  assert.equal(panel.name, '枯叶灵');
  assert.equal(panel.fillName, 'kyl');
  assert.equal(panel.level, 1);
  assert.equal(panel.element, '木');
  assert.equal(panel.growthRate, 1);
  assert.equal(panel.nextSoulCost, 1_000);
  assert.equal(panel.canUpgrade, true);
}

function testMagicWeaponUpgradeConsumesSoulAndRefreshesStats(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.kyl, 'kyl-upgrade-success');

  const result = upgradeEquippedMagicWeapon({ loadout, soul: 1_500 });

  assert.equal(result.ok, true);
  assert.equal(result.beforeLevel, 1);
  assert.equal(result.afterLevel, 2);
  assert.equal(result.soulAfter, 500);
  assert.equal(loadout.magicWeapon?.definition.magicWeapon?.level, 2);
  assert.equal(loadout.magicWeapon?.definition.stats.power, 4);
  assert.equal(loadout.magicWeapon?.definition.stats.maxHp, 20);
  assert.equal(loadout.magicWeapon?.definition.stats.maxMp, 20);
  assert.equal(loadout.magicWeapon?.definition.stats.defense, 2);
}

function testMagicWeaponUpgradeRejectsLowSoulAndMissingEquipment(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  loadout.magicWeapon = createTestEquipmentInstance(registry.kyl, 'kyl-upgrade-low-soul');

  const lowSoul = upgradeEquippedMagicWeapon({ loadout, soul: 999 });
  assert.equal(lowSoul.ok, false);
  assert.equal(lowSoul.soulAfter, 999);
  assert.equal(loadout.magicWeapon.definition.magicWeapon?.level, 1);
  assert.match(lowSoul.message, /灵魂不足/);

  const missing = upgradeEquippedMagicWeapon({
    loadout: createEmptyEquipmentLoadout(),
    soul: 10_000,
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.soulAfter, 10_000);
  assert.match(missing.message, /未装备法宝/);
}

function testMagicWeaponSystemReadsUpgradedLevel(): void {
  const registry = createSeedEquipmentRegistry();
  const loadout = createEmptyEquipmentLoadout();
  const zltcDefinition: EquipmentDefinition = {
    ...registry.zltc,
    magicWeapon: {
      level: 1,
      element: '火',
      growthRate: 3,
    },
  };
  loadout.magicWeapon = createTestEquipmentInstance(zltcDefinition, 'zltc-upgrade-read');
  const upgrade = upgradeEquippedMagicWeapon({ loadout, soul: 1_000 });
  assert.equal(upgrade.ok, true);

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
  updateMagicWeapon(model, target, 1, projectiles, [], source);

  assert.equal(model.current?.level, 2);
  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assertNearlyEqual(projectile.damage, 94.5);
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

function createTestPetRuntime(petId: string, form = 1): PetRuntimeModel {
  return {
    petId,
    runtimeKey: `${petId}:monkey:${form}`,
    x: 0,
    y: 0,
    facingX: 1,
    state: 'idle',
  };
}

function deploySeedMonkey2(roster: ReturnType<typeof createSeedPetRoster>) {
  selectPet(roster, 1);
  assert.equal(setSelectedPetActive(roster), true);
  const pet = getActivePet(roster);
  assert.ok(pet);
  assert.equal(pet.id, 'pet-monkey-2');
  assert.equal(pet.form, 2);
  return pet;
}

function deploySeedMonkey3(roster: ReturnType<typeof createSeedPetRoster>) {
  selectPet(roster, 1);
  selectPet(roster, 1);
  assert.equal(setSelectedPetActive(roster), true);
  const pet = getActivePet(roster);
  assert.ok(pet);
  assert.equal(pet.id, 'pet-monkey-3');
  assert.equal(pet.form, 3);
  return pet;
}

function deploySeedMonkey4(roster: ReturnType<typeof createSeedPetRoster>) {
  selectPet(roster, 1);
  selectPet(roster, 1);
  selectPet(roster, 1);
  assert.equal(setSelectedPetActive(roster), true);
  const pet = getActivePet(roster);
  assert.ok(pet);
  assert.equal(pet.id, 'pet-monkey-4');
  assert.equal(pet.form, 4);
  return pet;
}

function createPetSkillMonsterTarget(
  monster: ReturnType<typeof createMonster30>,
) {
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
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

function createMagicBaguaMonsterTarget(
  monster: ReturnType<typeof createMonster30>,
) {
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyMagicBaguaStun: (effect: {
      sourceName: string;
      totalMs: number;
      remainingMs: number;
    }) => {
      applyMonster30MagicBaguaStun(monster, effect);
    },
    clearMagicBaguaStun: () => {
      clearMonster30MagicBaguaStun(monster);
    },
  };
}

function createMagicZlHummerMonsterTarget(
  monster: ReturnType<typeof createMonster30>,
) {
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyMagicZlHummerStun: (effect: {
      sourceName: string;
      totalMs: number;
      remainingMs: number;
    }) => {
      applyMonster30MagicZlHummerStun(monster, effect);
    },
    clearMagicZlHummerStun: () => {
      clearMonster30MagicZlHummerStun(monster);
    },
  };
}

function createMagicPearlMonsterTarget(
  monster: ReturnType<typeof createMonster30>,
) {
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyMagicPearlStun: (effect: {
      sourceName: string;
      totalMs: number;
      remainingMs: number;
    }) => {
      applyMonster30MagicPearlStun(monster, effect);
    },
    clearMagicPearlStun: () => {
      clearMonster30MagicPearlStun(monster);
    },
    applyMagicPearlPoison: (effect: {
      sourceName: string;
      totalMs: number;
      remainingMs: number;
      damagePerSecond: number;
    }) => {
      applyMonster30MagicPearlPoison(monster, effect);
    },
    clearMagicPearlPoison: () => {
      clearMonster30MagicPearlPoison(monster);
    },
  };
}

function rectanglesIntersect(
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
): boolean {
  return left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y;
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
