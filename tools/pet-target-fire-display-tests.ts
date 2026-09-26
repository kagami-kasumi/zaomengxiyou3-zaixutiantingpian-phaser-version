import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import fire from '../src/assets/pet-monkey-target-fire.json';
import { createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';
import { syncMonsterPetFireView, destroyMonsterPetFireView } from '../src/scenes/MonsterPetFireView';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/fire-pause-native.json', 'utf8'));
let checked = 0;
for (const fps of [20, 24, 30]) {
  const events = new EventEmitter(), sceneEvents = new EventEmitter();
  const images: any[] = [];
  const scene: any = { game: { events, loop: { time: 0, targetFps: fps } }, events: sceneEvents,
    textures: { exists: () => true }, children: { moveAbove() {} }, add: { image(x: number, y: number, key: string) {
      const image: any = { key, destroyed: false, x, y };
      for (const method of ['setName', 'setOrigin', 'setDepth', 'setVisible']) image[method] = (...args: unknown[]) => { image[method + 'Args'] = args; return image; };
      image.setPosition = (x: number, y: number) => { image.x = x; image.y = y; return image; };
      image.setTexture = (key: string) => { image.key = key; return image; };
      image.destroy = () => { image.destroyed = true; };
      images.push(image); return image;
    } } };
  const state = createMonsterPetTargetEffectState(() => {});
  let target = { x: 100, y: 200, petTargetEffectState: state };
  const view: any = { sprite: { depth: 18, visible: true } };
  state.effects.add({ name: 'petmonkey_fire', time: 200, hurt: 1 });
  syncMonsterPetFireView(scene, view, target);
  assert.equal(images.length, 0);
  state.effects.step(fps);
  syncMonsterPetFireView(scene, view, target);
  assert.equal(events.listenerCount('poststep'), 1);
  for (const row of native.rows.filter((row: any) => row.fps === fps)) {
    // Source ordinary pause skips world/effect stepping; global frames continue.
    events.emit('poststep', (row.tick - 1) * 1000 / fps);
    assert.equal(images[0].key, fire.frames[row.target - 1]!.key);
    if (row.tick === 6) {
      state.effects.add({ name: 'petmonkey_fire', time: 500, hurt: 999 });
      target = { ...target, x: 333 };
      syncMonsterPetFireView(scene, view, target);
    }
    if (row.tick >= 7) assert.equal(images[0].x, 333, 'fresh wrapper replaces followed target');
    checked++;
  }
  assert.equal(images.length, 1, 'refresh does not restart native clip');
  state.effects.destroy();
  events.emit('poststep', 14 * 1000 / fps);
  assert.equal(images[0].destroyed, false, 'source effect destroy leaves target display attached');
  destroyMonsterPetFireView(view); destroyMonsterPetFireView(view);
  assert.equal(events.listenerCount('poststep'), 0);
  assert.equal(sceneEvents.listenerCount('shutdown'), 0);
  assert.equal(images[0].destroyed, true);
  const next = createMonsterPetTargetEffectState(() => {});
  next.effects.add({ name: 'petmonkey_fire', time: 200, hurt: 1 }); next.effects.step(fps);
  syncMonsterPetFireView(scene, view, { ...target, petTargetEffectState: next });
  next.effects.cancel();
  events.emit('poststep', 15 * 1000 / fps);
  assert.equal(images[1].destroyed, true, 'normal cancellation hides target fire');
  assert.equal(events.listenerCount('poststep'), 0);
  next.effects.add({ name: 'petmonkey_fire', time: 200, hurt: 1 }); next.effects.step(fps);
  syncMonsterPetFireView(scene, view, { ...target, petTargetEffectState: next });
  assert.equal(images[2].key, fire.frames[0]!.key, 're-add starts a new clip');
  sceneEvents.emit('shutdown');
  assert.equal(events.listenerCount('poststep'), 0);
  assert.equal(images[2].destroyed, true);
}
console.log(`${checked} native FireBuff pause frames matched; refresh, wrapper follow, direct effect destruction and scene cleanup passed. Canvas/layer combinations excluded.`);
