import type {
  PetOwnerSnapshot,
  PetRuntimeModel,
  PetSkillTarget,
  PetState,
} from './PetTypes';

export type PetBehaviorAction = Readonly<{
  type: string;
  payload?: unknown;
}>;

export type PetBehaviorEvent = Readonly<{
  type: string;
  payload?: unknown;
}>;

export type PetBehaviorDestroyReason = 'inactive' | 'replaced' | 'runtime-destroyed';

export type PetBehaviorContext = Readonly<{
  pet: Readonly<PetState>;
  owner: Readonly<PetOwnerSnapshot>;
  runtime: Readonly<PetRuntimeModel>;
  targets: readonly Readonly<PetSkillTarget>[];
  target?: Readonly<PetSkillTarget>;
  deltaMs: number;
  emit: (event: PetBehaviorEvent) => void;
}>;

export interface PetBehavior {
  enter(context: PetBehaviorContext): void;
  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined;
  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void;
  updateEffects(context: PetBehaviorContext): void;
  destroy(reason: PetBehaviorDestroyReason): void;
}

export type PetBehaviorFactory = () => PetBehavior;
