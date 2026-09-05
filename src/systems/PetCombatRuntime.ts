import { PetBehaviorRegistry } from './PetBehaviorRegistry';
import { PetCombatTargeting } from './PetCombatTargeting';
import { createDefaultPetBehaviorRegistry } from './pet-behaviors/createDefaultPetBehaviorRegistry';
import { PetCombatEntitySession, validatePetCombatFrame } from './PetCombatEntitySession';
import type {
  PetCombatEntitySnapshot, PetCombatFrame, PetCombatReleaseReason, PetCombatRuntimeEvent,
  PetCombatSnapshot, PetCombatSummonHandle, PetCombatSummonRequest,
} from './PetCombatTypes';
import type { PetOwnerSnapshot, PetState } from './PetTypes';

export type {
  PetCombatFrame, PetCombatRuntimeEvent, PetCombatSessionPhase, PetCombatSnapshot,
} from './PetCombatTypes';

let nextRuntimeId = 1;

export class PetCombatRuntime {
  private readonly instanceId = nextRuntimeId++;
  private nextEntityId = 1;
  private active: PetCombatEntitySession | undefined;
  private readonly entities = new Map<string, PetCombatEntitySession>();
  private completedDeadIdentity: string | undefined;
  private publishedEvents: PetCombatRuntimeEvent[] = [];
  private nextEventSequence = 1;
  private destroyed = false;

  constructor(
    private readonly registry: PetBehaviorRegistry = createDefaultPetBehaviorRegistry(),
    private readonly targeting: PetCombatTargeting = new PetCombatTargeting(),
  ) {}

  update(frame: PetCombatFrame): PetCombatSnapshot {
    if (this.destroyed) return this.snapshot();
    validatePetCombatFrame(frame);
    this.publishedEvents = [];
    const activePet = frame.roster.pets.find((pet) => (
      pet.isActive && pet.lifetime > 0
      && !(pet.hp <= 0 && this.completedDeadIdentity === `${pet.id}:${pet.species}:${pet.form}`)
    ));
    this.synchronizePet(activePet, frame.owner);
    if (!this.active) return this.snapshot();
    this.stepEntity(this.active, frame);
    return this.snapshot();
  }

  snapshot(): PetCombatSnapshot {
    const active = this.active?.snapshot();
    return Object.freeze({
      destroyed: this.destroyed,
      petId: active?.petId, species: active?.species, form: active?.form,
      runtime: active?.runtime, target: active?.target, phase: active?.phase,
      actionToken: active?.actionToken,
      animation: active?.animation,
      summons: Object.freeze([...this.entities.values()]
        .filter((entity) => entity.parentRuntimeKey && !entity.released)
        .map((entity) => entity.snapshot())),
    });
  }

  events(): readonly PetCombatRuntimeEvent[] {
    return Object.freeze(this.publishedEvents.map((event) => Object.freeze({ ...event })));
  }

  destroy(): void {
    if (this.destroyed) return;
    this.publishedEvents = [];
    if (this.active) this.releaseEntity(this.active, 'runtime-destroyed');
    this.destroyed = true;
    this.publish({ type: 'destroyed' });
  }

  private synchronizePet(pet: PetState | undefined, owner: Readonly<PetOwnerSnapshot>): void {
    if (!pet) {
      if (this.active) this.releaseEntity(this.active, 'inactive');
      return;
    }
    const identity = `${pet.id}:${pet.species}:${pet.form}`;
    if (this.active?.identity === identity) {
      this.active.pet = pet;
      return;
    }
    // Resolve before releasing the current session: failed selection leaves it intact.
    const behavior = this.registry.resolve(pet.species, pet.form);
    if (this.active) this.releaseEntity(this.active, 'replaced');
    const key = `${identity}:session:${this.instanceId}:${this.nextEntityId++}`;
    const entity = new PetCombatEntitySession(
      pet, key, pet.id, undefined, behavior, this.targeting, this.entityPorts(key), owner,
    );
    this.active = entity;
    this.entities.set(key, entity);
    entity.enter(owner);
  }

  private entityPorts(key: string) {
    return {
      publish: (event: Omit<PetCombatRuntimeEvent, 'sequence'>) => this.publish(event),
      stepChildren: (frame: PetCombatFrame, eventsOnly: boolean) => {
        for (const child of this.childrenOf(key)) this.stepEntity(child, frame, eventsOnly);
      },
      releaseChildren: (reason: PetCombatReleaseReason) => {
        for (const child of this.childrenOf(key)) this.releaseEntity(child, reason);
      },
      spawnSummon: (request: PetCombatSummonRequest, owner: Readonly<PetOwnerSnapshot>) => this.spawnSummon(key, request, owner),
      releaseSummon: (handle: PetCombatSummonHandle, reason: PetCombatReleaseReason) => {
        const child = this.entities.get(handle.runtimeKey);
        if (child?.parentRuntimeKey === key && handle.parentRuntimeKey === key
          && child.pet.id === handle.petId && child.sourcePetId === handle.sourcePetId) {
          this.releaseEntity(child, reason);
        }
      },
      summonSnapshots: (): readonly PetCombatEntitySnapshot[] => Object.freeze(
        this.childrenOf(key).map((entity) => entity.snapshot()),
      ),
    };
  }

  private spawnSummon(
    parentKey: string, request: PetCombatSummonRequest, owner: Readonly<PetOwnerSnapshot>,
  ): PetCombatSummonHandle {
    const parent = this.entities.get(parentKey);
    if (!parent || parent.released || parent.phase !== 'alive' || this.destroyed) {
      throw new Error('Cannot summon from a released pet combat session.');
    }
    if (!Number.isFinite(request.x) || !Number.isFinite(request.y)
      || ![-1, 1].includes(request.facingX)) throw new Error('Pet summon position must be finite.');
    const behavior = this.registry.resolve(request.pet.species, request.pet.form);
    const key = `${parentKey}:summon:${this.nextEntityId++}`;
    const pet: PetState = { ...structuredClone(request.pet), id: key, isActive: true };
    const child = new PetCombatEntitySession(
      pet, key, parent.sourcePetId, parentKey, behavior, this.targeting,
      this.entityPorts(key), owner, request,
    );
    this.entities.set(key, child);
    try {
      child.enter(owner);
    } catch (error) {
      this.releaseEntity(child, 'dismissed');
      throw error;
    }
    return Object.freeze({
      runtimeKey: key, petId: pet.id, parentRuntimeKey: parentKey, sourcePetId: parent.sourcePetId,
    });
  }

  private childrenOf(key: string): PetCombatEntitySession[] {
    return [...this.entities.values()].filter((entity) => (
      entity.parentRuntimeKey === key && !entity.released
    ));
  }

  private stepEntity(entity: PetCombatEntitySession, frame: PetCombatFrame, eventsOnly = false): void {
    if (entity.released || !this.entities.has(entity.runtimeKey)) return;
    entity.update(frame, eventsOnly);
    if (entity.released) this.forgetEntity(entity);
  }

  private releaseEntity(entity: PetCombatEntitySession, reason: PetCombatReleaseReason): void {
    entity.release(reason);
    this.forgetEntity(entity);
  }

  private forgetEntity(entity: PetCombatEntitySession): void {
    this.entities.delete(entity.runtimeKey);
    if (this.active === entity) {
      if (entity.releaseReason === 'dead-complete') this.completedDeadIdentity = entity.identity;
      this.active = undefined;
    }
  }

  private publish(event: Omit<PetCombatRuntimeEvent, 'sequence'>): void {
    this.publishedEvents.push(Object.freeze({ ...event, sequence: this.nextEventSequence++ }));
  }
}
