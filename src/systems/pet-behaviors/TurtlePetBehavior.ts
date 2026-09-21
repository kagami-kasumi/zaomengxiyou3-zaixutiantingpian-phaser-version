import type { PetTurtleAssets } from '../../assets/PetTurtleAssets';
import type { PetBehavior, PetBehaviorContext, PetBehaviorAction, PetCombatAnimationEvent, PetCombatDamageEvent } from '../PetBehavior';
import { createPetTurtleAnimationClock } from '../PetTurtleAnimationClock';
import { PetTurtleProjectileSystem } from '../PetTurtleProjectileSystem';
import { selectPetTurtleSkill } from '../PetTurtleSkillSelection';

export class TurtlePetBehavior implements PetBehavior {
  private readonly projectiles: PetTurtleProjectileSystem;
  private isAoyi = false;
  private elapsedAoyiMs: number | undefined;
  private nextFreeSld = 0;
  private freeSldScheduled = false;
  constructor(private readonly assets: PetTurtleAssets, private readonly form: 1 | 2 | 3 | 4) {
    this.projectiles = new PetTurtleProjectileSystem(assets);
  }
  createAnimationClock = () => createPetTurtleAnimationClock(this.assets, this.form);
  groundMovement() {
    return { collision: this.assets.bodyCollision(this.form), gravity: 1.5, jumpPower: -30,
      attackRate: 0.7, attackActions: ['hit1', 'hit2', 'hit3'], immobileGroundActions: ['hit1', 'hit2'] };
  }
  enter(context: PetBehaviorContext): void {
    context.setSkillCooldown('turtle1Sld', 3000);
    context.setSkillCooldown('turtle2Txlj', 3000);
    context.setSkillCooldown('turtle3Sybh', 4000);
    context.setSkillCooldown('turtle4Xwaoyi', 12000);
  }
  canMove(): boolean { return true; }
  suppressGroundMove(): boolean { return this.isAoyi; }
  suppressTurning(): boolean { return this.isAoyi; }
  rejectKnockback(context: PetBehaviorContext): boolean { return this.isAoyi || context.isGxp; }
  losesLifeOnDeath(): boolean { return true; }
  targetsDamageSource(): boolean { return true; }
  basicAttackRange(): number { return [40, 120, 150, 150][this.form - 1]!; }
  basicAttack(): PetBehaviorAction { return { type: 'hit1' }; }
  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    const skill = selectPetTurtleSkill(context);
    if (!skill) return undefined;
    return skill === 'sld' ? { type: 'hit2' } : skill === 'txlj'
      ? { type: 'txlj', preservesAnimation: true } : skill === 'sybh' ? { type: 'hit3' }
        : { type: 'xwaoyi', preservesAnimation: true };
  }
  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    if (action.type === 'xwaoyi') {
      this.isAoyi = true;
      this.elapsedAoyiMs = 0;
      this.nextFreeSld = 2;
      this.freeSldScheduled = context.pet.skills.includes('sld');
      if (this.freeSldScheduled) this.releaseFreeSld(context);
      if (context.pet.skills.includes('txlj')) this.releaseLink(context, true);
      if (context.pet.skills.includes('sybh')) this.projectiles.emit(context, 'hit3', true);
      this.projectiles.emit(context, 'hit1', false, true);
      context.setSkillCooldown('turtle4Xwaoyi', 18000);
      context.emit({ type: 'turtle-aoyi-released', payload: { mp: context.pet.mp, skills: [...context.pet.skills] } });
      return;
    }
    if (action.type === 'txlj') {
      this.releaseLink(context, false);
      context.setSkillCooldown('turtle2Txlj', 20000);
      return;
    }
    if (action.type !== 'hit1' && action.type !== 'hit2' && action.type !== 'hit3') throw new Error(`Unsupported turtle release ${action.type}`);
    if (context.target && !this.isAoyi) context.face(context.runtime.x < context.target.x ? 1 : -1);
    if (action.type === 'hit2' || action.type === 'hit3') {
      const mpBefore = context.pet.mp;
      if (!context.spendMp(20)) throw new Error('Turtle skill lost its MP gate');
      context.setSkillCooldown(action.type === 'hit2' ? 'turtle1Sld' : 'turtle3Sybh', action.type === 'hit2' ? 6000 : 5500);
      context.protectFromHits(10);
      context.emit({ type: action.type === 'hit2' ? 'turtle-sld-released' : 'turtle-sybh-released', payload: { mpBefore, mpAfter: context.pet.mp, protectionCount: 10 } });
    }
  }
  private releaseLink(context: PetBehaviorContext, free: boolean): void {
    context.protectFromHits(10);
    context.linkOwner((5 * context.pet.technique * 1.05) >>> 0, context.hostFps * ((4 * context.pet.warpower) >>> 0));
    if (!free && !context.spendMp(20)) throw new Error('Turtle TXLJ lost its MP gate');
    context.emit({ type: 'turtle-txlj-released', payload: { free } });
  }
  private releaseFreeSld(context: PetBehaviorContext): void {
    context.protectFromHits(10);
    if (context.target && !this.isAoyi) context.face(context.runtime.x < context.target.x ? 1 : -1);
    context.playAnimation('hit2');
    context.emit({ type: 'turtle-free-sld', payload: { elapsedMs: this.elapsedAoyiMs } });
  }
  beforeActions(context: PetBehaviorContext): void {
    if (this.elapsedAoyiMs !== undefined) {
      this.elapsedAoyiMs += context.deltaMs;
      if (this.freeSldScheduled && this.nextFreeSld <= 4 && this.elapsedAoyiMs + 1e-7 >= this.nextFreeSld * 1000) {
        this.releaseFreeSld(context);
        this.nextFreeSld += 2;
      }
      if (this.elapsedAoyiMs + 1e-7 >= 5000) {
        this.isAoyi = false; this.elapsedAoyiMs = undefined;
        context.emit({ type: 'turtle-aoyi-ended' });
      }
    }
    this.projectiles.step(context);
  }
  updateEffects(): void {}
  onDamaged(event: PetCombatDamageEvent, context: PetBehaviorContext): void {
    if (context.pet.hp <= 0 || context.isGxp || this.isAoyi || event.reactsToHit !== true || event.producerKind === 'turtle-transfer') return;
    const chance = (0.05 + this.form / 100) * context.pet.warpower * 1.05;
    if (context.pet.skills.includes('qlfj') && context.random() <= chance) {
      context.playAnimation('hit1');
      this.executeAction({ type: 'hit1' }, context);
      context.emit({ type: 'turtle-counter' });
    } else if (context.animation?.action === 'hurt') context.restartAnimationCell();
    else { this.isAoyi = false; context.playAnimation('hurt'); }
  }
  onAnimationEvent(event: PetCombatAnimationEvent, context: PetBehaviorContext): void {
    if (event.action === 'hurt') this.isAoyi = false;
    if (context.isLocalOwner && event.eventName === 'hit' && context.pet.hp > 0 && (event.action === 'hit1' || event.action === 'hit2' || event.action === 'hit3')) {
      this.projectiles.emit(context, event.action);
    }
  }
  destroy(): void {
    this.isAoyi = false; this.elapsedAoyiMs = undefined; this.freeSldScheduled = false;
    this.projectiles.destroy();
  }
}
