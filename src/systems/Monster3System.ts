import type { AttackKind } from './CombatSystem';
import type { Hitbox } from './HeroNormalAttackSystem';
import type { PlayerSlot } from './InputSystem';

export type Monster3State = 'wait' | 'walk' | 'hurt' | 'hit1' | 'hit2' | 'dead' | 'removed';

export type Monster3Target = {
  slot: PlayerSlot;
  x: number;
  y: number;
};

export type Monster3Model = {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  state: Monster3State;
  facingX: -1 | 1;
  targetSlot?: PlayerSlot;
  stateTimerMs: number;
  attackDecisionTimerMs: number;
  attackSerial: number;
  activeAttack?: Monster3ActiveAttack;
  skill1CooldownMs: number;
};

export type Monster3ActiveAttack = {
  id: number;
  attackId: string;
  actionName: 'hit1' | 'hit2';
  elapsedMs: number;
  hitboxActiveFromMs: number;
  hitboxActiveUntilMs: number;
  damage: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  facingX: -1 | 1;
};

export const Monster3Tuning = {
  maxHp: 926,
  horizontalSpeed: 240,
  attackRange: 150,
  alertRange: 1000,
  hurtDurationMs: 250,
  hit1DurationMs: 500,
  hit1HitboxStartMs: 100,
  hit1HitboxEndMs: 380,
  hit1HitboxOffsetX: 105,
  hit1HitboxOffsetY: -60,
  hit1HitboxWidth: 120,
  hit1HitboxHeight: 90,
  hit1Damage: 40,
  hit1KnockbackX: 6,
  hit1KnockbackY: -5,
  hit2DurationMs: 800,
  hit2HitboxStartMs: 200,
  hit2HitboxEndMs: 650,
  hit2HitboxOffsetX: 155,
  hit2HitboxOffsetY: -30,
  hit2HitboxWidth: 140,
  hit2HitboxHeight: 100,
  hit2Damage: 18,
  hit2KnockbackX: -5,
  hit2KnockbackY: 0,
  hit2SkillCD1Ms: 2000,
  hit2SkillIntervalMs: 4000,
  hit2TriggerDistance: 200,
  attackDecisionIntervalMs: 1000,
  normalAttackRate: 0.42,
  deadDurationMs: 1000,
} as const;

export function createMonster3(x: number, y: number): Monster3Model {
  return {
    x,
    y,
    hp: Monster3Tuning.maxHp,
    maxHp: Monster3Tuning.maxHp,
    state: 'wait',
    facingX: -1,
    stateTimerMs: 0,
    attackDecisionTimerMs: 1000,
    attackSerial: 0,
    skill1CooldownMs: Monster3Tuning.hit2SkillCD1Ms,
  };
}

export function updateMonster3(
  monster: Monster3Model,
  targets: readonly Monster3Target[],
  deltaMs: number,
  random: () => number = Math.random,
): void {
  if (monster.state === 'removed') {
    return;
  }

  if (monster.state === 'dead') {
    monster.activeAttack = undefined;
    monster.stateTimerMs -= deltaMs;
    if (monster.stateTimerMs <= 0) {
      monster.state = 'removed';
    }
    return;
  }

  if (monster.state === 'hurt') {
    monster.activeAttack = undefined;
    monster.stateTimerMs -= deltaMs;
    if (monster.stateTimerMs > 0) {
      return;
    }

    monster.state = 'wait';
    monster.stateTimerMs = 0;
  }

  if (monster.state === 'hit1' || monster.state === 'hit2') {
    monster.stateTimerMs -= deltaMs;
    if (monster.activeAttack) {
      monster.activeAttack.elapsedMs += deltaMs;
    }

    if (monster.stateTimerMs > 0) {
      return;
    }

    monster.state = 'wait';
    monster.stateTimerMs = 0;
    monster.activeAttack = undefined;
  }

  const target = selectNearestTarget(monster, targets);
  monster.targetSlot = target?.slot;

  if (!target) {
    monster.state = 'wait';
    return;
  }

  const xDistance = target.x - monster.x;
  const absXDistance = Math.abs(xDistance);
  monster.facingX = xDistance < 0 ? -1 : 1;

  monster.skill1CooldownMs = Math.max(0, monster.skill1CooldownMs - deltaMs);

  if (absXDistance <= Monster3Tuning.hit2TriggerDistance && monster.skill1CooldownMs <= 0) {
    startMonster3Hit2(monster);
    monster.skill1CooldownMs = Monster3Tuning.hit2SkillIntervalMs;
    return;
  }

  monster.attackDecisionTimerMs -= deltaMs;

  if (absXDistance > Monster3Tuning.attackRange) {
    monster.state = 'walk';
    moveTowardTarget(monster, xDistance, deltaMs);
    return;
  }

  monster.state = 'wait';

  if (monster.attackDecisionTimerMs > 0) {
    return;
  }

  monster.attackDecisionTimerMs = Monster3Tuning.attackDecisionIntervalMs;

  if (random() <= Monster3Tuning.normalAttackRate) {
    startMonster3Hit1(monster);
  }
}

export function applyMonster3Hit(monster: Monster3Model, damage: number): boolean {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return false;
  }

  monster.hp = Math.max(0, monster.hp - damage);

  if (monster.hp <= 0) {
    monster.state = 'dead';
    monster.stateTimerMs = Monster3Tuning.deadDurationMs;
    monster.activeAttack = undefined;
    return true;
  }

  monster.state = 'hurt';
  monster.stateTimerMs = Monster3Tuning.hurtDurationMs;
  monster.activeAttack = undefined;
  return true;
}

export function getMonster3AttackHitbox(monster: Monster3Model): Hitbox | undefined {
  const attack = monster.activeAttack;
  if (
    (monster.state !== 'hit1' && monster.state !== 'hit2') ||
    !attack ||
    attack.elapsedMs < attack.hitboxActiveFromMs ||
    attack.elapsedMs > attack.hitboxActiveUntilMs
  ) {
    return undefined;
  }

  const offsetX = attack.actionName === 'hit1'
    ? Monster3Tuning.hit1HitboxOffsetX
    : Monster3Tuning.hit2HitboxOffsetX;
  const offsetY = attack.actionName === 'hit1'
    ? Monster3Tuning.hit1HitboxOffsetY
    : Monster3Tuning.hit2HitboxOffsetY;
  const width = attack.actionName === 'hit1'
    ? Monster3Tuning.hit1HitboxWidth
    : Monster3Tuning.hit2HitboxWidth;
  const height = attack.actionName === 'hit1'
    ? Monster3Tuning.hit1HitboxHeight
    : Monster3Tuning.hit2HitboxHeight;

  const centerX = monster.x + attack.facingX * offsetX + attack.facingX * width / 2;
  const centerY = monster.y + offsetY;

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
}

export function isMonster3Removed(monster: Monster3Model): boolean {
  return monster.state === 'removed';
}

function startMonster3Hit1(monster: Monster3Model): void {
  const id = monster.attackSerial + 1;
  monster.attackSerial = id;
  monster.state = 'hit1';
  monster.stateTimerMs = Monster3Tuning.hit1DurationMs;
  monster.activeAttack = {
    id,
    attackId: `monster3-hit1-${id}`,
    actionName: 'hit1',
    elapsedMs: 0,
    hitboxActiveFromMs: Monster3Tuning.hit1HitboxStartMs,
    hitboxActiveUntilMs: Monster3Tuning.hit1HitboxEndMs,
    damage: Monster3Tuning.hit1Damage,
    attackKind: 'physics',
    knockbackX: Monster3Tuning.hit1KnockbackX,
    knockbackY: Monster3Tuning.hit1KnockbackY,
    facingX: monster.facingX,
  };
}

function startMonster3Hit2(monster: Monster3Model): void {
  const id = monster.attackSerial + 1;
  monster.attackSerial = id;
  monster.state = 'hit2';
  monster.stateTimerMs = Monster3Tuning.hit2DurationMs;
  monster.activeAttack = {
    id,
    attackId: `monster3-hit2-${id}`,
    actionName: 'hit2',
    elapsedMs: 0,
    hitboxActiveFromMs: Monster3Tuning.hit2HitboxStartMs,
    hitboxActiveUntilMs: Monster3Tuning.hit2HitboxEndMs,
    damage: Monster3Tuning.hit2Damage,
    attackKind: 'magic',
    knockbackX: Monster3Tuning.hit2KnockbackX,
    knockbackY: Monster3Tuning.hit2KnockbackY,
    facingX: monster.facingX,
  };
}

function selectNearestTarget(
  monster: Monster3Model,
  targets: readonly Monster3Target[],
): Monster3Target | undefined {
  let nearest: Monster3Target | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    const distance = Math.hypot(target.x - monster.x, target.y - monster.y);
    if (distance > Monster3Tuning.alertRange || distance >= nearestDistance) {
      continue;
    }

    nearest = target;
    nearestDistance = distance;
  }

  return nearest;
}

function moveTowardTarget(monster: Monster3Model, xDistance: number, deltaMs: number): void {
  const deltaSeconds = deltaMs / 1000;
  const moveAmount = Monster3Tuning.horizontalSpeed * deltaSeconds;
  monster.x = xDistance < 0
    ? Math.max(monster.x + xDistance, monster.x - moveAmount)
    : Math.min(monster.x + xDistance, monster.x + moveAmount);
}
