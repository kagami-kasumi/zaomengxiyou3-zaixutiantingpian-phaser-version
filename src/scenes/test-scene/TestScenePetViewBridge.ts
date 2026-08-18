// boundary: pet view bridge owns Phaser presentation and target snapshots;
// combat scheduling and pet rules remain in their systems/bridges.
import { getActivePet, type PetSkillTarget } from './TestSceneSystems';
import { createPetView, petViewMatchesPet, syncPetViewPresentation } from './TestSceneViews';

export function syncPetView(this: any, activePet: NonNullable<ReturnType<typeof getActivePet>>): void {
  if (!this.petRuntime) {
    this.destroyPetView();
    return;
  }
  if (this.petView && !petViewMatchesPet(this.petView, activePet)) {
    this.petView.root.destroy(true);
    this.petView = undefined;
  }
  if (!this.petView) {
    this.petView = createPetView(this, activePet, this.petRuntime.x, this.petRuntime.y);
  }
  syncPetViewPresentation(
    this,
    this.petView,
    activePet,
    this.petRuntime,
    this.projectileSystem.projectiles,
  );
}

export function destroyPetView(this: any): void {
  if (!this.petView) return;
  this.petView.root.destroy(true);
  this.petView = undefined;
}

export function createPetSkillTargets(this: any): PetSkillTarget[] {
  return this.monster30s.map((monster: any) => ({
    id: monster.id,
    x: monster.x,
    y: monster.y,
    isAlive: monster.state !== 'dead' && monster.state !== 'removed',
  }));
}
