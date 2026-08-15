// boundary: projects only the Role1 shadow skill projectile family owned by HeroPartyRuntime.
import Phaser from 'phaser';
import { role1SkillVisualAssets } from '../assets/AssetManifest';
import { isFormalRole1ShadowProjectile } from '../systems/Role1ShadowFormalRuntimeSystem';
import type { ProjectileModel } from '../systems/ProjectileTypes';

type ProjectileView = {
  id: number;
  image: Phaser.GameObjects.Image;
};

export type Role1ShadowProjectileVisualHandle = Readonly<{
  update: (projectiles: readonly ProjectileModel[]) => void;
  destroy: () => void;
}>;

export function createRole1ShadowProjectileVisualBridge(
  scene: Phaser.Scene,
): Role1ShadowProjectileVisualHandle {
  const views: ProjectileView[] = [];
  return {
    update: (projectiles) => {
      const active = projectiles.filter((projectile) =>
        isFormalRole1ShadowProjectile(projectile.variant) && !projectile.isExpired
      );
      for (const projectile of active) {
        if (views.some((view) => view.id === projectile.id)) continue;
        const asset = role1SkillVisualAssets[
          projectile.assetKey as keyof typeof role1SkillVisualAssets
        ];
        const firstFrame = asset?.frameKeys[0];
        if (!firstFrame || !scene.textures.exists(firstFrame)) continue;
        views.push({
          id: projectile.id,
          image: scene.add.image(projectile.x, projectile.y, firstFrame)
            .setFlipX(projectile.facingX > 0)
            .setDepth(48),
        });
      }
      for (let index = views.length - 1; index >= 0; index -= 1) {
        const view = views[index]!;
        const projectile = active.find((candidate) => candidate.id === view.id);
        if (!projectile) {
          view.image.destroy();
          views.splice(index, 1);
          continue;
        }
        const asset = role1SkillVisualAssets[
          projectile.assetKey as keyof typeof role1SkillVisualAssets
        ];
        const progress = Math.min(projectile.elapsedMs / projectile.lifetimeMs, 0.999);
        view.image
          .setPosition(projectile.x, projectile.y)
          .setTexture(asset.frameKeys[Math.floor(progress * asset.frameKeys.length)]!);
      }
    },
    destroy: () => {
      for (const view of views) view.image.destroy();
      views.length = 0;
    },
  };
}
