import type {
  PetBehaviorAction, PetBehaviorDestroyReason, PetBehaviorEvent,
  PetCombatAnimationEvent, PetCombatDamageEvent,
} from './PetBehavior';
import type {
  PetOwnerSnapshot, PetRoster, PetRuntimeModel, PetSkillRandomSource,
  PetSkillTarget, PetState,
} from './PetTypes';
import type { ProjectileSystemModel } from './ProjectileSystem';
import type { PetAnimationClock } from './PetAnimationClock';
import type { PetGroundEnvironment } from '../assets/PetGroundEnvironmentAssets';
import type { PetGroundMotion } from './PetGroundMovementSystem';
import type { PetProjectileCombatPort } from './PetProjectileCombatPort';

export type PetCombatFrame = Readonly<{
  roster: PetRoster;
  owner: Readonly<PetOwnerSnapshot>;
  targets: readonly PetSkillTarget[];
  projectiles?: ProjectileSystemModel;
  random?: PetSkillRandomSource;
  damageEvents?: readonly PetCombatDamageEvent[];
  animationEvents?: readonly PetCombatAnimationEvent[];
  deltaMs: number;
  /** Original host clock selected by the scene; movement speed is pixels per tick. */
  hostFps?: number;
  groundEnvironment?: PetGroundEnvironment;
  projectileCombat?: PetProjectileCombatPort;
  /** Transient entity effects, indexed by session key rather than persistent skills. */
  gxpRuntimeKeys?: readonly string[];
}>;

export type PetCombatSessionPhase = 'alive' | 'dead-playing';
export type PetCombatReleaseReason = PetBehaviorDestroyReason | 'dismissed' | 'expired';

export type PetCombatRuntimeEvent = Readonly<{
  sequence: number;
  type: 'activated' | 'deactivated' | 'action' | 'behavior' | 'destroyed';
  petId?: string;
  runtimeKey?: string;
  parentRuntimeKey?: string;
  sourcePetId?: string;
  reason?: PetCombatReleaseReason;
  action?: PetBehaviorAction;
  behaviorEvent?: PetBehaviorEvent;
  actionToken?: number;
}>;

export type PetCombatSummonHandle = Readonly<{
  runtimeKey: string;
  petId: string;
  parentRuntimeKey: string;
  sourcePetId: string;
}>;

export type PetCombatEntitySnapshot = Readonly<{
  petId: string;
  species: string;
  form: number;
  runtime: Readonly<PetRuntimeModel>;
  phase: PetCombatSessionPhase;
  target?: Readonly<PetSkillTarget>;
  actionToken: number;
  parentRuntimeKey?: string;
  sourcePetId: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  animation?: ReturnType<PetAnimationClock['snapshot']>;
  groundMotion?: Readonly<PetGroundMotion>;
}>;

export type PetCombatSnapshot = Readonly<{
  destroyed: boolean;
  petId?: string;
  species?: string;
  form?: number;
  runtime?: Readonly<PetRuntimeModel>;
  target?: Readonly<PetSkillTarget>;
  phase?: PetCombatSessionPhase;
  actionToken?: number;
  animation?: ReturnType<PetAnimationClock['snapshot']>;
  summons?: readonly PetCombatEntitySnapshot[];
  groundMotion?: Readonly<PetGroundMotion>;
}>;

export type PetCombatSummonRequest = Readonly<{
  // Transient source values are copied on adoption. Never insert this pet into a save roster.
  pet: Readonly<PetState>;
  x: number;
  y: number;
  facingX: -1 | 1;
  onReleased?: (reason: PetCombatReleaseReason) => void;
}>;
