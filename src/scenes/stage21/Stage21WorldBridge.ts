import Phaser from 'phaser';
import { Stage21AssetKeys, stage21Assets } from '../../assets/AssetManifest';
import {
  stage21IceThorns,
  stage21RenderBounds,
  stage21SpawnPoints,
  stage21StopPoints,
  stage21TransferDoor,
  stage21WallMarkers,
} from '../../systems/Stage21Layout';
import { createTransferDoorView, type TransferDoorView } from '../TransferDoorView';

export type Stage21WorldHandle = Readonly<{
  root: Phaser.GameObjects.Container;
  floor: Phaser.GameObjects.Image;
  stageScene: Phaser.GameObjects.Container;
  bgContainer: Phaser.GameObjects.Container;
  transferDoor: TransferDoorView;
  iceViews: readonly Phaser.GameObjects.Image[];
  destroy: () => void;
}>;

export function createStage21World(scene: Phaser.Scene): Stage21WorldHandle {
  const floor = scene.add.image(
    stage21RenderBounds.floor.left,
    stage21RenderBounds.floor.top,
    stage21Assets.floor.key,
  ).setOrigin(0).setScrollFactor(0).setName('floorBg2');
  const root = scene.add.container(0, 0).setName('stage21-root');
  const stageScene = scene.add.container(0, 0).setName('sl21');
  root.add(stageScene);

  // Original bgContainer is at (0.25, 0), with bg21 inserted at local x=-20.
  const bgContainer = scene.add.container(0.25, 0).setName('bgContainer');
  bgContainer.add(scene.add.image(-20, 0, Stage21AssetKeys.background)
    .setOrigin(0).setName('bg21'));
  stageScene.add(bgContainer);
  stageScene.add(scene.add.image(
    stage21RenderBounds.midground.left,
    stage21RenderBounds.midground.top,
    Stage21AssetKeys.midground,
  ).setOrigin(0).setName('sl21-midground'));
  stageScene.add(scene.add.image(
    stage21RenderBounds.foreground.left,
    stage21RenderBounds.foreground.top,
    Stage21AssetKeys.foreground,
  ).setOrigin(0).setName('sl21-foreground'));

  const iceViews = stage21IceThorns.map((thorn) => {
    const image = scene.add.image(thorn.x, thorn.y, stage21Assets.iceThorn.frameKeys[0])
      .setOrigin(0).setName(thorn.id).setDepth(12);
    image.setScale(thorn.scaleX, thorn.scaleY);
    stageScene.add(image);
    return image;
  });
  const transferDoor = createTransferDoorView(scene, {
    id: 'stage21-transfer-door',
    textureKey: Stage21AssetKeys.transferDoor,
    sourcePackage: stage21Assets.transferDoor.sourcePackage,
    sourceSymbol: stage21Assets.transferDoor.sourceSymbol,
    sourceCharacterIds: [48],
    origin: { x: 0, y: 0 },
  },
    stage21TransferDoor.x + stage21TransferDoor.sourceBounds.left - stage21TransferDoor.rasterPadding,
    stage21TransferDoor.y + stage21TransferDoor.sourceBounds.top - stage21TransferDoor.rasterPadding,
  );
  stageScene.add(transferDoor.image);

  stageScene.setData('wallMarkers', stage21WallMarkers);
  stageScene.setData('stopPoints', stage21StopPoints);
  stageScene.setData('spawnPoints', stage21SpawnPoints);
  stageScene.setData('iceThorns', stage21IceThorns);
  stageScene.setData('transferDoor', stage21TransferDoor);

  let destroyed = false;
  return {
    root,
    floor,
    stageScene,
    bgContainer,
    transferDoor,
    iceViews,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      transferDoor.destroy();
      root.destroy(true);
      floor.destroy();
    },
  };
}
