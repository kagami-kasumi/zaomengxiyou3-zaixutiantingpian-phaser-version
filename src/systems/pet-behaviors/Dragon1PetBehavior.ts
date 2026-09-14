import type { PetBehavior, PetBehaviorContext, PetBehaviorAction, PetCombatAnimationEvent } from '../PetBehavior';
import { createPetDragonAnimationClock } from '../PetDragonAnimationClock';
import { getPetDragonCollision } from '../../assets/PetDragonAnimationAssets';
import { PetDragon1ProjectileSystem } from '../PetDragon1ProjectileSystem';
import { PetDragon23ProjectileSystem } from '../PetDragon23ProjectileSystem';
import { createDragon1CloneState } from '../PetDragonCloneState';
import { toDragonSourceCoordinate } from '../PetDragonCollisionSystem';

export class Dragon1PetBehavior implements PetBehavior {
  private readonly projectiles: PetDragon1ProjectileSystem | PetDragon23ProjectileSystem;
  private passiveCount = 0;
  private passiveLevel = 0;
  private remainingTicks: number | undefined;

  constructor(private readonly form: 1 | 2 | 3 = 1) {
    this.projectiles = form === 1 ? new PetDragon1ProjectileSystem() : new PetDragon23ProjectileSystem(form);
  }
  createAnimationClock = () => createPetDragonAnimationClock(this.form);
  groundMovement = () => ({ collision: getPetDragonCollision(this.form), gravity: 1.5,
    jumpPower: -30, attackRate: 0.7, attackActions: ['normal', 'fs', 'sdcc', 'ltwj'],
    immobileGroundActions: ['normal', 'fs', 'ltwj'], speedByAction: { sdcc: 10 } });

  enter(context: PetBehaviorContext): void {
    context.setSkillCooldown('dragon1Fs', 2500);
    if (this.form >= 2) context.setSkillCooldown('dragon2Sdcc', 3000);
    if (this.form >= 3) context.setSkillCooldown('dragon3Ltwj', 5000);
  }
  canMove(): boolean { return true; }
  basicAttackRange(): number { return 150; }
  basicAttack(): PetBehaviorAction { return { type: 'normal' }; }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    if (!context.parentRuntimeKey && context.target && !context.targetAcquiredThisFrame
      && context.pet.skills.includes('fs') && context.pet.mp >= 20
      && (context.pet.skillState?.dragon1Fs.cooldownMs ?? Infinity) <= 1e-7) return { type: 'fs' };
    if (context.target && !context.targetAcquiredThisFrame && context.pet.mp >= 20) {
      const distance = Math.hypot(context.runtime.x - context.target.x, context.runtime.y - context.target.y);
      if (this.form >= 2 && context.pet.skills.includes('sdcc') && distance <= 300
        && (context.pet.skillState?.dragon2Sdcc.cooldownMs ?? Infinity) <= 1e-7) return { type: 'sdcc' };
      if (this.form >= 3 && context.pet.skills.includes('ltwj') && distance <= 500
        && (context.pet.skillState?.dragon3Ltwj.cooldownMs ?? Infinity) <= 1e-7) return { type: 'ltwj' };
    }
    return undefined;
  }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
    if (action.type === 'fs') {
      const mpBefore = context.pet.mp;
      if (!context.spendMp(20)) throw new Error('Dragon1 fs action lost its MP gate');
      context.setSkillCooldown('dragon1Fs', 10000);
      context.emit({ type: 'dragon1-fs-cast', payload: { mpBefore, mpAfter: context.pet.mp } });
    }
    if (action.type === 'sdcc' || action.type === 'ltwj') {
      const mpBefore = context.pet.mp;
      const mpCost = 20;
      if (!context.spendMp(mpCost)) throw new Error('Dragon skill lost its MP gate');
      context.setSkillCooldown(action.type === 'sdcc' ? 'dragon2Sdcc' : 'dragon3Ltwj',
        action.type === 'sdcc' ? 3600 : 5000);
      context.emit({ type: `dragon${this.form}-${action.type}-cast`, payload: { mpBefore, mpAfter: context.pet.mp } });
    }
  }

  beforeActions(context: PetBehaviorContext): void {
    this.projectiles.step(context);
    if (this.passiveCount++ >= context.hostFps) {
      this.passiveCount = 0;
      const hpBefore = context.pet.hp;
      const mpBefore = context.pet.mp;
      context.healSelf(this.passiveLevel * 3, this.passiveLevel);
      context.emit({ type: 'dragon1-passive', payload: {
        hpBefore, hpAfter: context.pet.hp, mpBefore, mpAfter: context.pet.mp,
      } });
    }
  }

  updateEffects(context: PetBehaviorContext): void {
    if (context.parentRuntimeKey) {
      this.remainingTicks ??= context.hostFps * 10;
      if (--this.remainingTicks <= 0) {
        context.emit({ type: 'dragon1-clone-expired' });
        context.releaseSelf('expired');
        return;
      }
    }
    this.passiveLevel = Math.floor(context.pet.level / 5);
  }

  afterChildren(context: PetBehaviorContext): void {
    for (const child of context.summonSnapshots()) {
      if (child.hp > 0 || !child.parentRuntimeKey) continue;
      // Source removes dead clones from its private active list without expiry healing.
      // Modern cleanup releases their remaining resources at that removal boundary.
      context.releaseSummon({ runtimeKey: child.runtime.runtimeKey, petId: child.petId,
        parentRuntimeKey: child.parentRuntimeKey, sourcePetId: child.sourcePetId }, 'dismissed');
    }
  }

  onDamaged(_event: unknown, context: PetBehaviorContext): void {
    if (context.pet.hp > 0 && !context.isGxp) context.playAnimation('hurt');
  }

  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    if (event.eventName !== 'hit' || context.pet.hp <= 0) return;
    if (event.action === 'normal') this.projectiles.emit(context);
    if ((event.action === 'sdcc' || event.action === 'ltwj') && this.projectiles instanceof PetDragon23ProjectileSystem) {
      this.projectiles.emit(context, event.action);
    }
    if (event.action === 'fs' && !context.parentRuntimeKey) {
      const pet = createDragon1CloneState(context.pet, this.form);
      const handle = context.spawnSummon({ pet,
        x: toDragonSourceCoordinate(toDragonSourceCoordinate(context.runtime.x) + (context.random() - 0.5) * 300),
        y: toDragonSourceCoordinate(context.runtime.y) - 50,
        facingX: context.runtime.facingX,
        onReleased: reason => {
          if (reason !== 'expired') return;
          const hpBefore = context.pet.hp;
          context.healSelf(context.pet.maxHp * 0.036);
          context.emit({ type: 'dragon1-expiry-heal', payload: { hpBefore, hpAfter: context.pet.hp } });
        },
      });
      context.emit({ type: 'dragon1-clone-spawned', payload: { handle,
        hp: pet.hp, maxHp: pet.maxHp, mp: pet.mp, maxMp: pet.maxMp, atk: pet.atk, def: pet.def } });
    }
  }

  destroy(): void { this.projectiles.destroy(); }
}
