import data from './pet-passive.generated.json';
import type { PetPassiveVisualSignal } from '../systems/PetPassiveSession';

export type PetPassiveEffect = PetPassiveVisualSignal['name'];
export const petPassiveImages = data.images;
type Pose = { key: string; x: number; y: number; width: number; height: number };
const poses: Readonly<Record<string, Pose>> = data.poses;
export function petPassiveEndFrame(effect: PetPassiveEffect): number {
  return effect === 'sxkb' || effect === 'fsnl' ? 100 : effect === 'smjc' || effect === 'mfjc' ? 20 : 25;
}
export function petPassiveProfile(species: string, form: number): string {
  if (!Number.isInteger(form) || form < 1 || form > 4) throw new Error(`Unsupported passive form ${form}`);
  if (species === 'monkey' || species === 'horse') return species + form;
  // Original ObjectBaseSprite/3/4 identity, independently checked against 244.
  if (species === 'dragon') return form === 1 ? 'monkey1' : 'monkey2';
  if (species === 'turtle') return form === 1 ? 'monkey1' : form === 2 ? 'monkey2' : 'monkey3';
  throw new Error(`Unsupported passive profile ${species}`);
}

export function petPassivePose(effect: PetPassiveEffect, profile: string, frame: number,
  nested: number, sign: number, x: number, y: number) {
  if ((sign !== -1 && sign !== 1) || !Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Unsupported passive native transform');
  const prefix = `${effect}:${profile}:${frame}:${nested}:${sign < 0 ? -1 : 1}:`;
  const fx = x - Math.floor(x), fy = y - Math.floor(y);
  const exact = poses[prefix + `${fx}:${fy}`];
  const pose = exact ?? poses[prefix + '0:0'];
  if (!pose) throw new Error(`Missing passive native pose ${prefix}${fx}:${fy}`);
  // Native observed phases are exact. Unobserved positions are explicitly
  // pixel-aligned (<= .5px per axis), never rescaled from a different profile.
  const originX = exact ? Math.floor(x) : Math.round(x);
  const originY = exact ? Math.floor(y) : Math.round(y);
  return { ...pose, x: originX + pose.x, y: originY + pose.y,
    alignment: exact ? 'native-phase' as const : 'pixel-aligned' as const,
    offsetX: exact ? 0 : originX - x, offsetY: exact ? 0 : originY - y };
}
