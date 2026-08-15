import { createDamageEvent, resolveHitOnce, type DamageEvent } from './CombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import type { PlayerInputState } from './InputSystem';
import {
  getProjectileAttackId,
  getProjectileHitbox,
  recordProjectileHit,
  type ProjectileSystemModel,
} from './ProjectileSystem';
import { requestRole1BasicSkillFromInput, updateRole1BasicRuntime } from './Role1BasicSkillSystem';
import {
  requestRole1ShadowSkillFromInput,
  spawnRole1ShadowActionProjectiles,
  startRole1ShadowHit1,
  updateRole1ShadowRuntime,
  type Role1ShadowTarget,
} from './Role1ShadowSkillSystem';
import { findJustPressedSkillSlot } from './SkillInputUtils';
import {
  calculateStage1HeroDamage,
  getStage1EnemyConfig,
  type Stage1CombatEnemy,
  type Stage1CombatPlayer,
  type Stage1CombatRuntime,
} from './Stage1CombatSystem';

export function updateFormalRole1ShadowRuntime(params: Readonly<{
  player: Stage1CombatPlayer;
  movement: HeroMovementModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  projectiles: ProjectileSystemModel;
  targets: readonly Stage1CombatEnemy[];
  timeMs: number;
  deltaMs: number;
  random?: () => number;
}>): void {
  if (params.player.normalAttack.heroId !== 1) return;
  updateRole1BasicRuntime(params.player.skill.role1Runtime, params.deltaMs, params.movement);
  const shadowEvents = updateRole1ShadowRuntime(
    params.player.skill.role1ShadowRuntime,
    params.deltaMs,
  );
  spawnRole1ShadowActionProjectiles(shadowEvents, {
    projectiles: params.projectiles,
    combat: params.player.combat,
  });

  const slotIndex = findJustPressedSkillSlot(params.input, params.previousInput);
  const binding = slotIndex === undefined ? undefined : params.player.skill.loadout.slots[slotIndex];
  if (binding?.skillName === 'lyfb') {
    const event = requestRole1BasicSkillFromInput({
      skill: params.player.skill,
      input: params.input,
      previousInput: params.previousInput,
      movement: params.movement,
      combat: params.player.combat,
      normalAttack: params.player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: params.player.effectiveStats.power,
      timeMs: params.timeMs,
    });
    if (event?.skillName === 'lyfb') {
      startRole1ShadowHit1(params.player.skill.role1ShadowRuntime, event.projectile.damage);
    }
  } else if (binding?.skillName === 'qsez' || binding?.skillName === 'zz') {
    requestRole1ShadowSkillFromInput({
      skill: params.player.skill,
      input: params.input,
      previousInput: params.previousInput,
      movement: params.movement,
      combat: params.player.combat,
      normalAttack: params.player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: params.player.effectiveStats.power,
      targets: params.targets.map(toShadowTarget),
      timeMs: params.timeMs,
      random: params.random,
    });
  }
  params.player.mp = params.player.skill.mp;
}

export function resolveFormalRole1ShadowProjectileHits(params: Readonly<{
  projectiles: ProjectileSystemModel;
  combat: Stage1CombatRuntime;
  enemies: readonly Stage1CombatEnemy[];
  timeMs: number;
}>): readonly DamageEvent[] {
  const events: DamageEvent[] = [];
  for (const projectile of params.projectiles.projectiles) {
    if (!isFormalRole1ShadowProjectile(projectile.variant) || projectile.isExpired) continue;
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

export function isFormalRole1ShadowProjectile(variant: string): boolean {
  return variant.startsWith('role1-qsez-')
    || variant.startsWith('role1-zz-')
    || variant.startsWith('role1-shadow-zz-')
    || variant.startsWith('role1-lyfb-');
}

function toShadowTarget(enemy: Stage1CombatEnemy): Role1ShadowTarget {
  return {
    id: enemy.id,
    x: enemy.x,
    y: enemy.y,
    isBoss: getStage1EnemyConfig(enemy.enemyType).isBoss,
    isAlive: enemy.phase !== 'dead',
  };
}
