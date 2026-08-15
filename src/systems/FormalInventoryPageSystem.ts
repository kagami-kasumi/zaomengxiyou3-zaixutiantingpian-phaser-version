import {
  EquipmentSlotOrder,
  type InventoryUIState,
} from './EquipmentUISystem';
import {
  EquipmentSlotLabels,
  HeroNamesById,
  calculateEffectiveStats,
  calculateEquipmentStats,
  canEquipInstance,
  createSeedEquipmentRegistry,
  type EquipmentSlot,
} from './EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from './InventoryResourceCatalog';
import { createEquipmentMakingDefinitionRegistry } from './EquipmentMakingRegistry';
import {
  equipInventoryItem,
  getInventoryEntries,
  InventoryCategoryLabels,
  unequipInventorySlot,
  type InventoryCategory,
  type InventoryEntry,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';
import { getHeroBaseStats, ProgressionTuning } from './ProgressionSystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV6,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export const FormalInventoryPageSize = 25;
export const FormalInventoryPageCount = 5;

export type FormalInventoryPageModel = {
  owner: PlayerSlot;
  activeCategory: InventoryCategory;
  pageIndex: number;
  selectedIndex: number;
  selectedSlotIndex: number;
  entrySelectionArmed: boolean;
  slotSelectionArmed: boolean;
  message: string;
  sourceSave: GameSaveV6;
  restored: LoadedGameState;
  registry: Record<string, ReturnType<typeof createSeedEquipmentRegistry>[string]>;
};

export type FormalInventoryRuntimePresentation = Readonly<{
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}>;

export type FormalInventoryPresentation = Readonly<{
  heroId: number;
  heroName: string;
  level: number;
  fightingForce: number;
  currentHp: number;
  currentMp: number;
  maxHp: number;
  maxMp: number;
  power: number;
  defense: number;
  critPercent: number;
  missPercent: number;
  hpRegen: number;
  mpRegen: number;
  magicDefensePercent: number;
  luckPercent: number;
  currentExp: number;
  expToNext: number;
  expFrame: number;
  maxLevel: boolean;
  soulCount: number;
}>;

export function createFormalInventoryPage(
  storage: SaveStorage,
  owner: PlayerSlot,
): FormalInventoryPageModel | undefined {
  const save = loadActiveGame(storage);
  if (!save) return undefined;
  const registry = createEquipmentMakingDefinitionRegistry(
    createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry()),
  );
  return {
    owner,
    activeCategory: 'equipment',
    pageIndex: 0,
    selectedIndex: 0,
    selectedSlotIndex: 0,
    entrySelectionArmed: false,
    slotSelectionArmed: false,
    message: '选择格子查看；装备可穿戴，槽位可卸下',
    sourceSave: save,
    restored: restoreGameState(save, registry),
    registry,
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
  model.entrySelectionArmed = false;
  model.slotSelectionArmed = false;
  model.message = `已切换 ${owner.toUpperCase()}`;
}

export function selectFormalInventoryCategory(
  model: FormalInventoryPageModel,
  category: InventoryCategory,
): void {
  model.activeCategory = category;
  model.pageIndex = 0;
  model.selectedIndex = 0;
  model.entrySelectionArmed = false;
  model.message = InventoryCategoryLabels[category];
}

export function changeFormalInventoryPage(
  model: FormalInventoryPageModel,
  direction: -1 | 1,
): void {
  const pageCount = getFormalInventoryPageCount(model);
  model.pageIndex = Math.min(pageCount - 1, Math.max(0, model.pageIndex + direction));
  model.selectedIndex = 0;
  model.entrySelectionArmed = false;
}

export function selectFormalInventoryEntry(
  model: FormalInventoryPageModel,
  pageEntryIndex: number,
): void {
  const entries = getFormalInventoryPageEntries(model);
  model.selectedIndex = Math.min(entries.length - 1, Math.max(0, pageEntryIndex));
  model.entrySelectionArmed = true;
}

export function selectFormalEquipmentSlot(
  model: FormalInventoryPageModel,
  slotIndex: number,
): void {
  model.selectedSlotIndex = Math.min(EquipmentSlotOrder.length - 1, Math.max(0, slotIndex));
  model.slotSelectionArmed = true;
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
  if (result.ok) {
    persistFormalInventoryPage(model, storage);
    clearFormalInventorySelection(model);
  }
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
  if (result.ok) {
    persistFormalInventoryPage(model, storage);
    clearFormalInventorySelection(model);
  }
  return result.ok;
}

function clearFormalInventorySelection(model: FormalInventoryPageModel): void {
  model.entrySelectionArmed = false;
  model.slotSelectionArmed = false;
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
  void model;
  return FormalInventoryPageCount;
}

export function getSelectedFormalInventoryEntry(
  model: FormalInventoryPageModel,
): InventoryEntry | undefined {
  return getFormalInventoryPageEntries(model)[model.selectedIndex];
}

export function getSelectedFormalEquipmentSlot(model: FormalInventoryPageModel): EquipmentSlot {
  return EquipmentSlotOrder[model.selectedSlotIndex];
}

export function canEquipFormalInventorySelection(model: FormalInventoryPageModel): boolean {
  const entry = getSelectedFormalInventoryEntry(model);
  if (!entry || entry.kind !== 'equipment') return false;
  const player = getFormalInventoryPlayer(model);
  return canEquipInstance(
    player.equipmentLoadout,
    entry,
    HeroNamesById[player.progression.heroId] ?? '',
  ) === true;
}

export function getFormalInventoryPresentation(
  model: FormalInventoryPageModel,
  runtime?: FormalInventoryRuntimePresentation,
): FormalInventoryPresentation {
  const player = getFormalInventoryPlayer(model);
  const progression = player.progression;
  const effective = calculateEffectiveStats(
    getHeroBaseStats(progression.heroId, progression.level),
    player.equipmentLoadout,
  );
  const maxLevel = progression.level >= ProgressionTuning.maxLevel;
  return {
    heroId: progression.heroId,
    heroName: HeroNamesById[progression.heroId] ?? `Role${progression.heroId}`,
    level: progression.level,
    fightingForce: calculateFormalFightingForce(player),
    currentHp: runtime?.hp ?? effective.maxHp,
    currentMp: runtime?.mp ?? effective.maxMp,
    maxHp: runtime?.maxHp ?? effective.maxHp,
    maxMp: runtime?.maxMp ?? effective.maxMp,
    power: effective.power,
    defense: effective.defense,
    critPercent: effective.critPercent,
    missPercent: effective.missPercent,
    hpRegen: effective.hpRegen,
    mpRegen: effective.mpRegen,
    magicDefensePercent: effective.magicDefensePercent,
    luckPercent: effective.piercePercent,
    currentExp: progression.currentExp,
    expToNext: progression.expToNext,
    expFrame: maxLevel
      ? 30
      : Math.max(1, Math.min(30, Math.round(30 * progression.currentExp / progression.expToNext))),
    maxLevel,
    soulCount: player.soulCount,
  };
}

function calculateFormalFightingForce(player: LoadedPlayer1State): number {
  const equipment = calculateEquipmentStats(player.equipmentLoadout);
  let result = player.progression.level * 15;
  player.skillLearning.passiveSkills.forEach((level, index) => {
    if (level === 0) return;
    if (index === 0 || index === 1) result += Math.trunc((level * 100 + 100) * 0.1);
    else if (index === 2) result += (level + 1) * 10;
    else result += (level + 1) * 15;
  });
  result += Math.trunc(equipment.power * 1.15);
  const crit = Math.trunc(equipment.critPercent);
  const hp = Math.trunc(equipment.maxHp * 120);
  const mp = Math.trunc(equipment.maxMp * 160);
  const magicDefense = Math.trunc(equipment.magicDefensePercent * 1.5);
  const miss = Math.trunc(equipment.missPercent * 1.5);
  const regen = Math.trunc(equipment.hpRegen * 10);
  switch (player.progression.heroId) {
    case 1: result += hp + mp + crit * 25; break;
    case 2: result += Math.trunc(mp * 4.5) + crit * 30 + hp; break;
    case 3: result += hp * 3 + magicDefense * 8 + crit * 10 + mp; break;
    case 4: result += crit * 20 + miss * 20 + mp + hp; break;
    case 5: result += mp + hp + Math.trunc(equipment.power * 1.15 * 0.2) + crit * 20; break;
  }
  return Math.trunc(result + regen);
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
    partyTasks: model.sourceSave.partyTasks,
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
