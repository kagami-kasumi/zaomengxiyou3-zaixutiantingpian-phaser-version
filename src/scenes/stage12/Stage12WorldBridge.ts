import Phaser from 'phaser';
import { Stage12AssetKeys, stage12Assets, stage11Assets } from '../../assets/AssetManifest';
import {
  stage12FbEnter,
  stage12RenderBounds,
  stage12SpawnPoints,
  stage12StopPoints,
  stage12TransferDoor,
  stage12WallMarkers,
} from '../../systems/Stage12Layout';
import { createStage12Cleanup } from '../../systems/Stage12Lifecycle';

export type Stage12WorldHandle = Readonly<{
  root: Phaser.GameObjects.Container;
  floor: Phaser.GameObjects.Image;
  stageScene: Phaser.GameObjects.Container;
  bgContainer: Phaser.GameObjects.Container;
  fbEnter: Phaser.GameObjects.Image;
  transferDoor: Phaser.GameObjects.Image;
  destroyed: () => boolean;
  destroy: () => void;
}>;

export function createStage12World(scene: Phaser.Scene): Stage12WorldHandle {
  const floor = scene.add.image(
    stage12RenderBounds.floor.left,
    stage12RenderBounds.floor.top,
    stage11Assets.floor.key,
  ).setOrigin(0).setScrollFactor(0).setName('floorBg1');
  const root = scene.add.container(0, 0).setName('stage12-root');
  const stageScene = scene.add.container(0, 0).setName('sl12');
  root.add(stageScene);

  // BaseGameSence owns this child container at x=60.75 and inserts bg12 at x=-20.
  // The extracted bitmap begins at source x=-50, so its cropped texture starts at -70.
  const bgContainer = scene.add.container(60.75, 0).setName('bgContainer');
  const background = scene.add.image(-70, 11, Stage12AssetKeys.background)
    .setOrigin(0)
    .setName('bg12');
  bgContainer.add(background);
  stageScene.add(bgContainer);

  const foreground = scene.add.image(-200, 494, Stage12AssetKeys.foreground)
    .setOrigin(0)
    .setName('sl12-foreground');
  const fbEnter = scene.add.image(
    stage12FbEnter.x + stage12FbEnter.sourceBounds.left,
    stage12FbEnter.y + stage12FbEnter.sourceBounds.top,
    stage12Assets.fbEnter.frameKeys[0],
  ).setOrigin(0).setName('fbEnter');
  const transferDoor = scene.add.image(
    stage12TransferDoor.x + stage12TransferDoor.sourceBounds.left,
    stage12TransferDoor.y + stage12TransferDoor.sourceBounds.top,
    Stage12AssetKeys.transferDoor,
  ).setOrigin(0).setName('stage12-transfer-door').setVisible(false);
  stageScene.add([foreground, fbEnter, transferDoor]);

  registerInteractionMetadata(stageScene);

  const cleanup = createStage12Cleanup(() => {
    root.destroy(true);
    floor.destroy();
  });
  return {
    root,
    floor,
    stageScene,
    bgContainer,
    fbEnter,
    transferDoor,
    destroyed: cleanup.destroyed,
    destroy: cleanup.destroy,
  };
}

function registerInteractionMetadata(stageScene: Phaser.GameObjects.Container): void {
  stageScene.setData('wallMarkers', stage12WallMarkers);
  stageScene.setData('stopPoints', stage12StopPoints);
  stageScene.setData('spawnPoints', stage12SpawnPoints);
  stageScene.setData('transferDoor', stage12TransferDoor);
  stageScene.setData('fbEnter', stage12FbEnter);
}
