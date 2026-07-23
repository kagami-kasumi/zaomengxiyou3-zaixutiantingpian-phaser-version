import Phaser from 'phaser';
import { installFormalFeatureUiEntries } from './feature-ui/FormalFeatureUiEntryBridge';
import { AssetKeys } from '../assets/AssetManifest';
import {
  normalizeStage21PlayerCount,
  readStage21QaOptions,
  type Stage21PlayerCount,
} from '../systems/Stage21EntrySystem';
import {
  stage21HeroSpawns,
  STAGE21_WORLD_HEIGHT,
  STAGE21_WORLD_LEFT,
  STAGE21_WORLD_WIDTH,
} from '../systems/Stage21Layout';
import {
  createStage21Gameplay,
  type Stage21GameplayHandle,
} from './stage21/Stage21GameplayBridge';
import { showStage21Result } from './stage21/Stage21ResultBridge';
import { createStage21World, type Stage21WorldHandle } from './stage21/Stage21WorldBridge';

export class Stage21Scene extends Phaser.Scene {
  private playerCount: Stage21PlayerCount = 1;
  private world?: Stage21WorldHandle;
  private gameplay?: Stage21GameplayHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];
  private resultOverlay?: Phaser.GameObjects.Container;

  public constructor() {
    super('Stage21Scene');
  }

  public init(data?: { playerCount?: 1 | 2 }): void {
    this.playerCount = normalizeStage21PlayerCount(data?.playerCount);
  }

  public create(): void {
    this.shutdownStage21();
    const qa = readStage21QaOptions(window.location.search, import.meta.env.DEV);
    installFormalFeatureUiEntries(this, { originKind: 'combat', playerCount: this.playerCount });
    this.cameras.main.setBounds(STAGE21_WORLD_LEFT, 0, STAGE21_WORLD_WIDTH, STAGE21_WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;
    this.world = createStage21World(this);
    this.playerViews = stage21HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(spawn.x, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot).setOrigin(0.5, 1)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff).setDepth(20),
    );
    const qaLabel = qa.fastClear || qa.noDamage
      ? ` · DEV QA${qa.noDamage ? ' 无伤' : ''}${qa.fastClear ? ' 自动清怪' : ''}${qa.showcase ? ' 展示' : ''}${qa.holdEnemyType ? ` 保留 M${qa.holdEnemyType}` : ''}${qa.forcedEnemyState ? ` 强制${qa.forcedEnemyState}` : ''}`
      : '';
    this.add.text(18, 16, `Stage 2-1 · ${this.playerCount}P${qaLabel} · P1 A/D/J/K · P2 ←/→/小键盘1/小键盘2 · Esc 返回`, {
      color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '15px',
      backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(100);
    this.gameplay = createStage21Gameplay(
      this,
      this.playerCount,
      this.playerViews,
      this.world.transferDoor,
      this.world.iceViews,
      qa,
    );
    this.input.keyboard?.on('keydown-ESC', this.returnToMap, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage21, this);
  }

  public update(_time: number, delta: number): void {
    const result = this.gameplay?.update(delta);
    if (!result || !this.gameplay || this.resultOverlay) return;
    this.resultOverlay = showStage21Result(
      this,
      result,
      this.playerCount,
      this.gameplay.flow.unlockProgress,
    );
  }

  private returnToMap(): void {
    this.scene.start('HeavenMapScene');
  }

  private shutdownStage21(): void {
    this.input.keyboard?.off('keydown-ESC', this.returnToMap, this);
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
