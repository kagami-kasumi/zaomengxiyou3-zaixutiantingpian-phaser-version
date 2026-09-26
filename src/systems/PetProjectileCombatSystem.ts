import type { PetProjectileCombatPort } from './PetProjectileCombatPort';
import { addMonsterPetTargetEffects } from './MonsterPetTargetEffectSystem';
import { getProjectileAttackId } from './ProjectileSystem';
import { resolveStage1PetHit, type Stage1CombatEnemy, type Stage1CombatRuntime } from './Stage1CombatSystem';
import type { PlayerSlot } from './InputSystem';
import { getDragonTargetCollisionBounds, type DragonCollisionBounds } from './PetDragonCollisionSystem';

export function createPetProjectileCombatPort(input: Readonly<{
  enemies: readonly Stage1CombatEnemy[];
  combat: Stage1CombatRuntime;
  ownerSlot: PlayerSlot;
  timeMs: number;
  random: () => number;
  mask: PetProjectileCombatPort['mask'];
  monkeyHorseCollision?: PetProjectileCombatPort['monkeyHorseCollision'];
  delay?: PetProjectileCombatPort['delay'];
  displayTick?: PetProjectileCombatPort['displayTick'];
  parentBoundsLeft?: (bounds: DragonCollisionBounds) => number;
}>): PetProjectileCombatPort {
  return {
    delay: input.delay,
    displayTick: input.displayTick,
    monkeyHorseCollision: input.monkeyHorseCollision,
    mask: input.mask,
    bindTarget: id => {
      const enemy = input.enemies.find(enemy => enemy.id === id);
      return () => enemy ? { x: enemy.x, y: enemy.y, alive: enemy.hp > 0 && enemy.phase !== 'dead' } : undefined;
    },
    monstersInParentSpace: () => input.enemies.map(enemy => {
      const bounds = getDragonTargetCollisionBounds(enemy.enemyType, enemy.x, enemy.y);
      return { id: enemy.id, x: enemy.x, y: enemy.y, isAlive: enemy.hp > 0 && enemy.phase !== 'dead',
        colliderLeft: input.parentBoundsLeft?.(bounds) ?? bounds.x };
    }),
    target: id => {
      const enemy = input.enemies.find(enemy => enemy.id === id);
      return enemy ? { monsterId: enemy.enemyType, x: enemy.x, y: enemy.y, alive: enemy.hp > 0 && enemy.phase !== 'dead' } : undefined;
    },
    hit: (projectile, targetId, cache) => {
      const enemy = input.enemies.find(enemy => enemy.id === targetId);
      if (!enemy) return false;
      return resolveStage1PetHit({ runtime: input.combat, enemy, ownerSlot: input.ownerSlot,
        petId: projectile.sourceId, attackId: getProjectileAttackId(projectile),
        actionName: projectile.actionName, attackKind: projectile.attackKind, damage: cache.hurt,
        critical: cache.critical, knockbackX: projectile.knockbackX, knockbackY: projectile.knockbackY,
        timeMs: input.timeMs, sourceBullet: { cache,
          protected: enemy.sourceHitProtection?.protected ?? false,
          dodgeProbability: enemy.sourceHitProtection?.dodgeProbability ?? 0,
          random: input.random,
          applyEffects: () => addMonsterPetTargetEffects(enemy, projectile.petTargetEffects ?? []),
        },
      }) !== undefined;
    },
  };
}
