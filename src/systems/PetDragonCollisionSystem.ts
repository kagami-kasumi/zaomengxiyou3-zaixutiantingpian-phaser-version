import contract from '../../docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json';

export type DragonCollisionBounds = Readonly<{ x: number; y: number; width: number; height: number }>;
export type DragonCollisionMask = Readonly<{ width: number; height: number; alpha: ArrayLike<number> }>;

/** Bundled AIR's Sprite position setter truncates toward zero to integral twips. */
export function toDragonSourceCoordinate(value: number): number {
  if (!Number.isFinite(value)) throw new Error('Dragon source coordinates must be finite');
  return Math.trunc(value * 20) / 20 || 0;
}

if (contract.status !== 'verified' || contract.completeness.unresolved.length) {
  throw new Error('Dragon collision requires verified original-runtime evidence');
}

/** Runtime instance scaling is already present in the source contract. */
export function getDragonTargetCollisionBounds(monsterId: number, x: number, y: number): DragonCollisionBounds {
  const mapping = contract.monsterMappings.find((entry) => entry.monsterId === monsterId);
  if (!mapping) throw new Error(`Unverified dragon collision target: ${monsterId}`);
  const bounds = mapping.runtimeBounds;
  return { x: toDragonSourceCoordinate(x) + bounds.left, y: toDragonSourceCoordinate(y) + bounds.top,
    width: bounds.width, height: bounds.height };
}

export function getDragonBulletCollisionBounds(frame: number, x: number, y: number,
  facingX: -1 | 1): DragonCollisionBounds {
  const source = contract.bulletFrames.find((entry) => entry.frame === frame);
  if (!source) throw new Error(`Invalid dragon bullet frame: ${frame}`);
  // SWF dimensions are integral twips; discard affine-export floating point residue.
  const bounds = { ...source.drawBounds,
    width: Math.round(source.drawBounds.width * 20) / 20,
    height: Math.round(source.drawBounds.height * 20) / 20 };
  // Artwork faces left; the source's right-facing sprite uses scaleX=-1.
  return { x: toDragonSourceCoordinate(x) + (facingX === -1 ? bounds.left : -bounds.left - bounds.width),
    y: toDragonSourceCoordinate(y) + bounds.top, width: bounds.width, height: bounds.height };
}

/** AIR-calibrated accuracy=1 sampler for the verified unit-scale, axis-aligned source bitmap. */
export function sampleDragonCollision(target: DragonCollisionBounds, bullet: DragonCollisionBounds,
  facingX: -1 | 1, mask: DragonCollisionMask): { hit: boolean; pixels: number } {
  const [width, height] = contract.collision.assetMaskProjection.size;
  if (mask.width !== width || mask.height !== height || mask.alpha.length !== width * height) {
    throw new Error('Dragon collision mask must use the verified production PNG projection');
  }
  const x = Math.max(target.x, bullet.x);
  const y = Math.max(target.y, bullet.y);
  const overlapWidth = Math.min(target.x + target.width, bullet.x + bullet.width) - x;
  const overlapHeight = Math.min(target.y + target.height, bullet.y + bullet.height) - y;
  if (overlapWidth < 1 || overlapHeight < 1) return { hit: false, pixels: 0 };
  const dx = Math.round((x - bullet.x) * 20);
  const dy = Math.round((y - bullet.y) * 20);
  const sourceX = facingX === -1 ? Math.ceil((dx - 5) / 20) : 68 - Math.ceil((dx - 10) / 20);
  const sourceY = Math.ceil((dy - 5) / 20);
  let pixels = 0;
  for (let row = 0; row < Math.floor(overlapHeight); row++) {
    const sy = sourceY + row;
    if (sy < 0 || sy >= height) continue;
    for (let column = 0; column < Math.floor(overlapWidth); column++) {
      const sx = sourceX + (facingX === -1 ? column : -column);
      if (sx >= 0 && sx < width && mask.alpha[sy * width + sx]! > 0) pixels++;
    }
  }
  return { hit: pixels > 0, pixels };
}
