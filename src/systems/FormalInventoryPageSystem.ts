import {
  EquipmentSlotOrder,
  type InventoryUIState,
} from './EquipmentUISystem';
import { EquipmentSlotLabels, HeroNamesById, createSeedEquipmentRegistry, type EquipmentSlot } from './EquipmentSystem';
import {
  equipInventoryItem,
  getInventoryEntries,
  InventoryCategoryLabels,
  unequipInventorySlot,
  type InventoryCategory,
  type InventoryEntry,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV4,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export const FormalInventoryPageSize = 25;

export type FormalInventoryPageModel = {
  owner: PlayerSlot;
  activeCategory: InventoryCategory;
  pageIndex: number;
  selectedIndex: number;
  selectedSlotIndex: number;
  message: string;
  sourceSave: GameSaveV4;
  restored: LoadedGameState;
};

export function createFormalInventoryPage(
  storage: SaveStorage,
  owner: PlayerSlot,
): FormalInventoryPageModel | undefined {
  const save = loadActiveGame(storage);
  if (!save) return undefined;
  return {
    owner,
    activeCategory: 'equipment',
    pageIndex: 0,
    selectedIndex: 0,
    selectedSlotIndex: 0,
    message: '选择格子查看；装备可穿戴，槽位可卸下',
    sourceSave: save,
    restored: restoreGameState(save, createSeedEquipmentRegistry()),
  };
}

export function setFormalInventoryOwner(
  model: FormalInventoryPageModel,
  owner: PlayerSlot,
): void {
  model.owner = owner;
  model.pageIndex = 0;
  model.selectedIndex = 0;
  model.selectedSlotIndex = 0;
  model.message = `已切换 ${owner.toUpperCase()}`;
}

export function selectFormalInventoryCategory(
  model: FormalInventoryPageModel,
  category: InventoryCategory,
): void {
  model.activeCategory = category;
  model.pageIndex = 0;
  model.selectedIndex = 0;
  model.message = InventoryCategoryLabels[category];
}

export function changeFormalInventoryPage(
  model: FormalInventoryPageModel,
  direction: -1 | 1,
): void {
  const pageCount = getFormalInventoryPageCount(model);
  model.pageIndex = Math.min(pageCount - 1, Math.max(0, model.pageIndex + direction));
  model.selectedIndex = 0;
}

export function selectFormalInventoryEntry(
  model: FormalInventoryPageModel,
  pageEntryIndex: number,
): void {
  const entries = getFormalInventoryPageEntries(model);
  model.selectedIndex = Math.min(entries.length - 1, Math.max(0, pageEntryIndex));
}

export function selectFormalEquipmentSlot(
  model: FormalInventoryPageModel,
  slotIndex: number,
): void {
  model.selectedSlotIndex = Math.min(EquipmentSlotOrder.length - 1, Math.max(0, slotIndex));
}

export function equipFormalInventorySelection(
  model: FormalInventoryPageModel,
  storage: SaveStorage,
): boolean {
  const player = getFormalInventoryPlayer(model);
  const entry = getSelectedFormalInventoryEntry(model);
  if (!entry || entry.kind !== 'equipment') {
    model.message = '该物品没有已支持的穿戴行为';
    return false;
  }
  const result = equipInventoryItem(
    player.inventoryStore,
    player.equipmentLoadout,
    entry.instanceId,
    HeroNamesById[player.progression.heroId] ?? '',
  );
  model.message = result.message;
  if (result.ok) persistFormalInventoryPage(model, storage);
  clampPageAndSelection(model);
  return result.ok;
}

export function unequipFormalInventorySelection(
  model: FormalInventoryPageModel,
  storage: SaveStorage,
): boolean {
  const player = getFormalInventoryPlayer(model);
  const slot = EquipmentSlotOrder[model.selectedSlotIndex];
  const result = unequipInventorySlot(player.inventoryStore, player.equipmentLoadout, slot);
  model.message = result.message;
  if (result.ok) persistFormalInventoryPage(model, storage);
  return result.ok;
}

export function getFormalInventoryPlayer(model: FormalInventoryPageModel): LoadedPlayer1State {
  return model.owner === 'p1' ? model.restored.player1 : model.restored.player2;
}

export function getFormalInventoryPageEntries(model: FormalInventoryPageModel): readonly InventoryEntry[] {
  const entries = getInventoryEntries(getFormalInventoryPlayer(model).inventoryStore, model.activeCategory);
  const start = model.pageIndex * FormalInventoryPageSize;
  return entries.slice(start, start + FormalInventoryPageSize);
}

export function getFormalInventoryPageCount(model: FormalInventoryPageModel): number {
  const count = getInventoryEntries(
    getFormalInventoryPlayer(model).inventoryStore,
    model.activeCategory,
  ).length;
  return Math.max(1, Math.ceil(count / FormalInventoryPageSize));
}

export function getSelectedFormalInventoryEntry(
  model: FormalInventoryPageModel,
): InventoryEntry | undefined {
  return getFormalInventoryPageEntries(model)[model.selectedIndex];
}

export function getSelectedFormalEquipmentSlot(model: FormalInventoryPageModel): EquipmentSlot {
  return EquipmentSlotOrder[model.selectedSlotIndex];
}

export function formatFormalInventorySummary(model: FormalInventoryPageModel): string[] {
  const player = getFormalInventoryPlayer(model);
  const selected = getSelectedFormalInventoryEntry(model);
  const slot = getSelectedFormalEquipmentSlot(model);
  return [
    `${model.owner.toUpperCase()} · ${HeroNamesById[player.progression.heroId]} · Lv.${player.progression.level}`,
    `${InventoryCategoryLabels[model.activeCategory]} ${model.pageIndex + 1}/${getFormalInventoryPageCount(model)}`,
    selected ? `${selected.definition.name} ×${selected.quantity}\n${selected.definition.description}` : '当前分类没有物品',
    `装备槽：${EquipmentSlotLabels[slot]} · ${player.equipmentLoadout[slot]?.definition.name ?? '空'}`,
    model.message,
  ];
}

function persistFormalInventoryPage(model: FormalInventoryPageModel, storage: SaveStorage): void {
  const { player1, player2 } = model.restored;
  const save = createGameSave({
    progression: player1.progression,
    skillLoadout: player1.skillLoadout,
    skillLearning: player1.skillLearning,
    inventoryStore: player1.inventoryStore,
    equipmentLoadout: player1.equipmentLoadout,
    petRoster: player1.petRoster,
    player2Progression: player2.progression,
    player2SkillLoadout: player2.skillLoadout,
    player2SkillLearning: player2.skillLearning,
    player2InventoryStore: player2.inventoryStore,
    player2EquipmentLoadout: player2.equipmentLoadout,
    player2PetRoster: player2.petRoster,
    levelUnlockProgress: model.sourceSave.levelUnlockProgress,
  });
  saveActiveGame(storage, save);
  model.sourceSave = save;
}

function clampPageAndSelection(model: FormalInventoryPageModel): void {
  model.pageIndex = Math.min(model.pageIndex, getFormalInventoryPageCount(model) - 1);
  const entries = getFormalInventoryPageEntries(model);
  model.selectedIndex = entries.length === 0
    ? 0
    : Math.min(entries.length - 1, Math.max(0, model.selectedIndex));
}

// Compile-time bridge to the existing UI state contract without importing scene code.
export function toInventoryUIState(model: FormalInventoryPageModel): InventoryUIState {
  return {
    isOpen: true,
    activeCategory: model.activeCategory,
    focus: 'inventory',
    selectedIndex: model.pageIndex * FormalInventoryPageSize + model.selectedIndex,
    selectedSlotIndex: model.selectedSlotIndex,
    message: model.message,
  };
}
