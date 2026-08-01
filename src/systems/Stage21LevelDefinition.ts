import {
  stage21HeroSpawns,
  stage21TransferDoor,
  STAGE21_WORLD_HEIGHT,
  STAGE21_WORLD_LEFT,
  STAGE21_WORLD_WIDTH,
} from './Stage21Layout';
import type { PlayableLevelDefinition } from './PlayableLevelDefinition';

export const stage21LevelDefinition: PlayableLevelDefinition = {
  id: 'stage-2-1', sceneKey: 'Stage21Scene', assetBundle: 'stage-2-1',
  worldBounds: { left: STAGE21_WORLD_LEFT, top: 0, width: STAGE21_WORLD_WIDTH, height: STAGE21_WORLD_HEIGHT },
  heroSpawns: stage21HeroSpawns,
  transferDoor: { visualId: 'stage21-transfer-door', bounds: {
    left: stage21TransferDoor.x + stage21TransferDoor.sourceBounds.left,
    right: stage21TransferDoor.x + stage21TransferDoor.sourceBounds.right,
    top: stage21TransferDoor.y + stage21TransferDoor.sourceBounds.top,
    bottom: stage21TransferDoor.y + stage21TransferDoor.sourceBounds.bottom,
  } },
  unlockTarget: { unlockedStage: 2, unlockedLevel: 2 },
  routes: { retry: 'Stage21Scene', next: 'Stage22Scene', back: 'HeavenMapScene' },
};
