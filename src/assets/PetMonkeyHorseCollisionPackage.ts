import manifest from '../../public/assets/pets/monkey-horse/collision-manifest.json';
import { PetMonkeyHorseCollisionAssets, type MonkeyHorseCollisionPackage } from './PetMonkeyHorseCollisionAssets';

export const monkeyHorseCollisionAsset = { kind: 'binary' as const,
  key: 'pet-monkey-horse:collision', path: manifest.path };

/** Decode only delivered bytes; source probes remain an offline verification dependency. */
export async function decodeMonkeyHorseCollision(bytes: Uint8Array): Promise<PetMonkeyHorseCollisionAssets> {
  const copy = new Uint8Array(bytes.length); copy.set(bytes);
  const compressed = copy[0] === 31 && copy[1] === 139;
  if (compressed) await checkHash(copy, manifest.compressedSha256);
  const decoded = compressed ? new Uint8Array(await new Response(new Blob([copy]).stream()
    .pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()) : copy;
  // Some servers decode Content-Encoding before the binary cache sees the bytes.
  await checkHash(decoded, manifest.decodedSha256);
  return new PetMonkeyHorseCollisionAssets(JSON.parse(new TextDecoder().decode(decoded)) as MonkeyHorseCollisionPackage);
}

async function checkHash(bytes: Uint8Array, expected: string): Promise<void> {
  const copy = new Uint8Array(bytes.length); copy.set(bytes);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', copy));
  const actual = Array.from(hash, value => value.toString(16).padStart(2, '0')).join('');
  if (actual !== expected) throw new Error('Monkey/horse collision package integrity mismatch');
}
