import Phaser from 'phaser';
import { savePartyAssets } from '../../assets/AssetManifest';
import type { HeroId } from '../../systems/HeroNormalAttackSystem';
import {
  getDraftSelectedHero,
  type SaveProfileDraft,
} from '../../systems/SaveProfileDraftSystem';

type SavePartyCreationHandlers = {
  onSelectPlayerCount: (playerCount: 1 | 2) => void;
  onSelectHero: (heroId: HeroId) => void;
  onCancel: () => void;
};

const RoleImageX = [0, 188, 376, 564, 752] as const;
const RoleRegistrationX = [118.05, 306.4, 494.2, 682, 870.2] as const;
const RoleHitBounds = [
  { left: 0.76, right: 188.82 },
  { left: 188.71, right: 376.72 },
  { left: 376.51, right: 564.52 },
  { left: 564.31, right: 752.32 },
  { left: 754.82, right: 939.13 },
] as const;
const RoleStateKeys = [
  { over: savePartyAssets.role1Over.key, down: savePartyAssets.role1Down.key },
  { over: savePartyAssets.role2Over.key, down: savePartyAssets.role2Down.key },
  { over: savePartyAssets.role3Over.key, down: savePartyAssets.role3Down.key },
  { over: savePartyAssets.role4Over.key, down: savePartyAssets.role4Down.key },
  { over: savePartyAssets.role5Over.key, down: savePartyAssets.role5Down.key },
] as const;

export function createSavePartyCreationView(
  scene: Phaser.Scene,
  draft: SaveProfileDraft,
  handlers: SavePartyCreationHandlers,
): Phaser.GameObjects.Container {
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
  const background = scene.add.image(0, 0, savePartyAssets.numberUp.key).setOrigin(0);
  root.add(background);
  addNativeButtonHitArea(scene, root, background, {
    x: (510.6 + 940) / 2,
    y: (174.2 + 221) / 2,
    width: 940 - 510.6,
    height: 221 - 174.2,
    overKey: savePartyAssets.numberOneOver.key,
    downKey: savePartyAssets.numberOneDown.key,
    onActivate: () => handlers.onSelectPlayerCount(1),
  });
  addNativeButtonHitArea(scene, root, background, {
    x: 806.15,
    y: 270.75,
    width: 110,
    height: 40,
    overKey: savePartyAssets.numberTwoOver.key,
    downKey: savePartyAssets.numberTwoDown.key,
    onActivate: () => handlers.onSelectPlayerCount(2),
  });
  addNativeButtonHitArea(scene, root, background, {
    x: (750.6 + 849.3) / 2,
    y: (301.5 + 329.1) / 2,
    width: 849.3 - 750.6,
    height: 329.1 - 301.5,
    overKey: savePartyAssets.numberBackOver.key,
    downKey: savePartyAssets.numberBackDown.key,
    onActivate: handlers.onCancel,
  });
}

function createHeroSelectionView(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  draft: Extract<SaveProfileDraft, { step: 'hero' }>,
  handlers: SavePartyCreationHandlers,
): void {
  root.add(scene.add.image(0, 0, savePartyAssets.roleUp.key).setOrigin(0));
  const selectedHero = getDraftSelectedHero(draft);
  if (selectedHero !== undefined) {
    root.add(createRoleStateImage(scene, selectedHero, 'down'));
  }

  for (let index = 0; index < RoleHitBounds.length; index += 1) {
    const heroId = (index + 1) as HeroId;
    if (selectedHero === heroId) continue;
    const bounds = RoleHitBounds[index];
    const hitArea = scene.add.rectangle(
      (bounds.left + bounds.right) / 2,
      295,
      bounds.right - bounds.left,
      590,
      0,
      0.001,
    ).setInteractive({ useHandCursor: true });
    let stateView: Phaser.GameObjects.Container | undefined;
    const showState = (state: 'over' | 'down') => {
      stateView?.destroy(true);
      stateView = scene.add.container(0, 0);
      stateView.add(createRoleStateImage(scene, heroId, state));
      const markerKey = draft.currentOwner === 'p1'
        ? savePartyAssets.markerP1.key
        : savePartyAssets.markerP2.key;
      stateView.add(scene.add.image(
        RoleRegistrationX[index] - 50,
        40,
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
  const keys = RoleStateKeys[heroId - 1];
  return scene.add.image(
    RoleImageX[heroId - 1],
    0,
    state === 'over' ? keys.over : keys.down,
  ).setOrigin(0);
}

function addNativeButtonHitArea(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  background: Phaser.GameObjects.Image,
  config: {
    x: number;
    y: number;
    width: number;
    height: number;
    overKey: string;
    downKey: string;
    onActivate: () => void;
  },
): void {
  const hitArea = scene.add.rectangle(
    config.x,
    config.y,
    config.width,
    config.height,
    0,
    0.001,
  ).setInteractive({ useHandCursor: true });
  const reset = () => background.setTexture(savePartyAssets.numberUp.key);
  hitArea.on('pointerover', () => background.setTexture(config.overKey));
  hitArea.on('pointerdown', () => background.setTexture(config.downKey));
  hitArea.on('pointerout', reset);
  hitArea.on('pointerupoutside', reset);
  hitArea.on('pointerup', config.onActivate);
  root.add(hitArea);
}
