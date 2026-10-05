import type { HeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';
import type { PetCombatRuntime } from '../systems/PetCombatRuntime';

/** Bind the existing HP owner to the existing per-slot pet release services. */
export function bindHeroPartyPetRetirement(model: HeroPartyRuntimeModel,
  runtimes: Readonly<Record<'p1' | 'p2', PetCombatRuntime>>,
  clearSlot: (slot: 'p1' | 'p2') => void): () => void {
  const bindings = model.members.map(member => {
    const hero = member.combat.combat, slot = member.combat.slot;
    const release = () => {
      runtimes[slot].releaseOwner();
      clearSlot(slot);
    };
    hero.onDeath = release;
    return { hero, release };
  });
  return () => {
    for (const { hero, release } of bindings) if (hero.onDeath === release) hero.onDeath = undefined;
  };
}
