import Phaser from 'phaser';
import type { FormalPartyRuntime, FormalPartySceneData } from '../systems/FormalPartyRuntimeSystem';
import { stage12LevelDefinition } from '../systems/Stage12LevelDefinition';
import { isStage22LocalQaHost } from '../systems/Stage22EntrySystem';
import { createPlayableLevelRuntime, type PlayableLevelRuntime } from './PlayableLevelRuntime';
import { resolveFormalPartyScene } from './formal-party/FormalPartySceneBridge';
import { createStage12Gameplay } from './stage12/Stage12GameplayBridge';
import { createStage12World } from './stage12/Stage12WorldBridge';

export class Stage12Scene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private runtime?: PlayableLevelRuntime;

  public constructor() { super(stage12LevelDefinition.sceneKey); }

  public init(data?: FormalPartySceneData): void {
    this.partyRuntime = resolveFormalPartyScene(
      data,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
  }

  public create(): void {
    this.shutdownStage12();
    if (!this.partyRuntime) {
      this.scene.start('SaveSlotScene');
      return;
    }
    this.runtime = createPlayableLevelRuntime(this, this.partyRuntime, stage12LevelDefinition, {
      createWorld: createStage12World,
      createEncounter: (scene, playerCount, players, world) => {
        const gameplay = createStage12Gameplay(scene, playerCount, players, world.transferDoor, world.fbEnter);
        return {
          update: gameplay.update,
          destroy: gameplay.destroy,
          unlockProgress: () => gameplay.flow.unlockProgress,
        };
      },
      title: (count) => `Stage 1-2 · ${count}P · P1 A/D/J/W · P2 ←/→/小键盘1/↑ · Esc 设置`,
      handleSpecialResult: (result) => {
        if (result !== 'fb-entered') return false;
        this.scene.start('Stage51TransitionScene');
        return true;
      },
    });
    this.runtime.create();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage12, this);
  }

  public update(_time: number, delta: number): void { this.runtime?.update(delta); }

  private shutdownStage12(): void {
    this.runtime?.destroy();
    this.runtime = undefined;
  }
}
