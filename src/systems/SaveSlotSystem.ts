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
  serializeGameSave,
  type GameSaveV6,
  type SaveStorage,
} from './SaveSystem';
import {
  createPartyConfiguration,
  type PartyConfiguration,
} from './PartyConfigurationSystem';
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
  save?: GameSaveV6;
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

export function createDefaultGameSave(
  now = new Date(),
  party: PartyConfiguration = createPartyConfiguration(1, 1)!,
): GameSaveV6 {
  const rosters = createPlayerPetRosters();
  const inventories = createPlayerInventoryRuntimes(createSeedEquipmentRegistry());
  return createGameSave({
    party,
    progression: createHeroProgression(party.members.p1.heroId),
    skillLoadout: createHeroSkillModel().loadout,
    soulCount: 0,
    skillLearning: createSkillLearningState(1),
    inventoryStore: inventories.p1.store,
    equipmentLoadout: inventories.p1.loadout,
    petRoster: rosters.p1,
    player2Progression: createHeroProgression(
      party.playerCount === 2 ? party.members.p2.heroId : 1,
    ),
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
  save: GameSaveV6 = createDefaultGameSave(),
): boolean {
  if (inspectSaveSlot(storage, slotId).status !== 'empty') return false;
  const normalized = parseGameSave(serializeGameSave(save));
  if (!normalized) return false;
  const storageKey = getSaveSlotStorageKey(slotId);
  const previousActiveSlot = storage.getItem(ActiveSaveSlotStorageKey);
  try {
    saveGame(storage, normalized, storageKey);
    storage.setItem(ActiveSaveSlotStorageKey, String(slotId));
    return true;
  } catch {
    try {
      storage.removeItem(storageKey);
      if (previousActiveSlot === null) storage.removeItem(ActiveSaveSlotStorageKey);
      else storage.setItem(ActiveSaveSlotStorageKey, previousActiveSlot);
    } catch {
      // Storage has no transaction primitive; rollback is best effort after a write failure.
    }
    return false;
  }
}

export function createPartySaveSlot(
  storage: SaveStorage,
  slotId: SaveSlotId,
  playerCount: unknown,
  p1HeroId: unknown,
  p2HeroId?: unknown,
  now = new Date(),
): boolean {
  const party = createPartyConfiguration(playerCount, p1HeroId, p2HeroId);
  return party ? createSaveSlot(storage, slotId, createDefaultGameSave(now, party)) : false;
}

export function selectSaveSlot(storage: SaveStorage, slotId: SaveSlotId): GameSaveV6 | undefined {
  const snapshot = inspectSaveSlot(storage, slotId);
  if (snapshot.status !== 'valid' || !snapshot.save) return undefined;
  // Parsing is the V1..V4 migration and V5 validation boundary. Persist normalized V5 in place.
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

export function loadActiveGame(storage: SaveStorage): GameSaveV6 | undefined {
  const slotId = getActiveSaveSlotId(storage);
  return slotId === undefined ? undefined : loadGame(storage, getSaveSlotStorageKey(slotId));
}

export function saveActiveGame(storage: SaveStorage, save: GameSaveV6): boolean {
  const slotId = getActiveSaveSlotId(storage);
  if (slotId === undefined || inspectSaveSlot(storage, slotId).status !== 'valid') return false;
  saveGame(storage, save, getSaveSlotStorageKey(slotId));
  return true;
}

export function saveActiveLevelUnlockProgress(
  storage: SaveStorage,
  progress: GameSaveV6['levelUnlockProgress'],
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

export function getActivePartyConfiguration(
  storage: SaveStorage,
): PartyConfiguration | undefined {
  return loadActiveGame(storage)?.party;
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
  const party = snapshot.save.party;
  const p1Name = heroNames[party.members.p1.heroId] ?? heroNames[0];
  if (party.playerCount === 1) return `1P ${p1Name} · ${snapshot.save.player1.level}级`;
  const p2Name = heroNames[party.members.p2.heroId] ?? heroNames[0];
  return `2P ${p1Name} / ${p2Name}`;
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
