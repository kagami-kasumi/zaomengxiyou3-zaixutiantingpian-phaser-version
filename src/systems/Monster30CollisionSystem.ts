import data from '../assets/monster30-collision.json';
import { createNativeAttackCollision } from './NativeAttackCollision';
type Point = Readonly<{ x: number; y: number }>;
const query = createNativeAttackCollision(data);

export function monster30TargetProfile(sourceType: string): string {
  const profile = data.profiles.find(profile => profile.types.includes(sourceType));
  if (!profile) throw new Error(`Unverified Monster30 collision target ${sourceType}`);
  return profile.id;
}

export function monster30PetTargetProfile(species: string, form: number): string {
  const sourceName = species === 'ufo' ? 'Kabu' : species === 'tigress' ? 'Tiger' : `${species[0]!.toUpperCase()}${species.slice(1)}`;
  return monster30TargetProfile(`Pet${sourceName}${form}`);
}

export function sampleMonster30Collision(frame: number, scaleSign: -1 | 1,
  sourceRoot: Point, profileId: string, targetRoot: Point): boolean {
  return query.sample(`f${frame}-s${scaleSign}`, sourceRoot, profileId, targetRoot);
}
export function monster30AttackBounds(frame: number, scaleSign: -1 | 1, root: Point) {
  return query.attackBounds(`f${frame}-s${scaleSign}`, root);
}
