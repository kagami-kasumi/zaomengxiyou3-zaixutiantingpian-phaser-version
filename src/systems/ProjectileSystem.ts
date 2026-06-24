import {
  MagicWeaponEffectKeys,
  PetSkillEffectKeys,
  SkillProjectileEffectKeys,
} from '../assets/AssetManifest';
import type { Hitbox } from './HeroNormalAttackSystem';
import type {
  ProjectileModel,
  ProjectileSourceSnapshot,
  ProjectileSpawnPoint,
  ProjectileSystemModel,
  ProjectileTuning,
  ProjectileVariant,
} from './ProjectileTypes';
export type * from './ProjectileTypes';

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

export const MagicPearlBulletTunings = {
  bullet1: {
    actionName: 'fabao-pearl',
    assetKey: MagicWeaponEffectKeys.magicPearlBullet1,
    sourceSymbol: 'MagicPearlBullet1',
    runtimeName: 'MagicPearlBullet1',
    offsetX: 0,
    offsetY: -15,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width: 108,
    height: 92,
    lifetimeMs: 180,
    damage: 19,
    attackKind: 'magic',
    knockbackX: 2,
    knockbackY: -2,
    hitIntervalFrames: 2,
    maxHits: 999,
  },
  bullet2: {
    actionName: 'fabao-pearl',
    assetKey: MagicWeaponEffectKeys.magicPearlBullet2,
    sourceSymbol: 'MagicPearlBullet2',
    runtimeName: 'MagicPearlBullet2',
    offsetX: 0,
    offsetY: 0,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width: 116,
    height: 96,
    lifetimeMs: 180,
    damage: 19,
    attackKind: 'magic',
    knockbackX: 2,
    knockbackY: -2,
    hitIntervalFrames: 2,
    maxHits: 999,
  },
  bullet3: {
    actionName: 'fabao-pearl',
    assetKey: MagicWeaponEffectKeys.magicPearlBullet3,
    sourceSymbol: 'MagicPearlBullet3',
    runtimeName: 'MagicPearlBullet3',
    offsetX: 0,
    offsetY: 10,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width: 124,
    height: 102,
    lifetimeMs: 180,
    damage: 19,
    attackKind: 'magic',
    knockbackX: 2,
    knockbackY: -2,
    hitIntervalFrames: 2,
    maxHits: 999,
  },
} as const;

export const MagicZlHummerProjectileTuning = {
  actionName: 'fabao-zltc',
  assetKey: MagicWeaponEffectKeys.magicZlHummer,
  sourceSymbol: 'zltcskill',
  runtimeName: 'zltcskill',
  offsetX: 160,
  offsetY: -42,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 190,
  height: 132,
  lifetimeMs: 420,
  damage: 81,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 6,
  maxHits: 999,
  stunMs: 4_500,
} as const;

export const MagicSnowProjectileTuning = {
  actionName: 'fabao-snow',
  assetKey: MagicWeaponEffectKeys.magicSnow,
  sourceSymbol: 'ef_snow',
  runtimeName: 'ef_snow',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: 1500,
  width: 42,
  height: 42,
  lifetimeMs: 2_400,
  damage: 18,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 999,
  iceMs: 3_000,
} as const;

export const PetMonkey1XjProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.monkey1Xj,
  sourceSymbol: 'PetMonkey1Bullet2',
  runtimeName: 'PetMonkey1Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 118,
  height: 86,
  lifetimeMs: 420,
  damage: 52,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetMonkey2LjProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.monkey2Lj,
  sourceSymbol: 'PetMonkey2Bullet2',
  runtimeName: 'PetMonkey2Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 138,
  height: 94,
  lifetimeMs: 520,
  damage: 84,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetMonkey2XjProjectileTuning = {
  actionName: 'hit3',
  assetKey: PetSkillEffectKeys.monkey2Xj,
  sourceSymbol: 'PetMonkey2Bullet3',
  runtimeName: 'PetMonkey2Bullet3',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 118,
  height: 86,
  lifetimeMs: 420,
  damage: 52,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetMonkey3LyqProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.monkey3Lyq,
  sourceSymbol: 'PetMonkey3Bullet2',
  runtimeName: 'PetMonkey3Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 156,
  height: 108,
  lifetimeMs: 560,
  damage: 136,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetMonkey3XjProjectileTuning = {
  actionName: 'hit3',
  assetKey: PetSkillEffectKeys.monkey3Xj,
  sourceSymbol: 'PetMonkey1Bullet2',
  runtimeName: 'PetMonkey1Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 118,
  height: 86,
  lifetimeMs: 420,
  damage: 52,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetMonkey3LjProjectileTuning = {
  actionName: 'hit4',
  assetKey: PetSkillEffectKeys.monkey3Lj,
  sourceSymbol: 'PetMonkey3Bullet3_2',
  runtimeName: 'PetMonkey3Bullet3_2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 144,
  height: 104,
  lifetimeMs: 560,
  damage: 84,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -2,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetMonkey4JgaoyiProjectileTuning = {
  actionName: 'hit5',
  assetKey: PetSkillEffectKeys.monkey4Jgaoyi,
  sourceSymbol: 'PetMonkey4.hit5',
  runtimeName: 'PetMonkey4Hit5',
  offsetX: 0,
  offsetY: -30,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 128,
  lifetimeMs: 700,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetHorse1SpProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.horse1Sp,
  sourceSymbol: 'PetHorse1Bullet2',
  runtimeName: 'PetHorse1Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 132,
  height: 92,
  lifetimeMs: 520,
  damage: 94.5,
  attackKind: 'magic',
  knockbackX: 5,
  knockbackY: 0,
  hitIntervalFrames: 24,
  maxHits: 1,
  iceMs: 2_000,
} as const;

export const PetHorse2BdProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.horse2Bd,
  sourceSymbol: 'PetHorse2Bullet2',
  runtimeName: 'PetHorse2Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 132,
  height: 92,
  lifetimeMs: 520,
  damage: 94.5,
  attackKind: 'magic',
  knockbackX: 5,
  knockbackY: 0,
  hitIntervalFrames: 24,
  maxHits: 1,
  iceMs: 2_000,
} as const;

export const PetHorse3BzProjectileTuning = {
  actionName: 'hit4',
  assetKey: PetSkillEffectKeys.horse3Bz,
  sourceSymbol: 'PetHorse3Bullet4',
  runtimeName: 'PetHorse3Bullet4',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 128,
  lifetimeMs: 700,
  damage: 173.25,
  attackKind: 'magic',
  knockbackX: 5,
  knockbackY: 0,
  hitIntervalFrames: 24,
  maxHits: 1,
  iceMs: 2_000,
} as const;

export const PetHorse4TmaoyiProjectileTuning = {
  actionName: 'hit5',
  assetKey: PetSkillEffectKeys.horse4Tmaoyi,
  sourceSymbol: 'PetHorse4Bullet5',
  runtimeName: 'PetHorse4Bullet5',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: 2_000,
  width: 160,
  height: 128,
  lifetimeMs: 10_000,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 5,
  knockbackY: 0,
  hitIntervalFrames: 24,
  maxHits: 1,
  iceMsWithBd: 2_400,
} as const;

export const PetHorse4TmaoyiExplodeProjectileTuning = {
  actionName: 'hit5_2',
  assetKey: PetSkillEffectKeys.horse4TmaoyiExplode,
  sourceSymbol: 'PetHorse4Bullet5Explode',
  runtimeName: 'PetHorse4Bullet5Explode',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 220,
  height: 160,
  lifetimeMs: 700,
  damage: 173.25,
  attackKind: 'magic',
  knockbackX: 5,
  knockbackY: 0,
  hitIntervalFrames: 24,
  maxHits: 1,
} as const;

export const PetDragon1FsProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.dragon1Fs,
  sourceSymbol: 'PetDragon1Bullet1',
  runtimeName: 'PetDragon1Clone',
  offsetX: -44,
  offsetY: -50,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 68,
  height: 92,
  lifetimeMs: 10_000,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 0,
} as const;

export const PetDragon2SdccProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.dragon2Sdcc,
  sourceSymbol: 'PetDragon2Bullet2',
  runtimeName: 'PetDragon2Bullet2',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 138,
  height: 96,
  lifetimeMs: 700,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -5,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetDragon3LtwjProjectileTuning = {
  actionName: 'hit3',
  assetKey: PetSkillEffectKeys.dragon3Ltwj,
  sourceSymbol: 'PetDragon3Bullet3',
  runtimeName: 'PetDragon3Bullet3',
  offsetX: 0,
  offsetY: 0,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 170,
  height: 126,
  lifetimeMs: 900,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -5,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetDragon4QlaoyiProjectileTuning = {
  actionName: 'hit4',
  assetKey: PetSkillEffectKeys.dragon4Qlaoyi,
  sourceSymbol: 'PetDragonBullet4',
  runtimeName: 'PetDragonBullet4',
  offsetX: 0,
  offsetY: -24,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 190,
  height: 138,
  lifetimeMs: 1_000,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 1,
  knockbackY: -5,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetTurtle1SldProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.turtle1Sld,
  sourceSymbol: 'PetTurtle1Bullet2',
  runtimeName: 'PetTurtle1Bullet2',
  offsetX: 0,
  offsetY: -28,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 150,
  height: 112,
  lifetimeMs: 700,
  damage: 25,
  attackKind: 'magic',
  knockbackX: 10,
  knockbackY: 0,
  hitIntervalFrames: 7,
  maxHits: 1,
} as const;

export const PetTurtle3SybhProjectileTuning = {
  actionName: 'hit3',
  assetKey: PetSkillEffectKeys.turtle3Sybh,
  sourceSymbol: 'PetTurtle3Bullet3',
  runtimeName: 'PetTurtle3Bullet3',
  offsetX: 0,
  offsetY: -28,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 300,
  height: 224,
  lifetimeMs: 900,
  damage: 135,
  attackKind: 'magic',
  knockbackX: 2,
  knockbackY: -5,
  hitIntervalFrames: 999,
  maxHits: 999,
} as const;

export const PetTurtle4XwaoyiProjectileTuning = {
  actionName: 'hit5',
  assetKey: PetSkillEffectKeys.turtle4Xwaoyi,
  sourceSymbol: 'PetTurtle4Hit5',
  runtimeName: 'PetTurtle4Hit5',
  offsetX: 0,
  offsetY: -38,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 240,
  height: 180,
  lifetimeMs: 5_000,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 0,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 999,
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

export function spawnMagicPearlProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  bulletIndex: 1 | 2 | 3,
  damage: number,
): ProjectileModel {
  const tuning = bulletIndex === 1
    ? MagicPearlBulletTunings.bullet1
    : bulletIndex === 2
      ? MagicPearlBulletTunings.bullet2
      : MagicPearlBulletTunings.bullet3;
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    bulletIndex === 1
      ? 'magic-weapon-pearl-bullet1'
      : bulletIndex === 2
        ? 'magic-weapon-pearl-bullet2'
        : 'magic-weapon-pearl-bullet3',
    `magic-pearl-bullet${bulletIndex}`,
    tuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnMagicZlHummerProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'magic-weapon-zltc',
    'magic-zltc',
    MagicZlHummerProjectileTuning,
  );

  projectile.damage = damage;
  projectile.magicStunMs = MagicZlHummerProjectileTuning.stunMs;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnMagicSnowProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  params: {
    angleDegrees: number;
    speed: number;
    damage: number;
  },
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'magic-weapon-snow',
    'magic-snow',
    MagicSnowProjectileTuning,
  );

  const radians = params.angleDegrees / 180 * Math.PI;
  projectile.velocityX = Math.cos(radians) * params.speed;
  projectile.velocityY = Math.sin(radians) * params.speed;
  projectile.damage = params.damage;
  projectile.magicIceMs = MagicSnowProjectileTuning.iceMs;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey1XjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey1-xj',
    'pet-monkey1-xj',
    PetMonkey1XjProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey2LjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey2-lj',
    'pet-monkey2-lj',
    PetMonkey2LjProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey2XjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey2-xj',
    'pet-monkey2-xj',
    PetMonkey2XjProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey3LyqProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey3-lyq',
    'pet-monkey3-lyq',
    PetMonkey3LyqProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey3XjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey3-xj',
    'pet-monkey3-xj',
    PetMonkey3XjProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey3LjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey3-lj',
    'pet-monkey3-lj',
    PetMonkey3LjProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetMonkey4JgaoyiProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-monkey4-jgaoyi',
    'pet-monkey4-jgaoyi',
    PetMonkey4JgaoyiProjectileTuning,
  );

  projectile.damage = 0;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetHorse1SpProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-horse1-sp',
    'pet-horse1-sp',
    PetHorse1SpProjectileTuning,
  );

  projectile.damage = damage;
  projectile.magicIceMs = PetHorse1SpProjectileTuning.iceMs;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetHorse2BdProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-horse2-bd',
    'pet-horse2-bd',
    PetHorse2BdProjectileTuning,
  );

  projectile.damage = damage;
  projectile.magicIceMs = PetHorse2BdProjectileTuning.iceMs;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetHorse3BzProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-horse3-bz',
    'pet-horse3-bz',
    PetHorse3BzProjectileTuning,
  );

  projectile.damage = damage;
  projectile.magicIceMs = PetHorse3BzProjectileTuning.iceMs;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetHorse4TmaoyiProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  options: {
    targetId: string;
    tracksTarget: boolean;
    magicIceMs?: number;
    explosionDelayMs?: number;
    explosionDamage?: number;
  },
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-horse4-tmaoyi',
    'pet-horse4-tmaoyi',
    PetHorse4TmaoyiProjectileTuning,
  );

  projectile.damage = 0;
  projectile.trackingTargetId = options.tracksTarget ? options.targetId : undefined;
  projectile.magicIceMs = options.magicIceMs;
  projectile.explosionDelayMs = options.explosionDelayMs;
  projectile.secondStageDamage = options.explosionDamage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetHorse4TmaoyiExplodeProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-horse4-tmaoyi-explode',
    'pet-horse4-tmaoyi-explode',
    PetHorse4TmaoyiExplodeProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetDragon1FsProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-dragon1-fs',
    'pet-dragon1-fs',
    PetDragon1FsProjectileTuning,
  );

  projectile.damage = 0;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetDragon2SdccProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
  healOnHit: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-dragon2-sdcc',
    'pet-dragon2-sdcc',
    PetDragon2SdccProjectileTuning,
  );

  projectile.damage = damage;
  projectile.petHealOnHit = healOnHit;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetDragon3LtwjProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
  healOnHit: number,
  stageIndex: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-dragon3-ltwj',
    `pet-dragon3-ltwj-${stageIndex}`,
    PetDragon3LtwjProjectileTuning,
  );

  projectile.damage = damage;
  projectile.petHealOnHit = healOnHit;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetDragon4QlaoyiProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  comboTags: readonly string[],
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-dragon4-qlaoyi',
    'pet-dragon4-qlaoyi',
    PetDragon4QlaoyiProjectileTuning,
  );

  projectile.damage = 0;
  projectile.petComboTags = [...comboTags];
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetTurtle1SldProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-turtle1-sld',
    'pet-turtle1-sld',
    PetTurtle1SldProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetTurtle3SybhProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-turtle3-sybh',
    'pet-turtle3-sybh',
    PetTurtle3SybhProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetTurtle4XwaoyiProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-turtle4-xwaoyi',
    'pet-turtle4-xwaoyi',
    PetTurtle4XwaoyiProjectileTuning,
  );

  projectile.destroyWhenSourceHurt = false;
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

export function spawnProjectileFromTuning(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  variant: ProjectileVariant,
  attackSlug: string,
  tuning: ProjectileTuning,
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
