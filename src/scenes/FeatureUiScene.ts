import Phaser from 'phaser';
// boundary: this overlay owns Phaser composition and host routing only;
// inventory, skill, pet, persistence, and combat-HUD rules remain in systems/bridges.
import { fullFeatureUiAssets } from '../assets/AssetManifest';
import { EquipmentSlotOrder } from '../systems/EquipmentUISystem';
import { EquipmentSlotLabels } from '../systems/EquipmentSystem';
import { InventoryCategories, InventoryCategoryLabels } from '../systems/InventorySystem';
import {
  changeFormalInventoryPage,
  createFormalInventoryPage,
  equipFormalInventorySelection,
  formatFormalInventorySummary,
  getFormalInventoryPageCount,
  getFormalInventoryPageEntries,
  getFormalInventoryPlayer,
  selectFormalEquipmentSlot,
  selectFormalInventoryCategory,
  selectFormalInventoryEntry,
  setFormalInventoryOwner,
  unequipFormalInventorySelection,
  type FormalInventoryPageModel,
} from '../systems/FormalInventoryPageSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import {
  createFormalSkillPage,
  setFormalSkillOwner,
  type FormalSkillPageModel,
} from '../systems/FormalSkillPageSystem';
import {
  createFormalPetPage,
  setFormalPetOwner,
  type FormalPetPageModel,
} from '../systems/FormalPetPageSystem';
import {
  closeFeatureUi,
  FeatureUiPages,
  formatFeatureUiOwner,
  getFeatureUiPageLabel,
  switchFeatureUi,
  type FeatureUiOwner,
  type FeatureUiPage,
  type FeatureUiSession,
} from '../systems/FeatureUiHostSystem';
import {
  formalFeatureUiHost,
  P2_BACKPACK_KEY_CODE,
  P2_SKILLS_KEY_CODE,
} from './feature-ui/FormalFeatureUiEntryBridge';
import { createFormalSkillPageView } from './feature-ui/FormalSkillPageView';
import { syncFormalSkillRuntime } from './feature-ui/FormalSkillRuntimeBridge';
import { createFormalPetPageView } from './feature-ui/FormalPetPageView';
import { syncFormalPetRuntime } from './feature-ui/FormalPetRuntimeBridge';
import {
  closeFormalWorkshopPage,
  createFormalWorkshopPage,
  setFormalWorkshopOwner,
  type FormalWorkshopPageModel,
} from '../systems/FormalWorkshopPageSystem';
import { createFormalWorkshopPageView } from './feature-ui/FormalWorkshopPageView';

const PageKeys: ReadonlyArray<{ keyCode: number; page: FeatureUiPage; owner: FeatureUiOwner }> = [
  { keyCode: Phaser.Input.Keyboard.KeyCodes.C, page: 'backpack', owner: 'p1' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.V, page: 'skills', owner: 'p1' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.B, page: 'pets', owner: 'p1' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.N, page: 'magic-weapon', owner: 'p1' },
  { keyCode: P2_BACKPACK_KEY_CODE, page: 'backpack', owner: 'p2' },
  { keyCode: P2_SKILLS_KEY_CODE, page: 'skills', owner: 'p2' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT, page: 'pets', owner: 'p2' },
];

export class FeatureUiScene extends Phaser.Scene {
  private session?: FeatureUiSession;
  private titleText?: Phaser.GameObjects.Text;
  private detailText?: Phaser.GameObjects.Text;
  private backpackLayer?: Phaser.GameObjects.Container;
  private inventoryModel?: FormalInventoryPageModel;
  private skillLayer?: Phaser.GameObjects.Container;
  private skillModel?: FormalSkillPageModel;
  private petLayer?: Phaser.GameObjects.Container;
  private petModel?: FormalPetPageModel;
  private workshopLayer?: Phaser.GameObjects.Container;
  private workshopModel?: FormalWorkshopPageModel;
  private storage?: SaveStorage;
  private finished = false;

  public constructor() {
    super('FeatureUiScene');
  }

  public init(data: FeatureUiSession): void {
    this.session = data;
    this.finished = false;
  }

  public create(): void {
    if (!this.session || formalFeatureUiHost.active?.originSceneKey !== this.session.originSceneKey) {
      this.scene.stop();
      return;
    }
    this.cameras.main.setBackgroundColor('rgba(4, 8, 16, 0.72)');
    this.storage = getBrowserStorage();
    this.add.rectangle(470, 295, 940, 590, 0x030711, 0.78).setInteractive();
    this.add.rectangle(470, 294, 660, 410, 0x111a27, 0.98).setStrokeStyle(3, 0xf2c14e);
    this.add.text(470, 126, '正式功能页面主机', {
      color: '#fff3bf', fontFamily: 'Arial, sans-serif', fontSize: '29px', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.titleText = this.add.text(470, 187, '', {
      color: '#f4f7ff', fontFamily: 'Arial, sans-serif', fontSize: '25px',
    }).setOrigin(0.5);
    this.detailText = this.add.text(470, 238, '', {
      color: '#b9c9df', fontFamily: 'Arial, sans-serif', fontSize: '17px', align: 'center',
      wordWrap: { width: 570 }, lineSpacing: 8,
    }).setOrigin(0.5, 0);

    FeatureUiPages.forEach((page, index) => {
      const x = 220 + index * 125;
      createPageButton(this, x, 388, getFeatureUiPageLabel(page), () => this.switchPage(page, 'p1'));
    });
    createCloseButton(this, 470, 457, () => this.closeHost());
    this.renderSession();

    for (const binding of PageKeys) {
      this.input.keyboard?.addKey(binding.keyCode).on('down', () => this.switchPage(binding.page, binding.owner));
    }
    this.input.keyboard?.on('keydown-ESC', this.closeHost, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.finishSession, this);
  }

  private switchPage(page: FeatureUiPage, owner: FeatureUiOwner): void {
    const session = switchFeatureUi(formalFeatureUiHost, page, owner);
    if (!session) {
      this.detailText?.setText('当前游戏没有第二位玩家，无法切换到 P2 页面。');
      return;
    }
    this.session = session;
    this.renderSession();
  }

  private renderSession(): void {
    if (!this.session) return;
    if (this.session.page === 'backpack') {
      this.destroyWorkshopLayer();
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderBackpackPage();
      return;
    }
    if (this.session.page === 'skills') {
      this.destroyWorkshopLayer();
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderSkillPage();
      return;
    }
    if (this.session.page === 'pets') {
      this.destroyWorkshopLayer();
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.renderPetPage();
      return;
    }
    if (this.session.page === 'workshop') {
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderWorkshopPage();
      return;
    }
    this.destroyWorkshopLayer();
    this.backpackLayer?.destroy(true);
    this.backpackLayer = undefined;
    this.skillLayer?.destroy(true);
    this.skillLayer = undefined;
    this.petLayer?.destroy(true);
    this.petLayer = undefined;
    this.titleText?.setText(`${formatFeatureUiOwner(this.session.owner)} · ${getFeatureUiPageLabel(this.session.page)}`);
    this.detailText?.setText([
      '共享入口、owner、互斥与返回协议已经生效。',
      '此页的真 UI 与完整交互将在对应后续切片接入；当前不会把占位内容标记为完成。',
      this.session.originKind === 'combat' ? '关卡已暂停，关闭后从同一运行态继续。' : '天庭地图已进入模态交互冻结，关闭后回到原地图。',
      'P1：C / V / B / N　P2：小键盘 / / * / -　Esc 关闭',
    ].join('\n'));
  }

  private renderBackpackPage(): void {
    if (!this.session) return;
    this.backpackLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.inventoryModel && this.storage) {
      this.inventoryModel = createFormalInventoryPage(this.storage, owner);
    }
    if (this.inventoryModel && this.inventoryModel.owner !== owner) {
      setFormalInventoryOwner(this.inventoryModel, owner);
    }

    const objects: Phaser.GameObjects.GameObject[] = [];
    const source = this.add.image(0, 0, fullFeatureUiAssets.backpack.key)
      .setOrigin(0)
      .setCrop(0, 0, 940, 590)
      .setAlpha(0.72);
    objects.push(source);
    objects.push(this.add.rectangle(470, 295, 940, 590, 0x07101b, 0.54));
    objects.push(this.add.rectangle(470, 295, 900, 548, 0x111a27, 0.88).setStrokeStyle(2, 0xe5bc55));
    objects.push(this.add.text(470, 34, `${owner.toUpperCase()} 正式背包与装备`, {
      color: '#fff0ad', fontFamily: 'Arial, sans-serif', fontSize: '25px', fontStyle: 'bold',
    }).setOrigin(0.5));

    objects.push(...createLayerButton(this, 84, 70, 92, 32, 'P1 背包', () => this.switchPage('backpack', 'p1')));
    if (this.session.playerCount === 2) {
      objects.push(...createLayerButton(this, 184, 70, 92, 32, 'P2 背包', () => this.switchPage('backpack', 'p2')));
    }
    objects.push(this.add.image(470, 92, fullFeatureUiAssets.backpackGrid.key).setOrigin(0.5).setAlpha(0.8));

    if (!this.inventoryModel || !this.storage) {
      objects.push(this.add.text(470, 250, '当前没有可读的活动存档，无法打开正式背包。', {
        color: '#ffb4a8', fontFamily: 'Arial, sans-serif', fontSize: '20px',
      }).setOrigin(0.5));
      objects.push(...createLayerButton(this, 470, 520, 180, 42, '关闭并返回', () => this.closeHost()));
      this.backpackLayer = this.add.container(0, 0, objects).setDepth(20);
      return;
    }

    InventoryCategories.forEach((category, index) => {
      objects.push(...createLayerButton(
        this, 320 + index * 115, 98, 105, 32, InventoryCategoryLabels[category],
        () => { selectFormalInventoryCategory(this.inventoryModel!, category); this.renderBackpackPage(); },
      ));
    });

    const entries = getFormalInventoryPageEntries(this.inventoryModel);
    for (let index = 0; index < 25; index += 1) {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const x = 120 + col * 68;
      const y = 160 + row * 63;
      const entry = entries[index];
      const cell = this.add.rectangle(x, y, 58, 52, entry ? 0x283d57 : 0x16202d, 0.96)
        .setStrokeStyle(index === this.inventoryModel.selectedIndex ? 3 : 1, index === this.inventoryModel.selectedIndex ? 0xffdc75 : 0x70849c)
        .setInteractive({ useHandCursor: true });
      cell.on('pointerdown', () => { selectFormalInventoryEntry(this.inventoryModel!, index); this.renderBackpackPage(); });
      objects.push(cell);
      if (entry) {
        objects.push(this.add.text(x, y - 7, entry.definition.name.slice(0, 5), {
          color: '#f4f7ff', fontFamily: 'Arial, sans-serif', fontSize: '11px', align: 'center',
        }).setOrigin(0.5));
        objects.push(this.add.text(x + 22, y + 17, String(entry.quantity), {
          color: '#ffe59a', fontFamily: 'Arial, sans-serif', fontSize: '10px',
        }).setOrigin(1));
      }
    }

    const player = getFormalInventoryPlayer(this.inventoryModel);
    EquipmentSlotOrder.forEach((slot, index) => {
      const y = 168 + index * 47;
      const equipped = player.equipmentLoadout[slot];
      objects.push(...createLayerButton(
        this, 700, y, 260, 38,
        `${EquipmentSlotLabels[slot]}：${equipped?.definition.name ?? '空'}`,
        () => { selectFormalEquipmentSlot(this.inventoryModel!, index); this.renderBackpackPage(); },
      ));
    });

    const summary = formatFormalInventorySummary(this.inventoryModel);
    objects.push(this.add.text(548, 385, summary.join('\n'), {
      color: '#dce8f7', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineSpacing: 5,
      wordWrap: { width: 320 },
    }));
    objects.push(...createLayerButton(this, 128, 492, 82, 36, '上一页', () => {
      changeFormalInventoryPage(this.inventoryModel!, -1); this.renderBackpackPage();
    }));
    objects.push(this.add.text(225, 492, `${this.inventoryModel.pageIndex + 1}/${getFormalInventoryPageCount(this.inventoryModel)}`, {
      color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    }).setOrigin(0.5));
    objects.push(...createLayerButton(this, 322, 492, 82, 36, '下一页', () => {
      changeFormalInventoryPage(this.inventoryModel!, 1); this.renderBackpackPage();
    }));
    objects.push(...createLayerButton(this, 566, 520, 130, 40, '穿戴选中', () => {
      equipFormalInventorySelection(this.inventoryModel!, this.storage!); this.renderBackpackPage();
    }));
    objects.push(...createLayerButton(this, 708, 520, 130, 40, '卸下槽位', () => {
      unequipFormalInventorySelection(this.inventoryModel!, this.storage!); this.renderBackpackPage();
    }));
    objects.push(...createLayerButton(this, 850, 520, 130, 40, '关闭返回', () => this.closeHost()));
    this.backpackLayer = this.add.container(0, 0, objects).setDepth(20);
  }

  private renderSkillPage(): void {
    if (!this.session) return;
    this.skillLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.skillModel && this.storage) {
      this.skillModel = createFormalSkillPage(this.storage, owner);
    }
    if (this.skillModel && this.skillModel.owner !== owner) {
      setFormalSkillOwner(this.skillModel, owner);
    }
    if (!this.skillModel || !this.storage) {
      this.titleText?.setText(`${formatFeatureUiOwner(owner)} · 心法与技能`);
      this.detailText?.setText('当前没有可读的活动存档，无法打开正式技能页。');
      return;
    }
    this.skillLayer = createFormalSkillPageView(this, this.skillModel, this.storage, {
      playerCount: this.session.playerCount,
      onOwner: (nextOwner) => this.switchPage('skills', nextOwner),
      onSaved: () => this.syncSkillRuntime(),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderSkillPage(),
    });
  }

  private syncSkillRuntime(): void {
    if (!this.session || !this.skillModel) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) syncFormalSkillRuntime(origin, this.skillModel);
  }

  private renderPetPage(): void {
    if (!this.session) return;
    this.petLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.petModel && this.storage) {
      this.petModel = createFormalPetPage(this.storage, owner);
    }
    if (this.petModel && this.petModel.owner !== owner) {
      setFormalPetOwner(this.petModel, owner);
    }
    if (!this.petModel || !this.storage) {
      this.titleText?.setText(`${formatFeatureUiOwner(owner)} · 宠物`);
      this.detailText?.setText('当前没有可读的活动存档，无法打开正式宠物页。');
      return;
    }
    this.petLayer = createFormalPetPageView(this, this.petModel, this.storage, {
      playerCount: this.session.playerCount,
      onOwner: (nextOwner) => this.switchPage('pets', nextOwner),
      onSaved: () => this.syncPetRuntime(),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderPetPage(),
    });
  }

  private syncPetRuntime(): void {
    if (!this.session || !this.petModel) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) syncFormalPetRuntime(origin, this.petModel);
  }

  private renderWorkshopPage(): void {
    if (!this.session) return;
    this.workshopLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.workshopModel && this.storage) this.workshopModel = createFormalWorkshopPage(this.storage, owner);
    if (this.workshopModel && this.workshopModel.owner !== owner) setFormalWorkshopOwner(this.workshopModel, owner);
    if (!this.workshopModel || !this.storage) {
      this.titleText?.setText(`${formatFeatureUiOwner(owner)} · 装备工坊`);
      this.detailText?.setText('当前没有可读的活动存档，无法打开正式装备工坊。');
      return;
    }
    this.workshopLayer = createFormalWorkshopPageView(this, this.workshopModel, this.storage, {
      playerCount: this.session.playerCount,
      onOwner: (nextOwner) => this.switchPage('workshop', nextOwner),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderWorkshopPage(),
    });
  }

  private destroyWorkshopLayer(): void {
    if (this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    this.workshopLayer?.destroy(true);
    this.workshopLayer = undefined;
  }

  private closeHost(): void {
    if (this.finished) return;
    this.scene.stop();
  }

  private finishSession(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    const session = closeFeatureUi(formalFeatureUiHost) ?? this.session;
    if (!session) return;
    if (this.scene.isPaused(session.originSceneKey)) this.scene.resume(session.originSceneKey);
    this.session = undefined;
    this.inventoryModel = undefined;
    this.skillModel = undefined;
    this.petModel = undefined;
    this.workshopModel = undefined;
  }
}

function createLayerButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
): Phaser.GameObjects.GameObject[] {
  const background = scene.add.rectangle(x, y, width, height, 0x24364d, 0.98)
    .setStrokeStyle(1, 0xc9d6e8).setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '13px', align: 'center',
  }).setOrigin(0.5);
  background.on('pointerover', () => background.setFillStyle(0x38536f));
  background.on('pointerout', () => background.setFillStyle(0x24364d));
  background.on('pointerdown', onClick);
  return [background, text];
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function createPageButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): void {
  const background = scene.add.rectangle(x, y, 112, 42, 0x263950)
    .setStrokeStyle(1, 0xc8d5e6).setInteractive({ useHandCursor: true });
  scene.add.text(x, y, label, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '14px', align: 'center',
  }).setOrigin(0.5);
  background.on('pointerover', () => background.setFillStyle(0x38536f));
  background.on('pointerout', () => background.setFillStyle(0x263950));
  background.on('pointerdown', onClick);
}

function createCloseButton(scene: Phaser.Scene, x: number, y: number, onClick: () => void): void {
  const background = scene.add.rectangle(x, y, 190, 46, 0x7b3d3d)
    .setStrokeStyle(2, 0xffc6a8).setInteractive({ useHandCursor: true });
  scene.add.text(x, y, '关闭并返回', {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '17px',
  }).setOrigin(0.5);
  background.on('pointerdown', onClick);
}
