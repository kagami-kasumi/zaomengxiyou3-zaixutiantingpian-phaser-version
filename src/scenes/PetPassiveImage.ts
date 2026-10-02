import type Phaser from 'phaser';

type Render = (renderer: unknown, src: Phaser.GameObjects.Image,
  camera: Phaser.Cameras.Scene2D.Camera, parent?: Phaser.GameObjects.Components.TransformMatrix) => void;

/** Native poses are aligned in world space already. Phaser's local-coordinate
 * flooring would round a fractional child offset before its parent transform. */
export function createPetPassiveImage(scene: Phaser.Scene, key: string) {
  const image = scene.add.image(0, 0, key).setOrigin(0, 0);
  const target = image as unknown as { renderCanvas: Render; renderWebGL: Render };
  for (const method of ['renderCanvas', 'renderWebGL'] as const) {
    const render = target[method];
    target[method] = function (renderer, src, camera, parent) {
      const roundPixels = camera.roundPixels;
      camera.roundPixels = false;
      try { render.call(image, renderer, src, camera, parent); }
      finally { camera.roundPixels = roundPixels; }
    };
  }
  return image;
}
