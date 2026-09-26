import type { MonkeyHorseCollisionSample, PetMonkeyHorseCollisionAssets } from '../assets/PetMonkeyHorseCollisionAssets';
import { toDragonSourceCoordinate } from './PetDragonCollisionSystem';

type Bounds = Readonly<{ x: number; y: number; width: number; height: number }>;
/** getBounds edges are integral twips; preserve Rectangle's subsequent Number subtraction. */
export function monkeyHorseCollisionIntersection(source: Bounds, target: Bounds): Bounds {
  const x = Math.max(source.x, target.x), y = Math.max(source.y, target.y);
  const width = Math.min(source.x + source.width, target.x + target.width) - x;
  const height = Math.min(source.y + source.height, target.y + target.height) - y;
  return width < 0 || height < 0 ? { x: 0, y: 0, width: 0, height: 0 } : { x, y, width, height };
}

export function sampleMonkeyHorseWorldHit(assets: PetMonkeyHorseCollisionAssets,
  effect: Pick<MonkeyHorseCollisionSample, 'family' | 'symbol' | 'nativeTick' | 'direction' | 'sourceRoot'>,
  target: Readonly<{ x: number; y: number; bounds: Bounds; shape: MonkeyHorseCollisionSample['target'] }>,
) {
  const sourceRoot = { x: toDragonSourceCoordinate(effect.sourceRoot.x), y: toDragonSourceCoordinate(effect.sourceRoot.y) };
  const targetRoot = { x: toDragonSourceCoordinate(target.x), y: toDragonSourceCoordinate(target.y) };
  const field = assets.fieldAt(effect.family, effect.symbol, effect.nativeTick, effect.direction);
  const place = (bounds: Bounds, root: Readonly<{ x: number; y: number }>): Bounds => {
    const edge = (n: number) => Math.round(n * 20) / 20;
    const x = edge(root.x + bounds.x), y = edge(root.y + bounds.y);
    return { x, y, width: edge(root.x + bounds.x + bounds.width) - x,
      height: edge(root.y + bounds.y + bounds.height) - y };
  };
  const intersection = monkeyHorseCollisionIntersection(place(field.bounds, sourceRoot), place(target.bounds, targetRoot));
  return { intersection, hit: assets.hit({ ...effect, sourceRoot, intersection, target: target.shape,
    targetDraw: { x: targetRoot.x - intersection.x, y: targetRoot.y - intersection.y } }) };
}
