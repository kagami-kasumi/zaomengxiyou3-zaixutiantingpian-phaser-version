/** Source successful-hit boundary with actual world timer/emitter/view; collision and GPU excluded. */
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createTestPetProjectileCombatBridge } from './pet-projectile-bridge-fixture';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import { emitHorseAoyi } from '../src/systems/PetHorseAoyiProjectiles';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import type { MonkeyHorsePrivateProjectile } from '../src/systems/PetMonkeyHorsePrivateProjectile';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

let cases = 0, states = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/horse-explosion-world-pause/measurement-${fps}.json`, 'utf8'));
  for (const owner of [1, 2]) for (const skills of [5, 7])
  for (const mode of ['alive', 'dead-before', 'dead-after', 'ready-only', 'move-reference']) {
    const id = `4-hit5-P${owner}-${skills}-${mode}`;
    const rows = native.rows.filter((r: any) => r.id === id && r.phase === 'exit');
    const born = rows.find((r: any) => r.bullets.some((b: any) => b.symbol === 'PetHorse4Bullet5Explode'));
    const atHit = rows.find((r: any) => r.tick === 6).bullets.find((b: any) => b.symbol === 'PetHorse4Bullet5');
    const images: any[] = [], events = new EventEmitter();
    const scene: any = { events: new EventEmitter(), game: { events, loop: { targetFps: fps, now: 0 } }, add: { image(x: number, y: number, key: string) {
      const image: any = { x, y, key, destroyed: false };
      image.setTexture = (key: string) => { image.key = key; return image; };
      image.setPosition = (x: number, y: number) => { image.x = x; image.y = y; return image; };
      for (const method of ['setOrigin', 'setFlipX', 'setScale', 'setDepth']) image[method] = () => image;
      image.destroy = () => { image.destroyed = true; };
      images.push(image); return image;
    } } };
    const createPort = createTestPetProjectileCombatBridge(scene);
    const port = createPort({ enemies: [], combat: {} as any, ownerSlot: owner === 1 ? 'p1' : 'p2', timeMs: 0, random: () => 0.75 });
    const view = createFormalPetHorseBodyBridge(scene);
    const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === 4)!;
    pet.skills = skills === 5 ? ['tmaoyi', 'bd', 'bz'] : ['tmaoyi', 'bd', 'sp', 'bz']; pet.hp = 100;
    const runtime = { x: owner === 1 ? 300 : 640, y: 350, facingX: 1 as const };
    const projectiles = createProjectileSystem(), entries: MonkeyHorsePrivateProjectile[] = [];
    const context = { pet, runtime, hostFps: fps, actionToken: 1, isGxp: false, random: () => 0.75,
      targets: [{ id: 'target', x: 600, y: 350, isAlive: true }],
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { ...port, monstersInParentSpace: () => [{ id: 'target', x: 600, y: 350, isAlive: true }] },
    } as unknown as PetBehaviorContext;
    emitHorseAoyi(context, entry => entries.push(entry));
    const falling = entries[0]!.projectile;
    falling.x = atHit.x; falling.y = atHit.y;
    if (mode === 'dead-before') pet.hp = 0;
    entries[0]!.onAccepted!(context); falling.isExpired = true;
    view.update([], projectiles.projectiles, 0);
    if (mode === 'dead-after') pet.hp = 0;
    if (mode === 'ready-only') pet.isActive = false;
    if (mode === 'move-reference') { falling.x += 23; falling.y += 11; }
    const duration = born ? native.pauseEnd - born.tick : 35;
    for (let tick = 1; tick <= fps + duration; tick++) {
      scene.game.loop.now = tick * 1000 / fps;
      events.emit('prestep', scene.game.loop.now, 1000 / fps);
      // Ordinary Scene pause: neither private step nor view.update runs.
      events.emit('poststep', scene.game.loop.now, 1000 / fps);
      if (tick < fps) { assert.equal(images.length, 0); continue; }
      assert.equal(images.length, born ? 1 : 0, `Paused callback must immediately create the source-visible effect: ${fps}/${id}`);
      if (born) {
        const expected = rows.find((r: any) => r.tick === born.tick + tick - fps).bullets.find((b: any) => b.symbol === 'PetHorse4Bullet5Explode');
        const p = projectiles.projectiles.find(p => p.sourceSymbol === 'PetHorse4Bullet5Explode')!;
        assert.equal(p.petHostTick, 0); assert.equal(p.isExpired, expected.dead);
        const usage = getPetHorseEffectUsage(p.assetKey)!;
        const frameIndex = usage.hostFrameIndices?.[expected.frame] ?? expected.frame - 1;
        assert.equal(images[0].key, usage.asset.frames[frameIndex]!.key, `Native paused frame: ${fps}/${id}/modern${tick}/source${born.tick + tick - fps}`);
        assert.deepEqual([images[0].x, images[0].y], [expected.x, expected.y]);
      }
      states++;
    }
    view.destroy(); createPort.destroy();
    assert.equal(events.listenerCount('prestep'), 0); assert.equal(events.listenerCount('poststep'), 0);
    cases++;
  }
}
assert.equal(cases, 60);
console.log(`${cases} original delayed callback cases/${states} paused-birth display states matched actual Game timer/emitter/shared view; explicit hit boundary, no GPU/collision claim.`);
