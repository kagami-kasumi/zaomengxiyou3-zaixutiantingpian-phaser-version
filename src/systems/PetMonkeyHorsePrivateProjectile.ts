import type { ProjectileModel } from './ProjectileTypes';
import type { DragonDamageCache } from './PetDragonDamageSystem';
import type { PetBehaviorContext } from './PetBehavior';
import type { HorseAoyiMotion } from './PetHorseAoyiMotion';
import type { PetProjectileCombatPort } from './PetProjectileCombatPort';

export type MonkeyHorsePrivateProjectile = {
  projectile: ProjectileModel; cache: DragonDamageCache; lastTick: number; action: string;
  timed?: boolean; follows?: boolean; sourceX?: number; sourceY?: number; sourceMatrixA?: number;
  motion?: HorseAoyiMotion;
  retainedTarget?: ReturnType<NonNullable<PetProjectileCombatPort['bindTarget']>>;
  onAccepted?: (context: PetBehaviorContext) => void;
};
