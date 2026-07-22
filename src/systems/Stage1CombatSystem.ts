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
  type HeroNormalAttackModel,
} from './HeroNormalAttackSystem';
import type { HeroMovementBounds, HeroMovementModel } from './HeroMovementSystem';
import type { PlayerInputState, PlayerSlot } from './InputSystem';

export type Stage1EnemyType = 2 | 3 | 4 | 5 | 7 | 8 | 30;
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

export type Stage1EnemyConfig = Readonly<{
  enemyType: Stage1EnemyType;
  maxHp: number;
  physicalDefense: number;
  moveSpeed: number;
  attackRange: number;
  attackKind: AttackKind;
  attackDamage: number;
  actionName: string;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  isBoss: boolean;
}>;

export const Stage1CombatTuning = {
  defaultHeroId: 1,
  role1Level1MaxHp: 80,
  role1Level1PhysicalDefense: 2,
  playerProtectionMs: 3_000,
  heroAttackRange: 170,
  enemyHurtMs: 180,
  damageLogLimit: 10,
} as const;

const enemyConfigs: Record<Stage1EnemyType, Stage1EnemyConfig> = {
  2: enemy(2, 1_500, 8, 28, 96, 'physics', 29, 'hit1', 360, 180, 620, true),
  3: enemy(3, 926, 5, 240, 150, 'physics', 40, 'hit1', 300, 220, 600, true),
  4: enemy(4, 1_481, 8, 27, 112, 'physics', 49, 'hit1', 420, 200, 680, true),
  5: enemy(5, 2_788, 14, 26, 125, 'physics', 147, 'hit1', 520, 220, 760, true),
  7: enemy(7, 200, 3, 35, 78, 'physics', 18, 'hit1', 300, 150, 520, false),
  8: enemy(8, 300, 4, 33, 82, 'physics', 18, 'hit1', 320, 160, 540, false),
  30: enemy(30, 150, 3, 420, 250, 'physics', 15, 'hit1', 420, 145, 480, false),
};

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
  experience: number;
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
  }>;
  lastHitBy?: PlayerSlot;
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
  return enemyConfigs[enemyType];
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

export function createStage1CombatPlayer(slot: PlayerSlot): Stage1CombatPlayer {
  const combat = createHeroCombat(slot);
  combat.maxHp = Stage1CombatTuning.role1Level1MaxHp;
  combat.hp = combat.maxHp;
  combat.damageProtectionMs = Stage1CombatTuning.playerProtectionMs;
  return {
    slot,
    combat,
    normalAttack: createHeroNormalAttack(Stage1CombatTuning.defaultHeroId),
    damageLog: [],
    mp: 50,
    maxMp: 50,
    soul: 0,
    warriorEnergy: 0,
    experience: 0,
  };
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
}): void {
  updateHeroCombat(params.player.combat, params.movement, params.bounds, params.timeMs, params.deltaMs);
  updateHeroNormalAttack(
    params.player.normalAttack,
    params.input,
    params.player.previousInput,
    params.movement,
    params.timeMs,
  );
  params.player.previousInput = { ...params.input, skillSlots: [...params.input.skillSlots] };
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
  model.attackSerial = serial;
  model.phase = 'windup';
  model.phaseRemainingMs = config.windupMs;
  model.activeAttack = {
    attackId: `${model.id}-${config.actionName}-${serial}`,
    actionName: config.actionName,
    attackKind: config.attackKind,
    damage: config.attackDamage,
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
    if (Math.abs(target.x - enemy.x) > config.attackRange) continue;
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

export function resolveStage1HeroAttack(params: {
  runtime: Stage1CombatRuntime;
  player: Stage1CombatPlayer;
  movement: HeroMovementModel;
  enemies: readonly Stage1CombatEnemy[];
  timeMs: number;
}): readonly DamageEvent[] {
  const attack = params.player.normalAttack.activeAttack;
  if (!attack || !getActiveHeroHitbox(params.player.normalAttack, params.movement, params.timeMs)) return [];
  const resolved: DamageEvent[] = [];
  for (const enemyModel of params.enemies) {
    if (enemyModel.phase === 'dead') continue;
    if (Math.abs(enemyModel.x - params.movement.x) > Stage1CombatTuning.heroAttackRange) continue;
    const attackId = `${params.player.slot}-normal-${attack.id}`;
    if (!resolveHitOnce(params.runtime.hitRegistry, attackId, enemyModel.id)) continue;
    const amount = calculateStage1HeroDamage(
      enemyModel.enemyType,
      attack.attackKind,
      attack.damage,
    );
    const event = createDamageEvent({
      sourceId: params.player.slot,
      targetId: enemyModel.id,
      attackId,
      actionName: attack.actionName,
      amount: Math.min(enemyModel.hp, amount),
      attackKind: attack.attackKind,
      knockbackX: attack.facingX * 4,
      knockbackY: -2,
      occurredAtMs: params.timeMs,
    });
    enemyModel.hp = Math.max(0, enemyModel.hp - event.amount);
    enemyModel.lastHitBy = params.player.slot;
    enemyModel.activeAttack = undefined;
    if (enemyModel.hp === 0) {
      enemyModel.phase = 'dead';
      enemyModel.phaseRemainingMs = 0;
    } else {
      enemyModel.phase = 'hurt';
      enemyModel.phaseRemainingMs = Stage1CombatTuning.enemyHurtMs;
    }
    params.runtime.audit.damageEvents.push(event);
    resolved.push(event);
  }
  return resolved;
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

function enemy(
  enemyType: Stage1EnemyType,
  maxHp: number,
  physicalDefense: number,
  moveSpeed: number,
  attackRange: number,
  attackKind: AttackKind,
  attackDamage: number,
  actionName: string,
  windupMs: number,
  activeMs: number,
  recoveryMs: number,
  isBoss: boolean,
): Stage1EnemyConfig {
  return {
    enemyType, maxHp, physicalDefense, moveSpeed, attackRange, attackKind,
    attackDamage, actionName, windupMs, activeMs, recoveryMs, isBoss,
  };
}
