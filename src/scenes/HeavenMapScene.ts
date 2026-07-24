import Phaser from 'phaser';
import { heavenMapAssets } from '../assets/AssetManifest';
import {
  createHeavenMapSnapshot,
  findHeavenMapNode,
  resolveHeavenMapRuntimeProgress,
  type HeavenMapNodeId,
  type HeavenMapNodeSnapshot,
} from '../systems/HeavenMapSystem';
import { getActiveSaveSlotId, loadActiveGame } from '../systems/SaveSlotSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import type { PartyConfiguration } from '../systems/PartyConfigurationSystem';
import {
  installFormalFeatureUiEntries,
  launchFormalFeatureUi,
} from './feature-ui/FormalFeatureUiEntryBridge';
import { startSceneWithBundle } from './SceneAssetBundleBridge';

const STATUS_COLORS = {
  locked: 0x6c7480,
  current: 0xffd04a,
  completed: 0x5ee08a,
  unavailable: 0xffa552,
} as const;

export class HeavenMapScene extends Phaser.Scene {
  private storage?: SaveStorage;
  private nodes: readonly HeavenMapNodeSnapshot[] = [];
  private feedbackText?: Phaser.GameObjects.Text;
  private party?: PartyConfiguration;

  public constructor() {
    super('HeavenMapScene');
  }

  public create(): void {
    this.storage = getBrowserStorage();
    const save = this.storage ? loadActiveGame(this.storage) : undefined;
    if (!save) {
      this.scene.start('SaveSlotScene');
      return;
    }
    this.party = save.party;

    const runtimeProgress = resolveHeavenMapRuntimeProgress(
      save.levelUnlockProgress,
      window.location.search,
      import.meta.env.DEV,
    );
    this.nodes = createHeavenMapSnapshot(runtimeProgress);
    installFormalFeatureUiEntries(this, { originKind: 'map', party: save.party });
    this.cameras.main.setBackgroundColor('#0b1526');
    this.add.image(0, 0, heavenMapAssets.world.key).setOrigin(0).setDepth(0);
    this.add.image(-1, 0, heavenMapAssets.menu.key).setOrigin(0).setDepth(20);

    for (const node of this.nodes) this.createNodeInteraction(node);
    this.createMenuInteractions();

    const slotId = this.storage ? getActiveSaveSlotId(this.storage) : undefined;
    this.add.text(926, 14, slotId === undefined ? '未选择存档' : `存档 ${slotId + 1}`, {
      color: '#fff3bf', fontFamily: 'Arial, sans-serif', fontSize: '14px',
      backgroundColor: '#101724cc', padding: { x: 7, y: 4 },
    }).setOrigin(1, 0).setDepth(80);
    const qaStage = runtimeProgress.unlockedStage === 2 && save.levelUnlockProgress.unlockedStage !== 2
      ? ' · DEV QA 2-1'
      : '';
    this.feedbackText = this.add.text(470, 24, `选择已解锁的天庭节点${qaStage}`, {
      color: '#fff3bf', fontFamily: 'Arial, sans-serif', fontSize: '16px',
      backgroundColor: '#101724dd', padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0).setDepth(80);

    this.input.keyboard?.on('keydown-ONE', () => this.activateNode('1-1'));
    this.input.keyboard?.on('keydown-TWO', () => this.activateNode('1-2'));
    this.input.keyboard?.on('keydown-THREE', () => this.activateNode('1-3'));
    this.input.keyboard?.on('keydown-FOUR', () => this.activateNode('2-1'));
    this.input.keyboard?.on('keydown-FIVE', () => this.activateNode('2-2'));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('SaveSlotScene'));
  }

  private createNodeInteraction(node: HeavenMapNodeSnapshot): void {
    const { x, y, width, height } = node.hitArea;
    const color = STATUS_COLORS[node.status];
    const zone = this.add.rectangle(x, y, width, height, color, node.status === 'locked' ? 0.05 : 0.08)
      .setOrigin(0)
      .setStrokeStyle(2, color, node.status === 'locked' ? 0.5 : 0.9)
      .setDepth(35);
    if (node.status !== 'locked') zone.setInteractive({ useHandCursor: true });

    const badgeCopy = node.status === 'completed'
      ? '已通关'
      : node.status === 'current'
        ? '当前'
        : node.status === 'unavailable'
          ? '已解锁 · 待复现'
          : '锁定';
    this.add.text(x + width / 2, y + 3, badgeCopy, {
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold',
      backgroundColor: '#07101ccc', padding: { x: 5, y: 2 },
    }).setOrigin(0.5, 0).setDepth(36);

    if (node.status === 'locked') return;
    zone.on('pointerover', () => {
      zone.setFillStyle(color, 0.2).setStrokeStyle(3, color, 1);
      this.feedbackText?.setText(`${node.id} · ${node.title}${node.status === 'unavailable' ? ' · 内容尚未接入' : ''}`);
    });
    zone.on('pointerout', () => {
      zone.setFillStyle(color, 0.08).setStrokeStyle(2, color, 0.9);
      this.feedbackText?.setText('选择已解锁的天庭节点');
    });
    zone.on('pointerdown', () => this.activateNode(node.id));
  }

  private createMenuInteractions(): void {
    const saveZone = this.add.zone(0, 508, 62, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(60);
    saveZone.on('pointerdown', () => this.feedbackText?.setText('当前关卡进度已自动写回所选存档'));
    const workshopZone = this.add.zone(132, 508, 66, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(60);
    workshopZone.on('pointerdown', () => void launchFormalFeatureUi(
      this,
      'workshop',
      'p1',
      { originKind: 'map', party: this.party! },
      (status) => this.showBundleStatus(status, '功能页面'),
    ));
    const skillsZone = this.add.zone(198, 508, 66, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(60);
    skillsZone.on('pointerdown', () => void launchFormalFeatureUi(
      this,
      'skills',
      'p1',
      { originKind: 'map', party: this.party! },
      (status) => this.showBundleStatus(status, '技能页面'),
    ));
    const backZone = this.add.zone(397, 508, 66, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(60);
    backZone.on('pointerdown', () => this.scene.start('SaveSlotScene'));
  }

  private activateNode(nodeId: HeavenMapNodeId): void {
    const node = findHeavenMapNode(this.nodes, nodeId);
    if (!node) return;
    if (node.status === 'locked') {
      this.feedbackText?.setText(`${node.id} 尚未解锁`);
      return;
    }
    if (node.status === 'unavailable' || !node.routeKey) {
      this.feedbackText?.setText(`${node.id} · ${node.title} 已解锁，关卡内容尚未复现`);
      return;
    }
    void this.startNode(node);
  }

  private async startNode(node: HeavenMapNodeSnapshot): Promise<void> {
    if (!node.routeKey) return;
    await startSceneWithBundle(this, node.routeKey, undefined, (status) => {
      this.showBundleStatus(status, node.title);
    });
  }

  private showBundleStatus(
    status: 'loading' | 'loaded' | 'failed',
    targetLabel: string,
  ): void {
    if (status === 'loading') this.feedbackText?.setText(`正在载入${targetLabel}…`);
    if (status === 'failed') this.feedbackText?.setText(`${targetLabel}载入失败，请再次点击重试`);
  }
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
