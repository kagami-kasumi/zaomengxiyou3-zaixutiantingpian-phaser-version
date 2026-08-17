import Phaser from 'phaser';
import { savePartyAssets } from '../../assets/AssetManifest';
import type { HeroId } from '../../systems/HeroNormalAttackSystem';
import {
  getDraftSelectedHero,
  type SaveProfileDraft,
} from '../../systems/SaveProfileDraftSystem';
import {
  assertVerifiedPartyCreationTruth,
  getPartyCreationMarkerBounds,
  getPartyCreationRoleObjectId,
  getPartyCreationRoleStateId,
  getPartyCreationTruthAssetRef,
  getPartyCreationTruthBounds,
  getPartyCreationTruthHitArea,
  PartyCreationTruthObjectIds,
  type PartyCreationTruthBounds,
} from './SavePartyCreationTruth';

type SavePartyCreationHandlers = {
  onSelectPlayerCount: (playerCount: 1 | 2) => void;
  onSelectHero: (heroId: HeroId) => void;
  onCancel: () => void;
};

export function createSavePartyCreationView(
  scene: Phaser.Scene,
  draft: SaveProfileDraft,
  handlers: SavePartyCreationHandlers,
): Phaser.GameObjects.Container {
  assertVerifiedPartyCreationTruth();
  const root = scene.add.container(0, 0).setDepth(80);
  if (draft.step === 'player-count') createPlayerCountView(scene, root, handlers);
  else if (draft.step === 'hero') createHeroSelectionView(scene, root, draft, handlers);
  return root;
}

function createPlayerCountView(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  handlers: SavePartyCreationHandlers,
): void {
  const background = scene.add.image(
    0,
    0,
    resolveSavePartyTextureKey(getPartyCreationTruthAssetRef(PartyCreationTruthObjectIds.numberRoot)),
  ).setOrigin(0);
  root.add(background);
  addNativeButtonHitArea(scene, root, background, {
    objectId: PartyCreationTruthObjectIds.numberOne,
    onActivate: () => handlers.onSelectPlayerCount(1),
  });
  addNativeButtonHitArea(scene, root, background, {
    objectId: PartyCreationTruthObjectIds.numberTwo,
    onActivate: () => handlers.onSelectPlayerCount(2),
  });
  addNativeButtonHitArea(scene, root, background, {
    objectId: PartyCreationTruthObjectIds.numberBack,
    onActivate: handlers.onCancel,
  });
}

function createHeroSelectionView(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  draft: Extract<SaveProfileDraft, { step: 'hero' }>,
  handlers: SavePartyCreationHandlers,
): void {
  root.add(scene.add.image(
    0,
    0,
    resolveSavePartyTextureKey(getPartyCreationTruthAssetRef(PartyCreationTruthObjectIds.roleRoot)),
  ).setOrigin(0));
  const selectedHero = getDraftSelectedHero(draft);
  if (selectedHero !== undefined) {
    root.add(createRoleStateImage(scene, selectedHero, 'down'));
  }

  for (let index = 0; index < 5; index += 1) {
    const heroId = (index + 1) as HeroId;
    if (selectedHero === heroId) continue;
    const bounds = getPartyCreationTruthHitArea(
      getPartyCreationRoleObjectId(heroId),
      'role-normal-p1',
    );
    const hitArea = createTransparentHitArea(scene, bounds);
    let stateView: Phaser.GameObjects.Container | undefined;
    const showState = (state: 'over' | 'down') => {
      stateView?.destroy(true);
      stateView = scene.add.container(0, 0);
      stateView.add(createRoleStateImage(scene, heroId, state));
      const markerKey = draft.currentOwner === 'p1'
        ? resolveSavePartyTextureKey(getPartyCreationTruthAssetRef(PartyCreationTruthObjectIds.ownerMarker))
        : resolveSavePartyTextureKey(getPartyCreationTruthAssetRef(PartyCreationTruthObjectIds.ownerMarker, 'over'));
      const markerBounds = getPartyCreationMarkerBounds(heroId);
      stateView.add(scene.add.image(
        markerBounds.left,
        markerBounds.top,
        markerKey,
      ).setOrigin(0));
      root.add(stateView);
      root.bringToTop(hitArea);
    };
    const clearState = () => {
      stateView?.destroy(true);
      stateView = undefined;
    };
    hitArea.on('pointerover', () => showState('over'));
    hitArea.on('pointerdown', () => showState('down'));
    hitArea.on('pointerout', clearState);
    hitArea.on('pointerupoutside', clearState);
    hitArea.on('pointerup', () => handlers.onSelectHero(heroId));
    root.add(hitArea);
  }
}

function createRoleStateImage(
  scene: Phaser.Scene,
  heroId: HeroId,
  state: 'over' | 'down',
): Phaser.GameObjects.Image {
  const objectId = getPartyCreationRoleObjectId(heroId);
  const stateId = getPartyCreationRoleStateId(heroId, state === 'over' ? 'hover' : 'pressed');
  const bounds = getPartyCreationTruthBounds(objectId, stateId);
  return scene.add.image(
    bounds.left,
    bounds.top,
    resolveSavePartyTextureKey(getPartyCreationTruthAssetRef(objectId, state)),
  ).setOrigin(0);
}

function addNativeButtonHitArea(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  background: Phaser.GameObjects.Image,
  config: {
    objectId: string;
    onActivate: () => void;
  },
): void {
  const bounds = getPartyCreationTruthHitArea(config.objectId, 'number-normal');
  const hitArea = createTransparentHitArea(scene, bounds);
  const reset = () => background.setTexture(resolveSavePartyTextureKey(
    getPartyCreationTruthAssetRef(PartyCreationTruthObjectIds.numberRoot),
  ));
  hitArea.on('pointerover', () => background.setTexture(resolveSavePartyTextureKey(
    getPartyCreationTruthAssetRef(config.objectId, 'over'),
  )));
  hitArea.on('pointerdown', () => background.setTexture(resolveSavePartyTextureKey(
    getPartyCreationTruthAssetRef(config.objectId, 'down'),
  )));
  hitArea.on('pointerout', reset);
  hitArea.on('pointerupoutside', reset);
  hitArea.on('pointerup', config.onActivate);
  root.add(hitArea);
}

function createTransparentHitArea(
  scene: Phaser.Scene,
  bounds: PartyCreationTruthBounds,
): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(
    bounds.left + bounds.width / 2,
    bounds.top + bounds.height / 2,
    bounds.width,
    bounds.height,
    0,
    0.001,
  ).setInteractive({ useHandCursor: true });
}

function resolveSavePartyTextureKey(assetRef: string): string {
  const publicPath = assetRef.startsWith('public/') ? `/${assetRef.slice('public/'.length)}` : assetRef;
  const asset = Object.values(savePartyAssets).find(({ path }) => path === publicPath);
  if (!asset) {
    throw new Error(`Party creation truth asset is not registered: ${assetRef}`);
  }
  return asset.key;
}
