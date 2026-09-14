import contract from '../../docs/tasks/evidence/TASK-SETTINGS-219/collision-contract.json';
import pack from '../../docs/tasks/evidence/TASK-SETTINGS-219/runtime-mask-pack.json';
import { toDragonSourceCoordinate, type DragonCollisionBounds } from './PetDragonCollisionSystem';

if (contract.status !== 'verified' || contract.sampling.status !== 'approved-approximation') {
  throw new Error('Dragon effects require verified source facts and an explicit approved sampling contract');
}

const frames = new Map(contract.frames.map(frame => [`${frame.symbol}/${frame.frame}`, frame]));
const decoded = new Map<string, Uint8Array>();
const fields: Record<string, { width: number; height: number; originX: number; originY: number;
  quarterPhasePlaneIds: string[] }> = pack.fields;
const planes: Record<string, { size: number; spans: number[] }> = pack.planes;

function plane(id: string): Uint8Array {
  let bits = decoded.get(id);
  if (!bits) {
    const source = planes[id]!;
    bits = new Uint8Array(source.size);
    for (let i = 0; i < source.spans.length; i += 2) {
      bits.fill(1, source.spans[i], source.spans[i]! + source.spans[i + 1]!);
    }
    decoded.set(id, bits);
  }
  return bits;
}

/** 219's approved finite phase approximation, never claimed to reproduce all AIR pixels. */
export function sampleDragonEffectCollision(symbol: string, frame: number,
  root: Readonly<{ x: number; y: number }>, facingX: -1 | 1, target: DragonCollisionBounds) {
  const source = frames.get(`${symbol}/${frame}`);
  if (!source) throw new Error(`Missing verified dragon collision ${symbol}/${frame}`);
  if (source.blank) return { hit: false, pixels: 0 };
  const direction = source.directions[facingX === -1 ? 'left' : 'right'];
  const bx = toDragonSourceCoordinate(root.x) + direction.bounds.left;
  const by = toDragonSourceCoordinate(root.y) + direction.bounds.top;
  const x = Math.max(bx, target.x), y = Math.max(by, target.y);
  const width = Math.floor(Math.min(bx + direction.bounds.width, target.x + target.width) - x);
  const height = Math.floor(Math.min(by + direction.bounds.height, target.y + target.height) - y);
  if (width < 1 || height < 1) return { hit: false, pixels: 0 };
  const qx = Math.trunc(Math.round((toDragonSourceCoordinate(root.x) - x) * 20) / 5);
  const qy = Math.trunc(Math.round((toDragonSourceCoordinate(root.y) - y) * 20) / 5);
  const field = fields[direction.fieldId]!;
  const bits = plane(field.quarterPhasePlaneIds[((qy % 4 + 4) % 4) * 4 + (qx % 4 + 4) % 4]!);
  const offsetX = field.originX - Math.floor(qx / 4), offsetY = field.originY - Math.floor(qy / 4);
  let pixels = 0;
  for (let row = 0; row < height; row++) {
    const sy = row + offsetY;
    if (sy < 0 || sy >= field.height) continue;
    for (let column = 0; column < width; column++) {
      const sx = column + offsetX;
      if (sx >= 0 && sx < field.width) pixels += bits[sy * field.width + sx]!;
    }
  }
  return { hit: pixels > 0, pixels };
}
