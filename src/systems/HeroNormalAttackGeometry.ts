import { HeroNormalAttackEffectKeys } from '../assets/AssetManifest';
import normalAttackSpatialTruth from '../../docs/reverse-engineering/ground-truth/manifests/task-arch-174-normal-attack-spatial.json';
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
const EffectKeyByTruthObjectId: Readonly<Record<string, string>> = {
  'role2-hit1': HeroNormalAttackEffectKeys.role2Hit1,
  'role2-hit2': HeroNormalAttackEffectKeys.role2Hit2,
  'role4-arrow-hit1': HeroNormalAttackEffectKeys.role4ArrowHit1,
  'role4-arrow-hit3': HeroNormalAttackEffectKeys.role4ArrowHit3,
};

export const WorldNormalAttackGeometryByEffect = readVerifiedWorldGeometry();

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

function readVerifiedWorldGeometry(): Readonly<Record<string, WorldNormalAttackGeometry>> {
  if (
    normalAttackSpatialTruth.truthId !== 'task-arch-174.normal-attack-spatial'
    || normalAttackSpatialTruth.status !== 'verified'
    || normalAttackSpatialTruth.completeness.unresolved.length > 0
  ) {
    throw new Error('Detached normal-attack geometry requires verified TASK-ARCH-174 truth');
  }
  return Object.fromEntries(normalAttackSpatialTruth.displayObjects.map((object) => {
    const effectKey = EffectKeyByTruthObjectId[object.id];
    const placement = object.placements[0];
    if (!effectKey || !placement) {
      throw new Error(`Unexpected detached normal-attack truth object: ${object.id}`);
    }
    return [effectKey, {
      forward: placement.localMatrix.tx,
      rootOffsetY: placement.localMatrix.ty,
      localBounds: {
        left: placement.localBounds.left,
        top: placement.localBounds.top,
        right: placement.localBounds.left + placement.localBounds.width,
        bottom: placement.localBounds.top + placement.localBounds.height,
      },
    } satisfies WorldNormalAttackGeometry];
  }));
}
