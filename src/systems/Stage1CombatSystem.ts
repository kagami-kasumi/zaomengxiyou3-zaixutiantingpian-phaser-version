import { monster30AttackHits, syncMonster30BodyState, type Monster30Attack } from './Monster30AttackRuntime';
import type { PetPassiveVisualPort } from './PetPassiveSession';
import { addHeroPetBuff, type HeroPetBuffName, clearHeroPetBuffs, createHeroPetBuffState, stepHeroPetBuffs, type HeroPetBuffState } from './HeroPetBuffSystem';
import { acceptMonsterAttackTarget, settleMonsterExperience, selectMonsterAttackTarget, clearUnavailableMonsterAttackTarget, type MonsterAttackTarget, type MonsterExperienceBinding } from './MonsterExperienceSystem';
import { initializeMonsterPetTargetEffects, isMonsterPetIceActive } from './MonsterPetTargetEffectSystem';
import { acceptMonsterKnockback, type MonsterKnockbackBinding } from './MonsterKnockbackBinding';
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
import { calculateDragonPhysicalDamage, calculateDragonMagicDamage, type DragonDamageCache } from './PetDragonDamageSystem';
import {
  createCombatFeedbackModel,
  recordCombatFeedback,
  type CombatFeedbackModel,
  type CombatFeedbackSource,
} from './CombatFeedbackSystem';
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
  petBuffs: HeroPetBuffState;
  stepPetBuffs: (visual?: PetPassiveVisualPort) => void;
  addPetBuff: (name: HeroPetBuffName, value: number, ticks: number) => void;
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
  monster2WorldState?: import('./Monster2CombatWorld').Monster2CombatWorldState;
  monster2AttackRuntime?: import('./Monster2AttackRuntime').Monster2AttackRuntime;
  monster3WorldState?: import('./Monster3CombatWorld').Monster3CombatWorldState;
  monster3AttackRuntime?: import('./Monster3AttackRuntime').Monster3AttackRuntime;
  attackRuntime?: import('./Monster30AttackRuntime').Monster30AttackRuntime;
  experienceBinding?: MonsterExperienceBinding;
  petKnockback?: MonsterKnockbackBinding;
  petTargetEffectState?: import('./MonsterPetTargetEffectSystem').MonsterPetTargetEffectState;
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
    knockback?: Readonly<{ x: number; y: number }>;
  }>;
  lastHitBy?: PlayerSlot;
  petHorseIceRemainingMs?: number;
  /** Supplied by the monster's current source-state adapter; defaults describe spawn state only. */
  sourceHitProtection?: Readonly<{ protected: boolean; dodgeProbability: number }>;
};

export type Stage1CombatAudit = {
  damageEvents: DamageEvent[];
  maxSourcesInSameFrame: number;
};

export type Stage1CombatRuntime = {
  experienceHeroes?: readonly MonsterAttackTarget[];
  hitRegistry: HitRegistry;
  audit: Stage1CombatAudit;
  feedback: CombatFeedbackModel;
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
    feedback: createCombatFeedbackModel(),
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
  const player: Stage1CombatPlayer = {
    slot,
    petBuffs: createHeroPetBuffState(),
    stepPetBuffs: (visual) => stepHeroPetBuffs(player, visual),
    addPetBuff: (name, value, ticks) => addHeroPetBuff(player, name, value, ticks),
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
  combat.clearPetBuffs = () => clearHeroPetBuffs(player);
  return player;
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
  const enemy: Stage1CombatEnemy = {
    ...params,
    hp: config.maxHp,
    maxHp: config.maxHp,
    phase: 'approach',
    phaseRemainingMs: 0,
    facingX: -1,
    attackSerial: 0,
  };
  initializeMonsterPetTargetEffects(enemy);
  return enemy;
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

/** A display hold must not suspend the source target lifecycle. */
export function maintainStage1EnemyTarget(enemy: Stage1CombatEnemy): void {
  if (enemy.phase !== 'dead' && enemy.phase !== 'hurt' && !isMonsterPetIceActive(enemy)) {
    selectMonsterAttackTarget(enemy, enemy.x, enemy.y, enemy.enemyType === 19 ? 600 : 1000);
  }
  clearUnavailableMonsterAttackTarget(enemy);
}

export function updateStage1Enemy(params: Parameters<typeof advanceStage1Enemy>[0]): void {
  try { advanceStage1Enemy(params); } finally { if (params.enemy.enemyType === 30) syncMonster30BodyState(params.enemy); clearUnavailableMonsterAttackTarget(params.enemy); }
}

function advanceStage1Enemy(params: {
  enemy: Stage1CombatEnemy;
  targets: readonly { slot: PlayerSlot; x: number; alive: boolean }[];
  deltaMs: number;
}): void {
  const { enemy: model, targets } = params;
  if (model.enemyType === 2) return;
  if (model.phase === 'dead') return;
  if (isMonsterPetIceActive(model)) return;
  const retained = model.phase === 'hurt' && model.phaseRemainingMs > Math.max(0, params.deltaMs)
    ? undefined : selectMonsterAttackTarget(model, model.x, model.y, model.enemyType === 19 ? 600 : 1000);

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


  const target = model.experienceBinding ? retained?.position() : nearestLivingTarget(model.x, targets);
  if (!target) {
    stopMonsterApproach(model);
    return;
  }
  const config = getStage1EnemyConfig(model.enemyType);
  const distance = target.x - model.x;
  model.facingX = distance < 0 ? -1 : 1;
  if (Math.abs(distance) > config.attackRange) {
    if (model.petKnockback?.active) {
      model.petKnockback.motion.direction = model.facingX;
      model.petKnockback.motion.action = 'walk';
      return;
    }
    const travel = config.moveSpeed * Math.max(0, params.deltaMs) / 1_000;
    model.x += Math.sign(distance) * Math.min(Math.abs(distance), travel);
    return;
  }

  stopMonsterApproach(model);
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

type IncomingMonsterAttack = Readonly<{
  attackId: string; actionName: string; attackKind: AttackKind; damage: number;
  attackRange: number; facingX: -1 | 1; knockback?: Readonly<{ x: number; y: number }>;
  collisionAttack?: Monster30Attack;
}>;

function incomingMonsterAttacks(enemy: Stage1CombatEnemy): readonly IncomingMonsterAttack[] {
  if (enemy.enemyType === 2) return [];
  if (enemy.enemyType === 30) return (enemy.attackRuntime?.detections ?? []).map(attack => ({
    ...attack, collisionAttack: attack, attackRange: 0,
    knockback: { x: attack.facingX * attack.knockbackX, y: attack.knockbackY },
  }));
  return enemy.phase === 'active' && enemy.activeAttack ? [{ ...enemy.activeAttack, facingX: enemy.facingX }] : [];
}

export function resolveStage1EnemyAttack(params: {
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  players: readonly { player: Stage1CombatPlayer; x: number; y?: number }[];
  timeMs: number;
}): readonly DamageEvent[] {
  const { enemy } = params;
  const config = getStage1EnemyConfig(enemy.enemyType);
  const resolved: DamageEvent[] = [];
  for (const attack of incomingMonsterAttacks(enemy)) for (const target of params.players) {
    const hero = target.player.combat;
    if (hero.state === 'dead') continue;
    if (attack.collisionAttack) {
      if (target.y === undefined) throw new Error('Monster30 requires hero source-root y');
      if (!monster30AttackHits(attack.collisionAttack, 'hero-ObjectBaseSprite', target.x, target.y)) continue;
      if (params.timeMs < hero.invulnerableUntilMs || hero.magicInvulnerability) continue;
    } else if (Math.abs(target.x - enemy.x) > attack.attackRange) continue;
    if (!resolveHitOnce(params.runtime.hitRegistry, attack.attackId, target.player.slot)) continue;
    const amount = calculateStage1IncomingDamage(attack.attackKind, attack.damage,
      attack.collisionAttack ? target.player.effectiveStats.defense : Stage1CombatTuning.role1Level1PhysicalDefense);
    const event = createDamageEvent({ sourceId: enemy.id, targetId: target.player.slot,
      attackId: attack.attackId, actionName: attack.actionName, amount, attackKind: attack.attackKind,
      knockbackX: attack.knockback?.x ?? attack.facingX * 5,
      knockbackY: attack.knockback?.y ?? -3, occurredAtMs: params.timeMs });
    if (!applyHeroDamage(hero, event, params.timeMs)) continue;
    recordDamage(params.runtime, target.player, event, config.isBoss);
    resolved.push(event);
  }
  return resolved;
}

export function resolveStage1EnemyPetAttack(params: Readonly<{
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  timeMs?: number;
  target: Readonly<{
    runtimeKey: string; x: number; y?: number; collisionProfile?: string;
    defense: number; hp: number; protectedFromHits?: boolean;
  }>;
}>): PetCombatDamageEvent | undefined {
  const { enemy, target } = params;
  if (target.protectedFromHits || target.hp <= 0) return undefined;
  for (const attack of incomingMonsterAttacks(enemy)) {
    if (attack.collisionAttack) {
      if (target.y === undefined || !target.collisionProfile) throw new Error('Monster30 requires actual pet colipse profile/root');
      if (!monster30AttackHits(attack.collisionAttack, target.collisionProfile, target.x, target.y)) continue;
    } else if (Math.abs(target.x - enemy.x) > attack.attackRange) continue;
    if (!resolveHitOnce(params.runtime.hitRegistry, attack.attackId, target.runtimeKey)) continue;
    return { runtimeKey: target.runtimeKey, reactsToHit: true, knockback: attack.knockback,
      amount: calculateStage1IncomingDamage(attack.attackKind, attack.damage, target.defense),
      sourceId: enemy.id, attackId: attack.attackId, occurredAtMs: params.timeMs ?? 0 };
  }
  return undefined;
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
  sourceId: string;
  experienceSource?: MonsterAttackTarget;
  ownerSlot?: PlayerSlot;
  source?: CombatFeedbackSource;
  attackId: string;
  actionName: string;
  attackKind: AttackKind;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  timeMs: number;
  critical?: boolean;
  incrementsCombo?: boolean;
  random?: () => number;
}>): DamageEvent | undefined {
  if (params.enemy.phase === 'dead' || params.enemy.sourceHitProtection?.protected) return undefined;
  if (!resolveHitOnce(params.runtime.hitRegistry, params.attackId, params.enemy.id)) return undefined;
  if (params.enemy.sourceHitProtection && (params.random ?? Math.random)() <= params.enemy.sourceHitProtection.dodgeProbability) return undefined;
  acceptMonsterAttackTarget(params.enemy, params.experienceSource ?? params.runtime.experienceHeroes?.find(hero => hero.ownerSlot === (params.ownerSlot ?? params.sourceId)));
  const hpBefore = params.enemy.hp;
  const amount = Math.min(hpBefore, calculateStage1HeroDamage(
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
    critical: params.critical,
  });
  params.enemy.hp = Math.max(0, params.enemy.hp - event.amount);
  const ownerSlot = params.ownerSlot ?? (params.sourceId === 'p2' ? 'p2' : 'p1');
  params.enemy.lastHitBy = ownerSlot;
  params.enemy.activeAttack = undefined;
  params.enemy.phase = params.enemy.hp === 0 ? 'dead' : 'hurt';
  params.enemy.phaseRemainingMs = params.enemy.hp === 0 ? 0 : Stage1CombatTuning.enemyHurtMs;
  if (params.enemy.hp === 0) settleMonsterExperience(params.enemy);
  params.runtime.audit.damageEvents.push(event);
  recordCombatFeedback(params.runtime.feedback, {
    damageEvent: event,
    hpBefore,
    hpAfter: params.enemy.hp,
    source: params.source ?? 'hero',
    ownerSlot,
    target: {
      id: params.enemy.id,
      x: params.enemy.x,
      y: params.enemy.y,
      height: getStage1EnemyConfig(params.enemy.enemyType).feedbackHeight,
    },
    critical: event.critical,
    incrementsCombo: params.incrementsCombo ?? true,
  });
  return event;
}

export function resolveStage1PetHit(params: Readonly<{
  runtime: Stage1CombatRuntime;
  enemy: Stage1CombatEnemy;
  ownerSlot: PlayerSlot;
  petId: string;
  experienceSource?: MonsterAttackTarget;
  attackId: string;
  actionName: string;
  attackKind: AttackKind;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  timeMs: number;
  critical?: boolean;
  /** Native pet host runs before monster physics; legacy projectile resolution runs after it. */
  knockbackPhase?: 'early' | 'late';
  hasKnockback?: boolean;
  /** Opt-in source bullet semantics; existing monkey/horse callers retain their damage path. */
  sourceBullet?: Readonly<{
    cache: DragonDamageCache;
    protected: boolean;
    dodgeProbability: number;
    random: () => number;
    applyEffects?: () => void;
  }>;
}>): DamageEvent | undefined {
  if (params.enemy.phase === 'dead') return undefined;
  if (params.sourceBullet?.protected) return undefined;
  if (!resolveHitOnce(params.runtime.hitRegistry, params.attackId, params.enemy.id)) return undefined;
  if (params.sourceBullet && params.sourceBullet.random() <= params.sourceBullet.dodgeProbability) return undefined;
  if (params.hasKnockback !== false) acceptMonsterKnockback(params.enemy.petKnockback,
    { x: params.knockbackX, y: params.knockbackY, timeMs: params.timeMs },
    { x: params.enemy.x, y: params.enemy.y, action: getStage1MonsterMotionAction(params.enemy),
      frozen: isMonsterPetIceActive(params.enemy) }, params.knockbackPhase ?? 'late');
  acceptMonsterAttackTarget(params.enemy, params.experienceSource);
  params.enemy.lastHitBy = params.ownerSlot;
  params.sourceBullet?.applyEffects?.();
  const hpBefore = params.enemy.hp;
  const amount = Math.min(hpBefore, params.sourceBullet
    ? params.attackKind === 'magic'
      ? calculateDragonMagicDamage(params.sourceBullet.cache, getStage1EnemyConfig(params.enemy.enemyType).magicDefense)
      : calculateDragonPhysicalDamage(params.sourceBullet.cache, getStage1EnemyConfig(params.enemy.enemyType).physicalDefense)
    : calculateStage1HeroDamage(
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
    critical: params.critical,
  });
  params.enemy.hp = Math.max(0, params.enemy.hp - amount);
  params.enemy.lastHitBy = params.ownerSlot;
  params.enemy.activeAttack = undefined;
  params.enemy.phase = params.enemy.hp === 0 ? 'dead' : 'hurt';
  params.enemy.phaseRemainingMs = params.enemy.hp === 0 ? 0 : Stage1CombatTuning.enemyHurtMs;
  if (params.enemy.hp === 0) settleMonsterExperience(params.enemy);
  params.runtime.audit.damageEvents.push(event);
  recordCombatFeedback(params.runtime.feedback, {
    damageEvent: event,
    hpBefore,
    hpAfter: params.enemy.hp,
    source: 'pet',
    ownerSlot: params.ownerSlot,
    target: {
      id: params.enemy.id,
      x: params.enemy.x,
      y: params.enemy.y,
      height: getStage1EnemyConfig(params.enemy.enemyType).feedbackHeight,
    },
    critical: event.critical,
    incrementsCombo: true,
  });
  return event;
}

export function getStage1MonsterMotionAction(enemy: Stage1CombatEnemy): string {
  if (enemy.phase === 'hurt' || enemy.phase === 'dead') return enemy.phase;
  if (enemy.enemyType === 2 && enemy.monster2WorldState) return enemy.monster2WorldState.action;
  if (enemy.enemyType === 3 && enemy.monster3WorldState) return enemy.monster3WorldState.action;
  if (enemy.activeAttack) return enemy.activeAttack.actionName;
  return enemy.petKnockback?.motion.action === 'walk' ? 'walk' : 'wait';
}

/** Translate the existing AI's stop intent; this is not a hurt/tween completion rule. */
function stopMonsterApproach(enemy: Stage1CombatEnemy): void {
  if (!enemy.petKnockback?.active) return;
  enemy.petKnockback.motion.direction = 0;
  enemy.petKnockback.motion.velocityX = 0;
  enemy.petKnockback.motion.action = 'wait';
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
