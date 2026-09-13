import type { PetBehaviorContext } from './PetBehavior';
import type { ProjectileModel } from './ProjectileTypes';
import { spawnProjectileFromTuning, recordProjectileHit } from './ProjectileSystem';
import { getPetDragonEffectFrame } from '../assets/PetDragonAnimationAssets';
import { getDragonBulletCollisionBounds, getDragonTargetCollisionBounds, sampleDragonCollision,
  toDragonSourceCoordinate } from './PetDragonCollisionSystem';
import { calculateDragonHitHeal, consumeDragonDamageCache, refreshDragonDamageCache,
  type DragonDamageCache } from './PetDragonDamageSystem';

/** Per-Behavior effects, stepped by its session; projectile storage remains shared. */
export class PetDragon1ProjectileSystem {
  private bullets: { projectile: ProjectileModel; cache: DragonDamageCache }[] = [];

  emit(context: PetBehaviorContext): void {
    if (!context.projectileCombat) throw new Error('Dragon1 requires a real projectile combat port');
    const cache = this.refresh(context);
    context.castSkill(({ roster, runtime, projectiles }) => {
      const projectile = spawnProjectileFromTuning(projectiles, {
        sourceId: context.pet.id, x: toDragonSourceCoordinate(runtime.x),
        y: toDragonSourceCoordinate(runtime.y), facingX: runtime.facingX,
      }, 'pet-dragon1-normal', 'dragon1-normal', {
        actionName: 'hit1', assetKey: getPetDragonEffectFrame('PetDragon1Bullet1', 1).key,
        sourceSymbol: 'PetDragon1Bullet1', runtimeName: 'PetDragon1Bullet1',
        offsetX: 30, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
        width: 69, height: 56, lifetimeMs: 11 * 1000 / context.hostFps,
        damage: cache.hurt, attackKind: 'physics', knockbackX: 3, knockbackY: -5,
        hitIntervalFrames: 10, maxHits: 99,
      });
      projectile.petHostTick = 0;
      projectile.petActionToken = context.actionToken;
      projectile.critical = cache.critical;
      projectile.destroyWhenSourceHurt = false;
      projectiles.projectiles.push(projectile);
      this.bullets.push({ projectile, cache });
      context.emit({ type: 'dragon1-normal-emitted', payload: {
        projectileId: projectile.projectileId, sourceId: projectile.sourceId,
        x: projectile.x, y: projectile.y, cache,
      } });
      return { ok: true, message: 'dragon1 normal', pet: roster.pets.find(p => p.id === context.pet.id), projectile };
    });
  }

  step(context: PetBehaviorContext): void {
    if (!this.bullets.length) return;
    const combat = context.projectileCombat;
    if (!combat) throw new Error('Dragon1 projectile lost its combat port');
    const mask = combat.mask('PetDragon1Bullet1');
    for (const entry of this.bullets) {
      const p = entry.projectile;
      if (p.isExpired) continue;
      const tick = p.petHostTick!;
      if (tick > 0 && tick % 10 === 0) p.hitSerial++;
      const frame = tick + 1;
      const bounds = getDragonBulletCollisionBounds(frame, p.x, p.y, p.facingX);
      p.assetKey = getPetDragonEffectFrame('PetDragon1Bullet1', frame).key;
      for (const target of context.targets) {
        if (p.isExpired) break;
        const world = combat.target(target.id);
        if (!world?.alive) continue;
        const targetBounds = getDragonTargetCollisionBounds(world.monsterId, world.x, world.y);
        if (!sampleDragonCollision(targetBounds, bounds, p.facingX, mask).hit) continue;
        entry.cache = consumeDragonDamageCache(entry.cache, {
          accept: cached => combat.hit(p, target.id, cached),
          refresh: () => this.refresh(context),
          onAccepted: refreshed => {
            recordProjectileHit(p);
            const hpBefore = context.pet.hp;
            context.healSelf(calculateDragonHitHeal(context.pet.maxHp, context.pet.atk, context.pet.level));
            context.emit({ type: 'dragon1-hit-heal', payload: {
              sourceId: p.sourceId, targetId: target.id, frame,
              consumed: entry.cache, refreshed, hpBefore, hpAfter: context.pet.hp,
            } });
          },
        });
        p.damage = entry.cache.hurt;
        p.critical = entry.cache.critical;
      }
      p.petHostTick = frame;
      p.elapsedMs = frame * 1000 / context.hostFps;
      if (frame === 11) p.isExpired = true; // Last-frame collision precedes removal.
    }
    this.bullets = this.bullets.filter(({ projectile }) => !projectile.isExpired);
  }

  destroy(): void {
    for (const { projectile } of this.bullets) projectile.isExpired = true;
    this.bullets = [];
  }

  private refresh(context: PetBehaviorContext): DragonDamageCache {
    const pet = context.pet;
    return refreshDragonDamageCache({ attack: pet.atk,
      magicAdd: pet.autoBuffState?.fsnl.active?.bonusSkillDamage ?? 0, gxp: context.isGxp },
    () => context.random() <= pet.critBonusRate + (pet.autoBuffState?.sxkb.active?.bonusCritRate ?? 0));
  }
}
