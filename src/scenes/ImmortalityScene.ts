import Phaser from 'phaser';
import { immortalityUiAssets } from '../assets/AssetManifest';
import { getInventoryItemAsset } from '../assets/InventoryItemAssets';
import {
  closeFormalImmortalityExchange,
  craftFormalImmortality,
  createFormalImmortalityPage,
  eatFormalImmortality,
  getFormalImmortalityEffectTotals,
  getFormalImmortalityHeroId,
  getFormalImmortalityOwners,
  getFormalImmortalityPlayer,
  isFormalImmortalityEatVisible,
  openFormalImmortalityExchange,
  setFormalImmortalityOwner,
  type FormalImmortalityPageModel,
} from '../systems/FormalImmortalityPageSystem';
import { getImmortalityFillName } from '../systems/ImmortalitySystem';
import type { PlayerSlot } from '../systems/InputSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import {
  assertVerifiedImmortalityPageTruth,
  getImmortalityCellTruthBounds,
  getImmortalityOwnerTruthBounds,
  getImmortalityTruthBounds,
  ImmortalityTruthObjectIds,
  type ImmortalityTruthBounds,
} from './immortality/FormalImmortalityPageTruth';

export class ImmortalityScene extends Phaser.Scene {
  private storage?: SaveStorage;
  private model?: FormalImmortalityPageModel;
  private dynamicLayer?: Phaser.GameObjects.Container;
  private toast?: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;

  public constructor() {
    super('ImmortalityScene');
  }

  public create(): void {
    assertVerifiedImmortalityPageTruth();
    this.storage = getBrowserStorage();
    this.model = this.storage ? createFormalImmortalityPage(this.storage) : undefined;
    if (!this.model || !this.storage) {
      this.scene.start('HeavenMapScene');
      return;
    }
    this.cameras.main.setBackgroundColor('#000000');
    const rootBounds = getImmortalityTruthBounds(ImmortalityTruthObjectIds.root);
    this.add.image(rootBounds.left, rootBounds.top, immortalityUiAssets.root.key).setOrigin(0);
    this.renderDynamicLayer();
    this.input.keyboard?.on('keydown-ESC', this.handleEscape, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ESC', this.handleEscape, this);
      this.toastTimer?.remove(false);
    });
  }

  private renderDynamicLayer(): void {
    if (!this.model || !this.storage) return;
    this.dynamicLayer?.destroy(true);
    const layer = this.add.container(0, 0).setDepth(20);
    this.dynamicLayer = layer;
    const player = getFormalImmortalityPlayer(this.model);

    const soulBounds = getImmortalityTruthBounds(ImmortalityTruthObjectIds.soul);
    layer.add(this.add.text(soulBounds.left, soulBounds.top, String(player.soulCount), {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '23px',
      fixedWidth: soulBounds.width,
    }).setOrigin(0));
    getFormalImmortalityEffectTotals(this.model).forEach((value, index) => {
      const bounds = getImmortalityTruthBounds(ImmortalityTruthObjectIds.effects[index]!);
      layer.add(this.add.text(bounds.left, bounds.top, String(value), {
        color: '#ffffff',
        fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
        fontSize: '15px',
        align: 'center',
        fixedWidth: bounds.width,
      }).setOrigin(0));
    });

    for (const owner of getFormalImmortalityOwners(this.model)) {
      layer.add(this.createOwnerSelector(owner));
    }
    for (let typeIndex = 0; typeIndex < 5; typeIndex += 1) {
      layer.add(this.createNativeButton(
        getImmortalityTruthBounds(ImmortalityTruthObjectIds.make[typeIndex]!),
        immortalityUiAssets.buttons.compound,
        () => {
          openFormalImmortalityExchange(this.model!, typeIndex);
          this.renderDynamicLayer();
        },
      ));
      for (let gradeIndex = 0; gradeIndex < 5; gradeIndex += 1) {
        if (player.immortalityFlags[typeIndex]![gradeIndex] === 1) {
          const asset = getInventoryItemAsset(getImmortalityFillName(typeIndex, gradeIndex));
          if (asset) {
            const bounds = getImmortalityCellTruthBounds(typeIndex, gradeIndex, 'consumed');
            layer.add(this.add.image(bounds.left, bounds.top, asset.key).setOrigin(0)
              .setDisplaySize(bounds.width, bounds.height));
          }
        } else if (isFormalImmortalityEatVisible(this.model, typeIndex, gradeIndex)) {
          layer.add(this.createNativeButton(
            getImmortalityCellTruthBounds(typeIndex, gradeIndex, 'eat'),
            immortalityUiAssets.buttons.eat,
            () => {
              eatFormalImmortality(this.model!, this.storage!, typeIndex, gradeIndex);
              this.renderDynamicLayer();
              this.showToast(this.model!.message);
            },
          ));
        }
      }
    }
    layer.add(this.createNativeButton(
      getImmortalityTruthBounds(ImmortalityTruthObjectIds.back),
      immortalityUiAssets.buttons.back,
      () => this.returnToMap(),
    ));
    if (this.model.exchangeTypeIndex !== undefined) this.renderExchange(layer);
  }

  private createOwnerSelector(owner: PlayerSlot): Phaser.GameObjects.Image {
    const heroId = getFormalImmortalityHeroId(this.model!, owner)! as 1 | 2 | 3 | 4 | 5;
    const state = owner === this.model!.owner ? 'selected' : 'normal';
    const bounds = getImmortalityOwnerTruthBounds(heroId, owner);
    const image = this.add.image(
      bounds.left,
      bounds.top,
      immortalityUiAssets.owners[heroId][state].key,
    ).setOrigin(0).setInteractive({ useHandCursor: true });
    image.on('pointerdown', () => {
      setFormalImmortalityOwner(this.model!, owner);
      this.renderDynamicLayer();
    });
    return image;
  }

  private renderExchange(layer: Phaser.GameObjects.Container): void {
    const dialogBounds = getImmortalityTruthBounds(ImmortalityTruthObjectIds.dialog);
    const blocker = this.add.image(dialogBounds.left, dialogBounds.top, immortalityUiAssets.exchange.key)
      .setOrigin(0)
      .setInteractive()
      .setDepth(50);
    layer.add(blocker);
    ImmortalityTruthObjectIds.compound.forEach((truthId, gradeIndex) => {
      const button = this.createNativeButton(
        getImmortalityTruthBounds(truthId),
        immortalityUiAssets.buttons.compound,
        () => {
          craftFormalImmortality(this.model!, this.storage!, gradeIndex);
          this.renderDynamicLayer();
          this.showToast(this.model!.message);
        },
      ).setDepth(51);
      layer.add(button);
    });
    layer.add(this.createNativeButton(
      getImmortalityTruthBounds(ImmortalityTruthObjectIds.dialogClose),
      immortalityUiAssets.buttons.close,
      () => {
        closeFormalImmortalityExchange(this.model!);
        this.renderDynamicLayer();
      },
    ).setDepth(51));
  }

  private createNativeButton(
    bounds: ImmortalityTruthBounds,
    assets: {
      up: { key: string };
      over: { key: string };
      down: { key: string };
    },
    action: () => void,
  ): Phaser.GameObjects.Image {
    const button = this.add.image(bounds.left, bounds.top, assets.up.key).setOrigin(0)
      .setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setTexture(assets.over.key));
    button.on('pointerout', () => button.setTexture(assets.up.key));
    button.on('pointerdown', () => button.setTexture(assets.down.key));
    button.on('pointerup', () => {
      button.setTexture(assets.over.key);
      action();
    });
    return button;
  }

  private showToast(message: string): void {
    this.toastTimer?.remove(false);
    this.toast?.destroy();
    this.toast = this.add.text(0, 270, message, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      align: 'center',
      fixedWidth: 940,
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setDepth(100);
    this.toastTimer = this.time.delayedCall(1_000, () => {
      this.tweens.add({
        targets: this.toast,
        y: 240,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.toast?.destroy();
          this.toast = undefined;
        },
      });
    });
  }

  private handleEscape(): void {
    if (this.model?.exchangeTypeIndex !== undefined) {
      closeFormalImmortalityExchange(this.model);
      this.renderDynamicLayer();
      return;
    }
    this.returnToMap();
  }

  private returnToMap(): void {
    this.scene.start('HeavenMapScene');
  }
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
