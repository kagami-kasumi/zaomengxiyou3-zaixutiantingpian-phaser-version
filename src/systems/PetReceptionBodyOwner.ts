import body from '../assets/pet-reception-body.json';
import { receiveCurrentOwnedPetMonsterDamage } from './PetBattleOwnershipSystem';
import { rejectPetMonsterReception } from './PetMonsterDamageReception';
import type { PetMonsterReceptionEffect } from './PetMonsterDamageReception';
import type { MonsterDamageRequest } from './MonsterDamageReception';
import type { MonsterReceptionTarget } from './MonsterAttackReception';
import type { PetRuntimeModel, PetState } from './PetTypes';
import { PetReceptionBodyClock, type PetReceptionBodyEntry, type PetReceptionBodyForm } from './PetReceptionBodyClock';

export type PetReceptionBodyPorts = Readonly<{
  setStatic(): void;
  cleanup(kind: 'tiger-combo' | 'mouse-combo' | 'phoenix-aoyi'): void;
  /** Optional attack-owner handoff; this bounded body component never emits attacks. */
  counter?(): void;
  changed?(): void;
  settled?(request: MonsterDamageRequest, result: PetMonsterReceptionEffect): void;
  release(reason: 'dead-complete' | 'replaced' | 'owner-exit'): void;
}>;

/** Metadata on the existing compatibility runtime, not another roster or AI owner. */
const owners = new WeakMap<PetRuntimeModel, PetReceptionBodyOwner>();

export function petReceptionBodyForm(pet: Pick<PetState, 'species' | 'form'>): PetReceptionBodyForm | undefined {
  const id = `${pet.species}${pet.form}`;
  return Object.hasOwn(body.forms, id) ? id as PetReceptionBodyForm : undefined;
}

export function readPetReceptionBody(runtime: PetRuntimeModel | undefined): PetReceptionBodyOwner | undefined {
  return runtime && owners.get(runtime);
}

export function attachPetReceptionBody(pet: PetState, runtime: PetRuntimeModel,
  ports: PetReceptionBodyPorts, entry?: PetReceptionBodyEntry): PetReceptionBodyOwner {
  const form = petReceptionBodyForm(pet);
  if (!form || runtime.petId !== pet.id) throw new Error('Pet reception body requires its current compatibility owner');
  const previous = owners.get(runtime);
  if (previous?.pet === pet && previous.form === form) return previous;
  previous?.release('replaced');
  const owner = new PetReceptionBodyOwner(pet, runtime, form, ports, entry);
  owners.set(runtime, owner);
  return owner;
}

export class PetReceptionBodyOwner {
  private readonly clock: PetReceptionBodyClock;
  private phase: 'alive' | 'dead-playing' | 'released' = 'alive';
  private protectionCount = -1;
  private pendingTicks = 0;
  private ports: PetReceptionBodyPorts | undefined;

  constructor(readonly pet: PetState, private readonly runtime: PetRuntimeModel,
    readonly form: PetReceptionBodyForm, ports: PetReceptionBodyPorts, entry?: PetReceptionBodyEntry) {
    this.ports = ports;
    this.clock = new PetReceptionBodyClock(form, entry, {
      setStatic: () => this.ports?.setStatic(),
      cleanup: kind => this.ports?.cleanup(kind),
      destroy: () => this.release('dead-complete'),
    });
  }

  target(isCurrent: () => boolean, readCounterChance: () => number | undefined): MonsterReceptionTarget {
    return { ids: this.runtime.monsterHitIds ??= [], receive: request => {
      if (!isCurrent() || owners.get(this.runtime) !== this || this.phase !== 'alive' || this.protectionCount >= 0) {
        return rejectPetMonsterReception(this.pet, this.clock.snapshot().action);
      }
      return this.receive(request, readCounterChance());
    } };
  }

  receive(request: MonsterDamageRequest, counterChance?: number) {
    const prior = this.clock.snapshot().action;
    if (this.phase !== 'alive' || this.protectionCount >= 0) return rejectPetMonsterReception(this.pet, prior);
    const result = receiveCurrentOwnedPetMonsterDamage(this.pet, this.runtime,
      { action: prior, protected: false, gxp: false, counterChance }, request);
    if (!result.missed && (result.accepted || result.returnVoid)) {
      if (result.protectionTicks !== undefined) this.protectFromHits(result.protectionTicks);
      if (result.action === 'dead') {
        this.phase = 'dead-playing';
        this.clock.select('dead');
      } else if (result.action === 'hurt') {
        if (prior === 'hurt') this.clock.repeatHurt();
        else this.clock.select('hurt');
      } else if (result.action === 'hit1') {
        this.clock.requestCounter();
        this.ports?.counter?.();
      }
      this.ports?.settled?.(request, result);
      this.ports?.changed?.();
    }
    return result;
  }

  update(deltaMs: number, hostFps: number): void {
    if (!Number.isFinite(deltaMs) || deltaMs < 0 || !Number.isFinite(hostFps) || hostFps <= 0) {
      throw new Error('Pet reception owner requires a valid host clock');
    }
    if (this.phase === 'released') return;
    this.pendingTicks += deltaMs * hostFps / 1000;
    const ticks = Math.floor(this.pendingTicks + 1e-9);
    this.pendingTicks = Math.max(0, this.pendingTicks - ticks);
    for (let tick = 0; tick < ticks; tick++) {
      this.clock.step(hostFps);
      // Original BaseObject steps BBDC before protection; destroy clears the
      // value immediately. No animation or timer remains active after release.
      if (this.snapshot().phase === 'released') break;
      if (this.protectionCount >= 0) this.protectionCount--;
    }
  }

  /** BBDC pause only; Scene pause is represented by not advancing this owner. */
  pauseBody(): void { this.clock.pause(); }
  resumeBody(): void { this.clock.resume(); }

  synchronizeTransformation(): void {
    if (this.phase === 'alive') this.clock.synchronizeTransformation(
      (this.pet.skillState?.phoenix1Np.transformationRemainingMs ?? 0) > 0);
  }

  protectFromHits(hostTicks: number): void {
    if (!Number.isSafeInteger(hostTicks) || hostTicks < 0) throw new Error('Invalid pet protection host count');
    if (this.phase !== 'released') this.protectionCount = hostTicks;
  }

  release(reason: 'dead-complete' | 'replaced' | 'owner-exit'): void {
    if (this.phase === 'released') return;
    this.phase = 'released';
    this.protectionCount = -1;
    this.pendingTicks = 0;
    const ports = this.ports;
    this.ports = undefined;
    ports?.release(reason);
  }

  snapshot() {
    return Object.freeze({ ...this.clock.snapshot(), phase: this.phase,
      protectionCount: this.protectionCount, protectedFromHits: this.protectionCount >= 0 });
  }
}
