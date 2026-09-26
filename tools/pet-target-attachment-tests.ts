import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';
import { syncMonsterPetFireView, destroyMonsterPetFireView } from '../src/scenes/MonsterPetFireView';
import { syncMonsterPetIceView, destroyMonsterPetIceView } from '../src/scenes/MonsterPetIceView';

const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/attachment-native.json', 'utf8'));
let checked = 0;
for (const order of [['fire', 'ice'], ['ice', 'fire']]) {
  const list: any[] = [], identities = new Map<number, any>();
  const create = () => {
    const object: any = { visible: true, depth: 18 };
    for (const method of ['setOrigin', 'setDepth', 'setVisible', 'setPosition', 'setTexture', 'setScale']) {
      object[method] = () => object;
    }
    object.setName = (name: string) => { object.name = name; return object; };
    object.destroy = () => { list.splice(list.indexOf(object), 1); };
    list.push(object); return object;
  };
  const view: any = { sprite: create().setName('body') };
  const scene: any = { add: { image: create }, textures: { exists: () => true },
    events: new EventEmitter(), game: { events: new EventEmitter(), loop: { time: 0, targetFps: 30 } },
    children: { moveAbove(object: any, anchor: any) {
      list.splice(list.indexOf(object), 1); list.splice(list.indexOf(anchor) + 1, 0, object);
    } } };
  const state = createMonsterPetTargetEffectState(() => {});
  const target = { x: 0, y: 0, petTargetEffectState: state };
  const add = (kind: string, time = 200) => state.effects.add({ name: kind === 'fire' ? 'petmonkey_fire' : 'pethorse_ice', time, hurt: 1 });
  const check = (suffix: string) => {
    syncMonsterPetFireView(scene, view, target);
    syncMonsterPetIceView(scene, view, target, 30);
    const row = native.rows.find((row: any) => row.label === `${order.join('-')}-${suffix}`);
    assert.ok(row);
    const actual = list.filter(object => object !== view.sprite);
    assert.deepEqual(actual.map(object => object.name), row.children.map((child: any) => child.name));
    row.children.forEach((child: any, index: number) => {
      if (identities.has(child.id)) assert.equal(actual[index], identities.get(child.id));
      else {
        assert.ok(![...identities.values()].includes(actual[index]), 'source new identity requires new display object');
        identities.set(child.id, actual[index]);
      }
    });
    checked++;
  };
  for (const kind of order) add(kind);
  state.effects.step(); check('initial');
  add('fire'); add('ice'); state.effects.step(); check('repeat');
  // Expire and re-add without an intervening render, preserving the other clip.
  add('fire', 0); state.effects.step(); add('fire'); state.effects.step(); check('fire-readd');
  add('ice', 0); state.effects.step(); add('ice'); state.effects.step(); check('ice-readd');
  destroyMonsterPetFireView(view); destroyMonsterPetIceView(view);
  assert.equal(scene.game.events.listenerCount('poststep'), 0);
  assert.equal(list.length, 1);
}
console.log(`${checked} native attachment identity/order states matched by actual fire/ice view consumers; mixed-effect pixels excluded.`);
