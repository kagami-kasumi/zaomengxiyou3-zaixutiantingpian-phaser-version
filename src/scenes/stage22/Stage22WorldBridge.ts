import Phaser from 'phaser';
import { Stage22AssetKeys, stage22Assets } from '../../assets/AssetManifest';
import {
  stage22FireThorns,
  stage22RenderBounds,
  stage22StopPoints,
  stage22TransferDoor,
  stage22WallMarkers,
} from '../../systems/Stage22Layout';
import type { Stage22FireHazardModel } from '../../systems/Stage22FireHazardSystem';

export type Stage22WorldHandle = Readonly<{
  root: Phaser.GameObjects.Container;
  floor: Phaser.GameObjects.Image;
  stageScene: Phaser.GameObjects.Container;
  bgContainer: Phaser.GameObjects.Container;
  foreground: Phaser.GameObjects.Image;
  midground: Phaser.GameObjects.Image;
  transferDoor: Phaser.GameObjects.Image;
  fireViews: readonly Phaser.GameObjects.Image[];
  updateFireViews: (hazards: readonly Stage22FireHazardModel[]) => void;
  destroy: () => void;
}>;

export function createStage22World(scene: Phaser.Scene): Stage22WorldHandle {
  const floor = scene.add.image(
    stage22RenderBounds.floor.left,
    stage22RenderBounds.floor.top,
    stage22Assets.floor.key,
  ).setOrigin(0).setScrollFactor(0).setName('floorBg2');
  const root = scene.add.container(0, 0).setName('stage22-root');
  const stageScene = scene.add.container(0, 0).setName('sl22');
  root.add(stageScene);

  // Source display list: bgContainer depth 1 at (-25, 0), bg22 at local x=-20.
  const bgContainer = scene.add.container(-25, 0).setName('bgContainer');
  bgContainer.add(scene.add.image(-20, 0, Stage22AssetKeys.background)
    .setOrigin(0).setName('bg22'));
  stageScene.add(bgContainer);

  // Character 34 is depth 3. FireThron instances occupy depths 4..36.
  const foreground = scene.add.image(
    stage22RenderBounds.foreground.left,
    stage22RenderBounds.foreground.top,
    Stage22AssetKeys.foreground,
  ).setOrigin(0).setName('sl22-foreground');
  stageScene.add(foreground);

  const fireViews = stage22FireThorns.map((fire) => {
    const image = scene.add.image(
      fire.x + fire.scaleX * -71.5,
      fire.y - 285.7,
      stage22Assets.fireThorn.frameKeys[0],
    ).setOrigin(0).setName(fire.id).setScale(fire.scaleX, 1);
    stageScene.add(image);
    return image;
  });

  // Character 36 is depth 51 and therefore renders above the fire instances.
  const midground = scene.add.image(
    stage22RenderBounds.midground.left,
    stage22RenderBounds.midground.top,
    Stage22AssetKeys.midground,
  ).setOrigin(0).setName('sl22-midground');
  stageScene.add(midground);

  const transferDoor = scene.add.image(
    stage22TransferDoor.x + stage22TransferDoor.sourceBounds.left,
    stage22TransferDoor.y + stage22TransferDoor.sourceBounds.top,
    Stage22AssetKeys.transferDoor,
  ).setOrigin(0).setName('stage22-transfer-door').setVisible(false);
  stageScene.add(transferDoor);

  stageScene.setData('wallMarkers', stage22WallMarkers);
  stageScene.setData('stopPoints', stage22StopPoints);
  stageScene.setData('fireThorns', stage22FireThorns);
  stageScene.setData('transferDoor', stage22TransferDoor);

  let destroyed = false;
  return {
    root,
    floor,
    stageScene,
    bgContainer,
    foreground,
    midground,
    transferDoor,
    fireViews,
    updateFireViews: (hazards) => {
      hazards.forEach((hazard, index) => {
        const view = fireViews[index];
        const frameKey = stage22Assets.fireThorn.frameKeys[hazard.frame - 1];
        if (view && frameKey && view.texture.key !== frameKey) view.setTexture(frameKey);
      });
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      root.destroy(true);
      floor.destroy();
    },
  };
}
