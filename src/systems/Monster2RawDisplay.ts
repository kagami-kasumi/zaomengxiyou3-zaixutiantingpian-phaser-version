import type { Monster2RawSpawn } from './Monster2AttackRuntime';

export type Monster2RawDisplay = Omit<Monster2RawSpawn, 'parentId'> & {
  parentId?: string; frame: number; age: number; destroyed: boolean;
};
export function createMonster2RawDisplay(spawn: Monster2RawSpawn): Monster2RawDisplay {
  return { ...spawn, frame: 1, age: 0, destroyed: false };
}
/** The first ENTER after birth still observes frame1. This clock is independent of world pause. */
export function enterMonster2RawDisplay(raw: Monster2RawDisplay): void {
  if (!raw.destroyed) raw.frame = Math.min(14, ++raw.age);
}
export function exitMonster2RawDisplay(raw: Monster2RawDisplay): void {
  if (raw.frame === 14) destroyMonster2RawDisplay(raw);
}
export function destroyMonster2RawDisplay(raw: Monster2RawDisplay): void {
  raw.parentId = undefined; raw.destroyed = true;
}
