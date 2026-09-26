import { createPetMonkeyHorseAnimationClock } from '../PetMonkeyHorseAnimationClock';
import { getPetMonkeyHorseGroundDefinition } from '../PetMonkeyHorseGroundDefinition';
import { PetMonkeyHorseProjectileSystem } from '../PetMonkeyHorseProjectileSystem';
import type { PetSkillTarget } from '../PetTypes';
import { PetNormalAttackDecision } from '../PetNormalAttackDecision';
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
  preparePetHorseSkill,
  type HorseForm,
  type HorseSkillAction,
} from '../PetHorseCombatSystem';

export type HorsePetForm = HorseForm;
type HorseActionType = `horse${HorsePetForm}-${HorseSkillAction}`;

const requestByAction = Object.fromEntries(
  ([1, 2, 3, 4] as const).flatMap((form) => (
    (['sp', 'bd', 'bz', 'tmaoyi'] as const).map((action) => [
      `horse${form}-${action}`,
      ((params) => preparePetHorseSkill(action, params)) satisfies PetBehaviorSkillRequest,
    ])
  )),
) as Readonly<Record<HorseActionType, PetBehaviorSkillRequest>>;

export class HorsePetBehavior implements PetBehavior {
  private readonly projectiles = new PetMonkeyHorseProjectileSystem();
  beforeActions(context: PetBehaviorContext): void { this.projectiles.step(context); }
  readonly usesHostTicks = true;
  readonly stepsWhileDying = true;
  readonly searchIncludesDead = true;
  losesLifeOnDeath(): boolean { return true; }
  private normalTarget?: Readonly<PetSkillTarget>;
  private skillTarget?: Readonly<PetSkillTarget>;
  private skillAction?: HorseSkillAction;
  private readonly normalAttack = new PetNormalAttackDecision();

  constructor(private readonly form: HorsePetForm) {}

  createAnimationClock() {
    return createPetMonkeyHorseAnimationClock('horse', this.form);
  }

  enter(context: PetBehaviorContext): void {
    this.projectiles.enter(context);
    if (context.pet.species !== 'horse' || context.pet.form !== this.form) {
      throw new Error(`Horse behavior ${this.form} cannot enter ${context.pet.species}:${context.pet.form}.`);
    }
  }

  canMove(context: PetBehaviorContext): boolean {
    return bodyAvailable(context);
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target || !bodyAvailable(context)) return undefined;
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
    if (!context.target || !bodyAvailable(context)) return undefined;
    return { type: 'basic-attack' };
  }

  groundMovement() { return getPetMonkeyHorseGroundDefinition('horse', this.form); }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (action.type === 'basic-attack') {
      this.normalTarget = context.target;
      if (context.isLocalOwner && context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
      return;
    }
    const request = requestByAction[action.type as HorseActionType];
    if (!request) throw new Error(`Unsupported horse behavior action: ${action.type}`);
    const result = action.type === 'horse4-tmaoyi'
      ? context.castSkill(request)
      : context.target
        ? context.castSkillAt(request, context.target)
        : { ok: false, message: 'Horse skill requires a target' };
    if (result.ok) {
      this.skillTarget = context.target;
      this.skillAction = action.type.slice(action.type.indexOf('-') + 1) as HorseSkillAction;
      if (this.skillAction === 'tmaoyi') this.projectiles.emitHorseAoyiPrelude(context);
      if (context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
    }
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

  updateEffects(_context: PetBehaviorContext): void {}

  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    if (event.reactsToHit === true && !context.isGxp && context.pet.hp > 0) {
      this.normalTarget = undefined;
      this.skillTarget = undefined;
      this.skillAction = undefined;
      if (this.normalAttack.counter(context)) {
        context.playAnimation('basic-attack');
        this.executeAction({ type: 'basic-attack' }, context);
      } else if (context.animation?.action === 'hurt') context.restartAnimationCell();
      else context.playAnimation('hurt');
    }
    if (this.form >= 2 && context.pet.skillState) context.pet.skillState.horse2Bd.releaseReady = true;
    context.emit({ type: 'damaged', payload: { amount: event.amount, sourceId: event.sourceId } });
  }

  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    if (event.eventName === 'hit' && event.action === 'basic-attack'
      && context.isLocalOwner) {
      const result = this.projectiles.emit(context, this.normalTarget);
      context.emit({
        type: 'basic-attack',
        payload: Object.freeze({
          ok: result.ok,
          targetId: result.target?.id,
          damage: result.damage,
          projectileId: result.projectile?.projectileId,
        }),
      });
    }
    if (event.eventName === 'complete' && event.action === 'basic-attack') this.normalTarget = undefined;
    if (event.eventName === 'hit' && event.action?.startsWith('horse') && context.isLocalOwner
      && this.skillAction && this.skillTarget) {
      const action = this.skillAction;
      const result = action === 'tmaoyi' ? this.projectiles.emitHorseAoyi(context)
        : this.projectiles.emitHorseSkill(context, action, this.skillTarget);
      context.emit({ type: 'skill-emitted', payload: { action: event.action, ok: result.ok,
        projectileId: result.projectile?.projectileId } });
    }

    context.emit({ type: 'animation-event', payload: { eventName: event.eventName } });
  }

  destroy(_reason: PetBehaviorDestroyReason): void { this.projectiles.destroy(); }
}

function cooldownReady(cooldownMs: number | undefined): boolean {
  return (cooldownMs ?? 0) <= 0;
}

function bodyAvailable(context: PetBehaviorContext): boolean {
  const action = context.animation?.action;
  return action === undefined || action === 'wait' || action === 'walk';
}
