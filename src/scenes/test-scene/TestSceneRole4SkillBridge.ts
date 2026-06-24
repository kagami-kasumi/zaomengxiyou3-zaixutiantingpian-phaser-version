import type { HeroBaseStats } from '../../systems/EquipmentSystem';
import type { HeroCombatModel } from '../../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../../systems/HeroNormalAttackSystem';
import type { HeroSkillCastEvent, HeroSkillModel } from '../../systems/HeroSkillSystem';
import type { InputState, PlayerSlot } from '../../systems/InputSystem';
import {
  applyMonster30Hit,
  applyMonster30Role4MbyjStun,
  type Monster30Model,
} from '../../systems/Monster30System';
import type { ProjectileModel, ProjectileSystemModel } from '../../systems/ProjectileSystem';
import {
  requestRole4PoisonSkillFromInput,
  applyRole4PoisonStack,
  updateRole4PoisonSkillRuntime,
  type Role4PoisonDamageEvent,
  type Role4PoisonTarget,
} from '../../systems/Role4PoisonSkillSystem';
import { findSkillInState, type HeroSkillLearningState } from '../../systems/SkillUISystem';
import {
  requestRole4WdwwFromInput,
  updateRole4VoodooDoll,
  type Role4VoodooTarget,
} from '../../systems/Role4VoodooDollSystem';
import {
  requestRole4MbyjFromInput,
  updateRole4PoisonChains,
  type Role4PoisonChainHitEvent,
  type Role4PoisonChainTarget,
} from '../../systems/Role4PoisonChainSystem';
import {
  requestRole4MobilitySkillFromInput,
  updateRole4MobilitySkill,
} from '../../systems/Role4MobilitySkillSystem';
import {
  requestRole4FinisherSkillFromInput,
  updateRole4FinisherSkill,
} from '../../systems/Role4FinisherSkillSystem';

export type Role4BridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

export type Role4BridgeResult = {
  castEvents: HeroSkillCastEvent[];
  poisonDamageEvents: Array<Role4PoisonDamageEvent & { slot: PlayerSlot }>;
  spawnedProjectiles: ProjectileModel[];
  chainHitEvents: Array<Role4PoisonChainHitEvent & { slot: PlayerSlot }>;
};

export function updateRole4SkillBridge(params: {
  players: readonly Role4BridgePlayer[];
  input: InputState;
  previousInput: InputState | undefined;
  projectiles: ProjectileSystemModel;
  monsters: readonly Monster30Model[];
  skillLearning: Record<PlayerSlot, HeroSkillLearningState>;
  deltaMs: number;
  timeMs: number;
}): Role4BridgeResult {
  const result: Role4BridgeResult = {
    castEvents: [],
    poisonDamageEvents: [],
    spawnedProjectiles: [],
    chainHitEvents: [],
  };
  for (const player of params.players) {
    if (!player.movement || player.normalAttack.heroId !== 4) continue;
    const runtime = player.skill.role4Runtime;
    runtime.mdsLevel = findSkillInState(params.skillLearning[player.slot], 'mds')?.level ?? 0;
    runtime.mbyjLevel = findSkillInState(params.skillLearning[player.slot], 'mbyj')?.level ?? 1;
    const poisonEvents = updateRole4PoisonSkillRuntime({
      runtime,
      targets: params.monsters.map((monster) => createTarget(monster, player.slot)),
      deltaMs: params.deltaMs,
    });
    const voodooTargets = params.monsters.map((monster) => createVoodooTarget(monster, player.slot));
    const chainTargets = params.monsters.map((monster) => createChainTarget(
      monster,
      player,
    ));
    const chainEvents = updateRole4PoisonChains({
      runtime: player.skill.role4PoisonChainRuntime,
      projectiles: params.projectiles,
      targets: chainTargets,
      deltaMs: params.deltaMs,
    });
    result.chainHitEvents.push(...chainEvents.map((event) => ({ ...event, slot: player.slot })));
    updateRole4MobilitySkill({
      runtime: player.skill.role4MobilityRuntime,
      movement: player.movement,
      projectiles: params.projectiles,
      deltaMs: params.deltaMs,
    });
    updateRole4FinisherSkill({
      runtime: player.skill.role4FinisherRuntime,
      movement: player.movement,
      combat: player.combat,
      projectiles: params.projectiles,
      deltaMs: params.deltaMs,
    });
    updateRole4VoodooDoll({
      runtime: player.skill.role4VoodooRuntime,
      projectiles: params.projectiles,
      targets: voodooTargets,
      deltaMs: params.deltaMs,
    });
    result.poisonDamageEvents.push(...poisonEvents.map((event) => ({ ...event, slot: player.slot })));
    const projectileCountBeforeCast = params.projectiles.projectiles.length;
    const cast = requestRole4PoisonSkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
    });
    if (cast) result.castEvents.push(cast);
    const wdwwCast = requestRole4WdwwFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      targets: voodooTargets,
    });
    if (wdwwCast) result.castEvents.push(wdwwCast);
    const mbyjCast = requestRole4MbyjFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement: player.movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      targets: chainTargets,
    });
    if (mbyjCast) result.castEvents.push(mbyjCast);
    const mobilityCast = requestRole4MobilitySkillFromInput({
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
    if (mobilityCast) result.castEvents.push(mobilityCast);
    const finisherCast = requestRole4FinisherSkillFromInput({
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
    if (finisherCast) result.castEvents.push(finisherCast);
    result.spawnedProjectiles.push(
      ...params.projectiles.projectiles.slice(projectileCountBeforeCast),
    );
  }
  return result;
}

function createChainTarget(
  monster: Monster30Model,
  player: Role4BridgePlayer,
): Role4PoisonChainTarget {
  const poisonTarget = createTarget(monster, player.slot);
  return {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyPoison: (durationMs) => {
      applyRole4PoisonStack({
        runtime: player.skill.role4Runtime,
        target: poisonTarget,
        hero: player.combat,
        sourcePower: player.baseStats.power,
        level: player.skill.role4Runtime.mbyjLevel,
        durationMs,
      });
    },
    applyStun: (durationMs) => applyMonster30Role4MbyjStun(monster, durationMs),
  };
}

export function createVoodooTarget(
  monster: Monster30Model,
  slot: PlayerSlot,
): Role4VoodooTarget {
  const target: Role4VoodooTarget = {
    id: monster.id,
    x: monster.x,
    y: monster.y,
    hp: monster.hp,
    maxHp: monster.maxHp,
    defense: 0,
    magicDefense: 0,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyDamage: (amount) => {
      if (!target.isAlive) return 0;
      const applied = Math.min(Math.max(0, amount), monster.hp);
      monster.targetSlot = slot;
      applyMonster30Hit(monster, applied);
      target.hp = monster.hp;
      target.x = monster.x;
      target.y = monster.y;
      target.isAlive = monster.state !== 'dead' && monster.state !== 'removed';
      return applied;
    },
  };
  return target;
}

function createTarget(monster: Monster30Model, slot: PlayerSlot): Role4PoisonTarget {
  const target: Role4PoisonTarget = {
    id: monster.id,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
    applyDamage: (amount) => {
      if (!target.isAlive) return 0;
      const applied = Math.min(Math.max(0, amount), monster.hp);
      monster.targetSlot = slot;
      applyMonster30Hit(monster, applied);
      target.isAlive = monster.state !== 'dead' && monster.state !== 'removed';
      return applied;
    },
  };
  return target;
}
