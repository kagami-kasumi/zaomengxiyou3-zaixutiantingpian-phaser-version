import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';
import type { Role2SkillRuntimeModel } from './Role2SkillRuntimeSystem';

export type Role2ControlTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
  isImmune: boolean;
  setPosition: (x: number, y: number) => void;
  setSuspended: (suspended: boolean) => void;
};

export const Role2JgzTuning = {
  radius: 240,
  pullMs: 625,
  recoveryMs: 625,
  actionName: 'hit7', assetKey: SkillProjectileEffectKeys.role2JgzHit7,
  sourceSymbol: 'Role2Bullet7', runtimeName: 'Role2Bullet7',
  offsetX: 210, offsetY: 30, speedX: 0, speedY: 0, distance: undefined,
  width: 300, height: 230, lifetimeMs: 1_250, damage: 0, attackKind: 'magic',
  knockbackX: 15, knockbackY: 0, hitIntervalFrames: 4, maxHits: 999,
} as const satisfies ProjectileTuning & { radius: number; pullMs: number; recoveryMs: number };

export function getRole2JgzNextDamageMultiplier(level: number): number {
  return 1.006 + 0.02 * (Math.min(18, Math.max(1, Math.floor(level))) - 1);
}

export function spawnRole2JgzEffect(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(system, spawnPoint, 'role2-jgz', 'jgz-hit7', Role2JgzTuning);
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function applyRole2JgzControl(params: {
  runtime: Role2SkillRuntimeModel;
  casterX: number;
  casterY: number;
  facingX: -1 | 1;
  level: number;
  targets: readonly Role2ControlTarget[];
}): number {
  const effectX = params.casterX + params.facingX * Role2JgzTuning.offsetX;
  const effectY = params.casterY + Role2JgzTuning.offsetY;
  const destinationX = params.casterX + params.facingX * 200;
  const destinationY = params.casterY - 100;
  let affected = 0;
  for (const target of params.targets) {
    if (!target.isAlive || target.isImmune || Math.hypot(target.x - effectX, target.y - effectY) > Role2JgzTuning.radius) continue;
    target.setSuspended(true);
    params.runtime.pullEffects.push({
      targetId: target.id, elapsedMs: 0,
      totalMs: Role2JgzTuning.pullMs + Role2JgzTuning.recoveryMs,
      startX: target.x, startY: target.y,
      destinationX, destinationY,
      setPosition: target.setPosition, setSuspended: target.setSuspended,
    });
    affected += 1;
  }
  params.runtime.nextDamageMultiplier = getRole2JgzNextDamageMultiplier(params.level);
  return affected;
}

export function updateRole2PullEffects(runtime: Role2SkillRuntimeModel, deltaMs: number): void {
  for (const effect of runtime.pullEffects) {
    effect.elapsedMs = Math.min(effect.totalMs, effect.elapsedMs + Math.max(0, deltaMs));
    if (effect.elapsedMs <= Role2JgzTuning.pullMs) {
      const progress = effect.elapsedMs / Role2JgzTuning.pullMs;
      effect.setPosition(
        effect.startX + (effect.destinationX - effect.startX) * progress,
        effect.startY + (effect.destinationY - effect.startY) * progress,
      );
    } else {
      const recoveryProgress = (effect.elapsedMs - Role2JgzTuning.pullMs) / Role2JgzTuning.recoveryMs;
      effect.setPosition(effect.destinationX, effect.destinationY - 10 * recoveryProgress);
    }
    if (effect.elapsedMs >= effect.totalMs) effect.setSuspended(false);
  }
  runtime.pullEffects = runtime.pullEffects.filter((effect) => effect.elapsedMs < effect.totalMs);
}

export function consumeRole2NextDamageMultiplier(runtime: Role2SkillRuntimeModel): number {
  const multiplier = runtime.nextDamageMultiplier;
  runtime.nextDamageMultiplier = 1;
  return multiplier;
}
