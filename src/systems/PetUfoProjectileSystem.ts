import { PetSkillEffectKeys } from '../assets/AssetManifest';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
} from './ProjectileSystem';

export const PetUfo1PmsProjectileTuning = {
  actionName: 'hit2',
  assetKey: PetSkillEffectKeys.ufo1Pms,
  sourceSymbol: 'PetKabu1Bullet2',
  runtimeName: 'PetKabu1Bullet2',
  offsetX: 0,
  offsetY: -24,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 160,
  height: 118,
  lifetimeMs: 700,
  damage: 90,
  attackKind: 'magic' as const,
  knockbackX: 2,
  knockbackY: -5,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export const PetUfo3KmskProjectileTuning = {
  actionName: 'hit4',
  assetKey: PetSkillEffectKeys.ufo3Kmsk,
  sourceSymbol: 'PetKabu3Bullet4',
  runtimeName: 'PetKabu3Bullet4',
  offsetX: 0,
  offsetY: 30,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 140,
  lifetimeMs: 800,
  damage: 180,
  attackKind: 'magic' as const,
  knockbackX: 8,
  knockbackY: 0,
  hitIntervalFrames: 999,
  maxHits: 1,
} as const;

export function spawnPetUfo1PmsProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-ufo1-pms',
    'pet-ufo1-pms',
    PetUfo1PmsProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnPetUfo3KmskProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  damage: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'pet-ufo3-kmsk',
    'pet-ufo3-kmsk',
    PetUfo3KmskProjectileTuning,
  );

  projectile.damage = damage;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}
