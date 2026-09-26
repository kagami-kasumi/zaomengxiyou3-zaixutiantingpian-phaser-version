import type { PetBehaviorContext } from './PetBehavior';
import type { PetSkillCastResult } from './PetTypes';
import type { ProjectileModel, ProjectileSystemModel } from './ProjectileTypes';
import type { MonkeyHorsePrivateProjectile } from './PetMonkeyHorsePrivateProjectile';
import { spawnProjectileFromTuning } from './ProjectileSystem';
import { refreshMonkeyHorseContextDamage } from './PetMonkeyHorseDamageSystem';
import { toDragonSourceCoordinate } from './PetDragonCollisionSystem';
import { createHorseAoyiMotion } from './PetHorseAoyiMotion';
import truth from '../assets/pet-horse-aoyi.json';
import { petTargetEffectPayload } from './PetTargetEffectPayload';
import { bindMonkeyHorseNativeClipClock } from './PetMonkeyHorseNativeClipClock';

/** The source emitter owns configuration only; the existing private owner steps every effect. */
export function emitHorseAoyi(context: PetBehaviorContext,
  adopt: (entry: MonkeyHorsePrivateProjectile) => void): PetSkillCastResult {
  if (context.pet.species !== 'horse' || context.pet.form !== 4) throw new Error('Horse4 aoyi requires its source');
  return context.castSkill(({ projectiles }) => {
    const monsters = context.projectileCombat?.monstersInParentSpace?.() ?? context.targets;
    const created: ProjectileModel[] = [];
    for (let index = 0; index < monsters.length; index++) {
      const target = monsters[monsters.length - index - 1]!;
      const entry = create(context, projectiles, false,
        context.runtime.x + (monsters.length / 2 - index) * truth.spacing, truth.startY);
      entry.motion = createHorseAoyiMotion(context.pet.skills.includes('sp') ? target.id : undefined);
      if (entry.motion.targetId) entry.retainedTarget = context.projectileCombat?.bindTarget?.(entry.motion.targetId);
      const p = entry.projectile;
      p.trackingTargetId = entry.motion.targetId;
      p.velocityX = entry.motion.speedX; p.velocityY = entry.motion.speedY;
      p.remainingDistance = entry.motion.distance;
      entry.onAccepted = current => {
        // Skill flags are read on accepted hit, not frozen when the falling effect was created.
        if (!current.pet.skills.includes('bz')) return;
        const explode = () => {
          // BasePet.isDead uses HP only; source readyToDestroy is deliberately not a guard.
          if (current.pet.hp <= 0) return;
          const explosion = create(current, projectiles, true, p.x, p.y);
          adopt(explosion);
        };
        if (current.pet.skills.includes('bd')) {
          if (!current.projectileCombat?.delay) throw new Error('Horse4 delayed explosion requires the world timer');
          current.projectileCombat.delay(1000, explode);
        } else explode();
      };
      projectiles.projectiles.push(p); adopt(entry); created.push(p);
    }
    return { ok: true, message: 'horse4 hit5', pet: context.pet, target: monsters.at(-1),
      projectile: created[0], projectiles: created, damage: created[0]?.damage ?? 0,
      mpBefore: context.pet.mp, mpAfter: context.pet.mp };
  });
}

function create(context: PetBehaviorContext, projectiles: ProjectileSystemModel,
  explosion: boolean, x: number, y: number): MonkeyHorsePrivateProjectile {
  const action = explosion ? 'hit5_2' : 'hit5_1';
  const cache = refreshMonkeyHorseContextDamage(context, action);
  const config = explosion ? truth.explosionAttack : truth.attack;
  const lastTick = explosion ? truth.explosionLastTick : truth.ttlSeconds * context.hostFps;
  const symbol = explosion ? truth.explosionSymbol : truth.symbol;
  const p = spawnProjectileFromTuning(projectiles, {
    sourceId: context.pet.id, x: toDragonSourceCoordinate(x), y: toDragonSourceCoordinate(y), facingX: -1,
  }, explosion ? 'pet-horse4-tmaoyi-explode' : 'pet-horse4-tmaoyi', symbol, {
    actionName: action, assetKey: `pet-skill.horse4.tmaoyi${explosion ? '.explode' : ''}`,
    sourceSymbol: symbol, runtimeName: symbol, offsetX: 0, offsetY: 0,
    speedX: 0, speedY: 0, distance: undefined, width: 0, height: 0,
    lifetimeMs: lastTick * 1000 / context.hostFps, damage: cache.hurt, attackKind: 'magic',
    knockbackX: config.knockback[0]!, knockbackY: config.knockback[1]!,
    hitIntervalFrames: config.interval, maxHits: config.maxHits,
  });
  p.petHostTick = 0; p.petActionToken = context.actionToken; p.petRenderDirection = 1;
  bindMonkeyHorseNativeClipClock(p, context);
  p.petTargetEffects = petTargetEffectPayload(context, action, context.pet.atk);
  p.critical = cache.critical; p.destroyWhenSourceHurt = false;
  if (explosion) projectiles.projectiles.push(p);
  return { projectile: p, cache, lastTick, action, timed: !explosion };
}
