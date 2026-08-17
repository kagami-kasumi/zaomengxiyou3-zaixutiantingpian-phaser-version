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
import {
  assertVerifiedTaskPageTruth,
  getTaskRewardTruthBounds,
  getTaskTileTruthBounds,
  getTaskTruthBounds,
  getTaskTruthHitArea,
  getTaskTruthTextStyle,
  TaskTruthObjectIds,
  type TaskTruthBounds,
} from './task/FormalTaskPageTruth';

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
    assertVerifiedTaskPageTruth();
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

    layer.add(this.createTab('daily', TaskTruthObjectIds.dailyTab, taskUiAssets.daily));
    layer.add(this.createTab('activity', TaskTruthObjectIds.activityTab, taskUiAssets.activity));
    layer.add(this.createNativeButton(TaskTruthObjectIds.close, taskUiAssets.buttons.close, this.returnToMap.bind(this)));
    layer.add(this.createNativeButton(TaskTruthObjectIds.previous, taskUiAssets.buttons.prev, () => {
      changeFormalTaskPage(this.model!, -1);
      this.render();
    }));
    layer.add(this.createNativeButton(TaskTruthObjectIds.next, taskUiAssets.buttons.next, () => {
      changeFormalTaskPage(this.model!, 1);
      this.render();
    }));
    layer.add(this.text(
      getTaskTruthBounds(TaskTruthObjectIds.pageText),
      `${this.model.page}/${getFormalTaskPageCount(this.model)}`,
      TaskTruthObjectIds.pageText,
      'center',
    ));

    const visible = getFormalTaskVisibleDefinitions(this.model);
    visible.forEach((definition, row) => {
      const state = this.model!.tasks.daily[definition.id - 1]!;
      const selected = this.model!.selectedRow === row;
      const tileBounds = getTaskTileTruthBounds(row);
      const tile = this.add.image(tileBounds.left, tileBounds.top, selected
        ? taskUiAssets.tile.selected.key
        : taskUiAssets.tile.normal.key)
        .setOrigin(0).setDisplaySize(tileBounds.width, tileBounds.height)
        .setInteractive({ useHandCursor: true });
      tile.setData('task-id', definition.id);
      tile.on('pointerdown', () => {
        selectFormalTaskRow(this.model!, row);
        this.render();
      });
      layer.add(tile);
      layer.add(this.text(getTaskTileTruthBounds(row, 'name'), definition.name, `${TaskTruthObjectIds.rows[row]}.rwnametxt`));
      if (state.hasClaimed) {
        const receivedBounds = getTaskTileTruthBounds(row, 'received');
        layer.add(this.add.image(receivedBounds.left, receivedBounds.top, taskUiAssets.received.key).setOrigin(0)
          .setDisplaySize(receivedBounds.width, receivedBounds.height));
      }
    });

    const selected = getSelectedFormalTask(this.model);
    if (selected) {
      layer.add(this.text(
        getTaskTruthBounds(TaskTruthObjectIds.description),
        selected.definition.description,
        TaskTruthObjectIds.description,
      ));
      layer.add(this.text(
        getTaskTruthBounds(TaskTruthObjectIds.progress),
        getTaskProgressText(selected.definition, selected.state),
        TaskTruthObjectIds.progress,
      ));
      selected.definition.rewards.forEach((reward, index) => {
        if (index < TaskTruthObjectIds.rewards.length) this.renderReward(layer, reward, index);
      });
    }
    const canClaim = selected?.state.isComplete === true && !selected.state.hasClaimed;
    const claimBounds = getTaskTruthBounds(TaskTruthObjectIds.claim);
    const claim = this.add.image(
      claimBounds.left,
      claimBounds.top,
      canClaim ? taskUiAssets.claim.enabled.key : taskUiAssets.claim.disabled.key,
    ).setOrigin(0).setDisplaySize(claimBounds.width, claimBounds.height)
      .setInteractive({ useHandCursor: canClaim });
    claim.setData('task-claim-enabled', canClaim);
    claim.on('pointerdown', () => {
      if (claimSelectedFormalTask(this.model!, this.storage!)) this.render();
    });
    layer.add(claim);
  }

  private createTab(
    tab: 'daily' | 'activity',
    truthId: string,
    assets: typeof taskUiAssets.daily,
  ): Phaser.GameObjects.Image {
    const bounds = getTaskTruthBounds(truthId);
    const image = this.add.image(
      bounds.left,
      bounds.top,
      this.model!.tab === tab ? assets.selected.key : assets.normal.key,
    ).setOrigin(0).setDisplaySize(bounds.width, bounds.height)
      .setInteractive({ useHandCursor: true });
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
    rewardIndex: number,
  ): void {
    const bounds = getTaskRewardTruthBounds(rewardIndex);
    layer.add(this.add.image(bounds.left, bounds.top, taskUiAssets.awardCell.key).setOrigin(0)
      .setDisplaySize(bounds.width, bounds.height));
    const inventoryAsset = reward.type === 'dj' || reward.type === 'zzs'
      ? getInventoryItemAsset(reward.value)
      : undefined;
    const key = inventoryAsset?.key ?? (
      reward.type === 'exp' ? taskUiAssets.rewards.exp.key
        : reward.type === 'lh' ? taskUiAssets.rewards.soul.key
          : reward.type === 'roomhorse' ? taskUiAssets.rewards.horse.key
            : taskUiAssets.rewards.stone.key
    );
    const iconBounds = getTaskRewardTruthBounds(rewardIndex, 'icon');
    layer.add(this.add.image(iconBounds.left, iconBounds.top, key).setOrigin(0)
      .setDisplaySize(iconBounds.width, iconBounds.height));
    const nameBounds = getTaskRewardTruthBounds(rewardIndex, 'name');
    layer.add(this.text(nameBounds, reward.label, `${TaskTruthObjectIds.rewards[rewardIndex]}.txtname`));
  }

  private createNativeButton(
    truthId: string,
    assets: NativeButtonAssets,
    action: () => void,
  ): Phaser.GameObjects.Image {
    const bounds = getTaskTruthBounds(truthId);
    const hitArea = getTaskTruthHitArea(truthId);
    const image = this.add.image(bounds.left, bounds.top, assets.up.key).setOrigin(0)
      .setDisplaySize(bounds.width, bounds.height)
      .setInteractive(new Phaser.Geom.Rectangle(
        hitArea.left - bounds.left,
        hitArea.top - bounds.top,
        hitArea.width,
        hitArea.height,
      ), Phaser.Geom.Rectangle.Contains);
    image.input!.cursor = 'pointer';
    image.on('pointerover', () => image.setTexture(assets.over.key));
    image.on('pointerout', () => image.setTexture(assets.up.key));
    image.on('pointerdown', () => image.setTexture(assets.down.key));
    image.on('pointerup', action);
    return image;
  }

  private text(
    bounds: TaskTruthBounds,
    value: string,
    truthId: string,
    align?: 'left' | 'center',
  ): Phaser.GameObjects.Text {
    const style = getTaskTruthTextStyle(truthId);
    return this.add.text(bounds.left, bounds.top, value, {
      color: style.color,
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      fixedWidth: bounds.width,
      align,
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
