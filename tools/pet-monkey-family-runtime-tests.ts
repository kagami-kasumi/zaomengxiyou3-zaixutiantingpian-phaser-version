import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import monkeyFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import {
  createProjectileSystem,
  updateProjectiles,
} from '../src/systems/ProjectileSystem';
import {
  createStage1CombatEnemy,
  createStage1CombatRuntime,
} from '../src/systems/Stage1CombatSystem';
import { resolveFormalPetMonkeyProjectileHits } from '../src/systems/PetMonkeyCombatSystem';
import { PetTuning } from '../src/systems/PetTuning';
import type { PetRoster, PetState } from '../src/systems/PetTypes';

const owner = { x: 200, y: 300, facingX: 1 as const };

function testVerifiedP1RContractSetIsComplete(): void {
  assert.equal(monkeyFamilyTruth.status, 'verified');
  assert.equal(monkeyFamilyTruth.completeness.unresolved.length, 0);
  const ids = monkeyFamilyTruth.p1rAcceptance.contractIds;
  assert.equal(ids.length, 41);
  assert.deepEqual(ids, monkeyFamilyTruth.contractMatrix.map(({ id }) => id));
}

function testAllFourFormsCreateTrueBasicAttackProjectiles(): void {
  for (const form of [1, 2, 3, 4] as const) {
    const roster = activateMonkey(form);
    disableAllMonkeySkills(roster.pets.find((pet) => pet.isActive)!);
    const runtime = new PetCombatRuntime();
    const projectiles = createProjectileSystem();
    const snapshot = runtime.update({
      roster,
      owner,
      targets: [{ id: 'target', x: 187, y: 245, isAlive: true }],
      projectiles,
      random: () => 0.1,
      deltaMs: 0,
    });
    assert.equal(snapshot.form, form);
    assert.equal(projectiles.projectiles.length, 1, `monkey${form} normal projectile`);
    const projectile = projectiles.projectiles[0]!;
    assert.equal(projectile.variant, `pet-monkey${form}-normal`);
    assert.equal(projectile.sourceId, `pet-monkey-${form}`);
    assert.ok(projectile.assetKey.endsWith(`monkey${form}.normal`));
    assert.ok((projectile.damage ?? 0) > 0);
  }
}

function testBasicAttackHitFrameDamagesFormalMonsterOnce(): void {
  const roster = activateMonkey(1);
  const pet = roster.pets.find((candidate) => candidate.isActive)!;
  disableAllMonkeySkills(pet);
  const projectiles = createProjectileSystem();
  const runtime = new PetCombatRuntime();
  runtime.update({
    roster,
    owner,
    targets: [{ id: 'monster', x: 187, y: 245, isAlive: true }],
    projectiles,
    random: () => 0.1,
    deltaMs: 0,
  });
  const combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: 'monster', enemyType: 30, x: 187, y: 245 });
  const hpBefore = enemy.hp;
  assert.equal(resolveFormalPetMonkeyProjectileHits({
    projectiles,
    combat,
    enemies: [enemy],
    ownerSlotForPet: () => 'p1',
    timeMs: 0,
  }).length, 0, 'damage must wait for the verified hit frame');
  updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], 430);
  assert.equal(resolveFormalPetMonkeyProjectileHits({
    projectiles,
    combat,
    enemies: [enemy],
    ownerSlotForPet: () => 'p1',
    timeMs: 430,
  }).length, 1);
  assert.ok(enemy.hp < hpBefore);
  assert.equal(enemy.lastHitBy, 'p1');
  assert.equal(resolveFormalPetMonkeyProjectileHits({
    projectiles,
    combat,
    enemies: [enemy],
    ownerSlotForPet: () => 'p1',
    timeMs: 501,
  }).length, 0, 'attack-id dedup must reject a second hit');
}

function testP1P2RuntimeStateAndDamageOwnershipStayPrivate(): void {
  const p1Roster = activateMonkey(2);
  const p2Roster = activateMonkey(3);
  disableAllMonkeySkills(p1Roster.pets.find((pet) => pet.isActive)!);
  disableAllMonkeySkills(p2Roster.pets.find((pet) => pet.isActive)!);
  const projectiles = createProjectileSystem();
  const p1 = new PetCombatRuntime();
  const p2 = new PetCombatRuntime();
  p1.update({ roster: p1Roster, owner, targets: [{ id: 'a', x: 207, y: 235, isAlive: true }], projectiles, random: () => 0.1, deltaMs: 0 });
  p2.update({ roster: p2Roster, owner: { ...owner, x: 500 }, targets: [{ id: 'b', x: 542, y: 205, isAlive: true }], projectiles, random: () => 0.1, deltaMs: 0 });
  assert.notEqual(p1.snapshot().runtime?.runtimeKey, p2.snapshot().runtime?.runtimeKey);
  assert.deepEqual(projectiles.projectiles.map(({ sourceId }) => sourceId), ['pet-monkey-2', 'pet-monkey-3']);
  p1.destroy();
  assert.equal(p1.snapshot().destroyed, true);
  assert.equal(p2.snapshot().destroyed, false);
}

function testEveryMonkeySkillProjectileReachesItsVerifiedHitFrame(): void {
  const cases = [
    { form: 1, variant: 'pet-monkey1-xj', hitFrame: 11, arm: (pet: PetState) => { pet.skillState!.monkey1Xj.releaseReady = true; pet.skillState!.monkey1Xj.cooldownMs = 0; } },
    { form: 2, variant: 'pet-monkey2-lj', hitFrame: 1, arm: (pet: PetState) => { pet.skillState!.monkey2Lj.cooldownMs = 0; } },
    { form: 2, variant: 'pet-monkey2-xj', hitFrame: 10, arm: (pet: PetState) => { pet.skillState!.monkey2Lj.cooldownMs = 9_999; pet.skillState!.monkey2Xj.releaseReady = true; pet.skillState!.monkey2Xj.cooldownMs = 0; } },
    { form: 3, variant: 'pet-monkey3-lyq', hitFrame: 2, arm: (pet: PetState) => { pet.skillState!.monkey3Lyq.cooldownMs = 0; } },
    { form: 3, variant: 'pet-monkey3-xj', hitFrame: 10, arm: (pet: PetState) => { pet.skillState!.monkey3Lyq.cooldownMs = 9_999; pet.skillState!.monkey3Xj.cooldownMs = 0; } },
    { form: 3, variant: 'pet-monkey3-lj', hitFrame: 1, arm: (pet: PetState) => { pet.skillState!.monkey3Lyq.cooldownMs = 9_999; pet.skillState!.monkey3Xj.cooldownMs = 9_999; pet.skillState!.monkey3Lj.releaseReady = true; pet.skillState!.monkey3Lj.cooldownMs = 0; } },
    { form: 4, variant: 'pet-monkey3-lyq', hitFrame: 2, arm: (pet: PetState) => { pet.skillState!.monkey3Lyq.cooldownMs = 0; } },
    { form: 4, variant: 'pet-monkey3-xj', hitFrame: 10, arm: (pet: PetState) => { pet.skillState!.monkey3Lyq.cooldownMs = 9_999; pet.skillState!.monkey3Xj.cooldownMs = 0; } },
    { form: 4, variant: 'pet-monkey3-lj', hitFrame: 1, arm: (pet: PetState) => { pet.skillState!.monkey3Lyq.cooldownMs = 9_999; pet.skillState!.monkey3Xj.cooldownMs = 9_999; pet.skillState!.monkey3Lj.releaseReady = true; pet.skillState!.monkey3Lj.cooldownMs = 0; } },
  ] as const;
  for (const scenario of cases) {
    const roster = activateMonkey(scenario.form);
    const pet = roster.pets.find((candidate) => candidate.isActive)!;
    pet.mp = 500;
    scenario.arm(pet);
    const projectiles = createProjectileSystem();
    new PetCombatRuntime().update({
      roster,
      owner,
      targets: [{ id: 'monster', x: 250, y: 260, isAlive: true }],
      projectiles,
      random: () => 0.9,
      deltaMs: 0,
    });
    const projectile = projectiles.projectiles.find(({ variant }) => variant === scenario.variant);
    assert.ok(projectile, `monkey${scenario.form} ${scenario.variant} must spawn`);
    const enemy = createStage1CombatEnemy({ id: 'monster', enemyType: 30, x: projectile.x, y: projectile.y });
    const combat = createStage1CombatRuntime();
    updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], scenario.hitFrame * (1000 / 24) + 5);
    assert.equal(resolveFormalPetMonkeyProjectileHits({
      projectiles,
      combat,
      enemies: [enemy],
      ownerSlotForPet: () => 'p1',
      timeMs: 500,
    }).length, 1, `${scenario.variant} must damage at its verified hit frame`);
  }
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
  const first = runtime.update({ roster, owner, targets: [], deltaMs: 0 });
  runtime.update({
    roster,
    owner,
    targets: [],
    damageEvents: [{ runtimeKey: first.runtime!.runtimeKey, amount: 1 }],
    deltaMs: 0,
  });
  assert.equal(pet.skillState!.monkey3Lj.releaseReady, true);
}

function testJgaoyiRunsFiveStepsAndHurtCancelsAChain(): void {
  const roster = activateMonkey(4);
  const pet = roster.pets.find((candidate) => candidate.isActive)!;
  pet.mp = 500;
  const state = pet.skillState!;
  state.monkey3Lyq.cooldownMs = 9_999;
  state.monkey3Xj.cooldownMs = 9_999;
  state.monkey3Lj.cooldownMs = 9_999;
  state.monkey3Lj.releaseReady = false;
  state.monkey4Jgaoyi.cooldownMs = 0;
  const runtime = new PetCombatRuntime();
  const projectiles = createProjectileSystem();
  const targets = [
    { id: 'outside', x: 10, y: 260, isAlive: true },
    { id: 'visible-a', x: 400, y: 260, isAlive: true },
    { id: 'visible-b', x: 600, y: 260, isAlive: true },
  ];
  const steps: unknown[] = [];
  let snapshot = runtime.update({ roster, owner, targets, projectiles, random: () => 0.5, deltaMs: 0 });
  steps.push(...runtime.events().filter(({ behaviorEvent }) => behaviorEvent?.type === 'jgaoyi-chain-step'));
  for (let index = 0; index < 4; index += 1) {
    snapshot = runtime.update({ roster, owner, targets, projectiles, random: () => 0.5, deltaMs: 400 });
    steps.push(...runtime.events().filter(({ behaviorEvent }) => behaviorEvent?.type === 'jgaoyi-chain-step'));
  }
  assert.equal(steps.length, 5);
  assert.equal(projectiles.projectiles.filter(({ variant }) => variant === 'pet-monkey4-jgaoyi').length, 1);
  assert.equal(projectiles.projectiles.filter(({ variant }) => variant === 'pet-monkey3-xj').length, 4);
  assert.equal(projectiles.projectiles.filter(({ variant }) => variant === 'pet-monkey3-lj').length, 4);
  assert.equal(projectiles.projectiles.filter(({ variant }) => variant === 'pet-monkey3-lyq').length, 1);
  assert.equal(snapshot.runtime?.x, owner.x);
  assert.equal(snapshot.runtime?.y, owner.y - 50);

  const cancelRoster = activateMonkey(4);
  const cancelPet = cancelRoster.pets.find((candidate) => candidate.isActive)!;
  cancelPet.mp = 500;
  cancelPet.skillState!.monkey3Lyq.cooldownMs = 9_999;
  cancelPet.skillState!.monkey3Xj.cooldownMs = 9_999;
  cancelPet.skillState!.monkey3Lj.cooldownMs = 9_999;
  cancelPet.skillState!.monkey4Jgaoyi.cooldownMs = 0;
  const cancelRuntime = new PetCombatRuntime();
  const cancelProjectiles = createProjectileSystem();
  const active = cancelRuntime.update({ roster: cancelRoster, owner, targets, projectiles: cancelProjectiles, random: () => 0.5, deltaMs: 0 });
  cancelRuntime.update({
    roster: cancelRoster,
    owner,
    targets,
    projectiles: cancelProjectiles,
    random: () => 0.9,
    damageEvents: [{ runtimeKey: active.runtime!.runtimeKey, amount: 1, sourceId: 'monster' }],
    deltaMs: 400,
  });
  assert.ok(cancelRuntime.events().some(({ behaviorEvent }) => behaviorEvent?.type === 'jgaoyi-chain-cancelled'));
}

function testSharedFormalAndTestSceneConsumersAreWired(): void {
  const formal = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8');
  const body = readFileSync('src/scenes/FormalPetMonkeyBodyBridge.ts', 'utf8');
  const testScene = readFileSync('src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts', 'utf8');
  const legacy = readFileSync('src/scenes/test-scene/TestScenePetMagicBridge.ts', 'utf8');
  assert.match(formal, /new PetCombatRuntime\(\)/u);
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
testAllFourFormsCreateTrueBasicAttackProjectiles();
testBasicAttackHitFrameDamagesFormalMonsterOnce();
testP1P2RuntimeStateAndDamageOwnershipStayPrivate();
testEveryMonkeySkillProjectileReachesItsVerifiedHitFrame();
testEvidenceCooldownsAndForm4DamageRelease();
testJgaoyiRunsFiveStepsAndHurtCancelsAChain();
testSharedFormalAndTestSceneConsumersAreWired();
console.log('Pet monkey family P1R runtime, damage, owner, and consumer tests passed.');
