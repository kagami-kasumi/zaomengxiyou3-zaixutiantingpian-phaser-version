import type {
  PetBehavior,
  PetBehaviorAction,
  PetBehaviorContext,
  PetBehaviorDestroyReason,
  PetBehaviorSkillRequest,
} from '../PetBehavior';
import {
  requestPetMonkey1XjSkill,
  requestPetMonkey2LjSkill,
  requestPetMonkey2XjSkill,
  requestPetMonkey3LjSkill,
  requestPetMonkey3LyqSkill,
  requestPetMonkey3XjSkill,
  requestPetMonkey4JgaoyiSkill,
} from '../PetSystem';

export type MonkeyPetForm = 1 | 2 | 3 | 4;

type MonkeyActionType =
  | 'monkey1-xj'
  | 'monkey2-lj'
  | 'monkey2-xj'
  | 'monkey3-lyq'
  | 'monkey3-xj'
  | 'monkey3-lj'
  | 'monkey4-jgaoyi';

const requestByAction: Readonly<Record<MonkeyActionType, PetBehaviorSkillRequest>> = {
  'monkey1-xj': requestPetMonkey1XjSkill,
  'monkey2-lj': requestPetMonkey2LjSkill,
  'monkey2-xj': requestPetMonkey2XjSkill,
  'monkey3-lyq': requestPetMonkey3LyqSkill,
  'monkey3-xj': requestPetMonkey3XjSkill,
  'monkey3-lj': requestPetMonkey3LjSkill,
  'monkey4-jgaoyi': requestPetMonkey4JgaoyiSkill,
};

export class MonkeyPetBehavior implements PetBehavior {
  constructor(private readonly form: MonkeyPetForm) {}

  enter(context: PetBehaviorContext): void {
    if (context.pet.species !== 'monkey' || context.pet.form !== this.form) {
      throw new Error(`Monkey behavior ${this.form} cannot enter ${context.pet.species}:${context.pet.form}.`);
    }
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target) return undefined;
    const state = context.pet.skillState;
    switch (this.form) {
      case 1:
        return state?.monkey1Xj.releaseReady && cooldownReady(state.monkey1Xj.cooldownMs)
          ? { type: 'monkey1-xj' }
          : undefined;
      case 2:
        if (cooldownReady(state?.monkey2Lj.cooldownMs)) return { type: 'monkey2-lj' };
        return state?.monkey2Xj.releaseReady && cooldownReady(state.monkey2Xj.cooldownMs)
          ? { type: 'monkey2-xj' }
          : undefined;
      case 3:
        if (cooldownReady(state?.monkey3Lyq.cooldownMs)) return { type: 'monkey3-lyq' };
        if (cooldownReady(state?.monkey3Xj.cooldownMs)) return { type: 'monkey3-xj' };
        return state?.monkey3Lj.releaseReady && cooldownReady(state.monkey3Lj.cooldownMs)
          ? { type: 'monkey3-lj' }
          : undefined;
      case 4:
        return cooldownReady(state?.monkey4Jgaoyi.cooldownMs) ? { type: 'monkey4-jgaoyi' } : undefined;
    }
  }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    const request = requestByAction[action.type as MonkeyActionType];
    if (!request) throw new Error(`Unsupported monkey behavior action: ${action.type}`);
    const result = context.castSkill(request);
    context.emit({
      type: 'skill-cast',
      payload: Object.freeze({
        action: action.type,
        ok: result.ok,
        message: result.message,
        targetId: result.target?.id,
        damage: result.damage,
      }),
    });
  }

  updateEffects(_context: PetBehaviorContext): void {}

  destroy(_reason: PetBehaviorDestroyReason): void {}
}

function cooldownReady(cooldownMs: number | undefined): boolean {
  return (cooldownMs ?? 0) <= 0;
}
