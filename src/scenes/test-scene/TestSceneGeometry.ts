import Phaser from 'phaser';

export function toPhaserRect(hitbox: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Phaser.Geom.Rectangle {
  return new Phaser.Geom.Rectangle(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
}
