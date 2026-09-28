import data from '../assets/monster30-collision.json';

type Point = Readonly<{ x: number; y: number }>;
type Bounds = Point & Readonly<{ width: number; height: number }>;
type Field = typeof data.fields[number];
const fields = new Map(data.fields.map(field => [field.id, field]));
const decoded = new Map<string, readonly Uint8Array[]>();

export function monster30TargetProfile(sourceType: string): string {
  const profile = data.profiles.find(profile => profile.types.includes(sourceType));
  if (!profile) throw new Error(`Unverified Monster30 collision target ${sourceType}`);
  return profile.id;
}

export function monster30PetTargetProfile(species: string, form: number): string {
  const sourceName = species === 'ufo' ? 'Kabu' : species === 'tigress' ? 'Tiger' : `${species[0]!.toUpperCase()}${species.slice(1)}`;
  return monster30TargetProfile(`Pet${sourceName}${form}`);
}

function field(id: string): Field {
  const result = fields.get(id);
  if (!result) throw new Error(`Unverified Monster30 collision field ${id}`);
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
  return { x: root.x + f.bounds.x, y: root.y + f.bounds.y,
    width: f.bounds.width, height: f.bounds.height };
}

function sampler(f: Field, root: Point, q: Point): (x: number, y: number) => boolean {
  // The exact finite 241 native comparison calibrates signed quarter-pixel
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
export function sampleMonster30Collision(frame: number, scaleSign: -1 | 1,
  sourceRoot: Point, profileId: string, targetRoot: Point): boolean {
  const attack = field(`f${frame}-s${scaleSign}`), target = field(profileId);
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
  for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
    // Original bundled AIR getColorBoundsRect excludes the sole origin pixel.
    if ((px !== 0 || py !== 0) && sourcePixel(px, py) && targetPixel(px, py)) return true;
  }
  return false;
}

export function monster30AttackBounds(frame: number, scaleSign: -1 | 1, root: Point): Bounds {
  return bounds(field(`f${frame}-s${scaleSign}`), root);
}
