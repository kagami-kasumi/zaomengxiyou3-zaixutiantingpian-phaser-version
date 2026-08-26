import type {
  PetBehavior,
  PetBehaviorAction,
  PetBehaviorContext,
  PetBehaviorDestroyReason,
  PetBehaviorEvent,
  PetCombatAnimationEvent,
  PetCombatDamageEvent,
} from './PetBehavior';
import { PetBehaviorRegistry } from './PetBehaviorRegistry';
import { PetCombatTargeting } from './PetCombatTargeting';
import { createDefaultPetBehaviorRegistry } from './pet-behaviors/createDefaultPetBehaviorRegistry';
import { createPetRuntime, updatePetRuntime } from './PetRuntimeSystem';
import { tickActivePetSkillState } from './PetSkillTickSystem';
import { PetTuning } from './PetTuning';
import { requestPetMonkeyBasicAttack } from './PetMonkeyCombatSystem';
import type { ProjectileSystemModel } from './ProjectileSystem';
import type {
  PetOwnerSnapshot,
  PetRoster,
  PetRuntimeModel,
  PetSkillRandomSource,
  PetSkillTarget,
  PetState,
} from './PetTypes';

export type PetCombatFrame = Readonly<{
  roster: PetRoster;
  owner: Readonly<PetOwnerSnapshot>;
  targets: readonly PetSkillTarget[];
  projectiles?: ProjectileSystemModel;
  random?: PetSkillRandomSource;
  damageEvents?: readonly PetCombatDamageEvent[];
  animationEvents?: readonly PetCombatAnimationEvent[];
  deltaMs: number;
}>;

export type PetCombatSessionPhase = 'alive' | 'dead-playing';

export type PetCombatRuntimeEvent = Readonly<{
  sequence: number;
  type: 'activated' | 'deactivated' | 'action' | 'behavior' | 'destroyed';
  petId?: string;
  reason?: PetBehaviorDestroyReason;
  action?: PetBehaviorAction;
  behaviorEvent?: PetBehaviorEvent;
  actionToken?: number;
}>;

export type PetCombatSnapshot = Readonly<{
  destroyed: boolean;
  petId?: string;
  species?: string;
  form?: number;
  runtime?: Readonly<PetRuntimeModel>;
  target?: Readonly<PetSkillTarget>;
  phase?: PetCombatSessionPhase;
  actionToken?: number;
}>;

export class PetCombatRuntime {
  private readonly targeting: PetCombatTargeting;
  private behavior: PetBehavior | undefined;
  private pet: PetState | undefined;
  private runtime: PetRuntimeModel | undefined;
  private target: Readonly<PetSkillTarget> | undefined;
  private phase: PetCombatSessionPhase | undefined;
  private actionToken = 0;
  private completedDeadRuntimeKey: string | undefined;
  private publishedEvents: PetCombatRuntimeEvent[] = [];
  private nextEventSequence = 1;
  private destroyed = false;

  constructor(
    private readonly registry: PetBehaviorRegistry = createDefaultPetBehaviorRegistry(),
    targeting: PetCombatTargeting = new PetCombatTargeting(),
  ) {
    this.targeting = targeting;
  }

  update(frame: PetCombatFrame): PetCombatSnapshot {
    if (this.destroyed) return this.snapshot();
    this.validateFrame(frame);
    this.publishedEvents = [];

    const activePet = frame.roster.pets.find((pet) => (
      pet.isActive
      && pet.lifetime > 0
      && !(pet.hp <= 0 && this.completedDeadRuntimeKey === `${pet.id}:${pet.species}:${pet.form}`)
    ));
    this.synchronizePet(activePet, frame.owner);
    if (!this.pet || !this.runtime || !this.behavior) return this.snapshot();

    const targets = this.targeting.livingTargets(frame.targets);
    this.consumeDamageEvents(frame, targets);
    if (!this.pet || !this.runtime || !this.behavior) return this.snapshot();
    this.consumeAnimationEvents(frame, targets);
    if (!this.pet || !this.runtime || !this.behavior) return this.snapshot();

    if (this.pet.hp <= 0 && this.phase === 'alive') this.beginDeath();
    if (this.phase === 'dead-playing') return this.snapshot();

    const targetWasCleared = this.validateStickyTarget(targets);
    if (!this.target && !targetWasCleared) {
      this.target = this.targeting.orderedFirstTarget(
        this.runtime,
        targets,
        PetTuning.searchRange,
      );
    }

    let context = this.createBehaviorContext(frame, targets);
    if (this.behavior.canMove(context)) {
      updatePetRuntime(this.runtime, this.pet, frame.owner, frame.deltaMs);
      context = this.createBehaviorContext(frame, targets);
    }

    const action = this.behavior.selectAction(context) ?? this.behavior.basicAttack(context);
    if (action) {
      this.actionToken += 1;
      this.behavior.executeAction(action, context);
      this.publish({
        type: 'action',
        petId: this.pet.id,
        action: { ...action },
        actionToken: this.actionToken,
      });
    }
    this.behavior.updateEffects(context);
    tickActivePetSkillState(this.pet, frame.deltaMs);
    return this.snapshot();
  }

  snapshot(): PetCombatSnapshot {
    return Object.freeze({
      destroyed: this.destroyed,
      petId: this.pet?.id,
      species: this.pet?.species,
      form: this.pet?.form,
      runtime: this.runtime ? Object.freeze({ ...this.runtime }) : undefined,
      target: this.target ? Object.freeze({ ...this.target }) : undefined,
      phase: this.phase,
      actionToken: this.pet ? this.actionToken : undefined,
    });
  }

  events(): readonly PetCombatRuntimeEvent[] {
    return Object.freeze(this.publishedEvents.map((event) => Object.freeze({ ...event })));
  }

  destroy(): void {
    if (this.destroyed) return;
    this.publishedEvents = [];
    this.releaseBehavior('runtime-destroyed');
    this.destroyed = true;
    this.publish({ type: 'destroyed' });
  }

  private synchronizePet(
    activePet: PetState | undefined,
    owner: Readonly<PetOwnerSnapshot>,
  ): void {
    if (!activePet) {
      this.releaseBehavior('inactive');
      return;
    }

    const runtimeKey = `${activePet.id}:${activePet.species}:${activePet.form}`;
    const changed = !this.pet || !this.runtime || this.runtime.runtimeKey !== runtimeKey;
    if (!changed) {
      this.pet = activePet;
      return;
    }

    const nextBehavior = this.registry.resolve(activePet.species, activePet.form);
    this.releaseBehavior(this.pet ? 'replaced' : 'inactive');
    this.pet = activePet;
    this.runtime = createPetRuntime(activePet, owner);
    this.behavior = nextBehavior;
    this.phase = 'alive';
    this.actionToken = 0;
    this.publish({ type: 'activated', petId: activePet.id });
    this.behavior.enter(this.createBehaviorContext({
      roster: { pets: [activePet], selectedIndex: 0, message: '' },
      owner,
      targets: [],
      deltaMs: 0,
    }, []));
  }

  private releaseBehavior(reason: PetBehaviorDestroyReason): void {
    const petId = this.pet?.id;
    if (this.behavior) this.behavior.destroy(reason);
    if (petId) this.publish({ type: 'deactivated', petId, reason });
    this.behavior = undefined;
    this.pet = undefined;
    this.runtime = undefined;
    this.target = undefined;
    this.phase = undefined;
    this.actionToken = 0;
  }

  private consumeDamageEvents(
    frame: PetCombatFrame,
    targets: readonly Readonly<PetSkillTarget>[],
  ): void {
    if (!this.pet || !this.runtime || !this.behavior || this.phase !== 'alive') return;
    for (const event of frame.damageEvents ?? []) {
      if (event.runtimeKey !== this.runtime.runtimeKey) continue;
      this.pet.hp = Math.max(0, this.pet.hp - event.amount);
      const context = this.createBehaviorContext(frame, targets);
      this.behavior.onDamaged(event, context);
      if (this.pet.hp <= 0) {
        this.beginDeath();
        return;
      }
    }
  }

  private consumeAnimationEvents(
    frame: PetCombatFrame,
    targets: readonly Readonly<PetSkillTarget>[],
  ): void {
    if (!this.runtime || !this.behavior) return;
    for (const event of frame.animationEvents ?? []) {
      if (event.runtimeKey !== this.runtime.runtimeKey || event.actionToken !== this.actionToken) continue;
      const context = this.createBehaviorContext(frame, targets);
      this.behavior.onAnimationEvent(event, context);
      if (this.phase === 'dead-playing' && event.eventName === 'dead-complete') {
        this.completedDeadRuntimeKey = this.runtime.runtimeKey;
        this.releaseBehavior('dead-complete');
        return;
      }
    }
  }

  private beginDeath(): void {
    if (!this.pet || this.phase !== 'alive') return;
    this.phase = 'dead-playing';
    this.target = undefined;
    this.actionToken += 1;
    this.publish({
      type: 'action',
      petId: this.pet.id,
      action: { type: 'dead' },
      actionToken: this.actionToken,
    });
  }

  private validateStickyTarget(targets: readonly Readonly<PetSkillTarget>[]): boolean {
    if (!this.target || !this.runtime) return false;
    const current = targets.find(({ id }) => id === this.target?.id);
    if (current && this.targeting.distance(this.runtime, current) < PetTuning.searchRange) {
      this.target = current;
      return false;
    }
    this.target = undefined;
    return true;
  }

  private createBehaviorContext(
    frame: PetCombatFrame,
    targets: readonly Readonly<PetSkillTarget>[],
  ): PetBehaviorContext {
    if (!this.pet || !this.runtime) throw new Error('Pet behavior context requires an active pet.');
    const petId = this.pet.id;
    return Object.freeze({
      pet: this.pet,
      owner: Object.freeze({ ...frame.owner }),
      runtime: Object.freeze({ ...this.runtime }),
      targets: Object.freeze([...targets]),
      target: this.target,
      deltaMs: frame.deltaMs,
      random: frame.random ?? Math.random,
      castSkill: (request) => {
        if (!frame.projectiles) {
          throw new Error(`Pet behavior ${this.pet?.species}:${this.pet?.form} requires projectiles.`);
        }
        if (!this.runtime) throw new Error('Pet behavior skill cast requires an active runtime.');
        return request({
          roster: frame.roster,
          runtime: this.runtime,
          targets,
          projectiles: frame.projectiles,
          random: frame.random,
        });
      },
      castSkillAt: (request, target) => {
        if (!frame.projectiles) {
          throw new Error(`Pet behavior ${this.pet?.species}:${this.pet?.form} requires projectiles.`);
        }
        if (!this.runtime) throw new Error('Pet behavior skill cast requires an active runtime.');
        return request({
          roster: frame.roster,
          runtime: this.runtime,
          targets: [target],
          projectiles: frame.projectiles,
          random: frame.random,
        });
      },
      castBasicAttack: () => {
        if (!frame.projectiles) {
          throw new Error(`Pet behavior ${this.pet?.species}:${this.pet?.form} requires projectiles.`);
        }
        if (!this.runtime || !this.target) {
          throw new Error('Pet behavior basic attack requires an active runtime and target.');
        }
        return requestPetMonkeyBasicAttack({
          roster: frame.roster,
          runtime: this.runtime,
          target: this.target,
          projectiles: frame.projectiles,
          random: frame.random,
        });
      },
      relocate: (x, y) => {
        if (!this.runtime || !Number.isFinite(x) || !Number.isFinite(y)) {
          throw new Error('Pet behavior relocation requires a finite active runtime point.');
        }
        this.runtime.x = x;
        this.runtime.y = y;
      },
      emit: (behaviorEvent: PetBehaviorEvent) => {
        this.publish({
          type: 'behavior',
          petId,
          behaviorEvent: Object.freeze({ ...behaviorEvent }),
        });
      },
    });
  }

  private publish(event: Omit<PetCombatRuntimeEvent, 'sequence'>): void {
    this.publishedEvents.push(Object.freeze({
      ...event,
      sequence: this.nextEventSequence,
    }));
    this.nextEventSequence += 1;
  }

  private validateFrame(frame: PetCombatFrame): void {
    if (!Number.isFinite(frame.deltaMs) || frame.deltaMs < 0) {
      throw new Error(`Pet combat deltaMs must be finite and non-negative: ${frame.deltaMs}`);
    }
    if (!Number.isFinite(frame.owner.x) || !Number.isFinite(frame.owner.y)) {
      throw new Error('Pet combat owner coordinates must be finite.');
    }
    for (const target of frame.targets) {
      if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) {
        throw new Error(`Pet combat target coordinates must be finite: ${target.id}`);
      }
    }
    for (const event of frame.damageEvents ?? []) {
      if (!Number.isFinite(event.amount) || event.amount < 0) {
        throw new Error(`Pet combat damage must be finite and non-negative: ${event.amount}`);
      }
    }
    for (const event of frame.animationEvents ?? []) {
      if (!Number.isSafeInteger(event.actionToken) || event.actionToken < 0) {
        throw new Error(`Pet combat action token must be a non-negative integer: ${event.actionToken}`);
      }
    }
  }
}
