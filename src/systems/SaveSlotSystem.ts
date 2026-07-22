import { createSeedEquipmentRegistry } from './EquipmentSystem';
import { createHeroSkillModel } from './HeroSkillSystem';
import { createPlayerPetRosters } from './PetOwnershipSystem';
import { createHeroProgression } from './ProgressionSystem';
import { createPlayerInventoryRuntimes } from './PlayerInventoryOwnershipSystem';
import {
  createGameSave,
  GameSaveStorageKey,
  GameSaveVersion,
  loadGame,
  parseGameSave,
  saveGame,
  type GameSaveV4,
  type SaveStorage,
} from './SaveSystem';
import { createDefaultLevelUnlockProgress, sanitizeLevelUnlockProgress } from './Stage11FlowSystem';
import { createSkillLearningState } from './SkillUISystem';

export const SaveSlotCount = 6 as const;
export const SaveSlotStorageKeyPrefix = 'zaixu-tianding.save.slot.';
export const ActiveSaveSlotStorageKey = 'zaixu-tianding.save.active-slot';

export type SaveSlotId = 0 | 1 | 2 | 3 | 4 | 5;
export type SaveSlotStatus = 'empty' | 'valid' | 'corrupt';

export type SaveSlotSnapshot = {
  id: SaveSlotId;
  displayNumber: number;
  storageKey: string;
  status: SaveSlotStatus;
  save?: GameSaveV4;
  sourceVersion?: number;
};

export type LegacySingleSaveMigrationResult =
  | 'none'
  | 'slots-not-empty'
  | 'imported'
  | 'legacy-corrupt';

export function getSaveSlotStorageKey(slotId: SaveSlotId): string {
  return `${SaveSlotStorageKeyPrefix}${slotId}`;
}

export function isSaveSlotId(value: number): value is SaveSlotId {
  return Number.isInteger(value) && value >= 0 && value < SaveSlotCount;
}

export function inspectSaveSlot(storage: SaveStorage, slotId: SaveSlotId): SaveSlotSnapshot {
  const storageKey = getSaveSlotStorageKey(slotId);
  const raw = storage.getItem(storageKey);
  if (raw === null) {
    return { id: slotId, displayNumber: slotId + 1, storageKey, status: 'empty' };
  }
  const save = parseGameSave(raw);
  if (!save) {
    return { id: slotId, displayNumber: slotId + 1, storageKey, status: 'corrupt' };
  }
  return {
    id: slotId,
    displayNumber: slotId + 1,
    storageKey,
    status: 'valid',
    save,
    sourceVersion: readSerializedVersion(raw),
  };
}

export function listSaveSlots(storage: SaveStorage): SaveSlotSnapshot[] {
  return Array.from({ length: SaveSlotCount }, (_, id) => inspectSaveSlot(storage, id as SaveSlotId));
}

export function createDefaultGameSave(now = new Date()): GameSaveV4 {
  const rosters = createPlayerPetRosters();
  const inventories = createPlayerInventoryRuntimes(createSeedEquipmentRegistry());
  return createGameSave({
    progression: createHeroProgression(1),
    skillLoadout: createHeroSkillModel().loadout,
    skillLearning: createSkillLearningState(1, 0),
    inventoryStore: inventories.p1.store,
    equipmentLoadout: inventories.p1.loadout,
    petRoster: rosters.p1,
    player2InventoryStore: inventories.p2.store,
    player2EquipmentLoadout: inventories.p2.loadout,
    player2PetRoster: rosters.p2,
    levelUnlockProgress: createDefaultLevelUnlockProgress(),
    now,
  });
}

export function createSaveSlot(
  storage: SaveStorage,
  slotId: SaveSlotId,
  save: GameSaveV4 = createDefaultGameSave(),
): boolean {
  if (inspectSaveSlot(storage, slotId).status !== 'empty') return false;
  saveGame(storage, save, getSaveSlotStorageKey(slotId));
  return selectSaveSlot(storage, slotId) !== undefined;
}

export function selectSaveSlot(storage: SaveStorage, slotId: SaveSlotId): GameSaveV4 | undefined {
  const snapshot = inspectSaveSlot(storage, slotId);
  if (snapshot.status !== 'valid' || !snapshot.save) return undefined;
  // Parsing is also the V1/V2/V3 migration and V4 sanitization boundary. Persist normalized V4 in place.
  saveGame(storage, snapshot.save, snapshot.storageKey);
  storage.setItem(ActiveSaveSlotStorageKey, String(slotId));
  return snapshot.save;
}

export function deleteSaveSlot(storage: SaveStorage, slotId: SaveSlotId): void {
  storage.removeItem(getSaveSlotStorageKey(slotId));
  if (getActiveSaveSlotId(storage) === slotId) {
    storage.removeItem(ActiveSaveSlotStorageKey);
  }
}

export function getActiveSaveSlotId(storage: SaveStorage): SaveSlotId | undefined {
  const raw = storage.getItem(ActiveSaveSlotStorageKey);
  if (raw === null) return undefined;
  const value = Number(raw);
  return isSaveSlotId(value) ? value : undefined;
}

export function loadActiveGame(storage: SaveStorage): GameSaveV4 | undefined {
  const slotId = getActiveSaveSlotId(storage);
  return slotId === undefined ? undefined : loadGame(storage, getSaveSlotStorageKey(slotId));
}

export function saveActiveGame(storage: SaveStorage, save: GameSaveV4): boolean {
  const slotId = getActiveSaveSlotId(storage);
  if (slotId === undefined || inspectSaveSlot(storage, slotId).status !== 'valid') return false;
  saveGame(storage, save, getSaveSlotStorageKey(slotId));
  return true;
}

export function saveActiveLevelUnlockProgress(
  storage: SaveStorage,
  progress: GameSaveV4['levelUnlockProgress'],
  now = new Date(),
): boolean {
  const save = loadActiveGame(storage);
  if (!save) return false;
  return saveActiveGame(storage, {
    ...save,
    savedAt: now.toISOString(),
    levelUnlockProgress: sanitizeLevelUnlockProgress(progress),
  });
}

export function migrateLegacySingleSave(storage: SaveStorage): LegacySingleSaveMigrationResult {
  if (listSaveSlots(storage).some((slot) => slot.status !== 'empty')) return 'slots-not-empty';
  const raw = storage.getItem(GameSaveStorageKey);
  if (raw === null) return 'none';
  const save = parseGameSave(raw);
  if (!save) return 'legacy-corrupt';
  saveGame(storage, save, getSaveSlotStorageKey(0));
  storage.setItem(ActiveSaveSlotStorageKey, '0');
  storage.removeItem(GameSaveStorageKey);
  return 'imported';
}

export function getSaveSlotDisplayName(snapshot: SaveSlotSnapshot): string {
  if (snapshot.status === 'empty') return '空存档';
  if (snapshot.status === 'corrupt' || !snapshot.save) return '损坏存档';
  const heroNames = ['未知角色', '悟空', '唐僧', '八戒', '沙僧', '白龙'];
  const heroName = heroNames[snapshot.save.player1.heroId] ?? heroNames[0];
  return `${heroName} · ${snapshot.save.player1.level}级`;
}

function readSerializedVersion(raw: string): number | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return undefined;
    const version = Reflect.get(value, 'version');
    return typeof version === 'number' ? version : undefined;
  } catch {
    return undefined;
  }
}

export function isNormalizedSaveSlot(snapshot: SaveSlotSnapshot): boolean {
  return snapshot.status === 'valid' && snapshot.sourceVersion === GameSaveVersion;
}
