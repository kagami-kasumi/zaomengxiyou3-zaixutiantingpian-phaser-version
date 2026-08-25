import type {
  PetBehavior,
  PetBehaviorAction,
  PetBehaviorContext,
  PetBehaviorDestroyReason,
  PetBehaviorSkillRequest,
} from '../PetBehavior';
import {
  requestPetHorse1SpSkill,
  requestPetHorse2BdSkill,
  requestPetHorse3BzSkill,
  requestPetHorse4TmaoyiSkill,
} from '../PetSystem';

export type HorsePetForm = 1 | 2 | 3 | 4;

type HorseActionType = 'horse1-sp' | 'horse2-bd' | 'horse3-bz' | 'horse4-tmaoyi';

const requestByAction: Readonly<Record<HorseActionType, PetBehaviorSkillRequest>> = {
  'horse1-sp': requestPetHorse1SpSkill,
  'horse2-bd': requestPetHorse2BdSkill,
  'horse3-bz': requestPetHorse3BzSkill,
  'horse4-tmaoyi': requestPetHorse4TmaoyiSkill,
};

export class HorsePetBehavior implements PetBehavior {
  constructor(private readonly form: HorsePetForm) {}

  enter(context: PetBehaviorContext): void {
    if (context.pet.species !== 'horse' || context.pet.form !== this.form) {
      throw new Error(`Horse behavior ${this.form} cannot enter ${context.pet.species}:${context.pet.form}.`);
    }
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target) return undefined;
    const state = context.pet.skillState;
    switch (this.form) {
      case 1:
        return cooldownReady(state?.horse1Sp.cooldownMs) ? { type: 'horse1-sp' } : undefined;
      case 2:
        return state?.horse2Bd.releaseReady && cooldownReady(state.horse2Bd.cooldownMs)
          ? { type: 'horse2-bd' }
          : undefined;
      case 3:
        return cooldownReady(state?.horse3Bz.cooldownMs) ? { type: 'horse3-bz' } : undefined;
      case 4:
        return cooldownReady(state?.horse4Tmaoyi.cooldownMs) ? { type: 'horse4-tmaoyi' } : undefined;
    }
  }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    const request = requestByAction[action.type as HorseActionType];
    if (!request) throw new Error(`Unsupported horse behavior action: ${action.type}`);
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
