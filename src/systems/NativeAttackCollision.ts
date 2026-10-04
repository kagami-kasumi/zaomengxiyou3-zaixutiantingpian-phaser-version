export type NativeCollisionData = Readonly<{ fields: readonly Readonly<{
  id: string; bounds: Readonly<{ x: number; y: number; width: number; height: number }>;
  width: number; height: number; originX: number; originY: number;
  phases: readonly number[]; planes: readonly string[];
}>[] }>;

type Point = Readonly<{ x: number; y: number }>;
type Bounds = Point & Readonly<{ width: number; height: number }>;
type Field = NativeCollisionData['fields'][number];
export function createNativeAttackCollision(data: NativeCollisionData, worldBoundsInTwips = false) {
const fields = new Map(data.fields.map(field => [field.id, field]));
const decoded = new Map<string, readonly Uint8Array[]>();

function field(id: string): Field {
  const result = fields.get(id);
  if (!result) throw new Error(`Unverified native collision field ${id}`);
  return result;
}

function planes(f: Field): readonly Uint8Array[] {
  let result = decoded.get(f.id);
  if (!result) {
    result = f.planes.map(encoded => Uint8Array.from(atob(encoded), char => char.charCodeAt(0)));
    decoded.set(f.id, result);
  }
  return result;
}

function bounds(f: Field, root: Point): Bounds {
  if (worldBoundsInTwips) {
    // Native getBounds reports world twip edges; adding separately serialized
    // local bounds can otherwise turn a one-pixel ROI into 0.9999999999999.
    const twip = (value: number) => Math.round(value * 20) / 20;
    const x = twip(root.x + f.bounds.x), y = twip(root.y + f.bounds.y);
    return { x, y, width: twip(root.x + f.bounds.x + f.bounds.width) - x,
      height: twip(root.y + f.bounds.y + f.bounds.height) - y };
  }
  return { x: root.x + f.bounds.x, y: root.y + f.bounds.y,
    width: f.bounds.width, height: f.bounds.height };
}

function sampler(f: Field, root: Point, q: Point): (x: number, y: number) => boolean {
  // The exact finite native comparison calibrates signed quarter-pixel
  // truncation. The approved residual list is not a general pixel tolerance.
  const tx = Math.trunc(Math.round((root.x - q.x) * 20) / 5) * 5;
  const ty = Math.trunc(Math.round((root.y - q.y) * 20) / 5) * 5;
  const ix = Math.floor(tx / 20), iy = Math.floor(ty / 20);
  const phase = (ty - iy * 20) * 20 + tx - ix * 20;
  const bits = planes(f)[f.phases[phase]!]!;
  return (x, y) => {
    x += f.originX - ix; y += f.originY - iy;
    if (x < 0 || y < 0 || x >= f.width || y >= f.height) return false;
    const offset = y * f.width + x;
    return !!(bits[offset >> 3]! & (1 << (offset & 7)));
  };
}

/** Input roots are source-world registration points, never visible bounds centers. */
function sample(id: string,
  sourceRoot: Point, profileId: string, targetRoot: Point,
  inspectPixel?: (x: number, y: number, hit: boolean) => void): boolean {
  const attack = field(id), target = field(profileId);
  const a = bounds(attack, sourceRoot), b = bounds(target, targetRoot);
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  // BasePet AUtils.testIntersects precedes HitTest. Heroes go directly to
  // HitTest, which also intersects bounds and truncates BitmapData dimensions.
  if (profileId.startsWith('pet-') && (right <= x || bottom <= y)) return false;
  const width = Math.trunc(right - x), height = Math.trunc(bottom - y);
  if (width < 1 || height < 1) return false;
  const sourcePixel = sampler(attack, sourceRoot, { x, y });
  const targetPixel = sampler(target, targetRoot, { x, y });
  let hit = false;
  for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
    const overlap = sourcePixel(px, py) && targetPixel(px, py);
    inspectPixel?.(px, py, overlap);
    // Original bundled AIR getColorBoundsRect excludes the sole origin pixel.
    if ((px !== 0 || py !== 0) && overlap) {
      if (!inspectPixel) return true;
      hit = true;
    }
  }
  return hit;
}

function attackBounds(id: string, root: Point): Bounds {
  return bounds(field(id), root);
}

return { sample, attackBounds };
}
