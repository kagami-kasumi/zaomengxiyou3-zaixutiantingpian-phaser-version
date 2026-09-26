import truth from '../assets/pet-monkey-horse-damage.json';
import type { DragonDamageCache } from './PetDragonDamageSystem';
import type { PetBehaviorContext } from './PetBehavior';

type Formula = { multiplier: number; normal: boolean; magic: boolean; critical: boolean;
  gxp: boolean; flower: boolean };
export type MonkeyHorseDamageInput = Readonly<{
  family: 'monkey' | 'horse'; form: number; action: string; attack: number;
  magic: number; gxp: boolean; flower: number; critRate: number;
}>;

/** Source arithmetic order matters before the BaseBullet int conversion. */
export function refreshMonkeyHorseDamage(input: MonkeyHorseDamageInput, random: () => number): DragonDamageCache {
  const forms = truth.formulae[input.family] as Record<string, Record<string, Formula>>;
  const formula = forms[String(input.form)]?.[input.action];
  if (!formula) throw new Error(`Unknown source damage ${input.family}${input.form}/${input.action}`);
  const power = (critical: boolean) => {
    let value = formula.normal ? input.attack : formula.multiplier * input.attack * truth.skillFactor;
    if (formula.magic) value += input.magic >>> 0;
    if (formula.critical) value *= critical ? 2 : 1;
    if (formula.gxp) value *= input.gxp ? 1.2 : 1;
    if (formula.flower) value *= input.flower;
    return value | 0;
  };
  const hurt = power(random() <= input.critRate);
  random(); // The independent qixue call rolls even when its value is zero.
  return { hurt, attack: (input.attack * 2.8) | 0, critical: hurt / power(false) >= 1.6 };
}

export function refreshMonkeyHorseContextDamage(context: PetBehaviorContext, action: string): DragonDamageCache {
  const pet = context.pet;
  if (pet.species !== 'monkey' && pet.species !== 'horse') throw new Error('Unexpected damage family');
  return refreshMonkeyHorseDamage({ family: pet.species, form: pet.form, action, attack: pet.atk,
    magic: pet.autoBuffState?.fsnl.active?.bonusSkillDamage ?? 0, gxp: context.isGxp,
    flower: pet.magicFlowerBuff?.attackMultiplier ?? 1,
    critRate: pet.critBonusRate + (pet.autoBuffState?.sxkb.active?.bonusCritRate ?? 0) }, context.random);
}
