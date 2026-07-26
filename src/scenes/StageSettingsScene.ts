import Phaser from 'phaser';
import { stageSettingsAssets } from '../assets/AssetManifest';
import {
  closeStageHelp,
  createStageSettingsModel,
  cycleStageSpawnSpeed,
  isStageSoundEnabled,
  openStageHelp,
  showStageHelpFrame,
  toggleStageSound,
  type StageSettingsModel,
} from '../systems/StageSettingsSystem';
import type { GlobalSettingsStorage } from '../systems/GlobalSettingsSystem';

export const StageSpawnSpeedChangedEvent = 'stage-spawn-speed-changed';

export type StageSettingsSession = Readonly<{
  originSceneKey: string;
}>;

type NativeButtonStates = typeof stageSettingsAssets.buttons.close;

export class StageSettingsScene extends Phaser.Scene {
  private session?: StageSettingsSession;
  private model?: StageSettingsModel;
  private storage?: GlobalSettingsStorage;
  private layer?: Phaser.GameObjects.Container;
  private routedAway = false;

  public constructor() {
    super('StageSettingsScene');
  }

  public init(data: StageSettingsSession): void {
    this.session = data;
    this.routedAway = false;
  }

  public create(): void {
    if (!this.session || !this.scene.isPaused(this.session.originSceneKey)) {
      this.scene.stop();
      return;
    }
    this.storage = getBrowserStorage();
    this.model = createStageSettingsModel(this.storage);
    this.render();
    this.input.keyboard?.on('keydown-ESC', this.closeToOrigin, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
  }

  private render(): void {
    this.layer?.destroy(true);
    const layer = this.add.container(0, 0).setDepth(300);
    this.layer = layer;
    layer.add(this.add.zone(0, 0, 940, 590).setOrigin(0).setInteractive());
    if (!this.model || this.model.page === 'settings') {
      this.renderSettings(layer);
      return;
    }
    this.renderHelp(layer);
  }

  private renderSettings(layer: Phaser.GameObjects.Container): void {
    layer.add(this.add.image(0, 0, stageSettingsAssets.root.key).setOrigin(0));
    this.addNativeButton(layer, 597.95, 102.95, stageSettingsAssets.buttons.close, () => this.closeToOrigin());
    this.addNativeButton(layer, 415.05, 139.1, stageSettingsAssets.buttons.continue, () => this.closeToOrigin());
    this.addNativeButton(layer, 415.5, 221.95, stageSettingsAssets.buttons.map, () => this.routeAway('HeavenMapScene'));
    this.addNativeButton(layer, 415.35, 263.7, stageSettingsAssets.buttons.help, () => {
      if (!this.model) return;
      openStageHelp(this.model);
      this.render();
    });
    this.addNativeButton(layer, 402.6, 345.15, stageSettingsAssets.buttons.menu, () => this.routeAway('SaveSlotScene'));

    const soundStates = isStageSoundEnabled()
      ? stageSettingsAssets.buttons.soundClose
      : stageSettingsAssets.buttons.soundOpen;
    this.addNativeButton(layer, 414.85, 180.2, soundStates, () => {
      const enabled = toggleStageSound(this.storage);
      this.sound.mute = !enabled;
      this.render();
    });

    const speedIndex = this.model?.spawnSpeed === 2 ? 1 : this.model?.spawnSpeed === 4 ? 2 : 0;
    layer.add(this.add.image(
      521.1,
      303.9,
      stageSettingsAssets.spawnSpeedFrames[speedIndex]!.key,
    ).setOrigin(0));
    this.addNativeButton(layer, 402.6, 303.65, stageSettingsAssets.buttons.spawnSpeed, () => {
      if (!this.model || !this.session) return;
      const speed = cycleStageSpawnSpeed(this.model);
      this.scene.get(this.session.originSceneKey).events.emit(StageSpawnSpeedChangedEvent, speed);
      this.render();
    });
  }

  private renderHelp(layer: Phaser.GameObjects.Container): void {
    if (!this.model) return;
    const frameIndex = this.model.page === 'help-pet' ? 1 : 0;
    layer.add(this.add.image(0, 0, stageSettingsAssets.helpFrames[frameIndex]!.key).setOrigin(0));
    this.addNativeButton(layer, 104.1, 558.7, stageSettingsAssets.helpButtons.action, () => {
      showStageHelpFrame(this.model!, 'action');
      this.render();
    });
    this.addNativeButton(layer, 223.05, 558.95, stageSettingsAssets.helpButtons.pet, () => {
      showStageHelpFrame(this.model!, 'pet');
      this.render();
    });
    this.addNativeButton(layer, 848.7, 11.35, stageSettingsAssets.helpButtons.back, () => {
      closeStageHelp(this.model!);
      this.render();
    });
  }

  private addNativeButton(
    layer: Phaser.GameObjects.Container,
    x: number,
    y: number,
    states: NativeButtonStates,
    onClick: () => void,
  ): void {
    const button = this.add.image(x, y, states.up.key).setOrigin(0).setInteractive({
      useHandCursor: true,
      pixelPerfect: true,
      alphaTolerance: 1,
    });
    button.on('pointerover', () => button.setTexture(states.over.key));
    button.on('pointerout', () => button.setTexture(states.up.key));
    button.on('pointerdown', () => button.setTexture(states.down.key));
    button.on('pointerup', onClick);
    layer.add(button);
  }

  private closeToOrigin(): void {
    if (!this.session || this.routedAway) return;
    if (this.scene.isPaused(this.session.originSceneKey)) {
      this.scene.resume(this.session.originSceneKey);
    }
    this.scene.stop();
  }

  private routeAway(targetSceneKey: 'HeavenMapScene' | 'SaveSlotScene'): void {
    if (!this.session) return;
    this.routedAway = true;
    if (this.scene.isActive(this.session.originSceneKey) || this.scene.isPaused(this.session.originSceneKey)) {
      this.scene.stop(this.session.originSceneKey);
    }
    this.scene.start(targetSceneKey);
  }

  private onShutdown(): void {
    this.input.keyboard?.off('keydown-ESC', this.closeToOrigin, this);
    this.layer?.destroy(true);
    this.layer = undefined;
    this.model = undefined;
    this.session = undefined;
  }
}

function getBrowserStorage(): GlobalSettingsStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
