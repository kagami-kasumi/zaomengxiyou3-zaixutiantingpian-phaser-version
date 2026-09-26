import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/aoyi-world-pause-native.json', 'utf8'));
let checked = 0;
for (const report of native.reports) for (const owner of ['P1', 'P2']) for (const mode of ['natural', 'pause']) {
  const events = new EventEmitter(), images: any[] = [];
  const scene: any = { game: { events, loop: { targetFps: report.fps } }, add: { image(x: number, y: number, key: string) {
    const image: any = { x, y, key, destroyed: false };
    for (const method of ['setOrigin', 'setDepth', 'setFlipX', 'setScale']) image[method] = () => image;
    image.setTexture = (key: string) => { image.key = key; return image; };
    image.setPosition = (x: number, y: number) => { image.x = x; image.y = y; return image; };
    image.destroy = () => { image.destroyed = true; };
    images.push(image); return image;
  } } };
  const clock = createPetWorldDisplayBridge(scene), view = createFormalPetHorseBodyBridge(scene);
  const manager = new PetMonkeyHorseProjectileSystem(), projectiles = createProjectileSystem();
  const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === 4)!;
  const rows = report.rows.filter((r: any) => r.id === `AoyiBuff_follow-${owner}-0-${mode}`);
  const runtime = { x: rows[0].source.x, y: rows[0].source.y, rootScaleX: rows[0].source.a, facingX: -1 as const };
  const context = { pet, runtime, hostFps: report.fps, actionToken: 1, targets: [], animation: { action: 'wait' }, emit: () => {},
    castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
    projectileCombat: { displayTick: clock.readTick, monkeyHorseCollision: () => ({ fieldAt() { throw new Error('Disabled effect'); } }) },
  } as unknown as PetBehaviorContext;
  manager.emitHorseAoyiPrelude(context);
  const p = projectiles.projectiles[0]!, usage = getPetHorseEffectUsage(p.assetKey)!;
  view.update([], projectiles.projectiles, 0);
  for (const row of rows) {
    const time = row.tick * 1000 / report.fps;
    events.emit('prestep', time, 1000 / report.fps);
    runtime.x = row.source.x; runtime.y = row.source.y; runtime.rootScaleX = row.source.a;
    if (!row.paused) {
      manager.step(context);
      view.update([], projectiles.projectiles, time);
    }
    events.emit('poststep', time, 1000 / report.fps);
    assert.equal(p.isExpired, row.state.dead, `${report.fps}/${report.pauseEnd}/${owner}/${mode}/${row.tick}`);
    assert.equal(images[0].destroyed, row.state.dead);
    if (!row.state.dead) {
      assert.equal(p.petNativeFrame!(), row.state.frame);
      assert.equal(images[0].key, usage.asset.frames[row.state.frame - 1]!.key);
    }
    checked++;
  }
  view.destroy(); manager.destroy(); clock.destroy();
  assert.equal(events.listenerCount('prestep'), 0); assert.equal(events.listenerCount('poststep'), 0);
}
console.log(`${checked} original states matched by actual world display clock, private AoyiBuff owner and formal horse view across pause/resume; canvas/full Scene excluded.`);
