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
import {
  installFormalFeatureUiEntries,
  launchFormalFeatureUi,
} from './feature-ui/FormalFeatureUiEntryBridge';

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
  private chooser?: Phaser.GameObjects.Container;

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

    const runtimeProgress = resolveHeavenMapRuntimeProgress(
      save.levelUnlockProgress,
      window.location.search,
      import.meta.env.DEV,
    );
    this.nodes = createHeavenMapSnapshot(runtimeProgress);
    // The map manages both persisted local-player owners even before a stage party size is chosen.
    installFormalFeatureUiEntries(this, { originKind: 'map', playerCount: 2 });
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
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.chooser) this.closeChooser();
      else this.scene.start('SaveSlotScene');
    });
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
    workshopZone.on('pointerdown', () => launchFormalFeatureUi(
      this, 'workshop', 'p1', { originKind: 'map', playerCount: 2 },
    ));
    const skillsZone = this.add.zone(198, 508, 66, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(60);
    skillsZone.on('pointerdown', () => launchFormalFeatureUi(
      this, 'skills', 'p1', { originKind: 'map', playerCount: 2 },
    ));
    const backZone = this.add.zone(397, 508, 66, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(60);
    backZone.on('pointerdown', () => this.scene.start('SaveSlotScene'));
  }

  private activateNode(nodeId: HeavenMapNodeId): void {
    if (this.chooser) return;
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
    this.openPlayerCountChooser(node);
  }

  private openPlayerCountChooser(node: HeavenMapNodeSnapshot): void {
    const blocker = this.add.rectangle(470, 295, 940, 590, 0x000000, 0.58).setInteractive();
    const panel = this.add.rectangle(470, 296, 390, 190, 0x111a27, 0.98).setStrokeStyle(2, 0xf2c14e);
    const title = this.add.text(470, 235, `${node.id} · ${node.title}`, {
      color: '#fff3bf', fontFamily: 'Arial, sans-serif', fontSize: '23px', fontStyle: 'bold',
    }).setOrigin(0.5);
    const single = createChoiceButton(this, 385, 305, '1P', () => this.startNode(node, 1));
    const double = createChoiceButton(this, 555, 305, '2P', () => this.startNode(node, 2));
    const cancel = createChoiceButton(this, 470, 366, '取消', () => this.closeChooser(), 150);
    this.chooser = this.add.container(0, 0, [blocker, panel, title, ...single, ...double, ...cancel]).setDepth(200);
  }

  private startNode(node: HeavenMapNodeSnapshot, playerCount: 1 | 2): void {
    if (!node.routeKey) return;
    this.scene.start(node.routeKey, { playerCount });
  }

  private closeChooser(): void {
    this.chooser?.destroy(true);
    this.chooser = undefined;
  }
}

function createChoiceButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  width = 130,
): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] {
  const background = scene.add.rectangle(x, y, width, 46, 0x263950)
    .setStrokeStyle(2, 0xf2c14e).setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '18px',
  }).setOrigin(0.5);
  background.on('pointerover', () => background.setFillStyle(0x38536f));
  background.on('pointerout', () => background.setFillStyle(0x263950));
  background.on('pointerdown', onClick);
  return [background, text];
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
