import Phaser from 'phaser';
import { loadGame, type SaveStorage } from '../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../systems/Stage11FlowSystem';
import { canEnterStage12 } from '../systems/Stage12EntrySystem';

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
    this.add.text(470, 150, '第一关 · 关卡选择', {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '26px',
    }).setOrigin(0.5);
    this.add.text(470, 196, '1-1 纵向爬升 · 1-2 横向场景切片', {
      color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '17px',
    }).setOrigin(0.5);

    createEntryButton(this, 285, 286, '单人进入 1-1', () => this.startStage11(1));
    createEntryButton(this, 655, 286, '双人进入 1-1', () => this.startStage11(2));

    const stage12Unlocked = canEnterStage12(progress);
    const nextStatus = stage12Unlocked
      ? '1-2 测试期开放 · 无需通关 1-1'
      : '完成 1-1 后解锁 1-2';
    this.add.text(470, 358, nextStatus, {
      color: stage12Unlocked ? '#f2c14e' : '#8b98ad',
      fontFamily: 'Arial, sans-serif', fontSize: '16px',
    }).setOrigin(0.5);
    createEntryButton(this, 285, 422, '单人进入 1-2', () => this.startStage12(1), stage12Unlocked);
    createEntryButton(this, 655, 422, '双人进入 1-2', () => this.startStage12(2), stage12Unlocked);
    this.add.text(470, 510, '按 1 / 2 进入 1-1；按 3 / 4 直接进入 1-2', {
      color: '#8b98ad', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-ONE', () => this.startStage11(1));
    this.input.keyboard?.on('keydown-TWO', () => this.startStage11(2));
    this.input.keyboard?.on('keydown-THREE', () => this.startStage12(1));
    this.input.keyboard?.on('keydown-FOUR', () => this.startStage12(2));
  }

  private startStage11(playerCount: 1 | 2): void {
    this.scene.start('TestScene', { playerCount });
  }

  private startStage12(playerCount: 1 | 2): void {
    if (!canEnterStage12(readUnlockProgress())) return;
    this.scene.start('Stage12Scene', { playerCount });
  }
}

function createEntryButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  enabled = true,
): void {
  const background = scene.add.rectangle(x, y, 310, 52, 0x23314a)
    .setStrokeStyle(2, enabled ? 0xf2c14e : 0x526078);
  if (enabled) background.setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: enabled ? '#f3f6ff' : '#728099', fontFamily: 'Arial, sans-serif', fontSize: '20px',
  }).setOrigin(0.5);
  if (enabled) {
    background.on('pointerover', () => background.setFillStyle(0x344867));
    background.on('pointerout', () => background.setFillStyle(0x23314a));
    background.on('pointerdown', onClick);
  }
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
