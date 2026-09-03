import type { DamageEvent } from './CombatSystem';
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
  getStage1EnemyConfig,
  resolveStage1HeroHit,
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
      const event = resolveStage1HeroHit({
        runtime: params.combat,
        enemy,
        sourceId: projectile.sourceId,
        ownerSlot: projectile.sourceId.startsWith('p2') ? 'p2' : 'p1',
        source: 'hero',
        attackId: getProjectileAttackId(projectile),
        actionName: projectile.actionName,
        attackKind: projectile.attackKind,
        damage: projectile.damage,
        knockbackX: projectile.knockbackX,
        knockbackY: projectile.knockbackY,
        timeMs: params.timeMs,
        critical: projectile.critical,
      });
      if (!event) continue;
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
