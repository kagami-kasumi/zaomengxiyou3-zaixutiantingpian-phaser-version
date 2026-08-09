import {
  closeCraftingSession,
  craftStagedSession,
  createCraftingSession,
  removeStagedCraftingMaterial,
  stageCraftingMaterial,
  type CraftingSession,
} from './CraftingSystem';
import { createSeedEquipmentRegistry, type EquipmentDefinition } from './EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from './InventoryResourceCatalog';
import {
  closeEquipmentStrengtheningSession,
  createEquipmentStrengtheningSession,
  stageEquipmentStrengtheningEntry,
  submitEquipmentStrengthening,
  type EquipmentStrengtheningSession,
} from './EquipmentStrengtheningSystem';
import {
  closeEquipmentResolutionSession,
  createEquipmentResolutionSession,
  stageEquipmentResolutionTarget,
  submitEquipmentResolution,
  type EquipmentResolutionSession,
} from './EquipmentResolutionSystem';
import { createEquipmentMakingDefinitionRegistry } from './EquipmentMakingRegistry';
import {
  closeEquipmentMakingSession,
  createEquipmentMakingSession,
  stageEquipmentMakingEntry,
  submitEquipmentMaking,
  type EquipmentMakingSession,
} from './EquipmentMakingSystem';
import {
  InventoryCategories,
  type InventoryCategory,
  type InventoryEntry,
} from './InventorySystem';
import type { PlayerSlot } from './InputSystem';
import { spendPlayerSouls } from './PlayerSoulSystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV6,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export type FormalWorkshopTab = 'strength' | 'fusion' | 'resolution' | 'making';
export const FormalWorkshopPageSize = 25;
export const FormalWorkshopPageCount = 5;

export type FormalWorkshopPageModel = {
  owner: PlayerSlot;
  tab: FormalWorkshopTab;
  activeCategory: InventoryCategory;
  inventoryPage: number;
  selectedInventoryIndex: number;
  message: string;
  sourceSave: GameSaveV6;
  restored: LoadedGameState;
  registry: Record<string, EquipmentDefinition>;
  strengtheningSessions: Record<PlayerSlot, EquipmentStrengtheningSession>;
  resolutionSessions: Record<PlayerSlot, EquipmentResolutionSession>;
  makingSessions: Record<PlayerSlot, EquipmentMakingSession>;
  fusionSessions: Record<PlayerSlot, CraftingSession>;
};

export function createFormalWorkshopPage(storage: SaveStorage, owner: PlayerSlot): FormalWorkshopPageModel | undefined {
  const sourceSave = loadActiveGame(storage);
  if (!sourceSave) return undefined;
  const equipmentRegistry = createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry());
  const registry = createEquipmentMakingDefinitionRegistry(equipmentRegistry);
  return {
    owner,
    tab: 'strength',
    activeCategory: 'equipment',
    inventoryPage: 0,
    selectedInventoryIndex: 0,
    message: '请选择装备与至少一颗强化石',
    sourceSave,
    restored: restoreGameState(sourceSave, registry),
    registry,
    strengtheningSessions: {
      p1: createEquipmentStrengtheningSession('p1'),
      p2: createEquipmentStrengtheningSession('p2'),
    },
    resolutionSessions: {
      p1: createEquipmentResolutionSession('p1'),
      p2: createEquipmentResolutionSession('p2'),
    },
    makingSessions: {
      p1: createEquipmentMakingSession('p1'),
      p2: createEquipmentMakingSession('p2'),
    },
    fusionSessions: { p1: createCraftingSession('p1'), p2: createCraftingSession('p2') },
  };
}

export function getFormalWorkshopPlayer(model: FormalWorkshopPageModel): LoadedPlayer1State {
  return model.owner === 'p1' ? model.restored.player1 : model.restored.player2;
}

export function getFormalWorkshopEntries(model: FormalWorkshopPageModel): InventoryEntry[] {
  const player = getFormalWorkshopPlayer(model);
  return [
    ...InventoryCategories.flatMap((category) => player.inventoryStore.categories[category]),
    ...Object.values(player.equipmentLoadout).filter((entry): entry is NonNullable<typeof entry> => entry !== null),
  ];
}

export function getFormalWorkshopGridEntries(model: FormalWorkshopPageModel): readonly InventoryEntry[] {
  return getFormalWorkshopPlayer(model).inventoryStore.categories[model.activeCategory];
}

export function getFormalWorkshopGridPageEntries(model: FormalWorkshopPageModel): readonly InventoryEntry[] {
  const start = model.inventoryPage * FormalWorkshopPageSize;
  return getFormalWorkshopGridEntries(model).slice(start, start + FormalWorkshopPageSize);
}

export function getFormalWorkshopGridSelectedIndex(model: FormalWorkshopPageModel): number | undefined {
  const selected = getFormalWorkshopEntries(model)[model.selectedInventoryIndex];
  const pageIndex = getFormalWorkshopGridPageEntries(model).indexOf(selected);
  return pageIndex < 0 ? undefined : pageIndex;
}

export function selectFormalWorkshopCategory(
  model: FormalWorkshopPageModel,
  category: InventoryCategory,
): void {
  model.activeCategory = category;
  model.inventoryPage = 0;
  selectFirstFormalWorkshopGridEntry(model);
}

export function selectFormalWorkshopGridEntry(
  model: FormalWorkshopPageModel,
  pageEntryIndex: number,
): boolean {
  const entry = getFormalWorkshopGridPageEntries(model)[pageEntryIndex];
  if (!entry) {
    model.message = '当前背包格为空';
    return false;
  }
  const inventoryIndex = getFormalWorkshopEntries(model).indexOf(entry);
  if (inventoryIndex < 0) return false;
  selectFormalWorkshopEntry(model, inventoryIndex);
  return true;
}

export function setFormalWorkshopOwner(model: FormalWorkshopPageModel, owner: PlayerSlot): void {
  if (owner === model.owner) return;
  closeCurrentStrengthening(model);
  closeCurrentFusion(model);
  closeCurrentResolution(model);
  closeCurrentMaking(model);
  model.owner = owner;
  model.tab = 'strength';
  model.activeCategory = 'equipment';
  model.inventoryPage = 0;
  model.selectedInventoryIndex = 0;
  model.message = `已切换 ${owner.toUpperCase()}；上一位玩家的暂存材料已返还`;
}

export function setFormalWorkshopTab(model: FormalWorkshopPageModel, tab: FormalWorkshopTab): void {
  if (model.tab === 'strength' && tab !== 'strength') closeCurrentStrengthening(model);
  if (model.tab === 'fusion' && tab !== 'fusion') closeCurrentFusion(model);
  if (model.tab === 'resolution' && tab !== 'resolution') closeCurrentResolution(model);
  if (model.tab === 'making' && tab !== 'making') closeCurrentMaking(model);
  model.tab = tab;
  model.inventoryPage = 0;
  model.message = tab === 'strength'
    ? model.strengtheningSessions[model.owner].message
    : tab === 'fusion'
      ? model.fusionSessions[model.owner].message
      : tab === 'resolution'
        ? model.resolutionSessions[model.owner].message
        : model.makingSessions[model.owner].message;
}

export function selectFormalWorkshopEntry(model: FormalWorkshopPageModel, index: number): void {
  const last = Math.max(0, getFormalWorkshopEntries(model).length - 1);
  model.selectedInventoryIndex = Math.max(0, Math.min(last, index));
}

export function setFormalWorkshopInventoryPage(model: FormalWorkshopPageModel, page: number): void {
  model.inventoryPage = Math.max(0, Math.min(FormalWorkshopPageCount - 1, Math.trunc(page)));
  selectFirstFormalWorkshopGridEntry(model);
}

function selectFirstFormalWorkshopGridEntry(model: FormalWorkshopPageModel): void {
  const entry = getFormalWorkshopGridPageEntries(model)[0];
  if (!entry) {
    model.selectedInventoryIndex = 0;
    return;
  }
  const index = getFormalWorkshopEntries(model).indexOf(entry);
  model.selectedInventoryIndex = Math.max(0, index);
}

export function stageFormalWorkshopStrengthening(model: FormalWorkshopPageModel): boolean {
  if (model.tab !== 'strength') return false;
  const player = getFormalWorkshopPlayer(model);
  const entry = getFormalWorkshopEntries(model)[model.selectedInventoryIndex];
  if (!entry) {
    model.message = '当前背包与装备栏没有可放入物品';
    return false;
  }
  const result = stageEquipmentStrengtheningEntry(
    model.strengtheningSessions[model.owner],
    player.inventoryStore,
    player.equipmentLoadout,
    entry,
  );
  model.message = model.strengtheningSessions[model.owner].message;
  return result;
}

export function withdrawFormalWorkshopStrengthening(model: FormalWorkshopPageModel): void {
  if (model.tab !== 'strength') return;
  const player = getFormalWorkshopPlayer(model);
  closeEquipmentStrengtheningSession(
    model.strengtheningSessions[model.owner],
    player.inventoryStore,
    player.equipmentLoadout,
  );
  model.message = model.strengtheningSessions[model.owner].message;
}

export function runFormalWorkshopStrengthening(
  model: FormalWorkshopPageModel,
  storage: SaveStorage,
  random: () => number = Math.random,
): boolean {
  if (model.tab !== 'strength') return false;
  const player = getFormalWorkshopPlayer(model);
  const result = submitEquipmentStrengthening({
    session: model.strengtheningSessions[model.owner],
    store: player.inventoryStore,
    loadout: player.equipmentLoadout,
    soul: player.soulCount,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  commitFormalWorkshopSoulSpend(player, result.soulBefore, result.soulAfter);
  persistFormalWorkshopPage(model, storage);
  return true;
}

export function stageFormalWorkshopFusion(model: FormalWorkshopPageModel): boolean {
  if (model.tab !== 'fusion') return false;
  const player = getFormalWorkshopPlayer(model);
  const entry = getFormalWorkshopEntries(model)[model.selectedInventoryIndex];
  const result = stageCraftingMaterial(model.fusionSessions[model.owner], player.inventoryStore, entry);
  model.message = result.message;
  return result.ok;
}

export function withdrawFormalWorkshopFusion(model: FormalWorkshopPageModel): boolean {
  if (model.tab !== 'fusion') return false;
  const player = getFormalWorkshopPlayer(model);
  const result = removeStagedCraftingMaterial(model.fusionSessions[model.owner], player.inventoryStore);
  model.message = result.message;
  return result.ok;
}

export function runFormalWorkshopFusion(model: FormalWorkshopPageModel, storage: SaveStorage): boolean {
  if (model.tab !== 'fusion') return false;
  const player = getFormalWorkshopPlayer(model);
  const result = craftStagedSession({
    session: model.fusionSessions[model.owner],
    store: player.inventoryStore,
    registry: model.registry,
    soul: player.soulCount,
  });
  model.message = result.message;
  if (!result.ok) return false;
  commitFormalWorkshopSoulSpend(player, result.soulBefore, result.soulAfter);
  persistFormalWorkshopPage(model, storage);
  return true;
}

export function stageFormalWorkshopResolution(model: FormalWorkshopPageModel): boolean {
  if (model.tab !== 'resolution') return false;
  const player = getFormalWorkshopPlayer(model);
  const entry = getFormalWorkshopEntries(model)[model.selectedInventoryIndex];
  const result = stageEquipmentResolutionTarget(
    model.resolutionSessions[model.owner],
    player.inventoryStore,
    player.equipmentLoadout,
    entry,
  );
  model.message = model.resolutionSessions[model.owner].message;
  return result;
}

export function withdrawFormalWorkshopResolution(model: FormalWorkshopPageModel): void {
  if (model.tab !== 'resolution') return;
  closeCurrentResolution(model);
}

export function runFormalWorkshopResolution(
  model: FormalWorkshopPageModel,
  storage: SaveStorage,
  random: () => number = Math.random,
): boolean {
  if (model.tab !== 'resolution') return false;
  const player = getFormalWorkshopPlayer(model);
  const result = submitEquipmentResolution({
    session: model.resolutionSessions[model.owner],
    store: player.inventoryStore,
    registry: model.registry,
    soul: player.soulCount,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  commitFormalWorkshopSoulSpend(player, result.soulBefore, result.soulAfter);
  persistFormalWorkshopPage(model, storage);
  return true;
}

export function stageFormalWorkshopMaking(model: FormalWorkshopPageModel): boolean {
  if (model.tab !== 'making') return false;
  const player = getFormalWorkshopPlayer(model);
  const entry = getFormalWorkshopEntries(model)[model.selectedInventoryIndex];
  const result = stageEquipmentMakingEntry(
    model.makingSessions[model.owner],
    player.inventoryStore,
    entry?.kind === 'stack' ? entry : undefined,
  );
  model.message = model.makingSessions[model.owner].message;
  return result;
}

export function withdrawFormalWorkshopMaking(model: FormalWorkshopPageModel): void {
  if (model.tab !== 'making') return;
  closeCurrentMaking(model);
}

export function runFormalWorkshopMaking(
  model: FormalWorkshopPageModel,
  storage: SaveStorage,
  random: () => number = Math.random,
): boolean {
  if (model.tab !== 'making') return false;
  const player = getFormalWorkshopPlayer(model);
  const result = submitEquipmentMaking({
    session: model.makingSessions[model.owner],
    store: player.inventoryStore,
    registry: model.registry,
    soul: player.soulCount,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  commitFormalWorkshopSoulSpend(player, result.soulBefore, result.soulAfter);
  persistFormalWorkshopPage(model, storage);
  return true;
}

export function closeFormalWorkshopPage(model: FormalWorkshopPageModel): void {
  closeCurrentStrengthening(model);
  closeCurrentFusion(model);
  closeCurrentResolution(model);
  closeCurrentMaking(model);
}

export function formatFormalWorkshopTab(tab: FormalWorkshopTab): string {
  return ({ strength: '强化', fusion: '合成', resolution: '分解', making: '打造' } as const)[tab];
}

function closeCurrentFusion(model: FormalWorkshopPageModel): void {
  const result = closeCraftingSession(model.fusionSessions[model.owner], getFormalWorkshopPlayer(model).inventoryStore);
  model.message = result.message;
}

function closeCurrentStrengthening(model: FormalWorkshopPageModel): void {
  const player = getFormalWorkshopPlayer(model);
  closeEquipmentStrengtheningSession(
    model.strengtheningSessions[model.owner],
    player.inventoryStore,
    player.equipmentLoadout,
  );
  model.message = model.strengtheningSessions[model.owner].message;
}

function closeCurrentResolution(model: FormalWorkshopPageModel): void {
  const player = getFormalWorkshopPlayer(model);
  closeEquipmentResolutionSession(
    model.resolutionSessions[model.owner],
    player.inventoryStore,
    player.equipmentLoadout,
  );
  model.message = model.resolutionSessions[model.owner].message;
}

function closeCurrentMaking(model: FormalWorkshopPageModel): void {
  closeEquipmentMakingSession(
    model.makingSessions[model.owner],
    getFormalWorkshopPlayer(model).inventoryStore,
  );
  model.message = model.makingSessions[model.owner].message;
}

function persistFormalWorkshopPage(model: FormalWorkshopPageModel, storage: SaveStorage): void {
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

function commitFormalWorkshopSoulSpend(
  player: LoadedPlayer1State,
  soulBefore: number,
  soulAfter: number,
): void {
  const cost = soulBefore - soulAfter;
  if (player.soulCount !== soulBefore || !spendPlayerSouls(player, cost).ok) {
    throw new Error('Formal workshop soul transaction violated the player owner contract');
  }
}
