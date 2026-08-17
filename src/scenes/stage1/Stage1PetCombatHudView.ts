import Phaser from 'phaser';
import {
  getPetNativeHeadAsset,
  petCombatHudAssets,
} from '../../assets/AssetManifest';
import type { CombatHudPetSnapshot } from '../../systems/Stage1CombatHudSystem';

export type Stage1PetCombatHudView = Readonly<{
  root: Phaser.GameObjects.Container;
  head: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Image;
  mpBar: Phaser.GameObjects.Image;
  levelText: Phaser.GameObjects.Text;
  hpText: Phaser.GameObjects.Text;
  mpText: Phaser.GameObjects.Text;
}>;

const HP_ORIGIN = { x: 250.5 / 326, y: 21 / 30 } as const;
const MP_ORIGIN = { x: 231.95 / 306, y: 16.55 / 23 } as const;

export function createStage1PetCombatHudView(
  scene: Phaser.Scene,
  slot: 'p1' | 'p2',
): Stage1PetCombatHudView {
  const mirrored = slot === 'p2';
  const root = scene.add.container(mirrored ? 920 : 0, 94)
    .setScale(mirrored ? -1 : 1, 1)
    .setVisible(false)
    .setData('petCombatHudTruthId', 'task-settings-191.pet-combat-hud');
  const shell = scene.add.image(0, 0, petCombatHudAssets.shell.key).setOrigin(0);
  const hpBar = scene.add.image(118.3, 15.35, petCombatHudAssets.hp.frameKeys[0]!)
    .setOrigin(HP_ORIGIN.x, HP_ORIGIN.y)
    .setScale(0.84);
  const mpBar = scene.add.image(117, 31, petCombatHudAssets.mp.frameKeys[0]!)
    .setOrigin(MP_ORIGIN.x, MP_ORIGIN.y)
    .setScale(0.84);
  const head = scene.add.image(7.8, -11.3, petCombatHudAssets.shell.key)
    .setOrigin(0)
    .setDisplaySize(104.8, 93.6)
    .setVisible(false);
  const levelText = petText(scene, mirrored ? 25 : 5.5, 36.55, 19.5, 18.1, mirrored);
  const mpText = petText(scene, mirrored ? 140 : 79, 24.15, 72, 16, mirrored);
  const hpText = petText(scene, mirrored ? 140 : 78, 7.5, 74, 16, mirrored);
  root.add([shell, hpBar, mpBar, head, levelText, mpText, hpText]);
  return { root, head, hpBar, mpBar, levelText, hpText, mpText };
}

export function updateStage1PetCombatHudView(
  view: Stage1PetCombatHudView,
  pet: CombatHudPetSnapshot | undefined,
): void {
  view.root.setVisible(Boolean(pet));
  if (!pet) return;
  view.hpBar.setTexture(petCombatHudAssets.hp.frameKeys[pet.hpFrame - 1]!);
  view.mpBar.setTexture(petCombatHudAssets.mp.frameKeys[pet.mpFrame - 1]!);
  view.levelText.setText(String(pet.level));
  view.hpText.setText(pet.hpText);
  view.mpText.setText(pet.mpText);
  const headAsset = getPetNativeHeadAsset(pet.nativeHeadName);
  view.head.setVisible(Boolean(headAsset));
  if (headAsset) view.head.setTexture(headAsset.key);
}

function petText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  counterMirror: boolean,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, '', {
    color: '#ffffff',
    fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
    fontSize: '12px',
    fixedWidth: width,
    fixedHeight: height,
    align: 'center',
  }).setOrigin(0).setScale(counterMirror ? -1 : 1, 1);
}
