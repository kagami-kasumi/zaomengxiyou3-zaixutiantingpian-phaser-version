import Phaser from 'phaser';
import { settingsUiAssets } from '../../assets/AssetManifest';
import {
  cycleGlobalSetting,
  getGlobalSettings,
  loadGlobalSettings,
  type GlobalSettingsStorage,
} from '../../systems/GlobalSettingsSystem';

type SettingField = 'difficulty' | 'bgmEnabled' | 'skillSoundEnabled' | 'frameRate';

type ValueRow = Readonly<{
  label: string;
  labelX: number;
  labelWidth: number;
  field?: SettingField;
  x: number;
  y: number;
  value: () => string;
  message: () => string;
}>;

const ValueRows: readonly ValueRow[] = [
  {
    label: '游戏难度：',
    labelX: 364.85,
    labelWidth: 139.6,
    field: 'difficulty',
    x: 501.4,
    y: 192.8,
    value: () => ['普 通', '困 难', '地 狱'][getGlobalSettings().difficulty]!,
    message: () => '关卡难度已改变',
  },
  {
    label: '背景音效：',
    labelX: 384.05,
    labelWidth: 129,
    field: 'bgmEnabled',
    x: 501.4,
    y: 237.9,
    value: () => getGlobalSettings().bgmEnabled ? '开 启' : '关 闭',
    message: () => getGlobalSettings().bgmEnabled ? '已开启背景音乐' : '已关闭背景音乐',
  },
  {
    label: '技能音效：',
    labelX: 352.85,
    labelWidth: 123.3,
    field: 'skillSoundEnabled',
    x: 501.4,
    y: 286.1,
    value: () => getGlobalSettings().skillSoundEnabled ? '开 启' : '关 闭',
    message: () => getGlobalSettings().skillSoundEnabled ? '已开启技能音效' : '已关闭技能音效',
  },
  {
    label: '画面质量：',
    labelX: 352.85,
    labelWidth: 123.3,
    field: 'frameRate',
    x: 501.4,
    y: 334.9,
    value: () => getGlobalSettings().frameRate === 30
      ? '  高'
      : getGlobalSettings().frameRate === 24 ? '  中' : '  低',
    message: () => `画质设置为：${getGlobalSettings().frameRate === 30 ? '高' : getGlobalSettings().frameRate === 24 ? '中' : '低'}`,
  },
  {
    label: '默认音量：',
    labelX: 352.55,
    labelWidth: 123.3,
    x: 500.4,
    y: 383.65,
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
    const container = this.scene.add.container(0, 0).setDepth(200);
    this.container = container;
    container.add(this.scene.add.zone(0, 0, 940, 590).setOrigin(0).setInteractive());
    container.add(this.scene.add.image(0, 0, settingsUiAssets.root.key).setOrigin(0));

    for (const row of ValueRows) {
      container.add(this.scene.add.text(row.labelX, row.y + 4, row.label, {
        color: '#ffffff',
        fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
        fontSize: '22px',
        align: 'center',
        fixedWidth: row.labelWidth,
      }).setOrigin(0));
      const text = this.scene.add.text(row.x + 2, row.y + 2, row.value(), {
        color: '#ffffff',
        fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
        fontSize: '25px',
        fixedWidth: 102,
      }).setOrigin(0).setInteractive(
        new Phaser.Geom.Rectangle(-2, -2, 104, 34.1),
        Phaser.Geom.Rectangle.Contains,
      );
      text.setData('settings-field', row.field ?? 'defaultVol');
      text.on('pointerover', () => text.setColor('#ffff00'));
      text.on('pointerout', () => text.setColor('#ffffff'));
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

    const close = this.scene.add.image(590, 131.95, settingsUiAssets.close.up.key)
      .setOrigin(0)
      .setInteractive(new Phaser.Geom.Rectangle(0, 2, 40, 40), Phaser.Geom.Rectangle.Contains);
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
