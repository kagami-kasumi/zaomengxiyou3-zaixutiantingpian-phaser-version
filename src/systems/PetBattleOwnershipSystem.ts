import type { PlayerSlot } from './InputSystem';
import type { DamageEvent } from './CombatSystem';
import { applyHeroDamage, type HeroCombatModel } from './HeroCombatSystem';
import type { Monster30Model } from './Monster30System';
import { awardMonsterExperienceWithCurrentPet } from './PetConsumableSystem';
import type { PlayerPetRosters } from './PetOwnershipSystem';
import { addPetExperience } from './PetProgressionSystem';
import { getActivePet } from './PetRosterSystem';
import { markActivePetSkillTriggered } from './PetSkillTickSystem';
import { applyPetTurtleTxljOwnerDamage } from './PetTurtleSkillSystem';
import { recordIncomingDamageFeedback } from './IncomingDamageFeedbackSystem';
import type { PetRuntimeModel } from './PetTypes';
import type { MonsterExperienceShareResult } from './PetTypes';
import type { PetState } from './PetTypes';
import type { MonsterDamageRequest } from './MonsterDamageReception';
import { preparePetMonsterReception, finishPetMonsterReception, readPetMonsterReceptionInput, rejectPetMonsterReception,
  type PetMonsterReceptionInput, type PetMonsterReceptionEffect } from './PetMonsterDamageReception';

/** Shared HP write used by the existing pet session and compatibility owner. */
export function settleOwnedPetHpDamage(pet: PetState, amount: number): void {
  pet.hp = Math.max(0, pet.hp - amount);
}

/** Production adapter reads the current PetState immediately before settlement. */
export function receiveCurrentOwnedPetMonsterDamage(pet: PetState, runtime: PetRuntimeModel,
  context: Pick<PetMonsterReceptionInput, 'action' | 'protected' | 'gxp' | 'counterChance'>,
  request: MonsterDamageRequest): PetMonsterReceptionEffect {
  if (context.protected) return rejectPetMonsterReception(pet, context.action);
  return receiveOwnedPetMonsterDamage(pet, runtime, readPetMonsterReceptionInput(pet, context), request);
}

/** Compatibility entry. Its caller owns current action/protection and applies the returned reaction. */
export function receiveOwnedPetMonsterDamage(pet: PetState, runtime: PetRuntimeModel, input: PetMonsterReceptionInput,
  request: MonsterDamageRequest): PetMonsterReceptionEffect {
  const hpBefore = pet.hp;
  const prepared = preparePetMonsterReception(pet, input, request);
  if (!prepared.missed && (prepared.accepted || prepared.returnVoid)) settleOwnedPetHpDamage(pet, prepared.amount);
  const result = finishPetMonsterReception(pet, input, request, prepared, hpBefore);
  if (result.registerReceiverId) (runtime.monsterHitIds ??= []).push(request.attackId);
  return result;
}

export type PetExperienceTarget =
  | { kind: 'hero'; ownerSlot: PlayerSlot }
  | { kind: 'pet'; ownerSlot: PlayerSlot; petId: string };

export type OwnedMonsterExperienceAward = {
  ownerSlot: PlayerSlot;
  experience: number;
};

export function applyOwnedPetDamageRedirect(
  rosters: PlayerPetRosters,
  ownerSlot: PlayerSlot,
  incomingDamage: number,
  onRedirect?: (result: ReturnType<typeof applyPetTurtleTxljOwnerDamage>) => void,
): number {
  const result = applyPetTurtleTxljOwnerDamage(
    rosters[ownerSlot],
    incomingDamage,
  );
  if (result.active) onRedirect?.(result);
  return result.ownerDamage;
}

/** Redirect only the accepted damage that reaches HP after hero defenses. */
export function applyOwnedHeroDamage(
  hero: HeroCombatModel,
  event: DamageEvent,
  timeMs: number,
  ownerSlot: PlayerSlot,
  rosters?: PlayerPetRosters,
  petRuntime?: PetRuntimeModel,
): boolean {
  return applyHeroDamage(hero, event, timeMs, rosters
    ? (amount) => applyOwnedPetDamageRedirect(rosters, ownerSlot, amount, (result) => {
      const pet = getActivePet(rosters[ownerSlot]);
      const feedback = hero.incomingFeedback;
      if (!pet || !feedback || !petRuntime || petRuntime.petId !== pet.id) return;
      recordIncomingDamageFeedback({ model: feedback.model, targetKind: 'pet', ownerSlot,
        targetId: pet.id, targetRuntimeId: petRuntime.runtimeKey ?? `${ownerSlot}:${pet.id}`,
        worldAnchor: () => ({ x: petRuntime.x, y: petRuntime.y }) }, {
        sourceId: event.sourceId, attackId: event.attackId, producerKind: 'turtle-transfer',
        occurredAtMs: event.occurredAtMs, settledAtMs: timeMs,
        settledDamage: result.petDamage, hpBefore: result.petHpBefore!, hpAfter: result.petHpAfter!,
      });
    })
    : undefined);
}

export function markOwnedPetSkillTriggered(
  rosters: PlayerPetRosters,
  ownerSlot: PlayerSlot,
): boolean {
  return markActivePetSkillTriggered(rosters[ownerSlot]);
}

export function claimMonsterExperienceForCurrentTarget(
  monster: Monster30Model,
  fallbackOwner?: PlayerSlot,
): OwnedMonsterExperienceAward | undefined {
  if (monster.experienceBinding) return undefined;
  if (monster.experienceAwardedTo || monster.experience <= 0) return undefined;
  const ownerSlot = monster.targetSlot ?? fallbackOwner;
  if (!ownerSlot) return undefined;
  monster.experienceAwardedTo = ownerSlot;
  return { ownerSlot, experience: monster.experience };
}

export function awardMonsterExperienceByTarget(
  rosters: PlayerPetRosters,
  target: PetExperienceTarget,
  monsterExperience: number,
): MonsterExperienceShareResult {
  const roster = rosters[target.ownerSlot];
  const normalizedExperience = Math.max(0, Math.floor(monsterExperience));
  if (target.kind === 'hero') {
    return awardMonsterExperienceWithCurrentPet(roster, normalizedExperience);
  }

  const pet = roster.pets.find((candidate) => candidate.id === target.petId);
  if (!pet) {
    return { heroExperience: 0, petExperience: 0 };
  }
  const petResult = addPetExperience(pet, normalizedExperience);
  roster.message = `${pet.displayName} 获得 ${normalizedExperience} 经验`;
  return {
    heroExperience: 0,
    petExperience: normalizedExperience,
    petResult,
  };
}
