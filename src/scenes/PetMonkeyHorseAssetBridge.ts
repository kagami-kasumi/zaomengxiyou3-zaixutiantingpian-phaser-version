import type Phaser from 'phaser';
import type { PetMonkeyHorseCollisionAssets } from '../assets/PetMonkeyHorseCollisionAssets';
import { decodeMonkeyHorseCollision, monkeyHorseCollisionAsset } from '../assets/PetMonkeyHorseCollisionPackage';

const resources = new WeakMap<Phaser.Cache.CacheManager, PetMonkeyHorseCollisionAssets>();
export const hasMonkeyHorseAssets = (scene: Phaser.Scene): boolean => resources.has(scene.cache);
export function requireMonkeyHorseAssets(scene: Phaser.Scene): PetMonkeyHorseCollisionAssets {
  const assets = resources.get(scene.cache);
  if (!assets) throw new Error('pet-monkey-horse bundle is not ready');
  return assets;
}
export async function prepareMonkeyHorseAssets(scene: Phaser.Scene, cancelled: () => boolean): Promise<void> {
  if (resources.has(scene.cache)) return;
  const bytes = scene.cache.binary.get(monkeyHorseCollisionAsset.key) as ArrayBuffer | undefined;
  if (!bytes) throw new Error('Missing monkey/horse collision bundle bytes');
  const assets = await decodeMonkeyHorseCollision(new Uint8Array(bytes));
  if (cancelled()) throw new Error('Monkey/horse decoding cancelled with scene shutdown');
  resources.set(scene.cache, assets);
}
export function discardIncompleteMonkeyHorseAssets(scene: Phaser.Scene): void {
  if (!resources.has(scene.cache)) scene.cache.binary.remove(monkeyHorseCollisionAsset.key);
}
export const isMonkeyHorseCollisionAsset = (key: string): boolean => key === monkeyHorseCollisionAsset.key;
