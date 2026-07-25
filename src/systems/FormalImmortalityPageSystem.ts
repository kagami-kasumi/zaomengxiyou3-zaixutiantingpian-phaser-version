import { createSeedEquipmentRegistry, type EquipmentDefinition } from './EquipmentSystem';
import {
  canEatImmortality,
  craftImmortality,
  eatImmortality,
  getImmortalityEffectTotals,
  type ImmortalityPlayerState,
} from './ImmortalitySystem';
import { createInventoryItemDefinitionRegistry } from './InventoryResourceCatalog';
import type { PlayerSlot } from './InputSystem';
import { getPartyHeroId, getPartyPlayerSlots } from './PartyConfigurationSystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV6,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export type FormalImmortalityPageModel = {
  owner: PlayerSlot;
  exchangeTypeIndex?: number;
  message: string;
  sourceSave: GameSaveV6;
  restored: LoadedGameState;
  registry: Record<string, EquipmentDefinition>;
  visibleEatCells: boolean[][];
};

export function createFormalImmortalityPage(
  storage: SaveStorage,
): FormalImmortalityPageModel | undefined {
  const sourceSave = loadActiveGame(storage);
  if (!sourceSave) return undefined;
  const registry = createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry());
  const model: FormalImmortalityPageModel = {
    owner: sourceSave.party.playerCount === 2 ? 'p2' : 'p1',
    message: '',
    sourceSave,
    restored: restoreGameState(sourceSave, registry),
    registry,
    visibleEatCells: [],
  };
  refreshVisibleEatCells(model);
  return model;
}

export function getFormalImmortalityOwners(
  model: FormalImmortalityPageModel,
): readonly PlayerSlot[] {
  return getPartyPlayerSlots(model.sourceSave.party);
}

export function setFormalImmortalityOwner(
  model: FormalImmortalityPageModel,
  owner: PlayerSlot,
): boolean {
  if (getPartyHeroId(model.sourceSave.party, owner) === undefined) return false;
  model.owner = owner;
  model.exchangeTypeIndex = undefined;
  model.message = '';
  refreshVisibleEatCells(model);
  return true;
}

export function openFormalImmortalityExchange(
  model: FormalImmortalityPageModel,
  typeIndex: number,
): void {
  model.exchangeTypeIndex = Math.min(4, Math.max(0, Math.floor(typeIndex)));
  model.message = '';
}

export function closeFormalImmortalityExchange(model: FormalImmortalityPageModel): void {
  model.exchangeTypeIndex = undefined;
  model.message = '';
}

export function getFormalImmortalityPlayer(
  model: FormalImmortalityPageModel,
): LoadedPlayer1State {
  return model.owner === 'p1' ? model.restored.player1 : model.restored.player2;
}

export function getFormalImmortalityHeroId(
  model: FormalImmortalityPageModel,
  owner: PlayerSlot = model.owner,
): number | undefined {
  return getPartyHeroId(model.sourceSave.party, owner);
}

export function getFormalImmortalityEffectTotals(
  model: FormalImmortalityPageModel,
): number[] {
  return getImmortalityEffectTotals(getFormalImmortalityPlayer(model).immortalityFlags);
}

export function isFormalImmortalityEatVisible(
  model: FormalImmortalityPageModel,
  typeIndex: number,
  gradeIndex: number,
): boolean {
  return model.visibleEatCells[typeIndex]?.[gradeIndex] ?? false;
}

export function eatFormalImmortality(
  model: FormalImmortalityPageModel,
  storage: SaveStorage,
  typeIndex: number,
  gradeIndex: number,
): boolean {
  const player = getFormalImmortalityPlayer(model);
  const transactionPlayer = toPlayerState(model);
  const result = eatImmortality(
    transactionPlayer,
    model.registry,
    typeIndex,
    gradeIndex,
  );
  model.message = result.message;
  if (!result.ok) return false;
  player.soulCount = transactionPlayer.soulCount;
  persistFormalImmortalityPage(model, storage);
  refreshVisibleEatCells(model);
  return true;
}

export function craftFormalImmortality(
  model: FormalImmortalityPageModel,
  storage: SaveStorage,
  gradeIndex: number,
  random: () => number = Math.random,
): boolean {
  if (model.exchangeTypeIndex === undefined) return false;
  const result = craftImmortality(
    toPlayerState(model),
    model.registry,
    model.exchangeTypeIndex,
    gradeIndex,
    random,
  );
  model.message = result.message;
  if (!result.ok) return false;
  // Preserve the original root-page refresh defect: crafting updates inventory
  // and persistence, but does not reveal a new eat button until owner refresh.
  persistFormalImmortalityPage(model, storage);
  return true;
}

function toPlayerState(model: FormalImmortalityPageModel): ImmortalityPlayerState {
  const player = getFormalImmortalityPlayer(model);
  return {
    owner: model.owner,
    soulCount: player.soulCount,
    inventoryStore: player.inventoryStore,
    flags: player.immortalityFlags,
  };
}

function refreshVisibleEatCells(model: FormalImmortalityPageModel): void {
  const player = toPlayerState(model);
  model.visibleEatCells = Array.from({ length: 5 }, (_, typeIndex) =>
    Array.from({ length: 5 }, (_, gradeIndex) =>
      canEatImmortality(player, typeIndex, gradeIndex)));
}

function persistFormalImmortalityPage(
  model: FormalImmortalityPageModel,
  storage: SaveStorage,
): void {
  const { player1, player2 } = model.restored;
  const save = createGameSave({
    party: model.sourceSave.party,
    progression: player1.progression,
    soulCount: player1.soulCount,
    skillLoadout: player1.skillLoadout,
    skillLearning: player1.skillLearning,
    inventoryStore: player1.inventoryStore,
    immortalityFlags: player1.immortalityFlags,
    equipmentLoadout: player1.equipmentLoadout,
    petRoster: player1.petRoster,
    player2Progression: player2.progression,
    player2SoulCount: player2.soulCount,
    player2SkillLoadout: player2.skillLoadout,
    player2SkillLearning: player2.skillLearning,
    player2InventoryStore: player2.inventoryStore,
    player2ImmortalityFlags: player2.immortalityFlags,
    player2EquipmentLoadout: player2.equipmentLoadout,
    player2PetRoster: player2.petRoster,
    levelUnlockProgress: model.sourceSave.levelUnlockProgress,
  });
  saveActiveGame(storage, save);
  model.sourceSave = save;
}
