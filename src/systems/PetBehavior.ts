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
  actionToken?: number;
}) => PetSkillCastResult;

export type PetBehaviorContext = Readonly<{
  pet: Readonly<PetState>;
  owner: Readonly<PetOwnerSnapshot>;
  runtime: Readonly<PetRuntimeModel>;
  targets: readonly Readonly<PetSkillTarget>[];
  target?: Readonly<PetSkillTarget>;
  actionToken: number;
  deltaMs: number;
  random: () => number;
  castSkill: (request: PetBehaviorSkillRequest) => PetSkillCastResult;
  castSkillAt: (request: PetBehaviorSkillRequest, target: Readonly<PetSkillTarget>) => PetSkillCastResult;
  castBasicAttack: () => PetSkillCastResult;
  relocate: (x: number, y: number) => void;
  emit: (event: PetBehaviorEvent) => void;
}>;

export interface PetBehavior {
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
