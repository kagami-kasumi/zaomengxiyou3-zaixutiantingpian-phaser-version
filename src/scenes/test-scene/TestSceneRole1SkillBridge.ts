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
import {
  requestRole1ShadowSkillFromInput,
  syncRole1ShadowLearnedSkills,
  updateRole1ShadowRuntime,
  type Role1ShadowTarget,
} from '../../systems/Role1ShadowSkillSystem';
import {
  requestRole1FinisherSkillFromInput,
  syncRole1FinisherLearnedSkills,
  updateRole1FinisherRuntime,
} from '../../systems/Role1FinisherSkillSystem';
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
  targets: readonly Role1ShadowTarget[];
  skillLearning: Record<PlayerSlot, HeroSkillLearningState>;
  deltaMs: number;
  timeMs: number;
}): HeroSkillCastEvent[] {
  const events: HeroSkillCastEvent[] = [];
  for (const player of params.players) {
    if (!player.movement || player.normalAttack.heroId !== 1) continue;
    const learned = params.skillLearning[player.slot];
    syncRole1LearnedSkills(player.skill.role1Runtime, {
      slzLevel: findSkillInState(learned, 'slz')?.level ?? 0,
      lysLevel: findSkillInState(learned, 'lys')?.level ?? 0,
      hytjLevel: findSkillInState(learned, 'hytj')?.level ?? 0,
      lyfbLevel: findSkillInState(learned, 'lyfb')?.level ?? 0,
      jdyLevel: findSkillInState(learned, 'jdy')?.level ?? 0,
      sxLevel: findSkillInState(learned, 'sx')?.level ?? 0,
    });
    syncRole1ShadowLearnedSkills(player.skill.role1ShadowRuntime, {
      qsezLevel: findSkillInState(learned, 'qsez')?.level ?? 0,
      zzLevel: findSkillInState(learned, 'zz')?.level ?? 0,
    });
    syncRole1FinisherLearnedSkills(player.skill.role1FinisherRuntime, {
      hmzLevel: findSkillInState(learned, 'hmz')?.level ?? 0,
      hyjjLevel: findSkillInState(learned, 'hyjj')?.level ?? 0,
    });
    updateRole1BasicRuntime(player.skill.role1Runtime, params.deltaMs, player.movement);
    updateRole1ShadowRuntime(player.skill.role1ShadowRuntime, params.deltaMs);
    updateRole1FinisherRuntime(player.skill.role1FinisherRuntime, params.deltaMs);
    const event = requestRole1BasicSkillFromInput({
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
    if (event) events.push(event);
    const shadowEvent = requestRole1ShadowSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      targets: params.targets,
      timeMs: params.timeMs,
    });
    if (shadowEvent) events.push(shadowEvent);
    const finisherEvent = requestRole1FinisherSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      targets: params.targets,
      timeMs: params.timeMs,
    });
    if (finisherEvent) events.push(finisherEvent);
  }
  return events;
}
