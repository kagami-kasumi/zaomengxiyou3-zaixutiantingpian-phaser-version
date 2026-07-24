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
  stage22Assets,
  stage22Monster16Atlas,
  stage22Monster16AttackAssets,
  Stage22AssetKeys,
} from '../assets/AssetManifest';
import {
  isStage22LocalQaHost,
  readStage22DevOptions,
  readStage22QaOptions,
} from '../systems/Stage22EntrySystem';

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
    const stage22QaRuntime = import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname);
    if (stage22QaRuntime) {
      for (const [name, asset] of Object.entries(stage22Assets)) {
        if (name === 'floor') continue;
        if ('framePaths' in asset) {
          asset.frameKeys.forEach((frameKey, index) => {
            this.load.svg(frameKey, asset.framePaths[index]);
          });
        } else {
          this.load.svg(asset.key, asset.path);
        }
      }
      this.load.spritesheet(stage22Monster16Atlas.key, stage22Monster16Atlas.path, {
        frameWidth: stage22Monster16Atlas.cellWidth,
        frameHeight: stage22Monster16Atlas.cellHeight,
      });
      for (const asset of Object.values(stage22Monster16AttackAssets)) {
        asset.frameKeys.forEach((frameKey, index) => {
          this.load.svg(frameKey, asset.framePaths[index]);
        });
      }
      this.load.text(
        Stage22AssetKeys.monster16AttackGeometry,
        '/assets/stage22/monster16/bullet-frame-geometry.csv',
      );
    }
    this.load.text(
      Stage21MonsterAssetKeys.attackGeometry,
      '/assets/stage21/bullet-frame-geometry.csv',
    );
  }

  public create(): void {
    const stage22Dev = readStage22DevOptions(
      window.location.search,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
    if (stage22Dev.enabled) {
      this.scene.start('Stage22DevScene', stage22Dev);
      return;
    }
    const stage22Qa = readStage22QaOptions(
      window.location.search,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
    if (stage22Qa.bossState) {
      this.scene.start('Stage22Scene', {
        playerCount: new URLSearchParams(window.location.search).get('players') === '2' ? 2 : 1,
      });
      return;
    }
    this.scene.start('SaveSlotScene');
  }
}
