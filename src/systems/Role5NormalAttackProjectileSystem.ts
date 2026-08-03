import {
  HeroNormalAttackEffectKeys,
} from '../assets/AssetManifest';
import {
  getProjectileAttackId,
  getProjectileHitbox,
  recordProjectileHit,
  spawnProjectileFromTuning,
} from './ProjectileSystem';
import type {
  ProjectileModel,
  ProjectileSpawnPoint,
  ProjectileSystemModel,
  ProjectileTuning,
  ProjectileVariant,
} from './ProjectileTypes';
import type { ActiveHeroNormalAttack } from './HeroNormalAttackSystem';
import {
  calculateStage1HeroDamage,
  type Stage1CombatEnemy,
  type Stage1CombatRuntime,
} from './Stage1CombatSystem';
import { createDamageEvent, resolveHitOnce, type DamageEvent } from './CombatSystem';

type LoongSwordAction = 'hit18' | 'hit19' | 'hit20';

const LoongSwordProjectileByAction: Readonly<Record<LoongSwordAction, Readonly<{
  variant: ProjectileVariant;
  attackSlug: string;
  tuning: ProjectileTuning;
}>>> = {
  hit18: projectile('role5-loong-sword-hit1', 'loong-sword-hit18', 'hit18_1', HeroNormalAttackEffectKeys.role5SwordHit1Enhanced, 'swordhit1_1', 54.8, 1.6, 171, 60, 0, -2),
  hit19: projectile('role5-loong-sword-hit2', 'loong-sword-hit19', 'hit19_1', HeroNormalAttackEffectKeys.role5SwordHit2Enhanced, 'swordhit2_1', 50.2, -12.65, 196.95, 68, -2, -4),
  hit20: projectile('role5-loong-sword-hit3', 'loong-sword-hit20', 'hit20_1', HeroNormalAttackEffectKeys.role5SwordHit3Enhanced, 'swordhit3_1', 43.5, 2.7, 201, 62, 1, -2),
};

export function isRole5LoongSwordProjectileAttack(
  attack: Pick<ActiveHeroNormalAttack, 'heroId' | 'actionName'>,
  enhanced: boolean,
): attack is Pick<ActiveHeroNormalAttack, 'heroId' | 'actionName'> & { actionName: LoongSwordAction } {
  return enhanced && attack.heroId === 5 && attack.actionName in LoongSwordProjectileByAction;
}

export function spawnRole5LoongSwordProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  attack: ActiveHeroNormalAttack,
  enhanced: boolean,
): ProjectileModel | undefined {
  if (!isRole5LoongSwordProjectileAttack(attack, enhanced)) return undefined;
  const definition = LoongSwordProjectileByAction[attack.actionName];
  const model = spawnProjectileFromTuning(
    system,
    spawnPoint,
    definition.variant,
    definition.attackSlug,
    { ...definition.tuning, damage: attack.damage, attackKind: attack.attackKind },
  );
  model.accelerationX = spawnPoint.facingX * 2.4;
  model.accelerationY = 0;
  model.knockbackX = spawnPoint.facingX * model.knockbackX;
  system.projectiles.push(model);
  return model;
}

export function resolveRole5LoongSwordProjectileHits(params: Readonly<{
  projectiles: ProjectileSystemModel;
  combat: Stage1CombatRuntime;
  enemies: readonly Stage1CombatEnemy[];
  timeMs: number;
}>): readonly DamageEvent[] {
  const events: DamageEvent[] = [];
  for (const projectile of params.projectiles.projectiles) {
    if (!projectile.variant.startsWith('role5-loong-sword-') || projectile.isExpired) continue;
    const hitbox = getProjectileHitbox(projectile);
    for (const enemy of params.enemies) {
      if (enemy.phase === 'dead' || enemy.x < hitbox.x || enemy.x > hitbox.x + hitbox.width) continue;
      const attackId = getProjectileAttackId(projectile);
      if (!resolveHitOnce(params.combat.hitRegistry, attackId, enemy.id)) continue;
      const amount = Math.min(enemy.hp, calculateStage1HeroDamage(
        enemy.enemyType,
        projectile.attackKind,
        projectile.damage,
      ));
      const event = createDamageEvent({
        sourceId: projectile.sourceId,
        targetId: enemy.id,
        attackId,
        actionName: projectile.actionName,
        amount,
        attackKind: projectile.attackKind,
        knockbackX: projectile.knockbackX,
        knockbackY: projectile.knockbackY,
        occurredAtMs: params.timeMs,
      });
      enemy.hp = Math.max(0, enemy.hp - amount);
      enemy.lastHitBy = projectile.sourceId === 'p2' ? 'p2' : 'p1';
      enemy.activeAttack = undefined;
      enemy.phase = enemy.hp === 0 ? 'dead' : 'hurt';
      enemy.phaseRemainingMs = enemy.hp === 0 ? 0 : 180;
      params.combat.audit.damageEvents.push(event);
      recordProjectileHit(projectile);
      events.push(event);
    }
  }
  return events;
}

function projectile(
  variant: ProjectileVariant,
  attackSlug: string,
  actionName: string,
  assetKey: string,
  sourceSymbol: string,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  knockbackX: number,
  knockbackY: number,
) {
  return {
    variant,
    attackSlug,
    tuning: {
      actionName,
      assetKey,
      sourceSymbol,
      runtimeName: sourceSymbol,
      offsetX,
      offsetY,
      speedX: 8,
      speedY: 0,
      distance: 700,
      width,
      height,
      lifetimeMs: 350,
      damage: 0,
      attackKind: 'physics' as const,
      knockbackX,
      knockbackY,
      hitIntervalFrames: 999,
      maxHits: 999,
    },
  };
}
