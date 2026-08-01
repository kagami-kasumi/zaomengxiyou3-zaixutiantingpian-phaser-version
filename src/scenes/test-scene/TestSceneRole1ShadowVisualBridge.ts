import Phaser from 'phaser';
import { Role1CombatAssetKeys } from '../../assets/AssetManifest';
import type { Role1ShadowModel } from '../../systems/Role1ShadowSkillSystem';

type ShadowView = Readonly<{
  sprite: Phaser.GameObjects.Sprite;
  model: Role1ShadowModel;
}>;

export function syncRole1ShadowVisuals(scene: Phaser.Scene & Record<string, any>): void {
  const views: Map<string, ShadowView> = scene.role1ShadowVisuals ?? new Map<string, ShadowView>();
  scene.role1ShadowVisuals = views;
  const active = new Map<string, Role1ShadowModel>();
  for (const player of scene.playerViews ?? []) {
    if (player.normalAttack?.heroId !== 1) continue;
    for (const shadow of player.skill.role1ShadowRuntime.shadows as Role1ShadowModel[]) {
      active.set(shadow.id, shadow);
      let view = views.get(shadow.id);
      if (!view) {
        const sprite = scene.add.sprite(shadow.x + 15, shadow.y - 5, Role1CombatAssetKeys.shadow, 0)
          .setOrigin(shadow.facingX < 0 ? 0.575 : 0.425, 0.525)
          .setFlipX(shadow.facingX > 0)
          .setDepth(19);
        view = { sprite, model: shadow };
        views.set(shadow.id, view);
      }
      const elapsedMs = 3_000 - shadow.remainingMs;
      const frame = Math.min(4, Math.floor(Math.max(0, elapsedMs) / 400));
      view.sprite.setPosition(shadow.x + 15, shadow.y - 5).setFrame(frame);
    }
  }
  for (const [id, view] of views) {
    if (active.has(id)) continue;
    view.sprite.destroy();
    views.delete(id);
  }
}
