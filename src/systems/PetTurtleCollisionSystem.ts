import type { PetTurtleAssets } from '../assets/PetTurtleAssets';
import type { TurtlePoint } from '../assets/PetTurtleAssetTypes';

/** World placement only; recursive fields and target shapes remain 222/223 data. */
export function samplePetTurtleHit(assets: PetTurtleAssets, effect: Readonly<{
  symbol: string; nativeTick: number; root: TurtlePoint; facingX: -1 | 1;
}>, target: Readonly<{ monsterId: number; x: number; y: number }>) {
  const sign = -effect.facingX as -1 | 1;
  const state = assets.effect(effect.symbol, effect.nativeTick, 1, sign);
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
  const sourceLeft = twip(effect.root.x + (sign === 1 ? bounds.x : -bounds.x - bounds.width));
  const sourceTop = twip(effect.root.y + bounds.y);
  const targetLeft = twip(target.x + mapping.runtimeBounds.left);
  const targetTop = twip(target.y + mapping.runtimeBounds.top);
  const x = Math.max(sourceLeft, targetLeft), y = Math.max(sourceTop, targetTop);
  const intersection = { x, y,
    width: Math.max(0, Math.min(twip(sourceLeft + bounds.width), twip(targetLeft + mapping.runtimeBounds.width)) - x),
    height: Math.max(0, Math.min(twip(sourceTop + bounds.height), twip(targetTop + mapping.runtimeBounds.height)) - y) };
  return assets.collision.sample({ field: assets.collision.fieldAt(effect.symbol, effect.nativeTick, 1, sign),
    sourceRoot: effect.root, intersection, targetIndex,
    targetDraw: { x: target.x - x, y: target.y - y } });
}
