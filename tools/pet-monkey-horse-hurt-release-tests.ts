import { bodyGroundFixture } from './pet226-body/ground-fixture';
/** Existing 207/209 hurt-release contracts through real damage events and native body callbacks. */
import assert from 'node:assert/strict';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';

const specs = [
  { family: 'monkey', form: 1, skill: 'xj', flag: 'monkey1Xj', symbol: 'PetMonkey1Bullet2' },
  { family: 'monkey', form: 2, skill: 'xj', flag: 'monkey2Xj', symbol: 'PetMonkey1Bullet2' },
  { family: 'monkey', form: 3, skill: 'lj', flag: 'monkey3Lj', symbol: 'PetMonkey3Bullet3_2' },
  { family: 'monkey', form: 4, skill: 'lj', flag: 'monkey3Lj', symbol: 'PetMonkey3Bullet3_2' },
  ...[2, 3, 4].map(form => ({ family: 'horse', form, skill: 'bd', flag: 'horse2Bd', symbol: form === 2 ? 'PetHorse2Bullet2' : 'PetHorse3Bullet2' })),
];
let cases = 0;
for (const spec of specs) for (const fps of [20, 24, 30]) for (const slot of ['p1', 'p2'])
for (const lethal of [false, true]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === spec.family && p.form === spec.form; });
  const pet = roster.pets.find(p => p.isActive)!;
  Object.assign(pet, { id: `${slot}-${pet.id}`, skills: [spec.skill], hp: 1000, maxHp: 1000,
    mp: 1000, maxMp: 1000, moveSpeed: 0 });
  const flag = (pet.skillState as any)[spec.flag]; flag.releaseReady = false; flag.cooldownMs = 0;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: slot === 'p1' ? 300 : 640, y: 350, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture(spec.family as 'monkey' | 'horse', spec.form as 1 | 2 | 3 | 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  const targets = [{ id: 'target', x: origin.x + 40, y: origin.y, isAlive: true }];
  const step = (damageEvents?: { runtimeKey: string; amount: number; reactsToHit: boolean }[]) => runtime.update({
    roster, owner, groundEnvironment, projectiles, targets, damageEvents, deltaMs: 1000 / fps, hostFps: fps,
    random: () => 0.99, projectileCombat: noTargetBodyFixturePort,
  });
  step();
  assert.equal(projectiles.projectiles.length, 0); assert.equal(flag.releaseReady, false);
  const beforeMp = pet.mp, life = pet.lifetime;
  step([{ runtimeKey: origin.runtimeKey!, amount: lethal ? 2000 : 1, reactsToHit: true }]);
  assert.equal(flag.releaseReady, true, `${spec.family}${spec.form}: source override arms even after lethal super.reduceHp`);
  assert.equal(runtime.snapshot().animation?.action, lethal ? 'dead' : 'hurt');
  assert.equal(projectiles.projectiles.length, 0, 'Damage input must not directly create a retaliation projectile');
  if (lethal) {
    for (let tick = 0; tick < 100; tick++) step();
    assert.equal(runtime.snapshot().runtime, undefined);
    assert.equal(projectiles.projectiles.length, 0); assert.equal(pet.mp, beforeMp);
    assert.equal(pet.lifetime, life - 1);
  } else {
    for (let tick = 0; tick < 100 && !projectiles.projectiles.some(p => p.sourceSymbol === spec.symbol); tick++) step();
    const bullet = projectiles.projectiles.find(p => p.sourceSymbol === spec.symbol);
    assert(bullet, `${spec.family}${spec.form}/${fps}/${slot}: hurt ends then native callback emits ${spec.symbol}`);
    assert.equal(bullet.sourceId, pet.id); assert.equal(bullet.petHostTick, 0);
    assert(pet.mp < beforeMp); assert.equal(pet.lifetime, life);
  }
  runtime.destroy(); assert.equal(projectiles.projectiles.length, 0); cases++;
}
assert.equal(cases, 84);
console.log(`${cases} production hurt/release/lethal-priority cases passed for both slots and three FPS; native callbacks, no target damage/GPU claim.`);
