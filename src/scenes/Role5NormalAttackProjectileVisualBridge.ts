// boundary: adapts shared Role5 normal-attack projectile models to Phaser images only.
import Phaser from 'phaser';
import { role5NormalAttackAssets } from '../assets/AssetManifest';
import type { ProjectileModel } from '../systems/ProjectileTypes';
import { projectNormalAttackOriginX } from './HeroCombatVisualCoordinates';

type ProjectileView = {
  id: number;
  image: Phaser.GameObjects.Image;
};

export type Role5NormalAttackProjectileVisualHandle = Readonly<{
  update: (projectiles: readonly ProjectileModel[]) => void;
  destroy: () => void;
}>;

export function createRole5NormalAttackProjectileVisualBridge(
  scene: Phaser.Scene,
): Role5NormalAttackProjectileVisualHandle {
  const views: ProjectileView[] = [];
  return {
    update: (projectiles) => {
      const active = projectiles.filter((projectile) =>
        projectile.variant.startsWith('role5-loong-sword-') && !projectile.isExpired
      );
      for (const projectile of active) {
        if (views.some((view) => view.id === projectile.id)) continue;
        const asset = role5NormalAttackAssets[
          projectile.assetKey as keyof typeof role5NormalAttackAssets
        ];
        if (!asset) continue;
        const flipX = projectile.facingX < 0;
        views.push({
          id: projectile.id,
          image: scene.add.image(projectile.x, projectile.y, asset.frameKeys[0]!)
            .setFlipX(flipX)
            .setOrigin(
              projectNormalAttackOriginX(asset.registrationOrigin.x, flipX),
              asset.registrationOrigin.y,
            )
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
        const asset = role5NormalAttackAssets[
          projectile.assetKey as keyof typeof role5NormalAttackAssets
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
