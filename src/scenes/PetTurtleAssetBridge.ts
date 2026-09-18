import type Phaser from 'phaser';
import { PetTurtleAssets } from '../assets/PetTurtleAssets';
import { petTurtleBundleAssets, turtleAssetKey, turtleManifestPath } from '../assets/PetTurtleAssetCatalog';

const resources = new WeakMap<Phaser.Cache.CacheManager, PetTurtleAssets>();
export function hasTurtleAssets(scene: Phaser.Scene): boolean { return resources.has(scene.cache); }
export function requireTurtleAssets(scene: Phaser.Scene): PetTurtleAssets {
  const assets = resources.get(scene.cache);
  if (!assets) throw new Error('pet-turtle bundle is not ready');
  return assets;
}
/** Called inside the existing bundle load transaction, before its ready event. */
export async function prepareTurtleAssets(scene: Phaser.Scene, cancelled: () => boolean): Promise<void> {
  if (resources.has(scene.cache)) return;
  const assets = await PetTurtleAssets.decode(path => {
    if (cancelled()) throw new Error('Turtle decoding cancelled');
    const data = scene.cache.binary.get(turtleAssetKey(path)) as ArrayBuffer | undefined;
    if (!data) throw new Error(`Missing turtle bundle bytes ${path}`);
    return new Uint8Array(data);
  });
  if (cancelled()) throw new Error('Turtle decoding cancelled with scene shutdown');
  resources.set(scene.cache, assets);
}
export function discardIncompleteTurtleAssets(scene: Phaser.Scene): void {
  if (resources.has(scene.cache)) return;
  for (const asset of petTurtleBundleAssets) scene.cache.binary.remove(asset.key);
}
export const isTurtleManifest = (path: string) => path === turtleManifestPath;
