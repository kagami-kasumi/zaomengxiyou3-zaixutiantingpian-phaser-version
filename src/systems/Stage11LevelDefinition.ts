import {
  STAGE11_WORLD_HEIGHT,
  STAGE11_WORLD_WIDTH,
  stage11TransferDoor,
} from './Stage11Layout';
import type { PlayableLevelDefinition } from './PlayableLevelDefinition';

export const stage11LevelDefinition: PlayableLevelDefinition = {
  id: 'stage-1-1',
  sceneKey: 'TestScene',
  assetBundle: 'stage-11',
  worldBounds: { left: 0, top: 0, width: STAGE11_WORLD_WIDTH, height: STAGE11_WORLD_HEIGHT },
  heroSpawns: [
    { slot: 'p1', x: 320, y: 0 },
    { slot: 'p2', x: 545, y: 0 },
  ],
  transferDoor: {
    visualId: 'stage11-transfer-door',
    bounds: stage11TransferDoor.bounds,
  },
  unlockTarget: { unlockedStage: 1, unlockedLevel: 2 },
  routes: { retry: 'TestScene', next: 'Stage12Scene', back: 'HeavenMapScene' },
};

export function isStage11DoorQaEnabled(search: string, hostname: string): boolean {
  const local = hostname === '127.0.0.1' || hostname === 'localhost';
  return local && new URLSearchParams(search).get('qaStage') === '1-1-door';
}
