import Phaser from 'phaser';
import { fullFeatureUiAssets } from '../../assets/AssetManifest';
import {
  changeFormalPetPage,
  deployFormalPet,
  formatFormalPetSummary,
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

type FormalPetPageCallbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

export function createFormalPetPageView(
  scene: Phaser.Scene,
  model: FormalPetPageModel,
  storage: SaveStorage,
  callbacks: FormalPetPageCallbacks,
): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.image(0, 0, fullFeatureUiAssets.petPage.key).setOrigin(0).setAlpha(0.72));
  objects.push(scene.add.rectangle(470, 295, 940, 590, 0x07101b, 0.52));
  objects.push(scene.add.rectangle(470, 295, 900, 548, 0x111a27, 0.88).setStrokeStyle(2, 0xe5bc55));
  objects.push(scene.add.text(470, 34, `${model.owner.toUpperCase()} 正式宠物`, {
    color: '#fff0ad', fontFamily: 'Arial, sans-serif', fontSize: '25px', fontStyle: 'bold',
  }).setOrigin(0.5));
  objects.push(...createPetButton(scene, 84, 70, 92, 32, 'P1 宠物', () => callbacks.onOwner('p1')));
  if (callbacks.playerCount === 2) {
    objects.push(...createPetButton(scene, 184, 70, 92, 32, 'P2 宠物', () => callbacks.onOwner('p2')));
  }

  const roster = getFormalPetPlayer(model).petRoster;
  const pageStart = model.pageIndex * 5;
  getFormalPetPagePets(model).forEach((pet, index) => {
    objects.push(...createPetButton(
      scene,
      155,
      130 + index * 66,
      238,
      54,
      `${pageStart + index === roster.selectedIndex ? '▶ ' : ''}${pet.displayName}  F${pet.form} Lv.${pet.level}${pet.isActive ? ' [出战]' : ''}\nHP ${pet.hp}/${pet.maxHp}  寿命 ${pet.lifetime}`,
      () => {
        selectFormalPet(model, storage, index);
        callbacks.onSaved();
        callbacks.onRerender();
      },
      pageStart + index === roster.selectedIndex,
    ));
  });
  if (roster.pets.length === 0) {
    objects.push(scene.add.text(155, 190, '当前没有宠物', {
      color: '#cbd8e8', fontFamily: 'Arial, sans-serif', fontSize: '17px',
    }).setOrigin(0.5));
  }

  objects.push(...createPetButton(scene, 87, 470, 88, 34, '上一页', () => {
    changeFormalPetPage(model, storage, -1);
    callbacks.onSaved();
    callbacks.onRerender();
  }));
  objects.push(scene.add.text(155, 470, `${model.pageIndex + 1}/${getFormalPetPageCount(model)}`, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '14px',
  }).setOrigin(0.5));
  objects.push(...createPetButton(scene, 223, 470, 88, 34, '下一页', () => {
    changeFormalPetPage(model, storage, 1);
    callbacks.onSaved();
    callbacks.onRerender();
  }));

  const pet = getSelectedFormalPet(model);
  objects.push(scene.add.text(300, 105, formatFormalPetSummary(model).slice(0, 5).join('\n'), {
    color: '#dce8f7', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineSpacing: 5,
    wordWrap: { width: 565 },
  }));
  objects.push(scene.add.text(300, 245, '八技能展示槽', {
    color: '#ffe59a', fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold',
  }));
  const slots = pet ? buildPetSkillSlotViews(pet) : [];
  for (let index = 0; index < 8; index += 1) {
    const slot = slots[index];
    const col = index % 4;
    const row = Math.floor(index / 4);
    objects.push(...createPetButton(
      scene, 370 + col * 135, 292 + row * 55, 124, 44,
      `${index + 1}. ${slot && !slot.isEmpty ? `${slot.name}\n${slot.skillKey}` : '-'}`,
      () => undefined,
    ));
  }

  objects.push(...createPetButton(scene, 335, 395, 104, 38, '出战', () => runPetAction(
    deployFormalPet(model, storage), callbacks,
  )));
  objects.push(...createPetButton(scene, 452, 395, 104, 38, '休息', () => runPetAction(
    restFormalPet(model, storage), callbacks,
  )));
  objects.push(...createPetButton(scene, 569, 395, 104, 38, model.releaseArmedPetId ? '确认放生' : '放生', () => runPetAction(
    releaseFormalPet(model, storage), callbacks,
  )));
  objects.push(...createPetButton(scene, 686, 395, 104, 38, '资质重洗', () => runPetAction(
    useFormalPetConsumable(model, storage, 'cwzzxld'), callbacks,
  )));
  objects.push(...createPetButton(scene, 803, 395, 104, 38, '技能重洗', () => runPetAction(
    useFormalPetConsumable(model, storage, 'cwjnxld'), callbacks,
  )));
  objects.push(...createPetButton(scene, 686, 445, 104, 38, '进化', () => runPetAction(
    useFormalPetConsumable(model, storage, 'nianjhd'), callbacks,
  )));
  objects.push(scene.add.text(300, 470, formatFormalPetSummary(model).slice(5).join('\n'), {
    color: '#f0dca0', fontFamily: 'Arial, sans-serif', fontSize: '12px', lineSpacing: 4,
    wordWrap: { width: 480 },
  }));
  objects.push(...createPetButton(scene, 850, 520, 130, 40, '关闭返回', callbacks.onClose));
  return scene.add.container(0, 0, objects).setDepth(20);
}

function runPetAction(changed: boolean, callbacks: FormalPetPageCallbacks): void {
  if (changed) {
    callbacks.onSaved();
  }
  callbacks.onRerender();
}

function createPetButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  selected = false,
): Phaser.GameObjects.GameObject[] {
  const background = scene.add.rectangle(x, y, width, height, selected ? 0x765b27 : 0x24364d, 0.98)
    .setStrokeStyle(selected ? 3 : 1, selected ? 0xffdc75 : 0xc9d6e8)
    .setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '12px', align: 'center',
  }).setOrigin(0.5);
  background.on('pointerdown', onClick);
  return [background, text];
}
