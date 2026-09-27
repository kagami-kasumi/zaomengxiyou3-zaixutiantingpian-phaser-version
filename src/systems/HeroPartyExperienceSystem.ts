import type { HeroPartyRuntimeModel } from './HeroPartyRuntimeSystem';
import type { PlayerSlot } from './InputSystem';
import type { MonsterAttackTarget, MonsterExperienceHost } from './MonsterExperienceSystem';
import { awardStage1CombatPlayerExperience } from './Stage1CombatSystem';

/** References are owned by the existing party and survive slot changes until target cleanup. */
export function createHeroPartyExperience(
  model: HeroPartyRuntimeModel,
  currentPet: (slot: PlayerSlot) => MonsterAttackTarget | undefined,
  persist: () => void,
  awardHero?: (slot: PlayerSlot, amount: number) => void,
) {
  const heroes: readonly MonsterAttackTarget[] = model.members.map(member => Object.freeze({
    kind: 'hero' as const, ownerSlot: member.combat.slot,
    runtimeId: `${model.incoming.runtimeId}:${member.combat.slot}`,
    position: () => ({ x: member.movement.x, y: member.movement.y - 50 }),
    movementPosition: () => ({ x: member.movement.x, y: member.movement.y }),
    isDead: () => member.combat.combat.state === 'dead',
    isReadyToDestroy: () => model.destroyed,
    currentPet: () => currentPet(member.combat.slot),
    addExperience: (amount: number) => {
      if (awardHero) awardHero(member.combat.slot, amount);
      else awardStage1CombatPlayerExperience(member.combat, amount);
    },
  }));
  model.combat.experienceHeroes = heroes;
  return {
    heroes,
    bind: (monster: MonsterExperienceHost, experience: number): void => {
      monster.experienceBinding ??= { experience, settled: false, heroes: () => heroes, persist };
    },
  };
}
