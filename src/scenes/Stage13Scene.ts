import Phaser from 'phaser';
import type { FormalPartyRuntime, FormalPartySceneData } from '../systems/FormalPartyRuntimeSystem';
import { stage13LevelDefinition } from '../systems/Stage13LevelDefinition';
import { createPlayableLevelRuntime, type PlayableLevelRuntime } from './PlayableLevelRuntime';
import { resolveFormalPartyScene } from './formal-party/FormalPartySceneBridge';
import { createStage13Gameplay } from './stage13/Stage13GameplayBridge';
import { createStage13World } from './stage13/Stage13WorldBridge';

export class Stage13Scene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private runtime?: PlayableLevelRuntime;

  public constructor() { super(stage13LevelDefinition.sceneKey); }

  public init(data?: FormalPartySceneData): void {
    this.partyRuntime = resolveFormalPartyScene(data, import.meta.env.DEV);
  }

  public create(): void {
    this.shutdownStage13();
    if (!this.partyRuntime) {
      this.scene.start('SaveSlotScene');
      return;
    }
    this.runtime = createPlayableLevelRuntime(this, this.partyRuntime, stage13LevelDefinition, {
      createWorld: createStage13World,
      createEncounter: (scene, playerCount, players, world) => {
        const gameplay = createStage13Gameplay(scene, playerCount, players, world.transferDoor);
        return {
          update: gameplay.update,
          destroy: gameplay.destroy,
          unlockProgress: () => gameplay.flow.unlockProgress,
        };
      },
      title: (count) => `Stage 1-3 · ${count}P · P1 A/D/J/K · P2 ←/→/小键盘1/小键盘2 · Esc 设置`,
    });
    this.runtime.create();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage13, this);
  }

  public update(_time: number, delta: number): void { this.runtime?.update(delta); }

  private shutdownStage13(): void {
    this.runtime?.destroy();
    this.runtime = undefined;
  }
}
