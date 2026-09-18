import manifest from '../../public/assets/pets/turtle/manifest.json';

export const turtleManifest = manifest;
export const turtleAssetKey = (path: string): string => `pet-turtle:${path}`;
export const turtleManifestPath = '/assets/pets/turtle/manifest.json';
/** Same single bundle owner for all 650 delivered files; bytes decode before readiness. */
export const petTurtleBundleAssets = [
  { path: turtleManifestPath }, ...Object.values(manifest.packages), ...Object.values(manifest.images),
].map(({ path }) => ({ kind: 'binary' as const, key: turtleAssetKey(path), path }));
