import Phaser from 'phaser';

import {
  createEquipmentPageQaStorage,
  type EquipmentPageQaOptions,
} from '../systems/EquipmentPageQaFixtureSystem';
import {
  createFormalInventoryPage,
  type FormalInventoryPageModel,
} from '../systems/FormalInventoryPageSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import { ensureFeatureUiPageAssets } from './feature-ui/FeatureUiPageAssetBridge';
import { createFormalInventoryPageView } from './feature-ui/FormalInventoryPageView';

type EquipmentPageQaSceneData = Readonly<{ options: EquipmentPageQaOptions }>;

export class EquipmentPageQaScene extends Phaser.Scene {
  private options?: EquipmentPageQaOptions;
  private storage?: SaveStorage;
  private model?: FormalInventoryPageModel;
  private layer?: Phaser.GameObjects.Container;
  private status?: Phaser.GameObjects.Text;

  public constructor() {
    super('EquipmentPageQaScene');
  }

  public init(data: EquipmentPageQaSceneData): void {
    this.options = data.options;
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
    if (!await ensureFeatureUiPageAssets(this, 'backpack', this.options.owner, this.storage)) {
      this.status?.setText('equipment QA assets failed');
      return;
    }
    this.model = createFormalInventoryPage(this.storage, this.options.owner);
    this.renderPage();
  }

  private renderPage(): void {
    if (!this.options || !this.storage || !this.model) return;
    this.layer?.destroy(true);
    this.layer = createFormalInventoryPageView(this, this.model, this.storage, {
      onClose: () => this.closePage(),
      onRerender: () => this.renderPage(),
    });
    this.status?.setText(
      `${this.options.owner} · role${this.options.roleId} · ${this.options.fixtureCase} · Esc/close then C re-enter`,
    );
  }

  private closePage(): void {
    this.layer?.destroy(true);
    this.layer = undefined;
    this.status?.setText('equipment page closed · press C to re-enter');
  }
}
