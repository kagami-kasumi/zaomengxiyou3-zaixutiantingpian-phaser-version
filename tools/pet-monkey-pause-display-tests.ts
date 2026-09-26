import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createFormalPetMonkeyBodyBridge } from '../src/scenes/FormalPetMonkeyBodyBridge';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { getPetMonkeyEffectUsages } from '../src/assets/PetMonkeyAnimationAssets';
import { requireRuntimeAssetOwner } from '../src/systems/AssetBundleCoordinator';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';
import { assertNativeImageQuad } from './pet-native-image-quad';
import { monkeyWorldPauseVariants } from './pet-monkey-world-pause-fixture';

const rasters = new Map<string, { sha256: string; width: number; height: number }>();
function raster(path: string) {
  let result = rasters.get(path);
  if (!result) {
    const bytes = readFileSync(`public/${path}`);
    result = { sha256: createHash('sha256').update(bytes).digest('hex'), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    rasters.set(path, result);
  }
  return result;
}
let checked = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/monkey-world-pause-air/measurement-${fps}.json`, 'utf8'));
  for (const [form, skill] of monkeyWorldPauseVariants) for (const owner of ['P1', 'P2'])
  for (const direction of [0, 1]) for (const mode of ['natural', 'pause']) {
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
    const start = native.rows.find((r: any) => r.tick === 1 && r.id.endsWith(`-${owner}-${direction}-${mode}`)).source;
    const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'monkey' && p.form === form)!;
    const runtime = { x: start.x, y: start.y, rootScaleX: start.a, facingX: direction === 0 ? -1 : 1 };
    const manager = new PetMonkeyHorseProjectileSystem(), projectiles = createProjectileSystem();
    const clock = createPetWorldDisplayBridge(scene), view = createFormalPetMonkeyBodyBridge(scene);
    const target = { id: 'target', x: 0, y: 0, isAlive: true };
    const context = { pet, runtime, hostFps: fps, actionToken: 1, random: () => 0.75, isGxp: false,
      targets: [target], animation: { action: 'wait' }, emit: () => {}, protectFromHits: () => {},
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { ...noTargetBodyFixturePort, displayTick: clock.readTick },
    } as unknown as PetBehaviorContext;
    if (skill === 'normal') manager.emit(context, target); else manager.emitMonkeySkill(context, skill, target);
    const tracks = projectiles.projectiles.map(p => {
      const id = `${p.sourceSymbol}-${owner}-${direction}-${mode}`;
      const enters = native.rows.filter((r: any) => r.id === id), exits = native.exitRows.filter((r: any) => r.id === id);
      const usage = getPetMonkeyEffectUsages(p.assetKey).find(u => u.asset.symbol === p.sourceSymbol)!;
      assert.equal(exits.length, 280);
      for (const frame of usage.nativeDisplay.frames) assert.equal(requireRuntimeAssetOwner(frame.key), 'pet-monkey-horse');
      return { p, enters, exits, usage, x: p.x, y: p.y };
    });
    view.update([], projectiles.projectiles, 0);
    assert.equal(images.length, tracks.length);
    for (let index = 0; index < 280; index++) {
      const row = tracks[0]!.enters[index];
      events.emit('prestep', row.tick * 1000 / fps, 1000 / fps);
      Object.assign(runtime, { x: row.source.x, y: row.source.y, rootScaleX: row.source.a });
      if (!row.paused) { manager.step(context); view.update([], projectiles.projectiles, row.tick * 1000 / fps); }
      events.emit('poststep', row.tick * 1000 / fps, 1000 / fps);
      for (const [n, track] of tracks.entries()) {
        const exit = track.exits[index], image = images[n];
        const label = `${fps}/${form}/${skill}/${owner}/${direction}/${mode}/${row.tick}/${track.p.sourceSymbol}`;
        assert.equal(image.destroyed, exit.state.dead, label);
        if (!exit.state.dead) {
          const original = native.nativePhases[`${track.p.sourceSymbol}|exit|${JSON.stringify(exit.state.phaseFrames)}`];
          assert.ok(original, 'Original EXIT_FRAME raster is required');
          const frame = track.usage.nativeDisplay.frames.find(f => f.key === image.key);
          assert.ok(frame, `Native frame required: ${label}`);
          const actual = raster(frame.path);
          assert.equal(actual.sha256, original.sha256, `Native post-construction raster: ${label}`);
          assert.deepEqual([image.x - track.x, image.y - track.y],
            [exit.state.x - track.enters[0].before.x, exit.state.y - track.enters[0].before.y], label);
          assertNativeImageQuad(image, actual.width, actual.height, { left: original.left, top: original.top }, exit.state.a);
        }
        checked++;
      }
    }
    view.destroy(); manager.destroy(); clock.destroy();
    assert.equal(events.listenerCount('poststep'), 0); assert.equal(events.listenerCount('prestep'), 0);
  }
}
assert.equal(checked, 107520);
console.log(`${checked} monkey native EXIT states matched by private owner, Game clock and shared view: raster, motion, Phaser vertices and cleanup. GPU/canvas composition excluded.`);
