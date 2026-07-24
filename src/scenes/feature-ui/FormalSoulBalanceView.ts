import Phaser from 'phaser';

// Shared projection for the player-owned soul balance. The opaque text
// background also clears flattened Flash placeholder digits before the live
// save value is drawn.
export function createFormalSoulBalanceView(
  scene: Phaser.Scene,
  value: number,
): Phaser.GameObjects.Text {
  return scene.add.text(797, 540, String(value), {
    backgroundColor: '#000000',
    color: '#f8ead0',
    fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
    fontSize: '22px',
    fontStyle: 'bold',
    fixedWidth: 143,
    fixedHeight: 34,
    align: 'right',
    stroke: '#3d1908',
    strokeThickness: 4,
    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true },
  }).setData('formalSoulBalance', true);
}
