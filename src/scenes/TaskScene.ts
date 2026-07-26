import Phaser from 'phaser';
import { heavenMapAssets, taskUiAssets } from '../assets/AssetManifest';
import { getInventoryItemAsset } from '../assets/InventoryItemAssets';
import {
  changeFormalTaskPage,
  claimSelectedFormalTask,
  createFormalTaskPage,
  getFormalTaskPageCount,
  getFormalTaskVisibleDefinitions,
  getSelectedFormalTask,
  selectFormalTaskRow,
  setFormalTaskTab,
  type FormalTaskPageModel,
} from '../systems/FormalTaskPageSystem';
import { getTaskProgressText, type TaskReward } from '../systems/PartyTaskSystem';
import type { SaveStorage } from '../systems/SaveSystem';

const TileY = [182.35, 228.35, 273.35, 320.35, 365.95] as const;
const AwardPositions = [
  [431.45, 268.35], [560.95, 268.35], [431.45, 324.35], [561, 325.35],
] as const;

type NativeButtonAssets = Readonly<{
  up: Readonly<{ key: string }>;
  over: Readonly<{ key: string }>;
  down: Readonly<{ key: string }>;
}>;

export class TaskScene extends Phaser.Scene {
  private storage?: SaveStorage;
  private model?: FormalTaskPageModel;
  private dynamicLayer?: Phaser.GameObjects.Container;

  public constructor() {
    super('TaskScene');
  }

  public create(): void {
    this.storage = getBrowserStorage();
    this.model = this.storage ? createFormalTaskPage(this.storage) : undefined;
    if (!this.model || !this.storage) {
      this.scene.start('HeavenMapScene');
      return;
    }
    this.cameras.main.setBackgroundColor('#000000');
    // 原版 TaskInterface 叠加在 MapMenu host 上；独立场景仍重建同一底层显示列表。
    this.add.image(0, 0, heavenMapAssets.world.key).setOrigin(0);
    this.add.image(-1, 0, heavenMapAssets.menu.key).setOrigin(0);
    this.add.image(0, 0, taskUiAssets.root.key).setOrigin(0);
    this.render();
    this.input.keyboard?.on('keydown-ESC', this.returnToMap, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ESC', this.returnToMap, this);
    });
  }

  private render(): void {
    if (!this.model || !this.storage) return;
    this.dynamicLayer?.destroy(true);
    const layer = this.add.container(0, 0).setDepth(20);
    this.dynamicLayer = layer;

    layer.add(this.createTab('daily', 182.3, taskUiAssets.daily));
    layer.add(this.createTab('activity', 289.3, taskUiAssets.activity));
    layer.add(this.createNativeButton(690.95, 79.45, taskUiAssets.buttons.close, this.returnToMap.bind(this)));
    layer.add(this.createNativeButton(187.45, 414.8, taskUiAssets.buttons.prev, () => {
      changeFormalTaskPage(this.model!, -1);
      this.render();
    }));
    layer.add(this.createNativeButton(307.45, 414.8, taskUiAssets.buttons.next, () => {
      changeFormalTaskPage(this.model!, 1);
      this.render();
    }));
    layer.add(this.text(272, 421.5, `${this.model.page}/${getFormalTaskPageCount(this.model)}`, 15, 40));

    const visible = getFormalTaskVisibleDefinitions(this.model);
    visible.forEach((definition, row) => {
      const y = TileY[row]!;
      const state = this.model!.tasks.daily[definition.id - 1]!;
      const selected = this.model!.selectedRow === row;
      const tile = this.add.image(186, y, selected
        ? taskUiAssets.tile.selected.key
        : taskUiAssets.tile.normal.key)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      tile.setData('task-id', definition.id);
      tile.on('pointerdown', () => {
        selectFormalTaskRow(this.model!, row);
        this.render();
      });
      layer.add(tile);
      layer.add(this.text(221, y + 6.5, definition.name, 22, 161));
      if (state.hasClaimed) {
        layer.add(this.add.image(336.5, y, taskUiAssets.received.key).setOrigin(0));
      }
    });

    const selected = getSelectedFormalTask(this.model);
    if (selected) {
      layer.add(this.text(442, 158, selected.definition.description, 15, 244));
      layer.add(this.text(442, 193.8, getTaskProgressText(selected.definition, selected.state), 15, 243));
      selected.definition.rewards.forEach((reward, index) => {
        const position = AwardPositions[index];
        if (position) this.renderReward(layer, reward, position[0], position[1]);
      });
    }
    const canClaim = selected?.state.isComplete === true && !selected.state.hasClaimed;
    const claim = this.add.image(
      492.45,
      397.8,
      canClaim ? taskUiAssets.claim.enabled.key : taskUiAssets.claim.disabled.key,
    ).setOrigin(0).setInteractive({ useHandCursor: canClaim });
    claim.setData('task-claim-enabled', canClaim);
    claim.on('pointerdown', () => {
      if (claimSelectedFormalTask(this.model!, this.storage!)) this.render();
    });
    layer.add(claim);
    if (this.model.message) {
      layer.add(this.add.text(442, 455, this.model.message, {
        color: '#fff3bf', fontFamily: 'FZCuYuan-M03', fontSize: '15px',
        stroke: '#000000', strokeThickness: 3, fixedWidth: 250, align: 'center',
      }).setOrigin(0));
    }
  }

  private createTab(
    tab: 'daily' | 'activity',
    x: number,
    assets: typeof taskUiAssets.daily,
  ): Phaser.GameObjects.Image {
    const image = this.add.image(
      x,
      138,
      this.model!.tab === tab ? assets.selected.key : assets.normal.key,
    ).setOrigin(0).setInteractive({ useHandCursor: true });
    image.setData('task-tab', tab);
    image.on('pointerdown', () => {
      setFormalTaskTab(this.model!, tab);
      this.render();
    });
    return image;
  }

  private renderReward(
    layer: Phaser.GameObjects.Container,
    reward: TaskReward,
    x: number,
    y: number,
  ): void {
    layer.add(this.add.image(x, y, taskUiAssets.awardCell.key).setOrigin(0));
    const inventoryAsset = reward.type === 'dj' || reward.type === 'zzs'
      ? getInventoryItemAsset(reward.value)
      : undefined;
    const key = inventoryAsset?.key ?? (
      reward.type === 'exp' ? taskUiAssets.rewards.exp.key
        : reward.type === 'lh' ? taskUiAssets.rewards.soul.key
          : reward.type === 'roomhorse' ? taskUiAssets.rewards.horse.key
            : taskUiAssets.rewards.stone.key
    );
    layer.add(this.add.image(x + 3.5, y + 3.5, key).setOrigin(0).setDisplaySize(50, 50));
    layer.add(this.text(x + 57, y + 14.75, reward.label, 12, 70));
  }

  private createNativeButton(
    x: number,
    y: number,
    assets: NativeButtonAssets,
    action: () => void,
  ): Phaser.GameObjects.Image {
    const image = this.add.image(x, y, assets.up.key).setOrigin(0).setInteractive({ useHandCursor: true });
    image.on('pointerover', () => image.setTexture(assets.over.key));
    image.on('pointerout', () => image.setTexture(assets.up.key));
    image.on('pointerdown', () => image.setTexture(assets.down.key));
    image.on('pointerup', action);
    return image;
  }

  private text(x: number, y: number, value: string, fontSize: number, width: number) {
    return this.add.text(x, y, value, {
      color: '#ffffff',
      fontFamily: 'FZCuYuan-M03',
      fontSize: `${fontSize}px`,
      fixedWidth: width,
    }).setOrigin(0);
  }

  private returnToMap(): void {
    this.scene.start('HeavenMapScene');
  }
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
