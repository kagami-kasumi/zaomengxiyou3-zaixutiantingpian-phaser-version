import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import type { Role2SkillRuntimeModel } from './Role2SkillRuntimeSystem';

const shadowTuning = {
  actionName: 'hit10', assetKey: SkillProjectileEffectKeys.role2ShyShadow,
  sourceSymbol: 'ROLE2_SHALLDOW', runtimeName: 'Role2Shadow',
  offsetX: 0, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
  width: 70, height: 150, lifetimeMs: 8_000, damage: 0, attackKind: 'magic',
  knockbackX: 0, knockbackY: 0, hitIntervalFrames: 999, maxHits: 999,
} as const satisfies ProjectileTuning;

const recallTuning = {
  ...shadowTuning,
  runtimeName: 'Role2ShadowRecall',
  width: 150,
  height: 190,
  lifetimeMs: 450,
} as const satisfies ProjectileTuning;

export const Role2ShadowTuning = { lifetimeMs: 8_000 } as const;

export function castRole2Shy(params: {
  runtime: Role2SkillRuntimeModel;
  system: ProjectileSystemModel;
  spawnPoint: ProjectileSpawnPoint;
  movement: HeroMovementModel;
}): { projectile: ProjectileModel; created: boolean } {
  const existing = params.runtime.shadow;
  if (existing) {
    params.movement.x = existing.x;
    params.movement.y = existing.y;
    const original = params.system.projectiles.find((projectile) => projectile.id === existing.projectileId);
    if (original) original.isExpired = true;
    params.runtime.shadow = undefined;
    const recall = spawnProjectileFromTuning(
      params.system,
      { ...params.spawnPoint, x: existing.x, y: existing.y },
      'role2-shy-recall',
      'shy-recall',
      recallTuning,
    );
    recall.destroyWhenSourceHurt = false;
    params.system.projectiles.push(recall);
    return { projectile: recall, created: false };
  }

  const projectile = spawnProjectileFromTuning(
    params.system,
    { ...params.spawnPoint, sourceId: `${params.spawnPoint.sourceId}-shadow` },
    'role2-shy-shadow',
    'shy-shadow',
    shadowTuning,
  );
  projectile.destroyWhenSourceHurt = false;
  params.system.projectiles.push(projectile);
  params.runtime.shadow = {
    id: `${params.spawnPoint.sourceId}-shadow`,
    projectileId: projectile.id,
    x: params.spawnPoint.x,
    y: params.spawnPoint.y,
    facingX: params.spawnPoint.facingX,
    remainingMs: Role2ShadowTuning.lifetimeMs,
  };
  return { projectile, created: true };
}

export function updateRole2Shadow(
  runtime: Role2SkillRuntimeModel,
  system: ProjectileSystemModel,
  deltaMs: number,
): void {
  const shadow = runtime.shadow;
  if (!shadow) return;
  shadow.remainingMs = Math.max(0, shadow.remainingMs - Math.max(0, deltaMs));
  if (shadow.remainingMs > 0) return;
  const projectile = system.projectiles.find((candidate) => candidate.id === shadow.projectileId);
  if (projectile) projectile.isExpired = true;
  runtime.shadow = undefined;
}
