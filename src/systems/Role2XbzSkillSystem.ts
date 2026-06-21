import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import {
  spawnProjectileFromTuning,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';

const skillFixedDamage = [
  481, 1333, 2687, 3547, 4456, 6218, 7341, 9622, 12266,
  15279, 17075, 20724, 24783, 29287, 34223, 39640, 42814, 49006,
] as const;

const fixedDamageCount = [
  1, 1, 1, 1, 2, 2, 2, 2.5, 2.5,
  2.5, 2.8, 2.8, 2.8, 3.05, 3.05, 3.05, 3.25, 3.25,
] as const;

const role2SkillFactorBase = 0.3407 * 8 + 2.075;
const role2SkillFactorPerLevel = 0.0135 * 10 * 8 + 0.075 * 10;

export const Role2XbzTuning = {
  mpFactor: 0.65,
  actionName: 'hit3',
  assetKey: SkillProjectileEffectKeys.role2XbzHit3,
  sourceSymbol: 'Role2Bullet3',
  runtimeName: 'Role2Bullet3',
  offsetX: 0,
  offsetY: 50,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 220,
  height: 170,
  lifetimeMs: 900,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 4,
  knockbackY: -4,
  hitIntervalFrames: 250,
  maxHits: 999,
} as const satisfies ProjectileTuning & { mpFactor: number };

export function calculateRole2XbzDamage(skillLevel: number, sourcePower: number): number {
  const levelIndex = Math.min(18, Math.max(1, Math.floor(skillLevel))) - 1;
  const fixedPart = skillFixedDamage[levelIndex] * fixedDamageCount[levelIndex];
  const powerPart = (
    role2SkillFactorBase + role2SkillFactorPerLevel * levelIndex
  ) * 6201 / 6550 * Math.max(0, sourcePower);
  const damageBeforeRoleScale = Math.floor(0.7 * (fixedPart + powerPart) / 5);
  return damageBeforeRoleScale * 1.178;
}

export function spawnRole2XbzProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  skillLevel: number,
  sourcePower: number,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'role2-xbz-hit3',
    'xbz-hit3',
    Role2XbzTuning,
  );
  projectile.damage = calculateRole2XbzDamage(skillLevel, sourcePower);
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}

export function spawnRole2ShadowXbzProjectile(
  system: ProjectileSystemModel,
  spawnPoint: ProjectileSpawnPoint,
  shyLevel: number,
  sourcePower: number,
  damageMultiplier = 1,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    spawnPoint,
    'role2-shadow-xbz-hit3-2',
    'shadow-xbz-hit3-2',
    Role2XbzTuning,
  );
  projectile.actionName = 'hit3_2';
  projectile.damage = calculateRole2XbzDamage(shyLevel, sourcePower) * 0.5 * damageMultiplier;
  projectile.destroyWhenSourceHurt = false;
  system.projectiles.push(projectile);
  return projectile;
}
