import {
  stage22HeroSpawns,
  stage22TransferDoor,
  STAGE22_WORLD_HEIGHT,
  STAGE22_WORLD_LEFT,
  STAGE22_WORLD_WIDTH,
} from './Stage22Layout';
import type { PlayableLevelDefinition } from './PlayableLevelDefinition';

export const stage22LevelDefinition: PlayableLevelDefinition = {
  id: 'stage-2-2', sceneKey: 'Stage22Scene', assetBundle: 'stage-2-2',
  worldBounds: { left: STAGE22_WORLD_LEFT, top: 0, width: STAGE22_WORLD_WIDTH, height: STAGE22_WORLD_HEIGHT },
  heroSpawns: stage22HeroSpawns,
  transferDoor: { visualId: 'stage22-transfer-door', bounds: {
    left: stage22TransferDoor.x + stage22TransferDoor.sourceBounds.left,
    right: stage22TransferDoor.x + stage22TransferDoor.sourceBounds.right,
    top: stage22TransferDoor.y + stage22TransferDoor.sourceBounds.top,
    bottom: stage22TransferDoor.y + stage22TransferDoor.sourceBounds.bottom,
  } },
  unlockTarget: { unlockedStage: 2, unlockedLevel: 3 },
  routes: { retry: 'Stage22Scene', next: 'HeavenMapScene', back: 'HeavenMapScene' },
};
