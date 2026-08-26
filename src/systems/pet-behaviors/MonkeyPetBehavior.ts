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
  private normalBranchRemainingMs = 0;
  private jgaoyiRemaining = 0;
  private jgaoyiStepRemainingMs = 0;

  constructor(private readonly form: MonkeyPetForm) {}

  enter(context: PetBehaviorContext): void {
    if (context.pet.species !== 'monkey' || context.pet.form !== this.form) {
      throw new Error(`Monkey behavior ${this.form} cannot enter ${context.pet.species}:${context.pet.form}.`);
    }
  }

  canMove(_context: PetBehaviorContext): boolean {
    return this.jgaoyiRemaining === 0;
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target) return undefined;
    if (this.jgaoyiRemaining > 0) return undefined;
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
        if (cooldownReady(state?.monkey3Lyq.cooldownMs)) return { type: 'monkey3-lyq' };
        if (cooldownReady(state?.monkey3Xj.cooldownMs)) return { type: 'monkey3-xj' };
        if (state?.monkey3Lj.releaseReady && cooldownReady(state.monkey3Lj.cooldownMs)) {
          return { type: 'monkey3-lj' };
        }
        return cooldownReady(state?.monkey4Jgaoyi.cooldownMs)
          ? { type: 'monkey4-jgaoyi' }
          : undefined;
    }
  }

  basicAttack(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target || this.normalBranchRemainingMs > 0) return undefined;
    this.normalBranchRemainingMs = 1_000;
    if (context.random() <= 0.7) return { type: 'basic-attack' };
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
          projectileId: result.projectile?.id,
        }),
      });
      return;
    }
    const request = requestByAction[action.type as MonkeyActionType];
    if (!request) throw new Error(`Unsupported monkey behavior action: ${action.type}`);
    const result = context.castSkill(request);
    if (action.type === 'monkey4-jgaoyi' && result.ok) {
      this.jgaoyiRemaining = 5;
      this.jgaoyiStepRemainingMs = 0;
    }
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

  updateEffects(context: PetBehaviorContext): void {
    this.normalBranchRemainingMs = Math.max(0, this.normalBranchRemainingMs - context.deltaMs);
    if (this.jgaoyiRemaining <= 0) return;
    this.jgaoyiStepRemainingMs = Math.max(0, this.jgaoyiStepRemainingMs - context.deltaMs);
    if (this.jgaoyiStepRemainingMs > 0) return;
    const visible = context.targets.filter((target) => target.isAlive && target.x > 20 && target.x < 920);
    if (visible.length === 0) {
      this.finishJgaoyi(context, 'no-visible-target');
      return;
    }
    const target = visible[Math.min(visible.length - 1, Math.floor(context.random() * visible.length))]!;
    context.relocate(target.x + context.random() * 100 - 50, target.y - 30);
    this.jgaoyiRemaining -= 1;
    const final = this.jgaoyiRemaining === 0;
    if (final) {
      if (context.pet.skills.includes('lyq')) {
        context.castSkillAt((params) => requestPetMonkey3LyqSkill({ ...params, chainCast: true }), target);
      } else {
        context.castBasicAttack();
      }
    } else {
      if (context.pet.skills.includes('xj')) {
        context.castSkillAt((params) => requestPetMonkey3XjSkill({ ...params, chainCast: true }), target);
      }
      if (context.pet.skills.includes('lj')) {
        context.castSkillAt((params) => requestPetMonkey3LjSkill({ ...params, chainCast: true }), target);
      } else {
        context.castBasicAttack();
      }
    }
    context.emit({
      type: 'jgaoyi-chain-step',
      payload: { targetId: target.id, remaining: this.jgaoyiRemaining, final },
    });
    if (final) this.finishJgaoyi(context, 'complete');
    else this.jgaoyiStepRemainingMs = 400;
  }

  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    const state = context.pet.skillState;
    if (this.form === 1 && state) state.monkey1Xj.releaseReady = true;
    if (this.form === 2 && state) state.monkey2Xj.releaseReady = true;
    if (this.form === 3 && state) state.monkey3Lj.releaseReady = true;
    if (this.form === 4 && state) state.monkey3Lj.releaseReady = true;
    if (this.form === 4 && this.jgaoyiRemaining > 0) {
      this.jgaoyiRemaining = 0;
      this.jgaoyiStepRemainingMs = 0;
      context.emit({ type: 'jgaoyi-chain-cancelled', payload: { sourceId: event.sourceId } });
    }
    context.emit({ type: 'damaged', payload: { amount: event.amount, sourceId: event.sourceId } });
  }

  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    context.emit({ type: 'animation-event', payload: { eventName: event.eventName } });
  }

  destroy(_reason: PetBehaviorDestroyReason): void {
    this.jgaoyiRemaining = 0;
    this.jgaoyiStepRemainingMs = 0;
  }

  private finishJgaoyi(context: PetBehaviorContext, reason: string): void {
    this.jgaoyiRemaining = 0;
    this.jgaoyiStepRemainingMs = 0;
    context.relocate(context.owner.x, context.owner.y - 50);
    context.emit({ type: 'jgaoyi-chain-finished', payload: { reason } });
  }
}

function cooldownReady(cooldownMs: number | undefined): boolean {
  return (cooldownMs ?? 0) <= 0;
}
