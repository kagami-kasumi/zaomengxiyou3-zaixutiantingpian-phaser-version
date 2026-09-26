/** Native three-target emission combined with real private collision/HP/effect settlement. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { PetWorldDelayedCalls } from '../src/systems/PetWorldDelayedCalls';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';
const collision = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-229/measurement.json', 'utf8')).cases;
const positive = collision.find((r: any) => r.symbol === 'PetHorse4Bullet5' && r.target === 'ObjectBaseSprite2' && r.direction === 1 && r.tick === 2 && r.hit);
assert(positive);
let cases = 0;
for (const fps of [20, 24, 30]) for (const ownerSlot of ['p1', 'p2'] as const)
for (const parts of [1, 4]) for (const skills of [0, 2, 7]) {
  const roster = createSeedPetRoster(); roster.pets.forEach(p => { p.isActive = p.species === 'horse' && p.form === 4; });
  const pet = roster.pets.find(p => p.isActive)!;
  pet.id = `${ownerSlot}-${pet.id}`; pet.skills = ['tmaoyi'];
  if (skills & 1) pet.skills.push('bd'); if (skills & 2) pet.skills.push('sp'); if (skills & 4) pet.skills.push('bz');
  pet.mp = 30; pet.atk = 17; pet.critBonusRate = 0; pet.skillState!.horse2Bd.releaseReady = false;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const owner = { x: 300, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture('horse', 4, 250);
  const enemies = [0, 1, 2].map(i => createStage1CombatEnemy({ id: `${ownerSlot}-target-${i}`, enemyType: 5, x: 650 + i * 150, y: 250 }));
  enemies.forEach(e => { e.hp = 1000000; });
  let now = 0, falling: ProjectileModel[] = [], births = 0;
  const queue = new PetWorldDelayedCalls(() => now);
  runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps: fps });
  for (let tick = 0; tick < fps * 6; tick++) {
    now = tick * 1000 / fps; queue.advance(now);
    if (falling.length) {
      enemies.forEach(e => { e.x = e.y = 10000; });
      // Move the actual three world objects to independently measured positive
      // collision offsets on the same host step; tracking keeps their identities.
      if (falling[0]!.petHostTick === 1) falling.forEach((p, i) => {
        const enemy = enemies[2 - i]!; enemy.x = p.x + positive.x; enemy.y = p.y + positive.y;
      });
    }
    const port = createPetProjectileCombatPort({ enemies, combat, ownerSlot, timeMs: now, random: () => .75,
      monkeyHorseCollision: () => bodyFixtureCollisionAssets, mask: () => { throw Error('Native collision required'); },
      delay: (ms, call) => queue.schedule(ms, call) });
    for (let part = 0; part < parts; part++) runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps: fps,
      deltaMs: 1000 / fps / parts, random: () => .75, projectileCombat: port,
      targets: enemies.map(e => ({ id: e.id, x: e.x, y: e.y, isAlive: e.hp > 0 })) });
    if (!falling.length) {
      falling = projectiles.projectiles.filter(p => p.sourceSymbol === 'PetHorse4Bullet5');
      if (falling.length) {
        births++;
        assert.equal(falling.length, 3, 'one native emission for every world-array entry');
        assert.deepEqual(falling.map(p => p.trackingTargetId), skills & 2 ? enemies.toReversed().map(e => e.id) : [undefined, undefined, undefined]);
        assert.equal(new Set(falling.map(p => p.sourceAttackId)).size, 3);
      }
    }
  }
  assert.equal(births, 1); assert.equal(pet.mp, 0);
  for (const p of falling) {
    assert(p.isExpired); assert.equal(p.remainingHits, 0);
    const hits = combat.audit.damageEvents.filter(e => e.attackId.startsWith(`${p.projectileId}:${p.sourceAttackId}:`));
    assert.equal(hits.length, 1, 'each falling effect accepts exactly one target');
  }
  assert.equal(new Set(combat.audit.damageEvents.filter(e => e.actionName === 'hit5_1').map(e => e.targetId)).size, 3);
  for (const enemy of enemies) {
    assert(enemy.hp < 1000000); assert.equal(enemy.lastHitBy, ownerSlot);
    assert.equal(!!enemy.petTargetEffectState!.effects.snapshot('pethorse_ice'), !!(skills & 1));
  }
  assert.equal(projectiles.projectiles.filter(p => p.sourceSymbol === 'PetHorse4Bullet5Explode').length, skills & 4 ? 3 : 0);
  runtime.destroy(); queue.destroy(); assert.equal(projectiles.projectiles.length, 0); cases++;
}
assert.equal(cases, 36);
console.log(`${cases} Horse4 three-target real-port chains: source count/order, optional tracking, HP/owner/ice, explosion count and cleanup passed.`);
