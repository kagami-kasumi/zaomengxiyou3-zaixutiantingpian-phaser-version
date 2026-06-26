import type { HeroBaseStats } from '../../systems/EquipmentSystem';
import type { HeroCombatModel } from '../../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../../systems/HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel } from '../../systems/HeroSkillSystem';
import type { InputState, PlayerSlot } from '../../systems/InputSystem';
import type { Monster30Model } from '../../systems/Monster30System';
import type { ProjectileModel, ProjectileSystemModel } from '../../systems/ProjectileSystem';
import {
  requestRole5CompanionSkillFromInput,
  requestRole5StatusSkillFromInput,
  requestRole5SpearSkillFromInput,
  requestRole5SwordSkillFromInput,
  triggerRole5JrjlArrow,
  updateRole5SkillRuntime,
  type Role5SkillTarget,
} from '../../systems/Role5SkillSystem';

export type Role5BridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

export type Role5BridgeResult = {
  castEvents: HeroSkillCastEvent[];
  spawnedProjectiles: ProjectileModel[];
};

export function updateRole5SkillBridge(params: {
  players: readonly Role5BridgePlayer[];
  input: InputState;
  previousInput: InputState | undefined;
  projectiles: ProjectileSystemModel;
  monsters: readonly Monster30Model[];
  deltaMs: number;
  timeMs: number;
}): Role5BridgeResult {
  const result: Role5BridgeResult = { castEvents: [], spawnedProjectiles: [] };
  const targets = params.monsters.map(createTarget);
  for (const player of params.players) {
    if (!player.movement || player.normalAttack.heroId !== 5) continue;
    updateRole5SkillRuntime({
      runtime: player.skill.role5Runtime,
      movement: player.movement,
      deltaMs: params.deltaMs,
    });
    if (!player.skill.role5Runtime.active && isRole5ActiveAction(player.skill)) {
      player.skill.activeAction = undefined;
    }
    const projectileCountBeforeCast = params.projectiles.projectiles.length;
    const cast = requestRole5SpearSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      targets,
      sourcePower: player.baseStats.power,
      timeMs: params.timeMs,
    });
    if (cast) {
      result.castEvents.push(cast);
      result.spawnedProjectiles.push(
        ...params.projectiles.projectiles.slice(projectileCountBeforeCast),
      );
    }
    const statusProjectileCountBeforeCast = params.projectiles.projectiles.length;
    const statusCast = requestRole5StatusSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      timeMs: params.timeMs,
    });
    if (statusCast) {
      result.castEvents.push(statusCast);
      result.spawnedProjectiles.push(
        ...params.projectiles.projectiles.slice(statusProjectileCountBeforeCast),
      );
    }
    const swordProjectileCountBeforeCast = params.projectiles.projectiles.length;
    const swordCast = requestRole5SwordSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      timeMs: params.timeMs,
    });
    if (swordCast) {
      result.castEvents.push(swordCast);
      result.spawnedProjectiles.push(
        ...params.projectiles.projectiles.slice(swordProjectileCountBeforeCast),
      );
    }
    const companionProjectileCountBeforeCast = params.projectiles.projectiles.length;
    const companionCast = requestRole5CompanionSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      timeMs: params.timeMs,
    });
    if (companionCast) {
      result.castEvents.push(companionCast);
      result.spawnedProjectiles.push(
        ...params.projectiles.projectiles.slice(companionProjectileCountBeforeCast),
      );
    }
    if (cast || statusCast || swordCast || companionCast) {
      const jrjl = triggerRole5JrjlArrow({
        runtime: player.skill.role5Runtime,
        projectiles: params.projectiles,
        point: {
          sourceId: player.combat.id,
          x: player.movement.x,
          y: player.movement.y,
          facingX: player.movement.facingX,
        },
        sourcePower: player.baseStats.power,
      });
      if (jrjl) result.spawnedProjectiles.push(jrjl);
    }
  }
  return result;
}

function isRole5ActiveAction(skill: HeroSkillModel): boolean {
  return skill.activeAction?.skillName === 'xlc' ||
    skill.activeAction?.skillName === 'lxuanj' ||
    skill.activeAction?.skillName === 'xkjz' ||
    skill.activeAction?.skillName === 'yyb' ||
    skill.activeAction?.skillName === 'tlj' ||
    skill.activeAction?.skillName === 'pkz' ||
    skill.activeAction?.skillName === 'lxj' ||
    skill.activeAction?.skillName === 'mlsz' ||
    skill.activeAction?.skillName === 'lysh' ||
    skill.activeAction?.skillName === 'jrjl';
}

function createTarget(monster: Monster30Model): Role5SkillTarget {
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    hp: monster.hp,
    maxHp: monster.maxHp,
    alive: monster.state !== 'dead' && monster.state !== 'removed',
  };
}
