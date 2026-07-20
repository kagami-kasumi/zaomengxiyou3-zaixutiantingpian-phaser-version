import Phaser from 'phaser';
import { Stage11AssetKeys } from '../../assets/AssetManifest';
import {
  createStage11MovementPlatforms,
  stage11RenderBounds,
  STAGE11_SCENE_OFFSET_Y,
} from '../../systems/Stage11Layout';
import type { MovementPlatform } from '../../systems/HeroMovementSystem';

export type Stage11WorldView = Readonly<{
  floor: Phaser.GameObjects.Image;
  background: Phaser.GameObjects.Image;
  foreground: Phaser.GameObjects.Image;
  movementPlatforms: readonly MovementPlatform[];
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

  return {
    floor,
    background,
    foreground,
    movementPlatforms: createStage11MovementPlatforms(),
  };
}
