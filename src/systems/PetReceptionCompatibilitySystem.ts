import { attachPetReceptionBody, readPetReceptionBody } from './PetReceptionBodyOwner';
import { bindLegacyPetExperience, readLegacyPetExperience, retireLegacyPetExperience } from './PetExperienceTargetSystem';
import type { PetRoster, PetRuntimeModel, PetState } from './PetTypes';
import type { PlayerSlot } from './InputSystem';
import type { ProjectileSystemModel } from './ProjectileTypes';
import { recordIncomingDamageFeedback, type IncomingDamageFeedbackTarget } from './IncomingDamageFeedbackSystem';

/** Bind existing compatibility storage and exact projectile owner identity. */
export function prepareCompatibilityPetReception(pet: PetState, runtime: PetRuntimeModel,
  roster: PetRoster, slot: PlayerSlot, projectiles: ProjectileSystemModel, destroyView: () => void,
  changed?: () => void, feedback?: IncomingDamageFeedbackTarget) {
  const source = bindLegacyPetExperience(runtime, roster, slot);
  // Experience binding preserves the existing roster object's identity.
  const current = roster.pets.find(candidate => candidate.id === runtime.petId)!;
  if (current.species !== pet.species || current.form !== pet.form) throw new Error('Compatibility pet identity changed during binding');
  return attachPetReceptionBody(current, runtime, {
    changed,
    settled: (request, result) => {
      if (!feedback) return;
      recordIncomingDamageFeedback({ ...feedback, targetKind: 'pet', targetId: current.id,
        targetRuntimeId: runtime.runtimeKey, worldAnchor: () => ({ x: runtime.x, y: runtime.y }) }, {
        sourceId: request.sourceId, attackId: request.attackId, producerKind: 'pet-reduce-hp',
        occurredAtMs: request.timeMs, settledAtMs: request.timeMs, settledDamage: result.amount,
        hpBefore: result.hpBefore, hpAfter: result.hpAfter,
      });
    },
    setStatic: () => { runtime.state = 'idle'; },
    cleanup: kind => {
      const skills = current.skillState;
      if (!skills) return;
      if (kind === 'tiger-combo') skills.tiger4Bhaoyi.comboStep = 0;
      if (kind === 'mouse-combo') skills.mouse4Zsaoyi.comboStep = 0;
      // Phoenix doWhenAoyiOver restores attackBackInfoDict, not fireImbueActive.
      // The compatibility skill implementation has no mutable attack dictionary;
      // its existing static descriptors already remain in their ordinary state.
    },
    release: () => {
      for (const projectile of projectiles.projectiles) {
        if (projectile.experienceSource !== source) continue;
        projectile.isExpired = true;
        projectile.experienceSource = undefined;
      }
      retireLegacyPetExperience(runtime);
      destroyView();
    },
  });
}

export function releaseCompatibilityPet(runtime: PetRuntimeModel | undefined,
  reason: 'replaced' | 'owner-exit' = 'owner-exit'): void {
  if (!runtime) return;
  readPetReceptionBody(runtime)?.release(reason);
  if (readLegacyPetExperience(runtime)) retireLegacyPetExperience(runtime);
}
