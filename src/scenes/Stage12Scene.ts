import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import { normalizeStage12PlayerCount, type Stage12PlayerCount } from '../systems/Stage12EntrySystem';
import {
  stage12HeroSpawns,
  STAGE12_WORLD_HEIGHT,
  STAGE12_WORLD_LEFT,
  STAGE12_WORLD_WIDTH,
} from '../systems/Stage12Layout';
import { createStage12World, type Stage12WorldHandle } from './stage12/Stage12WorldBridge';

export class Stage12Scene extends Phaser.Scene {
  private playerCount: Stage12PlayerCount = 1;
  private world?: Stage12WorldHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  public constructor() {
    super('Stage12Scene');
  }

  public init(data?: { playerCount?: 1 | 2 }): void {
    this.playerCount = normalizeStage12PlayerCount(data?.playerCount);
  }

  public create(): void {
    this.shutdownStage12();
    this.cameras.main.setBounds(STAGE12_WORLD_LEFT, 0, STAGE12_WORLD_WIDTH, STAGE12_WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;
    this.world = createStage12World(this);
    this.playerViews = stage12HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(spawn.x, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff)
        .setDepth(20),
    );

    this.add.text(18, 16, `Stage 1-2 · ${this.playerCount}P · ←/→ 查看场景 · Esc 返回`, {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '15px',
      backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(100);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.input.keyboard?.on('keydown-ESC', this.returnToEntry, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage12, this);
  }

  public update(_time: number, delta: number): void {
    const direction = Number(this.cursors?.right.isDown) - Number(this.cursors?.left.isDown);
    if (direction !== 0) {
      this.cameras.main.scrollX += direction * delta * 0.45;
    }
  }

  private returnToEntry(): void {
    this.scene.start('Stage11EntryScene');
  }

  private shutdownStage12(): void {
    this.input.keyboard?.off('keydown-ESC', this.returnToEntry, this);
    this.world?.destroy();
    this.world = undefined;
    for (const playerView of this.playerViews) playerView.destroy();
    this.playerViews = [];
    this.cursors = undefined;
  }
}
