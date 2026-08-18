// boundary: verified monkey projectile presentation is independent of projectile
// collision/damage state; this bridge never mutates ProjectileModel.
import Phaser from 'phaser';
import {
  getPetMonkeyEffectUsages,
  isPetMonkeyProjectileAsset,
  type PetMonkeyEffectUsage,
} from '../../assets/PetMonkeyAnimationAssets';
import type { ProjectileModel } from '../../systems/ProjectileSystem';
import type { PetView } from './TestSceneViews';

type PetProjectileFrameView = Readonly<{
  image: Phaser.GameObjects.Image;
  usage: PetMonkeyEffectUsage;
}>;

type PetProjectileVisual = {
  projectileId: number;
  sourceId: string;
  facingX: -1 | 1;
  startedAt: number;
  expiresAt: number;
  frames: readonly PetProjectileFrameView[];
};

const viewsByScene = new WeakMap<Phaser.Scene, Map<number, PetProjectileVisual>>();

export function syncPetMonkeyProjectileVisuals(
  scene: Phaser.Scene,
  projectiles: readonly ProjectileModel[],
  petViews: readonly (PetView | undefined)[],
): void {
  const views = getViews(scene);
  const now = scene.time.now;
  for (const projectile of projectiles) {
    if (!isPetMonkeyProjectileAsset(projectile.assetKey) || views.has(projectile.id)) continue;
    const usages = getPetMonkeyEffectUsages(projectile.assetKey);
    if (usages.length === 0) continue;
    const durationMs = Math.max(...usages.map((usage) =>
      usage.loopsForFourSeconds
        ? 4_000
        : usage.asset.frameKeys.length * (1000 / normalizeHostFps(scene.game.loop.targetFps))));
    const frames = usages.map((usage) => ({
      usage,
      image: scene.add.image(0, 0, usage.asset.frameKeys[0]!)
        .setOrigin(usage.registrationOrigin.x, usage.registrationOrigin.y)
        .setDepth(usage.depth),
    }));
    views.set(projectile.id, {
      projectileId: projectile.id,
      sourceId: projectile.sourceId,
      facingX: projectile.facingX,
      startedAt: now,
      expiresAt: now + durationMs,
      frames,
    });
  }

  for (const [id, visual] of views) {
    if (now >= visual.expiresAt) {
      destroyVisual(visual);
      views.delete(id);
      continue;
    }
    const source = petViews.find((view) => view?.kind === 'monkey-native' && view.petId === visual.sourceId);
    const sourceX = source?.root.x ?? 0;
    const sourceY = source?.root.y ?? 0;
    const elapsed = now - visual.startedAt;
    for (const frameView of visual.frames) {
      const { usage, image } = frameView;
      const tickMs = 1000 / normalizeHostFps(scene.game.loop.targetFps);
      const frame = Math.floor(elapsed / tickMs) % usage.asset.frameKeys.length;
      image.setTexture(usage.asset.frameKeys[frame]!)
        .setPosition(
          sourceX + usage.offsetX * visual.facingX,
          sourceY + usage.offsetY,
        )
        .setFlipX(visual.facingX > 0)
        .setVisible(Boolean(source));
    }
  }
}

export function destroyPetMonkeyProjectileVisuals(scene: Phaser.Scene): void {
  const views = viewsByScene.get(scene);
  if (!views) return;
  for (const visual of views.values()) destroyVisual(visual);
  views.clear();
  viewsByScene.delete(scene);
}

function getViews(scene: Phaser.Scene): Map<number, PetProjectileVisual> {
  let views = viewsByScene.get(scene);
  if (!views) {
    views = new Map();
    viewsByScene.set(scene, views);
  }
  return views;
}

function destroyVisual(visual: PetProjectileVisual): void {
  for (const frame of visual.frames) frame.image.destroy();
}

function normalizeHostFps(value: number): number {
  if (value <= 22) return 20;
  if (value <= 27) return 24;
  return 30;
}
