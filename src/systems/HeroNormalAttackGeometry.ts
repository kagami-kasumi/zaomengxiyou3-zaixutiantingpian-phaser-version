import { HeroNormalAttackEffectKeys } from '../assets/AssetManifest';
import type { Hitbox } from './HeroNormalAttackSystem';

export type WorldNormalAttackGeometry = Readonly<{
  forward: number;
  rootOffsetY: number;
  localBounds: Readonly<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  }>;
}>;

const HeroVisualRootOffsetY = -50;

// World-effect normal attacks are detached SpecialEffectBullet instances in the
// original runtime. Their damage geometry stays at the release point instead of
// following the hero like FollowBaseObjectBullet melee attachments.
export const WorldNormalAttackGeometryByEffect: Readonly<Record<string, WorldNormalAttackGeometry>> = {
  [HeroNormalAttackEffectKeys.role2Hit1]: worldEffect(50, 10, -493, -94.95, 98.5, 84.45),
  [HeroNormalAttackEffectKeys.role2Hit2]: worldEffect(50, 10, -1289, -130, 125, 128.9),
  [HeroNormalAttackEffectKeys.role4ArrowHit1]: worldEffect(90, 0, -374.4, -44, 159, 64),
  [HeroNormalAttackEffectKeys.role4ArrowHit3]: worldEffect(115, -20, -366.1, -150.65, 169.8, 134.9),
};

const UnresolvedDetachedNormalAttackEffects = new Set<string>([
  HeroNormalAttackEffectKeys.role5SpearRunMissing,
]);

export function getWorldNormalAttackGeometry(effectKey: string): WorldNormalAttackGeometry | undefined {
  return WorldNormalAttackGeometryByEffect[effectKey];
}

export function assertDetachedNormalAttackGeometry(effectKey: string): void {
  if (getWorldNormalAttackGeometry(effectKey) || UnresolvedDetachedNormalAttackEffects.has(effectKey)) {
    return;
  }
  throw new Error(`Detached normal attack requires explicit world geometry: ${effectKey}`);
}

export function shouldFlipNormalAttackEffect(heroId: number, facingX: -1 | 1): boolean {
  // TangSeng's restored effects face left. The other recovered attack families
  // use their existing right-facing export contract.
  return heroId === 2 ? facingX > 0 : facingX < 0;
}

export function projectWorldNormalAttackHitbox(params: {
  heroId: number;
  effectKey: string;
  facingX: -1 | 1;
  spawnX: number;
  spawnY: number;
}): Hitbox | undefined {
  const geometry = getWorldNormalAttackGeometry(params.effectKey);
  if (!geometry) return undefined;

  const originX = params.spawnX + params.facingX * geometry.forward;
  const originY = params.spawnY + HeroVisualRootOffsetY + geometry.rootOffsetY;
  const flipped = shouldFlipNormalAttackEffect(params.heroId, params.facingX);
  const left = flipped ? -geometry.localBounds.right : geometry.localBounds.left;
  const right = flipped ? -geometry.localBounds.left : geometry.localBounds.right;

  return {
    x: originX + left,
    y: originY + geometry.localBounds.top,
    width: right - left,
    height: geometry.localBounds.bottom - geometry.localBounds.top,
  };
}

function worldEffect(
  forward: number,
  rootOffsetY: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): WorldNormalAttackGeometry {
  return { forward, rootOffsetY, localBounds: { left, top, right, bottom } };
}
