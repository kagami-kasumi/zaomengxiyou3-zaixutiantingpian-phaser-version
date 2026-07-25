import Phaser from 'phaser';

import { fullFeatureUiAssets } from '../../assets/AssetManifest';
import { getInventoryItemAsset } from '../../assets/InventoryItemAssets';
import {
  inventoryUiAssets,
  type InventoryUiAssetDefinition,
} from '../../assets/InventoryUiAssets';
import { EquipmentSlotOrder } from '../../systems/EquipmentUISystem';
import {
  changeFormalInventoryPage,
  equipFormalInventorySelection,
  getFormalInventoryPageCount,
  getFormalInventoryPageEntries,
  getFormalInventoryPlayer,
  getSelectedFormalInventoryEntry,
  selectFormalEquipmentSlot,
  selectFormalInventoryCategory,
  selectFormalInventoryEntry,
  unequipFormalInventorySelection,
  type FormalInventoryPageModel,
} from '../../systems/FormalInventoryPageSystem';
import {
  InventoryCategories,
  type InventoryEntry,
} from '../../systems/InventorySystem';
import type { SaveStorage } from '../../systems/SaveSystem';

type Callbacks = Readonly<{
  onClose: () => void;
  onRerender: () => void;
}>;

const STAGE_OFFSET = { x: 753.95, y: 480.7 };
const GRID_ORIGIN = { x: 516.2, y: 152.35 };
const GRID_STEP = { x: 43, y: 41 };
const TAB_ORIGIN = { x: 516.2, y: 114.35 };
const TAB_STEP = 74;
const EQUIPMENT_SLOTS = [
  { x: 362.05, y: 166.65 },
  { x: 362.05, y: 241.65 },
  { x: 433.05, y: 166.65 },
  { x: 168.05, y: 166.65 },
  { x: 433.05, y: 241.65 },
  { x: 164.4, y: 244.9 },
] as const;

export function createFormalInventoryPageView(
  scene: Phaser.Scene,
  model: FormalInventoryPageModel,
  storage: SaveStorage,
  callbacks: Callbacks,
): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.image(
    -STAGE_OFFSET.x,
    -STAGE_OFFSET.y,
    fullFeatureUiAssets.backpack.key,
  ).setOrigin(0));

  InventoryCategories.forEach((category, index) => {
    objects.push(createNativeButton(
      scene,
      TAB_ORIGIN.x + index * TAB_STEP,
      TAB_ORIGIN.y,
      inventoryUiAssets[category],
      model.activeCategory === category,
      () => {
        selectFormalInventoryCategory(model, category);
        callbacks.onRerender();
      },
    ));
  });

  const entries = getFormalInventoryPageEntries(model);
  for (let index = 0; index < 25; index += 1) {
    const x = GRID_ORIGIN.x + (index % 5) * GRID_STEP.x;
    const y = GRID_ORIGIN.y + Math.floor(index / 5) * GRID_STEP.y;
    const entry = entries[index];
    const slot = scene.add.image(x, y, inventoryUiAssets.slot.key).setOrigin(0);
    if (model.entrySelectionArmed && model.selectedIndex === index) slot.setTint(0xffd56a);
    slot.setInteractive({ useHandCursor: true });
    slot.on('pointerover', () => slot.setTint(0xffefb0));
    slot.on('pointerout', () => {
      if (model.entrySelectionArmed && model.selectedIndex === index) slot.setTint(0xffd56a);
      else slot.clearTint();
    });
    slot.on('pointerdown', () => {
      const activate = Boolean(entry) &&
        model.entrySelectionArmed &&
        model.selectedIndex === index;
      selectFormalInventoryEntry(model, index);
      if (activate) equipFormalInventorySelection(model, storage);
      callbacks.onRerender();
    });
    objects.push(slot);
    if (entry) objects.push(...createEntryVisual(scene, entry, x, y));
  }

  const player = getFormalInventoryPlayer(model);
  EquipmentSlotOrder.forEach((equipmentSlot, index) => {
    const position = EQUIPMENT_SLOTS[index]!;
    const equipped = player.equipmentLoadout[equipmentSlot];
    const hit = scene.add.zone(position.x, position.y, 50, 50)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      const activate = model.slotSelectionArmed && model.selectedSlotIndex === index;
      selectFormalEquipmentSlot(model, index);
      if (activate) unequipFormalInventorySelection(model, storage);
      callbacks.onRerender();
    });
    objects.push(hit);
    if (equipped) {
      const asset = getInventoryItemAsset(equipped.definition.fillName);
      if (asset) {
        objects.push(scene.add.image(position.x + 25, position.y + 25, asset.key)
          .setDisplaySize(32, 32));
      }
    }
  });

  objects.push(createNativeButton(
    scene,
    609,
    472.45,
    inventoryUiAssets.previous,
    false,
    () => {
      changeFormalInventoryPage(model, -1);
      callbacks.onRerender();
    },
  ));
  objects.push(createNativeButton(
    scene,
    727.2,
    472.45,
    inventoryUiAssets.next,
    false,
    () => {
      changeFormalInventoryPage(model, 1);
      callbacks.onRerender();
    },
  ));
  objects.push(createNativeButton(
    scene,
    809.5,
    59.85,
    inventoryUiAssets.close,
    false,
    callbacks.onClose,
  ));

  const selected = getSelectedFormalInventoryEntry(model);
  objects.push(scene.add.text(516, 365, formatSelectedDetails(selected), {
    color: '#f6e8c7',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '13px',
    lineSpacing: 3,
    wordWrap: { width: 295 },
  }));
  objects.push(scene.add.text(702, 478.85, String(model.pageIndex + 1), {
    color: '#ffffff',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '16px',
  }).setOrigin(0.5, 0));
  objects.push(scene.add.text(516, 430, `${model.owner.toUpperCase()} · ${model.message}`, {
    color: '#fff1b5',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '13px',
    wordWrap: { width: 295 },
  }));
  objects.push(scene.add.text(663, 450.5, String(player.soulCount), {
    color: '#ffffff',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '15px',
  }));
  objects.push(scene.add.text(736, 478.85, `/ ${getFormalInventoryPageCount(model)}`, {
    color: '#ffffff',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '12px',
  }));

  return scene.add.container(0, 0, objects).setDepth(20);
}

function createEntryVisual(
  scene: Phaser.Scene,
  entry: InventoryEntry,
  x: number,
  y: number,
): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const asset = getInventoryItemAsset(entry.definition.fillName);
  if (asset) objects.push(scene.add.image(x + 16, y + 16, asset.key).setDisplaySize(32, 32));
  if (entry.kind === 'stack' && entry.quantity > 1) {
    objects.push(scene.add.text(x + 30, y + 29, String(entry.quantity), {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1));
  }
  return objects;
}

function createNativeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  assets: Readonly<Record<'up' | 'over' | 'down', InventoryUiAssetDefinition>>,
  selected: boolean,
  onClick: () => void,
): Phaser.GameObjects.Image {
  const image = scene.add.image(x, y, selected ? assets.down.key : assets.up.key)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  image.on('pointerover', () => {
    if (!selected) image.setTexture(assets.over.key);
  });
  image.on('pointerout', () => image.setTexture(selected ? assets.down.key : assets.up.key));
  image.on('pointerdown', () => image.setTexture(assets.down.key));
  image.on('pointerup', () => {
    onClick();
    if (image.active) image.setTexture(selected ? assets.down.key : assets.over.key);
  });
  return image;
}

function formatSelectedDetails(entry: InventoryEntry | undefined): string {
  if (!entry) return '';
  const definition = entry.definition;
  return [
    `${definition.name}　${definition.quality}　${definition.user || '通用'}`,
    entry.kind === 'equipment'
      ? `实例：${entry.instanceId}`
      : `数量：${entry.quantity}`,
  ].join('\n');
}
