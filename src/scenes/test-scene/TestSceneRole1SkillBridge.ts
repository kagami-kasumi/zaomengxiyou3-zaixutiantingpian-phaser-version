import type { HeroBaseStats } from '../../systems/EquipmentSystem';
import type { HeroCombatModel } from '../../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../../systems/HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel } from '../../systems/HeroSkillSystem';
import type { InputState, PlayerSlot } from '../../systems/InputSystem';
import type { ProjectileSystemModel } from '../../systems/ProjectileSystem';
import {
  requestRole1BasicSkillFromInput,
  syncRole1LearnedSkills,
  updateRole1BasicRuntime,
} from '../../systems/Role1BasicSkillSystem';
import { findSkillInState, type HeroSkillLearningState } from '../../systems/SkillUISystem';

export type Role1BridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

export function updateRole1SkillBridge(params: {
  players: readonly Role1BridgePlayer[];
  input: InputState;
  previousInput: InputState | undefined;
  projectiles: ProjectileSystemModel;
  skillLearning: Record<PlayerSlot, HeroSkillLearningState>;
  deltaMs: number;
}): HeroSkillCastEvent[] {
  const events: HeroSkillCastEvent[] = [];
  for (const player of params.players) {
    if (!player.movement || player.normalAttack.heroId !== 1) continue;
    const learned = params.skillLearning[player.slot];
    syncRole1LearnedSkills(player.skill.role1Runtime, {
      slzLevel: findSkillInState(learned, 'slz')?.level ?? 0,
      sxLevel: findSkillInState(learned, 'sx')?.level ?? 0,
    });
    updateRole1BasicRuntime(player.skill.role1Runtime, params.deltaMs);
    const event = requestRole1BasicSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
    });
    if (event) events.push(event);
  }
  return events;
}
