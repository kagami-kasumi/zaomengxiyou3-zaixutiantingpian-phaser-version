import display from './pet-reception-body-display.json';
import type { PetReceptionBodyForm } from '../systems/PetReceptionBodyClock';

export const petReceptionBodyImages = display.poses;
const poses = new Map(display.poses.map(pose => [pose.id, pose]));

/** Direct is the original BBDC 0/1 value; each image already contains mirroring. */
export function getPetReceptionBodyPose(form: PetReceptionBodyForm, action: 'hurt' | 'dead',
  row: number, column: number, direct: 0 | 1) {
  const id = `${form}-${action}-r${row}-x${column}-d${direct}`;
  const pose = poses.get(id);
  if (!pose) throw new Error(`Unverified pet reception body pose: ${id}`);
  return pose;
}
