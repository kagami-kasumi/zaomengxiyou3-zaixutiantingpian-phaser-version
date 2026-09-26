import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import { requireRuntimeAssetOwner } from '../src/systems/AssetBundleCoordinator';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';
import { assertNativeImageQuad } from './pet-native-image-quad';

const rasterCache = new Map<string, { sha256: string; width: number; height: number }>();
function raster(path: string) {
  let entry = rasterCache.get(path);
  if (!entry) {
    const bytes = readFileSync(`public/${path}`);
    entry = { sha256: createHash('sha256').update(bytes).digest('hex'), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    rasterCache.set(path, entry);
  }
  return entry;
}
let checked = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/horse-world-pause-air-long/measurement-${fps}.json`, 'utf8'));
  for (const form of [3, 4]) for (const owner of ['P1', 'P2']) for (const direction of [0, 1]) for (const mode of ['natural', 'pause']) {
    const id = `PetHorse3Bullet3_special-${owner}-${direction}-${mode}`;
    const enters = native.rows.filter((r: any) => r.id === id), exits = native.exitRows.filter((r: any) => r.id === id);
    assert.equal(exits.length, 192);
    const images: any[] = [], events = new EventEmitter();
    const scene: any = { game: { events, loop: { targetFps: fps } }, add: { image(x: number, y: number, key: string) {
      const image: any = { x, y, key, destroyed: false };
      image.setTexture = (key: string) => { image.key = key; return image; };
      image.setOrigin = (x: number, y: number) => { image.origin = { x, y }; return image; };
      image.setPosition = (x: number, y: number) => { image.x = x; image.y = y; return image; };
      image.setDepth = () => image;
      image.setFlipX = (flip: boolean) => { image.flip = flip; return image; };
      image.setScale = (x: number, y: number) => { image.scaleX = x; image.scaleY = y; return image; };
      image.destroy = () => { image.destroyed = true; };
      images.push(image); return image;
    } } };
    const clock = createPetWorldDisplayBridge(scene), view = createFormalPetHorseBodyBridge(scene);
    const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === form)!;
    const runtime = { x: enters[0].source.x, y: enters[0].source.y, rootScaleX: enters[0].source.a, facingX: direction === 0 ? -1 : 1 };
    const manager = new PetMonkeyHorseProjectileSystem(), projectiles = createProjectileSystem();
    const target = { id: 'target', x: 0, y: 0, isAlive: true };
    const context = { pet, runtime, hostFps: fps, actionToken: 1, random: () => 0.75, isGxp: false,
      targets: [target], animation: { action: 'wait' }, emit: () => {}, protectFromHits: () => {},
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { ...noTargetBodyFixturePort, displayTick: clock.readTick },
    } as unknown as PetBehaviorContext;
    manager.emitHorseSkill(context, 'sp', target);
    const p = projectiles.projectiles[0]!, usage = getPetHorseEffectUsage(p.assetKey)!;
    for (const frame of usage.asset.frames) assert.equal(requireRuntimeAssetOwner(frame.key), 'pet-monkey-horse');
    view.update([], [p], 0);
    for (let index = 0; index < enters.length; index++) {
      const row = enters[index], exit = exits[index];
      events.emit('prestep', row.tick * 1000 / fps, 1000 / fps);
      Object.assign(runtime, { x: row.source.x, y: row.source.y, rootScaleX: row.source.a });
      if (!row.paused) { manager.step(context); view.update([], [p], row.tick * 1000 / fps); }
      events.emit('poststep', row.tick * 1000 / fps, 1000 / fps);
      assert.equal(images[0].destroyed, exit.state.dead, `${fps}/${form}/${id}/${row.tick}`);
      if (!exit.state.dead) {
        const original = native.nativePhases[`PetHorse3Bullet3|${JSON.stringify(exit.state.phaseFrames)}`];
        assert.ok(original, 'Original EXIT_FRAME raster is required');
        const actual = raster(usage.asset.frames.find(frame => frame.key === images[0].key)!.path);
        assert.equal(actual.sha256, original.sha256, `post-construction pixels/${fps}/${form}/${id}/${row.tick}`);
        assert.deepEqual(images[0].origin, { x: -original.left / actual.width, y: -original.top / actual.height });
        assertNativeImageQuad(images[0], actual.width, actual.height, { left: original.left, top: original.top }, exit.state.a);
      }
      checked++;
    }
    view.destroy(); manager.destroy(); clock.destroy();
    assert.equal(events.listenerCount('poststep'), 0); assert.equal(events.listenerCount('prestep'), 0);
  }
}
console.log(`${checked} native EXIT_FRAME states matched by horse3/4 SP private owner, Game display clock and shared view; exact raster, origin, flip and cleanup. Canvas composition excluded.`);
