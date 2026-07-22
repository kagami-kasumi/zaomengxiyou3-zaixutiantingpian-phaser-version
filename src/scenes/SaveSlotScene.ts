import Phaser from 'phaser';
import { saveSlotAssets } from '../assets/AssetManifest';
import {
  createSaveSlot,
  deleteSaveSlot,
  getSaveSlotDisplayName,
  listSaveSlots,
  migrateLegacySingleSave,
  selectSaveSlot,
  type SaveSlotId,
  type SaveSlotSnapshot,
} from '../systems/SaveSlotSystem';
import type { SaveStorage } from '../systems/SaveSystem';

const SlotPositions = [
  { x: 338.5, y: 267 }, { x: 594.5, y: 267 },
  { x: 338.5, y: 346 }, { x: 594.5, y: 346 },
  { x: 338.5, y: 424 }, { x: 594.5, y: 424 },
] as const;

export class SaveSlotScene extends Phaser.Scene {
  public slotSnapshots: SaveSlotSnapshot[] = [];

  private storage?: SaveStorage;
  private slotLayer?: Phaser.GameObjects.Container;
  private dialogLayer?: Phaser.GameObjects.Container;
  private feedbackText?: Phaser.GameObjects.Text;

  public constructor() {
    super('SaveSlotScene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#08090c');
    this.add.image(0, 0, saveSlotAssets.startMenu.key).setOrigin(0).setDisplaySize(940, 590);
    this.add.image(0, 0, saveSlotAssets.slotPanel.key).setOrigin(0).setDisplaySize(940, 590);
    this.feedbackText = this.add.text(470, 526, '', {
      color: '#f6d36d', fontFamily: 'Arial, sans-serif', fontSize: '16px',
      backgroundColor: '#151515', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(30);

    this.storage = getBrowserStorage();
    if (!this.storage) {
      this.feedbackText.setText('浏览器存储不可用，无法进入正式存档流程');
      return;
    }

    const migration = migrateLegacySingleSave(this.storage);
    if (migration === 'imported') {
      this.feedbackText.setText('旧单槽存档已安全迁移到存档 1');
    } else if (migration === 'legacy-corrupt') {
      this.feedbackText.setText('检测到损坏的旧存档：原数据已保留，请勿误覆盖');
    } else {
      this.feedbackText.setText('选择空槽新建，或读取已有存档；删除必须二次确认');
    }
    this.refreshSlots();
    this.bindKeyboardShortcuts();
  }

  private refreshSlots(): void {
    if (!this.storage) return;
    this.slotLayer?.destroy(true);
    this.slotLayer = this.add.container(0, 0).setDepth(20);
    this.slotSnapshots = listSaveSlots(this.storage);
    for (const snapshot of this.slotSnapshots) this.createSlotView(snapshot);
  }

  private createSlotView(snapshot: SaveSlotSnapshot): void {
    if (!this.slotLayer) return;
    const position = SlotPositions[snapshot.id];
    const hitArea = this.add.rectangle(position.x, position.y, 242, 64, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    const color = snapshot.status === 'corrupt' ? '#ff7777' : snapshot.status === 'valid' ? '#f7e2a2' : '#c4c8cf';
    const title = this.add.text(position.x - 77, position.y - 12, getSaveSlotDisplayName(snapshot), {
      color, fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold',
    });
    const detail = this.add.text(position.x - 77, position.y + 12, getSlotDetail(snapshot), {
      color: snapshot.status === 'corrupt' ? '#ffaaaa' : '#929aa8',
      fontFamily: 'Arial, sans-serif', fontSize: '12px',
    });
    hitArea.on('pointerover', () => hitArea.setFillStyle(0xe8853b, 0.16));
    hitArea.on('pointerout', () => hitArea.setFillStyle(0x000000, 0.001));
    hitArea.on('pointerdown', () => this.activateSlot(snapshot.id));
    this.slotLayer.add([hitArea, title, detail]);

    if (snapshot.status !== 'empty') {
      const deleteButton = this.add.text(position.x + 75, position.y + 9, '删除', {
        color: '#ff9a72', fontFamily: 'Arial, sans-serif', fontSize: '13px',
        backgroundColor: '#31130e', padding: { x: 5, y: 3 },
      }).setInteractive({ useHandCursor: true });
      deleteButton.on('pointerdown', (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.openDeleteConfirmation(snapshot.id);
      });
      this.slotLayer.add(deleteButton);
    }
  }

  private activateSlot(slotId: SaveSlotId): void {
    if (!this.storage || this.dialogLayer) return;
    const snapshot = this.slotSnapshots[slotId];
    if (snapshot.status === 'corrupt') {
      this.feedbackText?.setText(`存档 ${slotId + 1} 已损坏，无法读取；请先确认删除`);
      return;
    }
    if (snapshot.status === 'empty') {
      if (!createSaveSlot(this.storage, slotId)) {
        this.feedbackText?.setText(`存档 ${slotId + 1} 新建失败，请重新扫描`);
        this.refreshSlots();
        return;
      }
    } else if (!selectSaveSlot(this.storage, slotId)) {
      this.feedbackText?.setText(`存档 ${slotId + 1} 读取失败，未修改原数据`);
      this.refreshSlots();
      return;
    }
    this.scene.start('HeavenMapScene');
  }

  private openDeleteConfirmation(slotId: SaveSlotId): void {
    if (!this.storage || this.dialogLayer) return;
    this.dialogLayer = this.add.container(0, 0).setDepth(100);
    const blocker = this.add.rectangle(470, 295, 940, 590, 0x000000, 0.45).setInteractive();
    const sourceFrame = this.add.image(0, 0, saveSlotAssets.confirmDialog.key).setOrigin(0).setDisplaySize(940, 590);
    const cover = this.add.rectangle(484, 303, 306, 96, 0x070707, 1).setStrokeStyle(1, 0x8d8d8d);
    const prompt = this.add.text(484, 283, `确定删除存档 ${slotId + 1}？`, {
      color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '20px', fontStyle: 'bold',
    }).setOrigin(0.5);
    const warning = this.add.text(484, 306, '此操作不可撤销', {
      color: '#ff9a72', fontFamily: 'Arial, sans-serif', fontSize: '13px',
    }).setOrigin(0.5);
    const confirm = createDialogButton(this, 430, 333, '确定', () => {
      deleteSaveSlot(this.storage!, slotId);
      this.closeDialog();
      this.feedbackText?.setText(`存档 ${slotId + 1} 已删除`);
      this.refreshSlots();
    });
    const cancel = createDialogButton(this, 540, 333, '取消', () => this.closeDialog());
    this.dialogLayer.add([blocker, sourceFrame, cover, prompt, warning, confirm, cancel]);
  }

  private closeDialog(): void {
    this.dialogLayer?.destroy(true);
    this.dialogLayer = undefined;
  }

  private bindKeyboardShortcuts(): void {
    const keys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'] as const;
    keys.forEach((key, index) => {
      this.input.keyboard?.on(`keydown-${key}`, () => this.activateSlot(index as SaveSlotId));
    });
    this.input.keyboard?.on('keydown-ESC', () => this.closeDialog());
  }
}

function createDialogButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): Phaser.GameObjects.Text {
  const button = scene.add.text(x, y, label, {
    color: '#1a1200', backgroundColor: '#ffd51e',
    fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold',
    padding: { x: 13, y: 4 },
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  button.on('pointerdown', onClick);
  return button;
}

function getSlotDetail(snapshot: SaveSlotSnapshot): string {
  if (snapshot.status === 'empty') return '点击新建';
  if (snapshot.status === 'corrupt' || !snapshot.save) return '读取被拒绝 · 可确认删除';
  const date = new Date(snapshot.save.savedAt);
  const savedAt = Number.isNaN(date.getTime()) ? '时间未知' : date.toLocaleString('zh-CN', { hour12: false });
  return `${savedAt}${snapshot.sourceVersion !== 3 ? ` · V${snapshot.sourceVersion}→V3` : ''}`;
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
