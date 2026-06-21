import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import {
  applyHeroMagicShield,
  type HeroCombatModel,
} from './HeroCombatSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
  type ProjectileVariant,
} from './ProjectileSystem';
import type { Role2SkillRuntimeModel } from './Role2SkillRuntimeSystem';

export type Role2SupportTarget = {
  id: string;
  x: number;
  y: number;
  maxHp: number;
  isAlive: boolean;
  heal: (amount: number) => void;
};

const supportTunings = {
  myhc: {
    actionName: 'hit6', assetKey: SkillProjectileEffectKeys.role2MyhcHit6,
    sourceSymbol: 'Role2Bullet6', runtimeName: 'Role2Bullet6',
    offsetX: 0, offsetY: -25, speedX: 0, speedY: 0, distance: undefined,
    width: 200, height: 170, lifetimeMs: 720, damage: 0, attackKind: 'magic',
    knockbackX: 0, knockbackY: 0, hitIntervalFrames: 999, maxHits: 999,
  },
  tjgl: {
    actionName: 'hit8', assetKey: SkillProjectileEffectKeys.role2TjglHit8,
    sourceSymbol: 'Role2Bullet8', runtimeName: 'Role2Bullet8',
    offsetX: -5, offsetY: -60, speedX: 0, speedY: 0, distance: undefined,
    width: 300, height: 220, lifetimeMs: 900, damage: 0, attackKind: 'magic',
    knockbackX: 0, knockbackY: 0, hitIntervalFrames: 999, maxHits: 999,
  },
} as const satisfies Record<string, ProjectileTuning>;

export const Role2SupportTuning = {
  myhcRadius: 100,
  myhcDurationMs: 4_000,
  myhcTickMs: 1_000,
  tjglRadius: 150,
  tjglShieldMs: 7_000,
  tjglShieldFactors: [4.6, 4.7, 4.8, 5, 5.15, 5.25, 5.4, 5.6, 6],
} as const;

export function calculateRole2MyhcHealPerTick(level: number, casterMaxHp: number): number {
  const levelIndex = normalizeSupportLevel(level, 9) - 1;
  return Math.ceil(
    0.0525 / (1 + 0.28098 * 8) * (1 + 0.28098 * levelIndex) * casterMaxHp,
  ) * 2;
}

export function calculateRole2TjglHeal(
  level: number,
  targetMaxHp: number,
  isGxp: boolean,
  coefficientMultiplier = 1,
): number {
  const levelIndex = normalizeSupportLevel(level, 9) - 1;
  const coefficient = 0.33 / (1 + 0.28098 * 8) * (1 + 0.28098 * levelIndex);
  return Math.floor(targetMaxHp * coefficient * coefficientMultiplier * (isGxp ? 1.5 : 1));
}

export function calculateRole2TjglShield(level: number, casterMaxHp: number): number {
  const levelIndex = normalizeSupportLevel(level, 9) - 1;
  const coefficient = 0.33 / (1 + 0.28098 * 8) * (1 + 0.28098 * levelIndex);
  return Math.floor(
    casterMaxHp * coefficient * Role2SupportTuning.tjglShieldFactors[levelIndex] * 0.2915,
  );
}

export function spawnRole2SupportEffect(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  skill: 'myhc' | 'tjgl',
  shadow = false,
): ProjectileModel {
  const tuning = supportTunings[skill];
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    (shadow ? `role2-shadow-${skill}` : `role2-${skill}`) as ProjectileVariant,
    `${shadow ? 'shadow-' : ''}${skill}`,
    tuning,
  );
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function applyRole2Myhc(params: {
  runtime: Role2SkillRuntimeModel;
  centerX: number;
  centerY: number;
  level: number;
  casterMaxHp: number;
  targets: readonly Role2SupportTarget[];
}): number {
  const healPerTick = calculateRole2MyhcHealPerTick(params.level, params.casterMaxHp);
  let affected = 0;
  for (const target of params.targets) {
    if (!target.isAlive || distance(target.x, target.y, params.centerX, params.centerY) >= Role2SupportTuning.myhcRadius) continue;
    params.runtime.healingOverTime.push({
      targetId: target.id,
      remainingMs: Role2SupportTuning.myhcDurationMs,
      tickCarryMs: 0,
      healPerTick,
      heal: target.heal,
    });
    affected += 1;
  }
  return affected;
}

export function applyRole2Tjgl(params: {
  centerX: number;
  centerY: number;
  level: number;
  isGxp: boolean;
  targets: readonly Role2SupportTarget[];
  casterCombat?: HeroCombatModel;
  applyShield: boolean;
  coefficientMultiplier?: number;
}): number {
  let affected = 0;
  for (const target of params.targets) {
    if (!target.isAlive || distance(target.x, target.y, params.centerX, params.centerY) > Role2SupportTuning.tjglRadius) continue;
    target.heal(calculateRole2TjglHeal(
      params.level,
      target.maxHp,
      params.isGxp,
      params.coefficientMultiplier ?? 1,
    ));
    affected += 1;
  }
  if (params.applyShield && params.casterCombat) {
    const shield = calculateRole2TjglShield(params.level, params.casterCombat.maxHp);
    if (shield > 0) {
      applyHeroMagicShield(params.casterCombat, {
        kind: 'role2Tjgl', sourceName: 'tjgl_Shield', initialAmount: shield,
        remainingAmount: shield, totalMs: Role2SupportTuning.tjglShieldMs,
        remainingMs: Role2SupportTuning.tjglShieldMs,
      });
    }
  }
  return affected;
}

export function updateRole2HealingOverTime(runtime: Role2SkillRuntimeModel, deltaMs: number): void {
  for (const effect of runtime.healingOverTime) {
    const elapsed = Math.min(Math.max(0, deltaMs), effect.remainingMs);
    effect.remainingMs -= elapsed;
    effect.tickCarryMs += elapsed;
    while (effect.tickCarryMs >= Role2SupportTuning.myhcTickMs) {
      effect.tickCarryMs -= Role2SupportTuning.myhcTickMs;
      effect.heal(effect.healPerTick);
    }
  }
  runtime.healingOverTime = runtime.healingOverTime.filter((effect) => effect.remainingMs > 0);
}

function normalizeSupportLevel(level: number, max: number): number {
  return Math.min(max, Math.max(1, Math.floor(level)));
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}
