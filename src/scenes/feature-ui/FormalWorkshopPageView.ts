import Phaser from 'phaser';
import { craftingAssets } from '../../assets/AssetManifest';
import {
  FormalWorkshopPageSize,
  getFormalWorkshopEntries,
  getFormalWorkshopPlayer,
  runFormalWorkshopFusion,
  runFormalWorkshopMaking,
  runFormalWorkshopResolution,
  runFormalWorkshopStrengthening,
  selectFormalWorkshopEntry,
  setFormalWorkshopTab,
  setFormalWorkshopInventoryPage,
  stageFormalWorkshopFusion,
  stageFormalWorkshopMaking,
  stageFormalWorkshopResolution,
  stageFormalWorkshopStrengthening,
  withdrawFormalWorkshopResolution,
  type FormalWorkshopPageModel,
  type FormalWorkshopTab,
} from '../../systems/FormalWorkshopPageSystem';
import {
  FormalWorkshopCommitHitAreas,
  FormalWorkshopNativeTabLayout,
  FormalWorkshopOperationCenter,
  FormalWorkshopPageHitAreas,
  FormalWorkshopReturnHitArea,
  FormalWorkshopStageHitAreas,
  type WorkshopHitArea,
} from '../../systems/FormalWorkshopNativeTabLayout';
import { describeEquipmentStrengtheningSession, getEquipmentStrengthLevel } from '../../systems/EquipmentStrengtheningSystem';
import { getEquipmentMakingRecipe, getEquipmentMakingSoulCost } from '../../systems/EquipmentMakingSystem';
import type { SaveStorage } from '../../systems/SaveSystem';

type Callbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onClose: () => void;
  onRerender: () => void;
};

export function createFormalWorkshopPageView(scene: Phaser.Scene, model: FormalWorkshopPageModel, storage: SaveStorage, callbacks: Callbacks): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.image(470, 295, craftingAssets.container.key).setDisplaySize(940, 590));
  if (model.tab === 'fusion') objects.push(scene.add.image(FormalWorkshopOperationCenter.x, FormalWorkshopOperationCenter.y, craftingAssets.fusionPanel.key));
  if (model.tab === 'strength') objects.push(scene.add.image(FormalWorkshopOperationCenter.x, FormalWorkshopOperationCenter.y, craftingAssets.strengthPanel.key));
  if (model.tab === 'resolution') objects.push(scene.add.image(FormalWorkshopOperationCenter.x, FormalWorkshopOperationCenter.y, craftingAssets.resolutionPanel.key));
  if (model.tab === 'making') objects.push(scene.add.image(FormalWorkshopOperationCenter.x, FormalWorkshopOperationCenter.y, craftingAssets.makingPanel.key));
  objects.push(ownerLabel(scene, 303, 86, 'P1工坊', () => callbacks.onOwner('p1'), model.owner === 'p1'));
  if (callbacks.playerCount === 2) {
    objects.push(ownerLabel(scene, 424, 86, 'P2工坊', () => callbacks.onOwner('p2'), model.owner === 'p2'));
  }
  FormalWorkshopNativeTabLayout.forEach((layout) => objects.push(originalHitZone(scene, layout, () => {
    setFormalWorkshopTab(model, layout.tab);
    callbacks.onRerender();
  }, `workshop-tab-${layout.tab}`)));
  objects.push(originalHitZone(scene, FormalWorkshopReturnHitArea, callbacks.onClose, 'workshop-return'));

  const entries = getFormalWorkshopEntries(model);
  const pageCount = Math.max(1, Math.ceil(entries.length / FormalWorkshopPageSize));
  const pageStart = model.inventoryPage * FormalWorkshopPageSize;
  const visibleEntries = entries.slice(pageStart, pageStart + FormalWorkshopPageSize);
  objects.push(scene.add.text(526, 108, '背包 / 装备栏（选中后点左侧槽位）', {
    color: '#ffe59a', fontSize: '14px', fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
  }));
  objects.push(scene.add.text(792, 109, `第 ${model.inventoryPage + 1}/${pageCount} 页`, {
    color: '#d9c18a', fontFamily: '"Microsoft YaHei", "SimHei", sans-serif', fontSize: '11px',
  }).setOrigin(1, 0));
  visibleEntries.forEach((entry, index) => objects.push(inventoryEntry(
    scene,
    526,
    136 + index * 28,
    entry.kind === 'equipment'
      ? `${entry.definition.name} +${getEquipmentStrengthLevel(entry)}`
      : `${entry.definition.name} ×${entry.quantity}`,
    () => { selectFormalWorkshopEntry(model, pageStart + index); callbacks.onRerender(); },
    model.selectedInventoryIndex === pageStart + index,
  )));
  objects.push(originalHitZone(scene, FormalWorkshopPageHitAreas.previous, () => {
    setFormalWorkshopInventoryPage(model, model.inventoryPage - 1); callbacks.onRerender();
  }, 'workshop-page-previous'));
  objects.push(originalHitZone(scene, FormalWorkshopPageHitAreas.next, () => {
    setFormalWorkshopInventoryPage(model, model.inventoryPage + 1); callbacks.onRerender();
  }, 'workshop-page-next'));
  const player = getFormalWorkshopPlayer(model);
  if (model.tab === 'strength') {
    const session = model.strengtheningSessions[model.owner];
    const summary = describeEquipmentStrengtheningSession(session);
    objects.push(statusText(scene, [
      `${summary[0]}　${summary[2]}`,
      summary[3] ?? '',
      summary[4] ?? '',
      model.message,
    ].filter(Boolean).join('\n')));
    objects.push(...stageZones(scene, 'strength', () => {
      stageFormalWorkshopStrengthening(model); callbacks.onRerender();
    }));
    objects.push(originalHitZone(scene, FormalWorkshopCommitHitAreas.strength, () => {
      runFormalWorkshopStrengthening(model, storage); callbacks.onRerender();
    }, 'workshop-commit-strength'));
  } else if (model.tab === 'fusion') {
    const fusion = model.fusionSessions[model.owner];
    objects.push(statusText(scene, `灵魂 ${player.skillLearning.soulCount}\n暂存：${fusion.slots.map((slot) => slot?.entry.definition.name).join(' / ') || '空'}\n${model.message}`));
    objects.push(...stageZones(scene, 'fusion', () => {
      stageFormalWorkshopFusion(model); callbacks.onRerender();
    }));
    objects.push(originalHitZone(scene, FormalWorkshopCommitHitAreas.fusion, () => {
      runFormalWorkshopFusion(model, storage); callbacks.onRerender();
    }, 'workshop-commit-fusion'));
  } else if (model.tab === 'resolution') {
    const resolution = model.resolutionSessions[model.owner];
    const target = resolution.target;
    const results = resolution.results.map((fillName) => model.registry[fillName]?.name ?? fillName);
    if (target) {
      objects.push(scene.add.text(316, 167, target.definition.name, {
        color: '#fff1ad', fontFamily: 'Arial', fontSize: '13px', align: 'center', wordWrap: { width: 60 },
      }).setOrigin(0.5));
    }
    const resultPositions = [[198, 286], [297, 286], [394, 286], [198, 365], [297, 365], [394, 365]] as const;
    results.forEach((name, index) => {
      const position = resultPositions[index];
      if (!position) return;
      objects.push(scene.add.text(position[0], position[1], name, {
        color: '#fff1ad', fontFamily: 'Arial', fontSize: '12px', align: 'center', wordWrap: { width: 60 },
      }).setOrigin(0.5));
    });
    objects.push(statusText(scene, `灵魂 ${player.skillLearning.soulCount}　消耗 100\n${model.message}`));
    objects.push(...stageZones(scene, 'resolution', () => {
      if (resolution.target) withdrawFormalWorkshopResolution(model);
      else stageFormalWorkshopResolution(model);
      callbacks.onRerender();
    }));
    objects.push(originalHitZone(scene, FormalWorkshopCommitHitAreas.resolution, () => {
      runFormalWorkshopResolution(model, storage); callbacks.onRerender();
    }, 'workshop-commit-resolution'));
  } else {
    const making = model.makingSessions[model.owner];
    const recipe = getEquipmentMakingRecipe(making);
    const productName = recipe ? model.registry[recipe.productFillName]?.name ?? recipe.productFillName : '空';
    const requirements = recipe?.requiredMaterials.map((material) =>
      `${model.registry[material.fillName]?.name ?? material.fillName}×${material.quantity}`
    ).join(' / ') ?? '请先放入制作书';
    const soulCost = making.book ? getEquipmentMakingSoulCost(making.book.definition.quality) : 0;
    if (making.book) {
      objects.push(scene.add.text(316, 167, making.book.definition.name, {
        color: '#fff1ad', fontFamily: 'Arial', fontSize: '12px', align: 'center', wordWrap: { width: 62 },
      }).setOrigin(0.5));
    }
    const gemPositions = [[216, 317], [328, 317], [445, 318]] as const;
    making.gems.forEach((gem, index) => {
      const position = gemPositions[index];
      if (!position) return;
      objects.push(scene.add.text(position[0], position[1], gem.definition.name, {
        color: '#fff1ad', fontFamily: 'Arial', fontSize: '11px', align: 'center', wordWrap: { width: 60 },
      }).setOrigin(0.5));
    });
    objects.push(statusText(scene, `产物：${productName}\n材料：${requirements}\n灵魂：${player.skillLearning.soulCount} / ${soulCost}\n${model.message}`));
    objects.push(...stageZones(scene, 'making', () => {
      stageFormalWorkshopMaking(model); callbacks.onRerender();
    }));
    objects.push(originalHitZone(scene, FormalWorkshopCommitHitAreas.making, () => {
      runFormalWorkshopMaking(model, storage); callbacks.onRerender();
    }, 'workshop-commit-making'));
  }
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

function inventoryEntry(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, selected: boolean): Phaser.GameObjects.Text {
  const restColor = selected ? '#ffd45c' : '#f4e4bd';
  const text = scene.add.text(x, y, `${selected ? '▶ ' : '　'}${label}`, {
    color: restColor,
    fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
    fontSize: '13px',
  }).setInteractive({ useHandCursor: true });
  text.on('pointerover', () => text.setColor('#ffbd42'));
  text.on('pointerout', () => text.setColor(restColor));
  text.on('pointerdown', onClick);
  return text;
}

function statusText(scene: Phaser.Scene, copy: string): Phaser.GameObjects.Text {
  return scene.add.text(526, 408, copy, {
    color: '#e9d8b0',
    fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
    fontSize: '10px',
    lineSpacing: 0,
    wordWrap: { width: 276 },
  });
}

function stageZones(scene: Phaser.Scene, tab: FormalWorkshopTab, onClick: () => void): Phaser.GameObjects.Zone[] {
  return FormalWorkshopStageHitAreas[tab].map((area, index) =>
    originalHitZone(scene, area, onClick, `workshop-stage-${tab}-${index}`));
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
