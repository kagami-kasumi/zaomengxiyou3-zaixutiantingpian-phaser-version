// boundary: this bridge adapts the P2 hero and Phaser view to the shared pet
// runtime system. P2 combat/skills intentionally remain outside TASK-SLICE-080.
import {
  getActivePet,
} from './TestSceneSystems';
import { createPetView, type PetView } from './TestSceneViews';
import { updateOwnedPetSystem } from './TestScenePetMagicBridge';

export function updateP2PetSystem(this: any, deltaMs: number): void {
  const owner = this.playerViews.find((player: any) => player.slot === 'p2');
  this.p2PetRuntime = updateOwnedPetSystem({
    ownerSlot: 'p2',
    owner,
    roster: this.p2PetRoster,
    runtime: this.p2PetRuntime,
    targets: this.createPetSkillTargets(),
    projectiles: this.projectileSystem,
    deltaMs,
    syncView: (pet) => syncP2PetView.call(this, pet),
    destroyView: () => destroyP2PetView.call(this),
  });
}

export function syncP2PetView(this: any, activePet: NonNullable<ReturnType<typeof getActivePet>>): void {
  if (!this.p2PetRuntime) {
    destroyP2PetView.call(this);
    return;
  }
  if (!this.p2PetView) {
    this.p2PetView = createPetView(this, activePet, this.p2PetRuntime.x, this.p2PetRuntime.y) as PetView;
  }
  this.p2PetView.root.setPosition(this.p2PetRuntime.x, this.p2PetRuntime.y);
  this.p2PetView.root.setScale(this.p2PetRuntime.facingX < 0 ? -1 : 1, 1);
  this.p2PetView.body.setFillStyle(this.p2PetRuntime.state === 'warp' ? 0xf2c14e : 0x74c0fc, 0.9);
  this.p2PetView.ear.setFillStyle(0xf3f6ff, this.p2PetRuntime.state === 'follow' ? 0.7 : 0.45);
  this.p2PetView.label.setText(`P2 ${activePet.displayName} F${activePet.form} ${this.p2PetRuntime.state}`);
}

export function destroyP2PetView(this: any): void {
  if (!this.p2PetView) return;
  this.p2PetView.root.destroy(true);
  this.p2PetView = undefined;
}
