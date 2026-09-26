import type Phaser from 'phaser';
import { createSceneMonsterKnockback } from '../MonsterKnockbackBridge';
import { acceptMonsterKnockback, advanceMonsterKnockback } from '../../systems/MonsterKnockbackBinding';
import type { Monster30Model } from '../../systems/Monster30System';
import type { Monster3Model } from '../../systems/Monster3System';
import type { ProjectileModel } from '../../systems/ProjectileTypes';
import { updateMonsterPhysics } from '../../systems/MonsterPhysicsSystem';
import { getPetProjectileKnockback } from '../../systems/PetProjectileKnockback';

/** Existing legacy projectile entry only. Native host bullets retain their settlement port. */
export function acceptTestScenePetKnockback(scene: Phaser.Scene, monster: Monster30Model | Monster3Model,
  monsterId: 3 | 30, projectile: ProjectileModel, timeMs: number): void {
  if (!projectile.variant.startsWith('pet-') || projectile.petHostTick !== undefined
    || monster.state === 'dead' || monster.state === 'removed') return;
  monster.petKnockback ??= createSceneMonsterKnockback(scene, 11, monsterId, monster);
  const knockback = getPetProjectileKnockback(projectile);
  if (!knockback) return;
  acceptMonsterKnockback(monster.petKnockback,
    { ...knockback, timeMs },
    { x: monster.x, y: monster.y, action: monster.state, frozen: false }, 'late');
}

export function updateTestSceneBossPhysics(scene: Phaser.Scene, boss: Monster3Model,
  platforms: Parameters<typeof updateMonsterPhysics>[2], deltaMs: number, timeMs: number): void {
  if (!boss.petKnockback?.active) {
    updateMonsterPhysics(boss.physics, boss.x, platforms, deltaMs);
    boss.y = boss.physics.y;
  }
  if (advanceMonsterKnockback(boss.petKnockback, boss, { deltaMs, timeMs,
    hostFps: scene.game.loop.targetFps, action: boss.state, frozen: false })) {
    boss.physics.y = boss.y;
    boss.physics.height = boss.petKnockback!.profile.profile.collider.height;
    boss.physics.velocityY = boss.petKnockback!.motion.velocityY * scene.game.loop.targetFps;
    boss.physics.grounded = !!boss.petKnockback!.motion.standingOn;
    boss.physics.currentPlatformId = boss.petKnockback!.motion.standingOn;
  }
}
