import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import {
  isStage22LocalQaHost,
  normalizeStage22PlayerCount,
  readStage22QaOptions,
  type Stage22PlayerCount,
} from '../systems/Stage22EntrySystem';
import {
  stage22HeroSpawns,
  STAGE22_WORLD_HEIGHT,
  STAGE22_WORLD_LEFT,
  STAGE22_WORLD_WIDTH,
} from '../systems/Stage22Layout';
import { installFormalFeatureUiEntries } from './feature-ui/FormalFeatureUiEntryBridge';
import {
  createStage22Gameplay,
  type Stage22GameplayHandle,
} from './stage22/Stage22GameplayBridge';
import { showStage22Failure } from './stage22/Stage22ResultBridge';
import { createStage22World, type Stage22WorldHandle } from './stage22/Stage22WorldBridge';

export class Stage22Scene extends Phaser.Scene {
  private playerCount: Stage22PlayerCount = 1;
  private world?: Stage22WorldHandle;
  private gameplay?: Stage22GameplayHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];
  private resultOverlay?: Phaser.GameObjects.Container;

  public constructor() {
    super('Stage22Scene');
  }

  public init(data?: { playerCount?: 1 | 2 }): void {
    this.playerCount = normalizeStage22PlayerCount(data?.playerCount);
  }

  public create(): void {
    this.shutdownStage22();
    const qa = readStage22QaOptions(
      window.location.search,
      import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname),
    );
    installFormalFeatureUiEntries(this, { originKind: 'combat', playerCount: this.playerCount });
    this.cameras.main.setBounds(STAGE22_WORLD_LEFT, 0, STAGE22_WORLD_WIDTH, STAGE22_WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;
    this.world = createStage22World(this);
    this.playerViews = stage22HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(spawn.x, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot).setOrigin(0.5, 1)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff).setDepth(20),
    );
    this.gameplay = createStage22Gameplay(
      this,
      this.playerCount,
      this.playerViews,
      this.world.fireViews,
      this.world.updateFireViews,
      qa,
    );
    this.input.keyboard?.on('keydown-ESC', this.returnToMap, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage22, this);
  }

  public update(_time: number, delta: number): void {
    if (this.resultOverlay || this.gameplay?.update(delta) !== 'failed') return;
    this.resultOverlay = showStage22Failure(this, this.playerCount);
  }

  private returnToMap(): void {
    this.scene.start('HeavenMapScene');
  }

  private shutdownStage22(): void {
    this.input.keyboard?.off('keydown-ESC', this.returnToMap, this);
    this.gameplay?.destroy();
    this.gameplay = undefined;
    this.world?.destroy();
    this.world = undefined;
    this.resultOverlay?.destroy(true);
    this.resultOverlay = undefined;
    for (const view of this.playerViews) view.destroy();
    this.playerViews = [];
  }
}
