import Phaser from 'phaser';
import { installFormalFeatureUiEntries } from './feature-ui/FormalFeatureUiEntryBridge';
import { AssetKeys } from '../assets/AssetManifest';
import { normalizeStage13PlayerCount, type Stage13PlayerCount } from '../systems/Stage13EntrySystem';
import {
  stage13HeroSpawns,
  STAGE13_WORLD_HEIGHT,
  STAGE13_WORLD_LEFT,
  STAGE13_WORLD_WIDTH,
} from '../systems/Stage13Layout';
import { createStage13Gameplay, type Stage13GameplayHandle } from './stage13/Stage13GameplayBridge';
import { showStage13Result } from './stage13/Stage13ResultBridge';
import { createStage13World, type Stage13WorldHandle } from './stage13/Stage13WorldBridge';

export class Stage13Scene extends Phaser.Scene {
  private playerCount: Stage13PlayerCount = 1;
  private world?: Stage13WorldHandle;
  private gameplay?: Stage13GameplayHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];
  private resultOverlay?: Phaser.GameObjects.Container;

  public constructor() {
    super('Stage13Scene');
  }

  public init(data?: { playerCount?: 1 | 2 }): void {
    this.playerCount = normalizeStage13PlayerCount(data?.playerCount);
  }

  public create(): void {
    this.shutdownStage13();
    installFormalFeatureUiEntries(this, { originKind: 'combat', playerCount: this.playerCount });
    this.cameras.main.setBounds(STAGE13_WORLD_LEFT, 0, STAGE13_WORLD_WIDTH, STAGE13_WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;
    this.world = createStage13World(this);
    this.playerViews = stage13HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(spawn.x, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot).setOrigin(0.5, 1)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff).setDepth(20),
    );
    this.add.text(18, 16, `Stage 1-3 · ${this.playerCount}P · P1 A/D/J/K · P2 ←/→/小键盘1/小键盘2 · Esc 返回`, {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '15px',
      backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(100);
    this.gameplay = createStage13Gameplay(
      this,
      this.playerCount,
      this.playerViews,
      this.world.transferDoor,
    );
    this.input.keyboard?.on('keydown-ESC', this.returnToEntry, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage13, this);
  }

  public update(_time: number, delta: number): void {
    const result = this.gameplay?.update(delta);
    if (!result || !this.gameplay || this.resultOverlay) return;
    this.resultOverlay = showStage13Result(
      this,
      result,
      this.playerCount,
      this.gameplay.flow.unlockProgress,
    );
  }

  private returnToEntry(): void {
    this.scene.start('HeavenMapScene');
  }

  private shutdownStage13(): void {
    this.input.keyboard?.off('keydown-ESC', this.returnToEntry, this);
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
