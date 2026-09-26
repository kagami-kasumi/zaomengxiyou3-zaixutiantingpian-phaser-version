import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import monkeyFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { verifyFamilySkillProjectiles } from './pet-family-skill-projectile-fixture';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import { PetTuning } from '../src/systems/PetTuning';
import type { PetRoster, PetState } from '../src/systems/PetTypes';
import { bodyGroundFixture } from './pet226-body/ground-fixture';

const owner = { x: 200, y: 300, facingX: 1 as const };

function testVerifiedP1RContractSetIsComplete(): void {
  assert.equal(monkeyFamilyTruth.status, 'verified');
  assert.equal(monkeyFamilyTruth.completeness.unresolved.length, 0);
  const ids = monkeyFamilyTruth.p1rAcceptance.contractIds;
  assert.equal(ids.length, 41);
  assert.deepEqual(ids, monkeyFamilyTruth.contractMatrix.map(({ id }) => id));
}

async function testAllFourFormsCreateTrueBasicAttackProjectiles(): Promise<void> {
  // 226 replaces zero-delta births with original body callbacks for all four forms.
  await import('./pet-monkey-horse-normal-runtime-tests');
}

async function testBasicAttackHitFrameDamagesFormalMonsterOnce(): Promise<void> {
  // The same native fixture also proves no birth hit, actual monster damage, owner and ID dedup.
  // Reuse it once per module instead of retaining the obsolete fixed 430 ms resolver expectation.
  await import('./pet-monkey-horse-normal-runtime-tests');
}

function testP1P2RuntimeStateAndDamageOwnershipStayPrivate(): void {
  const p1Roster = activateMonkey(2);
  const p2Roster = activateMonkey(3);
  disableAllMonkeySkills(p1Roster.pets.find((pet) => pet.isActive)!);
  disableAllMonkeySkills(p2Roster.pets.find((pet) => pet.isActive)!);
  const projectiles = createProjectileSystem();
  const p1 = new PetCombatRuntime();
  const p2 = new PetCombatRuntime();
  const p1Ground = bodyGroundFixture('monkey', 2, owner.y - 100);
  const p2Ground = bodyGroundFixture('monkey', 3, owner.y - 100);
  p1.update({ roster: p1Roster, owner, groundEnvironment: p1Ground, targets: [{ id: 'a', x: 170, y: owner.y - 100, isAlive: true }], projectiles, random: () => 0.1, deltaMs: 0 });
  p2.update({ roster: p2Roster, owner: { ...owner, x: 500 }, groundEnvironment: p2Ground, targets: [{ id: 'b', x: 480, y: owner.y - 100, isAlive: true }], projectiles, random: () => 0.1, deltaMs: 0 });
  for (let tick = 0; tick < 80 && projectiles.projectiles.length < 2; tick++) {
    p1.update({ roster: p1Roster, owner, groundEnvironment: p1Ground, targets: [{ id: 'a', x: 170, y: owner.y - 100, isAlive: true }], projectiles,
      random: () => 0.1, deltaMs: 1000 / 24, hostFps: 24, projectileCombat: noTargetBodyFixturePort });
    p2.update({ roster: p2Roster, owner: { ...owner, x: 500 }, groundEnvironment: p2Ground, targets: [{ id: 'b', x: 480, y: owner.y - 100, isAlive: true }], projectiles,
      random: () => 0.1, deltaMs: 1000 / 24, hostFps: 24, projectileCombat: noTargetBodyFixturePort });
  }
  assert.notEqual(p1.snapshot().runtime?.runtimeKey, p2.snapshot().runtime?.runtimeKey);
  assert.deepEqual(projectiles.projectiles.map(({ sourceId }) => sourceId), ['pet-monkey-2', 'pet-monkey-3']);
  p1.destroy();
  assert.equal(p1.snapshot().destroyed, true);
  assert.equal(p2.snapshot().destroyed, false);
}

async function testEveryMonkeySkillProjectileReachesItsVerifiedHitFrame(): Promise<void> {
  await verifyFamilySkillProjectiles('monkey');
}

function testEvidenceCooldownsAndForm4DamageRelease(): void {
  assert.equal(PetTuning.monkey1XjCooldownMs, 3_000);
  assert.equal(PetTuning.monkey2LjCooldownMs, 3_000);
  assert.equal(PetTuning.monkey2XjCooldownMs, 7_000);
  assert.equal(PetTuning.monkey3LyqCooldownMs, 3_000);
  assert.equal(PetTuning.monkey3XjCooldownMs, 7_000);
  assert.equal(PetTuning.monkey3LjCooldownMs, 9_000);
  assert.equal(PetTuning.monkey4LjCooldownMs, 6_000);
  assert.equal(PetTuning.monkey4JgaoyiCooldownMs, 24_000);

  const roster = activateMonkey(4);
  const pet = roster.pets.find((candidate) => candidate.isActive)!;
  const runtime = new PetCombatRuntime();
  const groundEnvironment = bodyGroundFixture('monkey', 4, owner.y - 100);
  const first = runtime.update({ roster, owner, groundEnvironment, targets: [], deltaMs: 0 });
  runtime.update({
    roster,
    owner,
    groundEnvironment,
    targets: [],
    damageEvents: [{ runtimeKey: first.runtime!.runtimeKey, amount: 1 }],
    deltaMs: 1000 / 24,
    hostFps: 24,
  });
  assert.equal(pet.skillState!.monkey3Lj.releaseReady, true);
}

async function testJgaoyiRunsFiveStepsAndHurtCancelsAChain(): Promise<void> {
  // Original callbacks now run coupled to original ground, including every
  // learned subset, target/transform boundary, hurt/empty and render partitions.
  await import('./pet-monkey-aoyi-ground-tests');
}

function testSharedFormalAndTestSceneConsumersAreWired(): void {
  const formal = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8');
  const body = readFileSync('src/scenes/FormalPetMonkeyBodyBridge.ts', 'utf8');
  const testScene = readFileSync('src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts', 'utf8');
  const legacy = readFileSync('src/scenes/test-scene/TestScenePetMagicBridge.ts', 'utf8');
  assert.match(formal, /new PetCombatRuntime\(petTurtle\.registry\)/u);
  assert.match(formal, /resolveFormalPetMonkeyProjectileHits/u);
  assert.match(testScene, /runtime\.updatePets\(/u);
  assert.doesNotMatch(body, /PetRuntimeSystem/u);
  assert.match(legacy, /activePet\.species === 'monkey'[\s\S]*return;/u);
}

function activateMonkey(form: 1 | 2 | 3 | 4): PetRoster {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === 'monkey' && pet.form === form;
  return roster;
}

function disableAllMonkeySkills(pet: PetState): void {
  pet.skills = ['tsml'];
  const state = pet.skillState!;
  state.monkey1Xj.releaseReady = false;
  state.monkey2Xj.releaseReady = false;
  state.monkey3Lj.releaseReady = false;
  state.monkey1Xj.cooldownMs = 1;
  state.monkey2Lj.cooldownMs = 1;
  state.monkey2Xj.cooldownMs = 1;
  state.monkey3Lyq.cooldownMs = 1;
  state.monkey3Xj.cooldownMs = 1;
  state.monkey3Lj.cooldownMs = 1;
  state.monkey4Jgaoyi.cooldownMs = 1;
}

testVerifiedP1RContractSetIsComplete();
await testAllFourFormsCreateTrueBasicAttackProjectiles();
await testBasicAttackHitFrameDamagesFormalMonsterOnce();
testP1P2RuntimeStateAndDamageOwnershipStayPrivate();
await testEveryMonkeySkillProjectileReachesItsVerifiedHitFrame();
testEvidenceCooldownsAndForm4DamageRelease();
await testJgaoyiRunsFiveStepsAndHurtCancelsAChain();
testSharedFormalAndTestSceneConsumersAreWired();
console.log('Pet monkey family P1R runtime, damage, owner, and consumer tests passed.');
