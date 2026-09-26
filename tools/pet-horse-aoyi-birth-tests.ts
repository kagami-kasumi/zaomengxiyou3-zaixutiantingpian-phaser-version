import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';

let cases = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-targets/measurement-${fps}.json`, 'utf8'));
  for (const ownerIndex of [1, 2]) for (const parts of [1, 4]) for (let skills = 0; skills < 8; skills++) {
    const born = native.rows.find((r: any) => r.id === `4-hit5-P${ownerIndex}-${skills}` && r.phase === 'enter'
      && r.bullets.some((b: any) => b.symbol === 'PetHorse4Bullet5'));
    assert.ok(born);
    const expected = born.bullets.filter((b: any) => b.symbol === 'PetHorse4Bullet5');
    const roster = createSeedPetRoster();
    for (const p of roster.pets) p.isActive = p.species === 'horse' && p.form === 4;
    const pet = roster.pets.find(p => p.isActive)!;
    pet.mp = 30; pet.moveSpeed = 0; pet.skills = ['tmaoyi']; pet.skillState!.horse2Bd.releaseReady = false;
    if (skills & 1) pet.skills.push('bd');
    if (skills & 2) pet.skills.push('sp');
    if (skills & 4) pet.skills.push('bz');
    const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
    const owner = { x: born.x, y: born.y, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture('horse', 4, owner.y - 100);
    runtime.update({ roster, owner, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
    const origin = runtime.snapshot().runtime!;
    const enemies = ['target', 'middle', 'last'].map((name, index) => createStage1CombatEnemy({
      id: `${name}-P${ownerIndex}`, enemyType: 5, x: origin.x + 350 + index * 100, y: origin.y,
    }));
    enemies[1]!.hp = 0; enemies[1]!.phase = 'dead';
    for (let tick = 0; tick <= born.tick; tick++) {
      const port = createPetProjectileCombatPort({ enemies, combat, ownerSlot: ownerIndex === 1 ? 'p1' : 'p2',
        timeMs: tick * 1000 / fps, random: () => 0.75, mask: () => { throw new Error('Native geometry required'); },
        monkeyHorseCollision: () => bodyFixtureCollisionAssets });
      for (let part = 0; part < parts; part++) runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps: fps,
        deltaMs: 1000 / fps / parts, random: () => 0.75, projectileCombat: port,
        // The world port retains the complete source array even if a caller supplies only living AI targets.
        targets: enemies.filter(e => e.hp > 0).map(e => ({ id: e.id, x: e.x, y: e.y, isAlive: true })) });
      if (tick < born.tick) assert.equal(projectiles.projectiles.filter(p => p.sourceSymbol === 'PetHorse4Bullet5').length, 0);
    }
    assert.equal(projectiles.projectiles.filter(p => p.sourceSymbol === 'AoyiBuff').length, 1);
    const falling = projectiles.projectiles.filter(p => p.sourceSymbol === 'PetHorse4Bullet5');
    assert.equal(falling.length, expected.length);
    for (const [index, p] of falling.entries()) {
      const b = expected[index];
      assert.deepEqual([p.sourceSymbol, p.x - origin.x, p.y, p.trackingTargetId ?? null, p.petHostTick, p.lifetimeMs],
        [b.symbol, b.x - born.x, b.y, b.target, born.tick - b.birthTick, b.ttl * 1000 / fps]);
    }
    runtime.destroy(); cases++;
  }
}
console.log(`Horse aoyi birth: ${cases} actual Runtime/native three-target array cases passed (dead middle entry retained).`);
