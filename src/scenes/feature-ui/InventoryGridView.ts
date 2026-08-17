import Phaser from 'phaser';

import { getInventoryItemAsset } from '../../assets/InventoryItemAssets';
import { inventoryUiAssets, type InventoryUiAssetDefinition } from '../../assets/InventoryUiAssets';
import type { InventoryItemCell } from '../../systems/InventoryGridProjection';
import type { InventoryEntry } from '../../systems/InventorySystem';

const ItemIconContentSize = 32;
const ItemIconFrameInset = 9;
const WorkshopSlotContentWidth = 63;
const WorkshopSlotContentHeight = 62;
const WorkshopSlotVisibleOffsetX = -7;
const WorkshopSlotVisibleOffsetY = -7;

export type InventoryGridOrigin = Readonly<{ x: number; y: number }>;
export type InventoryGridHoverCallbacks = Readonly<{
  onEquipmentOver: (entry: Extract<InventoryEntry, { kind: 'equipment' }>, pointer: Phaser.Input.Pointer) => void;
  onEquipmentMove: (pointer: Phaser.Input.Pointer) => void;
  onEquipmentOut: () => void;
}>;

export function createInventoryGridObjects(
  scene: Phaser.Scene,
  cells: readonly InventoryItemCell[],
  origin: InventoryGridOrigin,
  onCell: (cell: InventoryItemCell) => void,
  hoverCallbacks?: InventoryGridHoverCallbacks,
): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  for (const cell of cells) {
    const x = origin.x + cell.x;
    const y = origin.y + cell.y;
    const slot = scene.add.image(x, y, inventoryUiAssets.slot.key).setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .setData('inventoryGridCell', {
        index: cell.index,
        empty: cell.empty,
        selected: cell.selected,
      });
    slot.on('pointerdown', () => onCell(cell));
    if (cell.entry?.kind === 'equipment' && hoverCallbacks) {
      slot.on('pointerover', (pointer: Phaser.Input.Pointer) => hoverCallbacks.onEquipmentOver(cell.entry as Extract<InventoryEntry, { kind: 'equipment' }>, pointer));
      slot.on('pointermove', (pointer: Phaser.Input.Pointer) => hoverCallbacks.onEquipmentMove(pointer));
      slot.on('pointerout', hoverCallbacks.onEquipmentOut);
    }
    objects.push(slot);
    if (cell.entry) objects.push(...createInventoryEntryVisual(scene, cell.entry, x, y));
  }
  return objects;
}

export function createInventoryItemIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  textureKey: string,
): Phaser.GameObjects.Image {
  const icon = scene.add.image(x, y, textureKey);
  const cropWidth = Math.max(1, icon.width - ItemIconFrameInset * 2);
  const cropHeight = Math.max(1, icon.height - ItemIconFrameInset * 2);
  return icon.setCrop(ItemIconFrameInset, ItemIconFrameInset, cropWidth, cropHeight)
    .setScale(ItemIconContentSize / cropWidth, ItemIconContentSize / cropHeight);
}

export function createWorkshopSlotItemIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  textureKey: string,
): Phaser.GameObjects.Image {
  const icon = scene.add.image(x, y, textureKey);
  const cropWidth = Math.max(1, icon.width - ItemIconFrameInset * 2);
  const cropHeight = Math.max(1, icon.height - ItemIconFrameInset * 2);
  return icon.setPosition(x + WorkshopSlotVisibleOffsetX, y + WorkshopSlotVisibleOffsetY)
    .setCrop(ItemIconFrameInset, ItemIconFrameInset, cropWidth, cropHeight)
    .setScale(WorkshopSlotContentWidth / cropWidth, WorkshopSlotContentHeight / cropHeight)
    .setData('workshopSlotItemIcon', true);
}

export function createNativeInventoryButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  assets: Readonly<Record<'up' | 'over' | 'down', InventoryUiAssetDefinition>>,
  selected: boolean,
  onClick: () => void,
): Phaser.GameObjects.Image {
  const image = scene.add.image(x, y, selected ? assets.down.key : assets.up.key).setOrigin(0)
    .setInteractive({ useHandCursor: true });
  image.on('pointerover', () => { if (!selected) image.setTexture(assets.over.key); });
  image.on('pointerout', () => image.setTexture(selected ? assets.down.key : assets.up.key));
  image.on('pointerdown', () => image.setTexture(assets.down.key));
  image.on('pointerup', () => {
    onClick();
    if (image.active) image.setTexture(selected ? assets.down.key : assets.over.key);
  });
  return image;
}

function createInventoryEntryVisual(
  scene: Phaser.Scene,
  entry: InventoryEntry,
  x: number,
  y: number,
): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const asset = getInventoryItemAsset(entry.definition.fillName);
  if (asset) objects.push(createInventoryItemIcon(scene, x + 25, y + 25.5, asset.key));
  if (entry.kind === 'stack' && entry.quantity > 1) {
    objects.push(scene.add.text(x + 46, y + 47, String(entry.quantity), {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1));
  }
  return objects;
}
