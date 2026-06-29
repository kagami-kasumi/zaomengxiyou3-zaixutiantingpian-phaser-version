import type { HeroBaseStats } from '../../systems/EquipmentSystem';
import type { HeroCombatModel } from '../../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../../systems/HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel } from '../../systems/HeroSkillSystem';
import type { InputState, PlayerSlot } from '../../systems/InputSystem';
import type { ProjectileSystemModel } from '../../systems/ProjectileSystem';
import type { Monster30Model } from '../../systems/Monster30System';
import {
  requestRole3DefenseSkillFromInput,
  syncRole3DefenseState,
  updateRole3DefenseRuntime,
  type Role3PullTarget,
} from '../../systems/Role3DefenseSkillSystem';
import {
  requestRole3ControlSkillFromInput,
  updateRole3PullEffects,
} from '../../systems/Role3ControlSkillSystem';
import { findSkillInState, type HeroSkillLearningState } from '../../systems/SkillUISystem';
import { requestRole3ImpactSkillFromInput } from '../../systems/Role3ImpactSkillSystem';
import {
  requestRole3MobilitySkillFromInput,
  updateRole3Mobility,
} from '../../systems/Role3MobilitySkillSystem';
import {
  requestRole3UltimateSkillFromInput,
  type Role3UltimateTarget,
} from '../../systems/Role3UltimateSkillSystem';

export type Role3BridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

export function updateRole3SkillBridge(params: {
  players: readonly Role3BridgePlayer[];
  input: InputState;
  previousInput: InputState | undefined;
  projectiles: ProjectileSystemModel;
  monsters: readonly Monster30Model[];
  skillLearning: Record<PlayerSlot, HeroSkillLearningState>;
  deltaMs: number;
}): HeroSkillCastEvent[] {
  const events: HeroSkillCastEvent[] = [];
  for (const player of params.players) {
    if (!player.movement || player.normalAttack.heroId !== 3) continue;
    const runtime = player.skill.role3Runtime;
    runtime.rjLevel = findSkillInState(params.skillLearning[player.slot], 'rj')?.level ?? 0;
    runtime.sspLevel = findSkillInState(params.skillLearning[player.slot], 'ssp')?.level ?? 0;
    updateRole3DefenseRuntime(runtime, player.combat, params.deltaMs);
    updateRole3PullEffects(runtime, params.deltaMs);
    updateRole3Mobility(runtime, params.projectiles, params.deltaMs);
    syncRole3DefenseState(runtime, player.combat, runtime.rjLevel);
    const event = requestRole3DefenseSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
    });
    if (event) {
      events.push(event);
    }
    const controlEvent = requestRole3ControlSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      targets: createControlTargets(params.monsters),
    });
    if (controlEvent) events.push(controlEvent);
    const impactEvent = requestRole3ImpactSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
    });
    if (impactEvent) events.push(impactEvent);
    const mobilityEvent = requestRole3MobilitySkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
    });
    if (mobilityEvent) events.push(mobilityEvent);
    const ultimateEvent = requestRole3UltimateSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      targets: createUltimateTargets(params.monsters),
    });
    if (ultimateEvent) events.push(ultimateEvent);
  }
  return events;
}

function createUltimateTargets(monsters: readonly Monster30Model[]): Role3UltimateTarget[] {
  return monsters.map((monster) => ({
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
  }));
}

function createControlTargets(monsters: readonly Monster30Model[]): Role3PullTarget[] {
  return monsters.map((monster) => ({
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    isImmune: false,
    setPosition: (x, y) => { monster.x = x; monster.y = y; },
    setSuspended: (suspended) => {
      if (monster.state === 'dead' || monster.state === 'removed') return;
      monster.state = suspended ? 'hurt' : 'wait';
      monster.stateTimerMs = suspended ? 1_800 : 0;
      if (suspended) monster.activeAttack = undefined;
    },
  }));
}
