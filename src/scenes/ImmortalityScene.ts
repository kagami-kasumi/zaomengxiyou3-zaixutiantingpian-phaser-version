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

const CellColumns = [196.85, 299.85, 406.85, 517.85, 622.85] as const;
const CellRows = [150.85, 218.35, 287.85, 357.85, 430.35] as const;
const EffectRows = [178.6, 249.6, 318.6, 392.55, 461.55] as const;
const MakeRows = [178.9, 247.9, 317.9, 388.9, 461.9] as const;
const CompoundRows = [146.4, 205.35, 266.4, 325.35, 383.95] as const;

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
    this.storage = getBrowserStorage();
    this.model = this.storage ? createFormalImmortalityPage(this.storage) : undefined;
    if (!this.model || !this.storage) {
      this.scene.start('HeavenMapScene');
      return;
    }
    this.cameras.main.setBackgroundColor('#000000');
    this.add.image(0, 0, immortalityUiAssets.root.key).setOrigin(0);
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

    layer.add(this.add.text(805.95, 544, String(player.soulCount), {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '23px',
    }).setOrigin(0));
    getFormalImmortalityEffectTotals(this.model).forEach((value, index) => {
      layer.add(this.add.text(747.95, EffectRows[index]!, String(value), {
        color: '#ffffff',
        fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
        fontSize: '15px',
        align: 'center',
        fixedWidth: 104,
      }).setOrigin(0));
    });

    for (const owner of getFormalImmortalityOwners(this.model)) {
      layer.add(this.createOwnerSelector(owner));
    }
    for (let typeIndex = 0; typeIndex < 5; typeIndex += 1) {
      layer.add(this.createNativeButton(
        80.7,
        MakeRows[typeIndex]!,
        immortalityUiAssets.buttons.compound,
        () => {
          openFormalImmortalityExchange(this.model!, typeIndex);
          this.renderDynamicLayer();
        },
      ));
      for (let gradeIndex = 0; gradeIndex < 5; gradeIndex += 1) {
        const x = CellColumns[gradeIndex]!;
        const y = CellRows[typeIndex]!;
        if (player.immortalityFlags[typeIndex]![gradeIndex] === 1) {
          const asset = getInventoryItemAsset(getImmortalityFillName(typeIndex, gradeIndex));
          if (asset) {
            layer.add(this.add.image(x + 2, y + 2, asset.key).setOrigin(0).setDisplaySize(51, 51));
          }
        } else if (isFormalImmortalityEatVisible(this.model, typeIndex, gradeIndex)) {
          layer.add(this.createNativeButton(
            x + 5,
            y + 5,
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
      853.3,
      23.35,
      immortalityUiAssets.buttons.back,
      () => this.returnToMap(),
    ));
    if (this.model.exchangeTypeIndex !== undefined) this.renderExchange(layer);
  }

  private createOwnerSelector(owner: PlayerSlot): Phaser.GameObjects.Image {
    const heroId = getFormalImmortalityHeroId(this.model!, owner)! as 1 | 2 | 3 | 4 | 5;
    const state = owner === this.model!.owner ? 'selected' : 'normal';
    const image = this.add.image(
      owner === 'p1' ? 50 : 140,
      540,
      immortalityUiAssets.owners[heroId][state].key,
    ).setOrigin(0).setInteractive({ useHandCursor: true });
    image.on('pointerdown', () => {
      setFormalImmortalityOwner(this.model!, owner);
      this.renderDynamicLayer();
    });
    return image;
  }

  private renderExchange(layer: Phaser.GameObjects.Container): void {
    const blocker = this.add.image(0, 0, immortalityUiAssets.exchange.key)
      .setOrigin(0)
      .setInteractive()
      .setDepth(50);
    layer.add(blocker);
    CompoundRows.forEach((y, gradeIndex) => {
      const button = this.createNativeButton(
        589.8,
        y,
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
      700.3,
      87.35,
      immortalityUiAssets.buttons.close,
      () => {
        closeFormalImmortalityExchange(this.model!);
        this.renderDynamicLayer();
      },
    ).setDepth(51));
  }

  private createNativeButton(
    x: number,
    y: number,
    assets: {
      up: { key: string };
      over: { key: string };
      down: { key: string };
    },
    action: () => void,
  ): Phaser.GameObjects.Image {
    const button = this.add.image(x, y, assets.up.key).setOrigin(0)
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
