import Phaser from 'phaser';
import { loadGame, type SaveStorage } from '../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../systems/Stage11FlowSystem';

export class Stage11EntryScene extends Phaser.Scene {
  public constructor() {
    super('Stage11EntryScene');
  }

  public create(): void {
    const progress = readUnlockProgress();
    this.cameras.main.setBackgroundColor('#101724');

    this.add.text(470, 92, '再续天庭', {
      color: '#f2c14e', fontFamily: 'Arial, sans-serif', fontSize: '46px',
    }).setOrigin(0.5);
    this.add.text(470, 150, '第一关 · Stage 1-1', {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '26px',
    }).setOrigin(0.5);
    this.add.text(470, 196, '纵向爬升 → 巫鹰 → 传送门', {
      color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '17px',
    }).setOrigin(0.5);

    createEntryButton(this, 470, 286, '单人进入 1-1', () => this.startStage(1));
    createEntryButton(this, 470, 354, '双人进入 1-1', () => this.startStage(2));

    const nextStatus = progress.unlockedLevel >= 2
      ? '1-2 已解锁 · 内容尚未接入'
      : '完成 1-1 后解锁 1-2';
    this.add.text(470, 432, nextStatus, {
      color: progress.unlockedLevel >= 2 ? '#f2c14e' : '#8b98ad',
      fontFamily: 'Arial, sans-serif', fontSize: '16px',
    }).setOrigin(0.5);
    this.add.text(470, 510, '鼠标点击，或按 1 / 2 选择玩家数', {
      color: '#8b98ad', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-ONE', () => this.startStage(1));
    this.input.keyboard?.on('keydown-TWO', () => this.startStage(2));
  }

  private startStage(playerCount: 1 | 2): void {
    this.scene.start('TestScene', { playerCount });
  }
}

function createEntryButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): void {
  const background = scene.add.rectangle(x, y, 310, 52, 0x23314a)
    .setStrokeStyle(2, 0xf2c14e)
    .setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '20px',
  }).setOrigin(0.5);
  background.on('pointerover', () => background.setFillStyle(0x344867));
  background.on('pointerout', () => background.setFillStyle(0x23314a));
  background.on('pointerdown', onClick);
  text.setDepth(background.depth + 1);
}

function readUnlockProgress() {
  const storage = getBrowserStorage();
  return storage
    ? loadGame(storage)?.levelUnlockProgress ?? createDefaultLevelUnlockProgress()
    : createDefaultLevelUnlockProgress();
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
