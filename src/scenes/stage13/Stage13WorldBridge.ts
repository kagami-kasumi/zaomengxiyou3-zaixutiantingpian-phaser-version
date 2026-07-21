import Phaser from 'phaser';
import { Stage13AssetKeys, stage11Assets } from '../../assets/AssetManifest';
import {
  stage13RenderBounds,
  stage13SpawnPoints,
  stage13StopPoints,
  stage13TransferDoor,
  stage13WallMarkers,
} from '../../systems/Stage13Layout';

export type Stage13WorldHandle = Readonly<{
  root: Phaser.GameObjects.Container;
  floor: Phaser.GameObjects.Image;
  stageScene: Phaser.GameObjects.Container;
  bgContainer: Phaser.GameObjects.Container;
  transferDoor: Phaser.GameObjects.Image;
  destroy: () => void;
}>;

export function createStage13World(scene: Phaser.Scene): Stage13WorldHandle {
  const floor = scene.add.image(
    stage13RenderBounds.floor.left,
    stage13RenderBounds.floor.top,
    stage11Assets.floor.key,
  ).setOrigin(0).setScrollFactor(0).setName('floorBg1');
  const root = scene.add.container(0, 0).setName('stage13-root');
  const stageScene = scene.add.container(0, 0).setName('sl13');
  root.add(stageScene);

  // BaseGameSence inserts bg13 at local x=-20. Its source shape begins at x=-70.
  const bgContainer = scene.add.container(0, 0).setName('bgContainer');
  bgContainer.add(scene.add.image(-90, 0, Stage13AssetKeys.background)
    .setOrigin(0).setName('bg13'));
  stageScene.add(bgContainer);

  stageScene.add(scene.add.image(-30, 494, Stage13AssetKeys.foreground)
    .setOrigin(0).setName('sl13-foreground'));
  const transferDoor = scene.add.image(
    stage13TransferDoor.x + stage13TransferDoor.sourceBounds.left - stage13TransferDoor.rasterPadding,
    stage13TransferDoor.y + stage13TransferDoor.sourceBounds.top - stage13TransferDoor.rasterPadding,
    Stage13AssetKeys.transferDoor,
  ).setOrigin(0).setName('stage13-transfer-door').setVisible(false);
  stageScene.add(transferDoor);

  stageScene.setData('wallMarkers', stage13WallMarkers);
  stageScene.setData('stopPoints', stage13StopPoints);
  stageScene.setData('spawnPoints', stage13SpawnPoints);
  stageScene.setData('transferDoor', stage13TransferDoor);

  let destroyed = false;
  return {
    root,
    floor,
    stageScene,
    bgContainer,
    transferDoor,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      root.destroy(true);
      floor.destroy();
    },
  };
}
