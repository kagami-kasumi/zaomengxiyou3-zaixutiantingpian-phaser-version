import type Phaser from 'phaser';
import { createMonster2RawDisplayBridge } from '../src/scenes/Monster2RawDisplayBridge';
import { saveTransparentRenderTexture } from './monster2-visual-browser-probe';

export type Monster2RawVisualPose = Readonly<{
  attack: 3;
  frame: number;
  sign: 1 | -1;
  image: Readonly<{
    key: string; x: number; y: number; originX: number; originY: number;
    flipX: boolean; scaleX: number; scaleY: number; visible: boolean;
  }>;
  transparentRenderPng: string;
}>;

export type Monster2RawVisualReport = Readonly<{
  root: Readonly<{ x: number; y: number }>;
  states: readonly Monster2RawVisualPose[];
  frame14Exit: Readonly<{ inactive: boolean; snapshot: readonly unknown[] }>;
}>;

export async function captureMonster2RawDisplay(
  scene: Phaser.Scene,
  root: Readonly<{ x: number; y: number }> = { x: 470, y: 295 },
  targetFps = scene.game.loop.targetFps,
): Promise<Monster2RawVisualReport> {
  const states: Monster2RawVisualPose[] = [];
  let frame14Exit: { inactive: boolean; snapshot: readonly unknown[] } | undefined;
  for (const sign of [1, -1] as const) {
    const bridge = createMonster2RawDisplayBridge(scene);
    const before = new Set(scene.children.list);
    bridge.emit({ id: `monster2-raw-probe:${sign}`, parentId: `probe:${sign}`, ...root,
      facingX: sign === 1 ? -1 : 1 });
    const image = scene.children.list.find((child) => !before.has(child) && child.name === 'Monster2Bullet2') as Phaser.GameObjects.Image | undefined;
    if (!image) { bridge.destroy(); throw new Error(`Monster2 raw probe did not create sign ${sign} image`); }
    try {
      for (let frame = 1; frame <= 14; frame += 1) {
        scene.game.events.emit('prestep', frame * 1000 / targetFps, 1000 / targetFps);
        const transparentRenderPng = await saveTransparentRenderTexture(scene, image);
        states.push({ attack: 3, frame, sign, image: {
          key: image.texture.key, x: image.x, y: image.y, originX: image.originX, originY: image.originY,
          flipX: image.flipX, scaleX: image.scaleX, scaleY: image.scaleY, visible: image.visible,
        }, transparentRenderPng });
        scene.game.events.emit('poststep', frame * 1000 / targetFps, 1000 / targetFps);
      }
      const snapshot = bridge.snapshot();
      frame14Exit = { inactive: !image.active, snapshot };
      if (image.active || snapshot.length !== 0) throw new Error(`Monster2 raw EXIT did not remove sign ${sign}`);
    } finally {
      bridge.destroy();
      bridge.destroy();
    }
  }
  if (!frame14Exit) throw new Error('Monster2 raw probe captured no EXIT state');
  return { root, states, frame14Exit };
}
