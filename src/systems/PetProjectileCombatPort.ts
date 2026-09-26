import type { DragonCollisionMask } from './PetDragonCollisionSystem';
import type { DragonDamageCache } from './PetDragonDamageSystem';
import type { ProjectileModel } from './ProjectileTypes';
import type { PetMonkeyHorseCollisionAssets } from '../assets/PetMonkeyHorseCollisionAssets';

/** Current world facts and the existing damage owner; contains no Scene or targeting policy. */
export type PetProjectileCombatPort = Readonly<{
  /** Scene/world timer, independent of private pet host steps and source release. */
  delay?: (milliseconds: number, callback: () => void) => void;
  /** Native stage-frame position, including ordinary combat Scene pause. */
  displayTick?: () => number;
  monkeyHorseCollision?: () => PetMonkeyHorseCollisionAssets;
  /** Full monster-array order, including dead entries; colipse bounds in the scene's parent. */
  monstersInParentSpace?: () => readonly Readonly<{ id: string; x: number; y: number; isAlive: boolean; colliderLeft: number }>[];
  mask: (sourceSymbol: string) => DragonCollisionMask;
  target: (id: string) => Readonly<{ monsterId: number; x: number; y: number; alive: boolean }> | undefined;
  /** Retain the selected object, independent of later array removal or ID reuse. */
  bindTarget?: (id: string) => (() => Readonly<{ x: number; y: number; alive: boolean }> | undefined);
  hit: (projectile: Readonly<ProjectileModel>, targetId: string, cache: DragonDamageCache) => boolean;
}>;
