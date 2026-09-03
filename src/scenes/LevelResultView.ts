import Phaser from 'phaser';
import {
  LevelResultAssetKeys,
} from '../assets/AssetManifest';
import { saveActiveLevelUnlockProgress } from '../systems/SaveSlotSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import type { LevelUnlockProgress } from '../systems/LevelLifecycleSystem';

export type LevelResultKind = 'failed' | 'cleared';

export type LevelResultStats = Readonly<{
  elapsedMs: number;
  healthPercent: number;
  highestCombo: number;
  totalScore: number;
}>;

export type LevelResultViewOptions = Readonly<{
  result: LevelResultKind;
  stats?: Partial<LevelResultStats>;
  unlockProgress?: LevelUnlockProgress;
  onRetry: () => void;
  onNext?: () => void;
  onBack: () => void;
}>;

const LevelResultStartedAtDataKey = 'level-result-started-at';

export function markLevelResultStarted(scene: Phaser.Scene): void {
  scene.data.set(LevelResultStartedAtDataKey, scene.time.now);
}

export function createLevelResultStats(
  scene: Phaser.Scene,
  healthPercent = 100,
  highestCombo = 0,
): LevelResultStats {
  const startedAt = scene.data.get(LevelResultStartedAtDataKey);
  return {
    elapsedMs: typeof startedAt === 'number' ? Math.max(0, scene.time.now - startedAt) : 0,
    healthPercent: clampPercentage(healthPercent),
    highestCombo: Math.max(0, Math.floor(highestCombo)),
    totalScore: 0,
  };
}

export function showLevelResult(
  scene: Phaser.Scene,
  options: LevelResultViewOptions,
): Phaser.GameObjects.Container {
  const isClear = options.result === 'cleared';
  if (isClear && options.unlockProgress) persistUnlock(options.unlockProgress);

  const stats = normalizeStats(options.stats);
  const children: Phaser.GameObjects.GameObject[] = [
    scene.add.image(
      0,
      0,
      isClear ? LevelResultAssetKeys.win : LevelResultAssetKeys.fail,
    ).setOrigin(0).setScrollFactor(0),
  ];

  if (isClear) {
    children.push(...createScoreFields(scene, stats));
    children.push(createNativeResultButton(scene, {
      x: 120.55,
      y: 384.1,
      up: LevelResultAssetKeys.nextUp,
      over: LevelResultAssetKeys.nextOver,
      down: LevelResultAssetKeys.nextDown,
      onActivate: options.onNext ?? options.onBack,
    }));
    children.push(createNativeResultButton(scene, {
      x: 268.45,
      y: 386,
      up: LevelResultAssetKeys.backUp,
      over: LevelResultAssetKeys.backOver,
      down: LevelResultAssetKeys.backDown,
      onActivate: options.onBack,
    }));
  } else {
    children.push(createNativeResultButton(scene, {
      x: 305.95,
      y: 394,
      up: LevelResultAssetKeys.retryUp,
      over: LevelResultAssetKeys.retryOver,
      down: LevelResultAssetKeys.retryDown,
      onActivate: options.onRetry,
    }));
    children.push(createNativeResultButton(scene, {
      x: 470.95,
      y: 394,
      up: LevelResultAssetKeys.backUp,
      over: LevelResultAssetKeys.backOver,
      down: LevelResultAssetKeys.backDown,
      onActivate: options.onBack,
    }));
  }

  return scene.add.container(0, 0, children)
    .setScrollFactor(0)
    .setDepth(200);
}

export function formatLevelResultTime(elapsedMs: number): string {
  const safeSeconds = Math.floor(Math.max(0, elapsedMs) / 1_000);
  const hours = Math.floor(safeSeconds / 3_600);
  const minutes = Math.floor((safeSeconds % 3_600) / 60);
  const seconds = safeSeconds % 60;
  return `${hours}:${minutes}:${seconds}`;
}

function createScoreFields(
  scene: Phaser.Scene,
  stats: LevelResultStats,
): Phaser.GameObjects.Text[] {
  const values = [
    { y: 210.05, value: formatLevelResultTime(stats.elapsedMs) },
    { y: 270.05, value: `${stats.healthPercent}%` },
    { y: 334.1, value: `${stats.highestCombo}` },
    { y: 394.1, value: `${stats.totalScore}` },
  ];
  return values.map(({ y, value }) => scene.add.text(861.95, y, value, {
    color: '#ffffff',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '32px',
    align: 'right',
  }).setOrigin(1, 0).setScrollFactor(0));
}

function createNativeResultButton(
  scene: Phaser.Scene,
  config: Readonly<{
    x: number;
    y: number;
    up: string;
    over: string;
    down: string;
    onActivate: () => void;
  }>,
): Phaser.GameObjects.Image {
  let activated = false;
  const button = scene.add.image(config.x, config.y, config.up)
    .setOrigin(0)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  button.on('pointerover', () => {
    if (!activated) button.setTexture(config.over);
  });
  button.on('pointerout', () => {
    if (!activated) button.setTexture(config.up);
  });
  button.on('pointerdown', () => {
    if (!activated) button.setTexture(config.down);
  });
  button.on('pointerup', () => {
    if (activated) return;
    activated = true;
    button.disableInteractive();
    config.onActivate();
  });
  return button;
}

function normalizeStats(value: Partial<LevelResultStats> | undefined): LevelResultStats {
  return {
    elapsedMs: Math.max(0, value?.elapsedMs ?? 0),
    healthPercent: clampPercentage(value?.healthPercent ?? 100),
    highestCombo: Math.max(0, Math.floor(value?.highestCombo ?? 0)),
    totalScore: Math.max(0, Math.floor(value?.totalScore ?? 0)),
  };
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.floor(value)));
}

function persistUnlock(progress: LevelUnlockProgress): boolean {
  const storage = getBrowserStorage();
  return storage ? saveActiveLevelUnlockProgress(storage, progress) : false;
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
