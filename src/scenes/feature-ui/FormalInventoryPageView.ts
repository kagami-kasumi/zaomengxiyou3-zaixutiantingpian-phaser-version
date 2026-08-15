import Phaser from 'phaser';

// boundary: this view projects verified page truth and dispatches model actions;
// it does not own inventory, save, equipment transactions, or truth generation.
import {
  fullFeatureUiAssets,
  role1CombatAtlases,
  role2CombatAtlases,
  role3CombatAtlases,
  role4BodyFamilyAssets,
  role5SpearBodyFamilyAssets,
} from '../../assets/AssetManifest';
import { getInventoryItemAsset } from '../../assets/InventoryItemAssets';
import { inventoryUiAssets } from '../../assets/InventoryUiAssets';
import { EquipmentSlotOrder } from '../../systems/EquipmentUISystem';
import { getEquipmentPreviewLayers } from '../../systems/EquipmentPreviewSystem';
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
import {
  getEquipmentPageInventorySlotIds,
  getEquipmentPageTruthObject,
  getEquipmentPageTruthPlacement,
  type EquipmentPageTruthStateId,
} from '../../systems/EquipmentPageTruthSystem';
import {
  createInventoryGridObjects,
  createInventoryItemIcon,
  createNativeInventoryButton,
} from './InventoryGridView';

type Callbacks = Readonly<{ onClose: () => void; onRerender: () => void }>;

const STAGE_OFFSET = { x: 753.95, y: 480.7 };
const EQUIPMENT_SLOT_TRUTH_IDS = [
  'weapon-slot', 'armor-slot', 'accessory-slot', 'fashion-slot', 'magic-weapon-slot', 'title-slot',
] as const;
const FIELD_TRUTH_IDS = [
  'hero-name', 'fighting-force', 'hp', 'mp', 'attack', 'defense',
  'luck', 'magic-defense', 'critical', 'evasion', 'hp-regen', 'mp-regen',
] as const;
// The exported frame bitmap retains the Flash sprite registration outside its visible stage bounds.
// Placement still comes from the truth object; this offset maps that placement to the exported bitmap origin.
const EXP_PROGRESS_ASSET_REGISTRATION = { x: 344, y: 9.9 } as const;
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
  const truthState = resolveTruthState(model);
  const rootPlacement = getEquipmentPageTruthPlacement('equipment-page-root', truthState);
  const objects: Phaser.GameObjects.GameObject[] = [
    scene.add.image(
      rootPlacement.stageBounds.left - STAGE_OFFSET.x,
      rootPlacement.stageBounds.top - STAGE_OFFSET.y,
      fullFeatureUiAssets.backpack.key,
    ).setOrigin(0).setName('equipment-truth-equipment-page-root'),
  ];
  const player = getFormalInventoryPlayer(model);
  const presentation = getFormalInventoryPresentation(model, runtime);
  let operationLayer: Phaser.GameObjects.GameObject[] = [];

  InventoryCategories.forEach((category) => {
    const placement = getEquipmentPageTruthPlacement(`tab-${category}`, truthState);
    objects.push(createNativeInventoryButton(scene, placement.stageBounds.left, placement.stageBounds.top,
      inventoryUiAssets[category], model.activeCategory === category, () => {
        selectFormalInventoryCategory(model, category);
        callbacks.onRerender();
      }));
  });

  const projection = createInventoryGridProjection(
    getFormalInventoryPageEntries(model),
    model.entrySelectionArmed ? model.selectedIndex : undefined,
  );
  const slotIds = getEquipmentPageInventorySlotIds();
  const firstSlot = getEquipmentPageTruthPlacement(slotIds[0]!, truthState);
  const gridOrigin = { x: firstSlot.stageBounds.left, y: firstSlot.stageBounds.top };
  objects.push(...createInventoryGridObjects(scene, projection, gridOrigin, (cell) => {
      selectFormalInventoryEntry(model, cell.index);
      callbacks.onRerender();
  }));
  const selectedCell = projection.find((cell) => cell.selected && cell.entry);
  if (selectedCell?.entry) {
    operationLayer = createOperationLayer(
      scene,
      model,
      storage,
      callbacks,
      selectedCell.entry,
      gridOrigin.x + selectedCell.x + getEquipmentPageTruthPlacement(
        selectedCell.entry.kind === 'equipment' ? 'equipment-operation-layer' : 'item-operation-layer',
        truthState,
      ).localMatrix.tx,
      gridOrigin.y + selectedCell.y + getEquipmentPageTruthPlacement(
        selectedCell.entry.kind === 'equipment' ? 'equipment-operation-layer' : 'item-operation-layer',
        truthState,
      ).localMatrix.ty,
    );
  }

  EquipmentSlotOrder.forEach((equipmentSlot, index) => {
    const placement = getEquipmentPageTruthPlacement(EQUIPMENT_SLOT_TRUTH_IDS[index]!, truthState);
    const position = {
      x: placement.stageBounds.left,
      y: placement.stageBounds.top,
    };
    const equipped = player.equipmentLoadout[equipmentSlot];
    const hit = scene.add.zone(
      position.x,
      position.y + 2,
      placement.stageBounds.width,
      placement.stageBounds.height,
    ).setOrigin(0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      selectFormalEquipmentSlot(model, index);
      if (equipped) unequipFormalInventorySelection(model, storage);
      callbacks.onRerender();
    });
    objects.push(hit);
    if (equipped) {
      const asset = getInventoryItemAsset(equipped.definition.fillName);
      if (asset) objects.push(createInventoryItemIcon(
        scene,
        position.x + placement.stageBounds.width / 2,
        position.y + placement.stageBounds.height / 2,
        asset.key,
      ));
    }
  });

  objects.push(...createHeroProjection(scene, presentation.heroId, player.equipmentLoadout, truthState));
  objects.push(...createLevelProjection(scene, presentation.level, truthState));
  const expProgress = getEquipmentPageTruthPlacement('experience-progress', truthState);
  objects.push(scene.add.image(
    expProgress.stageBounds.left - EXP_PROGRESS_ASSET_REGISTRATION.x,
    expProgress.stageBounds.top - EXP_PROGRESS_ASSET_REGISTRATION.y,
    inventoryUiAssets.exp.frames[presentation.expFrame - 1]!.key,
  ).setOrigin(0));
  const fashionToggle = getEquipmentPageTruthPlacement(
    player.equipmentLoadout.fashion ? 'fashion-toggle-shown' : 'fashion-toggle-hidden',
    truthState,
  );
  objects.push(scene.add.image(fashionToggle.stageBounds.left, fashionToggle.stageBounds.top, player.equipmentLoadout.fashion
    ? inventoryUiAssets.fashionToggle.shown.key : inventoryUiAssets.fashionToggle.hidden.key).setOrigin(0));
  const sellWhite = getEquipmentPageTruthPlacement('sell-white', truthState);
  objects.push(createNativeInventoryButton(scene, sellWhite.stageBounds.left, sellWhite.stageBounds.top,
    inventoryUiAssets.sellWhite, false, () => undefined));

  const fields: readonly string[] = [
    presentation.heroName, String(presentation.fightingForce),
    `${presentation.currentHp} / ${presentation.maxHp}`,
    `${presentation.currentMp} / ${presentation.maxMp}`,
    String(presentation.power), String(Math.round(presentation.defense)),
    `${presentation.luckPercent} %`, `${presentation.magicDefensePercent} %`,
    `${presentation.critPercent} %`, `${presentation.missPercent} %`,
    String(presentation.hpRegen), String(presentation.mpRegen),
  ];
  fields.forEach((value, index) => {
    const placement = getEquipmentPageTruthPlacement(FIELD_TRUTH_IDS[index]!, truthState);
    objects.push(scene.add.text(placement.stageBounds.left, placement.stageBounds.top, value, FIELD_STYLE));
  });
  const experienceValue = getEquipmentPageTruthPlacement('experience-value', truthState);
  objects.push(scene.add.text(
    experienceValue.stageBounds.left + experienceValue.stageBounds.width / 2,
    experienceValue.stageBounds.top,
    presentation.maxLevel ? 'MAX' : `${presentation.currentExp} / ${presentation.expToNext}`,
    FIELD_STYLE,
  ).setOrigin(0.5, 0));
  const soulValue = getEquipmentPageTruthPlacement('soul-value', truthState);
  const soulTextStyle = getEquipmentPageTruthObject('soul-value').textStyle;
  if (
    !soulTextStyle?.fontFamily
    || !soulTextStyle.fontSizePx
    || soulTextStyle.leftGutterPx === undefined
    || soulTextStyle.topGutterPx === undefined
  ) throw new Error('Verified soul TextField style is missing.');
  objects.push(scene.add.text(
    soulValue.stageBounds.left + soulTextStyle.leftGutterPx,
    soulValue.stageBounds.top + soulTextStyle.topGutterPx,
    String(presentation.soulCount),
    {
      color: soulTextStyle.color ?? '#ffffff',
      fontFamily: soulTextStyle.fontFamily,
      fontSize: `${soulTextStyle.fontSizePx}px`,
    },
  ));
  const pageValue = getEquipmentPageTruthPlacement('page-value', truthState);
  objects.push(scene.add.text(
    pageValue.stageBounds.left + pageValue.stageBounds.width / 2,
    pageValue.stageBounds.top,
    `${model.pageIndex + 1}/${getFormalInventoryPageCount(model)}`,
    FIELD_STYLE,
  ).setOrigin(0.5, 0));

  const previousPage = getEquipmentPageTruthPlacement('previous-page', truthState);
  objects.push(createNativeInventoryButton(scene, previousPage.stageBounds.left, previousPage.stageBounds.top,
    inventoryUiAssets.previous, false, () => {
    changeFormalInventoryPage(model, -1); callbacks.onRerender();
  }));
  const nextPage = getEquipmentPageTruthPlacement('next-page', truthState);
  objects.push(createNativeInventoryButton(scene, nextPage.stageBounds.left, nextPage.stageBounds.top,
    inventoryUiAssets.next, false, () => {
    changeFormalInventoryPage(model, 1); callbacks.onRerender();
  }));
  const close = getEquipmentPageTruthPlacement('close', truthState);
  objects.push(createNativeInventoryButton(scene, close.stageBounds.left, close.stageBounds.top,
    inventoryUiAssets.close, false, callbacks.onClose));
  objects.push(...operationLayer);
  return scene.add.container(0, 0, objects).setDepth(20);
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

function createHeroProjection(
  scene: Phaser.Scene,
  heroId: number,
  loadout: ReturnType<typeof getFormalInventoryPlayer>['equipmentLoadout'],
  truthState: EquipmentPageTruthStateId,
): Phaser.GameObjects.GameObject[] {
  const preview = getEquipmentPageTruthPlacement('hero-preview', truthState);
  const anchorX = preview.stageBounds.left;
  const anchorY = preview.stageBounds.top + 49.15;
  const family = heroId === 1 ? role1CombatAtlases : heroId === 2 ? role2CombatAtlases : heroId === 3
    ? role3CombatAtlases : heroId === 4
      ? { body: role4BodyFamilyAssets.shovel0, equipment: role4BodyFamilyAssets.equipment0 }
      : { body: role5SpearBodyFamilyAssets.body0, equipment: role5SpearBodyFamilyAssets.equipment0 };
  const scale = heroId === 5 ? 0.85 : heroId === 3 ? 0.7 : 0.68;
  const layers = getEquipmentPreviewLayers(heroId, loadout);
  const replacesBody = layers.some((layer) => layer.mode === 'role4-dual-body-branch'
    || layer.mode === 'role5-dynamic-fashion-layers'
    || (layer.mode === 'layered-role-resource' && loadout.armor?.definition.fillName === layer.fillName));
  const objects: Phaser.GameObjects.GameObject[] = [];
  if (!replacesBody) {
    objects.push(scene.add.sprite(anchorX, anchorY, family.body.key, 0).setOrigin(0.5, 1).setScale(scale));
  }
  layers.forEach((layer) => {
    const x = anchorX + layer.offset.x;
    const y = anchorY + layer.offset.y;
    if (layer.asset.kind === 'spritesheet') {
      objects.push(scene.add.sprite(x, y, layer.asset.key, 0).setOrigin(0.5, 1).setScale(scale));
      return;
    }
    const bounds = layer.asset.visibleBounds;
    const image = scene.add.image(x, y, layer.asset.key)
      .setOrigin(-bounds.left / bounds.width, -bounds.top / bounds.height)
      .setScale(scale);
    objects.push(image);
  });
  return objects;
}

function createLevelProjection(
  scene: Phaser.Scene,
  level: number,
  truthState: EquipmentPageTruthStateId,
): Phaser.GameObjects.GameObject[] {
  const placement = getEquipmentPageTruthPlacement('level-container', truthState);
  const x = placement.stageBounds.left;
  const y = placement.stageBounds.top;
  const digits = String(level).split('');
  const objects: Phaser.GameObjects.GameObject[] = [scene.add.image(x, y, inventoryUiAssets.level.plate.key).setOrigin(0)];
  digits.forEach((digit, index) => {
    const localX = digits.length === 1 ? 21.8 : 5.8 + index * 26;
    objects.push(scene.add.image(x + localX, y + 13, inventoryUiAssets.level.digits[Number(digit)]!.key).setOrigin(0));
  });
  return objects;
}

function resolveTruthState(model: FormalInventoryPageModel): EquipmentPageTruthStateId {
  const player = getFormalInventoryPlayer(model);
  if (model.entrySelectionArmed) {
    const entry = getFormalInventoryPageEntries(model)[model.selectedIndex];
    return entry?.kind === 'equipment' ? 'p1-equipment-selected' : 'p1-item-selected';
  }
  if (model.activeCategory === 'fashion' && player.equipmentLoadout.fashion) return 'p1-fashion-shown';
  if (model.pageIndex === 1) return 'p1-equipment-page-2';
  const equipped = EquipmentSlotOrder.some((slot) => player.equipmentLoadout[slot]);
  if (model.owner === 'p2' && equipped) return 'p2-equipped-page-1';
  return equipped ? 'p1-equipped-page-1' : 'p1-empty-page-1';
}
