import { bodyGroundFixture } from './pet226-body/ground-fixture';
import assert from 'node:assert/strict';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';

let cases = 0;
for (const fps of [20, 24, 30]) for (const ownerSlot of ['p1', 'p2'] as const) for (const parts of [1, 4]) {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === 'horse' && pet.form === 4;
  const pet = roster.pets.find(p => p.isActive)!;
  pet.skills = ['tmaoyi']; pet.mp = 30; pet.moveSpeed = 0;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem();
  const owner = { x: ownerSlot === 'p1' ? 300 : 640, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture('horse', 4, owner.y - 100);
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 5, x: owner.x + 350, y: owner.y });
  const port = createPetProjectileCombatPort({ enemies: [enemy], combat: createStage1CombatRuntime(), ownerSlot,
    timeMs: 0, random: () => 0.75, mask: () => { throw new Error('Native only'); },
    monkeyHorseCollision: () => bodyFixtureCollisionAssets });
  let prelude: ProjectileModel | undefined, birth = -1, falling = -1;
  for (let tick = 0; tick < 24; tick++) {
    for (let part = 0; part < parts; part++) runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps: fps,
      targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }], projectileCombat: port,
      deltaMs: 1000 / fps / parts, random: () => 0.75 });
    const current = projectiles.projectiles.find(p => p.sourceSymbol === 'AoyiBuff');
    if (!prelude && current) {
      prelude = current; birth = tick;
      assert.equal(prelude.petHostTick, 0);
      assert.equal(prelude.petRenderDirection, 1);
      assert.equal(prelude.visualOnly, true);
      assert.equal(prelude.damage, 0);
      assert.equal(prelude.destroyWhenSourceHurt, true);
      assert.equal(pet.mp, 0, 'only original skill MP is spent');
      assert.equal(projectiles.projectiles.some(p => p.sourceSymbol === 'PetHorse4Bullet5'), false);
      assert.equal(getPetHorseEffectUsage(prelude.assetKey)?.asset.frames.length, 14);
    }
    if (falling < 0 && projectiles.projectiles.some(p => p.sourceSymbol === 'PetHorse4Bullet5')) falling = tick;
    if (prelude) {
      assert.equal(prelude.isExpired, tick - birth >= 14, 'source terminal frame removes prelude');
      assert.equal(prelude.damage, 0);
    }
  }
  assert.ok(prelude); assert.ok(falling > birth);
  runtime.destroy(); cases++;
}
console.log(`Horse AoyiBuff: ${cases} actual Runtime release-before-hit, disabled damage, MP and native terminal-frame cases passed; pause/hurt/source release and canvas excluded.`);
