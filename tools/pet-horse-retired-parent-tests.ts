import { bodyGroundFixture } from './pet226-body/ground-fixture';
/** Original hero-reference retirement versus actual Runtime, world callback and shared view. */
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import { createTestPetProjectileCombatBridge } from './pet-projectile-bridge-fixture';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const oracle = read('local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-229/measurement.json');
const hit = oracle.cases.find((r: any) => r.symbol === 'PetHorse4Bullet5' && r.target === 'ObjectBaseSprite2'
  && r.direction === 1 && r.tick === 2 && r.hit);
assert(hit);
let cases = 0, states = 0;
for (const fps of [20, 24, 30]) {
  const native = read(`local-resources/regima/task-outputs/TASK-SLICE-226/horse-retired-parent-air/measurement-${fps}.json`);
  for (const owner of [1, 2]) for (const skills of [5, 7]) {
    const rows = native.rows.filter((r: any) => r.id === `4-hit5-P${owner}-${skills}-destroy-live` && r.phase === 'exit');
    const sourceBirth = rows.find((r: any) => r.bullets.some((b: any) => b.symbol === 'PetHorse4Bullet5Explode'));
    const duration = rows.at(-1).tick - sourceBirth.tick;
    const events = new EventEmitter(), images: any[] = [];
    const scene: any = { events: new EventEmitter(), game: { events, loop: { targetFps: fps, now: 0 } },
      cameras: { main: { scrollX: 0, scrollY: 0, matrix: { transformPoint: (x: number, y: number) => ({ x, y }) } } }, add: {
      image(x: number, y: number, key: string) {
        const image: any = { x, y, key, destroyed: false };
        image.setTexture = (k: string) => { image.key = k; return image; };
        image.setPosition = (px: number, py: number) => { image.x = px; image.y = py; return image; };
        for (const name of ['setOrigin', 'setFlipX', 'setScale', 'setDepth']) image[name] = () => image;
        image.destroy = () => { assert(!image.destroyed, 'A view is destroyed once'); image.destroyed = true; };
        images.push(image); return image;
      },
    } };
    const createPort = createTestPetProjectileCombatBridge(scene), view = createFormalPetHorseBodyBridge(scene);
    const roster = createSeedPetRoster();
    roster.pets.forEach(p => { p.isActive = p.species === 'horse' && p.form === 4; });
    const pet = roster.pets.find(p => p.isActive)!;
    Object.assign(pet, { hp: 1000, mp: 30, moveSpeed: 0, skills: ['tmaoyi', 'bd', 'bz', ...(skills === 7 ? ['sp'] : [])] });
    pet.skillState!.horse2Bd.releaseReady = false;
    const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
    const hero = { x: owner === 1 ? 300 : 640, y: 350, facingX: 1 as const };
    const groundEnvironment = bodyGroundFixture('horse', 4, hero.y - 100);
    runtime.update({ roster, owner: hero, groundEnvironment, projectiles, targets: [], deltaMs: 0, hostFps: fps });
    const origin = runtime.snapshot().runtime!;
    const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 5, x: origin.x + 350, y: origin.y });
    enemy.hp = 1000000;
    let falling: ProjectileModel | undefined, retired = false, bornTick = -1, hpAtRetirement = -1;
    let root: { x: number; y: number } | undefined;
    for (let tick = 1; tick < 240; tick++) {
      scene.game.loop.now = tick * 1000 / fps;
      events.emit('prestep', scene.game.loop.now, 1000 / fps);
      updateProjectiles(projectiles, [], 1000 / fps);
      if (falling) enemy.x = enemy.y = 10000;
      if (falling?.petHostTick === 1 && !retired) { enemy.x = falling.x + hit.x; enemy.y = falling.y + hit.y; }
      if (!retired) {
        const basePort = createPort({ enemies: [enemy], combat, ownerSlot: owner === 1 ? 'p1' : 'p2', timeMs: scene.game.loop.now, random: () => 0.75 });
        runtime.update({ roster, owner: hero, groundEnvironment, projectiles, targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }],
          hostFps: fps, deltaMs: 1000 / fps, random: () => 0.75,
          projectileCombat: { ...basePort, monkeyHorseCollision: () => bodyFixtureCollisionAssets } });
        falling ??= projectiles.projectiles.find(p => p.sourceSymbol === 'PetHorse4Bullet5');
        if (falling?.isExpired) {
          assert(enemy.hp < 1000000); assert(pet.hp > 0); root = { x: falling.x, y: falling.y };
          runtime.destroy(); retired = true; hpAtRetirement = enemy.hp;
          assert.equal(projectiles.projectiles.length, 0);
        }
      }
      view.update([], projectiles.projectiles, scene.game.loop.now);
      events.emit('poststep', scene.game.loop.now, 1000 / fps);
      const explosion = projectiles.projectiles.find(p => p.sourceSymbol === 'PetHorse4Bullet5Explode');
      if (retired) assert.equal(enemy.hp, hpAtRetirement, 'Retired private loop cannot keep settling damage');
      if (explosion) {
        if (bornTick < 0) bornTick = tick;
        const age = tick - bornTick;
        const expected = rows.find((r: any) => r.tick === sourceBirth.tick + age)?.bullets.find((b: any) => b.symbol === 'PetHorse4Bullet5Explode');
        assert(expected);
        assert.equal(explosion.isExpired, expected.dead); assert.equal(explosion.petHostTick, 0);
        assert.deepEqual({ x: explosion.x, y: explosion.y }, root);
        const live = images.filter(i => !i.destroyed); assert.equal(live.length, 1);
        const usage = getPetHorseEffectUsage(explosion.assetKey)!;
        assert.equal(live[0].key, usage.asset.frames[usage.hostFrameIndices![expected.frame]!]!.key);
        assert(expected.attached); states++;
        if (age === duration) break;
      }
    }
    assert(retired && bornTick > 0); assert(duration > 30, 'Source observation includes natural looping');
    scene.events.emit('shutdown'); view.destroy();
    assert(images.every(i => i.destroyed)); assert.equal(events.listenerCount('prestep'), 0);
    assert.equal(events.listenerCount('poststep'), 0); cases++;
  }
}
assert.equal(cases, 12);
console.log(`${cases} retired living-parent callbacks/${states} native display states matched actual Runtime/port/view; source loop retention and explicit world-view teardown, not full Scene proof.`);
