import Phaser from 'phaser';

export class Stage51TransitionScene extends Phaser.Scene {
  public constructor() {
    super('Stage51TransitionScene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#171327');
    this.add.text(470, 155, 'Stage 5-1', {
      color: '#f2c14e', fontFamily: 'Arial, sans-serif', fontSize: '48px',
    }).setOrigin(0.5);
    this.add.text(470, 235, '已通过 Stage 1-2 特殊入口', {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '24px',
    }).setOrigin(0.5);
    this.add.text(470, 292, '本切片只闭合原版 5-1 过渡边界；Stage 5-1 内容尚未接入。', {
      color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '16px',
    }).setOrigin(0.5);
    this.add.text(470, 326, '返回遵循原版通用结果边界：回关卡地图，不回到 1-2。', {
      color: '#9aa7ba', fontFamily: 'Arial, sans-serif', fontSize: '15px',
    }).setOrigin(0.5);

    const button = this.add.rectangle(470, 414, 270, 54, 0x23314a)
      .setStrokeStyle(2, 0xf2c14e)
      .setInteractive({ useHandCursor: true });
    this.add.text(470, 414, '返回关卡地图', {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '19px',
    }).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0x344867));
    button.on('pointerout', () => button.setFillStyle(0x23314a));
    button.on('pointerdown', () => this.scene.start('HeavenMapScene'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('HeavenMapScene'));
  }
}
