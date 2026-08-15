import Phaser from 'phaser';
import { Role1CombatAssetKeys } from '../assets/AssetManifest';
import type { Role1ShadowModel } from '../systems/Role1ShadowSkillSystem';
import { projectRole1ShadowVisual } from '../systems/Role1ShadowVisualSystem';

export type Role1ShadowView = Readonly<{
  sprite: Phaser.GameObjects.Sprite;
}>;

export function syncRole1ShadowVisualViews(params: {
  scene: Phaser.Scene;
  shadows: readonly Role1ShadowModel[];
  views: Map<string, Role1ShadowView>;
}): void {
  const activeIds = new Set<string>();
  for (const shadow of params.shadows) {
    activeIds.add(shadow.id);
    const projection = projectRole1ShadowVisual(shadow);
    let view = params.views.get(shadow.id);
    if (!params.scene.textures.exists(Role1CombatAssetKeys.shadow)) continue;
    if (!view) {
      view = {
        sprite: params.scene.add.sprite(
          projection.x,
          projection.y,
          Role1CombatAssetKeys.shadow,
          projection.frame,
        ).setDepth(19),
      };
      params.views.set(shadow.id, view);
    }
    if (view.sprite.texture.key !== Role1CombatAssetKeys.shadow) {
      view.sprite.setTexture(Role1CombatAssetKeys.shadow, projection.frame);
    }
    view.sprite
      .setPosition(projection.x, projection.y)
      .setOrigin(projection.originX, projection.originY)
      .setFlipX(projection.flipX)
      .setFrame(projection.frame);
  }
  for (const [id, view] of params.views) {
    if (activeIds.has(id)) continue;
    view.sprite.destroy();
    params.views.delete(id);
  }
}

export function destroyRole1ShadowVisualViews(views: Map<string, Role1ShadowView>): void {
  for (const view of views.values()) view.sprite.destroy();
  views.clear();
}
