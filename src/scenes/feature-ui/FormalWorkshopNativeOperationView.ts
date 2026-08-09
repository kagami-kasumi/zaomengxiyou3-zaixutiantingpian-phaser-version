import Phaser from 'phaser';

import fusionTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-fusion.json';
import strengthTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-167-workshop-strength.json';
import { craftingAssets } from '../../assets/AssetManifest';
import { getInventoryItemAsset } from '../../assets/InventoryItemAssets';
import { previewCraftingSession } from '../../systems/CraftingSystem';
import {
  getEquipmentStrengthLevel,
  getStrengtheningChance,
  getStrengtheningSoulCost,
} from '../../systems/EquipmentStrengtheningSystem';
import {
  getFormalWorkshopPlayer,
  type FormalWorkshopPageModel,
} from '../../systems/FormalWorkshopPageSystem';
import { createInventoryItemIcon } from './InventoryGridView';

type WorkshopTruth = typeof strengthTruth | typeof fusionTruth;
type NativeButtonAssets = Readonly<{ up: string; over: string; down: string }>;

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

function addItem(
  objects: Phaser.GameObjects.GameObject[],
  scene: Phaser.Scene,
  fillName: string | undefined,
  center: Readonly<{ x: number; y: number }>,
): void {
  if (!fillName) return;
  const asset = getInventoryItemAsset(fillName);
  if (asset) objects.push(createInventoryItemIcon(scene, center.x, center.y, asset.key));
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
