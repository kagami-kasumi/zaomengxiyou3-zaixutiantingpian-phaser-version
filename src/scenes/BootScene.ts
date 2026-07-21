import Phaser from 'phaser';
import {
  craftingAssets,
  role1NormalAttackAssets,
  scaffoldAssets,
  stage11Assets,
  stage12Assets,
  stage13Assets,
} from '../assets/AssetManifest';

export class BootScene extends Phaser.Scene {
  public constructor() {
    super('BootScene');
  }

  public preload(): void {
    this.load.svg(
      scaffoldAssets.playerPlaceholder.key,
      scaffoldAssets.playerPlaceholder.path,
      { width: 72, height: 96 },
    );
    for (const asset of Object.values(role1NormalAttackAssets)) {
      asset.frameKeys.forEach((frameKey, index) => {
        this.load.image(frameKey, asset.framePaths[index]);
      });
    }
    for (const asset of Object.values(craftingAssets)) {
      this.load.image(asset.key, asset.path);
    }
    for (const asset of Object.values(stage11Assets)) {
      this.load.image(asset.key, asset.path);
    }
    for (const asset of Object.values(stage12Assets)) {
      if ('framePaths' in asset) {
        asset.frameKeys.forEach((frameKey, index) => {
          this.load.image(frameKey, asset.framePaths[index]);
        });
      } else {
        this.load.image(asset.key, asset.path);
      }
    }
    for (const asset of Object.values(stage13Assets)) {
      this.load.image(asset.key, asset.path);
    }
  }

  public create(): void {
    this.scene.start('Stage11EntryScene');
  }
}
