import Phaser from 'phaser';
// boundary: this view projects verified pet-page geometry and forwards pointer intents;
// pet roster, growth, combat, ownership, and persistence rules remain in systems.
import {
  fullFeatureUiAssets,
  getPetNativeHeadAsset,
  getPetNativeProgressAsset,
  getPetNativeQualityAsset,
  getPetNativeSkillAsset,
  petNativeUiAssets,
} from '../../assets/AssetManifest';
import {
  cancelFormalPetRelease,
  changeFormalPetPage,
  deployFormalPet,
  getFormalPetPageCount,
  getFormalPetPagePets,
  getFormalPetPlayer,
  getSelectedFormalPet,
  releaseFormalPet,
  restFormalPet,
  selectFormalPet,
  useFormalPetConsumable,
  type FormalPetPageModel,
} from '../../systems/FormalPetPageSystem';
import { buildPetSkillSlotViews } from '../../systems/PetPanelSystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import type { PetState } from '../../systems/PetTypes';
import {
  assertVerifiedPetPageTruth,
  getPetTruthBounds,
  getPetTruthCharacterId,
} from './FormalPetPageTruth';

type FormalPetPageCallbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

type NativeButtonState = 'up' | 'over' | 'down';
const NativeFont = 'FZCuYuan-M03, Microsoft YaHei, sans-serif';
// FFDec frame exports preserve each MovieClip registration translation inside the SVG.
// These offsets are generated from the first root matrix of the same verified source assets.
const ProgressAssetRegistration: Readonly<Record<number, Readonly<{ x: number; y: number }>>> = {
  852: { x: 312.2, y: 10 },
  858: { x: 204.7, y: 10.5 },
  863: { x: 203.05, y: 10.5 },
  868: { x: 202.2, y: 10.5 },
  873: { x: 201.65, y: 11 },
  878: { x: 202.5, y: 10.5 },
};

export function createFormalPetPageView(
  scene: Phaser.Scene,
  model: FormalPetPageModel,
  storage: SaveStorage,
  callbacks: FormalPetPageCallbacks,
): Phaser.GameObjects.Container {
  assertVerifiedPetPageTruth();
  const objects: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, 0, fullFeatureUiAssets.petPage.key)
      .setOrigin(0)
      .setData('petTruthObject', 'pet-page-root'),
  ];
  addPetRows(scene, objects, model, storage, callbacks);
  addSelectedPetProjection(scene, objects, model);
  addNativeActions(scene, objects, model, storage, callbacks);
  if (model.releaseArmedPetId) addReleaseConfirmation(scene, objects, model, storage, callbacks);
  return scene.add.container(0, 0, objects).setDepth(20)
    .setData('petPageTruthId', 'task-settings-175a.pet-page');
}

function addPetRows(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  model: FormalPetPageModel,
  storage: SaveStorage,
  callbacks: FormalPetPageCallbacks,
): void {
  const roster = getFormalPetPlayer(model).petRoster;
  const start = model.pageIndex * 5;
  getFormalPetPagePets(model).forEach((pet, index) => {
    const rowId = `pet-list-row-${index}`;
    const rowBounds = getPetTruthBounds(rowId);
    const row = scene.add.image(rowBounds.left, rowBounds.top, petNativeUiAssets.row.key)
      .setOrigin(0)
      .setDisplaySize(rowBounds.width, rowBounds.height)
      .setInteractive({ useHandCursor: true })
      .setData('petTruthObject', rowId);
    row.on('pointerdown', () => {
      selectFormalPet(model, storage, index);
      callbacks.onSaved();
      callbacks.onRerender();
    });
    objects.push(row);
    const nameBounds = getPetTruthBounds(`${rowId}-name`);
    objects.push(scene.add.text(nameBounds.left, nameBounds.top, `${pet.displayName}${pet.isActive ? '（出战）' : ''}`, {
      color: start + index === roster.selectedIndex ? '#fdfcba' : '#381d09',
      fontFamily: NativeFont,
      fontSize: '13px',
    }).setData('petTruthObject', `${rowId}-name`));
  });
  addField(scene, objects, 'listtxt', `${model.pageIndex + 1}/${getFormalPetPageCount(model)}`);
}

function addSelectedPetProjection(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  model: FormalPetPageModel,
): void {
  const pet = getSelectedFormalPet(model);
  addProgress(scene, objects, 878, pet ? clampFrame(20 - Math.round(20 * pet.lifetime / 100)) : 20);
  addQuality(scene, objects, pet?.quality ?? 3);
  if (!pet) return;

  const head = getPetNativeHeadAsset(`${pet.species}${pet.form}`);
  if (head) {
    const bounds = getPetTruthBounds('selected-pet-head');
    objects.push(scene.add.image(bounds.left, bounds.top, head.key)
      .setOrigin(0)
      .setDisplaySize(bounds.width, bounds.height)
      .setData('petTruthObject', 'selected-pet-head'));
  }

  const fields: Readonly<Record<string, string>> = {
    txtname: pet.displayName,
    leveltxt: String(pet.level),
    hptxt: `${pet.hp}/${pet.maxHp}`,
    mptxt: `${pet.mp}/${pet.maxMp}`,
    atktxt: String(pet.atk),
    deftxt: String(pet.def),
    perceptiontxt: String(pet.perception),
    techniquetxt: String(pet.technique),
    warpowertxt: String(pet.warpower),
    exptxt: `${pet.exp}/${pet.expToNext}`,
    lifetimetxt: `${pet.lifetime}/100`,
    hpqualitytxt: `${pet.hpQuality}/2000`,
    mpqualitytxt: `${pet.mpQuality}/2000`,
    atkqualitytxt: `${pet.atkQuality}/2000`,
    defqualitytxt: `${pet.defQuality}/2000`,
    speedtxt: String(pet.moveSpeed),
    crittxt: `${Math.trunc(pet.critBonusRate * 100)}%`,
  };
  Object.entries(fields).forEach(([id, copy]) => addField(scene, objects, id, copy));

  addProgress(scene, objects, 852, ratioFrame(pet.exp, pet.expToNext));
  addProgress(scene, objects, 858, ratioFrame(pet.hpQuality, 2000));
  addProgress(scene, objects, 863, ratioFrame(pet.mpQuality, 2000));
  addProgress(scene, objects, 868, ratioFrame(pet.atkQuality, 2000));
  addProgress(scene, objects, 873, ratioFrame(pet.defQuality, 2000));
  addSkillIcons(scene, objects, pet);
}

function addSkillIcons(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  pet: PetState,
): void {
  const tooltipBounds = getPetTruthBounds('skill-tooltip');
  const tooltipBackground = scene.add.image(tooltipBounds.left, tooltipBounds.top, petNativeUiAssets.tooltip.key)
    .setOrigin(0)
    .setDisplaySize(tooltipBounds.width, tooltipBounds.height);
  const tooltipName = scene.add.text(tooltipBounds.left + 10, tooltipBounds.top + 8, '', {
    color: '#fff1a0', fontFamily: NativeFont, fontSize: '13px',
  });
  const tooltipInfo = scene.add.text(tooltipBounds.left + 10, tooltipBounds.top + 31, '', {
    color: '#ffffff', fontFamily: NativeFont, fontSize: '12px',
    wordWrap: { width: tooltipBounds.width - 20 },
  });
  const tooltip = scene.add.container(0, 0, [tooltipBackground, tooltipName, tooltipInfo])
    .setVisible(false)
    .setData('petTruthObject', 'skill-tooltip');

  buildPetSkillSlotViews(pet).forEach((slot, index) => {
    if (slot.isEmpty) return;
    const asset = getPetNativeSkillAsset(slot.skillKey);
    if (!asset) return;
    const bounds = getPetTruthBounds(`skill${index + 1}`);
    const icon = scene.add.image(bounds.left, bounds.top, asset.key)
      .setOrigin(0)
      .setDisplaySize(bounds.width, bounds.height)
      .setInteractive({ useHandCursor: true })
      .setData('petTruthObject', `skill-runtime-icon-${index + 1}`);
    icon.on('pointerover', () => {
      tooltipName.setText(slot.name);
      tooltipInfo.setText(slot.info);
      tooltip.setVisible(true);
    });
    icon.on('pointerout', () => tooltip.setVisible(false));
    objects.push(icon);
  });
  objects.push(tooltip);
}

function addNativeActions(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  model: FormalPetPageModel,
  storage: SaveStorage,
  callbacks: FormalPetPageCallbacks,
): void {
  objects.push(nativeButton(scene, 'fightbtn', 835, () => runPetAction(deployFormalPet(model, storage), callbacks)));
  objects.push(nativeButton(scene, 'restbtn', 845, () => runPetAction(restFormalPet(model, storage), callbacks)));
  objects.push(nativeButton(scene, 'releasebtn', 840, () => runPetAction(releaseFormalPet(model, storage), callbacks)));
  objects.push(nativeButton(scene, 'btn_close', 883, callbacks.onClose));
  objects.push(nativeZone(scene, 'prePage', () => changePage(model, storage, -1, callbacks)));
  objects.push(nativeZone(scene, 'nextPage', () => changePage(model, storage, 1, callbacks)));
  objects.push(nativeZone(scene, 'czsxbtn', () => runPetAction(useFormalPetConsumable(model, storage, 'cwzzxld'), callbacks)));
  objects.push(nativeZone(scene, 'czjnbtn', () => runPetAction(useFormalPetConsumable(model, storage, 'cwjnxld'), callbacks)));
  objects.push(nativeZone(scene, 'upBtn', () => runPetAction(useFormalPetConsumable(model, storage, 'nianjhd'), callbacks)));
}

function addReleaseConfirmation(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  model: FormalPetPageModel,
  storage: SaveStorage,
  callbacks: FormalPetPageCallbacks,
): void {
  const bounds = getPetTruthBounds('release-confirm-overlay');
  objects.push(scene.add.image(bounds.left, bounds.top, petNativeUiAssets.releaseConfirm.key)
    .setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height)
    .setData('petTruthObject', 'release-confirm-overlay'));
  objects.push(nativeZone(scene, 'release-confirm-ok', () => runPetAction(releaseFormalPet(model, storage), callbacks)));
  objects.push(nativeZone(scene, 'release-confirm-no', () => {
    cancelFormalPetRelease(model);
    callbacks.onRerender();
  }));
}

function addField(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  id: string,
  copy: string,
): void {
  const bounds = getPetTruthBounds(id);
  objects.push(scene.add.text(bounds.left, bounds.top, copy, {
    color: '#ffffff', fontFamily: NativeFont, fontSize: '13px',
  }).setData('petTruthObject', id));
}

function addProgress(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  characterId: number,
  frame: number,
): void {
  const id = ({ 852: 'expmc', 858: 'hpqualitymc', 863: 'mpqualitymc', 868: 'atkqualitymc', 873: 'defqualitymc', 878: 'lifetimemc' } as Record<number, string>)[characterId];
  const bounds = getPetTruthBounds(id);
  const registration = ProgressAssetRegistration[characterId];
  objects.push(scene.add.image(bounds.left - registration.x, bounds.top - registration.y, getPetNativeProgressAsset(characterId, clampFrame(frame)).key)
    .setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height)
    .setData('petTruthObject', id));
}

function addQuality(scene: Phaser.Scene, objects: Phaser.GameObjects.GameObject[], quality: number): void {
  const bounds = getPetTruthBounds('qualitymc');
  const frame = Math.max(1, Math.min(3, Math.trunc(quality)));
  objects.push(scene.add.image(bounds.left, bounds.top, getPetNativeQualityAsset(frame).key)
    .setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height)
    .setData('petTruthObject', 'qualitymc'));
}

function nativeButton(
  scene: Phaser.Scene,
  id: string,
  characterId: 835 | 840 | 845 | 883,
  onClick: () => void,
): Phaser.GameObjects.Image {
  if (getPetTruthCharacterId(id) !== characterId) throw new Error(`Pet truth character mismatch for ${id}.`);
  const bounds = getPetTruthBounds(id);
  const assets = petNativeUiAssets.buttons[characterId];
  const image = scene.add.image(bounds.left, bounds.top, assets.up.key)
    .setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height)
    .setInteractive({ useHandCursor: true })
    .setData('petTruthObject', id);
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

function nativeZone(scene: Phaser.Scene, id: string, onClick: () => void): Phaser.GameObjects.Zone {
  const bounds = getPetTruthBounds(id);
  return scene.add.zone(bounds.left, bounds.top, bounds.width, bounds.height)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', onClick)
    .setData('petTruthObject', id);
}

function changePage(
  model: FormalPetPageModel,
  storage: SaveStorage,
  direction: -1 | 1,
  callbacks: FormalPetPageCallbacks,
): void {
  changeFormalPetPage(model, storage, direction);
  callbacks.onSaved();
  callbacks.onRerender();
}

function runPetAction(changed: boolean, callbacks: FormalPetPageCallbacks): void {
  if (changed) callbacks.onSaved();
  callbacks.onRerender();
}

function ratioFrame(value: number, maximum: number): number {
  return clampFrame(Math.round(20 * value / Math.max(1, maximum)) + 1);
}

function clampFrame(frame: number): number {
  return Math.max(1, Math.min(20, Math.trunc(frame)));
}
