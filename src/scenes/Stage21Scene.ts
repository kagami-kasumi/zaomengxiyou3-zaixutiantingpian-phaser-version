import Phaser from 'phaser';
import { readStage21QaOptions } from '../systems/Stage21EntrySystem';
import { isStage22LocalQaHost } from '../systems/Stage22EntrySystem';
import type { FormalPartyRuntime, FormalPartySceneData } from '../systems/FormalPartyRuntimeSystem';
import { stage21LevelDefinition } from '../systems/Stage21LevelDefinition';
import { createPlayableLevelRuntime, type PlayableLevelRuntime } from './PlayableLevelRuntime';
import { resolveFormalPartyScene } from './formal-party/FormalPartySceneBridge';
import { createStage21Gameplay } from './stage21/Stage21GameplayBridge';
import { createStage21World } from './stage21/Stage21WorldBridge';

export class Stage21Scene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private runtime?: PlayableLevelRuntime;

  public constructor() { super(stage21LevelDefinition.sceneKey); }

  public init(data?: FormalPartySceneData): void {
    this.partyRuntime = resolveFormalPartyScene(
      data,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
  }

  public create(): void {
    this.shutdownStage21();
    if (!this.partyRuntime) {
      this.scene.start('SaveSlotScene');
      return;
    }
    const qa = readStage21QaOptions(
      window.location.search,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
    this.runtime = createPlayableLevelRuntime(this, this.partyRuntime, stage21LevelDefinition, {
      createWorld: createStage21World,
      createEncounter: (scene, playerCount, players, world) => {
        const gameplay = createStage21Gameplay(
          scene, playerCount, players, world.transferDoor, world.iceViews, qa,
        );
        return {
          update: gameplay.update,
          destroy: gameplay.destroy,
          unlockProgress: () => gameplay.flow.unlockProgress,
        };
      },
      title: (count) => {
        const qaLabel = qa.fastClear || qa.noDamage
          ? ` · DEV QA${qa.noDamage ? ' 无伤' : ''}${qa.fastClear ? ' 自动清怪' : ''}${qa.showcase ? ' 展示' : ''}${qa.holdEnemyType ? ` 保留 M${qa.holdEnemyType}` : ''}${qa.forcedEnemyState ? ` 强制${qa.forcedEnemyState}` : ''}`
          : '';
        return `Stage 2-1 · ${count}P${qaLabel} · P1 A/D/J/K · P2 ←/→/小键盘1/小键盘2 · Esc 设置`;
      },
    });
    this.runtime.create();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage21, this);
  }

  public update(_time: number, delta: number): void { this.runtime?.update(delta); }

  private shutdownStage21(): void {
    this.runtime?.destroy();
    this.runtime = undefined;
  }
}
