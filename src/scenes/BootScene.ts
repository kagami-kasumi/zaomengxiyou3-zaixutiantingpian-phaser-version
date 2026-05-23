import Phaser from 'phaser';
import { scaffoldAssets } from '../assets/AssetManifest';

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
  }

  public create(): void {
    this.scene.start('TestScene');
  }
}
