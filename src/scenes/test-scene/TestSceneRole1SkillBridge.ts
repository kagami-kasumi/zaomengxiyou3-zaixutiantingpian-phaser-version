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
  spawnRole1ShadowActionProjectiles,
  startRole1ShadowHit1,
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
import { isRole1ShadowQaEnabled } from './TestSceneConfig';

export type Role1BridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

export type Role1SkillBridgeResult = Readonly<{
  castEvents: HeroSkillCastEvent[];
  spawnedProjectiles: ReturnType<typeof spawnRole1ShadowActionProjectiles>;
}>;

export function updateRole1SkillBridge(params: {
  players: readonly Role1BridgePlayer[];
  input: InputState;
  previousInput: InputState | undefined;
  projectiles: ProjectileSystemModel;
  targets: readonly Role1ShadowTarget[];
  skillLearning: Record<PlayerSlot, HeroSkillLearningState>;
  deltaMs: number;
  timeMs: number;
}): Role1SkillBridgeResult {
  const events: HeroSkillCastEvent[] = [];
  const spawnedProjectiles: ReturnType<typeof spawnRole1ShadowActionProjectiles> = [];
  for (const player of params.players) {
    if (!player.movement || player.normalAttack.heroId !== 1) continue;
    if (isRole1ShadowQaEnabled()) {
      player.combat.invulnerableUntilMs = Number.POSITIVE_INFINITY;
      player.skill.maxMp = 2_000;
      player.skill.mp = 2_000;
    }
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
    const shadowEvents = updateRole1ShadowRuntime(player.skill.role1ShadowRuntime, params.deltaMs);
    spawnedProjectiles.push(...spawnRole1ShadowActionProjectiles(shadowEvents, {
      projectiles: params.projectiles,
      combat: player.combat,
    }));
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
    if (event) {
      events.push(event);
      if (event.skillName === 'lyfb') {
        startRole1ShadowHit1(player.skill.role1ShadowRuntime, event.projectile.damage);
      }
    }
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
  return { castEvents: events, spawnedProjectiles };
}
