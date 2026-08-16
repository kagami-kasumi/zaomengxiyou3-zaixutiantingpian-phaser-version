import Phaser from 'phaser';
import { settingsUiAssets } from '../../assets/AssetManifest';
import {
  cycleGlobalSetting,
  getGlobalSettings,
  loadGlobalSettings,
  type GlobalSettingsStorage,
} from '../../systems/GlobalSettingsSystem';
import {
  assertVerifiedSettingsPageTruth,
  getSettingsTruthBounds,
  getSettingsTruthLocalOffset,
  getSettingsTruthTextStyle,
  SettingsTruthObjectIds,
} from './FormalSettingsPageTruth';

type SettingField = 'difficulty' | 'bgmEnabled' | 'skillSoundEnabled' | 'frameRate';

type ValueRow = Readonly<{
  label: string;
  truth: Readonly<{ label: string; value: string; text: string }>;
  field?: SettingField;
  value: () => string;
  message: () => string;
}>;

const ValueRows: readonly ValueRow[] = [
  {
    label: '游戏难度：',
    truth: SettingsTruthObjectIds.rows.difficulty,
    field: 'difficulty',
    value: () => ['普 通', '困 难', '地 狱'][getGlobalSettings().difficulty]!,
    message: () => '关卡难度已改变',
  },
  {
    label: '背景音效：',
    truth: SettingsTruthObjectIds.rows.bgmEnabled,
    field: 'bgmEnabled',
    value: () => getGlobalSettings().bgmEnabled ? '开 启' : '关 闭',
    message: () => getGlobalSettings().bgmEnabled ? '已开启背景音乐' : '已关闭背景音乐',
  },
  {
    label: '技能音效：',
    truth: SettingsTruthObjectIds.rows.skillSoundEnabled,
    field: 'skillSoundEnabled',
    value: () => getGlobalSettings().skillSoundEnabled ? '开 启' : '关 闭',
    message: () => getGlobalSettings().skillSoundEnabled ? '已开启技能音效' : '已关闭技能音效',
  },
  {
    label: '画面质量：',
    truth: SettingsTruthObjectIds.rows.frameRate,
    field: 'frameRate',
    value: () => getGlobalSettings().frameRate === 30
      ? '  高'
      : getGlobalSettings().frameRate === 24 ? '  中' : '  低',
    message: () => `画质设置为：${getGlobalSettings().frameRate === 30 ? '高' : getGlobalSettings().frameRate === 24 ? '中' : '低'}`,
  },
  {
    label: '默认音量：',
    truth: SettingsTruthObjectIds.rows.defaultVol,
    value: () => '示 例',
    message: () => '开启游戏时默认 示例 音量',
  },
];

export class FormalSettingsOverlay {
  private container?: Phaser.GameObjects.Container;
  private toast?: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly storage?: GlobalSettingsStorage,
  ) {
    loadGlobalSettings(storage);
    this.applyRuntimeSettings();
  }

  public get isOpen(): boolean {
    return this.container !== undefined;
  }

  public open(): void {
    if (this.container) return;
    assertVerifiedSettingsPageTruth();
    const rootBounds = getSettingsTruthBounds(SettingsTruthObjectIds.root);
    const overlayHitBounds = getSettingsTruthBounds(SettingsTruthObjectIds.overlayHit);
    const container = this.scene.add.container(0, 0).setDepth(200);
    this.container = container;
    container.add(this.scene.add.zone(
      overlayHitBounds.left,
      overlayHitBounds.top,
      overlayHitBounds.width,
      overlayHitBounds.height,
    ).setOrigin(0).setInteractive());
    container.add(this.scene.add.image(
      rootBounds.left,
      rootBounds.top,
      settingsUiAssets.root.key,
    ).setOrigin(0));

    for (const row of ValueRows) {
      const labelBounds = getSettingsTruthBounds(row.truth.label);
      const labelStyle = getSettingsTruthTextStyle(row.truth.label);
      const valueBounds = getSettingsTruthBounds(row.truth.value);
      const textOffset = getSettingsTruthLocalOffset(row.truth.text);
      const valueStyle = getSettingsTruthTextStyle(row.truth.text);
      container.add(this.scene.add.text(labelBounds.left, labelBounds.top, row.label, {
        color: labelStyle.color,
        fontFamily: `${labelStyle.fontFamily}, Arial, sans-serif`,
        fontSize: `${labelStyle.fontSize}px`,
        align: 'center',
        fixedWidth: labelBounds.width,
      }).setOrigin(0));
      const text = this.scene.add.text(
        valueBounds.left + textOffset.x,
        valueBounds.top + textOffset.y,
        row.value(), {
          color: valueStyle.color,
          fontFamily: `${valueStyle.fontFamily}, Arial, sans-serif`,
          fontSize: `${valueStyle.fontSize}px`,
          fixedWidth: valueBounds.width - textOffset.x,
        },
      ).setOrigin(0).setInteractive(
        new Phaser.Geom.Rectangle(
          -textOffset.x,
          -textOffset.y,
          valueBounds.width,
          valueBounds.height,
        ),
        Phaser.Geom.Rectangle.Contains,
      );
      text.setData('settings-field', row.field ?? 'defaultVol');
      text.on('pointerover', () => text.setColor(valueStyle.hoverColor ?? valueStyle.color));
      text.on('pointerout', () => text.setColor(valueStyle.color));
      text.on('pointerup', () => {
        if (row.field) {
          cycleGlobalSetting(row.field, this.storage);
          this.applyRuntimeSettings();
          text.setText(row.value());
        }
        this.showToast(row.message());
      });
      container.add(text);
    }

    const closeBounds = getSettingsTruthBounds(SettingsTruthObjectIds.close);
    const closeHitSize = closeBounds.width;
    const close = this.scene.add.image(
      closeBounds.left,
      closeBounds.top,
      settingsUiAssets.close.up.key,
    )
      .setOrigin(0)
      .setInteractive(new Phaser.Geom.Rectangle(
        0,
        closeBounds.height - closeHitSize,
        closeHitSize,
        closeHitSize,
      ), Phaser.Geom.Rectangle.Contains);
    close.setData('settings-close', true);
    close.on('pointerover', () => close.setTexture(settingsUiAssets.close.over.key));
    close.on('pointerout', () => close.setTexture(settingsUiAssets.close.up.key));
    close.on('pointerdown', () => close.setTexture(settingsUiAssets.close.down.key));
    close.on('pointerup', () => this.close());
    container.add(close);
    this.applyRuntimeSettings();
  }

  public close(): void {
    this.toastTimer?.remove(false);
    this.toastTimer = undefined;
    this.toast = undefined;
    this.container?.destroy(true);
    this.container = undefined;
  }

  public destroy(): void {
    this.close();
  }

  private applyRuntimeSettings(): void {
    this.scene.game.loop.targetFps = getGlobalSettings().frameRate;
    this.scene.game.loop.resetDelta();
  }

  private showToast(message: string): void {
    if (!this.container) return;
    this.toastTimer?.remove(false);
    this.toast?.destroy();
    this.toast = this.scene.add.text(0, 470, message, {
      color: '#000000',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      align: 'center',
      fixedWidth: 940,
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setDepth(201);
    this.container.add(this.toast);
    this.toastTimer = this.scene.time.delayedCall(1_000, () => {
      this.toast?.destroy();
      this.toast = undefined;
    });
  }
}
