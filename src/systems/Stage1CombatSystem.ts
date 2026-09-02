import {
  createDamageEvent,
  createHitRegistry,
  resolveHitOnce,
  type AttackKind,
  type DamageEvent,
  type HitRegistry,
} from './CombatSystem';
import {
  applyHeroDamage,
  createHeroCombat,
  updateHeroCombat,
  type HeroCombatModel,
} from './HeroCombatSystem';
import {
  createHeroNormalAttack,
  getActiveHeroHitbox,
  updateHeroNormalAttack,
  type HeroNormalAttackEvent,
  type HeroId,
  type HeroNormalAttackModel,
} from './HeroNormalAttackSystem';
import type { HeroMovementBounds, HeroMovementModel } from './HeroMovementSystem';
import {
  calculateEffectiveStats,
  createEmptyEquipmentLoadout,
  type EquipmentLoadout,
  type HeroEffectiveStats,
} from './EquipmentSystem';
import {
  addHeroExperience,
  createHeroProgression,
  getHeroBaseStats,
  type HeroProgressionModel,
  type HeroProgressionResult,
} from './ProgressionSystem';
import { createHeroSkillModel, type HeroSkillModel } from './HeroSkillSystem';
import type { PlayerInputState, PlayerSlot } from './InputSystem';
import type { PetCombatDamageEvent } from './PetBehavior';
import { getWorldNormalAttackGeometry } from './HeroNormalAttackGeometry';
import {
  getMonsterDefinition,
  type MonsterCombatDefinition,
  type MonsterDefinitionId,
} from './MonsterDefinitionCatalog';

// Shared placeholder-combat adapter. Stage 2-1 types use authoritative stats and
// readable modern placeholder attacks while their original action/projectile art is deferred.
export type Stage1EnemyType = MonsterDefinitionId;
export type Stage1EnemyAttackPhase = 'approach' | 'windup' | 'active' | 'recovery' | 'hurt' | 'dead';
export type Stage1DeathReason =
  | 'burst-same-frame'
  | 'untelegraphed-contact'
  | 'boss-physical'
  | 'boss-magic'
  | 'attrition-no-sustain'
  | 'movement-trap'
  | 'input-readability'
  | 'unknown';

export type Stage1EnemyConfig = MonsterCombatDefinition;

export const Stage1CombatTuning = {
  defaultHeroId: 1,
  role1Level1MaxHp: 80,
  role1Level1PhysicalDefense: 2,
  playerProtectionMs: 3_000,
  heroAttackRange: 170,
  enemyHurtMs: 180,
  damageLogLimit: 10,
} as const;

export type Stage1CombatPlayer = {
  slot: PlayerSlot;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  previousInput?: PlayerInputState;
  damageLog: DamageEvent[];
  deathReason?: Stage1DeathReason;
  mp: number;
  maxMp: number;
  soul: number;
  warriorEnergy: number;
  progression: HeroProgressionModel;
  equipmentLoadout: EquipmentLoadout;
  effectiveStats: HeroEffectiveStats;
  skill: HeroSkillModel;
};

export type Stage1CombatEnemy = {
  id: string;
  enemyType: Stage1EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  phase: Stage1EnemyAttackPhase;
  phaseRemainingMs: number;
  facingX: -1 | 1;
  attackSerial: number;
  activeAttack?: Readonly<{
    attackId: string;
    actionName: string;
    attackKind: AttackKind;
    damage: number;
    attackRange: number;
  }>;
  lastHitBy?: PlayerSlot;
  petHorseIceRemainingMs?: number;
};

export type Stage1CombatAudit = {
  damageEvents: DamageEvent[];
  maxSourcesInSameFrame: number;
};

export type Stage1CombatRuntime = {
  hitRegistry: HitRegistry;
  audit: Stage1CombatAudit;
};

export function getStage1EnemyConfig(enemyType: Stage1EnemyType): Stage1EnemyConfig {
  return getMonsterDefinition(enemyType);
}

export function calculateStage1IncomingDamage(
  attackKind: AttackKind,
  baseDamage: number,
  physicalDefense: number,
): number {
  return attackKind === 'physics'
    ? Math.max(1, Math.floor(baseDamage - Math.max(0, physicalDefense)))
    : Math.max(0, Math.floor(baseDamage));
}

export function calculateStage1HeroDamage(
  enemyType: Stage1EnemyType,
  attackKind: AttackKind,
  baseDamage: number,
): number {
  const config = getStage1EnemyConfig(enemyType);
  return attackKind === 'physics'
    ? Math.max(1, Math.floor(baseDamage - config.physicalDefense))
    : Math.max(0, Math.floor(baseDamage));
}

export function createStage1CombatRuntime(): Stage1CombatRuntime {
  return {
    hitRegistry: createHitRegistry(),
    audit: { damageEvents: [], maxSourcesInSameFrame: 0 },
  };
}

export function createStage1CombatPlayer(
  slot: PlayerSlot,
  heroId: HeroId = Stage1CombatTuning.defaultHeroId,
  initial: Readonly<{
    progression?: HeroProgressionModel;
    equipmentLoadout?: EquipmentLoadout;
  }> = {},
): Stage1CombatPlayer {
  const combat = createHeroCombat(slot);
  const progression = initial.progression?.heroId === heroId
    ? createHeroProgression(heroId, initial.progression.level, initial.progression.currentExp)
    : createHeroProgression(heroId);
  const equipmentLoadout = initial.equipmentLoadout ?? createEmptyEquipmentLoadout();
  const effectiveStats = calculateEffectiveStats(
    getHeroBaseStats(heroId, progression.level),
    equipmentLoadout,
  );
  combat.maxHp = effectiveStats.maxHp;
  combat.hp = combat.maxHp;
  combat.damageProtectionMs = Stage1CombatTuning.playerProtectionMs;
  return {
    slot,
    combat,
    normalAttack: createHeroNormalAttack(heroId),
    damageLog: [],
    mp: effectiveStats.maxMp,
    maxMp: effectiveStats.maxMp,
    soul: 0,
    warriorEnergy: 0,
    progression,
    equipmentLoadout,
    effectiveStats,
    skill: createHeroSkillModel({ slots: [null, null, null, null, null] }, effectiveStats.maxMp),
  };
}

export function awardStage1CombatPlayerExperience(
  player: Stage1CombatPlayer,
  amount: number,
): HeroProgressionResult {
  const result = addHeroExperience(player.progression, amount);
  if (result.levelsGained <= 0) return result;
  player.effectiveStats = calculateEffectiveStats(
    result.baseStatsAfter,
    player.equipmentLoadout,
  );
  player.combat.maxHp = player.effectiveStats.maxHp;
  player.combat.hp = player.combat.maxHp;
  player.maxMp = player.effectiveStats.maxMp;
  player.mp = player.maxMp;
  player.skill.maxMp = player.maxMp;
  player.skill.mp = player.maxMp;
  return result;
}

export function createStage1CombatEnemy(params: {
  id: string;
  enemyType: Stage1EnemyType;
  x: number;
  y: number;
}): Stage1CombatEnemy {
  const config = getStage1EnemyConfig(params.enemyType);
  return {
    ...params,
    hp: config.maxHp,
    maxHp: config.maxHp,
    phase: 'approach',
    phaseRemainingMs: 0,
    facingX: -1,
    attackSerial: 0,
  };
}

export function updateStage1CombatPlayer(params: {
  player: Stage1CombatPlayer;
  input: PlayerInputState;
  movement: HeroMovementModel;
  bounds: HeroMovementBounds;
  timeMs: number;
  deltaMs: number;
}): HeroNormalAttackEvent | undefined {
  updateHeroCombat(params.player.combat, params.movement, params.bounds, params.timeMs, params.deltaMs);
  const event = updateHeroNormalAttack(
    params.player.normalAttack,
    params.input,
    params.player.previousInput,
    params.movement,
    params.timeMs,
  );
  params.player.previousInput = { ...params.input, skillSlots: [...params.input.skillSlots] };
  return event;
}

export function updateStage1Enemy(params: {
  enemy: Stage1CombatEnemy;
  targets: readonly { slot: PlayerSlot; x: number; alive: boolean }[];
  deltaMs: number;
}): void {
  const { enemy: model, targets } = params;
  if (model.phase === 'dead') return;

  if (model.phase !== 'approach') {
    model.phaseRemainingMs = Math.max(0, model.phaseRemainingMs - Math.max(0, params.deltaMs));
    if (model.phaseRemainingMs > 0) return;
    if (model.phase === 'windup') {
      model.phase = 'active';
      model.phaseRemainingMs = getStage1EnemyConfig(model.enemyType).activeMs;
      return;
    }
    if (model.phase === 'active') {
      model.phase = 'recovery';
      model.phaseRemainingMs = getStage1EnemyConfig(model.enemyType).recoveryMs;
      model.activeAttack = undefined;
      return;
    }
    model.phase = 'approach';
  }

  const target = nearestLivingTarget(model.x, targets);
  if (!target) return;
  const config = getStage1EnemyConfig(model.enemyType);
  const distance = target.x - model.x;
  model.facingX = distance < 0 ? -1 : 1;
  if (Math.abs(distance) > config.attackRange) {
    const travel = config.moveSpeed * Math.max(0, params.deltaMs) / 1_000;
    model.x += Math.sign(distance) * Math.min(Math.abs(distance), travel);
    return;
  }

  const serial = model.attackSerial + 1;
  const attack = getStage1EnemyAttack(model.enemyType, serial);
  model.attackSerial = serial;
  model.phase = 'windup';
  model.phaseRemainingMs = config.windupMs;
  model.activeAttack = {
    attackId: `${model.id}-${attack.actionName}-${serial}`,
    ...attack,
  };
}

export function resolveStage1EnemyAttack(params: {
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  players: readonly { player: Stage1CombatPlayer; x: number }[];
  timeMs: number;
}): readonly DamageEvent[] {
  const { enemy } = params;
  const config = getStage1EnemyConfig(enemy.enemyType);
  if (enemy.phase !== 'active' || !enemy.activeAttack) return [];
  const resolved: DamageEvent[] = [];
  for (const target of params.players) {
    if (target.player.combat.state === 'dead') continue;
    if (Math.abs(target.x - enemy.x) > enemy.activeAttack.attackRange) continue;
    if (!resolveHitOnce(params.runtime.hitRegistry, enemy.activeAttack.attackId, target.player.slot)) continue;
    const amount = calculateStage1IncomingDamage(
      enemy.activeAttack.attackKind,
      enemy.activeAttack.damage,
      Stage1CombatTuning.role1Level1PhysicalDefense,
    );
    const event = createDamageEvent({
      sourceId: enemy.id,
      targetId: target.player.slot,
      attackId: enemy.activeAttack.attackId,
      actionName: enemy.activeAttack.actionName,
      amount,
      attackKind: enemy.activeAttack.attackKind,
      knockbackX: enemy.facingX * 5,
      knockbackY: -3,
      occurredAtMs: params.timeMs,
    });
    if (!applyHeroDamage(target.player.combat, event, params.timeMs)) continue;
    recordDamage(params.runtime, target.player, event, config.isBoss);
    resolved.push(event);
  }
  return resolved;
}

export function resolveStage1EnemyPetAttack(params: Readonly<{
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  target: Readonly<{
    runtimeKey: string;
    x: number;
    defense: number;
    hp: number;
  }>;
}>): PetCombatDamageEvent | undefined {
  const { enemy, target } = params;
  if (enemy.phase !== 'active' || !enemy.activeAttack || target.hp <= 0) return undefined;
  if (Math.abs(target.x - enemy.x) > enemy.activeAttack.attackRange) return undefined;
  if (!resolveHitOnce(params.runtime.hitRegistry, enemy.activeAttack.attackId, target.runtimeKey)) {
    return undefined;
  }
  return {
    runtimeKey: target.runtimeKey,
    amount: calculateStage1IncomingDamage(
      enemy.activeAttack.attackKind,
      enemy.activeAttack.damage,
      target.defense,
    ),
    sourceId: enemy.id,
  };
}

export function resolveStage1HeroAttack(params: {
  runtime: Stage1CombatRuntime;
  player: Stage1CombatPlayer;
  movement: HeroMovementModel;
  enemies: readonly Stage1CombatEnemy[];
  timeMs: number;
}): readonly DamageEvent[] {
  const attack = params.player.normalAttack.activeAttack;
  const hitbox = getActiveHeroHitbox(params.player.normalAttack, params.movement, params.timeMs);
  if (!attack || !hitbox) return [];
  const usesWorldEffect = Boolean(getWorldNormalAttackGeometry(attack.effectKey));
  const resolved: DamageEvent[] = [];
  for (const enemyModel of params.enemies) {
    if (enemyModel.phase === 'dead') continue;
    if (usesWorldEffect) {
      if (enemyModel.x < hitbox.x || enemyModel.x > hitbox.x + hitbox.width) continue;
    } else if (Math.abs(enemyModel.x - params.movement.x) > Stage1CombatTuning.heroAttackRange) {
      continue;
    }
    const event = resolveStage1HeroHit({
      runtime: params.runtime,
      enemy: enemyModel,
      sourceId: params.player.slot,
      attackId: `${params.player.slot}-normal-${attack.id}`,
      actionName: attack.actionName,
      attackKind: attack.attackKind,
      damage: attack.damage,
      knockbackX: attack.facingX * 4,
      knockbackY: -2,
      timeMs: params.timeMs,
    });
    if (event) resolved.push(event);
  }
  return resolved;
}

export function resolveStage1HeroHit(params: Readonly<{
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  sourceId: PlayerSlot;
  attackId: string;
  actionName: string;
  attackKind: AttackKind;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  timeMs: number;
}>): DamageEvent | undefined {
  if (params.enemy.phase === 'dead') return undefined;
  if (!resolveHitOnce(params.runtime.hitRegistry, params.attackId, params.enemy.id)) return undefined;
  const amount = Math.min(params.enemy.hp, calculateStage1HeroDamage(
    params.enemy.enemyType,
    params.attackKind,
    params.damage,
  ));
  const event = createDamageEvent({
    sourceId: params.sourceId,
    targetId: params.enemy.id,
    attackId: params.attackId,
    actionName: params.actionName,
    amount,
    attackKind: params.attackKind,
    knockbackX: params.knockbackX,
    knockbackY: params.knockbackY,
    occurredAtMs: params.timeMs,
  });
  params.enemy.hp = Math.max(0, params.enemy.hp - event.amount);
  params.enemy.lastHitBy = params.sourceId;
  params.enemy.activeAttack = undefined;
  params.enemy.phase = params.enemy.hp === 0 ? 'dead' : 'hurt';
  params.enemy.phaseRemainingMs = params.enemy.hp === 0 ? 0 : Stage1CombatTuning.enemyHurtMs;
  params.runtime.audit.damageEvents.push(event);
  return event;
}

export function resolveStage1PetHit(params: Readonly<{
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  ownerSlot: PlayerSlot;
  petId: string;
  attackId: string;
  actionName: string;
  attackKind: AttackKind;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  timeMs: number;
}>): DamageEvent | undefined {
  if (params.enemy.phase === 'dead') return undefined;
  if (!resolveHitOnce(params.runtime.hitRegistry, params.attackId, params.enemy.id)) return undefined;
  const amount = Math.min(params.enemy.hp, calculateStage1HeroDamage(
    params.enemy.enemyType,
    params.attackKind,
    params.damage,
  ));
  const event = createDamageEvent({
    sourceId: params.petId,
    targetId: params.enemy.id,
    attackId: params.attackId,
    actionName: params.actionName,
    amount,
    attackKind: params.attackKind,
    knockbackX: params.knockbackX,
    knockbackY: params.knockbackY,
    occurredAtMs: params.timeMs,
  });
  params.enemy.hp = Math.max(0, params.enemy.hp - amount);
  params.enemy.lastHitBy = params.ownerSlot;
  params.enemy.activeAttack = undefined;
  params.enemy.phase = params.enemy.hp === 0 ? 'dead' : 'hurt';
  params.enemy.phaseRemainingMs = params.enemy.hp === 0 ? 0 : Stage1CombatTuning.enemyHurtMs;
  params.runtime.audit.damageEvents.push(event);
  return event;
}

function recordDamage(
  runtime: Stage1CombatRuntime,
  player: Stage1CombatPlayer,
  event: DamageEvent,
  sourceIsBoss: boolean,
): void {
  runtime.audit.damageEvents.push(event);
  const sameFrameSources = new Set(runtime.audit.damageEvents
    .filter((candidate) => candidate.targetId === event.targetId && candidate.occurredAtMs === event.occurredAtMs)
    .map((candidate) => candidate.sourceId));
  runtime.audit.maxSourcesInSameFrame = Math.max(runtime.audit.maxSourcesInSameFrame, sameFrameSources.size);
  player.damageLog.push(event);
  if (player.damageLog.length > Stage1CombatTuning.damageLogLimit) player.damageLog.shift();
  if (player.combat.state !== 'dead') return;
  player.deathReason = sameFrameSources.size > 1
    ? 'burst-same-frame'
    : sourceIsBoss
      ? event.attackKind === 'physics' ? 'boss-physical' : 'boss-magic'
      : 'attrition-no-sustain';
}

function nearestLivingTarget(
  x: number,
  targets: readonly { slot: PlayerSlot; x: number; alive: boolean }[],
): { slot: PlayerSlot; x: number; alive: boolean } | undefined {
  return targets
    .filter((target) => target.alive)
    .sort((left, right) => Math.abs(left.x - x) - Math.abs(right.x - x))[0];
}

function getStage1EnemyAttack(
  enemyType: Stage1EnemyType,
  attackSerial: number,
): Readonly<{
  actionName: string;
  attackKind: AttackKind;
  damage: number;
  attackRange: number;
}> {
  const config = getStage1EnemyConfig(enemyType);
  if (enemyType !== 16) {
    return {
      actionName: config.actionName,
      attackKind: config.attackKind,
      damage: config.attackDamage,
      attackRange: config.attackRange,
    };
  }
  const action = ((attackSerial - 1) % 4 + 4) % 4;
  if (action === 1) return { actionName: 'hit2', attackKind: 'magic', damage: 68, attackRange: 200 };
  if (action === 2) return { actionName: 'hit3', attackKind: 'magic', damage: 47.6, attackRange: 800 };
  if (action === 3) return { actionName: 'hit4', attackKind: 'magic', damage: 57.6, attackRange: 800 };
  return { actionName: 'hit1', attackKind: 'physics', damage: 185, attackRange: 150 };
}
