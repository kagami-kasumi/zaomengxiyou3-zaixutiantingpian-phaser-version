import type { DamageEvent } from './CombatSystem';
import type { HeroMovementBounds, HeroMovementModel } from './HeroMovementSystem';

export type HeroCombatState = 'ready' | 'hurt' | 'dead';

export type HeroMagicShieldKind = 'magicUmbrellaDefend' | 'magicUmbrellaDefend2' | 'role2Tjgl';

export type HeroMagicShield = {
  kind: HeroMagicShieldKind;
  sourceName: string;
  initialAmount: number;
  remainingAmount: number;
  totalMs: number;
  remainingMs: number;
};

export type HeroMagicInvulnerability = {
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type HeroMagicBuffKind = 'xlfbBuff' | 'sxfbBuff' | 'yxfbBuff2';

export type HeroMagicBuff = {
  kind: HeroMagicBuffKind;
  sourceName: string;
  attackBonusPercent: number;
  critBonusPercent: number;
  totalMs: number;
  remainingMs: number;
};

export type HeroMagicFlowerBuff = {
  kind: 'magicFlowerAddBuff';
  sourceName: string;
  attackBonusFlat: number;
  attackMultiplier: number;
  totalMs: number;
  remainingMs: number;
};

export type HeroMagicFlagGuard = {
  kind: 'magicFlagEffect';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
  debuffMs: number;
};

export type HeroCombatModel = {
  id: string;
  hp: number;
  maxHp: number;
  state: HeroCombatState;
  hurtUntilMs: number;
  invulnerableUntilMs: number;
  knockbackVelocityX: number;
  lastDamageEvent?: DamageEvent;
  magicShield?: HeroMagicShield;
  magicInvulnerability?: HeroMagicInvulnerability;
  magicBuff?: HeroMagicBuff;
  magicFlowerBuff?: HeroMagicFlowerBuff;
  magicFlagGuard?: HeroMagicFlagGuard;
};

export const HeroCombatTuning = {
  maxHp: 120,
  hurtDurationMs: 260,
  invulnerableDurationMs: 480,
  knockbackPixelsPerSecond: 64,
  knockbackDecayPerSecond: 6,
} as const;

export function createHeroCombat(id: string): HeroCombatModel {
  return {
    id,
    hp: HeroCombatTuning.maxHp,
    maxHp: HeroCombatTuning.maxHp,
    state: 'ready',
    hurtUntilMs: 0,
    invulnerableUntilMs: 0,
    knockbackVelocityX: 0,
  };
}

export function resetHeroCombat(hero: HeroCombatModel): void {
  hero.hp = hero.maxHp;
  hero.state = 'ready';
  hero.hurtUntilMs = 0;
  hero.invulnerableUntilMs = 0;
  hero.knockbackVelocityX = 0;
  hero.lastDamageEvent = undefined;
  hero.magicShield = undefined;
  hero.magicInvulnerability = undefined;
  hero.magicBuff = undefined;
  hero.magicFlowerBuff = undefined;
  hero.magicFlagGuard = undefined;
}

export function isHeroCombatDead(hero: HeroCombatModel): boolean {
  return hero.state === 'dead';
}

export function isHeroInvulnerable(hero: HeroCombatModel, timeMs: number): boolean {
  return hero.state !== 'dead' && timeMs < hero.invulnerableUntilMs;
}

export function applyHeroDamage(
  hero: HeroCombatModel,
  event: DamageEvent,
  timeMs: number,
): boolean {
  if (
    hero.state === 'dead' ||
    timeMs < hero.invulnerableUntilMs ||
    hero.magicInvulnerability
  ) {
    return false;
  }

  const remainingDamage = absorbHeroDamageWithMagicShield(hero, event.amount);
  hero.hp = Math.max(0, hero.hp - remainingDamage);
  hero.lastDamageEvent = event;

  if (hero.hp <= 0) {
    hero.state = 'dead';
    hero.hurtUntilMs = 0;
    hero.invulnerableUntilMs = Number.POSITIVE_INFINITY;
    hero.knockbackVelocityX = 0;
    return true;
  }

  if (remainingDamage > 0) {
    hero.state = 'hurt';
    hero.hurtUntilMs = timeMs + HeroCombatTuning.hurtDurationMs;
    hero.invulnerableUntilMs = timeMs + HeroCombatTuning.invulnerableDurationMs;
    hero.knockbackVelocityX = event.knockbackX * HeroCombatTuning.knockbackPixelsPerSecond;
  }
  return true;
}

export function applyHeroMagicShield(
  hero: HeroCombatModel,
  shield: HeroMagicShield,
): void {
  if (hero.state === 'dead') {
    return;
  }

  hero.magicShield = {
    ...shield,
    initialAmount: Math.max(0, shield.initialAmount),
    remainingAmount: Math.max(0, shield.remainingAmount),
    totalMs: Math.max(0, shield.totalMs),
    remainingMs: Math.max(0, shield.remainingMs),
  };
}

export function updateHeroMagicShield(
  hero: HeroCombatModel,
  deltaMs: number,
): void {
  const shield = hero.magicShield;
  if (!shield) {
    return;
  }

  shield.remainingMs -= Math.max(0, deltaMs);
  if (shield.remainingMs <= 0 || shield.remainingAmount <= 0) {
    hero.magicShield = undefined;
  }
}

export function applyHeroMagicInvulnerability(
  hero: HeroCombatModel,
  invulnerability: HeroMagicInvulnerability,
): void {
  if (hero.state === 'dead') {
    return;
  }

  hero.magicInvulnerability = {
    ...invulnerability,
    totalMs: Math.max(0, invulnerability.totalMs),
    remainingMs: Math.max(0, invulnerability.remainingMs),
  };
}

export function updateHeroMagicInvulnerability(
  hero: HeroCombatModel,
  deltaMs: number,
): void {
  const invulnerability = hero.magicInvulnerability;
  if (!invulnerability) {
    return;
  }

  invulnerability.remainingMs -= Math.max(0, deltaMs);
  if (invulnerability.remainingMs <= 0) {
    hero.magicInvulnerability = undefined;
  }
}

export function updateHeroCombat(
  hero: HeroCombatModel,
  movement: HeroMovementModel,
  bounds: HeroMovementBounds,
  timeMs: number,
  deltaMs: number,
): void {
  updateHeroMagicShield(hero, deltaMs);
  updateHeroMagicInvulnerability(hero, deltaMs);

  if (hero.state === 'hurt' && timeMs >= hero.hurtUntilMs) {
    hero.state = 'ready';
  }

  if (hero.knockbackVelocityX === 0) {
    return;
  }

  const deltaSeconds = deltaMs / 1000;
  movement.x += hero.knockbackVelocityX * deltaSeconds;
  keepMovementInsideBounds(movement, bounds);

  const decayFactor = Math.max(
    0,
    1 - HeroCombatTuning.knockbackDecayPerSecond * deltaSeconds,
  );
  hero.knockbackVelocityX *= decayFactor;

  if (Math.abs(hero.knockbackVelocityX) < 1) {
    hero.knockbackVelocityX = 0;
  }
}

export function applyHeroMagicFlowerBuff(
  hero: HeroCombatModel,
  buff: HeroMagicFlowerBuff,
): void {
  if (hero.state === 'dead') {
    return;
  }

  hero.magicFlowerBuff = {
    ...buff,
    attackBonusFlat: Math.max(0, buff.attackBonusFlat),
    attackMultiplier: Math.max(1, buff.attackMultiplier),
    totalMs: Math.max(0, buff.totalMs),
    remainingMs: Math.max(0, buff.remainingMs),
  };
}

export function clearHeroMagicFlowerBuff(hero: HeroCombatModel): void {
  hero.magicFlowerBuff = undefined;
}

export function applyHeroMagicFlagGuard(
  hero: HeroCombatModel,
  guard: HeroMagicFlagGuard,
): void {
  if (hero.state === 'dead') {
    return;
  }

  hero.magicFlagGuard = {
    ...guard,
    totalMs: Math.max(0, guard.totalMs),
    remainingMs: Math.max(0, guard.remainingMs),
    debuffMs: Math.max(0, guard.debuffMs),
  };
}

export function clearHeroMagicFlagGuard(hero: HeroCombatModel): void {
  hero.magicFlagGuard = undefined;
}

export function updateHeroMagicFlagGuard(
  hero: HeroCombatModel,
  deltaMs: number,
): void {
  const guard = hero.magicFlagGuard;
  if (!guard) {
    return;
  }

  guard.remainingMs -= Math.max(0, deltaMs);
  if (guard.remainingMs <= 0 || hero.state === 'dead') {
    hero.magicFlagGuard = undefined;
  }
}

function absorbHeroDamageWithMagicShield(
  hero: HeroCombatModel,
  amount: number,
): number {
  const shield = hero.magicShield;
  if (!shield || amount <= 0) {
    return amount;
  }

  const absorbed = Math.min(shield.remainingAmount, amount);
  shield.remainingAmount -= absorbed;
  if (shield.remainingAmount <= 0) {
    hero.magicShield = undefined;
  }
  return amount - absorbed;
}

function keepMovementInsideBounds(
  movement: HeroMovementModel,
  bounds: HeroMovementBounds,
): void {
  const minX = bounds.left + movement.width / 2;
  const maxX = bounds.right - movement.width / 2;
  movement.x = Math.min(Math.max(movement.x, minX), maxX);
}
