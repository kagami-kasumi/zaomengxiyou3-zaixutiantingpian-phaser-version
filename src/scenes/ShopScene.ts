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
import {
  assertVerifiedShopPageTruth,
  getShopCardTruthBounds,
  getShopTruthBounds,
  ShopTruthObjectIds,
  type ShopTruthBounds,
} from './shop/FormalShopPageTruth';

// 边界：本场景只负责商城显示与交互，不直接持有商品、灵魂、背包或存档事务规则。
const CategoryButtons: readonly Readonly<{
  category: FormalShopCategory;
  truthId: string;
  assets: NativeButtonAssets;
}>[] = [
  { category: 'all', truthId: ShopTruthObjectIds.categories.all, assets: shopUiAssets.buttons.categoryAll },
  { category: 'gems', truthId: ShopTruthObjectIds.categories.gems, assets: shopUiAssets.buttons.categoryGem },
  { category: 'items', truthId: ShopTruthObjectIds.categories.items, assets: shopUiAssets.buttons.categoryItem },
  { category: 'fashion', truthId: ShopTruthObjectIds.categories.fashion, assets: shopUiAssets.buttons.categoryFashion },
  { category: 'pets', truthId: ShopTruthObjectIds.categories.pets, assets: shopUiAssets.buttons.categoryPet },
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
    assertVerifiedShopPageTruth();
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
        getShopTruthBounds(button.truthId),
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
      getShopTruthBounds(ShopTruthObjectIds.charge),
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
      getShopTruthBounds(ShopTruthObjectIds.pagePrev),
      shopUiAssets.buttons.pagePrev,
      () => {
        changeFormalShopPage(this.model!, -1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.createNativeButton(
      getShopTruthBounds(ShopTruthObjectIds.pageNext),
      shopUiAssets.buttons.pageNext,
      () => {
        changeFormalShopPage(this.model!, 1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    const pageBounds = getShopTruthBounds(ShopTruthObjectIds.pageText);
    layer.add(this.add.text(pageBounds.left, pageBounds.top, `${this.model.page}/${getFormalShopPageCount(this.model)}`, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '20px',
      align: 'center',
      fixedWidth: pageBounds.width,
    }).setOrigin(0));
    const moneyBounds = getShopTruthBounds(ShopTruthObjectIds.money);
    layer.add(this.add.text(moneyBounds.left, moneyBounds.top, String(getFormalShopPlayer(this.model).soulCount), {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '25px',
      align: 'center',
      fixedWidth: moneyBounds.width,
    }).setOrigin(0));
    layer.add(createFormalSoulBalanceView(
      this,
      getFormalShopPlayer(this.model).soulCount,
      'standalone',
    ));
    layer.add(this.createNativeButton(
      getShopTruthBounds(ShopTruthObjectIds.back),
      shopUiAssets.buttons.back,
      () => this.returnToMap(),
    ));

    getFormalShopVisibleItems(this.model).forEach((item, index) => {
      this.renderItemCard(layer, item, index);
    });

    if (this.model.pendingFillName) this.renderConfirmation(layer);
  }

  private renderItemCard(
    layer: Phaser.GameObjects.Container,
    item: FormalShopItem,
    cardIndex: number,
  ): void {
    const cardBounds = getShopCardTruthBounds(cardIndex);
    layer.add(this.add.image(cardBounds.left, cardBounds.top, shopUiAssets.card.key).setOrigin(0));
    const icon = getInventoryItemAsset(item.fillName);
    if (icon) {
      const bounds = getShopCardTruthBounds(cardIndex, 'icon');
      layer.add(this.add.image(bounds.left, bounds.top, icon.key).setOrigin(0)
        .setDisplaySize(bounds.width, bounds.height));
    }
    const nameBounds = getShopCardTruthBounds(cardIndex, 'name');
    layer.add(this.add.text(nameBounds.left, nameBounds.top, item.name, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '15px',
      align: 'right',
      fixedWidth: nameBounds.width,
    }).setOrigin(0));
    const unitPrice = getFormalShopUnitPrice(item, this.model!.currentBigStage);
    const priceBounds = getShopCardTruthBounds(cardIndex, 'price');
    layer.add(this.add.text(priceBounds.left, priceBounds.top, `${unitPrice}灵魂`, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '15px',
      align: 'right',
      fixedWidth: priceBounds.width,
    }).setOrigin(0));
    const quantity = this.editingFillName === item.fillName && this.typedQuantity !== ''
      ? this.typedQuantity
      : String(getFormalShopQuantity(this.model!, item.fillName));
    const quantityBounds = getShopCardTruthBounds(cardIndex, 'quantity');
    const quantityText = this.add.text(quantityBounds.left, quantityBounds.top, quantity, {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '14px',
      align: 'center',
      fixedWidth: quantityBounds.width,
    }).setOrigin(0).setInteractive({ useHandCursor: true });
    quantityText.on('pointerdown', () => {
      this.editingFillName = item.fillName;
      this.typedQuantity = '';
    });
    layer.add(quantityText);
    layer.add(this.createNativeButton(
      getShopCardTruthBounds(cardIndex, 'quantityUp'),
      shopUiAssets.buttons.quantityUp,
      () => {
        changeFormalShopQuantity(this.model!, item.fillName, 1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.createNativeButton(
      getShopCardTruthBounds(cardIndex, 'quantityDown'),
      shopUiAssets.buttons.quantityDown,
      () => {
        changeFormalShopQuantity(this.model!, item.fillName, -1);
        this.stopEditing();
        this.renderDynamicLayer();
      },
    ));
    layer.add(this.createNativeButton(
      getShopCardTruthBounds(cardIndex, 'buy'),
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
      getShopTruthBounds(owner === 'p1' ? ShopTruthObjectIds.ownerP1 : ShopTruthObjectIds.ownerP2),
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
    const confirmBounds = getShopTruthBounds(ShopTruthObjectIds.confirm);
    const blocker = this.add.image(confirmBounds.left, confirmBounds.top, shopUiAssets.confirm.key)
      .setOrigin(0)
      .setInteractive()
      .setDepth(50);
    layer.add(blocker);
    const textBounds = getShopTruthBounds(ShopTruthObjectIds.confirmText);
    layer.add(this.add.text(textBounds.left, textBounds.top, getFormalShopConfirmationText(this.model!), {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '14px',
      fixedWidth: textBounds.width,
      wordWrap: { width: textBounds.width },
    }).setOrigin(0).setDepth(51));
    layer.add(this.createNativeButton(
      getShopTruthBounds(ShopTruthObjectIds.confirmOk),
      shopUiAssets.buttons.confirmOk,
      () => {
        confirmFormalShopPurchase(this.model!, this.storage!);
        this.renderDynamicLayer();
        this.showToast(this.model!.message);
      },
    ).setDepth(51));
    layer.add(this.createNativeButton(
      getShopTruthBounds(ShopTruthObjectIds.confirmCancel),
      shopUiAssets.buttons.confirmCancel,
      () => {
        closeFormalShopConfirmation(this.model!);
        this.renderDynamicLayer();
      },
    ).setDepth(51));
  }

  private createNativeButton(
    bounds: ShopTruthBounds,
    assets: NativeButtonAssets,
    action: () => void,
    restingState: 'up' | 'over' | 'down' = 'up',
  ): Phaser.GameObjects.Image {
    const restingKey = assets[restingState].key;
    const button = this.add.image(bounds.left, bounds.top, restingKey).setOrigin(0)
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
