import type { DragonCollisionMask } from './PetDragonCollisionSystem';
import type { DragonDamageCache } from './PetDragonDamageSystem';
import type { ProjectileModel } from './ProjectileTypes';

/** Current world facts and the existing damage owner; contains no Scene or targeting policy. */
export type PetProjectileCombatPort = Readonly<{
  mask: (sourceSymbol: string) => DragonCollisionMask;
  target: (id: string) => Readonly<{ monsterId: number; x: number; y: number; alive: boolean }> | undefined;
  hit: (projectile: Readonly<ProjectileModel>, targetId: string, cache: DragonDamageCache) => boolean;
}>;
