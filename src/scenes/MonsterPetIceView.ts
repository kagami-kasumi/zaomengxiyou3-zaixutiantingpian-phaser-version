import type Phaser from 'phaser';
import { syncMonsterPetEffectOrder } from './MonsterPetFireView';
import { getPetHorseIceTransform, petHorseIceAsset } from '../assets/PetHorseIceAsset';
import { getDragonTargetCollisionBounds } from '../systems/PetDragonCollisionSystem';
import type { MonsterPetTargetEffectState } from '../systems/MonsterPetTargetEffectSystem';

type View = { sprite: Phaser.GameObjects.Sprite; ice?: Phaser.GameObjects.Image };
type Target = { x: number; y: number; petTargetEffectState?: MonsterPetTargetEffectState };
const identities = new WeakMap<View, { state: MonsterPetTargetEffectState; id: number }>();

/** Target-owned display only. Neither body nor emitted attacks are advanced here. */
export function syncMonsterPetIceView(scene: Phaser.Scene, view: View, target: Target, enemyType: number): void {
  if (!target.petTargetEffectState?.iceVisible) {
    destroyMonsterPetIceView(view);
    return;
  }
  const identity = identities.get(view);
  if (view.ice && (identity?.state !== target.petTargetEffectState || identity.id !== target.petTargetEffectState.iceDisplayId)) {
    destroyMonsterPetIceView(view);
  }
  if (!view.ice) {
    if (!scene.textures.exists(petHorseIceAsset.key)) throw new Error('Missing native PetHorseIceEffect texture');
    const bounds = getDragonTargetCollisionBounds(enemyType, target.x, target.y);
    const transform = getPetHorseIceTransform(bounds.width, bounds.height);
    view.ice = scene.add.image(target.x, target.y, petHorseIceAsset.key)
      .setName(petHorseIceAsset.symbol)
      .setOrigin(transform.originX, transform.originY)
      .setScale(transform.scaleX, transform.scaleY)
      .setDepth(view.sprite.depth);
    // Keep the attachment adjacent to its own body, rather than above every monster.
    scene.children.moveAbove(view.ice, view.sprite);
    identities.set(view, { state: target.petTargetEffectState, id: target.petTargetEffectState.iceDisplayId });
  }
  view.ice.setPosition(target.x, target.y).setVisible(view.sprite.visible);
  syncMonsterPetEffectOrder(scene, view, target);
}

export function destroyMonsterPetIceView(view: View): void {
  view.ice?.destroy();
  view.ice = undefined;
  identities.delete(view);
}
