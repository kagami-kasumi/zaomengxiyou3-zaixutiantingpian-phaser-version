import type {
  PetOwnerSnapshot,
  PetRoster,
  PetRuntimeModel,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillTarget,
  PetState,
} from './PetTypes';
import type { ProjectileSystemModel } from './ProjectileSystem';

export type PetBehaviorAction = Readonly<{
  type: string;
  payload?: unknown;
}>;

export type PetBehaviorEvent = Readonly<{
  type: string;
  payload?: unknown;
}>;

export type PetCombatDamageEvent = Readonly<{
  runtimeKey: string;
  amount: number;
  sourceId?: string;
}>;

export type PetCombatAnimationEventName = 'hit' | 'complete' | 'dead-complete';

export type PetCombatAnimationEvent = Readonly<{
  runtimeKey: string;
  actionToken: number;
  eventName: PetCombatAnimationEventName;
}>;

export type PetBehaviorDestroyReason = 'inactive' | 'replaced' | 'dead-complete' | 'runtime-destroyed';

export type PetBehaviorSkillRequest = (params: {
  roster: PetRoster;
  runtime: PetRuntimeModel;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}) => PetSkillCastResult;

export type PetBehaviorContext = Readonly<{
  pet: Readonly<PetState>;
  owner: Readonly<PetOwnerSnapshot>;
  runtime: Readonly<PetRuntimeModel>;
  targets: readonly Readonly<PetSkillTarget>[];
  target?: Readonly<PetSkillTarget>;
  deltaMs: number;
  castSkill: (request: PetBehaviorSkillRequest) => PetSkillCastResult;
  emit: (event: PetBehaviorEvent) => void;
}>;

export interface PetBehavior {
  enter(context: PetBehaviorContext): void;
  canMove(context: PetBehaviorContext): boolean;
  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined;
  basicAttack(context: PetBehaviorContext): PetBehaviorAction | undefined;
  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void;
  updateEffects(context: PetBehaviorContext): void;
  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void;
  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void;
  destroy(reason: PetBehaviorDestroyReason): void;
}

export type PetBehaviorFactory = () => PetBehavior;
