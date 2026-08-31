import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  requestPetHorseSkill,
  resolveFormalPetHorseProjectileHits,
  type HorseSkillAction,
} from '../src/systems/PetHorseCombatSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import type { PetRuntimeModel, PetSkillTarget } from '../src/systems/PetTypes';
import { activateHorse } from './pet-horse-behavior-contract-adapter';

const targets: readonly PetSkillTarget[] = [
  { id: 'horse-target-a', x: 300, y: 260, isAlive: true },
  { id: 'horse-target-b', x: 390, y: 260, isAlive: true },
];

for (const fixture of [
  { form: 1, action: 'sp', symbol: 'PetHorse1Bullet2' },
  { form: 2, action: 'bd', symbol: 'PetHorse2Bullet2', hurt: true },
  { form: 2, action: 'sp', symbol: 'PetHorse1Bullet2' },
  { form: 3, action: 'bd', symbol: 'PetHorse3Bullet2', hurt: true },
  { form: 3, action: 'sp', symbol: 'PetHorse3Bullet3' },
  { form: 3, action: 'bz', symbol: 'PetHorse3Bullet4' },
  { form: 4, action: 'bd', symbol: 'PetHorse3Bullet2', hurt: true },
  { form: 4, action: 'sp', symbol: 'PetHorse3Bullet3' },
  { form: 4, action: 'bz', symbol: 'PetHorse3Bullet4' },
] as const) {
  const { result, pet } = cast(fixture.form, fixture.action, fixture.hurt);
  assert.equal(result.ok, true, `horse${fixture.form}.${fixture.action}`);
  assert.equal(result.projectile?.sourceSymbol, fixture.symbol);
  assert.equal(result.projectile?.sourceId, pet.id);
  assert.equal(result.projectile?.petActionToken, 7);
}

{
  const roster = activateHorse(3);
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  pet.skills = ['bd'];
  pet.skillState!.horse2Bd.releaseReady = false;
  const projectiles = createProjectileSystem();
  const rejected = requestPetHorseSkill('bd', {
    roster,
    runtime: runtimeFor(pet.id),
    targets,
    projectiles,
    actionToken: 1,
  });
  assert.equal(rejected.ok, false);
  pet.skillState!.horse2Bd.releaseReady = true;
  const accepted = requestPetHorseSkill('bd', {
    roster,
    runtime: runtimeFor(pet.id),
    targets,
    projectiles,
    actionToken: 2,
  });
  assert.equal(accepted.ok, true);
  assert.equal(pet.skillState!.horse2Bd.releaseReady, false);
}

for (const skills of [
  ['tmaoyi'],
  ['tmaoyi', 'sp'],
  ['tmaoyi', 'bz'],
  ['tmaoyi', 'bd', 'bz'],
  ['tmaoyi', 'sp', 'bd', 'bz'],
] as const) {
  const roster = activateHorse(4);
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  pet.skills = [...skills];
  pet.mp = 500;
  pet.skillState!.horse4Tmaoyi.cooldownMs = 0;
  const projectiles = createProjectileSystem();
  const result = requestPetHorseSkill('tmaoyi', {
    roster,
    runtime: runtimeFor(pet.id),
    targets,
    projectiles,
    actionToken: 9,
    random: () => 1,
  });
  assert.equal(result.ok, true);
  assert.equal(result.projectiles?.length, targets.length);
  for (const projectile of result.projectiles ?? []) {
    assert.equal(projectile.petActionToken, 9);
    assert.equal(projectile.trackingTargetId !== undefined, skills.includes('sp'));
    assert.equal(projectile.magicIceMs, skills.includes('bd') ? 2_400 : undefined);
    assert.equal(projectile.secondStageDamage !== undefined, skills.includes('bz'));
    assert.equal(projectile.explosionDelayMs, skills.includes('bd') && skills.includes('bz') ? 1_000 : 0);
  }
}

{
  const roster = activateHorse(4);
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  pet.skills = ['tmaoyi', 'sp', 'bd', 'bz'];
  pet.mp = 500;
  const projectiles = createProjectileSystem();
  requestPetHorseSkill('tmaoyi', {
    roster,
    runtime: runtimeFor(pet.id),
    targets: [targets[0]!],
    projectiles,
    actionToken: 11,
    random: () => 1,
  });
  updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], 1_000);
  const combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: targets[0]!.id, enemyType: 30, x: targets[0]!.x, y: targets[0]!.y });
  const hpBefore = enemy.hp;
  const events = resolveFormalPetHorseProjectileHits({
    projectiles,
    combat,
    enemies: [enemy],
    ownerSlotForPet: (id) => id === pet.id ? 'p1' : undefined,
    timeMs: 1_000,
  });
  assert.equal(events.length, 1);
  assert.ok(enemy.hp < hpBefore);
  assert.equal(enemy.petHorseIceRemainingMs, 2_400);
  const explosion = projectiles.projectiles.find(({ variant }) => variant === 'pet-horse4-tmaoyi-explode');
  assert.ok(explosion);
  assert.equal(explosion.petActionToken, 11);
  assert.equal(explosion.activeAfterMs, 1_000);
}

const formal = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8');
const body = readFileSync('src/scenes/FormalPetHorseBodyBridge.ts', 'utf8');
const testScene = readFileSync('src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts', 'utf8');
const testMagicBridge = readFileSync('src/scenes/test-scene/TestScenePetMagicBridge.ts', 'utf8');
assert.match(formal, /resolveFormalPetHorseProjectileHits\s*\(/u);
assert.match(formal, /p1:\s*new PetCombatRuntime\(\)[\s\S]*p2:\s*new PetCombatRuntime\(\)/u);
assert.doesNotMatch(body, /PetRuntimeSystem/u);
assert.match(body, /PetCombatSnapshot/u);
assert.match(testScene, /runtime\.updatePets\s*\(/u);
assert.doesNotMatch(testMagicBridge, /requestPetHorse(?:1Sp|2Bd|3Bz|4Tmaoyi)Skill/u);

console.log('Horse normal/skill inheritance, tmaoyi combinations, formal damage, ice, and shared consumers passed.');

function cast(form: 1 | 2 | 3 | 4, action: Exclude<HorseSkillAction, 'tmaoyi'>, hurt = false) {
  const roster = activateHorse(form);
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  pet.skills = [action];
  pet.mp = 500;
  pet.skillState!.horse1Sp.cooldownMs = 0;
  pet.skillState!.horse2Bd.cooldownMs = 0;
  pet.skillState!.horse2Bd.releaseReady = hurt;
  pet.skillState!.horse3Bz.cooldownMs = 0;
  const projectiles = createProjectileSystem();
  return {
    pet,
    result: requestPetHorseSkill(action, {
      roster,
      runtime: runtimeFor(pet.id),
      targets,
      projectiles,
      actionToken: 7,
      random: () => 1,
    }),
  };
}

function runtimeFor(petId: string): PetRuntimeModel {
  return { petId, runtimeKey: `${petId}:horse:test`, x: 240, y: 260, facingX: 1, state: 'idle' };
}
