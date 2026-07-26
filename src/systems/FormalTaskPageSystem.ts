import { createSeedEquipmentRegistry, type EquipmentDefinition } from './EquipmentSystem';
import { createInventoryItemDefinitionRegistry } from './InventoryResourceCatalog';
import {
  claimTaskReward,
  createPartyTaskModel,
  DailyTaskDefinitions,
  encodePartyTaskModel,
  type PartyTaskModel,
} from './PartyTaskSystem';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV6,
  type LoadedGameState,
  type SaveStorage,
} from './SaveSystem';

export type FormalTaskTab = 'daily' | 'activity';
export type FormalTaskPageModel = {
  tab: FormalTaskTab;
  page: number;
  selectedRow?: number;
  selectedTaskId?: number;
  tasks: PartyTaskModel;
  sourceSave: GameSaveV6;
  restored: LoadedGameState;
  registry: Record<string, EquipmentDefinition>;
  message: string;
};

export function createFormalTaskPage(
  storage: SaveStorage,
  now = new Date(),
): FormalTaskPageModel | undefined {
  const sourceSave = loadActiveGame(storage);
  if (!sourceSave) return undefined;
  const registry = createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry());
  const tasks = createPartyTaskModel(now, sourceSave.partyTasks);
  const model: FormalTaskPageModel = {
    tab: 'daily',
    page: 1,
    tasks,
    sourceSave,
    restored: restoreGameState(sourceSave, registry),
    registry,
    message: '',
  };
  // 跨日本地日历日只在载入时重置，并立即固化到当前槽。
  if (sourceSave.partyTasks?.dateKey !== tasks.dateKey) persistFormalTaskPage(model, storage, now);
  return model;
}

export function setFormalTaskTab(model: FormalTaskPageModel, tab: FormalTaskTab): void {
  model.tab = tab;
  model.page = 1;
  model.message = '';
}

export function changeFormalTaskPage(model: FormalTaskPageModel, delta: number): void {
  const next = Math.min(getFormalTaskPageCount(model), Math.max(1, model.page + Math.sign(delta)));
  model.page = next;
  if (model.selectedRow !== undefined) {
    const sameRow = getFormalTaskVisibleDefinitions(model)[model.selectedRow];
    if (sameRow) model.selectedTaskId = sameRow.id;
  }
  model.message = '';
}

export function getFormalTaskPageCount(model: FormalTaskPageModel): number {
  return model.tab === 'daily' ? 9 : 1;
}

export function getFormalTaskVisibleDefinitions(model: FormalTaskPageModel) {
  if (model.tab === 'activity') return [];
  const start = (model.page - 1) * 5;
  return DailyTaskDefinitions.slice(start, start + 5);
}

export function selectFormalTaskRow(model: FormalTaskPageModel, row: number): boolean {
  if (!getFormalTaskVisibleDefinitions(model)[row]) return false;
  model.selectedRow = row;
  model.selectedTaskId = getFormalTaskVisibleDefinitions(model)[row]!.id;
  model.message = '';
  return true;
}

export function getSelectedFormalTask(model: FormalTaskPageModel) {
  const definition = model.selectedTaskId === undefined
    ? undefined
    : DailyTaskDefinitions[model.selectedTaskId - 1];
  if (!definition) return undefined;
  return {
    definition,
    state: model.tasks.daily[definition.id - 1]!,
  };
}

export function claimSelectedFormalTask(
  model: FormalTaskPageModel,
  storage: SaveStorage,
  random?: () => number,
  now = new Date(),
): boolean {
  const selected = getSelectedFormalTask(model);
  if (!selected) return false;
  const result = claimTaskReward({
    model: model.tasks,
    taskId: selected.definition.id,
    restored: model.restored,
    registry: model.registry,
    random,
  });
  model.message = result.message;
  if (!result.ok) return false;
  persistFormalTaskPage(model, storage, now);
  return true;
}

export function persistFormalTaskPage(
  model: FormalTaskPageModel,
  storage: SaveStorage,
  now = new Date(),
): boolean {
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
    partyTasks: encodePartyTaskModel(model.tasks),
    now,
  });
  const saved = saveActiveGame(storage, save);
  if (saved) model.sourceSave = save;
  return saved;
}
