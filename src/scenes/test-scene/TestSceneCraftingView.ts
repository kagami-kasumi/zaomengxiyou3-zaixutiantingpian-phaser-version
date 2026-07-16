import Phaser from 'phaser';
import {
  CraftingAssetKeys,
  CraftingItemTextureKeys,
} from '../../assets/AssetManifest';
import {
  craftStagedSession,
  closeCraftingSession,
  previewCraftingSession,
  removeStagedCraftingMaterial,
  stageCraftingMaterial,
} from '../../systems/CraftingSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import {
  getInventoryEntries,
  InventoryCategoryLabels,
  type InventoryCategory,
  type InventoryEntry,
} from '../../systems/InventorySystem';
import { selectNextInventoryCategory } from '../../systems/EquipmentUISystem';
import { CraftingUILayout, getCraftingCanvasTransform } from './CraftingUILayout';

type CraftingInventoryCell = {
  background: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
};

export type CraftingPanelView = {
  container: Phaser.GameObjects.Container;
  selectors: Phaser.GameObjects.Image[];
  materialIcons: Phaser.GameObjects.Image[];
  previewIcon: Phaser.GameObjects.Image;
  productIcon: Phaser.GameObjects.Image;
  inventoryCells: CraftingInventoryCell[];
  categoryText: Phaser.GameObjects.Text;
  soulText: Phaser.GameObjects.Text;
  previewText: Phaser.GameObjects.Text;
  messageText: Phaser.GameObjects.Text;
};

const HeroRoleByName: Record<string, 1 | 2 | 3 | 4 | 5> = {
  '悟空': 1,
  '唐僧': 2,
  '八戒': 3,
  '沙僧': 4,
  '白龙': 5,
};

export function createCraftingPanel(this: any): CraftingPanelView {
  const container = this.add.container(0, 0).setVisible(false);
  const source = this.add.container(CraftingUILayout.sourceOffset.x, CraftingUILayout.sourceOffset.y);
  container.add(source);

  const background = this.add.image(0, 0, CraftingAssetKeys.container).setOrigin(0, 0);
  const fusion = this.add.image(
    CraftingUILayout.fusionPanel.x,
    CraftingUILayout.fusionPanel.y,
    CraftingAssetKeys.fusionPanel,
  ).setOrigin(0, 0);
  source.add([background, fusion]);

  const selectors = CraftingUILayout.selectors.map((position, index) => {
    const selector = this.add.image(position.x, position.y, CraftingAssetKeys.role2Unselected)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    selector.on('pointerdown', () => selectCraftingOwner(this, index === 0 ? 'p1' : 'p2'));
    source.add(selector);
    return selector;
  });

  const materialIcons = CraftingUILayout.materialSlots.map((position, index) => {
    const icon = this.add.image(position.x, position.y, CraftingAssetKeys.tlzsp)
      .setOrigin(0, 0)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    icon.on('pointerdown', () => removeCraftingSlot(this, index));
    source.add(icon);
    return icon;
  });

  const previewIcon = this.add.image(
    CraftingUILayout.preview.x,
    CraftingUILayout.preview.y,
    CraftingAssetKeys.wptlz,
  ).setOrigin(0, 0).setVisible(false);
  const productIcon = this.add.image(
    CraftingUILayout.product.x,
    CraftingUILayout.product.y,
    CraftingAssetKeys.wptlz,
  ).setOrigin(0, 0).setVisible(false);
  source.add([previewIcon, productIcon]);

  const craftHitArea = this.add.rectangle(
    CraftingUILayout.craftButton.x,
    CraftingUILayout.craftButton.y,
    CraftingUILayout.craftButton.width,
    CraftingUILayout.craftButton.height,
    0xffffff,
    0.001,
  ).setOrigin(0, 0).setInteractive({ useHandCursor: true });
  craftHitArea.on('pointerover', () => fusion.setTint(0xfff2b0));
  craftHitArea.on('pointerout', () => fusion.clearTint());
  craftHitArea.on('pointerdown', () => craftCurrentSession(this));
  source.add(craftHitArea);

  const closeHitArea = this.add.rectangle(
    CraftingUILayout.closeButton.x,
    CraftingUILayout.closeButton.y,
    CraftingUILayout.closeButton.width,
    CraftingUILayout.closeButton.height,
    0xffffff,
    0.001,
  ).setOrigin(0, 0).setInteractive({ useHandCursor: true });
  closeHitArea.on('pointerdown', () => closeCraftingPanel(this));
  source.add(closeHitArea);

  const soulCover = this.add.rectangle(798, 544, 130, 36, 0x060606, 0.96).setOrigin(0, 0);
  const soulText = this.add.text(CraftingUILayout.soul.x, CraftingUILayout.soul.y, '', {
    color: '#fff7d6', fontFamily: 'Arial, sans-serif', fontSize: '23px', fontStyle: 'bold',
  }).setOrigin(0, 0);
  const previewText = this.add.text(302.45, 375.45, '', {
    color: '#fff4c0', fontFamily: 'Arial, sans-serif', fontSize: '17px',
  }).setOrigin(0, 0);
  const messageText = this.add.text(178, 492, '', {
    color: '#ffe29a', fontFamily: 'Arial, sans-serif', fontSize: '16px',
    backgroundColor: '#160b05cc', padding: { x: 8, y: 4 },
  }).setOrigin(0, 0);
  const categoryText = this.add.text(514, 101, '', {
    color: '#ffe29a', fontFamily: 'Arial, sans-serif', fontSize: '16px',
    backgroundColor: '#24130add', padding: { x: 8, y: 4 },
  }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
  categoryText.on('pointerdown', () => cycleCraftingInventoryCategory(this));
  source.add([soulCover, soulText, previewText, messageText, categoryText]);

  const inventoryCells = createInventoryCells(this, source);
  applyCraftingCanvasTransform(this, container);
  this.scale.on('resize', () => applyCraftingCanvasTransform(this, container));

  return {
    container, selectors, materialIcons, previewIcon, productIcon,
    inventoryCells, categoryText, soulText, previewText, messageText,
  };
}

export function updateCraftingPanelView(scene: any, view: CraftingPanelView): void {
  const runtime = scene.playerInventoryRuntimes[scene.inventoryOwner];
  if (!runtime.ui.isOpen) {
    view.container.setVisible(false);
    return;
  }
  view.container.setVisible(true);
  applyCraftingCanvasTransform(scene, view.container);

  const owners: PlayerSlot[] = scene.playerCount === 2 ? ['p1', 'p2'] : ['p1'];
  view.selectors.forEach((selector, index) => {
    const owner = owners[index];
    selector.setVisible(Boolean(owner));
    if (!owner) return;
    const role = HeroRoleByName[scene.getInventoryHeroName(owner)] ?? 2;
    const selected = owner === scene.inventoryOwner ? 'Selected' : 'Unselected';
    selector.setTexture(CraftingAssetKeys[`role${role}${selected}`]);
  });

  view.materialIcons.forEach((icon, index) => {
    const fillName = runtime.craftingSession.slots[index]?.entry.definition.fillName;
    const texture = getCraftingItemTexture(fillName);
    icon.setVisible(Boolean(texture));
    if (texture) icon.setTexture(texture);
  });

  const preview = previewCraftingSession(runtime.craftingSession, runtime.magicWeaponSoul);
  const previewTexture = getCraftingItemTexture(preview.recipe?.productFillName);
  view.previewIcon.setVisible(Boolean(previewTexture));
  if (previewTexture) view.previewIcon.setTexture(previewTexture);
  const productTexture = getCraftingItemTexture(runtime.craftingSession.lastProductFillName);
  view.productIcon.setVisible(Boolean(productTexture));
  if (productTexture) view.productIcon.setTexture(productTexture);
  view.soulText.setText(String(runtime.magicWeaponSoul));
  view.previewText.setText(preview.recipe ? `${preview.recipe.productName}  100%` : '无配方');
  view.messageText.setText(runtime.ui.message || runtime.craftingSession.message);
  view.categoryText.setText(
    `背包：${InventoryCategoryLabels[runtime.ui.activeCategory as InventoryCategory]}（点击/Tab切换）`,
  );
  updateInventoryCells(
    runtime.store.categories[runtime.ui.activeCategory],
    view.inventoryCells,
  );
}

function createInventoryCells(scene: any, source: Phaser.GameObjects.Container): CraftingInventoryCell[] {
  const cells: CraftingInventoryCell[] = [];
  const layout = CraftingUILayout.inventory;
  for (let index = 0; index < layout.columns * layout.rows; index += 1) {
    const x = layout.x + (index % layout.columns) * layout.cell;
    const y = layout.y + Math.floor(index / layout.columns) * layout.cell;
    const background = scene.add.rectangle(x, y, 52, 52, 0x24130a, 0.72)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x8b5a2b)
      .setInteractive({ useHandCursor: true });
    const icon = scene.add.image(x + 1, y + 1, CraftingAssetKeys.tlzsp)
      .setOrigin(0, 0)
      .setVisible(false);
    const label = scene.add.text(x + 3, y + 34, '', {
      color: '#fff1c2', fontFamily: 'Arial, sans-serif', fontSize: '11px',
      backgroundColor: '#120800bb',
    }).setOrigin(0, 0);
    background.on('pointerdown', () => stageInventoryCell(scene, index));
    background.on('pointerover', () => background.setStrokeStyle(2, 0xffdb72));
    background.on('pointerout', () => background.setStrokeStyle(1, 0x8b5a2b));
    source.add([background, icon, label]);
    cells.push({ background, icon, label });
  }
  return cells;
}

function updateInventoryCells(entries: readonly InventoryEntry[], cells: CraftingInventoryCell[]): void {
  cells.forEach((cell, index) => {
    const entry = entries[index];
    cell.background.setVisible(Boolean(entry));
    cell.label.setVisible(Boolean(entry));
    if (!entry) {
      cell.icon.setVisible(false);
      return;
    }
    const quantity = entry.kind === 'stack' ? `×${entry.quantity}` : '';
    cell.label.setText(`${entry.definition.name.slice(0, 4)}${quantity}`);
    const texture = getCraftingItemTexture(entry.definition.fillName);
    cell.icon.setVisible(Boolean(texture));
    if (texture) cell.icon.setTexture(texture);
  });
}

function selectCraftingOwner(scene: any, ownerSlot: PlayerSlot): void {
  if (ownerSlot === 'p2' && scene.playerCount !== 2) return;
  const current = scene.playerInventoryRuntimes[scene.inventoryOwner];
  if (current.ownerSlot !== ownerSlot) closeCraftingSession(current.craftingSession, current.store);
  scene.playerInventoryRuntimes.p1.ui.isOpen = ownerSlot === 'p1';
  scene.playerInventoryRuntimes.p2.ui.isOpen = ownerSlot === 'p2';
  scene.inventoryOwner = ownerSlot;
}

function stageInventoryCell(scene: any, index: number): void {
  const runtime = scene.playerInventoryRuntimes[scene.inventoryOwner];
  const entry = getInventoryEntries(runtime.store, runtime.ui.activeCategory)[index];
  const result = stageCraftingMaterial(runtime.craftingSession, runtime.store, entry);
  runtime.ui.message = result.message;
}

function removeCraftingSlot(scene: any, index: number): void {
  const runtime = scene.playerInventoryRuntimes[scene.inventoryOwner];
  const result = removeStagedCraftingMaterial(runtime.craftingSession, runtime.store, index);
  runtime.ui.message = result.message;
}

function craftCurrentSession(scene: any): void {
  const runtime = scene.playerInventoryRuntimes[scene.inventoryOwner];
  const result = craftStagedSession({
    session: runtime.craftingSession,
    store: runtime.store,
    registry: scene.equipmentRegistry,
    soul: runtime.magicWeaponSoul,
  });
  runtime.magicWeaponSoul = result.soulAfter;
  runtime.ui.message = result.message;
}

function closeCraftingPanel(scene: any): void {
  const runtime = scene.playerInventoryRuntimes[scene.inventoryOwner];
  const result = closeCraftingSession(runtime.craftingSession, runtime.store);
  runtime.ui.message = result.message;
  runtime.ui.isOpen = false;
}

function cycleCraftingInventoryCategory(scene: any): void {
  const runtime = scene.playerInventoryRuntimes[scene.inventoryOwner];
  selectNextInventoryCategory(runtime.ui, runtime.store, 1);
}

function getCraftingItemTexture(fillName: string | undefined): string | undefined {
  if (!fillName) return undefined;
  return CraftingItemTextureKeys[fillName as keyof typeof CraftingItemTextureKeys];
}

function applyCraftingCanvasTransform(scene: any, container: Phaser.GameObjects.Container): void {
  const camera = scene.cameras.main;
  const transform = getCraftingCanvasTransform(camera.width, camera.height);
  container.setPosition(transform.x, transform.y).setScale(transform.scale);
}
