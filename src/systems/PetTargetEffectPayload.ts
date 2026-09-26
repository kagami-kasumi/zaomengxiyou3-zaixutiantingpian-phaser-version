import truth from '../assets/pet-target-effects.json';
import type { PetBehaviorContext } from './PetBehavior';
import type { PetTargetEffectName } from './PetTargetEffects';

export type PetTargetEffectInput = Readonly<{ name: PetTargetEffectName; time: number; hurt?: number }>;

export function petTargetEffectPayload(context: PetBehaviorContext, action: string, initialAttack: number): readonly PetTargetEffectInput[] {
  const config = truth.effects.find(row => row.family === context.pet.species && row.form === context.pet.form && row.action === action);
  if (!config || config.requiresBd && !context.pet.skills.includes('bd')) return [];
  if (config.name !== 'petmonkey_fire' && config.name !== 'pethorse_ice') throw new Error('Unknown target effect');
  const hurt = config.hurtOperand === null ? undefined : config.hurtOperation === '/'
    ? initialAttack / config.hurtOperand : initialAttack * config.hurtOperand;
  return [{ name: config.name, time: config.seconds * context.hostFps, ...(hurt === undefined ? {} : { hurt }) }];
}
