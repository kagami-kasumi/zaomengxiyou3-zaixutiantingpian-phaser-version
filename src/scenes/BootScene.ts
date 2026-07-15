import Phaser from 'phaser';
import { role1NormalAttackAssets, scaffoldAssets } from '../assets/AssetManifest';

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
  }

  public create(): void {
    this.scene.start('TestScene');
  }
}
