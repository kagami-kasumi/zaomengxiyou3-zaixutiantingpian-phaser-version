import data from '../assets/monster2-collision.json';
import { createNativeAttackCollision } from './NativeAttackCollision';

const query = createNativeAttackCollision(data, true);
type Point = Readonly<{ x: number; y: number }>;

export function monster2TargetProfile(sourceType: string): string {
  const profile = data.profiles.find(profile => profile.types.includes(sourceType));
  if (!profile) throw new Error(`Unverified Monster2 collision target ${sourceType}`);
  return profile.id;
}

export function sampleMonster2Collision(attack: 1 | 2, frame: number, scaleSign: -1 | 1,
  sourceRoot: Point, profileId: string, targetRoot: Point,
  inspectPixel?: (x: number, y: number, hit: boolean) => void): boolean {
  return query.sample(`a${attack}-f${frame}-s${scaleSign}`, sourceRoot, profileId, targetRoot, inspectPixel);
}

export function monster2AttackBounds(attack: 1 | 2, frame: number, scaleSign: -1 | 1, root: Point) {
  return query.attackBounds(`a${attack}-f${frame}-s${scaleSign}`, root);
}
