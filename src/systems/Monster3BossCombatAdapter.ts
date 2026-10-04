import type { Monster3Model } from './Monster3System';
import type { Stage1CombatEnemy } from './Stage1CombatSystem';

/** Accessors adapt the existing Boss owner, never copy HP or retained targets. */
export function adaptMonster3BossCombat(boss: Monster3Model): Stage1CombatEnemy {
  return {
    id: 'monster3', enemyType: 3,
    get lastHitBy() { return boss.lastHitBy; }, set lastHitBy(value) { boss.lastHitBy = value; },
    get x() { return boss.x; }, set x(value) { boss.x = value; },
    get y() { return boss.y; }, set y(value) { boss.y = value; },
    get hp() { return boss.hp; }, set hp(value) { boss.hp = value; },
    get maxHp() { return boss.maxHp; }, set maxHp(value) { boss.maxHp = value; },
    get facingX() { return boss.facingX; }, set facingX(value) { boss.facingX = value; },
    get attackSerial() { return boss.attackSerial; }, set attackSerial(value) { boss.attackSerial = value; },
    get phase() { return boss.state === 'dead' || boss.state === 'removed' ? 'dead'
      : boss.state === 'hurt' ? 'hurt' : boss.state === 'hit1' || boss.state === 'hit2' ? 'windup' : 'approach'; },
    set phase(value) { boss.state = value === 'dead' ? 'dead' : value === 'hurt' ? 'hurt'
      : boss.monster3WorldState?.action === 'hit2' ? 'hit2'
        : boss.monster3WorldState?.action === 'hit1' ? 'hit1'
          : boss.monster3WorldState?.action === 'walk' ? 'walk' : 'wait'; },
    get phaseRemainingMs() { return boss.stateTimerMs; }, set phaseRemainingMs(value) { boss.stateTimerMs = value; },
    get activeAttack() { return undefined; }, set activeAttack(_value) { boss.activeAttack = undefined; },
    get experienceBinding() { return boss.experienceBinding; }, set experienceBinding(value) { boss.experienceBinding = value; },
    get petKnockback() { return boss.petKnockback; }, set petKnockback(value) { boss.petKnockback = value; },
    get petTargetEffectState() { return boss.petTargetEffectState; }, set petTargetEffectState(value) { boss.petTargetEffectState = value; },
    get monster3AttackRuntime() { return boss.monster3AttackRuntime; }, set monster3AttackRuntime(value) { boss.monster3AttackRuntime = value; },
    get monster3WorldState() { return boss.monster3WorldState; }, set monster3WorldState(value) { boss.monster3WorldState = value; },
  };
}
