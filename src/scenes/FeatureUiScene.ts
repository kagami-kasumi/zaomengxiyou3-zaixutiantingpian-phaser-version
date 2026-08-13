import Phaser from 'phaser';
// boundary: this overlay owns Phaser composition and host routing only;
// inventory, skill, pet, persistence, and combat-HUD rules remain in systems/bridges.
import {
  createFormalInventoryPage,
  setFormalInventoryOwner,
  type FormalInventoryPageModel,
} from '../systems/FormalInventoryPageSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import {
  createFormalSkillPage,
  getFormalSkillEntryPlayerCount,
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
  getFormalFeatureUiStorageOverride,
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
import {
  cancelFormalMagicWeaponAction,
  createFormalMagicWeaponPage,
  type FormalMagicWeaponPageModel,
} from '../systems/FormalMagicWeaponPageSystem';
import { createFormalMagicWeaponPageView } from './feature-ui/FormalMagicWeaponPageView';
import { syncFormalMagicWeaponRuntime } from './feature-ui/FormalMagicWeaponRuntimeBridge';
import { ensureFeatureUiPageAssets } from './feature-ui/FeatureUiPageAssetBridge';
import { createFormalInventoryPageView } from './feature-ui/FormalInventoryPageView';

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
  private workshopFeedbackText?: Phaser.GameObjects.Text;
  private workshopFeedbackTimer?: Phaser.Time.TimerEvent;
  private magicWeaponLayer?: Phaser.GameObjects.Container;
  private magicWeaponModel?: FormalMagicWeaponPageModel;
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
    this.storage = getFormalFeatureUiStorageOverride() ?? getBrowserStorage();
    if (this.session.originKind === 'map') this.createMapHostChrome();
    this.renderSession();

    if (this.session.originKind === 'map') {
      for (const binding of PageKeys) {
        this.input.keyboard?.addKey(binding.keyCode).on('down', () => this.switchPage(binding.page, binding.owner));
      }
      this.input.keyboard?.on('keydown-ESC', this.closeHost, this);
    } else {
      for (const binding of PageKeys.filter((binding) => binding.page === this.session?.page)) {
        this.input.keyboard?.addKey(binding.keyCode).on('down', this.closeHost, this);
      }
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.finishSession, this);
  }

  private createMapHostChrome(): void {
    this.cameras.main.setBackgroundColor('rgba(4, 8, 16, 0.72)');
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
  }

  private async switchPage(page: FeatureUiPage, owner: FeatureUiOwner): Promise<void> {
    if (
      page === 'skills'
      && (!this.storage || getFormalSkillEntryPlayerCount(this.storage, owner) === undefined)
    ) {
      this.detailText?.setText('当前存档没有这位玩家，无法切换到对应技能页。');
      return;
    }
    if (!await ensureFeatureUiPageAssets(this, page, owner, this.storage)) {
      this.detailText?.setText('页面资源加载失败，请再次尝试。');
      return;
    }
    const session = switchFeatureUi(formalFeatureUiHost, page, owner);
    if (!session) {
      this.detailText?.setText('当前游戏没有第二位玩家，无法切换到 P2 页面。');
      return;
    }
    this.refreshTargetPageModel(page);
    this.session = session;
    this.renderSession();
  }

  private refreshTargetPageModel(page: FeatureUiPage): void {
    if (page === this.session?.page) return;
    if (page === 'backpack') this.inventoryModel = undefined;
    if (page === 'skills') this.skillModel = undefined;
    if (page === 'pets') this.petModel = undefined;
    if (page === 'workshop') this.workshopModel = undefined;
    if (page === 'magic-weapon') this.magicWeaponModel = undefined;
  }

  private renderSession(): void {
    if (!this.session) return;
    if (this.session.page !== 'magic-weapon') this.destroyMagicWeaponLayer();
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
    if (this.session.page === 'magic-weapon') {
      this.destroyWorkshopLayer();
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderMagicWeaponPage();
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

    if (!this.inventoryModel || !this.storage) {
      this.titleText?.setText(`${owner.toUpperCase()} · 背包`);
      this.detailText?.setText('当前没有可读的活动存档，无法打开正式背包。');
      return;
    }
    this.backpackLayer = createFormalInventoryPageView(
      this,
      this.inventoryModel,
      this.storage,
      {
        onClose: () => this.closeHost(),
        onRerender: () => this.renderBackpackPage(),
      },
      this.session.playerPresentation?.find((snapshot) => snapshot.owner === owner),
    );
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
      onFeedback: (message) => this.showWorkshopFeedback(message),
      onRerender: () => this.renderWorkshopPage(),
    });
  }

  private showWorkshopFeedback(message: string): void {
    this.workshopFeedbackTimer?.remove(false);
    this.workshopFeedbackText?.destroy();
    this.workshopFeedbackText = this.add.text(470, 66, message, {
      color: '#fff4b0',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '18px',
      stroke: '#321507',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(40).setData('workshopGlobalFeedback', true);
    this.workshopFeedbackTimer = this.time.delayedCall(1_800, () => {
      this.workshopFeedbackText?.destroy();
      this.workshopFeedbackText = undefined;
      this.workshopFeedbackTimer = undefined;
    });
  }

  private destroyWorkshopLayer(): void {
    if (this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    this.workshopLayer?.destroy(true);
    this.workshopLayer = undefined;
    this.workshopFeedbackText?.destroy();
    this.workshopFeedbackText = undefined;
    this.workshopFeedbackTimer?.remove(false);
    this.workshopFeedbackTimer = undefined;
  }

  private renderMagicWeaponPage(): void {
    if (!this.session) return;
    this.magicWeaponLayer?.destroy(true);
    if (!this.magicWeaponModel && this.storage) this.magicWeaponModel = createFormalMagicWeaponPage(this.storage);
    if (!this.magicWeaponModel || !this.storage) {
      this.titleText?.setText('P1 · 法宝强化');
      this.detailText?.setText('当前没有可读的活动存档，无法打开正式法宝页。');
      return;
    }
    this.magicWeaponLayer = createFormalMagicWeaponPageView(this, this.magicWeaponModel, this.storage, {
      onSaved: () => this.syncMagicWeaponRuntime(),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderMagicWeaponPage(),
    });
  }

  private syncMagicWeaponRuntime(): void {
    if (!this.session || !this.magicWeaponModel) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) syncFormalMagicWeaponRuntime(origin, this.magicWeaponModel);
  }

  private destroyMagicWeaponLayer(): void {
    if (this.magicWeaponModel?.pending) cancelFormalMagicWeaponAction(this.magicWeaponModel);
    this.magicWeaponLayer?.destroy(true);
    this.magicWeaponLayer = undefined;
  }

  private closeHost(): void {
    if (this.finished) return;
    this.scene.stop();
  }

  private finishSession(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    this.destroyMagicWeaponLayer();
    const session = closeFeatureUi(formalFeatureUiHost) ?? this.session;
    if (!session) return;
    if (this.scene.isPaused(session.originSceneKey)) this.scene.resume(session.originSceneKey);
    this.session = undefined;
    this.inventoryModel = undefined;
    this.skillModel = undefined;
    this.petModel = undefined;
    this.workshopModel = undefined;
    this.magicWeaponModel = undefined;
  }
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
