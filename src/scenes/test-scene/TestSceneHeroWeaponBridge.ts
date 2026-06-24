import Phaser from 'phaser';
import {
  setHeroWeaponMode,
  type HeroNormalAttackModel,
} from '../../systems/HeroNormalAttackSystem';
import type { PlayerSlot } from '../../systems/InputSystem';

export function toggleTestHeroWeaponMode(params: {
  players: readonly { slot: PlayerSlot; normalAttack: HeroNormalAttackModel }[];
  slot: PlayerSlot;
  key: Phaser.Input.Keyboard.Key | undefined;
}): HeroNormalAttackModel | undefined {
  if (!params.key || !Phaser.Input.Keyboard.JustDown(params.key)) return undefined;
  const model = params.players.find((player) => player.slot === params.slot)?.normalAttack;
  if (!model) return undefined;
  if (model.heroId === 4) {
    setHeroWeaponMode(model, model.weaponMode === 'arrow' ? 'shovel' : 'arrow');
  } else if (model.heroId === 5) {
    setHeroWeaponMode(model, model.weaponMode === 'sword' ? 'spear' : 'sword');
  }
  return model;
}
