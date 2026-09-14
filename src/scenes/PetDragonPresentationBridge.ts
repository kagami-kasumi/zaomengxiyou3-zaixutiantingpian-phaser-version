import type Phaser from 'phaser';
import { getPetDragonBodyAsset, getPetDragonBodyPlacement, getPetDragonCloneAlpha,
  getPetDragonEffectFrame, getPetDragonEffectPlacement } from '../assets/PetDragonAnimationAssets';
import type { PetCombatSnapshot } from '../systems/PetCombatTypes';
import type { ProjectileModel } from '../systems/ProjectileTypes';

/** Read-only projection: entity sessions own all clocks, actions and lifetime. */
export function createPetDragonPresentationBridge(scene: Phaser.Scene) {
  const bodies = new Map<string, Phaser.GameObjects.Sprite>();
  const effects = new Map<number, Phaser.GameObjects.Image>();
  return {
    update(snapshots: readonly PetCombatSnapshot[], projectiles: readonly ProjectileModel[]) {
      const activeBodies = new Set<string>();
      const sources = new Set<string>();
      for (const snapshot of snapshots) {
        for (const entity of [snapshot, ...(snapshot.summons ?? [])]) {
          if (entity.species !== 'dragon' || !entity.form || entity.form > 3 || !entity.runtime || !entity.animation) continue;
          const { runtime, animation } = entity;
          const key = runtime.runtimeKey;
          activeBodies.add(key);
          sources.add(entity.petId!);
          const asset = getPetDragonBodyAsset(entity.form);
          const placement = getPetDragonBodyPlacement(entity.form, runtime.facingX > 0 ? 'right' : 'left', runtime);
          let sprite = bodies.get(key);
          if (!sprite) {
            sprite = scene.add.sprite(placement.x, placement.y, asset.key).setOrigin(0, 0).setDepth(42);
            sprite.setName(`PetDragonBody:${key}`);
            bodies.set(key, sprite);
          }
          sprite.setPosition(placement.x, placement.y).setFlipX(placement.flipX)
            .setFrame(animation.row * asset.columns + animation.column)
            // PetDragon1.doHit2 assigns bbdc.alpha=0.5 on the real private entity.
            .setAlpha('parentRuntimeKey' in entity ? getPetDragonCloneAlpha(entity.form) : 1);
          sprite.setData('petDragonSnapshot', entity);
        }
      }
      for (const [key, sprite] of bodies) if (!activeBodies.has(key)) { sprite.destroy(); bodies.delete(key); }
      const activeEffects = new Set<number>();
      for (const projectile of projectiles) {
        if (projectile.petHostTick === undefined || projectile.isExpired || !sources.has(projectile.sourceId)
          || !['PetDragon1Bullet1', 'PetDragon2Bullet1', 'PetDragon2Bullet2', 'PetDragon3Bullet1',
            'PetDragon3Bullet3'].includes(projectile.sourceSymbol)) continue;
        const frame = Math.max(1, projectile.petHostTick);
        const asset = getPetDragonEffectFrame(projectile.sourceSymbol, frame);
        const placement = getPetDragonEffectPlacement(projectile.sourceSymbol, frame,
          projectile.facingX > 0 ? 'right' : 'left', projectile);
        activeEffects.add(projectile.id);
        let image = effects.get(projectile.id);
        if (!image) {
          image = scene.add.image(placement.x, placement.y, asset.key).setOrigin(0, 0).setDepth(43);
          image.setName(`PetDragonProjectile:${projectile.id}`);
          effects.set(projectile.id, image);
        }
        image.setTexture(asset.key).setPosition(placement.x, placement.y).setFlipX(placement.flipX);
        image.setData('petDragonProjectile', { id: projectile.id, sourceId: projectile.sourceId, frame });
      }
      for (const [id, image] of effects) if (!activeEffects.has(id)) { image.destroy(); effects.delete(id); }
    },
    destroy() {
      for (const sprite of bodies.values()) sprite.destroy();
      for (const image of effects.values()) image.destroy();
      bodies.clear(); effects.clear();
    },
  };
}
