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
  withdrawFormalWorkshopFusion,
  withdrawFormalWorkshopMaking,
  withdrawFormalWorkshopResolution,
  withdrawFormalWorkshopStrengthening,
  type FormalWorkshopPageModel,
  type FormalWorkshopTab,
} from '../../systems/FormalWorkshopPageSystem';
import { FormalWorkshopNativeTabLayout } from '../../systems/FormalWorkshopNativeTabLayout';
import { describeEquipmentStrengtheningSession, getEquipmentStrengthLevel } from '../../systems/EquipmentStrengtheningSystem';
import { getEquipmentMakingRecipe, getEquipmentMakingSoulCost } from '../../systems/EquipmentMakingSystem';
import type { SaveStorage } from '../../systems/SaveSystem';

type Callbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onClose: () => void;
  onRerender: () => void;
};

const NativeTabTextures: Readonly<Record<FormalWorkshopTab, { up: string; over: string; down: string }>> = {
  strength: {
    up: craftingAssets.nativeTabStrengthUp.key,
    over: craftingAssets.nativeTabStrengthOver.key,
    down: craftingAssets.nativeTabStrengthDown.key,
  },
  fusion: {
    up: craftingAssets.nativeTabFusionUp.key,
    over: craftingAssets.nativeTabFusionOver.key,
    down: craftingAssets.nativeTabFusionDown.key,
  },
  resolution: {
    up: craftingAssets.nativeTabResolutionUp.key,
    over: craftingAssets.nativeTabResolutionOver.key,
    down: craftingAssets.nativeTabResolutionDown.key,
  },
  making: {
    up: craftingAssets.nativeTabMakingUp.key,
    over: craftingAssets.nativeTabMakingOver.key,
    down: craftingAssets.nativeTabMakingDown.key,
  },
};

export function createFormalWorkshopPageView(scene: Phaser.Scene, model: FormalWorkshopPageModel, storage: SaveStorage, callbacks: Callbacks): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.image(470, 295, craftingAssets.container.key).setDisplaySize(940, 590));
  if (model.tab === 'fusion') objects.push(scene.add.image(500, 305, craftingAssets.fusionPanel.key));
  if (model.tab === 'strength') objects.push(scene.add.image(360.6, 303.9, craftingAssets.strengthPanel.key));
  if (model.tab === 'resolution') objects.push(scene.add.image(357.1, 313.75, craftingAssets.resolutionPanel.key));
  if (model.tab === 'making') objects.push(scene.add.image(357.1, 303.4, craftingAssets.makingPanel.key));
  objects.push(...button(scene, 74, 65, 92, 30, 'P1 工坊', () => callbacks.onOwner('p1'), model.owner === 'p1'));
  if (callbacks.playerCount === 2) {
    objects.push(...button(scene, 174, 65, 92, 30, 'P2 工坊', () => callbacks.onOwner('p2'), model.owner === 'p2'));
  }
  FormalWorkshopNativeTabLayout.forEach((layout) => objects.push(nativeTabButton(scene, layout, model.tab, () => {
    setFormalWorkshopTab(model, layout.tab);
    callbacks.onRerender();
  })));

  const entries = getFormalWorkshopEntries(model);
  const pageCount = Math.max(1, Math.ceil(entries.length / FormalWorkshopPageSize));
  const pageStart = model.inventoryPage * FormalWorkshopPageSize;
  const visibleEntries = entries.slice(pageStart, pageStart + FormalWorkshopPageSize);
  const inventoryOnRight = model.tab === 'strength' || model.tab === 'resolution' || model.tab === 'making';
  const entryX = inventoryOnRight ? 810 : 126;
  const entryWidth = inventoryOnRight ? 230 : 196;
  const entryStep = inventoryOnRight ? 36 : 42;
  objects.push(scene.add.text(inventoryOnRight ? 695 : 28, 102, '当前玩家背包 / 装备栏', { color: '#ffe59a', fontSize: '16px', fontFamily: 'Arial' }));
  visibleEntries.forEach((entry, index) => objects.push(...button(scene, entryX, 132 + index * entryStep, entryWidth, 30,
    entry.kind === 'equipment'
      ? `${entry.definition.name} +${getEquipmentStrengthLevel(entry)}`
      : `${entry.definition.name} ×${entry.quantity}`,
    () => { selectFormalWorkshopEntry(model, pageStart + index); callbacks.onRerender(); },
    model.selectedInventoryIndex === pageStart + index,
  )));
  objects.push(...button(scene, entryX - 62, 510, 95, 30, '上一页', () => {
    setFormalWorkshopInventoryPage(model, model.inventoryPage - 1); callbacks.onRerender();
  }));
  objects.push(scene.add.text(entryX, 510, `${model.inventoryPage + 1}/${pageCount}`, {
    color: '#ffe59a', fontFamily: 'Arial', fontSize: '14px', align: 'center',
  }).setOrigin(0.5));
  objects.push(...button(scene, entryX + 62, 510, 95, 30, '下一页', () => {
    setFormalWorkshopInventoryPage(model, model.inventoryPage + 1); callbacks.onRerender();
  }));
  const player = getFormalWorkshopPlayer(model);
  if (model.tab === 'strength') {
    const session = model.strengtheningSessions[model.owner];
    objects.push(scene.add.rectangle(360, 395, 350, 155, 0x101a28, 0.9).setStrokeStyle(1, 0xc9a84f));
    objects.push(scene.add.text(360, 382, `${describeEquipmentStrengtheningSession(session).join('\n')}\n${model.message}`, {
      color: '#e7eef9', fontFamily: 'Arial', fontSize: '13px', align: 'center', lineSpacing: 3, wordWrap: { width: 330 },
    }).setOrigin(0.5));
    objects.push(...button(scene, 240, 500, 110, 38, '放入所选', () => { stageFormalWorkshopStrengthening(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 360, 500, 110, 38, '全部撤回', () => { withdrawFormalWorkshopStrengthening(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 480, 500, 110, 38, '提交强化', () => { runFormalWorkshopStrengthening(model, storage); callbacks.onRerender(); }));
  } else if (model.tab === 'fusion') {
    objects.push(scene.add.rectangle(530, 430, 520, 150, 0x101a28, 0.9).setStrokeStyle(1, 0xc9a84f));
    const fusion = model.fusionSessions[model.owner];
    objects.push(scene.add.text(530, 390, `灵魂 ${player.skillLearning.soulCount}\n暂存：${fusion.slots.map((slot) => slot?.entry.definition.name).join(' / ') || '空'}\n${model.message}`, {
      color: '#e7eef9', fontFamily: 'Arial', fontSize: '14px', align: 'center', lineSpacing: 5, wordWrap: { width: 480 },
    }).setOrigin(0.5));
    objects.push(...button(scene, 390, 480, 130, 38, '放入材料', () => { stageFormalWorkshopFusion(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 530, 480, 130, 38, '撤回材料', () => { withdrawFormalWorkshopFusion(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 670, 480, 130, 38, '提交 Fusion', () => { runFormalWorkshopFusion(model, storage); callbacks.onRerender(); }));
  } else if (model.tab === 'resolution') {
    const resolution = model.resolutionSessions[model.owner];
    const target = resolution.target;
    const results = resolution.results.map((fillName) => model.registry[fillName]?.name ?? fillName);
    objects.push(scene.add.text(357, 171, target?.definition.name ?? '分解装备', {
      color: '#fff1ad', fontFamily: 'Arial', fontSize: '13px', align: 'center', wordWrap: { width: 60 },
    }).setOrigin(0.5));
    const resultPositions = [[239, 290], [338, 290], [435, 290], [239, 369], [338, 369], [435, 369]] as const;
    results.forEach((name, index) => {
      const position = resultPositions[index];
      if (!position) return;
      objects.push(scene.add.text(position[0], position[1], name, {
        color: '#fff1ad', fontFamily: 'Arial', fontSize: '12px', align: 'center', wordWrap: { width: 60 },
      }).setOrigin(0.5));
    });
    objects.push(scene.add.text(357, 427, `灵魂 ${player.skillLearning.soulCount}　消耗 100\n${model.message}`, {
      color: '#e7eef9', fontFamily: 'Arial', fontSize: '13px', align: 'center', lineSpacing: 3, wordWrap: { width: 340 },
    }).setOrigin(0.5));
    objects.push(...button(scene, 240, 500, 110, 38, '放入所选', () => { stageFormalWorkshopResolution(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 360, 500, 110, 38, '撤回装备', () => { withdrawFormalWorkshopResolution(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 480, 500, 110, 38, '提交分解', () => { runFormalWorkshopResolution(model, storage); callbacks.onRerender(); }));
  } else {
    const making = model.makingSessions[model.owner];
    const recipe = getEquipmentMakingRecipe(making);
    const productName = recipe ? model.registry[recipe.productFillName]?.name ?? recipe.productFillName : '空';
    const requirements = recipe?.requiredMaterials.map((material) =>
      `${model.registry[material.fillName]?.name ?? material.fillName}×${material.quantity}`
    ).join(' / ') ?? '请先放入制作书';
    const soulCost = making.book ? getEquipmentMakingSoulCost(making.book.definition.quality) : 0;
    objects.push(scene.add.text(357, 160, making.book?.definition.name ?? '制作书', {
      color: '#fff1ad', fontFamily: 'Arial', fontSize: '12px', align: 'center', wordWrap: { width: 62 },
    }).setOrigin(0.5));
    const gemPositions = [[257, 310], [369, 310], [486, 311]] as const;
    making.gems.forEach((gem, index) => {
      const position = gemPositions[index];
      if (!position) return;
      objects.push(scene.add.text(position[0], position[1], gem.definition.name, {
        color: '#fff1ad', fontFamily: 'Arial', fontSize: '11px', align: 'center', wordWrap: { width: 60 },
      }).setOrigin(0.5));
    });
    objects.push(scene.add.rectangle(357, 435, 350, 112, 0x101a28, 0.9).setStrokeStyle(1, 0xc9a84f));
    objects.push(scene.add.text(357, 418, `产物：${productName}\n材料：${requirements}\n灵魂：${player.skillLearning.soulCount} / ${soulCost}\n${model.message}`, {
      color: '#f4d58d', fontFamily: 'Arial', fontSize: '13px', align: 'center', lineSpacing: 3, wordWrap: { width: 330 },
    }).setOrigin(0.5));
    objects.push(...button(scene, 240, 510, 110, 38, '放入所选', () => { stageFormalWorkshopMaking(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 360, 510, 110, 38, '全部撤回', () => { withdrawFormalWorkshopMaking(model); callbacks.onRerender(); }));
    objects.push(...button(scene, 480, 510, 110, 38, '提交制作', () => { runFormalWorkshopMaking(model, storage); callbacks.onRerender(); }));
  }
  objects.push(...button(scene, 850, 545, 130, 40, '关闭返回', callbacks.onClose));
  return scene.add.container(0, 0, objects).setDepth(20);
}

function nativeTabButton(
  scene: Phaser.Scene,
  layout: (typeof FormalWorkshopNativeTabLayout)[number],
  selectedTab: FormalWorkshopTab,
  onClick: () => void,
): Phaser.GameObjects.Image {
  const textures = NativeTabTextures[layout.tab];
  const selected = selectedTab === layout.tab;
  const image = scene.add.image(layout.x, layout.y, selected ? textures.down : textures.up)
    .setOrigin(0)
    .setInteractive(new Phaser.Geom.Rectangle(0, 0, layout.width, layout.height), Phaser.Geom.Rectangle.Contains)
    .setData('nativeWorkshopTab', layout.tab)
    .setData('sourceCharacterId', layout.sourceCharacterId);
  image.on('pointerover', () => {
    if (!selected) image.setTexture(textures.over);
  });
  image.on('pointerout', () => image.setTexture(selected ? textures.down : textures.up));
  image.on('pointerdown', () => {
    image.setTexture(textures.down);
    onClick();
  });
  return image;
}

function button(scene: Phaser.Scene, x: number, y: number, width: number, height: number, label: string, onClick: () => void, selected = false): Phaser.GameObjects.GameObject[] {
  const background = scene.add.rectangle(x, y, width, height, selected ? 0x765b27 : 0x24364d, 0.98)
    .setStrokeStyle(selected ? 3 : 1, selected ? 0xffdc75 : 0xc9d6e8).setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, { color: '#fff', fontFamily: 'Arial', fontSize: '12px', align: 'center' }).setOrigin(0.5);
  background.on('pointerdown', onClick);
  return [background, text];
}
