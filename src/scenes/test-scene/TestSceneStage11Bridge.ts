import Phaser from 'phaser';
import { Stage11AssetKeys, stage11Assets } from '../../assets/AssetManifest';
import {
  createStage11MovementPlatforms,
  stage11RenderBounds,
  stage11TransferDoor,
  STAGE11_SCENE_OFFSET_Y,
} from '../../systems/Stage11Layout';
import type { MovementPlatform } from '../../systems/HeroMovementSystem';
import { createTransferDoorView, type TransferDoorView } from '../TransferDoorView';

export type Stage11WorldView = Readonly<{
  floor: Phaser.GameObjects.Image;
  background: Phaser.GameObjects.Image;
  foreground: Phaser.GameObjects.Image;
  transferDoor: TransferDoorView;
  movementPlatforms: readonly MovementPlatform[];
  destroy: () => void;
}>;

export function createStage11World(scene: Phaser.Scene): Stage11WorldView {
  const floor = scene.add.image(
    stage11RenderBounds.floor.left,
    stage11RenderBounds.floor.top,
    Stage11AssetKeys.floor,
  ).setOrigin(0, 0).setScrollFactor(0).setDepth(-30);

  // bg11 is created at x=-20 inside bgContainer. Its exported bitmap starts
  // at source (-59, -2370); StageListener11's runtime boss offset is +2370.
  const background = scene.add.image(
    stage11RenderBounds.background.left,
    -2370 + STAGE11_SCENE_OFFSET_Y,
    Stage11AssetKeys.background,
  ).setOrigin(0, 0).setDepth(-20);

  const foreground = scene.add.image(
    stage11RenderBounds.foreground.left,
    stage11RenderBounds.foreground.top,
    Stage11AssetKeys.foreground,
  ).setOrigin(0, 0).setDepth(-10);

  const transferDoor = createTransferDoorView(scene, {
    id: 'stage11-transfer-door',
    textureKey: stage11Assets.transferDoor.frameKeys[0],
    sourcePackage: stage11Assets.transferDoor.sourcePackage,
    sourceSymbol: stage11Assets.transferDoor.sourceSymbol,
    sourceCharacterIds: [45, 41, 44],
    origin: { x: 0, y: 0 },
    frames: stage11Assets.transferDoor.frameKeys,
    animationFrames: stage11Assets.transferDoor.frameKeys,
    frameRate: 20,
  }, stage11TransferDoor.bounds.left, stage11TransferDoor.bounds.top);
  transferDoor.image.setDepth(10);

  let destroyed = false;

  return {
    floor,
    background,
    foreground,
    transferDoor,
    movementPlatforms: createStage11MovementPlatforms(),
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      transferDoor.destroy();
      foreground.destroy();
      background.destroy();
      floor.destroy();
    },
  };
}
