import Phaser from 'phaser';
import { shopUiAssets } from '../assets/AssetManifest';
import { getInventoryItemAsset } from '../assets/InventoryItemAssets';
import {
  changeFormalShopPage,
  changeFormalShopQuantity,
  closeFormalShopConfirmation,
  confirmFormalShopPurchase,
  createFormalShopPage,
  getFormalShopConfirmationText,
  getFormalShopPageCount,
  getFormalShopPlayer,
  getFormalShopQuantity,
  getFormalShopUnitPrice,
  getFormalShopVisibleItems,
  getFormalShopOwners,
  openFormalShopConfirmation,
  selectFormalShopCategory,
  setFormalShopOwner,
  setFormalShopTypedQuantity,
  showFormalShopOfflineChargeMessage,
  type FormalShopCategory,
  type FormalShopItem,
  type FormalShopOwner,
  type FormalShopPageModel,
} from '../systems/FormalShopPageSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import { createFormalSoulBalanceView } from './feature-ui/FormalSoulBalanceView';

// 边界：本场景只负责商城显示与交互，不直接持有商品、灵魂、背包或存档事务规则。
const CardColumns = [137.8, 362.3, 585.8] as const;
const CardRows = [156, 247, 339] as const;
const CategoryButtons: readonly Readonly<{
  category: FormalShopCategory;
  x: number;
  assets: NativeButtonAssets;
}>[] = [
  { category: 'all', x: 131.3, assets: shopUiAssets.buttons.categoryAll },
  { category: 'gems', x: 207.3, assets: shopUiAssets.buttons.categoryGem },
  { category: 'items', x: 283.3, assets: shopUiAssets.buttons.categoryItem },
  { category: 'fashion', x: 359.3, assets: shopUiAssets.buttons.categoryFashion },
  { category: 'pets', x: 435.25, assets: shopUiAssets.buttons.categoryPet },
];

type NativeButtonAssets = Readonly<{
  up: Readonly<{ key: string }>;
  over: Readonly<{ key: string }>;
  down: Readonly<{ key: string }>;
}>;

export class ShopScene extends Phaser.Scene {
  private storage?: SaveStorage;
  private model?: FormalShopPageModel;
  private dynamicLayer?: Phaser.GameObjects.Container;
  private toast?: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;
  private editingFillName?: string;
  private typedQuantity = '';

  public constructor() {
    super('ShopScene');
  }

  public create(): void {
    this.storage = getBrowserStorage();
    this.model = this.storage ? createFormalShopPage(this.storage) : undefined;
    if (!this.model || !this.storage) {
      this.scene.start('HeavenMapScene');
      return;
    }
    this.cameras.main.setBackgroundColor('#000000');
    this.add.image(0, 0, shopUiAssets.root.key).setOrigin(0);
    this.renderDynamicLayer();
    this.input.keyboard?.on('keydown', this.handleKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyDown, this);
      this.toastTimer?.remove(false);
    });
  }

  private renderDynamicLayer(): void {
    if (!this.model || !this.storage) return;
    this.dynamicLayer?.destroy(true);
    const layer = this.add.container(0, 0).setDepth(20);
    this.dynamicLayer = layer;

    for (const button of CategoryButtons) {
      layer.add(this.createNativeButton(
        button.x,
        99,
        button.assets,
        () => {
          selectFormalShopCategory(this.model!, button.category);
          this.stopEditing();
          this.renderDynamicLayer();
        },
        this.model.category === button.category ? 'down' : 'up',
      ));
    }

    layer.add(this.createNativeButton(
      148.8,
      436.8,
      shopUiAssets.buttons.charge,
      () => {
        showFormalShopOfflineChargeMessage(this.model!);
        this.showToast(this.model!.message);
      },
    ));
    for (const owner of getFormalShopOwners(this.model)) {
      layer.add(this.createOwnerButton(owner));
    }
    layer.add(this.createNativeButton(
      650.8,
      448.3,
      shopUiAssets.buttons.pagePrev,
      () => {
        changeFormalShopPage(this.model!, -1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.createNativeButton(
      741.8,
      448.3,
      shopUiAssets.buttons.pageNext,
      () => {
        changeFormalShopPage(this.model!, 1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.add.text(699.8, 451.4, `${this.model.page}/${getFormalShopPageCount(this.model)}`, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '20px',
      align: 'center',
      fixedWidth: 50,
    }).setOrigin(0));
    layer.add(this.add.text(363.2, 450.3, String(getFormalShopPlayer(this.model).soulCount), {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '25px',
      align: 'center',
      fixedWidth: 82,
    }).setOrigin(0));
    layer.add(createFormalSoulBalanceView(
      this,
      getFormalShopPlayer(this.model).soulCount,
      'standalone',
    ));
    layer.add(this.createNativeButton(
      866.7,
      10.8,
      shopUiAssets.buttons.back,
      () => this.returnToMap(),
    ));

    getFormalShopVisibleItems(this.model).forEach((item, index) => {
      const x = CardColumns[index % 3]!;
      const y = CardRows[Math.floor(index / 3)]!;
      this.renderItemCard(layer, item, x, y);
    });

    if (this.model.pendingFillName) this.renderConfirmation(layer);
  }

  private renderItemCard(
    layer: Phaser.GameObjects.Container,
    item: FormalShopItem,
    x: number,
    y: number,
  ): void {
    layer.add(this.add.image(x, y, shopUiAssets.card.key).setOrigin(0));
    const icon = getInventoryItemAsset(item.fillName);
    if (icon) {
      layer.add(this.add.image(x + 18, y + 23, icon.key).setOrigin(0).setDisplaySize(48, 48));
    }
    layer.add(this.add.text(x + 92, y + 9.8, item.name, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '15px',
      align: 'right',
      fixedWidth: 112,
    }).setOrigin(0));
    const unitPrice = getFormalShopUnitPrice(item, this.model!.currentBigStage);
    layer.add(this.add.text(x + 81, y + 61, `${unitPrice}灵魂`, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '15px',
      align: 'right',
      fixedWidth: 62,
    }).setOrigin(0));
    const quantity = this.editingFillName === item.fillName && this.typedQuantity !== ''
      ? this.typedQuantity
      : String(getFormalShopQuantity(this.model!, item.fillName));
    const quantityText = this.add.text(x + 153, y + 35.9, quantity, {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 37,
    }).setOrigin(0).setInteractive({ useHandCursor: true });
    quantityText.on('pointerdown', () => {
      this.editingFillName = item.fillName;
      this.typedQuantity = '';
    });
    layer.add(quantityText);
    layer.add(this.createNativeButton(
      x + 187.5,
      y + 34.25,
      shopUiAssets.buttons.quantityUp,
      () => {
        changeFormalShopQuantity(this.model!, item.fillName, 1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.createNativeButton(
      x + 187.5,
      y + 43.75,
      shopUiAssets.buttons.quantityDown,
      () => {
        changeFormalShopQuantity(this.model!, item.fillName, -1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.createNativeButton(
      x + 138,
      y + 54.45,
      shopUiAssets.buttons.buy,
      () => {
        if (openFormalShopConfirmation(this.model!, item.fillName)) {
          this.stopEditing();
          this.renderDynamicLayer();
        }
      },
    ));
  }

  private createOwnerButton(owner: FormalShopOwner): Phaser.GameObjects.Image {
    const assets = owner === 'p1'
      ? shopUiAssets.buttons.ownerP1
      : shopUiAssets.buttons.ownerP2;
    return this.createNativeButton(
      owner === 'p1' ? 465.3 : 553.3,
      449.3,
      assets,
      () => {
        setFormalShopOwner(this.model!, owner);
        this.stopEditing();
        this.renderDynamicLayer();
      },
      this.model!.owner === owner ? 'over' : 'up',
    );
  }

  private renderConfirmation(layer: Phaser.GameObjects.Container): void {
    const blocker = this.add.image(0, 0, shopUiAssets.confirm.key)
      .setOrigin(0)
      .setInteractive()
      .setDepth(50);
    layer.add(blocker);
    layer.add(this.add.text(394, 254.7, getFormalShopConfirmationText(this.model!), {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '14px',
      fixedWidth: 181,
      wordWrap: { width: 181 },
    }).setOrigin(0).setDepth(51));
    layer.add(this.createNativeButton(
      403.3,
      319,
      shopUiAssets.buttons.confirmOk,
      () => {
        confirmFormalShopPurchase(this.model!, this.storage!);
        this.renderDynamicLayer();
        this.showToast(this.model!.message);
      },
    ).setDepth(51));
    layer.add(this.createNativeButton(
      490.3,
      319,
      shopUiAssets.buttons.confirmCancel,
      () => {
        closeFormalShopConfirmation(this.model!);
        this.renderDynamicLayer();
      },
    ).setDepth(51));
  }

  private createNativeButton(
    x: number,
    y: number,
    assets: NativeButtonAssets,
    action: () => void,
    restingState: 'up' | 'over' | 'down' = 'up',
  ): Phaser.GameObjects.Image {
    const restingKey = assets[restingState].key;
    const button = this.add.image(x, y, restingKey).setOrigin(0)
      .setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setTexture(assets.over.key));
    button.on('pointerout', () => button.setTexture(restingKey));
    button.on('pointerdown', () => button.setTexture(assets.down.key));
    button.on('pointerup', () => {
      button.setTexture(assets.over.key);
      action();
    });
    return button;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.model?.pendingFillName) {
        closeFormalShopConfirmation(this.model);
        this.renderDynamicLayer();
      } else {
        this.returnToMap();
      }
      return;
    }
    if (!this.editingFillName || !this.model || this.model.pendingFillName) return;
    if (/^[0-9]$/.test(event.key) && this.typedQuantity.length < 2) {
      this.typedQuantity += event.key;
      setFormalShopTypedQuantity(this.model, this.editingFillName, Number(this.typedQuantity));
      this.renderDynamicLayer();
      return;
    }
    if (event.key === 'Backspace') {
      this.typedQuantity = this.typedQuantity.slice(0, -1);
      setFormalShopTypedQuantity(
        this.model,
        this.editingFillName,
        this.typedQuantity === '' ? 0 : Number(this.typedQuantity),
      );
      this.renderDynamicLayer();
      return;
    }
    if (event.key === 'Enter') {
      this.stopEditing();
      this.renderDynamicLayer();
    }
  }

  private stopEditing(): void {
    this.editingFillName = undefined;
    this.typedQuantity = '';
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
