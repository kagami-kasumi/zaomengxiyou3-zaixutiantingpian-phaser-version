import type Phaser from 'phaser';
import type { HeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';
import type { PetRoster, PetRuntimeModel, PetSkillTarget } from '../systems/PetTypes';
import type { ProjectileSystemModel } from '../systems/ProjectileTypes';
import { petReceptionBodyForm } from '../systems/PetReceptionBodyOwner';
import { releaseCompatibilityPet } from '../systems/PetReceptionCompatibilitySystem';
import { readLegacyPetExperience } from '../systems/PetExperienceTargetSystem';
import { updateOwnedPetSystem } from './test-scene/TestScenePetMagicBridge';
import { createPetView, syncPetViewPresentation, type PetView } from './test-scene/TestSceneViews';

/** Formal levels use the same compatibility update/HP owner as TestScene.
 * This adapter owns only per-slot runtime/view references and their lifetime.
 */
export function createHeroPartyCompatibilityPets(scene: Phaser.Scene) {
  const entries: Partial<Record<'p1' | 'p2', { runtime?: PetRuntimeModel; view?: PetView }>> = {};
  function clear(slot: 'p1' | 'p2') {
    const entry = entries[slot];
    if (!entry) return;
    releaseCompatibilityPet(entry.runtime);
    entry.view?.root.destroy(true);
    delete entries[slot];
  }
  return {
    runtime: (slot: 'p1' | 'p2') => entries[slot]?.runtime,
    experience: (slot: 'p1' | 'p2') => readLegacyPetExperience(entries[slot]?.runtime),
    update(member: HeroPartyRuntimeModel['members'][number], roster: PetRoster | undefined,
      frame: Readonly<{ targets: readonly PetSkillTarget[]; projectiles: ProjectileSystemModel; deltaMs: number }>) {
      const slot = member.combat.slot;
      const selected = roster?.pets.find(pet => pet.isActive);
      if (!roster || !selected || !petReceptionBodyForm(selected)) { clear(slot); return; }
      const entry = entries[slot] ??= {};
      const destroyView = () => { entry.view?.root.destroy(true); entry.view = undefined; };
      const owner = { movement: member.movement, combat: member.combat.combat,
        skill: member.combat.skill, baseStats: member.combat.effectiveStats };
      entry.runtime = updateOwnedPetSystem({ ownerSlot: slot, owner, roster,
        runtime: entry.runtime, targets: [...frame.targets], projectiles: frame.projectiles,
        deltaMs: frame.deltaMs, hostFps: scene.game.loop.targetFps, destroyView,
        syncView: (pet, runtime) => {
          entry.runtime = runtime;
          entry.view ??= createPetView(scene, pet, runtime.x, runtime.y);
          syncPetViewPresentation(scene, entry.view, pet, runtime, frame.projectiles.projectiles,
            slot === 'p2' ? 'P2' : undefined);
        },
      });
    },
    destroy() { clear('p1'); clear('p2'); },
  };
}
