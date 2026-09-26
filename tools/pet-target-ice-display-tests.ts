import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getPetHorseIceTransform, petHorseIceAsset } from '../src/assets/PetHorseIceAsset';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import { syncMonsterPetIceView, destroyMonsterPetIceView } from '../src/scenes/MonsterPetIceView';
import { createMonsterPetTargetEffectState } from '../src/systems/MonsterPetTargetEffectSystem';

const bytes = readFileSync(`public/${petHorseIceAsset.path}`);
assert.equal(createHash('sha256').update(bytes).digest('hex'), petHorseIceAsset.sha256);
assert.equal(bytes.readUInt32BE(16), petHorseIceAsset.width);
assert.equal(bytes.readUInt32BE(20), petHorseIceAsset.height);
assert.ok(sceneAssetBundles['pet-monkey-horse'].assets.some(asset => asset.key === petHorseIceAsset.key));
let matrices = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-229/ice-air/measurement-${fps}.json`, 'utf8'));
  for (const row of native.rows) for (const slot of ['p1', 'p2']) {
    const target = row[slot];
    if (!target.matrix) continue;
    const actual = getPetHorseIceTransform(target.colipseWidth, target.colipseHeight);
    assert.equal(actual.scaleX, target.matrix.a, `${row.id}/${row.tick}/${slot}/a`);
    assert.equal(actual.scaleY, target.matrix.d, `${row.id}/${row.tick}/${slot}/d`);
    assert.equal(target.matrix.tx, 0); assert.equal(target.matrix.ty, 0);
    assert.equal(-actual.originX * petHorseIceAsset.width, petHorseIceAsset.crop.left);
    assert.equal(-actual.originY * petHorseIceAsset.height, petHorseIceAsset.crop.top);
    matrices++;
  }
}
assert.ok(matrices > 10000);
const images: any[] = [], order: any[] = [];
const scene: any = {
  textures: { exists: (key: string) => key === petHorseIceAsset.key },
  children: { moveAbove: (ice: any, body: any) => order.push([ice, body]) },
  add: { image(x: number, y: number, key: string) {
    const image: any = { x, y, key, destroyed: false };
    for (const method of ['setName', 'setOrigin', 'setScale', 'setDepth', 'setPosition', 'setVisible']) {
      image[method] = (...args: any[]) => { image[method + 'Args'] = args; return image; };
    }
    image.destroy = () => { assert.equal(image.destroyed, false); image.destroyed = true; };
    images.push(image); return image;
  } },
};
const targets = [0, 1].map(index => ({ x: 100 + index * 300, y: 200,
  petTargetEffectState: createMonsterPetTargetEffectState(() => {}) }));
const views: any[] = targets.map(() => ({ sprite: { depth: 18, visible: true } }));
targets[0]!.petTargetEffectState.effects.add({ name: 'pethorse_ice', time: 2 });
syncMonsterPetIceView(scene, views[0], targets[0]!, 30);
assert.equal(images.length, 0, 'add alone must not display ice before the first target host step');
targets[0]!.petTargetEffectState.effects.step();
syncMonsterPetIceView(scene, views[0], targets[0]!, 30);
syncMonsterPetIceView(scene, views[1], targets[1]!, 30);
assert.equal(images.length, 1); assert.equal(views[1].ice, undefined);
assert.equal(images[0].key, petHorseIceAsset.key);
assert.deepEqual(images[0].setScaleArgs,
  [Math.trunc(114 / 74.9 * 65536) / 65536, Math.trunc(42 / 136.55 * 65536) / 65536]);
assert.deepEqual(order, [[images[0], views[0].sprite]]);
targets[0]!.x = 333; views[0].sprite.visible = false;
syncMonsterPetIceView(scene, views[0], targets[0]!, 30);
assert.equal(images.length, 1, 'target motion does not recreate the attachment');
assert.deepEqual(images[0].setPositionArgs, [333, 200]);
assert.deepEqual(images[0].setVisibleArgs, [false]);
targets[0]!.petTargetEffectState.effects.cancel();
syncMonsterPetIceView(scene, views[0], targets[0]!, 30);
assert.equal(images[0].destroyed, true); assert.equal(views[0].ice, undefined);
targets[0]!.petTargetEffectState.effects.add({ name: 'pethorse_ice', time: 2 });
targets[0]!.petTargetEffectState.effects.step();
syncMonsterPetIceView(scene, views[0], targets[0]!, 30);
assert.equal(images.length, 2);
destroyMonsterPetIceView(views[0]); destroyMonsterPetIceView(views[0]);
assert.equal(images[1].destroyed, true);
console.log(`Horse ice raster, ${matrices} native attachment matrices and target view ownership/cleanup passed; canvas/body freezing excluded.`);
