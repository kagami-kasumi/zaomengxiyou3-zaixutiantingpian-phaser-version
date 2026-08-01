import {
  stage13HeroSpawns,
  stage13TransferDoor,
  STAGE13_WORLD_HEIGHT,
  STAGE13_WORLD_LEFT,
  STAGE13_WORLD_WIDTH,
} from './Stage13Layout';
import type { PlayableLevelDefinition } from './PlayableLevelDefinition';

export const stage13LevelDefinition: PlayableLevelDefinition = {
  id: 'stage-1-3', sceneKey: 'Stage13Scene', assetBundle: 'stage-1-3',
  worldBounds: { left: STAGE13_WORLD_LEFT, top: 0, width: STAGE13_WORLD_WIDTH, height: STAGE13_WORLD_HEIGHT },
  heroSpawns: stage13HeroSpawns,
  transferDoor: { visualId: 'stage13-transfer-door', bounds: {
    left: stage13TransferDoor.x + stage13TransferDoor.sourceBounds.left,
    right: stage13TransferDoor.x + stage13TransferDoor.sourceBounds.right,
    top: stage13TransferDoor.y + stage13TransferDoor.sourceBounds.top,
    bottom: stage13TransferDoor.y + stage13TransferDoor.sourceBounds.bottom,
  } },
  unlockTarget: { unlockedStage: 2, unlockedLevel: 1 },
  routes: { retry: 'Stage13Scene', next: 'Stage21Scene', back: 'HeavenMapScene' },
};
