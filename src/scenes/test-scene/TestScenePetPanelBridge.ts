// boundary: pet panel bridge owns Phaser controls and translates pointer/key
// actions; roster transitions remain in PetOwnershipSystem/PetRosterSystem.
import Phaser from 'phaser';
import { PetUiKeyCodes, type PlayerSlot } from './TestSceneSystems';

export type PetPanelView = {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  ownerLabel: Phaser.GameObjects.Text;
  previousButton: Phaser.GameObjects.Text;
  nextButton: Phaser.GameObjects.Text;
  deployButton: Phaser.GameObjects.Text;
};

export function createPetUIKeys(this: any): void {
  const keyboard = this.input.keyboard;
  if (!keyboard) return;
  this.petPanelToggleKey = keyboard.addKey(PetUiKeyCodes.p1Panel);
  this.p2PetPanelToggleKey = keyboard.addKey(PetUiKeyCodes.p2Panel);
}

export function createPetPanel(this: any): PetPanelView {
  const container = this.add.container(0, 0).setVisible(false);
  const bg = this.add.graphics();
  bg.fillStyle(0x101724, 0.96);
  bg.fillRoundedRect(572, 44, 344, 500, 8);
  bg.lineStyle(1, 0xf2c14e, 0.85);
  bg.strokeRoundedRect(572, 44, 344, 500, 8);

  const ownerLabel = this.add.text(588, 56, '', {
    color: '#f2c14e', fontFamily: 'Arial, sans-serif', fontSize: '14px',
  });
  const text = this.add.text(588, 82, '', {
    color: '#dfe8f5', fontFamily: 'Courier New, monospace', fontSize: '11px', lineSpacing: 3,
  });
  const previousButton = createPointerButton(this, 588, 508, '◀ 上一只', () => this.selectPetFromPanel(-1));
  const nextButton = createPointerButton(this, 682, 508, '下一只 ▶', () => this.selectPetFromPanel(1));
  const deployButton = createPointerButton(this, 794, 508, '出战 / 休息', () => this.togglePetFromPanel());
  container.add([bg, ownerLabel, text, previousButton, nextButton, deployButton]);
  return { container, bg, text, ownerLabel, previousButton, nextButton, deployButton };
}

export function setPetPanelOwnerLabel(view: PetPanelView, owner: PlayerSlot): void {
  const shortcut = owner === 'p1' ? 'B' : 'Num -';
  view.ownerLabel.setText(`${owner.toUpperCase()} 宠物面板  [${shortcut}] 关闭`);
}

function createPointerButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): Phaser.GameObjects.Text {
  const button = scene.add.text(x, y, label, {
    color: '#101724',
    backgroundColor: '#f2c14e',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    padding: { x: 6, y: 5 },
  }).setInteractive({ useHandCursor: true });
  button.on('pointerup', onClick);
  button.on('pointerover', () => button.setStyle({ backgroundColor: '#ffe08a' }));
  button.on('pointerout', () => button.setStyle({ backgroundColor: '#f2c14e' }));
  return button;
}
