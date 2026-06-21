import type { HeroBaseStats } from '../../systems/EquipmentSystem';
import type { HeroCombatModel } from '../../systems/HeroCombatSystem';
import type { HeroMovementModel } from '../../systems/HeroMovementSystem';
import type { HeroNormalAttackModel } from '../../systems/HeroNormalAttackSystem';
import {
  requestRole2SkillFromInput,
  type HeroSkillCastEvent,
  type HeroSkillModel,
} from '../../systems/HeroSkillSystem';
import type { InputState, PlayerSlot } from '../../systems/InputSystem';
import type { Monster30Model } from '../../systems/Monster30System';
import { getActivePet, type PlayerPetRosters } from '../../systems/PetSystem';
import type { PetRuntimeModel } from '../../systems/PetTypes';
import type { ProjectileModel, ProjectileSystemModel } from '../../systems/ProjectileSystem';
import { updateRole2HealingOverTime, type Role2SupportTarget } from '../../systems/Role2SupportSkillSystem';
import { updateRole2PullEffects, type Role2ControlTarget } from '../../systems/Role2ControlSkillSystem';
import { updateRole2Jhsj } from '../../systems/Role2JhsjSkillSystem';
import { updateRole2Shadow } from '../../systems/Role2ShadowSkillSystem';
import { takeRole2RuntimeProjectiles } from '../../systems/Role2SkillRuntimeSystem';
import {
  findSkillInState,
  type HeroSkillLearningState,
} from '../../systems/SkillUISystem';

export type Role2BridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  skill: HeroSkillModel;
  baseStats: HeroBaseStats;
};

export type Role2SkillBridgeResult = {
  castEvents: HeroSkillCastEvent[];
  spawnedProjectiles: ProjectileModel[];
};

export function updateRole2SkillBridge(params: {
  players: readonly Role2BridgePlayer[];
  input: InputState;
  previousInput: InputState | undefined;
  projectiles: ProjectileSystemModel;
  monsters: readonly Monster30Model[];
  petRosters: PlayerPetRosters;
  petRuntimes: Partial<Record<PlayerSlot, PetRuntimeModel | undefined>>;
  skillLearning: Record<PlayerSlot, HeroSkillLearningState>;
  deltaMs: number;
  timeMs: number;
}): Role2SkillBridgeResult {
  const castEvents: HeroSkillCastEvent[] = [];
  const spawnedProjectiles: ProjectileModel[] = [];

  for (const player of params.players) {
    const movement = player.movement;
    if (!movement || player.normalAttack.heroId !== 2) continue;
    syncLearnedRole2Skills(player.skill, params.skillLearning[player.slot]);
    const runtime = player.skill.role2Runtime;
    updateRole2HealingOverTime(runtime, params.deltaMs);
    updateRole2PullEffects(runtime, params.deltaMs);
    updateRole2Shadow(runtime, params.projectiles, params.deltaMs);
    updateRole2Jhsj(runtime, params.projectiles, params.deltaMs);

    const event = requestRole2SkillFromInput({
      skill: player.skill,
      input: params.input[player.slot],
      previousInput: params.previousInput?.[player.slot],
      movement,
      combat: player.combat,
      normalAttack: player.normalAttack,
      projectiles: params.projectiles,
      sourcePower: player.baseStats.power,
      supportTargets: createSupportTargets(params.players, params.petRosters, params.petRuntimes),
      controlTargets: createControlTargets(params.monsters),
      timeMs: params.timeMs,
    });
    if (event) castEvents.push(event);
    spawnedProjectiles.push(...takeRole2RuntimeProjectiles(runtime));
  }

  return { castEvents, spawnedProjectiles };
}

function createSupportTargets(
  players: readonly Role2BridgePlayer[],
  rosters: PlayerPetRosters,
  runtimes: Partial<Record<PlayerSlot, PetRuntimeModel | undefined>>,
): Role2SupportTarget[] {
  const targets: Role2SupportTarget[] = [];
  for (const player of players) {
    if (player.movement) {
      targets.push({
        id: player.slot, x: player.movement.x, y: player.movement.y,
        maxHp: player.combat.maxHp, isAlive: player.combat.state !== 'dead',
        heal: (amount) => {
          if (player.combat.state !== 'dead') {
            player.combat.hp = Math.min(player.combat.maxHp, player.combat.hp + amount);
          }
        },
      });
    }
    const pet = getActivePet(rosters[player.slot]);
    const runtime = runtimes[player.slot];
    if (pet && runtime?.petId === pet.id) {
      targets.push({
        id: pet.id, x: runtime.x, y: runtime.y,
        maxHp: pet.maxHp, isAlive: pet.hp > 0,
        heal: (amount) => { if (pet.hp > 0) pet.hp = Math.min(pet.maxHp, pet.hp + amount); },
      });
    }
  }
  return targets;
}

function syncLearnedRole2Skills(skill: HeroSkillModel, learning: HeroSkillLearningState): void {
  skill.learnedRole2Skills.blbLevel = findSkillInState(learning, 'blb')?.level ?? 0;
  skill.learnedRole2Skills.sjtLevel = findSkillInState(learning, 'sjt')?.level ?? 0;
  skill.learnedRole2Skills.shyLevel = findSkillInState(learning, 'shy')?.level ?? 0;
}

function createControlTargets(monsters: readonly Monster30Model[]): Role2ControlTarget[] {
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
      monster.stateTimerMs = suspended ? 1_250 : 0;
      if (suspended) monster.activeAttack = undefined;
    },
  }));
}
