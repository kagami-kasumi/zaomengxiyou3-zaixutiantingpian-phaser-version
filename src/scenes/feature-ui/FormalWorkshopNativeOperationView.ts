import Phaser from 'phaser';

import fusionTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-fusion.json';
import makingTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-making.json';
import resolutionTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-resolution.json';
import strengthTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-strength.json';
import { craftingAssets } from '../../assets/AssetManifest';
import { getInventoryItemAsset } from '../../assets/InventoryItemAssets';
import { previewCraftingSession } from '../../systems/CraftingSystem';
import { getEquipmentMakingRecipe, getEquipmentMakingSoulCost } from '../../systems/EquipmentMakingSystem';
import { EquipmentResolutionSoulCost } from '../../systems/EquipmentResolutionSystem';
import {
  getEquipmentStrengthLevel,
  getStrengtheningChance,
  getStrengtheningSoulCost,
} from '../../systems/EquipmentStrengtheningSystem';
import {
  getFormalWorkshopPlayer,
  type FormalWorkshopPageModel,
  type FormalWorkshopTab,
} from '../../systems/FormalWorkshopPageSystem';
import { getStackQuantityByFillName } from '../../systems/InventorySystem';
import { createWorkshopSlotItemIcon } from './InventoryGridView';

type WorkshopTruth = typeof strengthTruth | typeof fusionTruth | typeof resolutionTruth | typeof makingTruth;
type NativeButtonAssets = Readonly<{ up: string; over: string; down: string }>;

export function getNativeWorkshopPanelBounds(tab: FormalWorkshopTab): Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}> {
  if (tab === 'strength') return stageBoundsOf(strengthTruth, 'strength-page-root');
  if (tab === 'fusion') return stageBoundsOf(fusionTruth, 'fusion-page-root');
  if (tab === 'resolution') return stageBoundsOf(resolutionTruth, 'resolution-page-root');
  return stageBoundsOf(makingTruth, 'making-page-root');
}

export function createNativeStrengthObjects(
  scene: Phaser.Scene,
  model: FormalWorkshopPageModel,
  onCommit: () => void,
): Phaser.GameObjects.GameObject[] {
  assertVerified(strengthTruth);
  const session = model.strengtheningSessions[model.owner];
  const objects: Phaser.GameObjects.GameObject[] = [];
  addItem(objects, scene, session.target?.definition.fillName, centerOf(strengthTruth, 'zbmc'));
  session.stones.forEach((stone, index) => {
    addItem(objects, scene, stone.definition.fillName, centerOf(strengthTruth, `qhmc${index + 1}`));
  });
  addItem(objects, scene, session.safeguardCharm?.definition.fillName, centerOf(strengthTruth, 'baodimc'));
  addItem(objects, scene, session.luckyCharm?.definition.fillName, centerOf(strengthTruth, 'luckmc'));

  const targetLevel = session.target ? getEquipmentStrengthLevel(session.target) : 0;
  const chance = getStrengtheningChance(
    targetLevel,
    session.stones.map((stone) => stone.level ?? 0),
    Boolean(session.luckyCharm),
  );
  objects.push(nativeField(scene, strengthTruth, 'txt_needlh', session.target ? String(getStrengtheningSoulCost(targetLevel)) : ''));
  objects.push(nativeField(scene, strengthTruth, 'txt_success', session.target ? `${Math.floor(chance * 100)}%` : ''));
  objects.push(nativeButton(scene, strengthTruth, 'qhbtn', {
    up: craftingAssets.strengthButtonUp.key,
    over: craftingAssets.strengthButtonOver.key,
    down: craftingAssets.strengthButtonDown.key,
  }, onCommit));
  return objects;
}

export function createNativeFusionObjects(
  scene: Phaser.Scene,
  model: FormalWorkshopPageModel,
  onCommit: () => void,
): Phaser.GameObjects.GameObject[] {
  assertVerified(fusionTruth);
  const session = model.fusionSessions[model.owner];
  const player = getFormalWorkshopPlayer(model);
  const objects: Phaser.GameObjects.GameObject[] = [];
  session.slots.forEach((slot, index) => {
    addItem(objects, scene, slot?.entry.definition.fillName, centerOf(fusionTruth, `material${index + 1}`));
  });
  const preview = previewCraftingSession(session, player.soulCount);
  addItem(objects, scene, preview.recipe?.productFillName, centerOf(fusionTruth, 'preview'));
  addItem(objects, scene, session.lastProductFillName, centerOf(fusionTruth, 'produce'));
  objects.push(nativeField(scene, fusionTruth, 'txt_name', preview.recipe?.productName ?? ''));
  const hasStagedMaterial = session.slots.length > 0;
  objects.push(nativeField(scene, fusionTruth, 'txt_success', hasStagedMaterial ? '100%' : ''));
  objects.push(nativeField(scene, fusionTruth, 'txt_needlh', hasStagedMaterial ? '1000' : ''));
  objects.push(nativeButton(scene, fusionTruth, 'rlbtn', {
    up: craftingAssets.fusionButtonUp.key,
    over: craftingAssets.fusionButtonOver.key,
    down: craftingAssets.fusionButtonDown.key,
  }, onCommit));
  return objects;
}

export function createNativeResolutionObjects(
  scene: Phaser.Scene,
  model: FormalWorkshopPageModel,
  onCommit: () => void,
): Phaser.GameObjects.GameObject[] {
  assertVerified(resolutionTruth);
  const session = model.resolutionSessions[model.owner];
  const objects: Phaser.GameObjects.GameObject[] = [];
  addItem(objects, scene, session.target?.definition.fillName, centerOf(resolutionTruth, 'material'));
  session.results.slice(0, 6).forEach((fillName, index) => {
    addItem(objects, scene, fillName, centerOf(resolutionTruth, `resu${index + 1}`));
  });
  objects.push(nativeField(
    scene,
    resolutionTruth,
    'txt_needlh',
    session.target ? String(EquipmentResolutionSoulCost) : '',
  ));
  objects.push(nativeButton(scene, resolutionTruth, 'fjbtn', {
    up: craftingAssets.resolutionButtonUp.key,
    over: craftingAssets.resolutionButtonOver.key,
    down: craftingAssets.resolutionButtonDown.key,
  }, onCommit));
  return objects;
}

export function createNativeMakingObjects(
  scene: Phaser.Scene,
  model: FormalWorkshopPageModel,
  onCommit: () => void,
): Phaser.GameObjects.GameObject[] {
  assertVerified(makingTruth);
  const session = model.makingSessions[model.owner];
  const player = getFormalWorkshopPlayer(model);
  const recipe = getEquipmentMakingRecipe(session);
  const objects: Phaser.GameObjects.GameObject[] = [];
  addItem(objects, scene, session.book?.definition.fillName, centerOf(makingTruth, 'makingbook'));
  recipe?.requiredMaterials.slice(0, 2).forEach((material, index) => {
    addItem(objects, scene, material.fillName, centerOf(makingTruth, `needmaterial${index + 1}`));
  });
  session.gems.slice(0, 3).forEach((gem, index) => {
    addItem(objects, scene, gem.definition.fillName, centerOf(makingTruth, `material${index + 1}`));
  });
  addItem(objects, scene, session.lastProduct?.definition.fillName, centerOf(makingTruth, 'makeObj'));
  const material1 = recipe?.requiredMaterials[0];
  const material2 = recipe?.requiredMaterials[1];
  objects.push(nativeField(scene, makingTruth, 'txthas1', material1
    ? String(getStackQuantityByFillName(player.inventoryStore, material1.fillName)) : ''));
  objects.push(nativeField(scene, makingTruth, 'txtneed1', material1 ? String(material1.quantity) : ''));
  objects.push(nativeField(scene, makingTruth, 'txthas2', material2
    ? String(getStackQuantityByFillName(player.inventoryStore, material2.fillName)) : ''));
  objects.push(nativeField(scene, makingTruth, 'txtneed2', material2 ? String(material2.quantity) : ''));
  objects.push(nativeField(scene, makingTruth, 'txt_needlh', session.book
    ? String(getEquipmentMakingSoulCost(session.book.definition.quality)) : ''));
  objects.push(nativeField(scene, makingTruth, 'txt_name', session.lastProduct?.definition.name ?? ''));
  objects.push(nativeButton(scene, makingTruth, 'dzbtn', {
    up: craftingAssets.makingButtonUp.key,
    over: craftingAssets.makingButtonOver.key,
    down: craftingAssets.makingButtonDown.key,
  }, onCommit));
  return objects;
}

function addItem(
  objects: Phaser.GameObjects.GameObject[],
  scene: Phaser.Scene,
  fillName: string | undefined,
  center: Readonly<{ x: number; y: number }>,
): void {
  if (!fillName) return;
  const asset = getInventoryItemAsset(fillName);
  if (asset) objects.push(createWorkshopSlotItemIcon(scene, center.x, center.y, asset.key));
}

function nativeField(
  scene: Phaser.Scene,
  truth: WorkshopTruth,
  id: string,
  copy: string,
): Phaser.GameObjects.Text {
  const bounds = stageBoundsOf(truth, id);
  return scene.add.text(bounds.left, bounds.top, copy, {
    color: '#ffffff',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '15px',
    lineSpacing: 2,
  });
}

function nativeButton(
  scene: Phaser.Scene,
  truth: WorkshopTruth,
  id: string,
  assets: NativeButtonAssets,
  onClick: () => void,
): Phaser.GameObjects.Image {
  const bounds = stageBoundsOf(truth, id);
  const image = scene.add.image(bounds.left, bounds.top, assets.up).setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height)
    .setInteractive({ useHandCursor: true })
    .setData('workshopNativeButton', id);
  image.on('pointerover', () => image.setTexture(assets.over).setDisplaySize(bounds.width, bounds.height));
  image.on('pointerout', () => image.setTexture(assets.up).setDisplaySize(bounds.width, bounds.height));
  image.on('pointerdown', () => image.setTexture(assets.down).setDisplaySize(bounds.width, bounds.height));
  image.on('pointerup', () => {
    onClick();
    if (image.active) image.setTexture(assets.over).setDisplaySize(bounds.width, bounds.height);
  });
  return image;
}

function centerOf(truth: WorkshopTruth, id: string): Readonly<{ x: number; y: number }> {
  const bounds = stageBoundsOf(truth, id);
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
}

function stageBoundsOf(
  truth: WorkshopTruth,
  id: string,
): Readonly<{ left: number; top: number; width: number; height: number }> {
  assertVerified(truth);
  const object = truth.displayObjects.find((candidate) => candidate.id === id);
  const bounds = object?.placements[0]?.stageBounds;
  if (!bounds) throw new Error(`${truth.truthId} is missing ${id}.`);
  return bounds;
}

function assertVerified(truth: WorkshopTruth): void {
  if (truth.status !== 'verified') throw new Error(`${truth.truthId} is not verified.`);
}
