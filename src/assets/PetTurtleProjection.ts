import type { PetTurtleAssets } from './PetTurtleAssets';
import type { TurtlePoint, TurtleTree, TurtleVisualState, TurtlePart } from './PetTurtleAssetTypes';

export type TurtleDrawPart = Readonly<{ part: TurtlePart; ownerPath: string; x: number; y: number }>;
/** Snapshot selection is supplied by the runtime. No tick, action, or lifetime is advanced here. */
export function turtleDrawParts(state: TurtleVisualState,
  owners: Readonly<Record<string, TurtlePoint>> = {}): readonly TurtleDrawPart[] {
  const points = turtleOwnerOrigins(state);
  for (const path of Object.keys(owners)) if (!state.groups.some(g => g.ownerPath === path)) {
    throw new Error(`Unknown turtle projection owner ${path}`);
  }
  return state.groups.flatMap(group => {
    const moved = owners[group.ownerPath], original = points.get(group.ownerPath);
    if (moved && !original) throw new Error(`Missing turtle registration ${group.ownerPath}`);
    const dx = moved ? moved.x - original!.x : 0, dy = moved ? moved.y - original!.y : 0;
    if (!Number.isInteger(dx) || !Number.isInteger(dy)) throw new Error('Turtle raster translation must be integral');
    return group.paintParts.map(part => ({ part, ownerPath: group.ownerPath,
      x: part.origin.x + dx, y: part.origin.y + dy }));
  });
}
export function turtleOwnerOrigins(state: TurtleVisualState): ReadonlyMap<string, TurtlePoint> {
  const result = new Map<string, TurtlePoint>();
  if (state.sourceTrace.root) result.set('root', state.sourceTrace.root);
  const visit = (tree: TurtleTree, parent = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }) => {
    const m = tree.matrix;
    const world = { a: parent.a * m.a + parent.c * m.b, b: parent.b * m.a + parent.d * m.b,
      c: parent.a * m.c + parent.c * m.d, d: parent.b * m.c + parent.d * m.d,
      tx: parent.a * m.tx + parent.c * m.ty + parent.tx, ty: parent.b * m.tx + parent.d * m.ty + parent.ty };
    result.set(tree.path, { x: world.tx, y: world.ty });
    for (const child of tree.children) visit(child, world);
  };
  if (state.sourceTrace.display) visit(state.sourceTrace.display);
  // A standalone effect root already carries its authoritative sourceTrace.root.
  return result;
}

/** Integer compositor used by the production presenter and native-oracle tests. */
export function renderTurtleState(assets: PetTurtleAssets, state: TurtleVisualState,
  owners: Readonly<Record<string, TurtlePoint>> = {}, width = 940, height = 590,
  viewport: TurtlePoint = { x: 0, y: 0 }): Uint8Array {
  if (!Number.isInteger(viewport.x) || !Number.isInteger(viewport.y)) throw new Error('Turtle raster viewport must be integral');
  const canvas = new Uint8Array(width * height * 4);
  let left = width, top = height, right = 0, bottom = 0;
  for (const draw of turtleDrawParts(state, owners)) {
    const { part } = draw, x = draw.x - viewport.x, y = draw.y - viewport.y;
    const image = assets.images.get(part.image);
    if (!image) throw new Error(`Missing turtle RGBA ${part.image}`);
    const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(width, x + image.width), y1 = Math.min(height, y + image.height);
    left = Math.min(left, x0); top = Math.min(top, y0); right = Math.max(right, x1); bottom = Math.max(bottom, y1);
    for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) {
      const src = ((py - y) * image.width + px - x) * 4, dest = (py * width + px) * 4;
      const alpha = image.rgba[src + 3]!, inverse = 256 - alpha;
      for (let c = 0; c < 3; c++) canvas[dest + c] = Math.floor((image.rgba[src + c]! * alpha + 255) / 256)
        + Math.floor(canvas[dest + c]! * inverse / 256);
      canvas[dest + 3] = alpha + Math.floor(canvas[dest + 3]! * inverse / 256);
    }
  }
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    const i = (y * width + x) * 4, alpha = Math.max(canvas[i + 3]!, 1);
    for (let c = 0; c < 3; c++) canvas[i + c] = Math.min(255, Math.floor(canvas[i + c]! * 256 / alpha));
  }
  return canvas;
}
