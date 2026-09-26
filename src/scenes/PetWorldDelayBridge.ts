import type Phaser from 'phaser';
import { PetWorldDelayedCalls } from '../systems/PetWorldDelayedCalls';

/** Adapt the existing Game PRE_STEP timestamp; scene/party ownership calls destroy. */
export function createPetWorldDelayBridge(scene: Phaser.Scene) {
  const calls = new PetWorldDelayedCalls(() => scene.game.loop.now);
  const advance = (time: number) => calls.advance(time);
  scene.game.events.on('prestep', advance);
  return {
    schedule: (milliseconds: number, callback: () => void) => calls.schedule(milliseconds, callback),
    destroy: () => { calls.destroy(); scene.game.events.off('prestep', advance); },
  };
}
