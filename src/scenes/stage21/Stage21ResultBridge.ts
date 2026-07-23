import Phaser from 'phaser';
import { saveActiveLevelUnlockProgress } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import type { LevelUnlockProgress } from '../../systems/Stage11FlowSystem';

export function showStage21Result(
  scene: Phaser.Scene,
  result: 'failed' | 'cleared',
  playerCount: 1 | 2,
  unlockProgress: LevelUnlockProgress,
): Phaser.GameObjects.Container {
  const isClear = result === 'cleared';
  const saved = isClear ? persistUnlock(unlockProgress) : false;
  const background = scene.add.rectangle(470, 295, 940, 590, 0x000000, 0.82).setScrollFactor(0);
  const title = scene.add.text(470, 176, isClear ? '关卡胜利' : '全员战败', {
    color: isClear ? '#f2c14e' : '#c96a6a', fontFamily: 'Arial, sans-serif', fontSize: '42px',
  }).setOrigin(0.5).setScrollFactor(0);
  const subtitle = scene.add.text(470, 244, 'Stage 2-1 · 南天王殿', {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '22px',
  }).setOrigin(0.5).setScrollFactor(0);
  const detailCopy = isClear
    ? saved ? '已解锁并保存 2-2' : '已解锁 2-2；当前浏览器尚无可更新存档'
    : '全员倒地 2.5 秒，关卡进度未推进';
  const detail = scene.add.text(470, 286, detailCopy, {
    color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '16px',
  }).setOrigin(0.5).setScrollFactor(0);
  const retry = createButton(scene, 350, 382, '重玩 2-1', () => scene.scene.restart({ playerCount }));
  const back = createButton(scene, 590, 382, '返回天庭地图', () => scene.scene.start('HeavenMapScene'));
  return scene.add.container(0, 0, [background, title, subtitle, detail, ...retry, ...back])
    .setScrollFactor(0).setDepth(200);
}

function persistUnlock(progress: LevelUnlockProgress): boolean {
  const storage = getBrowserStorage();
  return storage ? saveActiveLevelUnlockProgress(storage, progress) : false;
}

function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] {
  const background = scene.add.rectangle(x, y, 200, 50, 0x23314a)
    .setStrokeStyle(2, 0xf2c14e).setScrollFactor(0).setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '17px',
  }).setOrigin(0.5).setScrollFactor(0);
  background.on('pointerover', () => background.setFillStyle(0x344867));
  background.on('pointerout', () => background.setFillStyle(0x23314a));
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
