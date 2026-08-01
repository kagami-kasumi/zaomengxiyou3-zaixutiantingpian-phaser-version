import {
  stage12HeroSpawns,
  stage12TransferDoor,
  STAGE12_WORLD_HEIGHT,
  STAGE12_WORLD_LEFT,
  STAGE12_WORLD_WIDTH,
} from './Stage12Layout';
import type { PlayableLevelDefinition } from './PlayableLevelDefinition';

export const stage12LevelDefinition: PlayableLevelDefinition = {
  id: 'stage-1-2', sceneKey: 'Stage12Scene', assetBundle: 'stage-1-2',
  worldBounds: { left: STAGE12_WORLD_LEFT, top: 0, width: STAGE12_WORLD_WIDTH, height: STAGE12_WORLD_HEIGHT },
  heroSpawns: stage12HeroSpawns,
  transferDoor: { visualId: 'stage12-transfer-door', bounds: {
    left: stage12TransferDoor.x + stage12TransferDoor.sourceBounds.left,
    right: stage12TransferDoor.x + stage12TransferDoor.sourceBounds.right,
    top: stage12TransferDoor.y + stage12TransferDoor.sourceBounds.top,
    bottom: stage12TransferDoor.y + stage12TransferDoor.sourceBounds.bottom,
  } },
  unlockTarget: { unlockedStage: 1, unlockedLevel: 3 },
  routes: { retry: 'Stage12Scene', next: 'Stage13Scene', back: 'HeavenMapScene' },
};
