import type { PetBehaviorContext } from './PetBehavior';
import { refreshDragonDamageCache } from './PetDragonDamageSystem';

/** PetInfo.getPetHarmObj applies 1.05 before the turtle adds magic power. */
export function getPetTurtleNoncriticalPower(context: PetBehaviorContext, action: 'hit1' | 'hit2' | 'hit3'): number {
  const pet = context.pet;
  const base = action === 'hit1' ? pet.atk : pet.atk * (action === 'hit3' ? 5.4 : 1) * 1.05;
  const magicAdd = (pet.autoBuffState?.fsnl.active?.bonusSkillDamage ?? 0) >>> 0;
  const flower = pet.form === 4 ? pet.magicFlowerBuff?.attackMultiplier ?? 1 : 1;
  return (base + magicAdd) * (context.isGxp ? 1.2 : 1) * flower;
}

export function refreshPetTurtleDamage(context: PetBehaviorContext, action: 'hit1' | 'hit2' | 'hit3') {
  // Shared BaseBullet cache algorithm: two critical reads, integer hurt and atk*2.8.
  return refreshDragonDamageCache({ attack: context.pet.atk,
    power: getPetTurtleNoncriticalPower(context, action), magicAdd: 0, gxp: false },
  () => context.random() <= context.pet.critBonusRate + (context.pet.autoBuffState?.sxkb.active?.bonusCritRate ?? 0));
}
