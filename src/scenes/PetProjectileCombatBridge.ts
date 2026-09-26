import type Phaser from 'phaser';
import { getPetDragonEffectFrame } from '../assets/PetDragonAnimationAssets';
import { createPetProjectileCombatPort } from '../systems/PetProjectileCombatSystem';
import type { DragonCollisionMask } from '../systems/PetDragonCollisionSystem';
import type { PetRoster } from '../systems/PetTypes';
import { ensureSceneAssetBundle } from './SceneAssetBundleBridge';
import { hasMonkeyHorseAssets, requireMonkeyHorseAssets } from './PetMonkeyHorseAssetBridge';
import { createPetWorldDelayBridge } from './PetWorldDelayBridge';
import { createPetWorldDisplayBridge } from './PetWorldDisplayBridge';

/** Texture readback only; targeting, sampling and damage remain in systems. */
export function createPetProjectileCombatBridge(scene: Phaser.Scene) {
  const masks = new Map<string, DragonCollisionMask>();
  let loading: Promise<void> | undefined, failure: unknown, disposed = false;
  const display = createPetWorldDisplayBridge(scene);
  // Timer-born native clips start at this frame's display tick, like body-born clips.
  const delayed = createPetWorldDelayBridge(scene);
  const destroy = () => {
    if (disposed) return;
    disposed = true; delayed.destroy(); display.destroy(); scene.events.off('shutdown', destroy);
  };
  scene.events.once('shutdown', destroy);
  const createPort = (input: Omit<Parameters<typeof createPetProjectileCombatPort>[0], 'mask'>) =>
    createPetProjectileCombatPort({ ...input, displayTick: display.readTick, delay: (milliseconds, callback) => {
      delayed.schedule(milliseconds, callback);
    }, monkeyHorseCollision: () => requireMonkeyHorseAssets(scene), parentBoundsLeft: bounds => {
      const camera = scene.cameras.main;
      // Phaser uses this matrix for actual rendering; it is omitted from its Camera typings.
      const matrix = (camera as typeof camera & { matrix: Phaser.GameObjects.Components.TransformMatrix }).matrix;
      const corners = [
        [bounds.x, bounds.y], [bounds.x + bounds.width, bounds.y],
        [bounds.x, bounds.y + bounds.height], [bounds.x + bounds.width, bounds.y + bounds.height],
      ];
      return Math.min(...corners.map(([x, y]) =>
        matrix.transformPoint(x! - camera.scrollX, y! - camera.scrollY).x));
    }, mask: symbol => {
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
  return Object.assign(createPort, {
    destroy,
    readyRoster(roster: PetRoster | undefined): PetRoster | undefined {
      const pet = roster?.pets.find(pet => pet.isActive && pet.lifetime > 0);
      if (!pet || !['monkey', 'horse'].includes(pet.species) || hasMonkeyHorseAssets(scene)) return roster;
      if (failure) throw failure;
      if (!disposed && !loading) loading = ensureSceneAssetBundle(scene, 'pet-monkey-horse')
        .then(() => {}).catch(error => { if (!disposed) failure = error; });
      return { ...roster!, pets: [] };
    },
  });
}
