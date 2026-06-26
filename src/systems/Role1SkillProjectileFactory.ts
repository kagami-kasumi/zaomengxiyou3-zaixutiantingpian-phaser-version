import { SkillProjectileEffectKeys } from '../assets/AssetManifest';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import {
  spawnProjectileFromTuning,
  type ProjectileSystemModel,
  type ProjectileTuning,
} from './ProjectileSystem';

const role1LyfbShadowDamageMultiplier = 0.3125;

const lyfbFollowProjectileTuning = {
  actionName: 'hit8',
  assetKey: SkillProjectileEffectKeys.role1LyfbHit8,
  sourceSymbol: 'Role1Bullet8_1',
  runtimeName: 'Role1Bullet8_1',
  offsetX: -20,
  offsetY: 30,
  speedX: 0,
  speedY: 0,
  distance: undefined,
  width: 180,
  height: 120,
  lifetimeMs: 520,
  damage: 0,
  attackKind: 'physics',
  knockbackX: 8,
  knockbackY: -2,
  hitIntervalFrames: 4,
  maxHits: 12,
} as const satisfies ProjectileTuning;

const lyfbMovingProjectileTuning = {
  actionName: 'hit8_2',
  assetKey: SkillProjectileEffectKeys.role1LyfbHit8_2,
  sourceSymbol: 'Role1Bullet8_2',
  runtimeName: 'Role1Bullet8_2',
  offsetX: -20,
  offsetY: 30,
  speedX: 15,
  speedY: 0,
  distance: 600,
  width: 170,
  height: 110,
  lifetimeMs: 2_400,
  damage: 0,
  attackKind: 'magic',
  knockbackX: 6,
  knockbackY: -5,
  hitIntervalFrames: 4,
  maxHits: 12,
} as const satisfies ProjectileTuning;

export function spawnRole1LyfbProjectiles(params: {
  projectiles: ProjectileSystemModel;
  combat: HeroCombatModel;
  movement: HeroMovementModel;
  damage: number;
  shadowDerived?: boolean;
}) {
  const shadowMultiplier = params.shadowDerived ? role1LyfbShadowDamageMultiplier : 1;
  const followTuning = params.shadowDerived
    ? { ...lyfbFollowProjectileTuning, actionName: 'hit8_1' }
    : lyfbFollowProjectileTuning;
  const movingTuning = params.shadowDerived
    ? { ...lyfbMovingProjectileTuning, actionName: 'hit8_2_1' }
    : lyfbMovingProjectileTuning;
  const follow = spawnRole1LyfbProjectile(
    params.projectiles,
    params.combat,
    params.movement,
    params.shadowDerived ? 'role1-lyfb-shadow-hit8-1' : 'role1-lyfb-hit8',
    params.shadowDerived ? 'role1-lyfb-shadow-hit8-1' : 'role1-lyfb-hit8',
    followTuning,
  );
  const moving = spawnRole1LyfbProjectile(
    params.projectiles,
    params.combat,
    params.movement,
    params.shadowDerived ? 'role1-lyfb-shadow-hit8-2-1' : 'role1-lyfb-hit8-2',
    params.shadowDerived ? 'role1-lyfb-shadow-hit8-2-1' : 'role1-lyfb-hit8-2',
    movingTuning,
  );
  follow.damage = params.damage * shadowMultiplier;
  moving.damage = params.damage * shadowMultiplier;
  return [follow, moving] as const;
}

function spawnRole1LyfbProjectile(
  projectiles: ProjectileSystemModel,
  combat: HeroCombatModel,
  movement: HeroMovementModel,
  variant:
    | 'role1-lyfb-hit8'
    | 'role1-lyfb-hit8-2'
    | 'role1-lyfb-shadow-hit8-1'
    | 'role1-lyfb-shadow-hit8-2-1',
  attackSlug: string,
  tuning: ProjectileTuning,
) {
  return spawnProjectileFromTuning(
    projectiles,
    {
      sourceId: combat.id,
      x: movement.x,
      y: movement.y,
      facingX: movement.facingX,
    },
    variant,
    attackSlug,
    tuning,
  );
}
