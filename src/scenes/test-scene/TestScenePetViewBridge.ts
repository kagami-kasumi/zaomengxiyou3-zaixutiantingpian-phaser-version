// boundary: pet view bridge owns Phaser presentation and target snapshots;
// combat scheduling and pet rules remain in their systems/bridges.
import { getActivePet, type PetSkillTarget } from './TestSceneSystems';
import { createPetView } from './TestSceneViews';

export function syncPetView(this: any, activePet: NonNullable<ReturnType<typeof getActivePet>>): void {
  if (!this.petRuntime) {
    this.destroyPetView();
    return;
  }
  if (!this.petView) {
    this.petView = createPetView(this, activePet, this.petRuntime.x, this.petRuntime.y);
  }
  this.petView.root.setPosition(this.petRuntime.x, this.petRuntime.y);
  this.petView.root.setScale(this.petRuntime.facingX < 0 ? -1 : 1, 1);
  this.petView.body.setFillStyle(this.petRuntime.state === 'warp' ? 0xf2c14e : 0x7ad7a8, 0.9);
  this.petView.ear.setFillStyle(0xf3f6ff, this.petRuntime.state === 'follow' ? 0.7 : 0.45);
  this.petView.label.setText(`${activePet.displayName} F${activePet.form} ${this.petRuntime.state}`);
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
