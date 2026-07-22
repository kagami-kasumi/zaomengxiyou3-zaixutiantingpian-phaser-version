import {
  closeCraftingSession,
  craftStagedSession,
  createCraftingSession,
  removeStagedCraftingMaterial,
  stageCraftingMaterial,
  type CraftingSession,
} from './CraftingSystem';
import { createSeedEquipmentRegistry, type EquipmentDefinition } from './EquipmentSystem';
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
import { InventoryCategories, type InventoryEntry } from './InventorySystem';
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

export type FormalWorkshopTab = 'strength' | 'fusion' | 'resolution' | 'making';
export const FormalWorkshopPageSize = 10;

export type FormalWorkshopPageModel = {
  owner: PlayerSlot;
  tab: FormalWorkshopTab;
  inventoryPage: number;
  selectedInventoryIndex: number;
  message: string;
  sourceSave: GameSaveV4;
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
  const equipmentRegistry = createSeedEquipmentRegistry();
  const registry = createEquipmentMakingDefinitionRegistry(equipmentRegistry);
  return {
    owner,
    tab: 'strength',
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

export function setFormalWorkshopOwner(model: FormalWorkshopPageModel, owner: PlayerSlot): void {
  if (owner === model.owner) return;
  closeCurrentStrengthening(model);
  closeCurrentFusion(model);
  closeCurrentResolution(model);
  closeCurrentMaking(model);
  model.owner = owner;
  model.tab = 'strength';
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
  const pageCount = Math.max(1, Math.ceil(getFormalWorkshopEntries(model).length / FormalWorkshopPageSize));
  model.inventoryPage = Math.max(0, Math.min(pageCount - 1, Math.trunc(page)));
  model.selectedInventoryIndex = model.inventoryPage * FormalWorkshopPageSize;
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
    soul: player.skillLearning.soulCount,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  player.skillLearning.soulCount = result.soulAfter;
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
    soul: player.skillLearning.soulCount,
  });
  model.message = result.message;
  if (!result.ok) return false;
  player.skillLearning.soulCount = result.soulAfter;
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
    soul: player.skillLearning.soulCount,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  player.skillLearning.soulCount = result.soulAfter;
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
    soul: player.skillLearning.soulCount,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  player.skillLearning.soulCount = result.soulAfter;
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
  return ({ strength: '强化', fusion: 'Fusion', resolution: '分解', making: '制作' } as const)[tab];
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
