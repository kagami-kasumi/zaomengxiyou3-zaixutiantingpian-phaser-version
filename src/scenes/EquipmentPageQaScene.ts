import Phaser from 'phaser';

import {
  createEquipmentPageQaStorage,
  type EquipmentPageQaOptions,
} from '../systems/EquipmentPageQaFixtureSystem';
import {
  createFormalInventoryPage,
  type FormalInventoryPageModel,
} from '../systems/FormalInventoryPageSystem';
import {
  closeFormalWorkshopPage,
  createFormalWorkshopPage,
  getFormalWorkshopEntries,
  selectFormalWorkshopEntry,
  setFormalWorkshopOwner,
  type FormalWorkshopPageModel,
} from '../systems/FormalWorkshopPageSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import { ensureFeatureUiPageAssets } from './feature-ui/FeatureUiPageAssetBridge';
import { createFormalInventoryPageView } from './feature-ui/FormalInventoryPageView';
import { createFormalWorkshopPageView } from './feature-ui/FormalWorkshopPageView';

type EquipmentPageQaSceneData = Readonly<{
  options: EquipmentPageQaOptions;
  page?: 'backpack' | 'workshop';
}>;

export class EquipmentPageQaScene extends Phaser.Scene {
  private options?: EquipmentPageQaOptions;
  private page: 'backpack' | 'workshop' = 'backpack';
  private storage?: SaveStorage;
  private model?: FormalInventoryPageModel;
  private workshopModel?: FormalWorkshopPageModel;
  private layer?: Phaser.GameObjects.Container;
  private status?: Phaser.GameObjects.Text;

  public constructor() {
    super('EquipmentPageQaScene');
  }

  public init(data: EquipmentPageQaSceneData): void {
    this.options = data.options;
    this.page = data.page ?? 'backpack';
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#101720');
    this.status = this.add.text(12, 566, '', {
      color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '12px',
    }).setDepth(100);
    this.input.keyboard?.on('keydown-C', () => this.renderPage());
    this.input.keyboard?.on('keydown-ESC', () => this.closePage());
    void this.preparePage();
  }

  private async preparePage(): Promise<void> {
    if (!this.options) return;
    this.storage = createEquipmentPageQaStorage(this.options);
    this.status?.setText('equipment QA assets loading…');
    if (!await ensureFeatureUiPageAssets(this, this.page === 'workshop' ? 'workshop' : 'backpack', this.options.owner, this.storage)) {
      this.status?.setText('equipment QA assets failed');
      return;
    }
    if (this.page === 'workshop') {
      this.workshopModel = createFormalWorkshopPage(this.storage, this.options.owner);
      const targetIndex = this.workshopModel
        ? getFormalWorkshopEntries(this.workshopModel).findIndex(
          (entry) => entry.kind === 'equipment' && entry.instanceId === 'qa-_clj',
        )
        : -1;
      if (this.workshopModel && targetIndex >= 0) selectFormalWorkshopEntry(this.workshopModel, targetIndex);
    } else {
      this.model = createFormalInventoryPage(this.storage, this.options.owner);
    }
    this.renderPage();
  }

  private renderPage(): void {
    if (!this.options || !this.storage) return;
    this.layer?.destroy(true);
    if (this.page === 'workshop') {
      if (!this.workshopModel) return;
      this.layer = createFormalWorkshopPageView(this, this.workshopModel, this.storage, {
        playerCount: 2,
        onOwner: (owner) => {
          setFormalWorkshopOwner(this.workshopModel!, owner);
          this.renderPage();
        },
        onClose: () => this.closePage(),
        onFeedback: (message) => this.status?.setText(message),
        onRerender: () => this.renderPage(),
      });
    } else {
      if (!this.model) return;
      this.layer = createFormalInventoryPageView(this, this.model, this.storage, {
        onClose: () => this.closePage(),
        onRerender: () => this.renderPage(),
      });
    }
    this.status?.setText(
      `${this.options.owner} · role${this.options.roleId} · ${this.options.fixtureCase} · ${this.page} · Esc/close then C re-enter`,
    );
  }

  private closePage(): void {
    if (this.page === 'workshop' && this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    this.layer?.destroy(true);
    this.layer = undefined;
    this.status?.setText('equipment page closed · press C to re-enter');
  }
}
