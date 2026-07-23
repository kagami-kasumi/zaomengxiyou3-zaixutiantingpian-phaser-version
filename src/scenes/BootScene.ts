import Phaser from 'phaser';
import {
  combatHudAssets,
  craftingAssets,
  fullFeatureUiAssets,
  heavenMapAssets,
  pickupAssets,
  role1NormalAttackAssets,
  saveSlotAssets,
  scaffoldAssets,
  skillNativeUiAssets,
  stage11Assets,
  stage12Assets,
  stage13Assets,
  stage21AttackAssets,
  stage21Assets,
  stage21MonsterAtlases,
  Stage21MonsterAssetKeys,
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
    for (const asset of Object.values(fullFeatureUiAssets)) {
      if (asset.path.includes('/skills/native/base/')) this.load.image(asset.key, asset.path);
      else this.load.svg(asset.key, asset.path);
    }
    for (const asset of skillNativeUiAssets) {
      this.load.svg(asset.key, asset.path);
    }
    for (const asset of Object.values(combatHudAssets)) {
      this.load.svg(asset.key, asset.path);
    }
    for (const asset of Object.values(saveSlotAssets)) {
      this.load.svg(asset.key, asset.path);
    }
    for (const asset of Object.values(heavenMapAssets)) {
      this.load.svg(asset.key, asset.path);
    }
    for (const asset of Object.values(pickupAssets)) {
      if ('framePaths' in asset) {
        asset.frameKeys.forEach((frameKey, index) => this.load.image(frameKey, asset.framePaths[index]));
      } else {
        this.load.image(asset.key, asset.path);
      }
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
    for (const asset of Object.values(stage21Assets)) {
      if ('framePaths' in asset) {
        asset.frameKeys.forEach((frameKey, index) => {
          this.load.image(frameKey, asset.framePaths[index]);
        });
      } else {
        this.load.image(asset.key, asset.path);
      }
    }
    for (const asset of Object.values(stage21MonsterAtlases)) {
      this.load.spritesheet(asset.key, asset.path, {
        frameWidth: asset.cellWidth,
        frameHeight: asset.cellHeight,
      });
    }
    for (const asset of Object.values(stage21AttackAssets)) {
      asset.frameKeys.forEach((frameKey, index) => {
        this.load.image(frameKey, asset.framePaths[index]);
      });
    }
    this.load.text(
      Stage21MonsterAssetKeys.attackGeometry,
      '/assets/stage21/bullet-frame-geometry.csv',
    );
  }

  public create(): void {
    this.scene.start('SaveSlotScene');
  }
}
