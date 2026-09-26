import type { ProjectileModel } from './ProjectileTypes';

/** BaseObject.getBeattackBackSpeed; null means no source attack dictionary. Zero still applies. */
export function getPetProjectileKnockback(projectile: Pick<ProjectileModel,
  'petSourceKnockback' | 'knockbackX' | 'knockbackY' | 'facingX' | 'velocityX'>): Readonly<{ x: number; y: number }> | undefined {
  const source = projectile.petSourceKnockback;
  if (source === null) return undefined;
  // Old shared emitters store an unsigned attack dictionary and separate facing.
  if (!source) return { x: projectile.knockbackX * projectile.facingX, y: projectile.knockbackY };
  const sign = source.direction === 'velocity' ? projectile.velocityX < 0 ? -1 : 1
    : source.direction === 'direct' ? source.direct ?? projectile.facingX : 1;
  return { x: source.x * sign, y: source.y };
}
