import Phaser from 'phaser';
import { isStage22LocalQaHost, readStage22QaOptions } from '../systems/Stage22EntrySystem';
import type { FormalPartyRuntime, FormalPartySceneData } from '../systems/FormalPartyRuntimeSystem';
import { stage22TransferDoor } from '../systems/Stage22Layout';
import { stage22LevelDefinition } from '../systems/Stage22LevelDefinition';
import { createPlayableLevelRuntime, type PlayableLevelRuntime } from './PlayableLevelRuntime';
import { resolveFormalPartyScene } from './formal-party/FormalPartySceneBridge';
import { createStage22Gameplay } from './stage22/Stage22GameplayBridge';
import { createStage22World } from './stage22/Stage22WorldBridge';

export class Stage22Scene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private runtime?: PlayableLevelRuntime;

  public constructor() { super(stage22LevelDefinition.sceneKey); }

  public init(data?: FormalPartySceneData): void {
    const allowDevOverride = import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname);
    this.partyRuntime = resolveFormalPartyScene(data, allowDevOverride);
  }

  public create(): void {
    this.shutdownStage22();
    if (!this.partyRuntime) {
      this.scene.start('SaveSlotScene');
      return;
    }
    const qa = readStage22QaOptions(
      window.location.search,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
    this.runtime = createPlayableLevelRuntime(this, this.partyRuntime, stage22LevelDefinition, {
      createWorld: createStage22World,
      createEncounter: (scene, playerCount, players, world) => {
        if (qa.bossState === 'door') players.forEach((player) => player.setX(stage22TransferDoor.x));
        const gameplay = createStage22Gameplay(
          scene,
          playerCount,
          players,
          world.transferDoor,
          world.fireViews,
          world.updateFireViews,
          qa,
        );
        return {
          update: gameplay.update,
          destroy: gameplay.destroy,
          unlockProgress: () => gameplay.flow.unlockProgress,
        };
      },
    });
    this.runtime.create();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage22, this);
  }

  public update(_time: number, delta: number): void { this.runtime?.update(delta); }

  private shutdownStage22(): void {
    this.runtime?.destroy();
    this.runtime = undefined;
  }
}
