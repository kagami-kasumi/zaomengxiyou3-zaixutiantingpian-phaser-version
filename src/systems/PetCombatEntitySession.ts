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
import { PetGroundSessionMovement } from './PetGroundSessionMovement';
import { PetGroundOwnerAnchors } from '../assets/PetGroundEnvironmentAssets';
import type { PetBehaviorAction } from './PetBehavior';
import { recordIncomingDamageFeedback } from './IncomingDamageFeedbackSystem';
import { refreshTurtleLink, stepTurtleLink, isTurtleLinkPaired, detachTurtleLink, type PetTurtleLinkBuff } from './PetTurtleLinkSystem';

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
  private readonly ground: PetGroundSessionMovement | undefined;
  hostTick = 0;
  targetAcquiredThisFrame = false;
  private pendingHostTicks = 0;
  private turtleLink?: PetTurtleLinkBuff;
  private latestFrame?: PetCombatFrame;
  private ownerCombat?: PetCombatFrame['ownerCombat'];
  private protectionCount = -1;
  private pendingDamage: NonNullable<PetCombatFrame['damageEvents']>[number][] = [];
  private pendingAnimation: NonNullable<PetCombatFrame['animationEvents']>[number][] = [];

  /** Delayed source callbacks read the latest entity input, not their captured frame. */
  currentGxp(fallback: PetCombatFrame): boolean {
    return (this.latestFrame ?? fallback).gxpRuntimeKeys?.includes(this.runtimeKey) ?? false;
  }

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
    ownerRootOffsetY = 0,
  ) {
    this.identity = `${pet.id}:${pet.species}:${pet.form}`;
    this.animation = behavior.createAnimationClock?.();
    this.runtime = { ...createPetRuntime(pet, owner), runtimeKey };
    const groundDefinition = behavior.groundMovement?.();
    if (groundDefinition) {
      if (!this.animation) throw new Error('Ground pet requires a host animation clock');
      this.ground = new PetGroundSessionMovement(this.runtime, groundDefinition);
      this.runtime.x = owner.x;
      this.runtime.y = owner.y + ownerRootOffsetY + PetGroundOwnerAnchors.spawnOffsetY;
      if (groundDefinition.initialFacingX !== undefined) this.runtime.facingX = groundDefinition.initialFacingX;
    }
    if (position) {
      this.runtime.x = position.x;
      this.runtime.y = position.y;
      this.runtime.facingX = position.facingX;
    }
  }

  enter(owner: Readonly<PetOwnerSnapshot>, initialAction?: PetBehaviorAction): void {
    this.publish({ type: 'activated' });
    const context = () => this.context({
      roster: { pets: [this.pet], selectedIndex: 0, message: '' },
      owner, targets: [], deltaMs: 0,
    }, []);
    this.behavior.enter(context());
    if (initialAction) {
      this.playAnimation(initialAction.type);
      this.behavior.executeAction(initialAction, context());
    }
  }

  update(frame: PetCombatFrame, eventsOnly = false): void {
    if (frame.ownerCombat) {
      if (this.ownerCombat && this.ownerCombat !== frame.ownerCombat) throw new Error('Pet combat owner cannot change within a session');
      this.ownerCombat = frame.ownerCombat;
      if (this.turtleLink) {
        this.turtleLink.pet = this.pet;
        if (frame.ownerCombat.turtleLink?.peer?.() === this.turtleLink) frame.ownerCombat.turtleLink.pet = this.pet;
      }
    }
    this.latestFrame = frame;
    if (this.ground && !frame.groundEnvironment) throw new Error('Ground pet requires verified level environment');
    if (!this.animation && !this.behavior.usesHostTicks) {
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
    let targets = this.behavior.searchIncludesDead
      ? frame.targets.map(target => Object.freeze({ ...target }))
      : this.targeting.livingTargets(frame.targets);
    this.consumeDamageEvents(frame, targets);
    if (this.released) return;
    this.consumeAnimationEvents(frame, targets);
    if (this.released) return;
    if (this.pet.hp <= 0 && this.phase === 'alive') this.beginDeath();
    if ((this.phase === 'dead-playing' && !this.behavior.stepsWhileDying) || eventsOnly) {
      if (this.phase === 'dead-playing') this.advanceAnimation(frame, targets);
      if (this.released) return;
      stepTurtleLink(this.turtleLink);
      this.ports.stepChildren(frame, true);
      return;
    }

    this.behavior.beforeActions?.(this.context(frame, targets));
    if (this.released) return;
    if (frame.projectileCombat) targets = this.behavior.searchIncludesDead
      ? targets.map(target => Object.freeze({ ...target,
        isAlive: frame.projectileCombat!.target(target.id)?.alive ?? target.isAlive }))
      : targets.filter(target => frame.projectileCombat!.target(target.id)?.alive ?? target.isAlive);
    const ownsPet = frame.isLocalOwner !== false;
    const canThink = ownsPet && this.phase === 'alive'
      && !this.ground?.definition.intelligenceBlockedActions?.includes(this.animation?.snapshot().action ?? '');
    const targetWasCleared = canThink && this.validateStickyTarget(targets);
    this.targetAcquiredThisFrame = false;
    if (canThink && !this.target && !targetWasCleared) {
      this.target = this.targeting.orderedFirstTarget(this.runtime, targets, PetTuning.searchRange,
        this.behavior.searchIncludesDead);
      this.targetAcquiredThisFrame = this.target !== undefined;
    }
    let context = this.context(frame, targets);
    if (this.ground) this.ground.suppressTurning = this.behavior.suppressTurning?.(context) ?? false;
    const attackRange = this.behavior.basicAttackRange?.(context);
    if (attackRange !== undefined && (!Number.isFinite(attackRange) || attackRange < 0)) {
      throw new Error(`Pet basic attack range must be finite and non-negative: ${attackRange}`);
    }
    const shouldChaseTarget = this.target !== undefined && attackRange !== undefined
      && this.targeting.distance(this.runtime, this.target) > attackRange;
    if (canThink && !this.ground && this.behavior.canMove(context)) {
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
    if (!this.ground && (currentAnimation === 'wait' || currentAnimation === 'walk')) {
      this.animation!.select(this.runtime.state === 'follow' ? 'walk' : 'wait', this.actionToken);
    }
    let action = !canThink ? undefined : this.ground
      ? this.selectGroundAction(context, targetWasCleared, attackRange, frame.groundEnvironment!)
      : this.behavior.usesHostTicks && (targetWasCleared || this.targetAcquiredThisFrame)
        ? undefined : this.behavior.selectAction(context);
    if (canThink && !this.ground && !action) {
      if (this.target && attackRange !== undefined) {
        if (this.targeting.distance(this.runtime, this.target) <= attackRange) {
          action = this.behavior.basicAttack(context);
        }
      } else {
        action = this.behavior.basicAttack(context);
      }
    }
    if (action?.deferred) {
      this.publish({ type: 'behavior', behaviorEvent: { type: 'pet-action-deferred', payload: { action: action.type } } });
    } else if (action) {
      if (!action.preservesAnimation) this.actionToken += 1;
      if (!action.preservesAnimation) this.animation?.select(action.type, this.actionToken);
      this.behavior.executeAction(action, this.context(frame, targets));
      this.publish({ type: 'action', action: { ...action }, actionToken: this.actionToken });
    }
    this.behavior.updateEffects(context);
    if (this.released) return;
    this.ports.stepChildren(frame, false);
    if (this.released) return;
    this.behavior.afterChildren?.(this.context(frame, targets));
    if (this.released) return;
    tickActivePetSkillState(this.pet, frame.deltaMs);
    this.hostTick = (this.hostTick + 1) % 59999;
    if (this.ground) {
      const environment = frame.groundEnvironment;
      if (!environment) throw new Error('Ground pet requires verified level environment');
      const actionNow = this.animation?.snapshot().action;
      if (this.phase === 'alive' && !this.ground.isAttacking(actionNow) && !this.ground.isHurt(actionNow)) {
        this.ground.warp(context.owner);
      }
    }
    this.advanceAnimation(frame, targets);
    if (this.released) return;
    if (this.ground?.step(frame.groundEnvironment!, this.pet.moveSpeed, this.animation?.snapshot().action,
      this.behavior.suppressGroundMove?.(this.context(frame, targets)) ?? false, frame.deltaMs, context.isGxp)) {
      this.animation!.select(this.runtime.state === 'follow' ? 'walk' : 'wait', this.actionToken);
    }
    // BaseObject.step expires setYourFather only after its count passes below zero.
    if (this.protectionCount >= 0) this.protectionCount--;
    stepTurtleLink(this.turtleLink);
  }

  private selectGroundAction(
    context: PetBehaviorContext, targetWasCleared: boolean, attackRange: number | undefined,
    environment: NonNullable<PetCombatFrame['groundEnvironment']>,
  ): PetBehaviorAction | undefined {
    const ground = this.ground!;
    const attemptTick = this.hostTick % context.hostFps === 0;
    let action: PetBehaviorAction | undefined;
    if (!targetWasCleared && (!this.target || this.targetAcquiredThisFrame)) {
      if (attemptTick) ground.followOwner(context.owner);
    } else if (!targetWasCleared && !ground.isAttacking(context.animation?.action)
      && !ground.isHurt(context.animation?.action) && this.behavior.canMove(context)) {
      action = this.behavior.selectAction(context);
      if (!action && attemptTick && this.target) {
        if (attackRange !== undefined && this.targeting.distance(this.runtime, this.target) <= attackRange) {
          if (context.random() <= ground.definition.attackRate) action = this.behavior.basicAttack(context);
          else if (context.random() < 0.3) {
            ground.setStatic();
          } else ground.turnTo(this.target.x);
        } else ground.turnTo(this.target.x);
      }
    }
    // Source checks the action selected by this AI pass before jump/drop.
    const selected = action?.type ?? this.animation?.snapshot().action;
    if (!ground.isAttacking(selected) && !ground.isHurt(selected)) {
      ground.adjustVertical(context.owner, environment);
    }
    return action;
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

  face(direction: -1 | 1): void {
    if (this.ground?.suppressTurning) return;
    this.runtime.facingX = direction;
    this.ground?.face(direction);
  }

  protectFromHits(sourceCount: number): void {
    if (!Number.isSafeInteger(sourceCount) || sourceCount < 0) throw new Error('Invalid pet protection count');
    this.protectionCount = Math.max(this.protectionCount, sourceCount);
  }

  restartAnimationCell(): void { this.animation?.restartCell(); }

  linkOwner(frame: PetCombatFrame, value: number, durationTicks: number): void {
    if (!frame.ownerCombat) throw new Error('TXLJ requires the actual owner combat port');
    const hero = frame.ownerCombat, fps = frame.hostFps ?? DefaultGlobalSettings.frameRate;
    this.turtleLink = refreshTurtleLink(this.turtleLink, this.pet, this.runtimeKey, value, durationTicks, fps);
    hero.turtleLink = refreshTurtleLink(hero.turtleLink, this.pet, this.runtimeKey, value, durationTicks, fps);
    this.turtleLink.peer = () => hero.turtleLink; hero.turtleLink.peer = () => this.turtleLink;
    hero.turtleLink.pet = this.pet;
    hero.turtleLink.runtimeKey = this.runtimeKey;
    hero.turtleLink.reduceHp = (amount, event, timeMs) => {
      if (this.released || !this.latestFrame) return;
      const latest = this.latestFrame;
      this.consumeDamageEvents({ ...latest,
        incomingFeedback: latest.incomingFeedback ? { ...latest.incomingFeedback, timeMs } : undefined,
        damageEvents: [{ runtimeKey: this.runtimeKey, amount, sourceId: event.sourceId,
          attackId: event.attackId, occurredAtMs: event.occurredAtMs, producerKind: 'turtle-transfer' }] },
      this.targeting.livingTargets(latest.targets));
    };
  }

  healLinkedOwner(frame: PetCombatFrame, amount: number, notification: 'direct' | 'event'): void {
    if (!isTurtleLinkPaired(this.turtleLink) || frame.ownerCombat?.turtleLink !== this.turtleLink.peer?.()) return;
    const hero = frame.ownerCombat!, before = hero.hp;
    // SLD uses setHHP / SetHHp, never BaseHero.cureHp (no second 1.05 or pet echo).
    hero.hp = Math.min(hero.maxHp, Math.max(0, (hero.hp + amount) | 0));
    this.publish({ type: 'behavior', behaviorEvent: { type: 'turtle-linked-owner-healed',
      payload: { notification, amount, hpBefore: before, hpAfter: hero.hp } } });
  }

  private advanceAnimation(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): void {
    this.ground?.applyEnterVelocity(this.animation?.snapshot().action);
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
      groundMotion: this.ground?.snapshot(),
      protectedFromHits: this.protectionCount >= 0,
      turtleLinkVisible: !!(this.turtleLink?.active && this.turtleLink.started),
    });
  }

  release(reason: PetCombatReleaseReason): void {
    if (this.released) return;
    this.released = true;
    this.releaseReason = reason;
    detachTurtleLink(this.turtleLink);
    const failures: unknown[] = [];
    try { this.behavior.destroy(reason); } catch (error) { failures.push(error); }
    try { this.ports.releaseChildren(reason); } catch (error) { failures.push(error); }
    if (this.projectiles) {
      this.projectiles.projectiles = this.projectiles.projectiles.filter(({ sourceId }) => sourceId !== this.pet.id);
    }
    try { this.publish({ type: 'deactivated', reason }); } catch (error) { failures.push(error); }
    if (failures.length) throw new AggregateError(failures, 'Pet release callbacks failed after cleanup');
  }

  private consumeDamageEvents(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): void {
    if (this.phase !== 'alive') return;
    for (const event of frame.damageEvents ?? []) {
      if (event.runtimeKey !== this.runtimeKey) continue;
      const hpBefore = this.pet.hp;
      this.pet.hp = Math.max(0, this.pet.hp - event.amount);
      const feedback = frame.incomingFeedback;
      if (feedback && event.attackId && event.sourceId && event.occurredAtMs !== undefined) {
        recordIncomingDamageFeedback({ model: feedback.model, ownerSlot: feedback.ownerSlot,
          targetKind: 'pet', targetId: this.pet.id, targetRuntimeId: this.runtimeKey,
          worldAnchor: () => ({ x: this.runtime.x, y: this.runtime.y }) }, {
          sourceId: event.sourceId, attackId: event.attackId, producerKind: event.producerKind ?? 'pet-reduce-hp',
          occurredAtMs: event.occurredAtMs, settledAtMs: feedback.timeMs,
          settledDamage: event.amount, hpBefore, hpAfter: this.pet.hp,
        });
      }
      if (event.sourceId && event.producerKind !== 'turtle-transfer' && this.behavior.targetsDamageSource?.()) {
        const attacker = targets.find(target => target.id === event.sourceId && target.isAlive);
        if (attacker) this.target = attacker;
      }
      if (event.knockback && !this.behavior.rejectKnockback?.(this.context(frame, targets))) {
        this.ground?.applyKnockback(event.knockback);
      }
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
      if (event.eventName === 'complete' && event.setStatic) {
        this.runtime.state = 'idle';
        this.ground?.setStatic();
      }
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
    if (this.behavior.losesLifeOnDeath?.()) this.pet.lifetime = Math.max(0, this.pet.lifetime - 1);
    this.target = undefined;
    this.actionToken += 1;
    this.animation?.select('dead', this.actionToken);
    this.publish({ type: 'action', action: { type: 'dead' }, actionToken: this.actionToken });
  }

  private validateStickyTarget(targets: readonly Readonly<PetSkillTarget>[]): boolean {
    if (!this.target) return false;
    const current = targets.find(({ id }) => id === this.target?.id);
    if (current?.isAlive && this.targeting.distance(this.runtime, current) < PetTuning.searchRange) {
      this.target = current;
      return false;
    }
    this.target = undefined;
    return true;
  }

  private context(frame: PetCombatFrame, targets: readonly Readonly<PetSkillTarget>[]): PetBehaviorContext {
    const input = this.ground && frame.groundEnvironment ? { ...frame, owner: {
      ...frame.owner, y: frame.owner.y + frame.groundEnvironment.ownerRootOffsetY,
    } } : frame;
    return createPetCombatContext(this, input, targets, {
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
