/** Source BaseBullet stores hurt as int and attack power separately. */
export type DragonDamageCache = Readonly<{ hurt: number; attack: number; critical: boolean }>;
export type DragonAttackStats = Readonly<{ attack: number; magicAdd: number; gxp: boolean; power?: number; effectRate?: number }>;

// PetDragon1.getRealPower(hit1), called twice with crit enabled by BaseBullet.refresh,
// then once with crit disabled to determine the displayed critical flag.
export function refreshDragonDamageCache(stats: DragonAttackStats,
  rollCritical: () => boolean): DragonDamageCache {
  const base = ((stats.power ?? stats.attack) + (stats.magicAdd >>> 0)) * (stats.gxp ? 1.2 : 1) * (stats.effectRate ?? 1);
  const hurt = (base * (rollCritical() ? 2 : 1)) | 0;
  rollCritical(); // qixue read still invokes getRealPower, even though qixue is zero.
  const noncritical = base | 0;
  return { hurt, attack: (stats.attack * 2.8) | 0, critical: hurt / noncritical >= 1.6 };
}

/** BaseMonster.getHurtValue: equal attack/defense can produce an accepted zero. */
export function calculateDragonPhysicalDamage(cache: DragonDamageCache, defense: number): number {
  const ratio = (cache.attack - defense) / cache.attack;
  const value = ratio > 1.1 ? cache.hurt * 1.1 : ratio < 0 ? 1 : cache.hurt * ratio;
  return value | 0; // reduceHp(int), including AS3 NaN -> 0.
}

export function calculateDragonMagicDamage(cache: DragonDamageCache, defense: number): number {
  const ratio = 1 - defense;
  if (ratio < 0) return 1;
  return (cache.hurt * Math.min(1.1, ratio)) | 0;
}

export function calculateDragonHitHeal(maxHp: number, attack: number, level: number): number {
  return (maxHp * 0.018 + attack * 0.18 + level * 2) | 0;
}

/** Acceptance is independent of HP delta. Rejections must neither reroll nor heal. */
export function consumeDragonDamageCache(cache: DragonDamageCache, ports: Readonly<{
  accept: (cached: DragonDamageCache) => boolean;
  refresh: () => DragonDamageCache;
  onAccepted: (refreshed: DragonDamageCache) => void;
}>): DragonDamageCache {
  if (!ports.accept(cache)) return cache;
  const next = ports.refresh();
  ports.onAccepted(next);
  return next;
}
