import type Phaser from 'phaser';
import type { PetTurtleAssets } from '../assets/PetTurtleAssets';
import type { TurtlePoint } from '../assets/PetTurtleAssetTypes';
import { renderTurtleState } from '../assets/PetTurtleProjection';

let nextPresentation = 0;
/** Stateless snapshot projection; runtime owns selection, time, and release. */
export function createPetTurtlePresentationBridge(scene: Phaser.Scene, assets: PetTurtleAssets) {
  const key = `pet-turtle-presentation:${++nextPresentation}`;
  const texture = scene.textures.createCanvas(key, 940, 590);
  if (!texture) throw new Error('Cannot allocate turtle presentation canvas');
  const image = scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(42).setScrollFactor(0);
  image.setName(key);
  let disposed = false;
  const destroy = () => {
    if (disposed) return;
    disposed = true; image.destroy(); scene.textures.remove(key);
    scene.events.off('shutdown', destroy);
  };
  scene.events.once('shutdown', destroy);
  return {
    update(stateId: string, owners: Readonly<Record<string, TurtlePoint>> = {}, viewport: TurtlePoint = { x: 0, y: 0 }) {
      if (disposed) throw new Error('Turtle presenter is released');
      const rgba = renderTurtleState(assets, assets.state(stateId), owners, 940, 590, viewport);
      const data = texture.context.createImageData(940, 590); data.data.set(rgba);
      texture.context.putImageData(data, 0, 0); texture.refresh();
      image.setData('turtleStateId', stateId);
      return rgba;
    },
    destroy,
  };
}
