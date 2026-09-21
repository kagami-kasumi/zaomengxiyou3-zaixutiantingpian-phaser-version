import type {
  PetOwnerSnapshot,
  PetRoster,
  PetRuntimeModel,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillTarget,
  PetState,
  PetSkillState,
} from './PetTypes';
import type { ProjectileSystemModel } from './ProjectileSystem';
import type { PetAnimationClock } from './PetAnimationClock';
import type { PetGroundMovementDefinition } from './PetGroundSessionMovement';
import type { PetProjectileCombatPort } from './PetProjectileCombatPort';
import type {
  PetCombatEntitySnapshot, PetCombatReleaseReason, PetCombatSummonHandle, PetCombatSummonRequest,
} from './PetCombatTypes';

export type PetBehaviorAction = Readonly<{
  type: string;
  /** Selected source branch whose implementation is not delivered yet; never a successful cast. */
  deferred?: boolean;
  /** Instant source action such as TXLJ which does not select a body animation. */
  preservesAnimation?: boolean;
  payload?: unknown;
}>;

export type PetBehaviorEvent = Readonly<{
  type: string;
  payload?: unknown;
}>;

export type PetCombatDamageEvent = Readonly<{
  producerKind?: 'pet-reduce-hp' | 'turtle-transfer';
  runtimeKey: string;
  amount: number;
  sourceId?: string;
  attackId?: string;
  occurredAtMs?: number;
  /** BasePet.reduceHp(param2); HP-only transfers must not cause hurt or QLFJ. */
  reactsToHit?: boolean;
  knockback?: Readonly<{ x: number; y: number }>;
}>;

export type PetCombatAnimationEventName = 'enter' | 'hit' | 'complete' | 'dead-complete';

export type PetCombatAnimationEvent = Readonly<{
  runtimeKey: string;
  actionToken: number;
  eventName: PetCombatAnimationEventName;
  action?: string;
  setStatic?: boolean;
}>;

export type PetBehaviorDestroyReason = 'inactive' | 'replaced' | 'dead-complete' | 'runtime-destroyed'
  | 'dismissed' | 'expired';

export type PetBehaviorSkillRequest = (params: {
  roster: PetRoster;
  runtime: PetRuntimeModel;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
  actionToken?: number;
}) => PetSkillCastResult;

export type PetBehaviorContext = Readonly<{
  pet: Readonly<PetState>;
  owner: Readonly<PetOwnerSnapshot>;
  runtime: Readonly<PetRuntimeModel>;
  targets: readonly Readonly<PetSkillTarget>[];
  target?: Readonly<PetSkillTarget>;
  actionToken: number;
  parentRuntimeKey?: string;
  sourcePetId: string;
  deltaMs: number;
  hostFps: number;
  hostTick: number;
  targetAcquiredThisFrame: boolean;
  isLocalOwner: boolean;
  animation?: ReturnType<PetAnimationClock['snapshot']>;
  grounded?: boolean;
  projectileCombat?: PetProjectileCombatPort;
  isGxp: boolean;
  random: () => number;
  castSkill: (request: PetBehaviorSkillRequest) => PetSkillCastResult;
  castSkillAt: (request: PetBehaviorSkillRequest, target: Readonly<PetSkillTarget>) => PetSkillCastResult;
  castBasicAttack: () => PetSkillCastResult;
  relocate: (x: number, y: number) => void;
  face: (direction: -1 | 1) => void;
  setRootScaleX: (sign: -1 | 1) => void;
  healSelf: (hp: number, mp?: number) => void;
  linkOwner: (value: number, durationTicks: number) => void;
  healLinkedOwner: (hp: number, notification: 'direct' | 'event') => void;
  spendMp: (amount: number) => boolean;
  protectFromHits: (sourceCount: number) => void;
  setSkillCooldown: (skill: Exclude<keyof PetSkillState, 'lastResult'>, milliseconds: number) => void;
  releaseSelf: (reason: PetCombatReleaseReason) => void;
  playAnimation: (action: string) => void;
  restartAnimationCell: () => void;
  spawnSummon: (request: PetCombatSummonRequest) => PetCombatSummonHandle;
  releaseSummon: (handle: PetCombatSummonHandle, reason?: PetCombatReleaseReason) => void;
  summonSnapshots: () => readonly PetCombatEntitySnapshot[];
  emit: (event: PetBehaviorEvent) => void;
}>;

export interface PetBehavior {
  beforeActions?(context: PetBehaviorContext): void;
  afterChildren?(context: PetBehaviorContext): void;
  createAnimationClock?(): PetAnimationClock;
  groundMovement?(): PetGroundMovementDefinition;
  suppressGroundMove?(context: PetBehaviorContext): boolean;
  suppressTurning?(context: PetBehaviorContext): boolean;
  rejectKnockback?(context: PetBehaviorContext): boolean;
  losesLifeOnDeath?(): boolean;
  targetsDamageSource?(): boolean;
  enter(context: PetBehaviorContext): void;
  canMove(context: PetBehaviorContext): boolean;
  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined;
  basicAttackRange?(context: PetBehaviorContext): number;
  basicAttack(context: PetBehaviorContext): PetBehaviorAction | undefined;
  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void;
  updateEffects(context: PetBehaviorContext): void;
  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void;
  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void;
  destroy(reason: PetBehaviorDestroyReason): void;
}

export type PetBehaviorFactory = () => PetBehavior;
