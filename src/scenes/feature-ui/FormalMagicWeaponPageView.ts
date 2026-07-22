import Phaser from 'phaser';
import { fullFeatureUiAssets } from '../../assets/AssetManifest';
import {
  cancelFormalMagicWeaponAction,
  confirmFormalMagicWeaponAction,
  getFormalMagicWeaponPanelState,
  requestFormalMagicWeaponElementReset,
  requestFormalMagicWeaponUpgrade,
  type FormalMagicWeaponPageModel,
} from '../../systems/FormalMagicWeaponPageSystem';
import type { SaveStorage } from '../../systems/SaveSystem';

type Callbacks = {
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

export function createFormalMagicWeaponPageView(
  scene: Phaser.Scene,
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
  callbacks: Callbacks,
): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.image(0, 0, fullFeatureUiAssets.magicWeaponPage.key)
    .setOrigin(0).setCrop(0, 0, 940, 590).setAlpha(0.78));
  objects.push(scene.add.rectangle(470, 295, 940, 590, 0x07101b, 0.34));
  const panel = getFormalMagicWeaponPanelState(model);
  objects.push(scene.add.text(470, 28, 'P1 法宝强化与五行重置', {
    color: '#fff0ad', fontFamily: 'Arial', fontSize: '25px', fontStyle: 'bold',
  }).setOrigin(0.5));
  objects.push(scene.add.text(470, 59, '原版仅有 P1 N / HUD 法宝入口；不伪造 P2 快捷键', {
    color: '#c8d6e8', fontFamily: 'Arial', fontSize: '13px',
  }).setOrigin(0.5));

  if (!panel.equipped) {
    objects.push(scene.add.rectangle(470, 280, 560, 190, 0x111a27, 0.94).setStrokeStyle(2, 0xd38b63));
    objects.push(scene.add.text(470, 260, '未装备法宝', {
      color: '#ffb4a8', fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold',
    }).setOrigin(0.5));
    objects.push(scene.add.text(470, 310, '请先在正式背包把 zbfb 法宝穿入法宝槽；当前拒绝强化与重置。', {
      color: '#e7eef9', fontFamily: 'Arial', fontSize: '16px', align: 'center',
    }).setOrigin(0.5));
    objects.push(...button(scene, 470, 520, 170, 42, '关闭并返回', callbacks.onClose));
    return scene.add.container(0, 0, objects).setDepth(20);
  }

  objects.push(scene.add.rectangle(292, 302, 430, 410, 0x101a28, 0.82).setStrokeStyle(2, 0xc9a84f));
  objects.push(scene.add.text(292, 116, `${panel.name}　Lv.${panel.level}`, {
    color: '#fff1ad', fontFamily: 'Arial', fontSize: '23px', fontStyle: 'bold',
  }).setOrigin(0.5));
  const stats = panel.stats;
  objects.push(scene.add.text(115, 160, [
    `内部名：${panel.fillName}`,
    `成长率：${panel.growthRate}`,
    `五行：${panel.element || '-'}`,
    `攻击：${Math.trunc(stats.power)}`,
    `防御：${Math.trunc(stats.defense)}`,
    `生命：${Math.trunc(stats.maxHp)}`,
    `魔法：${Math.trunc(stats.maxMp)}`,
  ].join('\n'), {
    color: '#eef4ff', fontFamily: 'Arial', fontSize: '17px', lineSpacing: 12,
  }));
  objects.push(scene.add.text(115, 390, `灵魂：${panel.soul}\n传承法器：${panel.resetMaterialCount}`, {
    color: '#ffe08a', fontFamily: 'Arial', fontSize: '16px', lineSpacing: 8,
  }));

  objects.push(scene.add.rectangle(700, 290, 390, 365, 0x101a28, 0.9).setStrokeStyle(2, 0xc9a84f));
  objects.push(scene.add.text(700, 155, `下一等级：${panel.requirement.available ? `Lv.${panel.requirement.nextLevel}` : '-'}\n${panel.requirement.message}`, {
    color: '#f4d58d', fontFamily: 'Arial', fontSize: '17px', align: 'center', lineSpacing: 8,
    wordWrap: { width: 340 },
  }).setOrigin(0.5));
  objects.push(scene.add.text(700, 280, panel.message, {
    color: '#dce8f7', fontFamily: 'Arial', fontSize: '15px', align: 'center', lineSpacing: 5,
    wordWrap: { width: 340 },
  }).setOrigin(0.5));

  if (model.pending) {
    objects.push(scene.add.rectangle(700, 390, 350, 120, 0x2a1c18, 0.97).setStrokeStyle(2, 0xffdc75));
    objects.push(scene.add.text(700, 365, model.pending.prompt, {
      color: '#fff3bf', fontFamily: 'Arial', fontSize: '14px', align: 'center', wordWrap: { width: 320 },
    }).setOrigin(0.5));
    objects.push(...button(scene, 630, 418, 125, 36, '确认提交', () => {
      const result = confirmFormalMagicWeaponAction(model, storage);
      if (result === 'upgraded' || result === 'reset') callbacks.onSaved();
      callbacks.onRerender();
    }));
    objects.push(...button(scene, 770, 418, 125, 36, '取消', () => {
      cancelFormalMagicWeaponAction(model); callbacks.onRerender();
    }));
  } else {
    objects.push(...button(scene, 625, 390, 145, 42, '强化法宝', () => {
      const result = requestFormalMagicWeaponUpgrade(model, storage);
      if (result === 'upgraded') callbacks.onSaved();
      callbacks.onRerender();
    }));
    objects.push(...button(scene, 775, 390, 145, 42, '重置五行', () => {
      requestFormalMagicWeaponElementReset(model); callbacks.onRerender();
    }));
  }
  objects.push(...button(scene, 700, 510, 170, 42, '关闭并重算返回', callbacks.onClose));
  return scene.add.container(0, 0, objects).setDepth(20);
}

function button(
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
    color: '#fff', fontFamily: 'Arial', fontSize: '14px', align: 'center',
  }).setOrigin(0.5);
  background.on('pointerover', () => background.setFillStyle(0x38536f));
  background.on('pointerout', () => background.setFillStyle(0x24364d));
  background.on('pointerdown', onClick);
  return [background, text];
}
