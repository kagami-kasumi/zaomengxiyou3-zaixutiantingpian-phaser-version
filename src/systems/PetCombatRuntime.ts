import type {
  PetBehavior,
  PetBehaviorAction,
  PetBehaviorContext,
  PetBehaviorDestroyReason,
  PetBehaviorEvent,
} from './PetBehavior';
import { PetBehaviorRegistry } from './PetBehaviorRegistry';
import { PetCombatTargeting } from './PetCombatTargeting';
import { createPetRuntime, updatePetRuntime } from './PetRuntimeSystem';
import type {
  PetOwnerSnapshot,
  PetRoster,
  PetRuntimeModel,
  PetSkillTarget,
  PetState,
} from './PetTypes';

export type PetCombatFrame = Readonly<{
  roster: Readonly<PetRoster>;
  owner: Readonly<PetOwnerSnapshot>;
  targets: readonly PetSkillTarget[];
  deltaMs: number;
}>;

export type PetCombatRuntimeEvent = Readonly<{
  sequence: number;
  type: 'activated' | 'deactivated' | 'action' | 'behavior' | 'destroyed';
  petId?: string;
  reason?: PetBehaviorDestroyReason;
  action?: PetBehaviorAction;
  behaviorEvent?: PetBehaviorEvent;
}>;

export type PetCombatSnapshot = Readonly<{
  destroyed: boolean;
  petId?: string;
  species?: string;
  form?: number;
  runtime?: Readonly<PetRuntimeModel>;
  target?: Readonly<PetSkillTarget>;
}>;

export class PetCombatRuntime {
  private readonly targeting: PetCombatTargeting;
  private behavior: PetBehavior | undefined;
  private pet: PetState | undefined;
  private runtime: PetRuntimeModel | undefined;
  private target: Readonly<PetSkillTarget> | undefined;
  private publishedEvents: PetCombatRuntimeEvent[] = [];
  private nextEventSequence = 1;
  private destroyed = false;

  constructor(
    private readonly registry: PetBehaviorRegistry,
    targeting: PetCombatTargeting = new PetCombatTargeting(),
  ) {
    this.targeting = targeting;
  }

  update(frame: PetCombatFrame): PetCombatSnapshot {
    if (this.destroyed) return this.snapshot();
    this.validateFrame(frame);
    this.publishedEvents = [];

    const activePet = frame.roster.pets.find((pet) => (
      pet.isActive && pet.lifetime > 0 && pet.hp > 0
    ));
    this.synchronizePet(activePet, frame.owner);
    if (!this.pet || !this.runtime || !this.behavior) return this.snapshot();

    updatePetRuntime(this.runtime, this.pet, frame.owner, frame.deltaMs);
    const targets = this.targeting.livingTargets(frame.targets);
    this.target = this.targeting.nearestTarget(this.runtime, targets);
    const context = this.createBehaviorContext(frame, targets);
    const action = this.behavior.selectAction(context);
    if (action) {
      this.behavior.executeAction(action, context);
      this.publish({ type: 'action', petId: this.pet.id, action: { ...action } });
    }
    this.behavior.updateEffects(context);
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
  }
}
