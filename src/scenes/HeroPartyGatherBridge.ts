import Phaser from 'phaser';
import { createHeroPartyGatherControl } from '../systems/HeroGatherCoordinateSystem';
import type { HeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';

/** Bind the existing party coordinate port to its Scene lifetime. */
export function createHeroPartyGatherBridge(scene: Phaser.Scene, model: HeroPartyRuntimeModel) {
  const gather = createHeroPartyGatherControl(model);
  let resumePending = false;
  // Pause freezes the last rendered pose; it must not render an extra Tween step.
  const pause = () => { resumePending = false; gather.pause(); };
  // ScenePlugin resumes through the next manager queue. Align at the actual
  // fixed world clock, not RAF time (which includes an unconsumed remainder).
  const resume = () => { resumePending = true; };
  scene.events.on(Phaser.Scenes.Events.PAUSE, pause);
  scene.events.on(Phaser.Scenes.Events.RESUME, resume);
  return {
    ...gather,
    advance: (timeSeconds: number) => {
      if (resumePending) {
        gather.advance(timeSeconds);
        gather.resume();
        resumePending = false;
      }
      gather.advance(timeSeconds);
    },
    destroy: () => {
      gather.destroy();
      scene.events.off(Phaser.Scenes.Events.PAUSE, pause);
      scene.events.off(Phaser.Scenes.Events.RESUME, resume);
    },
  };
}
