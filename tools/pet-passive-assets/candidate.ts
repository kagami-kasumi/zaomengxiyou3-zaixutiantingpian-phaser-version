/** Rejected 245B candidate. Diagnostic only; never imported by src. */
import manifest from '../../local-resources/regima/task-outputs/TASK-SLICE-245B/projection/candidate.generated.json';

export type PetPassiveEffect = 'sxkb' | 'fsnl' | 'smjc' | 'mfjc' | 'gjjc' | 'fyjc';
type Part = { filters: { type: string; matrix: number[] }[]; bitmap: string; matrix: number[]; fill: number[]; bounds: number[] };
type Clip = { endFrame: number; frames: Part[][] };
const clips: Record<string, Clip> = manifest.clips;
export const petPassiveImages = Object.values(manifest.images);

export function petPassiveClip(effect: PetPassiveEffect, profile: string, direction: 0 | 1): Clip {
  const clip = clips[`${effect}:${profile}:d${direction}`];
  if (!clip) throw new Error(`Missing passive clip ${effect}/${profile}/${direction}`);
  return clip;
}

/** Finite six-effect bitmap projection. Source shape bounds and bitmap matrices stay separate. */
export function drawPetPassiveFrame(context: CanvasRenderingContext2D,
  images: ReadonlyMap<string, CanvasImageSource>, clip: Clip, frame: number,
  x: number, y: number, rootSign = 1, alpha = 1): void {
  const parts = clip.frames[frame - 1];
  if (!parts) return;
  context.save();
  context.translate(x, y); context.scale(rootSign, 1); context.globalAlpha = alpha;
  context.imageSmoothingEnabled = false;
  for (const part of parts) {
    // Deliberately incomplete candidate: retain and assert the source identity
    // filter, but do not pretend this models Flash intermediate rasterization.
    for (const filter of part.filters) {
      if (filter.type !== 'flash.filters::ColorMatrixFilter' || filter.matrix.some((v, i) => v !== ([0, 6, 12, 18].includes(i) ? 1 : 0))) {
        throw new Error('Outside the six-buff identity-filter candidate');
      }
    }
    const source = images.get(part.bitmap);
    if (!source) throw new Error(`Missing passive bitmap ${part.bitmap}`);
    context.save();
    const [a, b, c, d, tx, ty] = part.matrix;
    context.transform(a!, b!, c!, d!, tx!, ty!);
    const [left, top, right, bottom] = part.bounds;
    context.beginPath(); context.rect(left!, top!, right! - left!, bottom! - top!); context.clip();
    const [fa, fb, fc, fd, fx, fy] = part.fill;
    context.transform(fa!, fb!, fc!, fd!, fx!, fy!);
    const bitmap = (manifest.images as Record<string, { width: number; height: number }>)[part.bitmap]!;
    const x0 = Math.floor((left! - fx!) / fa! / bitmap.width), x1 = Math.ceil((right! - fx!) / fa! / bitmap.width);
    const y0 = Math.floor((top! - fy!) / fd! / bitmap.height), y1 = Math.ceil((bottom! - fy!) / fd! / bitmap.height);
    for (let iy = y0; iy < y1; iy++) for (let ix = x0; ix < x1; ix++) {
      context.drawImage(source, ix * bitmap.width, iy * bitmap.height);
    }
    context.restore();
  }
  context.restore();
}
