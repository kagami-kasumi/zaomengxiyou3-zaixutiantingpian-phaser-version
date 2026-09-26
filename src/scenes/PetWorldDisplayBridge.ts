import type Phaser from 'phaser';

/** Stage-native frames keep advancing while a combat Scene is ordinarily paused. */
export function createPetWorldDisplayBridge(scene: Phaser.Scene) {
  let ticks = 0;
  const advance = (_time: number, delta: number) => {
    ticks += Math.max(0, delta) * scene.game.loop.targetFps / 1000;
  };
  scene.game.events.on('prestep', advance);
  return {
    readTick: () => ticks,
    destroy: () => scene.game.events.off('prestep', advance),
  };
}
