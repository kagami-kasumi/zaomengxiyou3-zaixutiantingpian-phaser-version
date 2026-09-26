import { toDragonSourceCoordinate } from '../PetDragonCollisionSystem';
import { createPetMonkeyHorseAnimationClock } from '../PetMonkeyHorseAnimationClock';
import { getPetMonkeyHorseGroundDefinition } from '../PetMonkeyHorseGroundDefinition';
import { PetMonkeyHorseProjectileSystem } from '../PetMonkeyHorseProjectileSystem';
import type { PetSkillTarget } from '../PetTypes';
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
} from '../PetMonkeySkillSystem';
import monkeyFamilyTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json';
import { PetNormalAttackDecision } from '../PetNormalAttackDecision';
import { PetTuning } from '../PetTuning';

export type MonkeyPetForm = 1 | 2 | 3 | 4;

type MonkeyActionType =
  | 'monkey1-xj'
  | 'monkey2-lj'
  | 'monkey2-xj'
  | 'monkey3-lyq'
  | 'monkey3-xj'
  | 'monkey3-lj'
  | 'monkey4-jgaoyi';

const requestByAction = {
  'monkey1-xj': requestPetMonkey1XjSkill,
  'monkey2-lj': requestPetMonkey2LjSkill,
  'monkey2-xj': requestPetMonkey2XjSkill,
  'monkey3-lyq': requestPetMonkey3LyqSkill,
  'monkey3-xj': requestPetMonkey3XjSkill,
  'monkey3-lj': requestPetMonkey3LjSkill,
  'monkey4-jgaoyi': requestPetMonkey4JgaoyiSkill,
} satisfies Readonly<Record<MonkeyActionType, PetBehaviorSkillRequest>>;

const attackRangeByForm = Object.freeze(Object.fromEntries(
  monkeyFamilyTruth.forms.map((form, index) => [index + 1, form.attackRange]),
) as Record<MonkeyPetForm, number>);

export class MonkeyPetBehavior implements PetBehavior {
  private readonly projectiles = new PetMonkeyHorseProjectileSystem();
  beforeActions(context: PetBehaviorContext): void { this.projectiles.step(context); }
  readonly usesHostTicks = true;
  readonly stepsWhileDying = true;
  readonly searchIncludesDead = true;
  losesLifeOnDeath(): boolean { return true; }
  private normalTarget?: Readonly<PetSkillTarget>;
  private skillTarget?: Readonly<PetSkillTarget>;
  private skillAction?: MonkeyActionType;
  private readonly normalAttack = new PetNormalAttackDecision();
  private jgaoyiRemaining = 0;
  private jgaoyiFinishing = false;

  constructor(private readonly form: MonkeyPetForm) {}

  createAnimationClock() {
    return createPetMonkeyHorseAnimationClock('monkey', this.form);
  }

  groundMovement() { return getPetMonkeyHorseGroundDefinition('monkey', this.form); }

  enter(context: PetBehaviorContext): void {
    this.projectiles.enter(context);
    if (context.pet.species !== 'monkey' || context.pet.form !== this.form) {
      throw new Error(`Monkey behavior ${this.form} cannot enter ${context.pet.species}:${context.pet.form}.`);
    }
  }

  canMove(context: PetBehaviorContext): boolean {
    return this.jgaoyiRemaining === 0 && bodyAvailable(context);
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target || !bodyAvailable(context)) return undefined;
    if (this.jgaoyiRemaining > 0) return undefined;
    const state = context.pet.skillState;
    const ready = (skill: string, mpCost: number, cooldownMs: number | undefined) =>
      context.pet.skills.includes(skill) && context.pet.mp >= mpCost && cooldownReady(cooldownMs);
    const lyqReady = () => ready('lyq', PetTuning.monkey3LyqMpCost, state?.monkey3Lyq.cooldownMs)
      && Math.hypot(context.target!.x - context.runtime.x, context.target!.y - context.runtime.y)
        <= PetTuning.monkey3LyqMaxDistance;
    switch (this.form) {
      case 1:
        return state?.monkey1Xj.releaseReady && ready('xj', PetTuning.monkey1XjMpCost, state.monkey1Xj.cooldownMs)
          ? { type: 'monkey1-xj' }
          : undefined;
      case 2:
        if (ready('lj', PetTuning.monkey2LjMpCost, state?.monkey2Lj.cooldownMs)) return { type: 'monkey2-lj' };
        return state?.monkey2Xj.releaseReady && ready('xj', PetTuning.monkey2XjMpCost, state.monkey2Xj.cooldownMs)
          ? { type: 'monkey2-xj' }
          : undefined;
      case 3:
        if (lyqReady()) return { type: 'monkey3-lyq' };
        if (ready('xj', PetTuning.monkey3XjMpCost, state?.monkey3Xj.cooldownMs)) return { type: 'monkey3-xj' };
        return state?.monkey3Lj.releaseReady && ready('lj', PetTuning.monkey3LjMpCost, state.monkey3Lj.cooldownMs)
          ? { type: 'monkey3-lj' }
          : undefined;
      case 4:
        if (lyqReady()) return { type: 'monkey3-lyq' };
        if (ready('xj', PetTuning.monkey3XjMpCost, state?.monkey3Xj.cooldownMs)) return { type: 'monkey3-xj' };
        if (state?.monkey3Lj.releaseReady && ready('lj', PetTuning.monkey3LjMpCost, state.monkey3Lj.cooldownMs)) {
          return { type: 'monkey3-lj' };
        }
        return ready('jgaoyi', PetTuning.monkey4JgaoyiMpCost, state?.monkey4Jgaoyi.cooldownMs)
          ? { type: 'monkey4-jgaoyi' }
          : undefined;
    }
  }

  basicAttackRange(_context: PetBehaviorContext): number {
    return attackRangeByForm[this.form];
  }

  basicAttack(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.target || !bodyAvailable(context)) return undefined;
    return { type: 'basic-attack' };
  }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (action.type === 'basic-attack') {
      this.normalTarget = context.target;
      if (context.isLocalOwner && context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
      if (this.form === 4) context.protectFromHits(12);
      return;
    }
    const request = requestByAction[action.type as MonkeyActionType];
    if (!request) throw new Error(`Unsupported monkey behavior action: ${action.type}`);
    const result = context.target
      ? context.castSkillAt(params => request({ ...params, phase: 'prepare' }), context.target)
      : { ok: false, message: 'Monkey skill requires a target' };
    if (result.ok) {
      this.skillTarget = context.target;
      this.skillAction = action.type as MonkeyActionType;
      if (context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
    }
    if (action.type === 'monkey4-jgaoyi' && result.ok) {
      this.jgaoyiRemaining = 5;
      this.jgaoyiFinishing = false;
      context.protectFromHits(20);
      context.protectFromHits(6);
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

  updateEffects(_context: PetBehaviorContext): void {}

  private advanceJgaoyi(context: PetBehaviorContext): void {
    if (this.jgaoyiRemaining <= 0) {
      this.finishJgaoyi(context, 'empty-round');
      return;
    }
    const candidates = context.projectileCombat?.monstersInParentSpace;
    if (!candidates) throw new Error('Monkey jgaoyi requires the original monster-array colipse projection.');
    const visible = candidates().filter(target => target.colliderLeft > 20 && target.colliderLeft < 920);
    if (!visible.length) {
      this.finishJgaoyi(context, 'no-visible-target');
      return;
    }
    const target = visible[Math.floor(context.random() * visible.length)]!;
    const left = context.random() < 0.5;
    context.relocate(toDragonSourceCoordinate(toDragonSourceCoordinate(target.x) + (left ? -50 : 50)),
      toDragonSourceCoordinate(toDragonSourceCoordinate(target.y) - 30));
    context.selectTarget(target);
    context.face(left ? 1 : -1);
    const final = this.jgaoyiRemaining === 1;
    // xj selects a row/attack ID but is overwritten before its enter callback.
    if (!final && context.pet.skills.includes('xj')) context.playAnimation('monkey3-xj');
    const skill = final ? (context.pet.skills.includes('lyq') ? 'monkey3-lyq' : undefined)
      : context.pet.skills.includes('lj') ? 'monkey3-lj' : undefined;
    this.skillTarget = skill ? target : undefined;
    this.skillAction = skill;
    this.normalTarget = skill ? undefined : target;
    context.playAnimation(skill ?? 'basic-attack');
    this.jgaoyiRemaining--;
    this.jgaoyiFinishing = final;
    context.emit({ type: 'jgaoyi-chain-step', payload: {
      targetId: target.id, remaining: this.jgaoyiRemaining, final,
    } });
  }

  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    if (event.reactsToHit === true && !context.isGxp && context.pet.hp > 0) {
      this.normalTarget = undefined;
      this.skillTarget = undefined;
      this.skillAction = undefined;
      const counter = this.normalAttack.counter(context);
      if (counter) {
        context.playAnimation('basic-attack');
        this.executeAction({ type: 'basic-attack' }, context);
      } else if (context.animation?.action === 'hurt') context.restartAnimationCell();
      else context.playAnimation('hurt');
      if (!counter && this.form === 4 && (this.jgaoyiRemaining > 0 || this.jgaoyiFinishing)) {
        this.jgaoyiRemaining = 0; this.jgaoyiFinishing = false;
        context.emit({ type: 'jgaoyi-chain-cancelled', payload: { sourceId: event.sourceId } });
      }
    }
    const state = context.pet.skillState;
    if (this.form === 1 && state) state.monkey1Xj.releaseReady = true;
    if (this.form === 2 && state) state.monkey2Xj.releaseReady = true;
    if (this.form === 3 && state) state.monkey3Lj.releaseReady = true;
    if (this.form === 4 && state) state.monkey3Lj.releaseReady = true;
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
          projectileId: result.projectile?.id,
        }),
      });
    }
    if (event.eventName === 'complete' && event.action === 'basic-attack') this.normalTarget = undefined;
    if (event.eventName === 'hit' && this.skillAction && event.action === this.skillAction && context.isLocalOwner && this.skillTarget) {
      const skill = this.skillAction.split('-')[1];
      if (skill !== 'xj' && skill !== 'lj' && skill !== 'lyq') throw new Error('Unexpected monkey emission');
      const result = this.projectiles.emitMonkeySkill(context, skill, this.skillTarget);
      context.emit({ type: 'skill-emitted', payload: { action: event.action, ok: result.ok,
        projectileId: result.projectile?.projectileId } });
    }

    if (this.form === 4 && event.eventName === 'complete') {
      if (event.action === 'monkey4-jgaoyi') this.advanceJgaoyi(context);
      else if (event.action === 'basic-attack' || event.action === 'monkey3-lyq' || event.action === 'monkey3-lj') {
        if (this.jgaoyiRemaining > 0) context.playAnimation('monkey4-jgaoyi');
        else if (this.jgaoyiFinishing) {
          this.jgaoyiFinishing = false;
          context.emit({ type: 'jgaoyi-chain-finished', payload: { reason: 'complete' } });
        }
      }
    }
    context.emit({ type: 'animation-event', payload: { eventName: event.eventName } });
  }

  destroy(_reason: PetBehaviorDestroyReason): void {
    this.projectiles.destroy();
    this.jgaoyiRemaining = 0;
    this.jgaoyiFinishing = false;
  }

  private finishJgaoyi(context: PetBehaviorContext, reason: string): void {
    this.jgaoyiRemaining = 0;
    this.jgaoyiFinishing = false;
    context.relocate(context.owner.x, context.owner.y - 50);
    context.playAnimation('wait');
    context.emit({ type: 'jgaoyi-chain-finished', payload: { reason } });
  }
}

function cooldownReady(cooldownMs: number | undefined): boolean {
  return (cooldownMs ?? 0) <= 0;
}

function bodyAvailable(context: PetBehaviorContext): boolean {
  const action = context.animation?.action;
  return action === undefined || action === 'wait' || action === 'walk';
}
