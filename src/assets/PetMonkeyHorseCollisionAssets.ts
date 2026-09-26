/** Lossless AIR raster fields. World bounds and projectile lifetime belong to the caller. */
type Point = Readonly<{ x: number; y: number }>;
type Field = Readonly<{
  id: number; sign: number; width: number; height: number;
  originX: number; originY: number; symbol: string; phaseKey: string; planes: readonly string[];
  bounds: Point & Readonly<{ width: number; height: number }>;
}>;
export type MonkeyHorseCollisionPackage = Readonly<{
  version: number;
  families: Record<'monkey' | 'horse', Readonly<{
    fields: Record<string, Field>;
    profiles: Record<string, Record<string, number>>;
    nativeTargets: Record<string, readonly string[]>;
  }>>;
  planes: Record<string, Readonly<{ width: number; height: number; bits: string }>>;
  runtimeTargets: readonly (readonly string[])[];
  monsterTargets: Readonly<{
    mappings: readonly Readonly<{ monsterId: number; symbol: string }>[];
    symbols: readonly Readonly<{ symbol: string; characterId: number }>[];
  }>;
}>;
export type MonkeyHorseCollisionSample = Readonly<{
  family: 'monkey' | 'horse'; symbol: string; nativeTick: number; direction: -1 | 1;
  sourceRoot: Point; targetDraw: Point;
  target: Readonly<{ kind: 'native'; symbol: string }> | Readonly<{ kind: 'runtime'; index: number }>;
  intersection: Point & Readonly<{ width: number; height: number }>;
}>;
const modulo = (n: number, d: number) => ((n % d) + d) % d;
const roundEven = (n: number) => {
  const floor = Math.floor(n);
  return n - floor === 0.5 ? floor + modulo(floor, 2) : Math.round(n);
};
type Plane = Readonly<{ width: number; height: number; packed: Uint8Array }>;

export class PetMonkeyHorseCollisionAssets {
  private readonly decoded = new Map<string, Plane>();
  constructor(readonly data: MonkeyHorseCollisionPackage) {
    if (data.version !== 1) throw new Error('Unsupported monkey/horse collision package');
  }

  fieldAt(family: 'monkey' | 'horse', symbol: string, nativeTick: number, direction: -1 | 1): Field {
    const source = this.data.families[family];
    const id = source.profiles[symbol]?.[nativeTick];
    const field = id === undefined ? undefined : source.fields[`${id}:${direction}`];
    // Unknown lifetime phases must never silently reuse the final observed frame.
    if (!field) throw new Error(`Unknown ${family} collision phase ${symbol}/${nativeTick}/${direction}`);
    return field;
  }

  private plane(id: string | undefined): Plane {
    if (!id) throw new Error('Missing monkey/horse collision plane reference');
    let result = this.decoded.get(id);
    if (!result) {
      const record = this.data.planes[id];
      if (!record) throw new Error(`Missing monkey/horse collision plane ${id}`);
      const packed = Uint8Array.from(atob(record.bits), c => c.charCodeAt(0));
      if (packed.length !== Math.ceil(record.width * record.height / 8)) throw new Error(`Invalid collision plane ${id}`);
      result = { width: record.width, height: record.height, packed };
      this.decoded.set(id, result);
    }
    return result;
  }

  hit(row: MonkeyHorseCollisionSample): boolean {
    const width = Math.trunc(row.intersection.width), height = Math.trunc(row.intersection.height);
    if (width < 1 || height < 1) return false;
    const field = this.fieldAt(row.family, row.symbol, row.nativeTick, row.direction);
    const tx = Math.trunc(roundEven((row.sourceRoot.x - row.intersection.x) * 20) / 5);
    const ty = Math.trunc(roundEven((row.sourceRoot.y - row.intersection.y) * 20) / 5);
    const source = this.plane(field.planes[modulo(ty, 4) * 4 + modulo(tx, 4)]);
    const targetX = Math.trunc(row.targetDraw.x * 20), targetY = Math.trunc(row.targetDraw.y * 20);
    const targets = row.target.kind === 'native'
      ? this.data.families[row.family].nativeTargets[row.target.symbol]
      : this.data.runtimeTargets[row.target.index];
    const target = this.plane(targets?.[modulo(targetY, 20) * 20 + modulo(targetX, 20)]);
    const sx = field.originX - Math.floor(tx / 4), sy = field.originY - Math.floor(ty / 4);
    const dx = 150 - Math.floor(targetX / 20), dy = 150 - Math.floor(targetY / 20);
    // Native getColorBoundsRect omits an isolated matching pixel at linear index zero.
    for (let y = 0; y < height; y++) for (let x = y === 0 ? 1 : 0; x < width; x++) {
      if (pixel(source, x + sx, y + sy) && pixel(target, x + dx, y + dy)) return true;
    }
    return false;
  }
}

function pixel(plane: Plane, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= plane.width || y >= plane.height) return false;
  const index = y * plane.width + x;
  return ((plane.packed[index >> 3]! >> (7 - (index & 7))) & 1) !== 0;
}
