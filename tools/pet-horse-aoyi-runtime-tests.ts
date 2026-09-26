import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';
import { PetWorldDelayedCalls } from '../src/systems/PetWorldDelayedCalls';

const oracle = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-229/measurement.json', 'utf8'));
const sample = oracle.cases.find((r: any) => r.symbol === 'PetHorse4Bullet5' && r.target === 'ObjectBaseSprite2'
  && r.direction === 1 && r.tick === 2 && r.hit);
assert.ok(sample);
const damage = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/damage-air/measurement.json', 'utf8')).cases;
const privateLoop = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/private-array-air/measurement.json', 'utf8'));
const immediateSteps = privateLoop.cases.find((c: any) => c.mode === 'append-and-destroy').events.filter((event: string) => event === 'child').length;
const power = (action: string, atk: number, gxp = false) => damage.find((r: any) => r.family === 'horse' && r.form === 4 && r.action === action
  && r.atk === atk && r.magic === 0 && r.gxp === gxp && r.flower === 1 && !r.critical).result.hurt;
let cases = 0;
for (const fps of [20, 24, 30]) for (const ownerSlot of ['p1', 'p2'] as const)
for (const parts of [1, 4]) for (let skills = 0; skills < 8; skills++)
for (const mode of ['normal', 'released-live', 'dead-after', 'move-reference', 'gxp-enabled', 'gxp-cancelled']) {
  if (mode !== 'normal' && !(skills & 1 && skills & 4)) continue;
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === 'horse' && pet.form === 4;
  const pet = roster.pets.find(p => p.isActive)!;
  pet.skills = ['tmaoyi'];
  if (skills & 1) pet.skills.push('bd');
  if (skills & 2) pet.skills.push('sp');
  if (skills & 4) pet.skills.push('bz');
  pet.skillState!.horse2Bd.releaseReady = false;
  pet.mp = 30; pet.atk = 17; pet.moveSpeed = 0; pet.critBonusRate = 0;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const owner = { x: ownerSlot === 'p1' ? 300 : 640, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture('horse', 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  const sourceGxp = () => mode === 'gxp-enabled' ? hitTime >= 0 : mode === 'gxp-cancelled' && hitTime < 0;
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 5, x: origin.x + 350, y: origin.y });
  enemy.hp = 1000000;
  let pending = 0;
  let first: ProjectileModel | undefined, injected = false, hitTime = -1, now = 0;
  const delayedCalls = new PetWorldDelayedCalls(() => now);
  let hitPoint: { x: number; y: number } | undefined, postHitPoint: { x: number; y: number } | undefined;
  for (let tick = 0; tick < fps * 4; tick++) {
    now = tick * 1000 / fps;
    delayedCalls.advance(now);
    if (first) enemy.x = enemy.y = 10000;
    if (first && !injected && first.petHostTick === 1) {
      enemy.x = first.x + sample.x; enemy.y = first.y + sample.y;
      hitPoint = { x: first.x, y: first.y }; pet.atk = 123.75; injected = true;
    }
    const port = createPetProjectileCombatPort({ enemies: [enemy], combat, ownerSlot, timeMs: now, random: () => 0.75,
      mask: () => { throw new Error('Aoyi requires native collision'); }, monkeyHorseCollision: () => bodyFixtureCollisionAssets,
      delay: (ms, callback) => {
        assert.equal(ms, 1000); pending++;
        delayedCalls.schedule(ms, () => { pending--; callback(); });
      } });
    for (let part = 0; part < parts; part++) runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps: fps,
      targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }], projectileCombat: port,
      deltaMs: 1000 / fps / parts, random: () => 0.75,
      gxpRuntimeKeys: sourceGxp() ? [origin.runtimeKey!] : [] });
    first ??= projectiles.projectiles.find(p => p.sourceSymbol === 'PetHorse4Bullet5');
    if (first && first.petHostTick === 0) {
      assert.deepEqual([first.x, first.y, first.facingX, first.remainingHits], [origin.x + 45, 50, -1, 1]);
      assert.equal(first.damage, power('hit5_1', 17, mode === 'gxp-cancelled'));
      assert.equal(first.trackingTargetId, skills & 2 ? enemy.id : undefined);
    }
    if (first?.isExpired && hitTime < 0) {
      hitTime = now; postHitPoint = { x: first.x, y: first.y };
      assert.ok(enemy.hp < 1000000); assert.equal(enemy.lastHitBy, ownerSlot);
      assert.equal(first.damage, power('hit5_1', 123.75, mode === 'gxp-cancelled'));
      assert.equal(first.petHostTick, 2);
      assert.equal(first.remainingHits, 0);
      const ice = enemy.petTargetEffectState!.effects.snapshot('pethorse_ice');
      assert.equal(ice?.time, skills & 1 ? fps * 2.4 : undefined,
        'falling hit carries the doHit5 dictionary ice only when BD was learned');
      assert.ok(first.y > hitPoint!.y, 'the accepted final hit still precedes EnemyMove movement');
      if (mode === 'released-live') runtime.destroy();
      if (mode === 'dead-after') pet.hp = 0;
      if (mode === 'move-reference') {
        first.x += 23; first.y += 11;
        postHitPoint = { x: first.x, y: first.y };
      }
    }
    const explosions = projectiles.projectiles.filter(p => p.sourceSymbol === 'PetHorse4Bullet5Explode');
    if (hitTime >= 0) {
      const delayed = !!(skills & 1), enabled = !!(skills & 4);
      const expected = enabled && mode !== 'dead-after' && (!delayed || now >= hitTime + 1000);
      assert.equal(explosions.length, expected ? 1 : 0, `${fps}/${ownerSlot}/${parts}/${skills}/${tick}`);
      if (expected) {
        const explosion = explosions[0]!;
        assert.deepEqual({ x: explosion.x, y: explosion.y }, delayed ? postHitPoint : hitPoint);
        assert.equal(explosion.damage, power('hit5_2', 123.75, mode === 'gxp-enabled'));
        assert.equal(explosion.facingX, -1);
        if (!delayed && now === hitTime) assert.equal(explosion.petHostTick, immediateSteps,
          'original BasePet for-each visits the callback-appended explosion in the same private step');
        assert.equal(explosion.activeAfterMs, undefined, 'delay creates a new effect, not an early inactive placeholder');
      }
    }
  }
  assert.ok(first && injected && hitTime >= 0);
  assert.equal(pet.mp, 0); assert.equal(pending, 0);
  runtime.destroy(); delayedCalls.destroy(); cases++;
}
console.log(`Horse aoyi: ${cases} actual Runtime/collision/cache/owner and conditional explosion cases passed (world queue with controlled timestamps).`);

// EnemyMoveBullet.moveTarget is an object reference, not a lookup into monsterArray.
let retainedCases = 0;
for (const fps of [20, 24, 30]) for (const ownerSlot of ['p1', 'p2'] as const)
for (const parts of [1, 4]) for (const mode of ['present', 'removed', 'reused-id']) {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === 'horse' && pet.form === 4;
  const pet = roster.pets.find(p => p.isActive)!;
  pet.skills = ['tmaoyi', 'sp']; pet.mp = 30; pet.moveSpeed = 0;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const owner = { x: ownerSlot === 'p1' ? 300 : 640, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture('horse', 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  const target = createStage1CombatEnemy({ id: 'retained-target', enemyType: 5, x: origin.x + 350, y: 350 });
  const enemies = [target];
  let tick = 0;
  const step = (selectTarget: boolean) => {
    const port = createPetProjectileCombatPort({ enemies, combat, ownerSlot, timeMs: tick++ * 1000 / fps,
      random: () => 0.75, mask: () => { throw new Error('Native geometry required'); },
      monkeyHorseCollision: () => bodyFixtureCollisionAssets });
    for (let part = 0; part < parts; part++) runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps: fps,
      deltaMs: 1000 / fps / parts, random: () => 0.75, projectileCombat: port,
      targets: selectTarget ? [{ id: target.id, x: target.x, y: target.y, isAlive: true }] : [] });
  };
  while (!projectiles.projectiles.some(p => p.sourceSymbol === 'PetHorse4Bullet5') && tick < 40) step(true);
  const falling = projectiles.projectiles.find(p => p.sourceSymbol === 'PetHorse4Bullet5');
  assert.ok(falling, `${fps}/${ownerSlot}/${parts}/${mode}: falling effect born`);
  if (mode !== 'present') enemies.splice(0);
  if (mode === 'reused-id') enemies.push(createStage1CombatEnemy({
    id: target.id, enemyType: 5, x: origin.x + 350, y: 10000,
  }));
  target.y = -1000;
  const birthY = falling.y;
  step(false);
  assert.deepEqual([falling.y, falling.velocityY, falling.trackingTargetId], [birthY - 9, -8, target.id],
    'retained live object moves upward even after removal or replacement by the same ID');
  target.hp = 0;
  step(false);
  assert.deepEqual([falling.y, falling.velocityY, falling.trackingTargetId], [birthY - 17, -7, undefined],
    'death on the original object clears the reference and retains accelerated momentum');
  target.hp = 100; target.y = 10000;
  step(false);
  assert.deepEqual([falling.y, falling.velocityY, falling.trackingTargetId], [birthY - 24, -6, undefined],
    'cleared references cannot reacquire a resurrected object or its replacement');
  runtime.destroy(); retainedCases++;
}
console.log(`Horse aoyi retained target: ${retainedCases} actual Runtime array removal/ID reuse/death cases passed.`);
