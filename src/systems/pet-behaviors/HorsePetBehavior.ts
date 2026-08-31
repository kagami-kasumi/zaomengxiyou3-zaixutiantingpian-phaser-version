import horseFamilyTruthJson from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json';
import type {
  PetBehavior,
  PetBehaviorAction,
  PetBehaviorContext,
  PetBehaviorDestroyReason,
  PetCombatAnimationEvent,
  PetCombatDamageEvent,
  PetBehaviorSkillRequest,
} from '../PetBehavior';
import {
  getPetHorseAttackRange,
  requestPetHorseSkill,
  type HorseForm,
  type HorseSkillAction,
} from '../PetHorseCombatSystem';

export type HorsePetForm = HorseForm;
type HorseActionType = `horse${HorsePetForm}-${HorseSkillAction}`;

const horseFamilyTruth = horseFamilyTruthJson as unknown as Readonly<{
  forms: readonly Readonly<{ attackRate: number }>[];
}>;

const requestByAction = Object.fromEntries(
  ([1, 2, 3, 4] as const).flatMap((form) => (
    (['sp', 'bd', 'bz', 'tmaoyi'] as const).map((action) => [
      `horse${form}-${action}`,
      ((params) => requestPetHorseSkill(action, params)) satisfies PetBehaviorSkillRequest,
    ])
  )),
) as Readonly<Record<HorseActionType, PetBehaviorSkillRequest>>;

export class HorsePetBehavior implements PetBehavior {
  private normalBranchRemainingMs = 0;

  constructor(private readonly form: HorsePetForm) {}

  enter(context: PetBehaviorContext): void {
    if (context.pet.species !== 'horse' || context.pet.form !== this.form) {
      throw new Error(`Horse behavior ${this.form} cannot enter ${context.pet.species}:${context.pet.form}.`);
    }
  }

  canMove(_context: PetBehaviorContext): boolean {
    return true;
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target) return undefined;
    const state = context.pet.skillState;
    const distance = Math.hypot(context.target.x - context.runtime.x, context.target.y - context.runtime.y);
    if (this.form >= 2
      && context.pet.skills.includes('bd')
      && state?.horse2Bd.releaseReady
      && cooldownReady(state.horse2Bd.cooldownMs)
      && context.pet.mp >= 20) {
      return { type: `horse${this.form}-bd` };
    }
    if (context.pet.skills.includes('sp')
      && cooldownReady(state?.horse1Sp.cooldownMs)
      && context.pet.mp >= 20
      && distance >= 50
      && distance <= 100) {
      return { type: `horse${this.form}-sp` };
    }
    if (this.form >= 3
      && context.pet.skills.includes('bz')
      && cooldownReady(state?.horse3Bz.cooldownMs)
      && context.pet.mp >= 20
      && distance <= 250) {
      return { type: `horse${this.form}-bz` };
    }
    if (this.form === 4
      && context.pet.skills.includes('tmaoyi')
      && cooldownReady(state?.horse4Tmaoyi.cooldownMs)
      && context.pet.mp >= 30) {
      return { type: 'horse4-tmaoyi' };
    }
    return undefined;
  }

  basicAttackRange(_context: PetBehaviorContext): number {
    return getPetHorseAttackRange(this.form);
  }

  basicAttack(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target || this.normalBranchRemainingMs > 0) return undefined;
    this.normalBranchRemainingMs = 1_000;
    const attackRate = horseFamilyTruth.forms[this.form - 1]?.attackRate ?? 0.7;
    if (context.random() <= attackRate) return { type: 'basic-attack' };
    context.emit({ type: context.random() < 0.3 ? 'wait' : 'chase' });
    return undefined;
  }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (action.type === 'basic-attack') {
      const result = context.castBasicAttack();
      context.emit({
        type: 'basic-attack',
        payload: Object.freeze({
          ok: result.ok,
          targetId: result.target?.id,
          damage: result.damage,
          projectileId: result.projectile?.projectileId,
        }),
      });
      return;
    }
    const request = requestByAction[action.type as HorseActionType];
    if (!request) throw new Error(`Unsupported horse behavior action: ${action.type}`);
    const result = action.type === 'horse4-tmaoyi'
      ? context.castSkill(request)
      : context.target
        ? context.castSkillAt(request, context.target)
        : { ok: false, message: 'Horse skill requires a target' };
    context.emit({
      type: 'skill-cast',
      payload: Object.freeze({
        action: action.type,
        ok: result.ok,
        message: result.message,
        targetId: result.target?.id,
        damage: result.damage,
        projectileId: result.projectile?.projectileId,
      }),
    });
  }

  updateEffects(context: PetBehaviorContext): void {
    this.normalBranchRemainingMs = Math.max(0, this.normalBranchRemainingMs - context.deltaMs);
  }

  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    if (this.form >= 2 && context.pet.skillState) context.pet.skillState.horse2Bd.releaseReady = true;
    context.emit({ type: 'damaged', payload: { amount: event.amount, sourceId: event.sourceId } });
  }

  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    context.emit({ type: 'animation-event', payload: { eventName: event.eventName } });
  }

  destroy(_reason: PetBehaviorDestroyReason): void {
    this.normalBranchRemainingMs = 0;
  }
}

function cooldownReady(cooldownMs: number | undefined): boolean {
  return (cooldownMs ?? 0) <= 0;
}
