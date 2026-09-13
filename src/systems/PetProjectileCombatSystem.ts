import type { PetProjectileCombatPort } from './PetProjectileCombatPort';
import { getProjectileAttackId } from './ProjectileSystem';
import { resolveStage1PetHit, type Stage1CombatEnemy, type Stage1CombatRuntime } from './Stage1CombatSystem';
import type { PlayerSlot } from './InputSystem';

export function createPetProjectileCombatPort(input: Readonly<{
  enemies: readonly Stage1CombatEnemy[];
  combat: Stage1CombatRuntime;
  ownerSlot: PlayerSlot;
  timeMs: number;
  random: () => number;
  mask: PetProjectileCombatPort['mask'];
}>): PetProjectileCombatPort {
  return {
    mask: input.mask,
    target: id => {
      const enemy = input.enemies.find(enemy => enemy.id === id);
      return enemy ? { monsterId: enemy.enemyType, x: enemy.x, y: enemy.y, alive: enemy.hp > 0 && enemy.phase !== 'dead' } : undefined;
    },
    hit: (projectile, targetId, cache) => {
      const enemy = input.enemies.find(enemy => enemy.id === targetId);
      if (!enemy) return false;
      return resolveStage1PetHit({ runtime: input.combat, enemy, ownerSlot: input.ownerSlot,
        petId: projectile.sourceId, attackId: getProjectileAttackId(projectile),
        actionName: projectile.actionName, attackKind: 'physics', damage: cache.hurt,
        critical: cache.critical, knockbackX: projectile.knockbackX, knockbackY: projectile.knockbackY,
        timeMs: input.timeMs, sourceBullet: { cache,
          protected: enemy.sourceHitProtection?.protected ?? false,
          dodgeProbability: enemy.sourceHitProtection?.dodgeProbability ?? 0,
          random: input.random,
        },
      }) !== undefined;
    },
  };
}
