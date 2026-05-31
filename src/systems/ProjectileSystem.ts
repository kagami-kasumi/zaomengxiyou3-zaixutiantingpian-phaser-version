import {
  MagicWeaponEffectKeys,
  SkillProjectileEffectKeys,
} from '../assets/AssetManifest';
import type { AttackKind } from './CombatSystem';
import type { Hitbox } from './HeroNormalAttackSystem';

export type ProjectileSourceState = 'ready' | 'hurt' | 'dead';

export type ProjectileSourceSnapshot = {
  id: string;
  state: ProjectileSourceState;
};

export type ProjectileSpawnPoint = {
  sourceId: string;
  x: number;
  y: number;
  facingX: -1 | 1;
};

export type ProjectileModel = {
  id: number;
  projectileId: string;
  variant: ProjectileVariant;
  sourceId: string;
  sourceAttackId: string;
  actionName: string;
  assetKey: string;
  sourceSymbol: string;
  runtimeName: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  velocityX: number;
  velocityY: number;
  remainingDistance: number | undefined;
  width: number;
  height: number;
  damage: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  elapsedMs: number;
  lifetimeMs: number;
  hitIntervalFrames: number;
  nextHitSerialAtFrame: number;
  hitSerial: number;
  remainingHits: number;
  destroyWhenSourceHurt: boolean;
  hasSpawnedSecondStage: boolean;
  isExpired: boolean;
};

export type ProjectileSystemModel = {
  projectiles: ProjectileModel[];
  projectileSerial: number;
  sourceAttackSerialBySource: Record<string, number>;
};

export type ProjectileVariant =
  | 'role2-sgq-hit5'
  | 'role2-smb-hit4-1'
  | 'role2-smb-hit4-2'
  | 'magic-weapon-sword2'
  | 'magic-weapon-qpj-active'
  | 'magic-weapon-qpj-auto';

export const Role2SgqProjectileTuning = {
  actionName: 'hit5',
  assetKey: SkillProjectileEffectKeys.role2SgqHit5,
  sourceSymbol: 'Role2Bullet5',
  runtimeName: 'Role2Bullet5',
  offsetX: 175,
  offsetY: -110,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 220,
  height: 168,
  lifetimeMs: 900,
  damage: 18,
  attackKind: 'magic',
  knockbackX: 5,
  knockbackY: -2,
  hitIntervalFrames: 16,
  maxHits: 999,
} as const;

export const Role2SmbFirstStageProjectileTuning = {
  actionName: 'hit4',
  assetKey: SkillProjectileEffectKeys.role2SmbHit4_1,
  sourceSymbol: 'Role2Bullet4_1',
  runtimeName: 'Role1Bullet4_1',
  offsetX: 200,
  offsetY: 10,
  speedX: 10,
  speedY: 0,
  distance: 9999,
  width: 96,
  height: 56,
  lifetimeMs: 1600,
  damage: 16,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: -3,
  hitIntervalFrames: 999,
  maxHits: 100,
} as const;

export const Role2SmbSecondStageProjectileTuning = {
  actionName: 'hit4',
  assetKey: SkillProjectileEffectKeys.role2SmbHit4_2,
  sourceSymbol: 'Role2Bullet4_2',
  runtimeName: 'Role2Bullet4_2',
  offsetX: -50,
  offsetY: -320,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 260,
  height: 190,
  lifetimeMs: 760,
  damage: 16,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: -3,
  hitIntervalFrames: 999,
  maxHits: 100,
} as const;

export const MagicSword2ProjectileTuning = {
  actionName: 'magicsword2',
  assetKey: MagicWeaponEffectKeys.magicSword2,
  sourceSymbol: 'MagicSword2_2',
  runtimeName: 'MagicSword2_2',
  offsetX: 0,
  offsetY: 15,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 126,
  height: 118,
  lifetimeMs: 560,
  damage: 22,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: -4,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const MagicQpjActiveProjectileTuning = {
  actionName: 'fabao-qpj',
  assetKey: MagicWeaponEffectKeys.magicQpj,
  sourceSymbol: 'qpjeffect',
  runtimeName: 'qpjeffect',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 92,
  height: 92,
  lifetimeMs: 8_800,
  damage: 14,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const MagicQpjAutoProjectileTuning = {
  ...MagicQpjActiveProjectileTuning,
  actionName: 'fabao-qpj1',
  lifetimeMs: 7_500,
  damage: 10,
} as const;

const frameMs = 1000 / 60;

export function createProjectileSystem(): ProjectileSystemModel {
  return {
    projectiles: [],
    projectileSerial: 0,
    sourceAttackSerialBySource: {},
  };
}

export function spawnRole2SgqProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'role2-sgq-hit5',
    'sgq-hit5',
    Role2SgqProjectileTuning,
  );

  system.projectiles.push(projectile);
  return projectile;
}

export function spawnRole2SmbFirstStageProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'role2-smb-hit4-1',
    'smb-hit4-1',
    Role2SmbFirstStageProjectileTuning,
  );

  system.projectiles.push(projectile);
  return projectile;
}

export function spawnRole2SmbSecondStageProjectile(
  system: ProjectileSystemModel,
  firstStageProjectile: ProjectileModel,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    {
      sourceId: firstStageProjectile.sourceId,
      x: firstStageProjectile.x,
      y: firstStageProjectile.y,
      facingX: firstStageProjectile.facingX,
    },
    'role2-smb-hit4-2',
    'smb-hit4-2',
    Role2SmbSecondStageProjectileTuning,
  );

  firstStageProjectile.hasSpawnedSecondStage = true;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnMagicSword2Projectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'magic-weapon-sword2',
    'magic-sword2',
    MagicSword2ProjectileTuning,
  );

  system.projectiles.push(projectile);
  return projectile;
}

export function spawnMagicQpjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  mode: 'active' | 'auto',
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    mode === 'active' ? 'magic-weapon-qpj-active' : 'magic-weapon-qpj-auto',
    mode === 'active' ? 'magic-qpj-active' : 'magic-qpj-auto',
    mode === 'active'
      ? MagicQpjActiveProjectileTuning
      : MagicQpjAutoProjectileTuning,
  );

  system.projectiles.push(projectile);
  return projectile;
}

export function updateProjectiles(
  system: ProjectileSystemModel,
  sourceSnapshots: readonly ProjectileSourceSnapshot[],
  deltaMs: number,
): void {
  const sourceById = new Map(sourceSnapshots.map((source) => [source.id, source]));

  for (const projectile of system.projectiles) {
    if (projectile.isExpired) {
      continue;
    }

    const source = sourceById.get(projectile.sourceId);
    if (!source || source.state === 'dead' || (projectile.destroyWhenSourceHurt && source.state === 'hurt')) {
      projectile.isExpired = true;
      continue;
    }

    projectile.elapsedMs += deltaMs;
    updateProjectilePosition(projectile, deltaMs);
    const elapsedFrames = projectile.elapsedMs / frameMs;

    while (elapsedFrames >= projectile.nextHitSerialAtFrame) {
      projectile.hitSerial += 1;
      projectile.nextHitSerialAtFrame += projectile.hitIntervalFrames;
    }

    if (
      projectile.elapsedMs >= projectile.lifetimeMs ||
      projectile.remainingHits <= 0
    ) {
      projectile.isExpired = true;
    }
  }

  system.projectiles = system.projectiles.filter((projectile) => !projectile.isExpired);
}

function spawnProjectileFromTuning(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  variant: ProjectileVariant,
  attackSlug: string,
  tuning:
    | typeof Role2SgqProjectileTuning
    | typeof Role2SmbFirstStageProjectileTuning
    | typeof Role2SmbSecondStageProjectileTuning
    | typeof MagicSword2ProjectileTuning
    | typeof MagicQpjActiveProjectileTuning
    | typeof MagicQpjAutoProjectileTuning,
): ProjectileModel {
  const id = system.projectileSerial + 1;
  system.projectileSerial = id;

  const sourceAttackSerial = (system.sourceAttackSerialBySource[spawnPoint.sourceId] ?? 0) + 1;
  system.sourceAttackSerialBySource[spawnPoint.sourceId] = sourceAttackSerial;
  const sourceAttackId = `${spawnPoint.sourceId}-${attackSlug}-${sourceAttackSerial}`;

  return {
    id,
    projectileId: `projectile-${id}`,
    variant,
    sourceId: spawnPoint.sourceId,
    sourceAttackId,
    actionName: tuning.actionName,
    assetKey: tuning.assetKey,
    sourceSymbol: tuning.sourceSymbol,
    runtimeName: tuning.runtimeName,
    x: spawnPoint.x + spawnPoint.facingX * tuning.offsetX,
    y: spawnPoint.y + tuning.offsetY,
    facingX: spawnPoint.facingX,
    velocityX: spawnPoint.facingX * tuning.speedX,
    velocityY: tuning.speedY,
    remainingDistance: tuning.distance,
    width: tuning.width,
    height: tuning.height,
    damage: tuning.damage,
    attackKind: tuning.attackKind,
    knockbackX: tuning.knockbackX,
    knockbackY: tuning.knockbackY,
    elapsedMs: 0,
    lifetimeMs: tuning.lifetimeMs,
    hitIntervalFrames: tuning.hitIntervalFrames,
    nextHitSerialAtFrame: tuning.hitIntervalFrames,
    hitSerial: 0,
    remainingHits: tuning.maxHits,
    destroyWhenSourceHurt: true,
    hasSpawnedSecondStage: false,
    isExpired: false,
  };
}

function updateProjectilePosition(projectile: ProjectileModel, deltaMs: number): void {
  if (projectile.velocityX === 0 && projectile.velocityY === 0) {
    return;
  }

  const frameScale = deltaMs / frameMs;
  const moveX = projectile.velocityX * frameScale;
  const moveY = projectile.velocityY * frameScale;

  projectile.x += moveX;
  projectile.y += moveY;

  if (projectile.remainingDistance === undefined) {
    return;
  }

  projectile.remainingDistance -= Math.sqrt(moveX * moveX + moveY * moveY);
  if (projectile.remainingDistance <= 0) {
    projectile.isExpired = true;
  }
}

export function getActiveProjectiles(system: ProjectileSystemModel): readonly ProjectileModel[] {
  return system.projectiles;
}

export function hasActiveProjectileForSource(
  system: ProjectileSystemModel,
  sourceId: string,
): boolean {
  return system.projectiles.some((projectile) =>
    projectile.sourceId === sourceId && !projectile.isExpired
  );
}

export function findRole2SmbFirstStageProjectile(
  system: ProjectileSystemModel,
  sourceId: string,
): ProjectileModel | undefined {
  return system.projectiles.find((projectile) =>
    projectile.sourceId === sourceId &&
    projectile.variant === 'role2-smb-hit4-1' &&
    !projectile.isExpired &&
    !projectile.hasSpawnedSecondStage
  );
}

export function getProjectileHitbox(projectile: ProjectileModel): Hitbox {
  return {
    x: projectile.x - projectile.width / 2,
    y: projectile.y - projectile.height / 2,
    width: projectile.width,
    height: projectile.height,
  };
}

export function getProjectileAttackId(projectile: ProjectileModel): string {
  return `${projectile.projectileId}:${projectile.sourceAttackId}:${projectile.hitSerial}`;
}

export function recordProjectileHit(projectile: ProjectileModel): void {
  projectile.remainingHits -= 1;
  if (projectile.remainingHits <= 0) {
    projectile.isExpired = true;
  }
}
