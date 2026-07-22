import type { AttackKind } from './CombatSystem';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { Hitbox } from './HeroNormalAttackSystem';
import type { PlayerSlot } from './InputSystem';
import { getStage1EnemyConfig } from './Stage1CombatSystem';

export type Monster30State = 'wait' | 'walk' | 'hurt' | 'hit1' | 'dead' | 'removed';

export type Monster30Target = {
  slot: PlayerSlot;
  x: number;
  y: number;
};

export type Monster30Model = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  experience: number;
  experienceAwardedTo?: PlayerSlot;
  state: Monster30State;
  facingX: -1 | 1;
  targetSlot?: PlayerSlot;
  stateTimerMs: number;
  attackDecisionTimerMs: number;
  attackSerial: number;
  activeAttack?: Monster30ActiveAttack;
  magicFlowerDebuff?: MonsterMagicFlowerDebuff;
  magicFlagDebuff?: MonsterMagicFlagDebuff;
  magicBaguaStun?: MonsterMagicBaguaStun;
  magicZlHummerStun?: MonsterMagicZlHummerStun;
  magicSnowIce?: MonsterMagicSnowIce;
  magicPearlStun?: MonsterMagicPearlStun;
  magicPearlPoison?: MonsterMagicPearlPoison;
  role4MbyjStun?: MonsterRole4MbyjStun;
  petBurn?: MonsterPetBurn;
};

export type MonsterMagicFlowerDebuff = {
  kind: 'magicFlowerDebuff';
  sourceName: string;
  damageMultiplier: number;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicFlagDebuff = {
  kind: 'magicFlagDebuff';
  sourceName: string;
  hitMultiplier: number;
  hpDamageRatePerSecond: number;
  totalMs: number;
  remainingMs: number;
  tickCarryMs: number;
  lastTickDamage: number;
};

export type MonsterMagicBaguaStun = {
  kind: 'magicBaguaStun';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicZlHummerStun = {
  kind: 'magicZlHummerStun';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicSnowIce = {
  kind: 'magicSnowIce';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicPearlStun = {
  kind: 'magicPearlStun';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicPearlPoison = {
  kind: 'magicPearlPoison';
  sourceName: string;
  damagePerSecond: number;
  totalMs: number;
  remainingMs: number;
  tickCarryMs: number;
  lastTickDamage: number;
};

export type MonsterPetBurn = {
  kind: 'petBurn';
  sourceName: string;
  damagePerSecond: number;
  totalMs: number;
  remainingMs: number;
  tickCarryMs: number;
  lastTickDamage: number;
};

export type MonsterRole4MbyjStun = {
  kind: 'role4MbyjStun';
  sourceName: 'mbyj';
  totalMs: number;
  remainingMs: number;
};

export type Monster30ActiveAttack = {
  id: number;
  attackId: string;
  actionName: 'hit1';
  elapsedMs: number;
  hitboxActiveFromMs: number;
  hitboxActiveUntilMs: number;
  damage: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  facingX: -1 | 1;
};

const stage1Monster30Config = getStage1EnemyConfig(30);

export const Monster30Tuning = {
  maxHp: stage1Monster30Config.maxHp,
  horizontalSpeed: stage1Monster30Config.moveSpeed,
  attackRange: stage1Monster30Config.attackRange,
  alertRange: 1000,
  hoverOffsetY: 150,
  riseSpeed: 132,
  dropSpeed: 120,
  attackDecisionIntervalMs: 1000,
  normalAttackRate: 0.5,
  hurtDurationMs: 250,
  hit1DurationMs: stage1Monster30Config.windupMs + stage1Monster30Config.activeMs + stage1Monster30Config.recoveryMs,
  hit1Damage: stage1Monster30Config.attackDamage,
  magicFlowerDamageMultiplier: 0.925,
  magicFlagDurationMs: 5_000,
  magicFlagHpDamageRatePerSecond: 0.02,
  magicFlagHitMultiplier: 0.5,
  magicPearlPoisonTickMs: 1_000,
  hit1HitboxStartMs: stage1Monster30Config.windupMs,
  hit1HitboxEndMs: stage1Monster30Config.windupMs + stage1Monster30Config.activeMs,
  hit1HitboxOffsetX: 52,
  hit1HitboxOffsetY: 28,
  hit1HitboxWidth: 188,
  hit1HitboxHeight: 176,
  hit1KnockbackX: 6,
  hit1KnockbackY: -5,
  deadDurationMs: 233,
  experience: 4,
} as const;

let monster30Serial = 0;

export function createMonster30(x: number, y: number, id?: string): Monster30Model {
  monster30Serial += 1;

  return {
    id: id ?? `monster30-${monster30Serial}`,
    x,
    y,
    hp: Monster30Tuning.maxHp,
    maxHp: Monster30Tuning.maxHp,
    experience: Monster30Tuning.experience,
    state: 'wait',
    facingX: -1,
    stateTimerMs: 0,
    attackDecisionTimerMs: Monster30Tuning.attackDecisionIntervalMs,
    attackSerial: 0,
  };
}

export function updateMonster30(
  monster: Monster30Model,
  targets: readonly Monster30Target[],
  deltaMs: number,
  random: () => number = Math.random,
): void {
  if (monster.state === 'removed') {
    return;
  }

  const stateBeforeDebuff = monster.state;
  updateMonster30MagicFlagDebuff(monster, deltaMs);
  updateMonster30MagicPearlEffects(monster, deltaMs);
  updateMonster30PetBurn(monster, deltaMs);
  if (stateBeforeDebuff !== 'dead' && monster.state === 'dead') {
    return;
  }

  if (monster.state === 'dead') {
    clearMonster30MagicFlagDebuff(monster);
    clearMonster30MagicBaguaStun(monster);
    clearMonster30MagicZlHummerStun(monster);
    clearMonster30MagicSnowIce(monster);
    clearMonster30MagicPearlStun(monster);
    clearMonster30MagicPearlPoison(monster);
    clearMonster30Role4MbyjStun(monster);
    clearMonster30PetBurn(monster);
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

  if (monster.state === 'hit1') {
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

  if (
    monster.magicBaguaStun || monster.magicZlHummerStun || monster.magicSnowIce ||
    monster.magicPearlStun || monster.role4MbyjStun
  ) {
    monster.state = 'wait';
    monster.activeAttack = undefined;
    return;
  }

  const target = selectNearestTarget(monster, targets);
  monster.targetSlot = target?.slot;

  if (!target) {
    monster.state = 'wait';
    return;
  }

  hoverNearTarget(monster, target, deltaMs);

  const xDistance = target.x - monster.x;
  const absXDistance = Math.abs(xDistance);
  monster.facingX = xDistance < 0 ? -1 : 1;
  monster.attackDecisionTimerMs -= deltaMs;

  if (absXDistance > Monster30Tuning.attackRange) {
    monster.state = 'walk';
    moveTowardTarget(monster, xDistance, deltaMs);
    return;
  }

  monster.state = 'wait';

  if (monster.attackDecisionTimerMs > 0) {
    return;
  }

  monster.attackDecisionTimerMs = Monster30Tuning.attackDecisionIntervalMs;

  if (random() <= Monster30Tuning.normalAttackRate) {
    startMonster30Hit1(monster);
  }
}

export function applyMonster30Hit(monster: Monster30Model, damage: number): boolean {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return false;
  }

  monster.hp = Math.max(0, monster.hp - damage);

  if (monster.hp <= 0) {
    monster.state = 'dead';
    monster.stateTimerMs = Monster30Tuning.deadDurationMs;
    monster.activeAttack = undefined;
    return true;
  }

  monster.state = 'hurt';
  monster.stateTimerMs = Monster30Tuning.hurtDurationMs;
  monster.activeAttack = undefined;
  return true;
}

export function applyMonster30MagicFlowerDebuff(
  monster: Monster30Model,
  debuff: MonsterMagicFlowerDebuff,
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  monster.magicFlowerDebuff = {
    ...debuff,
    damageMultiplier: Math.max(0, debuff.damageMultiplier),
    totalMs: Math.max(0, debuff.totalMs),
    remainingMs: Math.max(0, debuff.remainingMs),
  };
}

export function clearMonster30MagicFlowerDebuff(monster: Monster30Model): void {
  monster.magicFlowerDebuff = undefined;
}

export function applyMonster30MagicFlagDebuff(
  monster: Monster30Model,
  params: {
    sourceName: string;
    totalMs?: number;
    remainingMs?: number;
  },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  const totalMs = params.totalMs ?? Monster30Tuning.magicFlagDurationMs;
  monster.magicFlagDebuff = {
    kind: 'magicFlagDebuff',
    sourceName: params.sourceName,
    hitMultiplier: Monster30Tuning.magicFlagHitMultiplier,
    hpDamageRatePerSecond: Monster30Tuning.magicFlagHpDamageRatePerSecond,
    totalMs,
    remainingMs: params.remainingMs ?? totalMs,
    tickCarryMs: 0,
    lastTickDamage: 0,
  };
}

export function clearMonster30MagicFlagDebuff(monster: Monster30Model): void {
  monster.magicFlagDebuff = undefined;
}

export function applyMonster30MagicBaguaStun(
  monster: Monster30Model,
  params: {
    sourceName: string;
    totalMs: number;
    remainingMs?: number;
  },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  monster.magicBaguaStun = {
    kind: 'magicBaguaStun',
    sourceName: params.sourceName,
    totalMs: Math.max(0, params.totalMs),
    remainingMs: Math.max(0, params.remainingMs ?? params.totalMs),
  };
  monster.activeAttack = undefined;
  if (monster.state === 'hit1') {
    monster.state = 'wait';
    monster.stateTimerMs = 0;
  }
}

export function clearMonster30MagicBaguaStun(monster: Monster30Model): void {
  monster.magicBaguaStun = undefined;
}

export function applyMonster30MagicZlHummerStun(
  monster: Monster30Model,
  params: {
    sourceName: string;
    totalMs: number;
    remainingMs?: number;
  },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  monster.magicZlHummerStun = {
    kind: 'magicZlHummerStun',
    sourceName: params.sourceName,
    totalMs: Math.max(0, params.totalMs),
    remainingMs: Math.max(0, params.remainingMs ?? params.totalMs),
  };
  monster.activeAttack = undefined;
  if (monster.state === 'hit1') {
    monster.state = 'wait';
    monster.stateTimerMs = 0;
  }
}

export function clearMonster30MagicZlHummerStun(monster: Monster30Model): void {
  monster.magicZlHummerStun = undefined;
}

export function applyMonster30MagicSnowIce(
  monster: Monster30Model,
  params: {
    sourceName: string;
    totalMs: number;
    remainingMs?: number;
  },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  monster.magicSnowIce = {
    kind: 'magicSnowIce',
    sourceName: params.sourceName,
    totalMs: Math.max(0, params.totalMs),
    remainingMs: Math.max(0, params.remainingMs ?? params.totalMs),
  };
  monster.activeAttack = undefined;
  if (monster.state === 'hit1') {
    monster.state = 'wait';
    monster.stateTimerMs = 0;
  }
}

export function clearMonster30MagicSnowIce(monster: Monster30Model): void {
  monster.magicSnowIce = undefined;
}

export function applyMonster30MagicPearlStun(
  monster: Monster30Model,
  params: {
    sourceName: string;
    totalMs: number;
    remainingMs?: number;
  },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  monster.magicPearlStun = {
    kind: 'magicPearlStun',
    sourceName: params.sourceName,
    totalMs: Math.max(0, params.totalMs),
    remainingMs: Math.max(0, params.remainingMs ?? params.totalMs),
  };
  monster.activeAttack = undefined;
  if (monster.state === 'hit1') {
    monster.state = 'wait';
    monster.stateTimerMs = 0;
  }
}

export function clearMonster30MagicPearlStun(monster: Monster30Model): void {
  monster.magicPearlStun = undefined;
}

export function applyMonster30Role4MbyjStun(
  monster: Monster30Model,
  durationMs: number,
): void {
  if (monster.state === 'dead' || monster.state === 'removed') return;
  const duration = Math.max(0, durationMs);
  monster.role4MbyjStun = {
    kind: 'role4MbyjStun',
    sourceName: 'mbyj',
    totalMs: duration,
    remainingMs: duration,
  };
  monster.activeAttack = undefined;
  if (monster.state === 'hit1') {
    monster.state = 'wait';
    monster.stateTimerMs = 0;
  }
}

export function clearMonster30Role4MbyjStun(monster: Monster30Model): void {
  monster.role4MbyjStun = undefined;
}

export function applyMonster30MagicPearlPoison(
  monster: Monster30Model,
  params: {
    sourceName: string;
    totalMs: number;
    remainingMs?: number;
    damagePerSecond: number;
  },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  monster.magicPearlPoison = {
    kind: 'magicPearlPoison',
    sourceName: params.sourceName,
    totalMs: Math.max(0, params.totalMs),
    remainingMs: Math.max(0, params.remainingMs ?? params.totalMs),
    damagePerSecond: Math.max(0, params.damagePerSecond),
    tickCarryMs: 0,
    lastTickDamage: 0,
  };
}

export function clearMonster30MagicPearlPoison(monster: Monster30Model): void {
  monster.magicPearlPoison = undefined;
}

export function applyMonster30PetBurn(
  monster: Monster30Model,
  params: { sourceName: string; totalMs: number; damagePerSecond: number },
): void {
  if (monster.state === 'dead' || monster.state === 'removed') return;
  monster.petBurn = {
    kind: 'petBurn',
    sourceName: params.sourceName,
    damagePerSecond: Math.max(0, params.damagePerSecond),
    totalMs: Math.max(0, params.totalMs),
    remainingMs: Math.max(0, params.totalMs),
    tickCarryMs: 0,
    lastTickDamage: 0,
  };
}

export function clearMonster30PetBurn(monster: Monster30Model): void {
  monster.petBurn = undefined;
}

export function applyMonster30MagicFlagCounterFromHero(
  monster: Monster30Model,
  hero: HeroCombatModel,
): boolean {
  const guard = hero.magicFlagGuard;
  if (!guard) {
    return false;
  }

  applyMonster30MagicFlagDebuff(monster, {
    sourceName: guard.sourceName,
    totalMs: guard.debuffMs,
    remainingMs: guard.debuffMs,
  });
  return true;
}

export function getMonster30AttackHitbox(monster: Monster30Model): Hitbox | undefined {
  const attack = monster.activeAttack;
  if (
    monster.state !== 'hit1' ||
    !attack ||
    attack.elapsedMs < attack.hitboxActiveFromMs ||
    attack.elapsedMs > attack.hitboxActiveUntilMs
  ) {
    return undefined;
  }

  const centerX = monster.x +
    attack.facingX * Monster30Tuning.hit1HitboxOffsetX +
    attack.facingX * Monster30Tuning.hit1HitboxWidth / 2;
  const centerY = monster.y + Monster30Tuning.hit1HitboxOffsetY;

  return {
    x: centerX - Monster30Tuning.hit1HitboxWidth / 2,
    y: centerY - Monster30Tuning.hit1HitboxHeight / 2,
    width: Monster30Tuning.hit1HitboxWidth,
    height: Monster30Tuning.hit1HitboxHeight,
  };
}

function startMonster30Hit1(monster: Monster30Model): void {
  const id = monster.attackSerial + 1;
  monster.attackSerial = id;
  const damageMultiplier = monster.magicFlowerDebuff?.damageMultiplier ?? 1;
  monster.state = 'hit1';
  monster.stateTimerMs = Monster30Tuning.hit1DurationMs;
  monster.activeAttack = {
    id,
    attackId: `${monster.id}-hit1-${id}`,
    actionName: 'hit1',
    elapsedMs: 0,
    hitboxActiveFromMs: Monster30Tuning.hit1HitboxStartMs,
    hitboxActiveUntilMs: Monster30Tuning.hit1HitboxEndMs,
    damage: Monster30Tuning.hit1Damage * damageMultiplier,
    attackKind: 'physics',
    knockbackX: Monster30Tuning.hit1KnockbackX,
    knockbackY: Monster30Tuning.hit1KnockbackY,
    facingX: monster.facingX,
  };
}

function updateMonster30MagicFlagDebuff(monster: Monster30Model, deltaMs: number): void {
  const debuff = monster.magicFlagDebuff;
  if (!debuff || monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  const elapsedMs = Math.max(0, Math.min(deltaMs, debuff.remainingMs));
  debuff.remainingMs -= elapsedMs;
  debuff.tickCarryMs += elapsedMs;

  while (debuff.tickCarryMs >= 1_000) {
    debuff.tickCarryMs -= 1_000;
    const damage = monster.maxHp * debuff.hpDamageRatePerSecond;
    debuff.lastTickDamage = damage;
    monster.hp = Math.max(0, monster.hp - damage);

    if (monster.hp <= 0) {
      monster.state = 'dead';
      monster.stateTimerMs = Monster30Tuning.deadDurationMs;
      monster.activeAttack = undefined;
      break;
    }
  }

  if (debuff.remainingMs <= 0 || monster.state === 'dead') {
    monster.magicFlagDebuff = undefined;
  }
}

function updateMonster30MagicPearlEffects(monster: Monster30Model, deltaMs: number): void {
  const baguaStun = monster.magicBaguaStun;
  if (baguaStun && monster.state !== 'dead' && monster.state !== 'removed') {
    const elapsedMs = Math.max(0, Math.min(deltaMs, baguaStun.remainingMs));
    baguaStun.remainingMs -= elapsedMs;
    if (baguaStun.remainingMs <= 0) {
      monster.magicBaguaStun = undefined;
    }
  }

  const stun = monster.magicPearlStun;
  const zlHummerStun = monster.magicZlHummerStun;
  if (zlHummerStun && monster.state !== 'dead' && monster.state !== 'removed') {
    const elapsedMs = Math.max(0, Math.min(deltaMs, zlHummerStun.remainingMs));
    zlHummerStun.remainingMs -= elapsedMs;
    if (zlHummerStun.remainingMs <= 0) {
      monster.magicZlHummerStun = undefined;
    }
  }

  const snowIce = monster.magicSnowIce;
  if (snowIce && monster.state !== 'dead' && monster.state !== 'removed') {
    const elapsedMs = Math.max(0, Math.min(deltaMs, snowIce.remainingMs));
    snowIce.remainingMs -= elapsedMs;
    if (snowIce.remainingMs <= 0) {
      monster.magicSnowIce = undefined;
    }
  }

  if (stun && monster.state !== 'dead' && monster.state !== 'removed') {
    const elapsedMs = Math.max(0, Math.min(deltaMs, stun.remainingMs));
    stun.remainingMs -= elapsedMs;
    if (stun.remainingMs <= 0) {
      monster.magicPearlStun = undefined;
    }
  }

  const role4Stun = monster.role4MbyjStun;
  if (role4Stun && monster.state !== 'dead' && monster.state !== 'removed') {
    role4Stun.remainingMs -= Math.max(0, Math.min(deltaMs, role4Stun.remainingMs));
    if (role4Stun.remainingMs <= 0) monster.role4MbyjStun = undefined;
  }

  const poison = monster.magicPearlPoison;
  if (!poison || monster.state === 'dead' || monster.state === 'removed') {
    return;
  }

  const elapsedMs = Math.max(0, Math.min(deltaMs, poison.remainingMs));
  poison.remainingMs -= elapsedMs;
  poison.tickCarryMs += elapsedMs;

  while (poison.tickCarryMs >= Monster30Tuning.magicPearlPoisonTickMs) {
    poison.tickCarryMs -= Monster30Tuning.magicPearlPoisonTickMs;
    poison.lastTickDamage = poison.damagePerSecond;
    monster.hp = Math.max(0, monster.hp - poison.damagePerSecond);
    if (monster.hp <= 0) {
      monster.state = 'dead';
      monster.stateTimerMs = Monster30Tuning.deadDurationMs;
      monster.activeAttack = undefined;
      break;
    }
  }

  if (poison.remainingMs <= 0 || monster.state === 'dead') {
    monster.magicPearlPoison = undefined;
  }
}

function updateMonster30PetBurn(monster: Monster30Model, deltaMs: number): void {
  const burn = monster.petBurn;
  if (!burn || monster.state === 'dead' || monster.state === 'removed') return;
  const elapsedMs = Math.max(0, Math.min(deltaMs, burn.remainingMs));
  burn.remainingMs -= elapsedMs;
  burn.tickCarryMs += elapsedMs;
  while (burn.tickCarryMs >= 1_000) {
    burn.tickCarryMs -= 1_000;
    burn.lastTickDamage = burn.damagePerSecond;
    monster.hp = Math.max(0, monster.hp - burn.damagePerSecond);
    if (monster.hp <= 0) {
      monster.state = 'dead';
      monster.stateTimerMs = Monster30Tuning.deadDurationMs;
      monster.activeAttack = undefined;
      break;
    }
  }
  if (burn.remainingMs <= 0 || monster.state === 'dead') monster.petBurn = undefined;
}

function selectNearestTarget(
  monster: Monster30Model,
  targets: readonly Monster30Target[],
): Monster30Target | undefined {
  let nearest: Monster30Target | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    const distance = Math.hypot(target.x - monster.x, target.y - monster.y);
    if (distance > Monster30Tuning.alertRange || distance >= nearestDistance) {
      continue;
    }

    nearest = target;
    nearestDistance = distance;
  }

  return nearest;
}

function hoverNearTarget(monster: Monster30Model, target: Monster30Target, deltaMs: number): void {
  const desiredY = target.y - Monster30Tuning.hoverOffsetY;
  const deltaSeconds = deltaMs / 1000;

  if (monster.y > desiredY) {
    monster.y = Math.max(
      desiredY,
      monster.y - Monster30Tuning.riseSpeed * deltaSeconds,
    );
  } else if (monster.y < desiredY) {
    monster.y = Math.min(
      desiredY,
      monster.y + Monster30Tuning.dropSpeed * deltaSeconds,
    );
  }
}

function moveTowardTarget(monster: Monster30Model, xDistance: number, deltaMs: number): void {
  const deltaSeconds = deltaMs / 1000;
  const moveAmount = Monster30Tuning.horizontalSpeed * deltaSeconds;
  const nextX = monster.x + Math.sign(xDistance) * moveAmount;

  monster.x = xDistance < 0 ? Math.max(nextX, monster.x + xDistance) : Math.min(nextX, monster.x + xDistance);
}
