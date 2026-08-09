import Phaser from 'phaser';
import {
  getSceneAssetBundleId,
  sceneAssetBundles,
  type AssetBundleId,
  type BundleAssetDefinition,
} from '../assets/SceneAssetBundles';
import {
  AssetBundleCoordinator,
  type AssetBundleLoadAdapter,
  type AssetBundleLoadStatus,
} from '../systems/AssetBundleCoordinator';

export type BundleLoadFeedback = (
  status: Exclude<AssetBundleLoadStatus, 'idle'>,
  bundleId: AssetBundleId,
  error?: unknown,
) => void;

const coordinator = new AssetBundleCoordinator();
const sceneLoadQueues = new WeakMap<Phaser.Scene, Promise<void>>();
const pendingTransitions = new WeakMap<Phaser.Scene, Set<string>>();

export function queueSceneAssetBundleForPreload(
  scene: Phaser.Scene,
  bundleId: AssetBundleId,
): void {
  const queued = new Set<string>();
  const visit = (id: AssetBundleId): void => {
    const bundle = sceneAssetBundles[id];
    for (const dependency of bundle.dependencies) visit(dependency);
    for (const asset of bundle.assets) {
      if (queued.has(asset.key) || hasPhaserAsset(scene, asset)) continue;
      queued.add(asset.key);
      queuePhaserAsset(scene, asset);
    }
  };
  visit(bundleId);
}

export async function ensureSceneAssetBundle(
  scene: Phaser.Scene,
  bundleId: AssetBundleId,
  feedback?: BundleLoadFeedback,
): Promise<void> {
  feedback?.('loading', bundleId);
  try {
    await coordinator.ensure(bundleId, createPhaserAdapter(scene));
    feedback?.('loaded', bundleId);
  } catch (error) {
    feedback?.('failed', bundleId, error);
    throw error;
  }
}

export async function ensureSceneAssets(
  scene: Phaser.Scene,
  requestId: string,
  assets: readonly BundleAssetDefinition[],
): Promise<void> {
  const missing = assets.filter((asset) => !hasPhaserAsset(scene, asset));
  if (missing.length === 0) return;
  await enqueueSceneLoad(scene, requestId, missing);
}

export async function startSceneWithBundle(
  scene: Phaser.Scene,
  targetSceneKey: string,
  data?: object,
  feedback?: BundleLoadFeedback,
  additionalBundleIds: readonly AssetBundleId[] = [],
): Promise<boolean> {
  return transitionWithBundle(scene, targetSceneKey, feedback, additionalBundleIds, () => {
    scene.scene.start(targetSceneKey, data);
  });
}

export async function launchSceneWithBundle(
  scene: Phaser.Scene,
  targetSceneKey: string,
  data?: object,
  feedback?: BundleLoadFeedback,
  additionalBundleIds: readonly AssetBundleId[] = [],
): Promise<boolean> {
  return transitionWithBundle(scene, targetSceneKey, feedback, additionalBundleIds, () => {
    scene.scene.launch(targetSceneKey, data);
  });
}

async function transitionWithBundle(
  scene: Phaser.Scene,
  targetSceneKey: string,
  feedback: BundleLoadFeedback | undefined,
  additionalBundleIds: readonly AssetBundleId[],
  transition: () => void,
): Promise<boolean> {
  let transitions = pendingTransitions.get(scene);
  if (!transitions) {
    transitions = new Set<string>();
    pendingTransitions.set(scene, transitions);
  }
  if (transitions.has(targetSceneKey)) return false;
  transitions.add(targetSceneKey);
  try {
    const bundleId = getSceneAssetBundleId(targetSceneKey);
    if (bundleId) await ensureSceneAssetBundle(scene, bundleId, feedback);
    for (const additionalBundleId of additionalBundleIds) {
      await ensureSceneAssetBundle(scene, additionalBundleId, feedback);
    }
    if (!scene.scene.isActive(scene.scene.key)) return false;
    transition();
    return true;
  } catch (error) {
    console.error(`Unable to load assets for ${targetSceneKey}.`, error);
    return false;
  } finally {
    transitions.delete(targetSceneKey);
  }
}

function createPhaserAdapter(scene: Phaser.Scene): AssetBundleLoadAdapter {
  return {
    has: (asset) => hasPhaserAsset(scene, asset),
    load: (bundleId, assets) => enqueueSceneLoad(scene, bundleId, assets),
  };
}

function enqueueSceneLoad(
  scene: Phaser.Scene,
  bundleId: string,
  assets: readonly BundleAssetDefinition[],
): Promise<void> {
  const previous = sceneLoadQueues.get(scene) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(() => loadPhaserAssets(scene, bundleId, assets));
  sceneLoadQueues.set(scene, next);
  const clearQueue = (): void => {
    if (sceneLoadQueues.get(scene) === next) sceneLoadQueues.delete(scene);
  };
  void next.then(clearQueue, clearQueue);
  return next;
}

function loadPhaserAssets(
  scene: Phaser.Scene,
  bundleId: string,
  assets: readonly BundleAssetDefinition[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const failedKeys = new Set<string>();
    let settled = false;
    const cleanup = (): void => {
      scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
      scene.load.off(Phaser.Loader.Events.COMPLETE, onComplete);
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    };
    const settle = (error?: Error): void => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve();
    };
    const onLoadError = (file: Phaser.Loader.File): void => {
      failedKeys.add(file.key);
    };
    const onComplete = (): void => {
      if (failedKeys.size > 0) {
        settle(new Error(
          `Asset bundle "${bundleId}" failed to load: ${[...failedKeys].join(', ')}`,
        ));
        return;
      }
      settle();
    };
    const onShutdown = (): void => {
      settle(new Error(`Scene "${scene.scene.key}" shut down while loading "${bundleId}".`));
    };

    scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
    scene.load.once(Phaser.Loader.Events.COMPLETE, onComplete);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    for (const asset of assets) queuePhaserAsset(scene, asset);
    scene.load.start();
  });
}

function hasPhaserAsset(scene: Phaser.Scene, asset: BundleAssetDefinition): boolean {
  return asset.kind === 'text'
    ? scene.cache.text.exists(asset.key)
    : scene.textures.exists(asset.key);
}

function queuePhaserAsset(scene: Phaser.Scene, asset: BundleAssetDefinition): void {
  switch (asset.kind) {
    case 'image':
      scene.load.image(asset.key, asset.path);
      break;
    case 'svg':
      scene.load.svg(asset.key, asset.path);
      break;
    case 'spritesheet':
      scene.load.spritesheet(asset.key, asset.path, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      });
      break;
    case 'text':
      scene.load.text(asset.key, asset.path);
      break;
  }
}
