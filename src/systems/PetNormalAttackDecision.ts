import type { PetBehaviorContext } from './PetBehavior';

/** Incoming QLFJ selection. Ordinary AI phase/chance belong to the ground Session. */
export class PetNormalAttackDecision {
  counter(context: PetBehaviorContext): boolean {
    // PetInfo.getPetHarmObj applies the shared 1.05 factor after its switch.
    return context.pet.skills.includes('qlfj')
      && context.random() <= (0.05 + context.pet.form / 100) * context.pet.warpower * 1.05;
  }

}
