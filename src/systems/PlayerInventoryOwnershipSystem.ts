import type { EquipmentDefinition, EquipmentLoadout } from './EquipmentSystem';
import { createEmptyEquipmentLoadout } from './EquipmentSystem';
import type { InventoryStore } from './InventorySystem';
import {
  consumeStackByFillName,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';
import type { InventoryUIState } from './EquipmentUISystem';
import { createInventoryUIState, getSelectedInventoryEntry } from './EquipmentUISystem';
import type { MagicWeaponModel } from './MagicWeaponSystem';
import { createMagicWeaponModel, syncMagicWeaponFromLoadout } from './MagicWeaponSystem';
import { isPetConsumableFillName, usePetConsumable } from './PetConsumableSystem';
import { createMagicBottleCaptureModel } from './PetMagicBottleSystem';
import type { MagicBottleCaptureModel, PetRoster } from './PetTypes';
import {
  createCraftingSession,
  createSeedCraftingItemDefinitions,
  type CraftingSession,
} from './CraftingSystem';
import { createCraftingAcceptanceInventoryStore } from './CraftingItemDefinitionRegistry';

export type PlayerInventoryRuntime = {
  ownerSlot: PlayerSlot;
  store: InventoryStore;
  loadout: EquipmentLoadout;
  ui: InventoryUIState;
  magicWeapon: MagicWeaponModel;
  magicWeaponSoul: number;
  magicBottle: MagicBottleCaptureModel;
  craftingSession: CraftingSession;
};

export type PlayerInventoryRuntimes = Record<PlayerSlot, PlayerInventoryRuntime>;

export const InventoryOwnerKeyCodes = {
  p1Panel: 67,
  p2Panel: 111,
  p1MagicWeapon: 72,
  p2MagicWeapon: 103,
} as const;

export function createPlayerInventoryRuntimes(
  equipmentRegistry: Record<string, EquipmentDefinition>,
): PlayerInventoryRuntimes {
  return {
    p1: createPlayerInventoryRuntime('p1', equipmentRegistry),
    p2: createPlayerInventoryRuntime('p2', equipmentRegistry),
  };
}

export function getPlayerInventoryRuntime(
  runtimes: PlayerInventoryRuntimes,
  ownerSlot: PlayerSlot,
): PlayerInventoryRuntime {
  return runtimes[ownerSlot];
}

export function toggleInventoryForOwner(
  runtimes: PlayerInventoryRuntimes,
  currentOwner: PlayerSlot,
  requestedOwner: PlayerSlot,
): { ownerSlot: PlayerSlot; isOpen: boolean } {
  const wasOpen = runtimes[requestedOwner].ui.isOpen;
  runtimes.p1.ui.isOpen = false;
  runtimes.p2.ui.isOpen = false;
  const shouldOpen = currentOwner !== requestedOwner || !wasOpen;
  runtimes[requestedOwner].ui.isOpen = shouldOpen;
  return { ownerSlot: requestedOwner, isOpen: shouldOpen };
}

export function useOwnedPetConsumable(params: {
  runtime: PlayerInventoryRuntime;
  roster: PetRoster;
  random?: () => number;
}): { handled: boolean; rebuildRuntime: boolean; message: string } {
  const selected = getSelectedInventoryEntry(params.runtime.ui, params.runtime.store);
  if (
    params.runtime.ui.activeCategory !== 'items' ||
    !selected ||
    selected.kind !== 'stack' ||
    !isPetConsumableFillName(selected.definition.fillName)
  ) {
    return { handled: false, rebuildRuntime: false, message: '' };
  }

  const result = usePetConsumable(params.roster, selected.definition.fillName, params.random);
  if (!result.shouldConsume) {
    params.runtime.ui.message = result.message;
    return {
      handled: true,
      rebuildRuntime: result.rebuildRuntime ?? false,
      message: result.message,
    };
  }

  const consume = consumeStackByFillName(
    params.runtime.store,
    selected.definition.fillName,
    1,
  );
  const message = consume.ok
    ? `${consume.message}；${result.message}`
    : consume.message;
  params.runtime.ui.message = message;
  return {
    handled: true,
    rebuildRuntime: result.rebuildRuntime ?? false,
    message,
  };
}

function createPlayerInventoryRuntime(
  ownerSlot: PlayerSlot,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): PlayerInventoryRuntime {
  Object.assign(equipmentRegistry, createSeedCraftingItemDefinitions(equipmentRegistry));
  const loadout = createEmptyEquipmentLoadout();
  const xhhl = equipmentRegistry.xhhl;
  if (xhhl) {
    loadout.magicWeapon = {
      kind: 'equipment',
      instanceId: `${ownerSlot}-seed-equipped-xhhl`,
      definition: xhhl,
      quantity: 1,
    };
  }
  const magicWeapon = createMagicWeaponModel();
  syncMagicWeaponFromLoadout(magicWeapon, loadout);
  return {
    ownerSlot,
    store: createCraftingAcceptanceInventoryStore(equipmentRegistry, `${ownerSlot}-eq`),
    loadout,
    ui: createInventoryUIState(),
    magicWeapon,
    magicWeaponSoul: 5_000,
    magicBottle: createMagicBottleCaptureModel(),
    craftingSession: createCraftingSession(ownerSlot),
  };
}
