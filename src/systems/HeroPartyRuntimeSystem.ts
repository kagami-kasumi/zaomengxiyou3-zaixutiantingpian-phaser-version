import type { HeroSkillLoadout } from './HeroSkillSystem';
import type { HeroMovementBounds, HeroMovementModel, MovementPlatform } from './HeroMovementSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
  type LevelHeroMovementRuntime,
} from './LevelHeroMovementSystem';
import type { PlayerInputState, PlayerSlot } from './InputSystem';
import type { HeroId } from './HeroNormalAttackSystem';
import {
  createStage1CombatPlayer,
  createStage1CombatRuntime,
  resolveStage1EnemyAttack,
  resolveStage1HeroAttack,
  updateStage1CombatPlayer,
  type Stage1CombatEnemy,
  type Stage1CombatPlayer,
  type Stage1CombatRuntime,
} from './Stage1CombatSystem';

export type HeroPartyMemberDefinition = Readonly<{
  slot: PlayerSlot;
  heroId: HeroId;
  x: number;
  y: number;
  width: number;
  currentPlatformId?: string;
  skillLoadout?: HeroSkillLoadout;
}>;

export type LevelHeroEnvironmentSnapshot = Readonly<{
  platforms: readonly MovementPlatform[];
  bounds: HeroMovementBounds;
}>;

export type HeroPartyFrame = Readonly<{
  timeMs: number;
  deltaMs: number;
  inputs: readonly PlayerInputState[];
  environmentFor: (index: number, movement: HeroMovementModel) => LevelHeroEnvironmentSnapshot;
}>;

export type HeroRuntimeSnapshot = Readonly<{
  slot: PlayerSlot;
  x: number;
  y: number;
  alive: boolean;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  deathReason?: string;
}>;

export type HeroPartyRuntimeModel = {
  members: Array<Readonly<{
    combat: Stage1CombatPlayer;
    movement: HeroMovementModel;
  }>>;
  movement: LevelHeroMovementRuntime;
  combat: Stage1CombatRuntime;
  destroyed: boolean;
};

export function createHeroPartyRuntimeModel(
  definitions: readonly HeroPartyMemberDefinition[],
): HeroPartyRuntimeModel {
  const movement = createLevelHeroMovementRuntime(definitions.map((member) => ({
    x: member.x,
    y: member.y,
    width: member.width,
    currentPlatformId: member.currentPlatformId,
  })));
  const members = definitions.map((definition, index) => {
    const combat = createStage1CombatPlayer(definition.slot, definition.heroId);
    if (definition.skillLoadout) combat.skill.loadout = definition.skillLoadout;
    return { combat, movement: movement.members[index]!.movement };
  });
  return { members, movement, combat: createStage1CombatRuntime(), destroyed: false };
}

export function updateHeroPartyRuntime(
  runtime: HeroPartyRuntimeModel,
  frame: HeroPartyFrame,
): void {
  if (runtime.destroyed) return;
  const enabled = runtime.members.map((member) => member.combat.combat.state !== 'dead');
  updateLevelHeroMovementRuntime(
    runtime.movement,
    frame.inputs,
    enabled,
    frame.environmentFor,
    frame.timeMs,
    frame.deltaMs,
  );
  runtime.members.forEach((member, index) => {
    const input = frame.inputs[index];
    if (!input || !enabled[index]) return;
    const environment = frame.environmentFor(index, member.movement);
    updateStage1CombatPlayer({
      player: member.combat,
      input,
      movement: member.movement,
      bounds: environment.bounds,
      timeMs: frame.timeMs,
      deltaMs: frame.deltaMs,
    });
  });
}

export function resolveHeroPartyAttacks(
  runtime: HeroPartyRuntimeModel,
  monsterTargets: readonly Stage1CombatEnemy[],
  timeMs: number,
): void {
  if (runtime.destroyed) return;
  runtime.members.forEach((member) => {
    resolveStage1HeroAttack({
      runtime: runtime.combat,
      player: member.combat,
      movement: member.movement,
      enemies: monsterTargets,
      timeMs,
    });
  });
}

export function resolveHeroPartyEnemyAttack(
  runtime: HeroPartyRuntimeModel,
  enemy: Stage1CombatEnemy,
  timeMs: number,
): void {
  if (runtime.destroyed) return;
  resolveStage1EnemyAttack({
    runtime: runtime.combat,
    enemy,
    players: runtime.members.map((member) => ({
      player: member.combat,
      x: member.movement.x,
    })),
    timeMs,
  });
}

export function setHeroPartySkillLoadout(
  runtime: HeroPartyRuntimeModel,
  slot: PlayerSlot,
  skillLoadout: HeroSkillLoadout,
): void {
  const member = runtime.members.find((candidate) => candidate.combat.slot === slot);
  if (member) member.combat.skill.loadout = skillLoadout;
}

export function snapshotHeroParty(runtime: HeroPartyRuntimeModel): readonly HeroRuntimeSnapshot[] {
  return runtime.members.map((member) => ({
    slot: member.combat.slot,
    x: member.movement.x,
    y: member.movement.y,
    alive: member.combat.combat.state !== 'dead',
    hp: member.combat.combat.hp,
    maxHp: member.combat.combat.maxHp,
    mp: member.combat.mp,
    maxMp: member.combat.maxMp,
    deathReason: member.combat.deathReason,
  }));
}

export function destroyHeroPartyRuntime(runtime: HeroPartyRuntimeModel): void {
  if (runtime.destroyed) return;
  runtime.destroyed = true;
  runtime.members.length = 0;
  runtime.movement.members.length = 0;
}
