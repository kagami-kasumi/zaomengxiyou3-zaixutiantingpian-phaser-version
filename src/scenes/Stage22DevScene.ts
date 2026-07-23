import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import type { Stage22DevOptions } from '../systems/Stage22EntrySystem';
import {
  stage22HeroSpawns,
  STAGE22_WORLD_HEIGHT,
  STAGE22_WORLD_LEFT,
  STAGE22_WORLD_WIDTH,
} from '../systems/Stage22Layout';
import {
  createStage22DevGameplay,
  type Stage22DevGameplayHandle,
} from './stage22/Stage22DevGameplayBridge';
import {
  createStage22World,
  type Stage22WorldHandle,
} from './stage22/Stage22WorldBridge';

export class Stage22DevScene extends Phaser.Scene {
  private playerCount: 1 | 2 = 1;
  private spawnX = 100;
  private noDamage = false;
  private freezeFireFrame?: number;
  private world?: Stage22WorldHandle;
  private gameplay?: Stage22DevGameplayHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];

  public constructor() {
    super('Stage22DevScene');
  }

  public init(data?: Stage22DevOptions): void {
    this.playerCount = data?.playerCount === 2 ? 2 : 1;
    this.spawnX = data?.spawnX ?? 100;
    this.noDamage = data?.noDamage ?? false;
    this.freezeFireFrame = data?.freezeFireFrame;
  }

  public create(): void {
    this.shutdownStage22Dev();
    this.cameras.main.setBounds(
      STAGE22_WORLD_LEFT,
      0,
      STAGE22_WORLD_WIDTH,
      STAGE22_WORLD_HEIGHT,
    );
    this.cameras.main.scrollX = 0;
    this.world = createStage22World(this);
    this.playerViews = stage22HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(this.spawnX, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot)
        .setOrigin(0.5, 1)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff)
        .setDepth(20),
    );
    this.add.text(
      18,
      16,
      `Stage 2-2 · DEV layout/fire · ${this.playerCount}P`
        + ' · P1 A/D/K · P2 ←/→/小键盘2 · Esc 返回',
      {
        color: '#f3f6ff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        backgroundColor: '#101724cc',
        padding: { x: 8, y: 5 },
      },
    ).setScrollFactor(0).setDepth(100);
    this.gameplay = createStage22DevGameplay(
      this,
      this.playerViews,
      this.world.updateFireViews,
      this.noDamage,
      this.freezeFireFrame,
    );
    this.input.keyboard?.on('keydown-ESC', this.returnToStart, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage22Dev, this);
  }

  public update(_time: number, delta: number): void {
    this.gameplay?.update(delta);
  }

  private returnToStart(): void {
    this.scene.start('SaveSlotScene');
  }

  private shutdownStage22Dev(): void {
    this.input.keyboard?.off('keydown-ESC', this.returnToStart, this);
    this.gameplay?.destroy();
    this.gameplay = undefined;
    this.world?.destroy();
    this.world = undefined;
    for (const playerView of this.playerViews) playerView.destroy();
    this.playerViews = [];
  }
}
