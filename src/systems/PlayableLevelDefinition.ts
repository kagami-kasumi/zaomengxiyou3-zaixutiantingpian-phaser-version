import type { PlayerSlot } from './InputSystem';

export type PlayableLevelDefinition = Readonly<{
  id: string;
  sceneKey: string;
  assetBundle: string;
  worldBounds: Readonly<{ left: number; top: number; width: number; height: number }>;
  heroSpawns: readonly Readonly<{ slot: PlayerSlot; x: number; y: number }>[];
  transferDoor: Readonly<{
    visualId: string;
    bounds: Readonly<{ left: number; top: number; right: number; bottom: number }>;
  }>;
  unlockTarget: Readonly<{ unlockedStage: number; unlockedLevel: number }>;
  routes: Readonly<{ retry: string; next: string; back: string }>;
}>;

export function validatePlayableLevelDefinition(definition: PlayableLevelDefinition): void {
  if (!definition.id || !definition.sceneKey || !definition.assetBundle) {
    throw new Error('Playable level identity, scene key, and asset bundle are required.');
  }
  const world = definition.worldBounds;
  if (![world.left, world.top, world.width, world.height].every(Number.isFinite)
      || world.width <= 0 || world.height <= 0) {
    throw new Error(`Playable level ${definition.id} has invalid world bounds.`);
  }
  if (definition.heroSpawns.length < 2
      || definition.heroSpawns[0]?.slot !== 'p1'
      || definition.heroSpawns[1]?.slot !== 'p2') {
    throw new Error(`Playable level ${definition.id} must declare ordered P1/P2 spawns.`);
  }
  const door = definition.transferDoor.bounds;
  if (!definition.transferDoor.visualId || door.right <= door.left || door.bottom <= door.top) {
    throw new Error(`Playable level ${definition.id} has an invalid transfer door.`);
  }
  if (!definition.routes.retry || !definition.routes.next || !definition.routes.back) {
    throw new Error(`Playable level ${definition.id} must declare retry, next, and back routes.`);
  }
}
