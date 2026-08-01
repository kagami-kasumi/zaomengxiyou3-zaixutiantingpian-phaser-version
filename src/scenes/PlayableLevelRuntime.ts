import Phaser from 'phaser';
import { AssetKeys } from '../assets/AssetManifest';
import type { LevelUnlockProgress } from '../systems/LevelLifecycleSystem';
import {
  createFormalPartyRetryData,
  type FormalPartyRuntime,
} from '../systems/FormalPartyRuntimeSystem';
import {
  validatePlayableLevelDefinition,
  type PlayableLevelDefinition,
} from '../systems/PlayableLevelDefinition';
import { installFormalFeatureUiEntries } from './feature-ui/FormalFeatureUiEntryBridge';
import { createLevelResultStats, markLevelResultStarted, showLevelResult } from './LevelResultView';
import { startSceneWithBundle } from './SceneAssetBundleBridge';
import type { TransferDoorView } from './TransferDoorView';

export type PlayableLevelWorldAdapter = Readonly<{
  transferDoor: TransferDoorView;
  destroy: () => void;
}>;

export type PlayableLevelEncounterResult = 'failed' | 'cleared' | string;

export type PlayableLevelEncounter = Readonly<{
  update: (deltaMs: number) => PlayableLevelEncounterResult | undefined;
  destroy: () => void;
  unlockProgress: () => LevelUnlockProgress;
}>;

export type PlayableLevelRuntime = Readonly<{
  create: () => void;
  update: (deltaMs: number) => void;
  destroy: () => void;
}>;

type RuntimeFactories<W extends PlayableLevelWorldAdapter> = Readonly<{
  createWorld: (scene: Phaser.Scene) => W;
  createEncounter: (
    scene: Phaser.Scene,
    playerCount: 1 | 2,
    playerViews: readonly Phaser.GameObjects.Image[],
    world: W,
  ) => PlayableLevelEncounter;
  title?: (playerCount: 1 | 2) => string;
  handleSpecialResult?: (result: string) => boolean;
}>;

export function createPlayableLevelRuntime<W extends PlayableLevelWorldAdapter>(
  scene: Phaser.Scene,
  partyRuntime: FormalPartyRuntime,
  definition: PlayableLevelDefinition,
  factories: RuntimeFactories<W>,
): PlayableLevelRuntime {
  validatePlayableLevelDefinition(definition);
  const playerCount = partyRuntime.playerCount;
  let world: W | undefined;
  let encounter: PlayableLevelEncounter | undefined;
  let playerViews: Phaser.GameObjects.Image[] = [];
  let resultOverlay: Phaser.GameObjects.Container | undefined;
  let title: Phaser.GameObjects.Text | undefined;
  let destroyed = false;

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    encounter?.destroy();
    encounter = undefined;
    world?.destroy();
    world = undefined;
    resultOverlay?.destroy(true);
    resultOverlay = undefined;
    title?.destroy();
    title = undefined;
    for (const view of playerViews) view.destroy();
    playerViews = [];
  };

  return {
    create: () => {
      installFormalFeatureUiEntries(scene, { originKind: 'combat', party: partyRuntime.party });
      markLevelResultStarted(scene);
      const bounds = definition.worldBounds;
      scene.cameras.main.setBounds(bounds.left, bounds.top, bounds.width, bounds.height);
      scene.cameras.main.scrollX = bounds.left < 0 ? 0 : bounds.left;
      world = factories.createWorld(scene);
      playerViews = definition.heroSpawns.slice(0, playerCount).map((spawn, index) =>
        scene.add.image(spawn.x, spawn.y, AssetKeys.playerPlaceholder)
          .setName(spawn.slot)
          .setData('heroId', partyRuntime.members[index]?.heroId)
          .setOrigin(0.5, 1)
          .setTint(index === 0 ? 0xffffff : 0x7ad7ff)
          .setDepth(20),
      );
      const titleText = factories.title?.(playerCount);
      if (titleText) {
        title = scene.add.text(18, 16, titleText, {
          color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '15px',
          backgroundColor: '#101724cc', padding: { x: 8, y: 5 },
        }).setScrollFactor(0).setDepth(100);
      }
      encounter = factories.createEncounter(scene, playerCount, playerViews, world);
    },
    update: (deltaMs) => {
      if (!encounter || resultOverlay) return;
      const result = encounter.update(deltaMs);
      if (!result) return;
      if (result !== 'failed' && result !== 'cleared') {
        if (factories.handleSpecialResult?.(result)) return;
        throw new Error(`Unhandled result ${result} from ${definition.id}.`);
      }
      const retryData = createFormalPartyRetryData(partyRuntime);
      resultOverlay = showLevelResult(scene, {
        result,
        stats: createLevelResultStats(scene),
        unlockProgress: encounter.unlockProgress(),
        onRetry: () => scene.scene.restart(retryData),
        onNext: () => void startSceneWithBundle(scene, definition.routes.next, retryData),
        onBack: () => void startSceneWithBundle(scene, definition.routes.back),
      });
    },
    destroy,
  };
}
