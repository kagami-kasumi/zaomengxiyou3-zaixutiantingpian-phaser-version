import Phaser from 'phaser';

import {
  fullFeatureUiAssets,
  role1CombatAtlases,
  role2CombatAtlases,
  role3CombatAtlases,
  role4BodyFamilyAssets,
  role5SpearBodyFamilyAssets,
} from '../../assets/AssetManifest';
import { getInventoryItemAsset } from '../../assets/InventoryItemAssets';
import { inventoryUiAssets, type InventoryUiAssetDefinition } from '../../assets/InventoryUiAssets';
import { EquipmentSlotOrder } from '../../systems/EquipmentUISystem';
import {
  canEquipFormalInventorySelection,
  changeFormalInventoryPage,
  equipFormalInventorySelection,
  getFormalInventoryPageCount,
  getFormalInventoryPageEntries,
  getFormalInventoryPlayer,
  getFormalInventoryPresentation,
  selectFormalEquipmentSlot,
  selectFormalInventoryCategory,
  selectFormalInventoryEntry,
  unequipFormalInventorySelection,
  type FormalInventoryPageModel,
  type FormalInventoryRuntimePresentation,
} from '../../systems/FormalInventoryPageSystem';
import { createInventoryGridProjection } from '../../systems/InventoryGridProjection';
import { InventoryCategories, type InventoryEntry } from '../../systems/InventorySystem';
import type { SaveStorage } from '../../systems/SaveSystem';

type Callbacks = Readonly<{ onClose: () => void; onRerender: () => void }>;

const STAGE_OFFSET = { x: 753.95, y: 480.7 };
const GRID_ORIGIN = { x: 516.2, y: 152.35 };
const TAB_ORIGIN = { x: 516.2, y: 114.35 };
const TAB_STEP = 74;
const EXP_BAR_TOP_LEFT = { x: -32.4, y: 480.05 };
const EXP_TEXT_CENTER = 311.6;
const SOUL_VALUE_RIGHT = 729;
const PAGE_VALUE_CENTER = 711.1;
const ITEM_ICON_CONTENT_SIZE = 32;
const ITEM_ICON_FRAME_INSET = 9;
const EQUIPMENT_SLOTS = [
  { x: 362.05, y: 166.65 },
  { x: 362.05, y: 241.65 },
  { x: 433.05, y: 166.65 },
  { x: 168.05, y: 166.65 },
  { x: 433.05, y: 241.65 },
  { x: 164.4, y: 244.9 },
] as const;
const FIELD_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  color: '#ffffff',
  fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
  fontSize: '13px',
};

export function createFormalInventoryPageView(
  scene: Phaser.Scene,
  model: FormalInventoryPageModel,
  storage: SaveStorage,
  callbacks: Callbacks,
  runtime?: FormalInventoryRuntimePresentation,
): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [
    scene.add.image(-STAGE_OFFSET.x, -STAGE_OFFSET.y, fullFeatureUiAssets.backpack.key).setOrigin(0),
  ];
  const player = getFormalInventoryPlayer(model);
  const presentation = getFormalInventoryPresentation(model, runtime);
  let operationLayer: Phaser.GameObjects.GameObject[] = [];

  InventoryCategories.forEach((category, index) => {
    objects.push(createNativeButton(scene, TAB_ORIGIN.x + index * TAB_STEP, TAB_ORIGIN.y,
      inventoryUiAssets[category], model.activeCategory === category, () => {
        selectFormalInventoryCategory(model, category);
        callbacks.onRerender();
      }));
  });

  const projection = createInventoryGridProjection(
    getFormalInventoryPageEntries(model),
    model.entrySelectionArmed ? model.selectedIndex : undefined,
  );
  for (const cell of projection) {
    const x = GRID_ORIGIN.x + cell.x;
    const y = GRID_ORIGIN.y + cell.y;
    const slot = scene.add.image(x, y, inventoryUiAssets.slot.key).setOrigin(0)
      .setInteractive({ useHandCursor: true });
    slot.on('pointerdown', () => {
      selectFormalInventoryEntry(model, cell.index);
      callbacks.onRerender();
    });
    objects.push(slot);
    if (cell.entry) objects.push(...createEntryVisual(scene, cell.entry, x, y));
    if (cell.selected && cell.entry) {
      operationLayer = createOperationLayer(scene, model, storage, callbacks, cell.entry, x + 25, y + 25);
    }
  }

  EquipmentSlotOrder.forEach((equipmentSlot, index) => {
    const position = EQUIPMENT_SLOTS[index]!;
    const equipped = player.equipmentLoadout[equipmentSlot];
    const hit = scene.add.zone(position.x, position.y, 50, 51).setOrigin(0)
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
      if (asset) objects.push(createFramelessItemIcon(scene, position.x + 25, position.y + 23, asset.key));
    }
  });

  objects.push(...createHeroProjection(scene, presentation.heroId, player.equipmentLoadout.weapon !== null
    || player.equipmentLoadout.armor !== null || player.equipmentLoadout.title !== null));
  objects.push(...createLevelProjection(scene, presentation.level));
  objects.push(scene.add.image(
    EXP_BAR_TOP_LEFT.x,
    EXP_BAR_TOP_LEFT.y,
    inventoryUiAssets.exp.frames[presentation.expFrame - 1]!.key,
  ).setOrigin(0));
  objects.push(scene.add.image(168.05, 218.85, player.equipmentLoadout.fashion
    ? inventoryUiAssets.fashionToggle.shown.key : inventoryUiAssets.fashionToggle.hidden.key).setOrigin(0));
  objects.push(createNativeButton(scene, 747.5, 445.5, inventoryUiAssets.sellWhite, false, () => undefined));

  const fields: readonly [number, number, string][] = [
    [237.45, 120.6, presentation.heroName], [234.45, 146.35, String(presentation.fightingForce)],
    [214.5, 313.6, `${presentation.currentHp} / ${presentation.maxHp}`],
    [378.3, 313.55, `${presentation.currentMp} / ${presentation.maxMp}`],
    [215.25, 347, String(presentation.power)], [378.25, 347, String(Math.round(presentation.defense))],
    [213.5, 381, `${presentation.luckPercent} %`], [377.5, 381, `${presentation.magicDefensePercent} %`],
    [213.5, 414.1, `${presentation.critPercent} %`], [376.1, 414.55, `${presentation.missPercent} %`],
    [215.1, 447.5, String(presentation.hpRegen)], [377.3, 447.05, String(presentation.mpRegen)],
  ];
  fields.forEach(([x, y, value]) => objects.push(scene.add.text(x, y, value, FIELD_STYLE)));
  objects.push(scene.add.text(
    EXP_TEXT_CENTER,
    482.05,
    presentation.maxLevel ? 'MAX' : `${presentation.currentExp} / ${presentation.expToNext}`,
    FIELD_STYLE,
  ).setOrigin(0.5, 0));
  objects.push(scene.add.text(SOUL_VALUE_RIGHT, 450.5, String(presentation.soulCount), FIELD_STYLE).setOrigin(1, 0));
  objects.push(scene.add.text(
    PAGE_VALUE_CENTER,
    478.85,
    `${model.pageIndex + 1}/${getFormalInventoryPageCount(model)}`,
    FIELD_STYLE,
  ).setOrigin(0.5, 0));

  objects.push(createNativeButton(scene, 609, 472.45, inventoryUiAssets.previous, false, () => {
    changeFormalInventoryPage(model, -1); callbacks.onRerender();
  }));
  objects.push(createNativeButton(scene, 727.2, 472.45, inventoryUiAssets.next, false, () => {
    changeFormalInventoryPage(model, 1); callbacks.onRerender();
  }));
  objects.push(createNativeButton(scene, 809.5, 59.85, inventoryUiAssets.close, false, callbacks.onClose));
  objects.push(...operationLayer);
  return scene.add.container(0, 0, objects).setDepth(20);
}

function createFramelessItemIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  textureKey: string,
): Phaser.GameObjects.Image {
  const icon = scene.add.image(x, y, textureKey);
  const cropWidth = Math.max(1, icon.width - ITEM_ICON_FRAME_INSET * 2);
  const cropHeight = Math.max(1, icon.height - ITEM_ICON_FRAME_INSET * 2);
  return icon.setCrop(ITEM_ICON_FRAME_INSET, ITEM_ICON_FRAME_INSET, cropWidth, cropHeight)
    .setScale(ITEM_ICON_CONTENT_SIZE / cropWidth, ITEM_ICON_CONTENT_SIZE / cropHeight);
}

function createEntryVisual(scene: Phaser.Scene, entry: InventoryEntry, x: number, y: number): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const asset = getInventoryItemAsset(entry.definition.fillName);
  if (asset) objects.push(createFramelessItemIcon(scene, x + 25, y + 25.5, asset.key));
  if (entry.kind === 'stack' && entry.quantity > 1) {
    objects.push(scene.add.text(x + 46, y + 47, String(entry.quantity), {
      color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '11px', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1));
  }
  return objects;
}

function createOperationLayer(
  scene: Phaser.Scene,
  model: FormalInventoryPageModel,
  storage: SaveStorage,
  callbacks: Callbacks,
  entry: InventoryEntry,
  x: number,
  y: number,
): Phaser.GameObjects.GameObject[] {
  const objects: Phaser.GameObjects.GameObject[] = [];
  if (entry.kind !== 'equipment') {
    objects.push(scene.add.image(x, y, inventoryUiAssets.operationSimple.background.key).setOrigin(0));
    objects.push(scene.add.image(x + 43.5, y + 18.5, inventoryUiAssets.operationSimple.useDisabled.key));
    objects.push(scene.add.image(x + 43.5, y + 89, inventoryUiAssets.operationSimple.discardDisabled.key));
    objects.push(scene.add.image(x + 5, y + 38.5, inventoryUiAssets.operationShared.giveDisabled.key).setOrigin(0));
    return objects;
  }
  const canEquip = canEquipFormalInventorySelection(model);
  objects.push(scene.add.image(x, y, inventoryUiAssets.operationThree.background.key).setOrigin(0));
  const equip = scene.add.image(x + 2.25, y + 4.2, canEquip
    ? inventoryUiAssets.operationThree.equipEnabled.key : inventoryUiAssets.operationThree.equipDisabled.key).setOrigin(0);
  if (canEquip) {
    equip.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      equipFormalInventorySelection(model, storage); callbacks.onRerender();
    });
  }
  objects.push(equip);
  objects.push(scene.add.image(x + 2.6, y + 40.1, inventoryUiAssets.operationShared.giveDisabled.key).setOrigin(0));
  objects.push(scene.add.image(x + 3.1, y + 78.1, inventoryUiAssets.operationThree.sellDisabled.key).setOrigin(0));
  return objects;
}

function createHeroProjection(scene: Phaser.Scene, heroId: number, showEquipment: boolean): Phaser.GameObjects.GameObject[] {
  const family = heroId === 1 ? role1CombatAtlases : heroId === 2 ? role2CombatAtlases : heroId === 3
    ? role3CombatAtlases : heroId === 4
      ? { body: role4BodyFamilyAssets.shovel0, equipment: role4BodyFamilyAssets.equipment0 }
      : { body: role5SpearBodyFamilyAssets.body0, equipment: role5SpearBodyFamilyAssets.equipment0 };
  const scale = heroId === 5 ? 0.85 : heroId === 3 ? 0.7 : 0.68;
  const body = scene.add.sprite(280.25, 285, family.body.key, 0).setOrigin(0.5, 1).setScale(scale);
  const objects: Phaser.GameObjects.GameObject[] = [body];
  if (showEquipment) objects.push(scene.add.sprite(280.25, 285, family.equipment.key, 0).setOrigin(0.5, 1).setScale(scale));
  return objects;
}

function createLevelProjection(scene: Phaser.Scene, level: number): Phaser.GameObjects.GameObject[] {
  const x = 378.95;
  const y = 105.85;
  const digits = String(level).split('');
  const objects: Phaser.GameObjects.GameObject[] = [scene.add.image(x, y, inventoryUiAssets.level.plate.key).setOrigin(0)];
  digits.forEach((digit, index) => {
    const localX = digits.length === 1 ? 21.8 : 5.8 + index * 26;
    objects.push(scene.add.image(x + localX, y + 13, inventoryUiAssets.level.digits[Number(digit)]!.key).setOrigin(0));
  });
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
  const image = scene.add.image(x, y, selected ? assets.down.key : assets.up.key).setOrigin(0)
    .setInteractive({ useHandCursor: true });
  image.on('pointerover', () => { if (!selected) image.setTexture(assets.over.key); });
  image.on('pointerout', () => image.setTexture(selected ? assets.down.key : assets.up.key));
  image.on('pointerdown', () => image.setTexture(assets.down.key));
  image.on('pointerup', () => { onClick(); if (image.active) image.setTexture(selected ? assets.down.key : assets.over.key); });
  return image;
}
