import type { TurtleCollisionPackage, TurtleCollisionSample } from './PetTurtleAssetTypes';

const modulo = (n: number, d: number) => ((n % d) + d) % d;
// Frozen source sampler uses ties-to-even at the twip boundary, not JS's ties-up.
const roundEven = (n: number) => {
  const floor = Math.floor(n), remainder = n - floor;
  return remainder === 0.5 ? floor + modulo(floor, 2) : Math.round(n);
};

export class PetTurtleCollisionAssets {
  private readonly decoded = new Map<string, Readonly<{ width: number; height: number; bits: Uint8Array }>>();
  private readonly fields;
  constructor(readonly data: TurtleCollisionPackage) {
    this.fields = new Map(data.fields.map(field => [field.id, field]));
    if (this.fields.size !== data.fields.length) throw new Error('Duplicate turtle collision field');
    for (const [key, id] of Object.entries(data.mapping)) {
      if (!data.planes[id]) throw new Error(`Missing turtle collision plane ${key}`);
    }
    const tiles = new Set(Object.keys(data.mapping).filter(key => key.startsWith('tiles/'))
      .map(key => key.slice(0, key.lastIndexOf('-'))));
    for (const tile of tiles) for (let phase = 0; phase < 16; phase++) {
      if (!data.mapping[`${tile}-${phase}`]) throw new Error(`Missing turtle tile phase ${tile}-${phase}`);
    }
    for (const field of data.fields) {
      if (!Number.isInteger(field.originX) || !Number.isInteger(field.originY)) throw new Error(`Missing turtle collision origin ${field.id}`);
      if (field.layout === 'plane') for (let phase = 0; phase < 16; phase++) this.plane(`fields/${field.id}-${phase}`);
    }
    const targets = new Set(Object.keys(data.mapping).filter(key => key.startsWith('targets/'))
      .map(key => key.slice(0, key.lastIndexOf('-'))));
    for (const target of targets) for (let phase = 0; phase < 400; phase++) {
      if (!data.mapping[`${target}-${phase}`]) throw new Error(`Missing turtle target phase ${target}-${phase}`);
    }
  }
  fieldAt(symbol: string, nativeTick: number, scale: 1 | 2, sign: -1 | 1): string {
    const profile = this.data.profiles.find(p => p.symbol === symbol);
    const phase = profile?.fixture.phaseMap[symbol]?.[nativeTick];
    if (!profile?.scales.includes(scale) || phase === undefined) throw new Error(`Unknown turtle recursive phase ${symbol}/${nativeTick}/${scale}`);
    const id = `${symbol}-${phase}-s${scale}-d${sign}`;
    if (!this.fields.has(id)) throw new Error(`Missing turtle field ${id}`);
    return id;
  }
  plane(key: string) {
    const id = this.data.mapping[key];
    if (!id) throw new Error(`Missing turtle collision phase ${key}`);
    let result = this.decoded.get(id);
    if (!result) {
      const record = this.data.planes[id]!;
      const packed = Uint8Array.from(atob(record.bits), c => c.charCodeAt(0));
      const size = record.width * record.height;
      if (packed.length !== Math.ceil(size / 8)) throw new Error(`Invalid turtle plane length ${key}`);
      const bits = new Uint8Array(size);
      for (let i = 0; i < size; i++) bits[i] = (packed[i >> 3]! >> (7 - (i & 7))) & 1;
      result = { width: record.width, height: record.height, bits };
      this.decoded.set(id, result);
    }
    return result;
  }
  sample(row: TurtleCollisionSample): Readonly<{ width: number; height: number; bits: Uint8Array; hit: boolean }> {
    const width = Math.trunc(row.intersection.width), height = Math.trunc(row.intersection.height);
    if (width < 1 || height < 1) return { width: 0, height: 0, bits: new Uint8Array(), hit: false };
    const field = this.fields.get(row.field);
    if (!field) throw new Error(`Unknown turtle collision field ${row.field}`);
    const tx = Math.trunc(roundEven((row.sourceRoot.x - row.intersection.x) * 20) / 5);
    const ty = Math.trunc(roundEven((row.sourceRoot.y - row.intersection.y) * 20) / 5);
    const ix = Math.floor(tx / 4), iy = Math.floor(ty / 4), phase = modulo(ty, 4) * 4 + modulo(tx, 4);
    const source = field.layout === 'plane' ? this.plane(`fields/${field.id}-${phase}`) : undefined;
    const targetX = row.targetDraw ? Math.trunc(row.targetDraw.x * 20) : 0;
    const targetY = row.targetDraw ? Math.trunc(row.targetDraw.y * 20) : 0;
    const target = row.targetDraw ? this.plane(`targets/t${row.targetIndex}-${modulo(targetY, 20) * 20 + modulo(targetX, 20)}`) : undefined;
    const bits = new Uint8Array(width * height); let hit = false;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      let value = 0;
      if (source) value = pixel(source, x + field.originX! - ix, y + field.originY! - iy);
      else {
        const sx = x - ix, sy = y - iy, cx = Math.floor(sx / 128), cy = Math.floor(sy / 128);
        const key = `tiles/${field.id}-${cx}-${cy}-${phase}`;
        // Sparse tiles outside the recorded field are transparent. Missing phases
        // inside a recorded tile are corruption, not an empty collision shape.
        if (this.data.mapping[key]) value = pixel(this.plane(key), modulo(sx, 128), modulo(sy, 128));
      }
      if (value && target) value &= pixel(target, x + 150 - Math.floor(targetX / 20), y + 150 - Math.floor(targetY / 20));
      bits[y * width + x] = value; hit ||= value !== 0;
    }
    return { width, height, bits, hit };
  }
}
function pixel(plane: Readonly<{ width: number; height: number; bits: Uint8Array }>, x: number, y: number): number {
  return x < 0 || y < 0 || x >= plane.width || y >= plane.height ? 0 : plane.bits[y * plane.width + x]!;
}
