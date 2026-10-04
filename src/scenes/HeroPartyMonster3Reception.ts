import type { HeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';
import type { PetCombatRuntime } from '../systems/PetCombatRuntime';
import type { PetState, PetRuntimeModel } from '../systems/PetTypes';
import { readPetReceptionBody } from '../systems/PetReceptionBodyOwner';
import { calculatePetQlfjCounterChance } from '../systems/PetSystem';
import { monster3AttackHits, type Monster3Attack, type Monster3ReceptionPair } from '../systems/Monster3AttackRuntime';
import { monster3TargetProfile } from '../systems/Monster3CollisionSystem';
import { readHeroMonsterReceptionInput, receiveHeroMonsterDamage } from '../systems/HeroMonsterDamageReception';
import { rejectPetMonsterReception } from '../systems/PetMonsterDamageReception';

/** Current formal-party owner adapters. GXP has no producer in this party;
 * ordinary protection, magic invulnerability and turtle links remain owned by
 * HeroCombatSystem. This does not infer GXP from monster reward fields. */
export function heroPartyMonster3Targets(model: HeroPartyRuntimeModel,
  runtimes: Readonly<Record<'p1' | 'p2', PetCombatRuntime>>,
  readPet: (slot: 'p1' | 'p2') => PetState | undefined,
  destroyed: () => boolean, attack: Monster3Attack,
  readCompatibility?: (slot: 'p1' | 'p2') => PetRuntimeModel | undefined): readonly Monster3ReceptionPair[] {
  return model.members.map(member => {
    const player = member.combat, slot = player.slot;
    const pet = readPet(slot), runtime = runtimes[slot];
    const snapshot = runtime.snapshot();
    const compatibility = readCompatibility?.(slot);
    const body = readPetReceptionBody(compatibility);
    const key = snapshot.runtime?.runtimeKey;
    const sessionTarget = pet && key && snapshot.runtime?.petId === pet.id
      ? runtime.currentMonsterReceptionTarget(key, () => pet.skills.includes('qlfj')
        ? calculatePetQlfjCounterChance(pet) : undefined) : undefined;
    const target = sessionTarget ?? (pet && compatibility && body && body.pet === pet
      ? body.target(() => !destroyed() && readCompatibility?.(slot) === compatibility && readPet(slot) === pet,
        () => pet.skills.includes('qlfj') ? calculatePetQlfjCounterChance(pet) : undefined) : undefined);
    return {
      hero: {
        ids: player.combat.monsterHitIds ??= [],
        receive: request => receiveHeroMonsterDamage(player.combat,
          readHeroMonsterReceptionInput(player, { gxp: false, protected: destroyed() }), {
            ...request, geometryHit: monster3AttackHits(attack, monster3TargetProfile(`Role${player.normalAttack.heroId}`),
              member.movement.x, member.movement.y),
          }),
      },
      pet: target && pet ? {
        ids: target.ids,
        receive: request => {
          const current = sessionTarget ? runtime.snapshot().runtime : readCompatibility?.(slot);
          const sourceName = pet.species === 'ufo' ? 'Kabu' : pet.species === 'tigress' ? 'Tiger'
            : `${pet.species[0]!.toUpperCase()}${pet.species.slice(1)}`;
          const valid = !destroyed() && readPet(slot) === pet && (sessionTarget
            ? current?.runtimeKey === key : current === compatibility);
          if (!valid) return rejectPetMonsterReception(pet, current?.state ?? 'dead');
          return target.receive({ ...request, geometryHit: monster3AttackHits(attack,
            monster3TargetProfile(`Pet${sourceName}${pet.form}`), current!.x, current!.y) });
        },
      } : undefined,
    };
  });
}
