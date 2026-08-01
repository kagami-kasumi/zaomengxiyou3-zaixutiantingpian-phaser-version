import Phaser from 'phaser';
import {
  isStage22LocalQaHost,
  readStage22DevOptions,
  readStage22QaOptions,
} from '../systems/Stage22EntrySystem';
import { createFormalDevParty } from '../systems/FormalPartyRuntimeSystem';
import {
  queueSceneAssetBundleForPreload,
  startSceneWithBundle,
  type BundleLoadFeedback,
} from './SceneAssetBundleBridge';

export class BootScene extends Phaser.Scene {
  private loadingText?: Phaser.GameObjects.Text;
  private loadingTrack?: Phaser.GameObjects.Rectangle;
  private loadingBar?: Phaser.GameObjects.Rectangle;

  public constructor() {
    super('BootScene');
  }

  public preload(): void {
    this.loadingText = this.add.text(470, 284, '资源载入中 0%', {
      color: '#f3d27a',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5);
    this.loadingTrack = this.add.rectangle(470, 320, 300, 8, 0x273247);
    this.loadingBar = this.add.rectangle(320, 320, 0, 8, 0xf3d27a).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      this.loadingText?.setText(`资源载入中 ${Math.round(progress * 100)}%`);
      if (this.loadingBar) this.loadingBar.width = 300 * progress;
    });
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.loadingText?.setText('资源载入完成');
      this.loadingTrack?.setVisible(false);
      this.loadingBar?.setVisible(false);
    });

    queueSceneAssetBundleForPreload(this, 'shell');
  }

  public create(): void {
    void this.routeFromBoot();
  }

  private async routeFromBoot(): Promise<void> {
    const allowLocalQa = import.meta.env.DEV || isStage22LocalQaHost(window.location.hostname);
    const params = new URLSearchParams(window.location.search);
    if (allowLocalQa && params.get('qaStage') === '1-1-role1') {
      const twoPlayers = params.get('players') === '2';
      await this.startQaScene('TestScene', {
        devParty: twoPlayers
          ? createFormalDevParty(2, 2, 1)
          : createFormalDevParty(1, 1),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '2-1') {
      await this.startQaScene('Stage21Scene', {
        devParty: createFormalDevParty(params.get('players') === '2' ? 2 : 1),
      });
      return;
    }
    const stage22Dev = readStage22DevOptions(
      window.location.search,
      allowLocalQa,
    );
    if (stage22Dev.enabled) {
      await this.startQaScene('Stage22DevScene', stage22Dev);
      return;
    }
    const stage22Qa = readStage22QaOptions(
      window.location.search,
      allowLocalQa,
    );
    if (stage22Qa.bossState) {
      await this.startQaScene('Stage22Scene', {
        devParty: createFormalDevParty(
          new URLSearchParams(window.location.search).get('players') === '2' ? 2 : 1,
        ),
      });
      return;
    }
    this.scene.start('SaveSlotScene');
  }

  private async startQaScene(targetSceneKey: string, data: object): Promise<void> {
    const feedback: BundleLoadFeedback = (status, bundleId) => {
      if (status === 'loading') this.loadingText?.setText(`正在载入 ${bundleId}…`);
      if (status === 'failed') this.loadingText?.setText('目标场景资源载入失败，点击重试');
    };
    const started = await startSceneWithBundle(this, targetSceneKey, data, feedback);
    if (!started && this.scene.isActive()) {
      this.input.once('pointerdown', () => void this.startQaScene(targetSceneKey, data));
    }
  }
}
