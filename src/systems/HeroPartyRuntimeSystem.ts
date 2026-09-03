import type { HeroSkillLoadout } from './HeroSkillSystem';
import type { HeroMovementBounds, HeroMovementModel, MovementPlatform } from './HeroMovementSystem';
import {
  createLevelHeroMovementRuntime,
  updateLevelHeroMovementRuntime,
  type LevelHeroMovementRuntime,
} from './LevelHeroMovementSystem';
import type { PlayerInputState, PlayerSlot } from './InputSystem';
import type { HeroId } from './HeroNormalAttackSystem';
import type { EquipmentLoadout } from './EquipmentSystem';
import type { HeroProgressionModel } from './ProgressionSystem';
import { updateHeroCombat } from './HeroCombatSystem';
import { createProjectileSystem, updateProjectiles, type ProjectileSourceSnapshot } from './ProjectileSystem';
import {
  isRole5LoongSwordProjectileAttack,
  resolveRole5LoongSwordProjectileHits,
  spawnRole5LoongSwordProjectile,
} from './Role5NormalAttackProjectileSystem';
import {
  createStage1CombatPlayer,
  createStage1CombatRuntime,
  resolveStage1EnemyAttack,
  resolveStage1HeroAttack,
  updateStage1CombatPlayer,
  type Stage1CombatEnemy,
  type Stage1CombatPlayer,
  type Stage1CombatRuntime,
  type Stage1DeathReason,
} from './Stage1CombatSystem';
import {
  resolveFormalRole1ShadowProjectileHits,
  updateFormalRole1ShadowRuntime,
} from './Role1ShadowFormalRuntimeSystem';
import { destroyCombatFeedbackModel } from './CombatFeedbackSystem';

export type HeroPartyMemberDefinition = Readonly<{
  slot: PlayerSlot;
  heroId: HeroId;
  x: number;
  y: number;
  width: number;
  currentPlatformId?: string;
  skillLoadout?: HeroSkillLoadout;
  progression?: HeroProgressionModel;
  equipmentLoadout?: EquipmentLoadout;
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
  monsterTargets?: readonly Stage1CombatEnemy[];
  random?: () => number;
  projectileSources?: readonly ProjectileSourceSnapshot[];
}>;

export type HeroRuntimeSnapshot = Readonly<{
  slot: PlayerSlot;
  x: number;
  y: number;
  width: number;
  facingX: -1 | 1;
  alive: boolean;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  deathReason?: string;
}>;

export type HeroPartyEnvironmentHit = Readonly<{
  target: PlayerSlot;
  damage: number;
  knockbackX: number;
  bounds: HeroMovementBounds;
  deathReason: Stage1DeathReason;
}>;

export type HeroPartyRuntimeModel = {
  members: Array<Readonly<{
    combat: Stage1CombatPlayer;
    movement: HeroMovementModel;
  }>>;
  movement: LevelHeroMovementRuntime;
  combat: Stage1CombatRuntime;
  projectiles: ReturnType<typeof createProjectileSystem>;
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
    const combat = createStage1CombatPlayer(definition.slot, definition.heroId, {
      progression: definition.progression,
      equipmentLoadout: definition.equipmentLoadout,
    });
    if (definition.skillLoadout) combat.skill.loadout = definition.skillLoadout;
    return { combat, movement: movement.members[index]!.movement };
  });
  return {
    members,
    movement,
    combat: createStage1CombatRuntime(),
    projectiles: createProjectileSystem(),
    destroyed: false,
  };
}

export function updateHeroPartyRuntime(
  runtime: HeroPartyRuntimeModel,
  frame: HeroPartyFrame,
): void {
  if (runtime.destroyed) return;
  updateHeroPartyMovement(runtime, frame);
  const enabled = runtime.members.map((member) => member.combat.combat.state !== 'dead');
  runtime.members.forEach((member, index) => {
    const input = frame.inputs[index];
    if (!input || !enabled[index]) return;
    const environment = frame.environmentFor(index, member.movement);
    const previousInput = member.combat.previousInput;
    updateFormalRole1ShadowRuntime({
      player: member.combat,
      movement: member.movement,
      input,
      previousInput,
      projectiles: runtime.projectiles,
      targets: frame.monsterTargets ?? [],
      timeMs: frame.timeMs,
      deltaMs: frame.deltaMs,
      random: frame.random,
    });
    const attackEvent = updateStage1CombatPlayer({
      player: member.combat,
      input,
      movement: member.movement,
      bounds: environment.bounds,
      timeMs: frame.timeMs,
      deltaMs: frame.deltaMs,
    });
    if (attackEvent) {
      spawnRole5LoongSwordProjectile(
        runtime.projectiles,
        {
          sourceId: member.combat.combat.id,
          x: member.movement.x,
          y: member.movement.y,
          facingX: member.movement.facingX,
        },
        attackEvent.attack,
        member.combat.skill.role5Runtime.loongSwordRemainingMs > 0,
      );
    }
  });
  updateProjectiles(
    runtime.projectiles,
    [...runtime.members.map((member): ProjectileSourceSnapshot => ({
      id: member.combat.combat.id,
      state: member.combat.combat.state === 'dead'
        ? 'dead'
        : member.combat.combat.state === 'hurt' ? 'hurt' : 'ready',
    })), ...(frame.projectileSources ?? [])],
    frame.deltaMs,
  );
}

export function updateHeroPartyMovement(
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
}

export function updateHeroPartyCombatStates(
  runtime: HeroPartyRuntimeModel,
  frame: Omit<HeroPartyFrame, 'inputs'>,
): void {
  if (runtime.destroyed) return;
  runtime.members.forEach((member, index) => {
    if (member.combat.combat.state === 'dead') return;
    const environment = frame.environmentFor(index, member.movement);
    updateHeroCombat(
      member.combat.combat,
      member.movement,
      environment.bounds,
      frame.timeMs,
      frame.deltaMs,
    );
  });
}

export function resolveHeroPartyAttacks(
  runtime: HeroPartyRuntimeModel,
  monsterTargets: readonly Stage1CombatEnemy[],
  timeMs: number,
): void {
  if (runtime.destroyed) return;
  runtime.members.forEach((member) => {
    const attack = member.combat.normalAttack.activeAttack;
    const enhanced = member.combat.skill.role5Runtime.loongSwordRemainingMs > 0;
    if (attack && isRole5LoongSwordProjectileAttack(attack, enhanced)) return;
    resolveStage1HeroAttack({
      runtime: runtime.combat,
      player: member.combat,
      movement: member.movement,
      enemies: monsterTargets,
      timeMs,
    });
  });
  resolveRole5LoongSwordProjectileHits({
    projectiles: runtime.projectiles,
    combat: runtime.combat,
    enemies: monsterTargets,
    timeMs,
  });
  resolveFormalRole1ShadowProjectileHits({
    projectiles: runtime.projectiles,
    combat: runtime.combat,
    enemies: monsterTargets,
    timeMs,
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

export function applyHeroPartyEnvironmentHits(
  runtime: HeroPartyRuntimeModel,
  hits: readonly HeroPartyEnvironmentHit[],
): void {
  if (runtime.destroyed) return;
  for (const hit of hits) {
    const member = runtime.members.find((candidate) => candidate.combat.slot === hit.target);
    if (!member || member.combat.combat.state === 'dead') continue;
    member.combat.combat.hp = Math.max(0, member.combat.combat.hp - hit.damage);
    member.movement.x = Math.min(
      Math.max(member.movement.x + hit.knockbackX, hit.bounds.left),
      hit.bounds.right,
    );
    if (member.combat.combat.hp === 0) {
      member.combat.combat.state = 'dead';
      member.combat.deathReason = hit.deathReason;
    } else {
      member.combat.combat.state = 'hurt';
    }
  }
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
    width: member.movement.width,
    facingX: member.movement.facingX,
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
  runtime.projectiles.projectiles.length = 0;
  destroyCombatFeedbackModel(runtime.combat.feedback);
}
