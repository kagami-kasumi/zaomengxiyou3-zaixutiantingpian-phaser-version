import type { TurtlePixels } from './PetTurtleAssetTypes';

export async function inflateTurtleBytes(bytes: Uint8Array, format: 'gzip' | 'deflate'): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes.length); copy.set(bytes);
  return new Uint8Array(await new Response(new Blob([copy]).stream()
    .pipeThrough(new DecompressionStream(format))).arrayBuffer());
}

/** RGBA8/non-interlaced is the verified delivery profile. Avoid Canvas alpha round trips. */
export async function decodeTurtlePng(bytes: Uint8Array): Promise<TurtlePixels> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0) !== 0x89504e47 || view.getUint32(4) !== 0x0d0a1a0a) throw new Error('Invalid turtle PNG');
  let width = 0, height = 0, ended = false;
  const chunks: Uint8Array[] = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = view.getUint32(offset), end = offset + length + 12;
    if (end > bytes.length) throw new Error('Truncated turtle PNG');
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = view.getUint32(offset + 8); height = view.getUint32(offset + 12);
      if (length !== 13 || data[8] !== 8 || data[9] !== 6 || data[10] || data[11] || data[12]) {
        throw new Error('Unsupported turtle PNG profile');
      }
    } else if (type === 'IDAT') chunks.push(data);
    else if (type === 'IEND') { ended = true; break; }
    offset = end;
  }
  if (!width || !height || !ended || !chunks.length) throw new Error('Incomplete turtle PNG');
  const compressed = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0; for (const chunk of chunks) { compressed.set(chunk, at); at += chunk.length; }
  const raw = await inflateTurtleBytes(compressed, 'deflate'), stride = width * 4;
  if (raw.length !== (stride + 1) * height) throw new Error('Turtle PNG scanline size mismatch');
  const rgba = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!;
    if (filter > 4) throw new Error('Invalid turtle PNG filter');
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= 4 ? rgba[i - 4]! : 0;
      const b = y ? rgba[i - stride]! : 0, c = y && x >= 4 ? rgba[i - stride - 4]! : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b
        : filter === 3 ? Math.floor((a + b) / 2) : pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      rgba[i] = (raw[y * (stride + 1) + x + 1]! + predictor) & 255;
    }
  }
  return { width, height, rgba };
}
