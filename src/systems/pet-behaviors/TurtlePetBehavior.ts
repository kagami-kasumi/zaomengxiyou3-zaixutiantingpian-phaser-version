import type { PetTurtleAssets } from '../../assets/PetTurtleAssets';
import type { PetBehavior, PetBehaviorContext, PetBehaviorAction, PetCombatAnimationEvent } from '../PetBehavior';
import { createPetTurtleAnimationClock } from '../PetTurtleAnimationClock';
import { PetTurtleProjectileSystem } from '../PetTurtleProjectileSystem';
import { selectPetTurtleSkill } from '../PetTurtleSkillSelection';

export class TurtlePetBehavior implements PetBehavior {
  private readonly projectiles: PetTurtleProjectileSystem;
  constructor(private readonly assets: PetTurtleAssets, private readonly form: 1 | 2 | 3 | 4) {
    this.projectiles = new PetTurtleProjectileSystem(assets);
  }
  createAnimationClock = () => createPetTurtleAnimationClock(this.assets, this.form);
  groundMovement() {
    return { collision: this.assets.bodyCollision(this.form), gravity: 1.5, jumpPower: -30,
      attackRate: 0.7, attackActions: ['hit1', 'hit2'], immobileGroundActions: ['hit1', 'hit2'] };
  }
  enter(context: PetBehaviorContext): void {
    context.setSkillCooldown('turtle1Sld', 3000);
    context.setSkillCooldown('turtle2Txlj', 3000);
    context.setSkillCooldown('turtle3Sybh', 4000);
    context.setSkillCooldown('turtle4Xwaoyi', 12000);
  }
  canMove(): boolean { return true; }
  basicAttackRange(): number { return [40, 120, 150, 150][this.form - 1]!; }
  basicAttack(): PetBehaviorAction { return { type: 'hit1' }; }
  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    const skill = selectPetTurtleSkill(context);
    if (!skill) return undefined;
    // A3/B own these releases. Preserve the winning branch without spending or falling through.
    return skill === 'sld' ? { type: 'hit2' } : { type: skill, deferred: true };
  }
  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (action.type !== 'hit1' && action.type !== 'hit2') throw new Error(`Unsupported turtle release ${action.type}`);
    if (context.target) context.face(context.runtime.x < context.target.x ? 1 : -1);
    if (action.type === 'hit2') {
      const mpBefore = context.pet.mp;
      if (!context.spendMp(20)) throw new Error('Turtle SLD lost its MP gate');
      context.setSkillCooldown('turtle1Sld', 6000);
      context.protectFromHits(10);
      context.emit({ type: 'turtle-sld-released', payload: { mpBefore, mpAfter: context.pet.mp, protectionCount: 10 } });
    }
  }
  beforeActions(context: PetBehaviorContext): void { this.projectiles.step(context); }
  updateEffects(): void {}
  onDamaged(_event: unknown, context: PetBehaviorContext): void {
    if (context.pet.hp > 0 && !context.isGxp) context.playAnimation('hurt');
  }
  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    if (context.isLocalOwner && event.eventName === 'hit' && context.pet.hp > 0 && (event.action === 'hit1' || event.action === 'hit2')) {
      this.projectiles.emit(context, event.action);
    }
  }
  destroy(): void { this.projectiles.destroy(); }
}
