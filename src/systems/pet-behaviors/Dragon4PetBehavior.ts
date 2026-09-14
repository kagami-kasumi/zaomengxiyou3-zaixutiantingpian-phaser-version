import { Dragon1PetBehavior } from './Dragon1PetBehavior';
import type { PetBehaviorAction, PetBehaviorContext, PetCombatAnimationEvent, PetCombatDamageEvent } from '../PetBehavior';
import { PetDragon23ProjectileSystem } from '../PetDragon23ProjectileSystem';
import { createDragon4CloneState } from '../PetDragonCloneState';
import { toDragonSourceCoordinate as twips } from '../PetDragonCollisionSystem';
import truth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json';

/** PetDragon4 differences; all parent/child AI, movement and lifetime scheduling stays in Session. */
export class Dragon4PetBehavior extends Dragon1PetBehavior {
  private isAoyi = false;
  constructor() { super(4); }

  override groundMovement() {
    return { ...super.groundMovement(),
      attackActions: ['normal', 'fs', 'sdcc', 'ltwj', 'qlaoyi', 'qlaoyi-ltwj-link'],
      speedByAction: { sdcc: 10, qlaoyi: 0 }, enterVelocityByAction: { qlaoyi: { x: 0, y: -5 } } };
  }

  override enter(context: PetBehaviorContext): void {
    super.enter(context);
    context.setSkillCooldown('dragon4Qlaoyi', 15000);
  }

  override selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    const inherited = super.selectAction(context);
    if (inherited) return inherited;
    if (!context.parentRuntimeKey && context.target && !context.targetAcquiredThisFrame
      && context.pet.skills.includes('qlaoyi') && context.pet.mp >= 30
      && Math.hypot(context.runtime.x - context.target.x, context.runtime.y - context.target.y) <= 200
      && (context.pet.skillState?.dragon4Qlaoyi.cooldownMs ?? Infinity) <= 1e-7) return { type: 'qlaoyi' };
    return undefined;
  }

  override executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (action.payload && (action.payload as { freeChain?: boolean }).freeChain) {
      this.isAoyi = true;
      context.face(context.runtime.facingX);
      context.emit({ type: 'dragon4-free-chain', payload: { action: action.type, mp: context.pet.mp } });
      return;
    }
    super.executeAction(action, context);
    if (action.type === 'qlaoyi') {
      this.isAoyi = true;
      context.setSkillCooldown('dragon4Qlaoyi', 24000);
      this.effects().emit(context, 'aoyi-buff');
      context.emit({ type: 'dragon4-qlaoyi-cast', payload: { mpBefore: context.pet.mp, mpAfter: context.pet.mp } });
    }
  }

  override onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    if (context.pet.hp > 0 && !context.isGxp) this.isAoyi = false;
    super.onDamaged(event, context);
  }

  override onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    if (context.pet.hp <= 0) return;
    super.onAnimationEvent(event, context);
    if (event.action === 'qlaoyi' && event.eventName === 'hit') {
      const counts = truth.forms[3]!.actions.qlaoyi!.emitTiming.cloneRemainingCounts!;
      const index = counts.indexOf(context.animation!.remainingHoldCount);
      if (index === 0) this.effects().emit(context, 'qlaoyi');
      if (index >= 0 && context.pet.skills.includes('fs')) this.spawnClone(context, index % 2 ? 1 : -1);
    }
    if (event.action === 'qlaoyi-ltwj-link' && event.eventName === 'enter' && context.grounded) {
      this.chain(context, 'ltwj');
    }
    if (event.eventName !== 'complete') return;
    if (event.action === 'qlaoyi') {
      if (this.isAoyi && context.pet.skills.includes('sdcc')) this.chain(context, 'sdcc');
      else if (this.isAoyi && context.pet.skills.includes('ltwj')) this.chain(context, 'qlaoyi-ltwj-link');
      else this.wait(context);
    } else if (event.action === 'sdcc') {
      if (this.isAoyi && context.pet.skills.includes('ltwj')) this.chain(context, 'ltwj');
      else this.wait(context);
    } else if (event.action === 'qlaoyi-ltwj-link') this.chain(context, 'ltwj');
    else if (event.action === 'ltwj') this.wait(context);
  }

  protected override spawnClone(context: PetBehaviorContext, facingX?: -1 | 1): void {
    const pet = createDragon4CloneState(context.pet);
    const action = facingX === undefined ? undefined : pet.skills.includes('sdcc') ? 'sdcc'
      : pet.skills.includes('ltwj') ? 'qlaoyi-ltwj-link' : undefined;
    if (facingX !== undefined && !action) this.isAoyi = false;
    const handle = context.spawnSummon({ pet,
      x: twips(twips(context.runtime.x) + (context.random() - 0.5) * 300), y: twips(context.runtime.y) - 50,
      facingX: facingX ?? -1,
      initialAction: action ? { type: action, payload: { freeChain: true } } : undefined,
      onReleased: reason => { if (reason === 'expired') this.healRemoval(context, reason); },
    });
    context.emit({ type: 'dragon4-clone-spawned', payload: { handle, action, facingX,
      remainingHoldCount: context.animation?.remainingHoldCount,
      hp: pet.hp, maxHp: pet.maxHp, mp: pet.mp, maxMp: pet.maxMp,
      atk: pet.atk, def: pet.def, crit: pet.critBonusRate, moveSpeed: pet.moveSpeed, skills: pet.skills } });
  }

  override afterChildren(context: PetBehaviorContext): void {
    for (const child of context.summonSnapshots()) if (child.hp <= 0 && child.parentRuntimeKey) {
      this.healRemoval(context, 'dead');
      context.releaseSummon({ runtimeKey: child.runtime.runtimeKey, petId: child.petId,
        parentRuntimeKey: child.parentRuntimeKey, sourcePetId: child.sourcePetId }, 'dismissed');
    }
  }

  private healRemoval(context: PetBehaviorContext, reason: string): void {
    const hpBefore = context.pet.hp;
    context.healSelf(context.pet.maxHp * 0.036);
    context.emit({ type: 'dragon4-clone-removal-heal', payload: { reason, hpBefore, hpAfter: context.pet.hp } });
  }

  private chain(context: PetBehaviorContext, action: string): void {
    if (action !== 'qlaoyi-ltwj-link' && context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
    context.playAnimation(action);
    context.emit({ type: 'dragon4-free-chain', payload: { action, mp: context.pet.mp } });
  }

  private wait(context: PetBehaviorContext): void { this.isAoyi = false; context.playAnimation('wait'); }
  private effects(): PetDragon23ProjectileSystem { return this.projectiles as PetDragon23ProjectileSystem; }
}
