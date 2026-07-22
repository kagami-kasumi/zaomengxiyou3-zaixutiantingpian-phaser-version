import type Phaser from 'phaser';
import { getFormalMagicWeaponPlayer, type FormalMagicWeaponPageModel } from '../../systems/FormalMagicWeaponPageSystem';
import type { PlayerInventoryRuntimes } from '../../systems/PlayerInventoryOwnershipSystem';
import { syncMagicWeaponFromLoadout } from '../../systems/MagicWeaponSystem';

type PlayerLike = { slot: 'p1' | 'p2' };

type MagicWeaponRuntimeScene = Phaser.Scene & {
  playerInventoryRuntimes?: PlayerInventoryRuntimes;
  inventoryStore?: PlayerInventoryRuntimes['p1']['store'];
  getPlayers?: () => readonly PlayerLike[];
  syncPlayerEffectiveStats?: (player: PlayerLike, options?: { refill?: boolean }) => void;
  refreshPlayerHeroView?: (player: PlayerLike) => void;
};

export const FormalMagicWeaponUpdatedEvent = 'feature-ui-magic-weapon-updated';

export function syncFormalMagicWeaponRuntime(
  origin: Phaser.Scene,
  model: FormalMagicWeaponPageModel,
): void {
  const playerState = getFormalMagicWeaponPlayer(model);
  const runtime = origin as MagicWeaponRuntimeScene;
  const ownerRuntime = runtime.playerInventoryRuntimes?.p1;
  if (ownerRuntime) {
    ownerRuntime.store = playerState.inventoryStore;
    ownerRuntime.loadout = playerState.equipmentLoadout;
    ownerRuntime.magicWeaponSoul = playerState.skillLearning.soulCount;
    syncMagicWeaponFromLoadout(ownerRuntime.magicWeapon, ownerRuntime.loadout);
    runtime.inventoryStore = playerState.inventoryStore;
  }
  const player = runtime.getPlayers?.().find((candidate) => candidate.slot === 'p1');
  if (player) {
    runtime.syncPlayerEffectiveStats?.(player);
    runtime.refreshPlayerHeroView?.(player);
  }
  origin.events.emit(FormalMagicWeaponUpdatedEvent, {
    owner: 'p1',
    equipmentLoadout: playerState.equipmentLoadout,
    soul: playerState.skillLearning.soulCount,
  });
}
