import Phaser from 'phaser';
import { getActiveSaveSlotId, loadActiveGame } from '../systems/SaveSlotSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import { createDefaultLevelUnlockProgress } from '../systems/Stage11FlowSystem';
import { canEnterStage12 } from '../systems/Stage12EntrySystem';
import { canEnterStage13 } from '../systems/Stage13EntrySystem';

export class Stage11EntryScene extends Phaser.Scene {
  public constructor() {
    super('Stage11EntryScene');
  }

  public create(): void {
    const progress = readUnlockProgress();
    this.cameras.main.setBackgroundColor('#101724');

    this.add.text(470, 48, '再续天庭', {
      color: '#f2c14e', fontFamily: 'Arial, sans-serif', fontSize: '46px',
    }).setOrigin(0.5);
    this.add.text(470, 96, '第一关 · 关卡选择', {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '26px',
    }).setOrigin(0.5);
    this.add.text(470, 132, '1-1 纵向爬升 · 1-2 神殿 · 1-3 南天门', {
      color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '17px',
    }).setOrigin(0.5);

    createEntryButton(this, 285, 190, '单人进入 1-1', () => this.startStage11(1));
    createEntryButton(this, 655, 190, '双人进入 1-1', () => this.startStage11(2));

    const stage12Unlocked = canEnterStage12(progress);
    const nextStatus = stage12Unlocked
      ? '1-2 测试期开放 · 无需通关 1-1'
      : '完成 1-1 后解锁 1-2';
    this.add.text(470, 250, nextStatus, {
      color: stage12Unlocked ? '#f2c14e' : '#8b98ad',
      fontFamily: 'Arial, sans-serif', fontSize: '16px',
    }).setOrigin(0.5);
    createEntryButton(this, 285, 306, '单人进入 1-2', () => this.startStage12(1), stage12Unlocked);
    createEntryButton(this, 655, 306, '双人进入 1-2', () => this.startStage12(2), stage12Unlocked);

    const stage13Unlocked = canEnterStage13(progress);
    const stage13Status = stage13Unlocked
      ? '1-3 测试期开放 · 普通进度需完成 1-2'
      : '完成 1-2 后解锁 1-3';
    this.add.text(470, 366, stage13Status, {
      color: stage13Unlocked ? '#f2c14e' : '#8b98ad',
      fontFamily: 'Arial, sans-serif', fontSize: '16px',
    }).setOrigin(0.5);
    createEntryButton(this, 285, 422, '单人进入 1-3', () => this.startStage13(1), stage13Unlocked);
    createEntryButton(this, 655, 422, '双人进入 1-3', () => this.startStage13(2), stage13Unlocked);
    this.add.text(470, 510, '按 1/2 进入 1-1 · 3/4 进入 1-2 · 5/6 进入 1-3', {
      color: '#8b98ad', fontFamily: 'Arial, sans-serif', fontSize: '14px',
    }).setOrigin(0.5);
    const activeSlotId = getActiveSlotId();
    this.add.text(16, 16, activeSlotId === undefined ? '未选择存档' : `当前存档 ${activeSlotId + 1}`, {
      color: '#f2c14e', fontFamily: 'Arial, sans-serif', fontSize: '15px',
      backgroundColor: '#151c28', padding: { x: 7, y: 4 },
    });
    createEntryButton(this, 470, 556, '返回存档选择', () => this.scene.start('SaveSlotScene'));

    this.input.keyboard?.on('keydown-ONE', () => this.startStage11(1));
    this.input.keyboard?.on('keydown-TWO', () => this.startStage11(2));
    this.input.keyboard?.on('keydown-THREE', () => this.startStage12(1));
    this.input.keyboard?.on('keydown-FOUR', () => this.startStage12(2));
    this.input.keyboard?.on('keydown-FIVE', () => this.startStage13(1));
    this.input.keyboard?.on('keydown-SIX', () => this.startStage13(2));
  }

  private startStage11(playerCount: 1 | 2): void {
    this.scene.start('TestScene', { playerCount });
  }

  private startStage12(playerCount: 1 | 2): void {
    if (!canEnterStage12(readUnlockProgress())) return;
    this.scene.start('Stage12Scene', { playerCount });
  }

  private startStage13(playerCount: 1 | 2): void {
    if (!canEnterStage13(readUnlockProgress())) return;
    this.scene.start('Stage13Scene', { playerCount });
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
    ? loadActiveGame(storage)?.levelUnlockProgress ?? createDefaultLevelUnlockProgress()
    : createDefaultLevelUnlockProgress();
}

function getActiveSlotId(): number | undefined {
  const storage = getBrowserStorage();
  return storage ? getActiveSaveSlotId(storage) : undefined;
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
