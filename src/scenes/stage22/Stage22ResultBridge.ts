import Phaser from 'phaser';

export function showStage22Failure(
  scene: Phaser.Scene,
  playerCount: 1 | 2,
): Phaser.GameObjects.Container {
  const background = scene.add.rectangle(470, 295, 940, 590, 0x000000, 0.82).setScrollFactor(0);
  const title = scene.add.text(470, 176, '全员战败', {
    color: '#c96a6a', fontFamily: 'Arial, sans-serif', fontSize: '42px',
  }).setOrigin(0.5).setScrollFactor(0);
  const subtitle = scene.add.text(470, 244, 'Stage 2-2', {
    color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '22px',
  }).setOrigin(0.5).setScrollFactor(0);
  const detail = scene.add.text(470, 286, '全员倒地 2.5 秒，关卡进度未推进', {
    color: '#9ed7b5', fontFamily: 'Arial, sans-serif', fontSize: '16px',
  }).setOrigin(0.5).setScrollFactor(0);
  const retry = createButton(scene, 350, 382, '重玩 2-2', () => scene.scene.restart({ playerCount }));
  const back = createButton(scene, 590, 382, '返回天庭地图', () => scene.scene.start('HeavenMapScene'));
  return scene.add.container(0, 0, [background, title, subtitle, detail, ...retry, ...back])
    .setScrollFactor(0).setDepth(200);
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
