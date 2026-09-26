// boundary: this module projects verified horse animation truth into Phaser;
// pet ownership, combat, damage, cooldowns, AI, and save state remain unchanged.
import Phaser from 'phaser';
import { petHorseBodyAssets } from '../assets/PetHorseAnimationAssets';
import type { PetRuntimeModel, PetState } from '../systems/PetTypes';
import type { PetCombatEntitySnapshot } from '../systems/PetCombatTypes';

export type PetHorseAnimationView = Readonly<{
  kind: 'horse-native';
  root: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  petId: string;
  form: 1 | 2 | 3 | 4;
}>;

export function isSupportedPetHorse(pet: Pick<PetState, 'species' | 'form'>): boolean {
  return pet.species === 'horse' && Number.isInteger(pet.form) && pet.form >= 1 && pet.form <= 4;
}

export function createPetHorseAnimationView(
  scene: Phaser.Scene,
  pet: PetState,
  x: number,
  y: number,
): PetHorseAnimationView {
  if (!isSupportedPetHorse(pet)) throw new Error(`Unsupported horse form ${pet.form}.`);
  const form = pet.form as 1 | 2 | 3 | 4;
  const asset = petHorseBodyAssets[form];
  const root = scene.add.container(x, y).setDepth(42);
  const sprite = scene.add.sprite(0, 0, asset.key, 0)
    .setOrigin(asset.registrationOrigin.x, asset.registrationOrigin.y);
  root.add(sprite);
  return {
    kind: 'horse-native',
    root,
    sprite,
    petId: pet.id,
    form,

  };
}

export function syncPetHorseAnimationView(
  view: PetHorseAnimationView,
  runtime: PetRuntimeModel,
  animation: NonNullable<PetCombatEntitySnapshot['animation']>,
): void {
  const asset = petHorseBodyAssets[view.form];
  view.root.setPosition(runtime.x, runtime.y);
  view.sprite.setFlipX(runtime.facingX > 0);
  view.sprite.setVisible(!(animation.action === 'dead' && animation.complete));
  view.sprite.setFrame(animation.row * asset.columns + animation.column);
  const action = asset.actions[animation.action]
    ?? Object.values(asset.actions).find(action => action.row === animation.row);
  if (!action) throw new Error(`Horse form ${view.form} has no row ${animation.row} truth action.`);
  view.root.setData('petHorseTruthState',
    `body.horse${view.form}.${action.id}.seq${String(animation.keyFrameIndex + 1).padStart(2, '0')}.${runtime.facingX > 0 ? 'right' : 'left'}`);
}
