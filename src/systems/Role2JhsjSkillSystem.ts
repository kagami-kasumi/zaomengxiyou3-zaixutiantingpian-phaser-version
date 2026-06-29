import { SkillFixedDamageCount, SkillFactorBase, SkillFactorPerLevel } from './SkillTuning';
import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
  type ProjectileVariant,
} from './ProjectileSystem';
import type {
  Role2PendingJhsj,
  Role2SkillRuntimeModel,
} from './Role2SkillRuntimeSystem';

const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;


const hit9Tunings = {
  cast: {
    actionName: 'hit9', assetKey: SkillProjectileEffectKeys.role2JhsjHit9_1,
    sourceSymbol: 'Role2Hit9Cast', runtimeName: 'Role2Hit9Cast',
    offsetX: 0, offsetY: -30, speedX: 0, speedY: 0, distance: undefined,
    width: 150, height: 190, lifetimeMs: 1_100, damage: 0, attackKind: 'magic',
    knockbackX: 0, knockbackY: 0, hitIntervalFrames: 999, maxHits: 999,
  },
  hit9_1: {
    actionName: 'hit9_1', assetKey: SkillProjectileEffectKeys.role2JhsjHit9_1,
    sourceSymbol: 'Role2Bullet9_1', runtimeName: 'Role2Bullet9_1',
    offsetX: 20, offsetY: -20, speedX: 0, speedY: 0, distance: undefined,
    width: 220, height: 190, lifetimeMs: 900, damage: 0, attackKind: 'magic',
    knockbackX: 0, knockbackY: -2, hitIntervalFrames: 999, maxHits: 100,
  },
  hit9_2: {
    actionName: 'hit9_2', assetKey: SkillProjectileEffectKeys.role2JhsjHit9_2,
    sourceSymbol: 'Role2Bullet9_2', runtimeName: 'Role2Bullet9_2',
    offsetX: 150, offsetY: -150, speedX: 0, speedY: 0, distance: undefined,
    width: 280, height: 240, lifetimeMs: 900, damage: 0, attackKind: 'magic',
    knockbackX: 1, knockbackY: -2, hitIntervalFrames: 5, maxHits: 100,
  },
} as const satisfies Record<string, ProjectileTuning>;

export const Role2JhsjTuning = {
  hit9_2DelayMs: 45 * 1000 / 60,
  hit9_1DelayMs: 55 * 1000 / 60,
} as const;

export function calculateRole2JhsjDamage(
  level: number,
  sourcePower: number,
  useNextLevelIndex: boolean,
  coefficient = 1,
  damageMultiplier = 1,
): number {
  const baseIndex = Math.min(18, Math.max(1, Math.floor(level))) - 1;
  const levelIndex = Math.min(17, baseIndex + (useNextLevelIndex ? 1 : 0));
  const fixedPart = skillFixedDamage[levelIndex] * SkillFixedDamageCount[levelIndex];
  const powerPart = (
    SkillFactorBase + SkillFactorPerLevel * levelIndex
  ) * 6201 / 6550 * Math.max(0, sourcePower);
  return Math.floor(coefficient * (fixedPart + powerPart) / 10) * 1.178 * damageMultiplier;
}

export function startRole2Jhsj(params: {
  runtime: Role2SkillRuntimeModel;
  system: ProjectileSystemModel;
  spawnPoint: ProjectileSpawnPoint;
  skillLevel: number;
  shyLevel: number;
  sourcePower: number;
  damageMultiplier: number;
}): ProjectileModel {
  const marker = spawnProjectileFromTuning(
    params.system, params.spawnPoint, 'role2-jhsj-cast', 'jhsj-cast', hit9Tunings.cast,
  );
  params.system.projectiles.push(marker);
  params.runtime.pendingJhsj = {
    sourceId: params.spawnPoint.sourceId,
    x: params.spawnPoint.x,
    y: params.spawnPoint.y,
    facingX: params.spawnPoint.facingX,
    elapsedMs: 0,
    skillLevel: params.skillLevel,
    shyLevel: params.shyLevel,
    sourcePower: params.sourcePower,
    damageMultiplier: params.damageMultiplier,
    spawnedHit9_2: false,
    spawnedHit9_1: false,
    // Modern boundary: JHSJ uses the shadow position captured at cast time; recall does not retarget this pending chain.
    shadow: params.runtime.shadow ? {
      x: params.runtime.shadow.x,
      y: params.runtime.shadow.y,
      facingX: params.runtime.shadow.facingX,
    } : undefined,
  };
  return marker;
}

export function updateRole2Jhsj(
  runtime: Role2SkillRuntimeModel,
  system: ProjectileSystemModel,
  deltaMs: number,
): ProjectileModel[] {
  const pending = runtime.pendingJhsj;
  if (!pending) return [];
  pending.elapsedMs += Math.max(0, deltaMs);
  const spawned: ProjectileModel[] = [];
  if (!pending.spawnedHit9_2 && pending.elapsedMs >= Role2JhsjTuning.hit9_2DelayMs) {
    pending.spawnedHit9_2 = true;
    spawned.push(spawnJhsjStage(system, pending, 'hit9_2', false));
    if (pending.shadow) spawned.push(spawnJhsjStage(system, pending, 'hit9_2', true));
  }
  if (!pending.spawnedHit9_1 && pending.elapsedMs >= Role2JhsjTuning.hit9_1DelayMs) {
    pending.spawnedHit9_1 = true;
    spawned.push(spawnJhsjStage(system, pending, 'hit9_1', false));
    if (pending.shadow) spawned.push(spawnJhsjStage(system, pending, 'hit9_1', true));
  }
  if (pending.spawnedHit9_1 && pending.spawnedHit9_2) runtime.pendingJhsj = undefined;
  runtime.spawnedProjectiles.push(...spawned);
  return spawned;
}

function spawnJhsjStage(
  system: ProjectileSystemModel,
  pending: Role2PendingJhsj,
  stage: 'hit9_1' | 'hit9_2',
  shadow: boolean,
): ProjectileModel {
  const point = shadow && pending.shadow ? pending.shadow : pending;
  const isSecondVisual = stage === 'hit9_2';
  const projectile = spawnProjectileFromTuning(
    system,
    { sourceId: shadow ? `${pending.sourceId}-shadow` : pending.sourceId, x: point.x, y: point.y, facingX: point.facingX },
    (shadow
      ? `role2-shadow-jhsj-${stage.replace('hit9_', 'hit9-')}-2`
      : `role2-jhsj-${stage.replace('hit9_', 'hit9-')}`) as ProjectileVariant,
    `${shadow ? 'shadow-' : ''}jhsj-${stage}`,
    hit9Tunings[stage],
  );
  projectile.actionName = shadow ? `${stage}_2` : stage;
  projectile.damage = calculateRole2JhsjDamage(
    shadow ? pending.shyLevel : pending.skillLevel,
    pending.sourcePower,
    isSecondVisual || shadow,
    shadow ? 0.35 : 1,
    pending.damageMultiplier,
  );
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

