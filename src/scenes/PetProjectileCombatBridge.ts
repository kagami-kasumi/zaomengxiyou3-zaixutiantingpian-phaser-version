import type Phaser from 'phaser';
import { getPetDragonEffectFrame } from '../assets/PetDragonAnimationAssets';
import { createPetProjectileCombatPort } from '../systems/PetProjectileCombatSystem';
import type { DragonCollisionMask } from '../systems/PetDragonCollisionSystem';

/** Texture readback only; targeting, sampling and damage remain in systems. */
export function createPetProjectileCombatBridge(scene: Phaser.Scene) {
  const masks = new Map<string, DragonCollisionMask>();
  return (input: Omit<Parameters<typeof createPetProjectileCombatPort>[0], 'mask'>) =>
    createPetProjectileCombatPort({ ...input, mask: symbol => {
      let mask = masks.get(symbol);
      if (!mask) {
        const asset = getPetDragonEffectFrame(symbol, 1);
        if (!scene.textures.exists(asset.key)) throw new Error(`Missing pet collision texture ${asset.key}`);
        const alpha = new Uint8Array(asset.width * asset.height);
        for (let y = 0; y < asset.height; y++) for (let x = 0; x < asset.width; x++) {
          alpha[y * asset.width + x] = scene.textures.getPixel(x, y, asset.key)?.alpha ?? 0;
        }
        mask = { width: asset.width, height: asset.height, alpha };
        masks.set(symbol, mask);
      }
      return mask;
    } });
}
