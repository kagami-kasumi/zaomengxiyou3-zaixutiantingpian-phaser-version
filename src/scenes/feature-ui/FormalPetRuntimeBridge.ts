import type Phaser from 'phaser';
import { getFormalPetPlayer, type FormalPetPageModel } from '../../systems/FormalPetPageSystem';
import type { PlayerPetRosters } from '../../systems/PetOwnershipSystem';
import type { PetRoster, PetRuntimeModel } from '../../systems/PetTypes';

type PetViewLike = { root: { destroy: (fromScene?: boolean) => void } };

type PetRuntimeScene = Phaser.Scene & {
  playerPetRosters?: PlayerPetRosters;
  petRoster?: PetRoster;
  p2PetRoster?: PetRoster;
  petRuntime?: PetRuntimeModel;
  p2PetRuntime?: PetRuntimeModel;
  petView?: PetViewLike;
  p2PetView?: PetViewLike;
  destroyPetView?: () => void;
};

export const FormalPetsUpdatedEvent = 'feature-ui-pets-updated';

export function syncFormalPetRuntime(origin: Phaser.Scene, model: FormalPetPageModel): void {
  const roster = getFormalPetPlayer(model).petRoster;
  const runtime = origin as PetRuntimeScene;
  if (runtime.playerPetRosters) runtime.playerPetRosters[model.owner] = roster;
  if (model.owner === 'p1') {
    runtime.petRoster = roster;
    runtime.petRuntime = undefined;
    runtime.destroyPetView?.();
  } else {
    runtime.p2PetRoster = roster;
    runtime.p2PetRuntime = undefined;
    runtime.p2PetView?.root.destroy(true);
    runtime.p2PetView = undefined;
  }
  origin.events.emit(FormalPetsUpdatedEvent, { owner: model.owner, roster });
}
