import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import { advanceMonsterPetTargetEffects, createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';
import { createStage11MonsterView, readStage11AttackGeometry, updateStage11MonsterView } from '../src/scenes/stage11/Stage11MonsterVisualBridge';
import { createStage12MonsterView, readStage12AttackGeometry, updateStage12MonsterView } from '../src/scenes/stage12/Stage12MonsterVisualBridge';
import { createStage13Monster5View, readStage13Monster5AttackGeometry, updateStage13Monster5View } from '../src/scenes/stage13/Stage13Monster5VisualBridge';
import { createStage21MonsterView, readStage21AttackGeometry, updateStage21MonsterView } from '../src/scenes/stage21/Stage21MonsterVisualBridge';
import { createMonster16View, readMonster16AttackGeometry, updateMonster16View } from '../src/scenes/stage22/Stage22Monster16VisualBridge';

const assets = Object.values(sceneAssetBundles).flatMap(bundle => [...bundle.assets]);
const display = () => {
  const object: any = { active: true, visible: true, depth: 18 };
  for (const method of ['setName', 'setOrigin', 'setScale', 'setPosition', 'setFrame', 'setFlipX', 'setTexture']) {
    object[method] = (...args: any[]) => { object[method + 'Args'] = args; return object; };
  }
  object.setDepth = (depth: number) => { object.depth = depth; return object; };
  object.setVisible = (visible: boolean) => { object.visible = visible; return object; };
  object.destroy = () => { object.active = false; };
  return object;
};
const scene: any = { add: { sprite: display, image: display }, textures: { exists: () => true },
  children: { moveAbove() {} }, cache: { text: { get(key: string) {
    const asset = assets.find(asset => asset.key === key);
    assert.ok(asset); return readFileSync(`public/${asset.path}`, 'utf8');
  } } } };
const cases: { id: number; create: () => any; update: (...args: any[]) => any }[] = [
  { id: 30, create: () => createStage11MonsterView(scene, 30, 0, 0, readStage11AttackGeometry(scene)), update: updateStage11MonsterView },
  { id: 7, create: () => createStage12MonsterView(scene, 7, 0, 0, readStage12AttackGeometry(scene)), update: updateStage12MonsterView },
  { id: 5, create: () => createStage13Monster5View(scene, 0, 0, readStage13Monster5AttackGeometry(scene)), update: updateStage13Monster5View },
  { id: 6, create: () => createStage21MonsterView(scene, 6, 0, 0, readStage21AttackGeometry(scene)), update: updateStage21MonsterView },
  { id: 16, create: () => createMonster16View(scene, 0, 0, readMonster16AttackGeometry(scene)), update: updateMonster16View },
];
let checked = 0;
for (const entry of cases) for (const fps of [20, 24, 30]) for (const parts of [1, 4]) {
  const view = entry.create(), reference = entry.create();
  const state = createMonsterPetTargetEffectState(() => {});
  const combat: any = { enemyType: entry.id, x: 0, y: 0, state: 'wait', phase: 'idle',
    facingX: -1, attackSerial: 0, petTargetEffectState: state };
  const referenceCombat = { ...combat, petTargetEffectState: undefined };
  // Source BaseObject.step: body first, effect after. With time=2, host steps
  // 1 and 4 advance, steps 2 and 3 do not (3 removes the ice after the body step).
  state.effects.add({ name: 'pethorse_ice', time: 2 });
  const attack = { family: Object.keys(view.geometry)[0], image: display(), frameIndex: 0,
    elapsedMs: 0, ageMs: 0, facingX: -1, followOwner: false, geometry: Object.values(view.geometry)[0] };
  view.attacks.push(attack);
  for (let tick = 1; tick <= 8; tick++) {
    for (let part = 0; part < parts; part++) {
      const delta = 1000 / fps / parts;
      advanceMonsterPetTargetEffects(state, delta, fps);
      entry.update(scene, view, combat, delta);
      // Real registry also queries completion with zero delta; it must not replay ticks.
      entry.update(scene, view, combat, 0);
    }
    if (tick === 1 || tick >= 4) entry.update(scene, reference, referenceCombat, 1000 / 30);
    assert.deepEqual(view.visual, reference.visual, `${entry.id}/${fps}/${parts}/${tick}`);
    if (tick === 2 || tick === 3) assert.ok(attack.frameIndex > 0 || !attack.image.active, 'emitted attack keeps advancing while body is frozen');
  }
  checked++;
}
// One render may cross both show and expiry. Consume every allowed host step once.
for (const entry of cases) {
  const view = entry.create(), reference = entry.create(), state = createMonsterPetTargetEffectState(() => {});
  const combat: any = { enemyType: entry.id, x: 0, y: 0, state: 'wait', phase: 'idle', facingX: -1, attackSerial: 0 };
  state.effects.add({ name: 'pethorse_ice', time: 2 });
  advanceMonsterPetTargetEffects(state, 4 * 1000 / 30, 30);
  entry.update(scene, view, { ...combat, petTargetEffectState: state }, 4 * 1000 / 30);
  entry.update(scene, reference, combat, 2 * 1000 / 30);
  assert.deepEqual(view.visual, reference.visual);
  checked++;
}
console.log(`Ice body clock: ${checked} actual five-bridge first/expiry/resume, partition and batched cases passed; emitted attacks remain independent. Canvas/full monster callback ordering excluded.`);
