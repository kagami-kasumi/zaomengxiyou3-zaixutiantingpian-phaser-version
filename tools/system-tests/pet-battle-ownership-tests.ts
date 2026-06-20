import assert from 'node:assert/strict';
import { createMonster30 } from '../../src/systems/Monster30System';
import {
  awardMonsterExperienceByTarget,
  applyOwnedPetDamageRedirect,
  claimMonsterExperienceForCurrentTarget,
  createPlayerPetRosters,
  getActivePet,
  markOwnedPetSkillTriggered,
  requestPetMonkey2LjSkill,
  syncPetRuntimeWithRoster,
  updatePetAutoBuffs,
} from '../../src/systems/PetSystem';
import { createProjectileSystem, getActiveProjectiles } from '../../src/systems/ProjectileSystem';

export function runPetBattleOwnershipTests(): void {
  testP2BuffAndHitTriggerNeverMutateP1();
  testP2DamageRedirectUsesOnlyP2Pet();
  testP2SkillProjectileCarriesDistinctPetOwnerId();
  testMonsterExperienceFollowsCurrentTargetOwner();
  testHeroAndPetExperienceRoutesForBothPlayers();
  testDirectPetTargetGetsFullExperience();
}

function testP2DamageRedirectUsesOnlyP2Pet(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  const p1Hp = rosters.p1.pets[0].hp;
  for (const pet of rosters.p2.pets) pet.isActive = false;
  const turtle2 = rosters.p2.pets.find((pet) => pet.id === 'p2-pet-turtle-2');
  assert.ok(turtle2?.skillState);
  turtle2.isActive = true;
  turtle2.skillState.turtle2Txlj.linkRemainingMs = 1000;
  const p2Hp = turtle2.hp;
  assert.equal(applyOwnedPetDamageRedirect(rosters, 'p2', 100), 95);
  assert.equal(turtle2.hp, p2Hp - 5);
  assert.equal(rosters.p1.pets[0].hp, p1Hp);
}

function testP2BuffAndHitTriggerNeverMutateP1(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  const p1Pet = getActivePet(rosters.p1);
  const p2Pet = getActivePet(rosters.p2);
  assert.ok(p1Pet);
  assert.ok(p2Pet);
  p2Pet.skills = ['gjjc'];
  p2Pet.mp = 100;
  p2Pet.autoBuffState = {
    sxkb: { counterMs: 9999 }, fsnl: { counterMs: 9999 },
    smjc: { counterMs: 9999 }, mfjc: { counterMs: 9999 },
    gjjc: { counterMs: 0 }, fyjc: { counterMs: 9999 },
    lastResult: 'ready',
  };
  const p1Owner = { hp: 100, maxHp: 100, mp: 100, maxMp: 100, power: 50, defense: 20 };
  const p2Owner = { hp: 100, maxHp: 100, mp: 100, maxMp: 100, power: 80, defense: 30 };
  const result = updatePetAutoBuffs({ roster: rosters.p2, ownerStats: p2Owner, deltaMs: 0 });
  assert.equal(result.triggered, true);
  assert.ok(p2Owner.power > 80);
  assert.equal(p1Owner.power, 50);

  assert.equal(p1Pet.skillState?.monkey1Xj.releaseReady, false);
  assert.equal(markOwnedPetSkillTriggered(rosters, 'p2'), true);
  assert.equal(p2Pet.skillState?.monkey1Xj.releaseReady, true);
  assert.equal(p1Pet.skillState?.monkey1Xj.releaseReady, false);
}

function testP2SkillProjectileCarriesDistinctPetOwnerId(): void {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  for (const pet of rosters.p2.pets) pet.isActive = false;
  rosters.p2.selectedIndex = 1;
  const pet = rosters.p2.pets[1];
  pet.isActive = true;
  const runtime = syncPetRuntimeWithRoster(
    rosters.p2,
    undefined,
    { x: 0, y: 0, facingX: 1 },
  );
  assert.ok(runtime);
  const projectiles = createProjectileSystem();
  const result = requestPetMonkey2LjSkill({
    roster: rosters.p2,
    runtime,
    targets: [{ id: 'm-p2', x: 100, y: 0, isAlive: true }],
    projectiles,
  });
  assert.equal(result.ok, true);
  const projectile = getActiveProjectiles(projectiles)[0];
  assert.ok(projectile);
  assert.equal(projectile.sourceId, 'p2-pet-monkey-2');
  assert.notEqual(projectile.sourceId, rosters.p1.pets[1].id);
}

function testMonsterExperienceFollowsCurrentTargetOwner(): void {
  const monster = createMonster30(0, 0, 'target-owner-exp');
  monster.targetSlot = 'p2';
  const award = claimMonsterExperienceForCurrentTarget(monster, 'p1');
  assert.deepEqual(award, { ownerSlot: 'p2', experience: monster.experience });
  assert.equal(claimMonsterExperienceForCurrentTarget(monster, 'p1'), undefined);
}

function testHeroAndPetExperienceRoutesForBothPlayers(): void {
  const rosters = createPlayerPetRosters();
  const p1Pet = getActivePet(rosters.p1);
  const p2Pet = getActivePet(rosters.p2);
  assert.ok(p1Pet);
  assert.ok(p2Pet);
  const p2Share = awardMonsterExperienceByTarget(
    rosters,
    { kind: 'hero', ownerSlot: 'p2' },
    10,
  );
  assert.equal(p2Share.heroExperience, 6);
  assert.equal(p2Share.petExperience, 6);
  assert.equal(p2Pet.exp, 6);
  assert.equal(p1Pet.exp, 0);

  p2Pet.isActive = false;
  const noPetShare = awardMonsterExperienceByTarget(
    rosters,
    { kind: 'hero', ownerSlot: 'p2' },
    10,
  );
  assert.equal(noPetShare.heroExperience, 10);
  assert.equal(noPetShare.petExperience, 0);
}

function testDirectPetTargetGetsFullExperience(): void {
  const rosters = createPlayerPetRosters();
  const p2Pet = getActivePet(rosters.p2);
  assert.ok(p2Pet);
  const share = awardMonsterExperienceByTarget(
    rosters,
    { kind: 'pet', ownerSlot: 'p2', petId: p2Pet.id },
    10,
  );
  assert.equal(share.heroExperience, 0);
  assert.equal(share.petExperience, 10);
  assert.equal(p2Pet.exp, 10);
}
