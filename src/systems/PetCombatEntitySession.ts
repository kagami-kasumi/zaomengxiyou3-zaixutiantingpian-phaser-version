import type { PetBehavior, PetBehaviorContext } from './PetBehavior';
import type {
  PetCombatEntitySnapshot, PetCombatFrame, PetCombatReleaseReason,
  PetCombatRuntimeEvent, PetCombatSessionPhase, PetCombatSummonHandle, PetCombatSummonRequest,
} from './PetCombatTypes';
import type { PetOwnerSnapshot, PetRuntimeModel, PetSkillTarget, PetState } from './PetTypes';
import { PetCombatTargeting } from './PetCombatTargeting';
import { chasePetRuntimeTarget, createPetRuntime, updatePetRuntime } from './PetRuntimeSystem';
import { tickActivePetSkillState } from './PetSkillTickSystem';
import { PetTuning } from './PetTuning';
import { createPetCombatContext } from './PetCombatContext';
import type { ProjectileSystemModel } from './ProjectileSystem';
import type { PetAnimationClock } from './PetAnimationClock';
import { DefaultGlobalSettings } from './GlobalSettingsSystem';

type EntityPorts = Readonly<{
  publish: (event: Omit<PetCombatRuntimeEvent, 'sequence'>) => void;
  stepChildren: (frame: PetCombatFrame, eventsOnly: boolean) => void;
  releaseChildren: (reason: PetCombatReleaseReason) => void;
  spawnSummon: (request: PetCombatSummonRequest, owner: Readonly<PetOwnerSnapshot>) => PetCombatSummonHandle;
  releaseSummon: (handle: PetCombatSummonHandle, reason: PetCombatReleaseReason) => void;
  summonSnapshots: () => readonly PetCombatEntitySnapshot[];
}>;

// Internal to PetCombatRuntime: one algorithm for its active pet and private summons.
export class PetCombatEntitySession {
  readonly runtime: PetRuntimeModel;
  readonly identity: string;
  phase: PetCombatSessionPhase = 'alive';
  actionToken = 0;
  target: Readonly<PetSkillTarget> | undefined;
  released = false;
  releaseReason: PetCombatReleaseReason | undefined;
  private projectiles: ProjectileSystemModel | undefined;
  private readonly animation: PetAnimationClock | undefined;
  hostTick = 0;
  targetAcquiredThisFrame = false;
  private pendingHostTicks = 0;
  private pendingDamage: NonNullable<PetCombatFrame['damageEvents']>[number][] = [];
  private pendingAnimation: NonNullable<PetCombatFrame['animationEvents']>[number][] = [];

  constructor(
    public pet: PetState,
    readonly runtimeKey: string,
    readonly sourcePetId: string,
    readonly parentRuntimeKey: string | undefined,
    private readonly behavior: PetBehavior,
    private readonly targeting: PetCombatTargeting,
    private readonly ports: EntityPorts,
    owner: Readonly<PetOwnerSnapshot>,
    position?: Readonly<{ x: number; y: number; facingX: -1 | 1 }>,
  ) {
    this.identity = `${pet.id}:${pet.species}:${pet.form}`;
    this.animation = behavior.createAnimationClock?.();
    this.runtime = { ...createPetRuntime(pet, owner), runtimeKey };
    if (position) {
      this.runtime.x = position.x;
      this.runtime.y = position.y;
      this.runtime.facingX = position.facingX;
    }
  }

  enter(owner: Readonly<PetOwnerSnapshot>): void {
    this.publish({ type: 'activated' });
    this.behavior.enter(this.context({
      roster: { pets: [this.pet], selectedIndex: 0, message: '' },
      owner, targets: [], deltaMs: 0,
    }, []));
  }

  update(frame: PetCombatFrame, eventsOnly = false): void {
    if (!this.animation) {
      this.updateFrame(frame, eventsOnly);
      return;
    }
    // An original-clock entity steps its entire shared algorithm once per host
    // tick. Subframe inputs are retained; a long render frame cannot skip AI,
    // emission, child ordering or intermediate death completion.
    if (this.released) return;
    const hostFps = frame.hostFps ?? DefaultGlobalSettings.frameRate;
    this.pendingDamage.push(...(frame.damageEvents ?? []));
    this.pendingAnimation.push(...(frame.animationEvents ?? []));
    this.pendingHostTicks += frame.deltaMs * hostFps / 1000;
    const ticks = Math.floor(this.pendingHostTicks + 1e-9);
    this.pendingHostTicks = Math.max(0, this.pendingHostTicks - ticks);
    for (let tick = 0; tick < ticks && !this.released; tick++) {
      const damageEvents = tick === 0 ? this.pendingDamage.splice(0) : [];
      const animationEvents = tick === 0 ? this.pendingAnimation.splice(0) : [];
      // Preserve descendant events across a partial root tick too. The shared
      // event consumer, rather than this clock buffer, filters the entity key.
      this.updateFrame({ ...frame, deltaMs: 1000 / hostFps, damageEvents, animationEvents }, eventsOnly);
    }
  }

  private updateFrame(frame: PetCombatFrame, eventsOnly: boolean): void {
    if (this.released) return;
    if (frame.projectiles) this.projectiles = frame.projectiles;
    const targets = this.targeting.livingTargets(frame.targets);
    this.consumeDamageEvents(frame, targets);
    if (this.released) return;
    this.consumeAnimationEvents(frame, targets);
    if (this.released) return;
    if (this.pet.hp <= 0 && this.phase === 'alive') this.beginDeath();
    if (this.phase === 'dead-playing' || eventsOnly) {
      if (this.phase === 'dead-playing') this.advanceAnimation(frame, targets);
      if (this.released) return;
      this.ports.stepChildren(frame, true);
      return;
    }

    const targetWasCleared = this.validateStickyTarget(targets);
    this.targetAcquiredThisFrame = false;
    if (!this.target && !targetWasCleared) {
      this.target = this.targeting.orderedFirstTarget(this.runtime, targets, PetTuning.searchRange);
      this.targetAcquiredThisFrame = this.target !== undefined;
    }
    let context = this.context(frame, targets);
    const attackRange = this.behavior.basicAttackRange?.(context);
    if (attackRange !== undefined && (!Number.isFinite(attackRange) || attackRange < 0)) {
      throw new Error(`Pet basic attack range must be finite and non-negative: ${attackRange}`);
    }
    const shouldChaseTarget = this.target !== undefined && attackRange !== undefined
      && this.targeting.distance(this.runtime, this.target) > attackRange;
    if (this.behavior.canMove(context)) {
      if (shouldChaseTarget && this.target && attackRange !== undefined) {
        chasePetRuntimeTarget(this.runtime, this.pet, this.target, attackRange, frame.deltaMs, frame.hostFps);
      } else if (this.target && attackRange !== undefined) {
        this.runtime.facingX = this.targeting.facing(this.runtime, this.target, this.runtime.facingX);
        this.runtime.state = 'idle';
      } else {
        updatePetRuntime(this.runtime, this.pet, frame.owner, frame.deltaMs, frame.hostFps);
      }
      context = this.context(frame, targets);
    }
    const currentAnimation = this.animation?.snapshot().action;
    if (currentAnimation === 'wait' || currentAnimation === 'walk') {
      this.animation!.select(this.runtime.state === 'follow' ? 'walk' : 'wait', this.actionToken);
    }
    let action = this.behavior.selectAction(context);
    if (!action) {
      if (this.target && attackRange !== undefined) {
        if (this.targeting.distance(this.runtime, this.target) <= attackRange) {
          action = this.behavior.basicAttack(context);
        }
      } else {
        action = this.behavior.basicAttack(context);
      }
    }
    if (action) {
      this.actionToken += 1;
      this.animation?.select(action.type, this.actionToken);
      this.behavior.executeAction(action, this.context(frame, targets));
      this.publish({ type: 'action', action: { ...action }, actionToken: this.actionToken });
    }
    this.behavior.updateEffects(context);
    if (this.released) return;
    this.ports.stepChildren(frame, false);
    tickActivePetSkillState(this.pet, frame.deltaMs);
    this.hostTick = (this.hostTick + 1) % 59999;
    this.advanceAnimation(frame, targets);
  }

  animationSnapshot(): ReturnType<PetAnimationClock['snapshot']> | undefined {
    return this.animation?.snapshot();
  }

  playAnimation(action: string): void {
    if (!this.animation) throw new Error('Pet session has no animation clock.');
    this.actionToken++;
    this.animation.select(action, this.actionToken);
    this.publish({ type: 'action', action: { type: action }, actionToken: this.actionToken });
  }

  private advanceAnimation(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): void {
    this.animation?.advance(frame.deltaMs, frame.hostFps ?? DefaultGlobalSettings.frameRate, (event) => {
      this.consumeAnimationEvents({ ...frame, animationEvents: [{
        runtimeKey: this.runtimeKey, actionToken: event.actionToken,
        eventName: event.eventName, action: event.action, setStatic: event.setStatic,
      }] }, targets);
    });
  }

  snapshot(): PetCombatEntitySnapshot {
    return Object.freeze({
      petId: this.pet.id, species: this.pet.species, form: this.pet.form,
      runtime: Object.freeze({ ...this.runtime }),
      target: this.target ? Object.freeze({ ...this.target }) : undefined,
      phase: this.phase, actionToken: this.actionToken,
      parentRuntimeKey: this.parentRuntimeKey, sourcePetId: this.sourcePetId,
      hp: this.pet.hp, maxHp: this.pet.maxHp, mp: this.pet.mp, maxMp: this.pet.maxMp,
      animation: this.animation?.snapshot(),
    });
  }

  release(reason: PetCombatReleaseReason): void {
    if (this.released) return;
    this.released = true;
    this.releaseReason = reason;
    this.behavior.destroy(reason);
    this.ports.releaseChildren(reason);
    if (this.parentRuntimeKey && this.projectiles) {
      this.projectiles.projectiles = this.projectiles.projectiles.filter(({ sourceId }) => sourceId !== this.pet.id);
    }
    this.publish({ type: 'deactivated', reason });
  }

  private consumeDamageEvents(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): void {
    if (this.phase !== 'alive') return;
    for (const event of frame.damageEvents ?? []) {
      if (event.runtimeKey !== this.runtimeKey) continue;
      this.pet.hp = Math.max(0, this.pet.hp - event.amount);
      this.behavior.onDamaged(event, this.context(frame, targets));
      if (this.pet.hp <= 0) {
        this.beginDeath();
        return;
      }
    }
  }

  private consumeAnimationEvents(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): void {
    for (const event of frame.animationEvents ?? []) {
      if (this.released) return;
      if (event.runtimeKey !== this.runtimeKey || event.actionToken !== this.actionToken) continue;
      if (event.eventName === 'complete' && event.setStatic) this.runtime.state = 'idle';
      this.behavior.onAnimationEvent(event, this.context(frame, targets));
      if (this.phase === 'dead-playing' && event.eventName === 'dead-complete') {
        this.release('dead-complete');
        return;
      }
    }
  }

  private beginDeath(): void {
    if (this.phase !== 'alive') return;
    this.phase = 'dead-playing';
    this.target = undefined;
    this.actionToken += 1;
    this.animation?.select('dead', this.actionToken);
    this.publish({ type: 'action', action: { type: 'dead' }, actionToken: this.actionToken });
  }

  private validateStickyTarget(targets: readonly Readonly<PetSkillTarget>[]): boolean {
    if (!this.target) return false;
    const current = targets.find(({ id }) => id === this.target?.id);
    if (current && this.targeting.distance(this.runtime, current) < PetTuning.searchRange) {
      this.target = current;
      return false;
    }
    this.target = undefined;
    return true;
  }

  private context(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): PetBehaviorContext {
    return createPetCombatContext(this, frame, targets, {
      ...this.ports,
      emit: (behaviorEvent) => this.publish({ type: 'behavior', behaviorEvent }),
    });
  }

  private publish(event: Omit<PetCombatRuntimeEvent, 'sequence'>): void {
    this.ports.publish({
      ...event, petId: this.pet.id, runtimeKey: this.runtimeKey,
      sourcePetId: this.sourcePetId, parentRuntimeKey: this.parentRuntimeKey,
    });
  }
}

export function validatePetCombatFrame(frame: PetCombatFrame): void {
  if (frame.hostFps !== undefined && (!Number.isFinite(frame.hostFps) || frame.hostFps <= 0)) {
    throw new Error('Pet combat hostFps must be finite and positive.');
  }
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
