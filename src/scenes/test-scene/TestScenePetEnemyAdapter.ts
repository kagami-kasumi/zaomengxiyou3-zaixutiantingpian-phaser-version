import { applyMonster30Hit, type Monster30Model } from '../../systems/Monster30System';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import type { PlayerSlot } from '../../systems/InputSystem';

/** Accessors retain the actual sandbox monster as HP/lifetime owner. */
export function adaptTestScenePetEnemies(monsters: readonly Monster30Model[],
  onHitOwner: (monster: Monster30Model, slot: PlayerSlot) => void): Stage1CombatEnemy[] {
  return monsters.map(monster => ({
    id: monster.id, enemyType: 30,
    get x() { return monster.x; }, get y() { return monster.y; },
    get hp() { return monster.hp; },
    set hp(value: number) { applyMonster30Hit(monster, Math.max(0, monster.hp - value)); },
    get maxHp() { return monster.maxHp; },
    get phase() { return monster.state === 'dead' || monster.state === 'removed' ? 'dead' as const
      : monster.state === 'hurt' ? 'hurt' as const : 'approach' as const; },
    // applyMonster30Hit already owns the sandbox hurt/death duration and attack cleanup.
    set phase(_value) {},
    phaseRemainingMs: 0, facingX: monster.facingX, attackSerial: monster.attackSerial,
    set lastHitBy(slot: PlayerSlot | undefined) { if (slot) onHitOwner(monster, slot); },
  }));
}
