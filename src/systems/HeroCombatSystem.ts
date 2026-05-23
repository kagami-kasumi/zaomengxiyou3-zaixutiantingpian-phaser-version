import type { DamageEvent } from './CombatSystem';
import type { HeroMovementBounds, HeroMovementModel } from './HeroMovementSystem';

export type HeroCombatState = 'ready' | 'hurt' | 'dead';

export type HeroCombatModel = {
  id: string;
  hp: number;
  maxHp: number;
  state: HeroCombatState;
  hurtUntilMs: number;
  invulnerableUntilMs: number;
  knockbackVelocityX: number;
  lastDamageEvent?: DamageEvent;
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
  if (hero.state === 'dead' || timeMs < hero.invulnerableUntilMs) {
    return false;
  }

  hero.hp = Math.max(0, hero.hp - event.amount);
  hero.lastDamageEvent = event;

  if (hero.hp <= 0) {
    hero.state = 'dead';
    hero.hurtUntilMs = 0;
    hero.invulnerableUntilMs = Number.POSITIVE_INFINITY;
    hero.knockbackVelocityX = 0;
    return true;
  }

  hero.state = 'hurt';
  hero.hurtUntilMs = timeMs + HeroCombatTuning.hurtDurationMs;
  hero.invulnerableUntilMs = timeMs + HeroCombatTuning.invulnerableDurationMs;
  hero.knockbackVelocityX = event.knockbackX * HeroCombatTuning.knockbackPixelsPerSecond;
  return true;
}

export function updateHeroCombat(
  hero: HeroCombatModel,
  movement: HeroMovementModel,
  bounds: HeroMovementBounds,
  timeMs: number,
  deltaMs: number,
): void {
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

function keepMovementInsideBounds(
  movement: HeroMovementModel,
  bounds: HeroMovementBounds,
): void {
  const minX = bounds.left + movement.width / 2;
  const maxX = bounds.right - movement.width / 2;
  movement.x = Math.min(Math.max(movement.x, minX), maxX);
}
