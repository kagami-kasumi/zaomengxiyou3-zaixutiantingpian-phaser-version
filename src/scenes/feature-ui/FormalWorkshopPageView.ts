import Phaser from 'phaser';
// 边界：本视图只装配 verified 工坊几何与交互，不持有装备属性、事务、背包或存档规则。
import workshopInventoryTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-slice-165d-workshop-inventory.json';
import { craftingAssets } from '../../assets/AssetManifest';
import { inventoryUiAssets } from '../../assets/InventoryUiAssets';
import {
  FormalWorkshopPageCount,
  getFormalWorkshopGridPageEntries,
  getFormalWorkshopGridSelectedIndex,
  getFormalWorkshopPlayer,
  runFormalWorkshopFusion,
  runFormalWorkshopMaking,
  runFormalWorkshopResolution,
  runFormalWorkshopStrengthening,
  selectFormalWorkshopCategory,
  selectFormalWorkshopGridEntry,
  setFormalWorkshopTab,
  setFormalWorkshopInventoryPage,
  stageFormalWorkshopFusion,
  stageFormalWorkshopMaking,
  stageFormalWorkshopResolution,
  stageFormalWorkshopStrengthening,
  withdrawFormalWorkshopFusion,
  withdrawFormalWorkshopMakingSlot,
  withdrawFormalWorkshopResolution,
  withdrawFormalWorkshopStrengtheningSlot,
  type FormalWorkshopPageModel,
  type FormalWorkshopTab,
} from '../../systems/FormalWorkshopPageSystem';
import {
  FormalWorkshopNativeTabLayout,
  FormalWorkshopReturnHitArea,
  FormalWorkshopStrengthTargetHitAreaIndex,
  FormalWorkshopStageHitAreas,
  type WorkshopHitArea,
} from '../../systems/FormalWorkshopNativeTabLayout';
import { createInventoryGridProjection } from '../../systems/InventoryGridProjection';
import { InventoryCategories } from '../../systems/InventorySystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import { createFormalSoulBalanceView } from './FormalSoulBalanceView';
import { createEquipmentTooltipView, type EquipmentTooltipView } from './EquipmentTooltipView';
import {
  createInventoryGridObjects,
  createInventoryPagerObjects,
  createNativeInventoryButton,
} from './InventoryGridView';
import {
  createNativeFusionObjects,
  createNativeMakingObjects,
  createNativeResolutionObjects,
  createNativeStrengthObjects,
  getNativeWorkshopPanelBounds,
  getNativeFusionTooltipTargets,
  getNativeMakingTooltipTarget,
  getNativeResolutionTooltipTarget,
} from './FormalWorkshopNativeOperationView';

type Callbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onClose: () => void;
  onFeedback: (message: string) => void;
  onRerender: () => void;
};

const WorkshopInventoryRootBounds = getTruthStageBounds('inventory-root');
const WorkshopInventoryFirstSlotBounds = getTruthStageBounds('inventory-slot-00');
const WorkshopEquipmentTabBounds = getTruthStageBounds('inventory-tab-equipment');
const WorkshopItemsTabBounds = getTruthStageBounds('inventory-tab-items');
const WorkshopInventoryPageBounds = getTruthStageBounds('inventory-page-value');
const WorkshopInventoryPageSuffixBounds = getTruthStageBounds('inventory-page-suffix');
const WorkshopInventoryPreviousPageBounds = getTruthStageBounds('inventory-page-previous');
const WorkshopInventoryNextPageBounds = getTruthStageBounds('inventory-page-next');
const WorkshopInventoryRoot = { x: WorkshopInventoryRootBounds.left, y: WorkshopInventoryRootBounds.top };
const WorkshopInventoryGridOrigin = {
  x: WorkshopInventoryFirstSlotBounds.left,
  y: WorkshopInventoryFirstSlotBounds.top,
};
const WorkshopInventoryPageTextBounds = {
  left: WorkshopInventoryPageBounds.left,
  top: WorkshopInventoryPageBounds.top + 4.65,
  width: WorkshopInventoryPageSuffixBounds.left + WorkshopInventoryPageSuffixBounds.width
    - WorkshopInventoryPageBounds.left,
  height: Math.max(WorkshopInventoryPageBounds.height, WorkshopInventoryPageSuffixBounds.height),
};
const WorkshopInventoryTabStep = WorkshopItemsTabBounds.left - WorkshopEquipmentTabBounds.left;
export function createFormalWorkshopPageView(scene: Phaser.Scene, model: FormalWorkshopPageModel, storage: SaveStorage, callbacks: Callbacks): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  const equipmentTooltip = model.tab === 'strength' || model.tab === 'fusion'
    || model.tab === 'resolution' || model.tab === 'making'
    ? createEquipmentTooltipView(scene)
    : undefined;
  objects.push(scene.add.image(470, 295, craftingAssets.container.key).setDisplaySize(940, 590));
  const panelAsset = model.tab === 'fusion' ? craftingAssets.fusionPanel
    : model.tab === 'strength' ? craftingAssets.strengthPanel
      : model.tab === 'resolution' ? craftingAssets.resolutionPanel : craftingAssets.makingPanel;
  const panelBounds = getNativeWorkshopPanelBounds(model.tab);
  objects.push(scene.add.image(panelBounds.left, panelBounds.top, panelAsset.key).setOrigin(0));
  objects.push(ownerLabel(scene, 303, 86, 'P1工坊', () => callbacks.onOwner('p1'), model.owner === 'p1'));
  if (callbacks.playerCount === 2) {
    objects.push(ownerLabel(scene, 424, 86, 'P2工坊', () => callbacks.onOwner('p2'), model.owner === 'p2'));
  }
  FormalWorkshopNativeTabLayout.forEach((layout) => objects.push(originalHitZone(scene, layout, () => {
    setFormalWorkshopTab(model, layout.tab);
    callbacks.onRerender();
  }, `workshop-tab-${layout.tab}`)));
  objects.push(originalHitZone(scene, FormalWorkshopReturnHitArea, callbacks.onClose, 'workshop-return'));

  InventoryCategories.forEach((category, index) => {
    objects.push(createNativeInventoryButton(
      scene,
      WorkshopInventoryRoot.x + index * WorkshopInventoryTabStep,
      WorkshopInventoryRoot.y,
      inventoryUiAssets[category],
      model.activeCategory === category,
      () => {
        selectFormalWorkshopCategory(model, category);
        callbacks.onRerender();
      },
    ));
  });
  const pageEntries = getFormalWorkshopGridPageEntries(model);
  const projection = createInventoryGridProjection(pageEntries, getFormalWorkshopGridSelectedIndex(model));
  objects.push(...createInventoryGridObjects(scene, projection, WorkshopInventoryGridOrigin, (cell) => {
    if (selectFormalWorkshopGridEntry(model, cell.index)) stageSelectedWorkshopEntry(model);
    callbacks.onRerender();
  }, equipmentTooltip ? {
    onEquipmentOver: (entry, pointer) => equipmentTooltip.show(entry, pointer.x, pointer.y),
    onEquipmentMove: (pointer) => equipmentTooltip.move(pointer.x, pointer.y),
    onEquipmentOut: equipmentTooltip.hide,
  } : undefined));
  objects.push(...createInventoryPagerObjects(scene, {
    currentPage: model.inventoryPage + 1,
    pageCount: FormalWorkshopPageCount,
    pageBounds: WorkshopInventoryPageTextBounds,
    previousBounds: WorkshopInventoryPreviousPageBounds,
    nextBounds: WorkshopInventoryNextPageBounds,
    onPrevious: () => {
      setFormalWorkshopInventoryPage(model, model.inventoryPage - 1); callbacks.onRerender();
    },
    onNext: () => {
      setFormalWorkshopInventoryPage(model, model.inventoryPage + 1); callbacks.onRerender();
    },
  }));
  const player = getFormalWorkshopPlayer(model);
  objects.push(createFormalSoulBalanceView(scene, player.soulCount, 'workshop'));
  if (model.tab === 'strength') {
    objects.push(...createNativeStrengthObjects(scene, model, () => {
      runFormalWorkshopStrengthening(model, storage);
      callbacks.onFeedback(model.message);
      callbacks.onRerender();
    }));
    const strengthZones = stageZones(scene, 'strength', (index) => {
      toggleWorkshopStageSlot(model, 'strength', index); callbacks.onRerender();
    });
    const target = model.strengtheningSessions[model.owner].target;
    const targetZone = strengthZones[FormalWorkshopStrengthTargetHitAreaIndex];
    if (target && targetZone && equipmentTooltip) bindEquipmentTooltip(targetZone, target, equipmentTooltip);
    objects.push(...strengthZones);
  } else if (model.tab === 'fusion') {
    objects.push(...createNativeFusionObjects(scene, model, () => {
      runFormalWorkshopFusion(model, storage);
      callbacks.onFeedback(model.message);
      callbacks.onRerender();
    }));
    const fusionTargets = getNativeFusionTooltipTargets(model);
    fusionTargets.forEach((target, index) => {
      const zone = originalHitZone(scene, target.bounds, () => {
        if (index < 3) {
          toggleWorkshopStageSlot(model, 'fusion', index);
          callbacks.onRerender();
        }
      }, `workshop-fusion-${target.id}`);
      if (target.instance && equipmentTooltip) bindEquipmentTooltip(zone, target.instance, equipmentTooltip);
      objects.push(zone);
    });
  } else if (model.tab === 'resolution') {
    objects.push(...createNativeResolutionObjects(scene, model, () => {
      runFormalWorkshopResolution(model, storage);
      callbacks.onFeedback(model.message);
      callbacks.onRerender();
    }));
    const target = getNativeResolutionTooltipTarget(model);
    const targetZone = originalHitZone(scene, target.bounds, () => {
      toggleWorkshopStageSlot(model, 'resolution', 0);
      callbacks.onRerender();
    }, 'workshop-resolution-material');
    if (target.instance && equipmentTooltip) bindEquipmentTooltip(targetZone, target.instance, equipmentTooltip);
    objects.push(targetZone);
  } else {
    objects.push(...createNativeMakingObjects(scene, model, () => {
      runFormalWorkshopMaking(model, storage);
      callbacks.onFeedback(model.message);
      callbacks.onRerender();
    }));
    objects.push(...stageZones(scene, 'making', (index) => {
      toggleWorkshopStageSlot(model, 'making', index); callbacks.onRerender();
    }));
    const product = getNativeMakingTooltipTarget(model);
    const productZone = originalHoverZone(scene, product.bounds, 'workshop-making-product');
    if (product.instance && equipmentTooltip) bindEquipmentTooltip(productZone, product.instance, equipmentTooltip);
    objects.push(productZone);
  }
  if (equipmentTooltip) objects.push(equipmentTooltip.root);
  return scene.add.container(0, 0, objects).setDepth(20);
}

function ownerLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  selected: boolean,
): Phaser.GameObjects.Text {
  const restColor = selected ? '#ffd45c' : '#f8ead0';
  const text = scene.add.text(x, y, label, {
    color: restColor,
    fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
    fontSize: '26px',
    fontStyle: 'bold',
    stroke: '#3d1908',
    strokeThickness: 5,
    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true },
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  text.on('pointerover', () => text.setColor('#ffb62e'));
  text.on('pointerout', () => text.setColor(restColor));
  text.on('pointerdown', onClick);
  return text;
}

function stageSelectedWorkshopEntry(model: FormalWorkshopPageModel): void {
  if (model.tab === 'strength') stageFormalWorkshopStrengthening(model);
  else if (model.tab === 'fusion') stageFormalWorkshopFusion(model);
  else if (model.tab === 'resolution') stageFormalWorkshopResolution(model);
  else stageFormalWorkshopMaking(model);
}

function toggleWorkshopStageSlot(model: FormalWorkshopPageModel, tab: FormalWorkshopTab, index: number): void {
  if (tab === 'strength') {
    const slot = (['luckyCharm', 0, 'target', 1, 'safeguardCharm', 2] as const)[index];
    if (slot === undefined) return;
    const session = model.strengtheningSessions[model.owner];
    const occupied = typeof slot === 'number' ? Boolean(session.stones[slot]) : Boolean(session[slot]);
    if (occupied) withdrawFormalWorkshopStrengtheningSlot(model, slot);
    else stageFormalWorkshopStrengthening(model);
    return;
  }
  if (tab === 'fusion') {
    if (model.fusionSessions[model.owner].slots[index]) withdrawFormalWorkshopFusion(model, index);
    else stageFormalWorkshopFusion(model);
    return;
  }
  if (tab === 'resolution') {
    if (model.resolutionSessions[model.owner].target) withdrawFormalWorkshopResolution(model);
    else stageFormalWorkshopResolution(model);
    return;
  }
  const slot = (['book', 0, 1, 2] as const)[index];
  if (slot === undefined) return;
  const session = model.makingSessions[model.owner];
  const occupied = slot === 'book' ? Boolean(session.book) : Boolean(session.gems[slot]);
  if (occupied) withdrawFormalWorkshopMakingSlot(model, slot);
  else stageFormalWorkshopMaking(model);
}

function stageZones(
  scene: Phaser.Scene,
  tab: FormalWorkshopTab,
  onClick: (index: number) => void,
): Phaser.GameObjects.Zone[] {
  return FormalWorkshopStageHitAreas[tab].map((area, index) =>
    originalHitZone(scene, area, () => onClick(index), `workshop-stage-${tab}-${index}`));
}

function bindEquipmentTooltip(
  zone: Phaser.GameObjects.Zone,
  instance: NonNullable<FormalWorkshopPageModel['strengtheningSessions']['p1']['target']>,
  tooltip: EquipmentTooltipView,
): void {
  zone.on('pointerover', (pointer: Phaser.Input.Pointer) => tooltip.show(instance, pointer.x, pointer.y));
  zone.on('pointermove', (pointer: Phaser.Input.Pointer) => tooltip.move(pointer.x, pointer.y));
  zone.on('pointerout', tooltip.hide);
}

function originalHitZone(
  scene: Phaser.Scene,
  area: WorkshopHitArea,
  onClick: () => void,
  id: string,
): Phaser.GameObjects.Zone {
  const zone = scene.add.zone(area.x, area.y, area.width, area.height)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true })
    .setData('originalArtworkHitArea', id);
  zone.on('pointerdown', onClick);
  return zone;
}

function originalHoverZone(
  scene: Phaser.Scene,
  area: WorkshopHitArea,
  id: string,
): Phaser.GameObjects.Zone {
  return scene.add.zone(area.x, area.y, area.width, area.height)
    .setOrigin(0)
    .setInteractive()
    .setData('originalArtworkHitArea', id);
}

function getTruthStageBounds(id: string): Readonly<{ left: number; top: number; width: number; height: number }> {
  const object = workshopInventoryTruth.displayObjects.find((candidate) => candidate.id === id);
  const stageBounds = object?.placements[0]?.stageBounds;
  if (!stageBounds) throw new Error(`Workshop inventory truth is missing ${id}.`);
  return stageBounds;
}
