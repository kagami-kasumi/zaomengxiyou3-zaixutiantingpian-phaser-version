import { prepareMonsterDamage, type MonsterDamageRequest, type MonsterDamageReception } from './MonsterDamageReception';
import { createPetSkillState, isPetRabbitJifengActive } from './PetSkillStateSystem';
import type { PetState } from './PetTypes';

/** Processed inputs are explicit; no unimplemented stat is silently set to zero. */
export type PetMonsterReceptionInput = Readonly<{
  action: string;
  protected: boolean;
  gxp: boolean;
  missRate: number;
  magicDefenseRate: number;
  rabbitDodgeActive: boolean;
  counterChance: number | undefined;
}>;

export type PetMonsterReceptionEffect = MonsterDamageReception & Readonly<{
  action: string;
  protectionTicks: number | undefined;
  registerReceiverId: boolean;
}>;

export function rejectPetMonsterReception(pet: PetState, action: string): PetMonsterReceptionEffect {
  return { accepted: false, missed: false, returnVoid: false, amount: 0,
    hpBefore: pet.hp, hpAfter: pet.hp, action, protectionTicks: undefined, registerReceiverId: false };
}

/** Snapshot current owner state at reception; historical missing values are not defaults. */
export function readPetMonsterReceptionInput(pet: PetState,
  context: Pick<PetMonsterReceptionInput, 'action' | 'protected' | 'gxp' | 'counterChance'>): PetMonsterReceptionInput {
  return { ...context, ...readPetMonsterReceptionState(pet) };
}

export function readPetMonsterReceptionState(pet: PetState):
  Pick<PetMonsterReceptionInput, 'missRate' | 'magicDefenseRate' | 'rabbitDodgeActive'> {
  const { missRate, magicDefenseRate } = pet;
  if (typeof missRate !== 'number' || !Number.isFinite(missRate)
    || typeof magicDefenseRate !== 'number' || !Number.isFinite(magicDefenseRate)) {
    throw new Error(`Pet reception attributes unavailable: ${pet.id}`);
  }
  return { missRate, magicDefenseRate, rabbitDodgeActive: isPetRabbitJifengActive(pet) };
}

/** No HP writes: the existing session/compatibility owner performs settlement. */
export function preparePetMonsterReception(pet: PetState, input: PetMonsterReceptionInput,
  request: MonsterDamageRequest): ReturnType<typeof prepareMonsterDamage> {
  const result = prepareMonsterDamage(request, { kind: 'pet', protected: input.protected,
    missRate: input.missRate, defense: pet.def, magicDefenseRate: input.magicDefenseRate,
    maxHp: pet.maxHp, rabbitDodgeRate: input.rabbitDodgeActive && pet.species === 'rabbit'
      ? 0.1 + pet.form * 0.1 : undefined });
  return pet.species === 'phoenix' && input.action === 'hit2'
    ? { ...result, amount: Math.trunc(result.amount / 3) } : result;
}

/** Source reduceHp reactions run after the authoritative HP write, even on death. */
export function finishPetMonsterReception(pet: PetState, input: PetMonsterReceptionInput,
  request: MonsterDamageRequest, prepared: ReturnType<typeof prepareMonsterDamage>, hpBefore: number): PetMonsterReceptionEffect {
  let action = input.action;
  let protectionTicks: number | undefined;
  const receivedDamage = !prepared.missed && (prepared.accepted || prepared.returnVoid);
  if (receivedDamage) {
    if (pet.hp <= 0) {
      if (action !== 'dead') {
        pet.lifetime = Math.max(0, pet.lifetime - 1);
        protectionTicks = request.hostFps * 5;
        action = 'dead';
      }
    } else if (!input.gxp && !(pet.species === 'phoenix' && input.action === 'hit2')) {
      action = input.counterChance !== undefined && request.source.random() <= input.counterChance ? 'hit1' : 'hurt';
    }
    const skills = pet.skillState ??= createPetSkillState();
    if (pet.species === 'monkey') {
      if (pet.form === 1) skills.monkey1Xj.releaseReady = true;
      else if (pet.form === 2) skills.monkey2Xj.releaseReady = true;
      else skills.monkey3Lj.releaseReady = true;
    } else if (pet.species === 'horse' && pet.form >= 2) skills.horse2Bd.releaseReady = true;
  }
  return { ...prepared, hpBefore, hpAfter: pet.hp, action, protectionTicks,
    registerReceiverId: prepared.missed };
}
