import Phaser from 'phaser';
import { installFormalFeatureUiEntries } from './feature-ui/FormalFeatureUiEntryBridge';
import { AssetKeys } from '../assets/AssetManifest';
import {
  createFormalPartyRetryData,
  type FormalPartyRuntime,
  type FormalPartySceneData,
} from '../systems/FormalPartyRuntimeSystem';
import {
  stage12HeroSpawns,
  STAGE12_WORLD_HEIGHT,
  STAGE12_WORLD_LEFT,
  STAGE12_WORLD_WIDTH,
} from '../systems/Stage12Layout';
import { createStage12World, type Stage12WorldHandle } from './stage12/Stage12WorldBridge';
import {
  createStage12Gameplay,
  type Stage12GameplayHandle,
} from './stage12/Stage12GameplayBridge';
import { showStage12Result } from './stage12/Stage12ResultBridge';
import { resolveFormalPartyScene } from './formal-party/FormalPartySceneBridge';

export class Stage12Scene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private playerCount: 1 | 2 = 1;
  private world?: Stage12WorldHandle;
  private gameplay?: Stage12GameplayHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];
  private resultOverlay?: Phaser.GameObjects.Container;

  public constructor() {
    super('Stage12Scene');
  }

  public init(data?: FormalPartySceneData): void {
    this.partyRuntime = resolveFormalPartyScene(data, import.meta.env.DEV);
    this.playerCount = this.partyRuntime?.playerCount ?? 1;
  }

  public create(): void {
    this.shutdownStage12();
    if (!this.partyRuntime) {
      this.scene.start('SaveSlotScene');
      return;
    }
    installFormalFeatureUiEntries(this, { originKind: 'combat', party: this.partyRuntime.party });
    this.cameras.main.setBounds(STAGE12_WORLD_LEFT, 0, STAGE12_WORLD_WIDTH, STAGE12_WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;
    this.world = createStage12World(this);
    this.playerViews = stage12HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(spawn.x, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot)
        .setData('heroId', this.partyRuntime?.members[index]?.heroId)
        .setOrigin(0.5, 1)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff)
        .setDepth(20),
    );

    this.add.text(18, 16, `Stage 1-2 · ${this.playerCount}P · P1 A/D/J/W · P2 ←/→/小键盘1/↑ · Esc 设置`, {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '15px',
      backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.gameplay = createStage12Gameplay(
      this,
      this.playerCount,
      this.playerViews,
      this.world.transferDoor,
      this.world.fbEnter,
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage12, this);
  }

  public update(_time: number, delta: number): void {
    const result = this.gameplay?.update(delta);
    if (!result || !this.gameplay || this.resultOverlay) return;
    if (result === 'fb-entered') {
      this.scene.start('Stage51TransitionScene');
      return;
    }
    this.resultOverlay = showStage12Result(
      this,
      result,
      createFormalPartyRetryData(this.partyRuntime),
      this.gameplay.flow.unlockProgress,
    );
  }

  private shutdownStage12(): void {
    this.world?.destroy();
    this.world = undefined;
    this.gameplay?.destroy();
    this.gameplay = undefined;
    this.resultOverlay?.destroy(true);
    this.resultOverlay = undefined;
    for (const playerView of this.playerViews) playerView.destroy();
    this.playerViews = [];
  }
}
