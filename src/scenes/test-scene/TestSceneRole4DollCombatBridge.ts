import { resolveHitOnce } from '../../systems/CombatSystem';
import { getActiveHeroHitbox } from '../../systems/HeroNormalAttackSystem';
import { getMonster30AttackHitbox } from '../../systems/Monster30System';
import {
  getActiveProjectiles,
  getProjectileAttackId,
  getProjectileHitbox,
  recordProjectileHit,
} from '../../systems/ProjectileSystem';
import { damageRole4VoodooDoll } from '../../systems/Role4VoodooDollSystem';
import { createVoodooTarget } from './TestSceneRole4SkillBridge';

export function updateRole4DollCombat(this: any, time: number): void {
  for (const owner of this.playerViews) {
    const doll = owner.skill.role4VoodooRuntime.doll;
    if (!doll) continue;
    const dollBounds = {
      x: doll.x - 38,
      y: doll.y - 43,
      width: 76,
      height: 86,
    };
    const targets = this.monster30s.map((monster: any) =>
      createVoodooTarget(monster, owner.slot));
    for (const attacker of this.playerViews) {
      if (attacker.combat.id === doll.sourceId || !attacker.movement) continue;
      const attack = attacker.normalAttack.activeAttack;
      const hitbox = getActiveHeroHitbox(attacker.normalAttack, attacker.movement, time);
      if (!attack || !hitbox || !overlaps(hitbox, dollBounds)) continue;
      const attackId = `${attacker.slot}-normal-${attack.id}`;
      if (!resolveHitOnce(this.hitRegistry, attackId, doll.id)) continue;
      damageRole4VoodooDoll({
        runtime: owner.skill.role4VoodooRuntime,
        projectiles: this.projectileSystem,
        targets,
        damage: attack.damage,
      });
    }
    if (!owner.skill.role4VoodooRuntime.doll) continue;
    for (const projectile of getActiveProjectiles(this.projectileSystem)) {
      if (
        projectile.visualOnly || projectile.elapsedMs < (projectile.activeAfterMs ?? 0) ||
        projectile.sourceId === doll.sourceId
      ) continue;
      if (!overlaps(getProjectileHitbox(projectile), dollBounds)) continue;
      const attackId = getProjectileAttackId(projectile);
      if (!resolveHitOnce(this.hitRegistry, attackId, doll.id)) continue;
      const event = damageRole4VoodooDoll({
        runtime: owner.skill.role4VoodooRuntime,
        projectiles: this.projectileSystem,
        targets,
        damage: projectile.damage,
      });
      if (event) recordProjectileHit(projectile);
    }
    if (!owner.skill.role4VoodooRuntime.doll) continue;
    for (const monster of this.monster30s) {
      const attack = monster.activeAttack;
      const hitbox = getMonster30AttackHitbox(monster);
      if (!attack || !hitbox || !overlaps(hitbox, dollBounds)) continue;
      if (!resolveHitOnce(this.hitRegistry, attack.attackId, doll.id)) continue;
      damageRole4VoodooDoll({
        runtime: owner.skill.role4VoodooRuntime,
        projectiles: this.projectileSystem,
        targets,
        damage: attack.damage,
      });
    }
  }
}

function overlaps(
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
): boolean {
  return left.x < right.x + right.width && left.x + left.width > right.x &&
    left.y < right.y + right.height && left.y + left.height > right.y;
}
