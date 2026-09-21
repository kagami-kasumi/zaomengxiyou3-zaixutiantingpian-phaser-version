import type { PetTurtleAssets } from '../assets/PetTurtleAssets';
import type { TurtlePoint } from '../assets/PetTurtleAssetTypes';

/** World placement only; recursive fields and target shapes remain 222/223 data. */
export function samplePetTurtleHit(assets: PetTurtleAssets, effect: Readonly<{
  symbol: string; nativeTick: number; root: TurtlePoint; facingX: -1 | 1; scale?: 1 | 2;
}>, target: Readonly<{ monsterId: number; x: number; y: number }>) {
  const sign = -effect.facingX as -1 | 1;
  const scale = effect.scale ?? 1;
  const nativeTick = effect.symbol === 'PetTurtle3Bullet3' ? effect.nativeTick % 90 : effect.nativeTick;
  const state = assets.effect(effect.symbol, effect.nativeTick, scale, sign);
  const bounds = state.meta.tree?.localBounds;
  if (!bounds) throw new Error(`Missing turtle effect bounds ${state.id}`);
  const targets = assets.collision.data.monsterTargets;
  const mapping = targets.mappings.find(row => row.monsterId === target.monsterId);
  const symbol = targets.symbols.find(row => row.symbol === mapping?.symbol);
  const profile = assets.collision.data.profiles.find(row => row.symbol === effect.symbol);
  const targetIds = profile?.fixture.targetIds as readonly number[] | undefined;
  const targetIndex = symbol ? targetIds?.indexOf(symbol.characterId) : undefined;
  if (!mapping || targetIndex === undefined || targetIndex < 0) throw new Error(`Unverified turtle target ${target.monsterId}`);
  // Flash getBounds converts each twip edge to Number before Rectangle.intersection.
  const twip = (value: number) => Math.round(value * 20) / 20;
  const sourceLeft = twip(effect.root.x + scale * (sign === 1 ? bounds.x : -bounds.x - bounds.width));
  const sourceTop = twip(effect.root.y + scale * bounds.y);
  const targetLeft = twip(target.x + mapping.runtimeBounds.left);
  const targetTop = twip(target.y + mapping.runtimeBounds.top);
  // getBounds returns edge differences; Rectangle.right adds them back. Keep
  // both floating operations: rounding again changes subpixel edge samples.
  const sourceRight = sourceLeft + (twip(sourceLeft + bounds.width * scale) - sourceLeft);
  const sourceBottom = sourceTop + (twip(sourceTop + bounds.height * scale) - sourceTop);
  const targetRight = targetLeft + (twip(target.x + mapping.runtimeBounds.left + mapping.runtimeBounds.width) - targetLeft);
  const targetBottom = targetTop + (twip(target.y + mapping.runtimeBounds.top + mapping.runtimeBounds.height) - targetTop);
  const x = Math.max(sourceLeft, targetLeft), y = Math.max(sourceTop, targetTop);
  const intersection = { x, y,
    width: Math.max(0, Math.min(sourceRight, targetRight) - x),
    height: Math.max(0, Math.min(sourceBottom, targetBottom) - y) };
  return assets.collision.sample({ field: assets.collision.fieldAt(effect.symbol, nativeTick, scale, sign),
    sourceRoot: effect.root, intersection, targetIndex,
    targetDraw: { x: target.x - x, y: target.y - y } });
}
