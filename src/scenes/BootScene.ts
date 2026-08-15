import Phaser from 'phaser';
import { getHeroCombatAssetBundleIds } from '../assets/SceneAssetBundles';
import {
  isStage22LocalQaHost,
  readStage22DevOptions,
  readStage22QaOptions,
} from '../systems/Stage22EntrySystem';
import {
  createFormalDevParty,
  createFormalPartyRuntime,
  type FormalPartySceneData,
} from '../systems/FormalPartyRuntimeSystem';
import {
  queueSceneAssetBundleForPreload,
  startSceneWithBundle,
  type BundleLoadFeedback,
} from './SceneAssetBundleBridge';
import { readEquipmentPageQaOptions } from '../systems/EquipmentPageQaFixtureSystem';

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
    const equipmentQa = readEquipmentPageQaOptions(window.location.search, allowLocalQa);
    if (equipmentQa) {
      const p1HeroId = equipmentQa.owner === 'p1' ? equipmentQa.roleId : 1;
      const p2HeroId = equipmentQa.owner === 'p2' ? equipmentQa.roleId : 2;
      await this.startQaScene('EquipmentPageQaScene', {
        options: equipmentQa,
        devParty: createFormalDevParty(2, p1HeroId, p2HeroId),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '1-1-role1') {
      const twoPlayers = params.get('players') === '2';
      await this.startQaScene('TestScene', {
        devParty: twoPlayers
          ? createFormalDevParty(2, 2, 1)
          : createFormalDevParty(1, 1),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '1-1-role2') {
      const twoPlayers = params.get('players') === '2';
      await this.startQaScene('TestScene', {
        devParty: twoPlayers
          ? createFormalDevParty(2, 1, 2)
          : createFormalDevParty(1, 2),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '1-1-role3') {
      const twoPlayers = params.get('players') === '2';
      await this.startQaScene('TestScene', {
        devParty: twoPlayers
          ? createFormalDevParty(2, 1, 3)
          : createFormalDevParty(1, 3),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '1-1-role4') {
      const twoPlayers = params.get('players') === '2';
      await this.startQaScene('TestScene', {
        devParty: twoPlayers
          ? createFormalDevParty(2, 1, 4)
          : createFormalDevParty(1, 4),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '1-1-role5') {
      const twoPlayers = params.get('players') === '2';
      await this.startQaScene('TestScene', {
        devParty: twoPlayers
          ? createFormalDevParty(2, 1, 5)
          : createFormalDevParty(1, 5),
      });
      return;
    }
    if (allowLocalQa && (params.get('qaStage') === '1-2' || params.get('qaStage') === '1-3')) {
      const playerCount = params.get('players') === '2' ? 2 : 1;
      const role1ShadowQa = params.get('qaRole1Shadow') === '1';
      await this.startQaScene(params.get('qaStage') === '1-2' ? 'Stage12Scene' : 'Stage13Scene', {
        devParty: role1ShadowQa && playerCount === 2
          ? createFormalDevParty(2, 2, 1)
          : createFormalDevParty(playerCount),
      });
      return;
    }
    if (allowLocalQa && params.get('qaStage') === '2-1') {
      const playerCount = params.get('players') === '2' ? 2 : 1;
      const role1ShadowQa = params.get('qaRole1Shadow') === '1';
      await this.startQaScene('Stage21Scene', {
        devParty: role1ShadowQa && playerCount === 2
          ? createFormalDevParty(2, 2, 1)
          : createFormalDevParty(playerCount),
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
    const devParty = (data as FormalPartySceneData).devParty;
    const heroBundles = devParty
      ? getHeroCombatAssetBundleIds(
        createFormalPartyRuntime(devParty, 'dev-override').members.map((member) => member.heroId),
      )
      : [];
    const started = await startSceneWithBundle(
      this,
      targetSceneKey,
      data,
      feedback,
      heroBundles,
    );
    if (!started && this.scene.isActive()) {
      this.input.once('pointerdown', () => void this.startQaScene(targetSceneKey, data));
    }
  }
}
