import Phaser from 'phaser';
// boundary: this view projects verified character-596 geometry and forwards pointer intents;
// upgrade, reset, ownership, inventory, soul, and persistence rules remain in systems.
import {
  fullFeatureUiAssets,
  magicWeaponNativeUiAssets,
} from '../../assets/AssetManifest';
import {
  cancelFormalMagicWeaponAction,
  confirmFormalMagicWeaponAction,
  getFormalMagicWeaponPanelState,
  requestFormalMagicWeaponElementReset,
  requestFormalMagicWeaponUpgrade,
  type FormalMagicWeaponPageModel,
  type FormalMagicWeaponPanelState,
} from '../../systems/FormalMagicWeaponPageSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import {
  assertVerifiedMagicWeaponPageTruth,
  getMagicWeaponTruthBounds,
  getMagicWeaponTruthCharacterId,
  MagicWeaponPageTruthId,
} from './FormalMagicWeaponPageTruth';

type Callbacks = {
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

type NativeButtonState = 'up' | 'over' | 'down';
const NativeFont = 'FZCuYuan-M03, Microsoft YaHei, sans-serif';

export function createFormalMagicWeaponPageView(
  scene: Phaser.Scene,
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
  callbacks: Callbacks,
): Phaser.GameObjects.Container {
  assertVerifiedMagicWeaponPageTruth();
  const panel = getFormalMagicWeaponPanelState(model);
  if (!panel.equipped) {
    return scene.add.container(0, 0).setDepth(20)
      .setData('magicWeaponPageTruthId', MagicWeaponPageTruthId)
      .setData('magicWeaponTruthState', 'unequipped-p1');
  }

  const objects: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, 0, fullFeatureUiAssets.magicWeaponPage.key)
      .setOrigin(0)
      .setData('magicWeaponTruthObject', 'magic-weapon-page-root'),
  ];
  addDynamicFields(scene, objects, panel);
  objects.push(nativeButton(scene, 'magic-weapon-page-root.btn_sj', 436, () => {
    const result = requestFormalMagicWeaponUpgrade(model, storage);
    if (result === 'upgraded') callbacks.onSaved();
    callbacks.onRerender();
  }));
  objects.push(nativeButton(scene, 'magic-weapon-page-root.resetbtn', 368, () => {
    requestFormalMagicWeaponElementReset(model);
    callbacks.onRerender();
  }));
  objects.push(nativeButton(scene, 'magic-weapon-page-root.btn_close', 31, callbacks.onClose));
  if (model.pending) addNativeConfirmation(scene, objects, model, storage, callbacks);

  return scene.add.container(0, 0, objects).setDepth(20)
    .setData('magicWeaponPageTruthId', MagicWeaponPageTruthId)
    .setData('magicWeaponTruthState', model.pending ? pendingTruthState(model) : 'normal-level1-p1');
}

function addDynamicFields(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  panel: FormalMagicWeaponPanelState,
): void {
  const nextSoul = panel.level * panel.level * 1_000;
  const fields: Readonly<Record<string, string>> = {
    txt_fbname: panel.name,
    txt_fbdj: String(panel.level),
    txt_fbczl: String(panel.growthRate),
    txt_fbwx: panel.element,
    txt_fbatk: String(Math.trunc(panel.stats.power)),
    txt_fbdef: String(Math.trunc(panel.stats.defense)),
    txt_fbhx: String(Math.trunc(panel.stats.maxHp)),
    txt_fbhl: String(Math.trunc(panel.stats.maxMp)),
    txt_fblh: `${Math.trunc(panel.soul)}/${nextSoul}`,
  };
  Object.entries(fields).forEach(([instanceName, copy]) => {
    addField(scene, objects, `magic-weapon-page-root.${instanceName}`, copy, instanceName === 'txt_fblh');
  });
}

function addNativeConfirmation(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  model: FormalMagicWeaponPageModel,
  storage: SaveStorage,
  callbacks: Callbacks,
): void {
  const upgradeMaterial = model.pending?.kind === 'upgrade'
    && model.pending.cost.fillName === 'wplvdyl';
  const rootId = upgradeMaterial ? 'upgrade-confirm-overlay' : 'shared-confirm-overlay';
  const overlay = upgradeMaterial
    ? magicWeaponNativeUiAssets.overlays.upgrade
    : magicWeaponNativeUiAssets.overlays.shared;
  objects.push(scene.add.image(0, 0, overlay.key).setOrigin(0)
    .setData('magicWeaponTruthObject', rootId));
  addField(scene, objects, `${rootId}.txt`, model.pending!.prompt);
  objects.push(nativeButton(scene, `${rootId}.okbtn`, 19, () => {
    const result = confirmFormalMagicWeaponAction(model, storage);
    if (result === 'upgraded' || result === 'reset') callbacks.onSaved();
    if (result === 'rejected') return;
    callbacks.onRerender();
  }));
  objects.push(nativeButton(scene, `${rootId}.nobtn`, 24, () => {
    cancelFormalMagicWeaponAction(model);
    callbacks.onRerender();
  }));
}

function addField(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  id: string,
  copy: string,
  centered = false,
): void {
  const bounds = getMagicWeaponTruthBounds(id);
  const text = scene.add.text(centered ? bounds.left + bounds.width / 2 : bounds.left, bounds.top, copy, {
    color: '#ffffff',
    fontFamily: NativeFont,
    fontSize: '14px',
    align: centered ? 'center' : 'left',
    wordWrap: { width: bounds.width },
  }).setData('magicWeaponTruthObject', id);
  if (centered) text.setOrigin(0.5, 0);
  objects.push(text);
}

function nativeButton(
  scene: Phaser.Scene,
  id: string,
  characterId: 19 | 24 | 31 | 368 | 436,
  onClick: () => void,
): Phaser.GameObjects.Image {
  if (getMagicWeaponTruthCharacterId(id) !== characterId) {
    throw new Error(`Magic-weapon truth character mismatch for ${id}.`);
  }
  const bounds = getMagicWeaponTruthBounds(id);
  const assets = magicWeaponNativeUiAssets.buttons[characterId];
  const image = scene.add.image(bounds.left, bounds.top, assets.up.key)
    .setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height)
    .setInteractive({ useHandCursor: true })
    .setData('magicWeaponTruthObject', id);
  const setState = (state: NativeButtonState) => image.setTexture(assets[state].key)
    .setDisplaySize(bounds.width, bounds.height);
  image.on('pointerover', () => setState('over'));
  image.on('pointerout', () => setState('up'));
  image.on('pointerdown', () => setState('down'));
  image.on('pointerup', () => {
    onClick();
    if (image.active) setState('over');
  });
  return image;
}

function pendingTruthState(model: FormalMagicWeaponPageModel): string {
  if (model.pending?.kind === 'reset-element') return 'reset-confirm-p1';
  return model.pending?.cost.fillName === 'wplvdyl'
    ? 'upgrade-confirm-material-p1'
    : 'upgrade-confirm-special-p1';
}
