import type Phaser from 'phaser';
import {
  getFeatureUiAssetBundleId,
  type BundleAssetDefinition,
} from '../../assets/SceneAssetBundles';
import { getPartyHeroId } from '../../systems/PartyConfigurationSystem';
import { getEquipmentPreviewAssetsForItems } from '../../systems/EquipmentPreviewSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import type { FeatureUiOwner, FeatureUiPage } from '../../systems/FeatureUiHostSystem';
import { ensureSceneAssetBundle, ensureSceneAssets } from '../SceneAssetBundleBridge';

export async function ensureFeatureUiPageAssets(
  scene: Phaser.Scene,
  page: FeatureUiPage,
  owner: FeatureUiOwner,
  storage?: SaveStorage,
): Promise<boolean> {
  const activeSave = storage ? loadActiveGame(storage) : undefined;
  const heroId = activeSave ? getPartyHeroId(activeSave.party, owner) : undefined;
  const fontReady = page === 'skills' && typeof document !== 'undefined'
    ? document.fonts.load('16px "FZCuYuan-M03"')
    : Promise.resolve([]);
  const player = activeSave ? (owner === 'p1' ? activeSave.player1 : activeSave.player2) : undefined;
  const equippedFillNames = player
    ? Object.values(player.equipment).flatMap((entry) => entry ? [entry.fillName] : [])
    : [];
  const previewAssets: readonly BundleAssetDefinition[] = page === 'backpack' && heroId
    ? getEquipmentPreviewAssetsForItems(heroId, equippedFillNames).map((asset) => asset.kind === 'spritesheet'
      ? {
        kind: 'spritesheet', key: asset.key, path: asset.path,
        frameWidth: asset.frameWidth!, frameHeight: asset.frameHeight!,
      }
      : { kind: 'image', key: asset.key, path: asset.path })
    : [];
  await Promise.all([
    ensureSceneAssetBundle(scene, getFeatureUiAssetBundleId(page, heroId)),
    ensureSceneAssets(scene, `equipment-preview-${owner}`, previewAssets),
    fontReady,
  ]);
  return scene.scene.isActive();
}
