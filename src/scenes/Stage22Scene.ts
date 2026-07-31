import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import {
  isStage22LocalQaHost,
  readStage22QaOptions,
} from '../systems/Stage22EntrySystem';
import {
  createFormalPartyRetryData,
  type FormalPartyRuntime,
  type FormalPartySceneData,
} from '../systems/FormalPartyRuntimeSystem';
import {
  stage22HeroSpawns,
  stage22TransferDoor,
  STAGE22_WORLD_HEIGHT,
  STAGE22_WORLD_LEFT,
  STAGE22_WORLD_WIDTH,
} from '../systems/Stage22Layout';
import { installFormalFeatureUiEntries } from './feature-ui/FormalFeatureUiEntryBridge';
import {
  createStage22Gameplay,
  type Stage22GameplayHandle,
} from './stage22/Stage22GameplayBridge';
import {
  createLevelResultStats,
  markLevelResultStarted,
  showLevelResult,
} from './LevelResultView';
import { startSceneWithBundle } from './SceneAssetBundleBridge';
import { createStage22World, type Stage22WorldHandle } from './stage22/Stage22WorldBridge';
import { resolveFormalPartyScene } from './formal-party/FormalPartySceneBridge';

export class Stage22Scene extends Phaser.Scene {
  private partyRuntime?: FormalPartyRuntime;
  private playerCount: 1 | 2 = 1;
  private world?: Stage22WorldHandle;
  private gameplay?: Stage22GameplayHandle;
  private playerViews: Phaser.GameObjects.Image[] = [];
  private resultOverlay?: Phaser.GameObjects.Container;

  public constructor() {
    super('Stage22Scene');
  }

  public init(data?: FormalPartySceneData): void {
    const allowDevOverride = import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname);
    this.partyRuntime = resolveFormalPartyScene(data, allowDevOverride);
    this.playerCount = this.partyRuntime?.playerCount ?? 1;
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
    installFormalFeatureUiEntries(this, { originKind: 'combat', party: this.partyRuntime.party });
    markLevelResultStarted(this);
    this.cameras.main.setBounds(STAGE22_WORLD_LEFT, 0, STAGE22_WORLD_WIDTH, STAGE22_WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;
    this.world = createStage22World(this);
    this.playerViews = stage22HeroSpawns.slice(0, this.playerCount).map((spawn, index) =>
      this.add.image(qa.bossState === 'door' ? stage22TransferDoor.x : spawn.x, spawn.y, AssetKeys.playerPlaceholder)
        .setName(spawn.slot).setData('heroId', this.partyRuntime?.members[index]?.heroId).setOrigin(0.5, 1)
        .setTint(index === 0 ? 0xffffff : 0x7ad7ff).setDepth(20),
    );
    this.gameplay = createStage22Gameplay(
      this,
      this.playerCount,
      this.playerViews,
      this.world.transferDoor,
      this.world.fireViews,
      this.world.updateFireViews,
      qa,
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownStage22, this);
  }

  public update(_time: number, delta: number): void {
    if (this.resultOverlay || !this.gameplay) return;
    const result = this.gameplay.update(delta);
    if (!result) return;
    const retryData = createFormalPartyRetryData(this.partyRuntime);
    this.resultOverlay = showLevelResult(this, {
      result,
      stats: createLevelResultStats(this),
      unlockProgress: this.gameplay.flow.unlockProgress,
      onRetry: () => this.scene.restart(retryData),
      onNext: () => void startSceneWithBundle(this, 'HeavenMapScene'),
      onBack: () => void startSceneWithBundle(this, 'HeavenMapScene'),
    });
  }

  private shutdownStage22(): void {
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
