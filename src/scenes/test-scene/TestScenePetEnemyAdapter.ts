import { applyMonster30Hit, getMonster30AttackHitbox, type Monster30Model } from '../../systems/Monster30System';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import type { PetTurtleAssets } from '../../assets/PetTurtleAssets';
import type { HeroPartyRuntime } from '../HeroPartyRuntimeBridge';

/** The sandbox's actual active attack goes through the same pet HP/event owner. */
export function resolveTestSceneTurtleIncoming(runtime: HeroPartyRuntime, monsters: readonly Monster30Model[],
  assets: PetTurtleAssets, timeMs: number): void {
  for (const monster of monsters) {
    const bounds = getMonster30AttackHitbox(monster), attack = monster.activeAttack;
    if (!bounds || !attack) continue;
    runtime.resolvePetEnemyAttack({ id: monster.id, enemyType: 30, x: bounds.x + bounds.width / 2,
      y: monster.y, hp: monster.hp, maxHp: monster.maxHp, phase: 'active', phaseRemainingMs: 0,
      facingX: monster.facingX, attackSerial: monster.attackSerial,
      activeAttack: { attackId: attack.attackId, actionName: attack.actionName, damage: attack.damage, attackKind: attack.attackKind,
        attackRange: bounds.width / 2 + Math.max(...[1, 2, 3, 4].map(form => assets.bodyCollision(form).width / 2)),
        knockback: { x: attack.facingX * attack.knockbackX, y: attack.knockbackY } } }, timeMs, snapshot => {
      if (snapshot.species !== 'turtle' || !snapshot.runtime) return false;
      const shape = assets.bodyCollision(snapshot.form!), root = snapshot.runtime;
      const left = root.x - shape.registration.x, top = root.y - shape.registration.y;
      return left < bounds.x + bounds.width && left + shape.width > bounds.x
        && top < bounds.y + bounds.height && top + shape.height > bounds.y;
    });
  }
}

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
