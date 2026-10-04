import type Phaser from 'phaser';
import { ensureSceneAssetBundle } from '../src/scenes/SceneAssetBundleBridge';
import { createMonster3AttackRuntime } from '../src/systems/Monster3AttackRuntime';
import { syncMonster3AttackViews, destroyMonster3AttackViews } from '../src/scenes/stage11/Monster3AttackView';

/** Isolated renderer acceptance inside a real loaded Scene; no combat-state claim. */
export async function captureMonster3Projection(scene: Phaser.Scene,
  pose: { action: 'hit1' | 'hit2'; frame: number; facingX: -1 | 1; x: number; y: number; background?: number }) {
  await ensureSceneAssetBundle(scene, 'monster-family-3-30');
  const runtime = createMonster3AttackRuntime();
  runtime.attacks.push({ ...pose, id: 'visual-probe', age: pose.frame,
    reception: { prefix: 'visual-probe:', serial: 1, count: 0, interval: 999, remaining: 99 } });
  const before = JSON.stringify(runtime), views = new Map<string, Phaser.GameObjects.Image>();
  const surface = scene.make.renderTexture({ x: 0, y: 0, width: 940, height: 590, add: false });
  try {
    syncMonster3AttackViews(scene, views, runtime);
    const view = views.get('visual-probe')!;
    for (let i = 0; i < 3; i++) syncMonster3AttackViews(scene, views, runtime);
    if (JSON.stringify(runtime) !== before || views.get('visual-probe') !== view) throw new Error('Projection mutated runtime or duplicated display');
    surface.clear(); if(pose.background!==undefined)surface.fill(pose.background,1); surface.draw(view);
    const png = await new Promise<string>((resolve, reject) => surface.snapshot(result => {
      if (result instanceof HTMLImageElement) resolve(result.src); else reject(new Error('Renderer did not return an image'));
    }));
    return { png, actual: { x: view.x, y: view.y, originX: view.originX, originY: view.originY,
      flipX: view.flipX, alpha: view.alpha, width: view.width, height: view.height, key: view.texture.key,
      renderer: scene.game.renderer.type } };
  } finally { surface.destroy(); destroyMonster3AttackViews(views); }
}
