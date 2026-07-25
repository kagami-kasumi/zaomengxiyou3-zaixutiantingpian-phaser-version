import type Phaser from 'phaser';
import { getFeatureUiAssetBundleId } from '../../assets/SceneAssetBundles';
import { getPartyHeroId } from '../../systems/PartyConfigurationSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import type { FeatureUiOwner, FeatureUiPage } from '../../systems/FeatureUiHostSystem';
import { ensureSceneAssetBundle } from '../SceneAssetBundleBridge';

export async function ensureFeatureUiPageAssets(
  scene: Phaser.Scene,
  page: FeatureUiPage,
  owner: FeatureUiOwner,
  storage?: SaveStorage,
): Promise<boolean> {
  const activeSave = storage ? loadActiveGame(storage) : undefined;
  const heroId = activeSave ? getPartyHeroId(activeSave.party, owner) : undefined;
  try {
    const fontReady = page === 'skills' && typeof document !== 'undefined'
      ? document.fonts.load('16px "FZCuYuan-M03"')
      : Promise.resolve([]);
    await Promise.all([
      ensureSceneAssetBundle(scene, getFeatureUiAssetBundleId(page, heroId)),
      fontReady,
    ]);
    return scene.scene.isActive();
  } catch {
    return false;
  }
}
