import { createSeedEquipmentRegistry } from './EquipmentSystem';
import { consumeStackByFillName, getStackQuantityByFillName } from './InventorySystem';
import type { PlayerSlot } from './InputSystem';
import { usePetConsumable } from './PetConsumableSystem';
import { buildPetSkillSlotViews } from './PetPanelSystem';
import {
  getActivePet,
  getSelectedPet,
  releaseSelectedPet,
  restSelectedPet,
  setSelectedPetActive,
} from './PetRosterSystem';
import { PetTuning } from './PetTuning';
import type { PetConsumableFillName, PetSkillRandomSource, PetState } from './PetTypes';
import { loadActiveGame, saveActiveGame } from './SaveSlotSystem';
import {
  createGameSave,
  restoreGameState,
  type GameSaveV4,
  type LoadedGameState,
  type LoadedPlayer1State,
  type SaveStorage,
} from './SaveSystem';

export const FormalPetPageSize = 5;

export type FormalPetPageModel = {
  owner: PlayerSlot;
  pageIndex: number;
  releaseArmedPetId?: string;
  message: string;
  sourceSave: GameSaveV4;
  restored: LoadedGameState;
};

export function createFormalPetPage(
  storage: SaveStorage,
  owner: PlayerSlot,
): FormalPetPageModel | undefined {
  const save = loadActiveGame(storage);
  if (!save) return undefined;
  const model: FormalPetPageModel = {
    owner,
    pageIndex: 0,
    message: '选择宠物；出战、休息、放生与培养操作会立即保存当前槽',
    sourceSave: save,
    restored: restoreGameState(save, createSeedEquipmentRegistry()),
  };
  syncFormalPetPageToSelection(model);
  return model;
}

export function setFormalPetOwner(model: FormalPetPageModel, owner: PlayerSlot): void {
  model.owner = owner;
  model.releaseArmedPetId = undefined;
  syncFormalPetPageToSelection(model);
  model.message = `已切换 ${owner.toUpperCase()}`;
}

export function changeFormalPetPage(
  model: FormalPetPageModel,
  storage: SaveStorage,
  direction: -1 | 1,
): void {
  model.pageIndex = Math.min(
    getFormalPetPageCount(model) - 1,
    Math.max(0, model.pageIndex + direction),
  );
  const roster = getFormalPetPlayer(model).petRoster;
  roster.selectedIndex = Math.min(roster.pets.length - 1, model.pageIndex * FormalPetPageSize);
  if (roster.pets.length === 0) roster.selectedIndex = 0;
  model.releaseArmedPetId = undefined;
  persistFormalPetPage(model, storage);
}

export function selectFormalPet(
  model: FormalPetPageModel,
  storage: SaveStorage,
  pagePetIndex: number,
): void {
  const roster = getFormalPetPlayer(model).petRoster;
  const absoluteIndex = model.pageIndex * FormalPetPageSize + Math.max(0, pagePetIndex);
  if (!roster.pets[absoluteIndex]) return;
  roster.selectedIndex = absoluteIndex;
  roster.message = `Selected ${roster.pets[absoluteIndex].displayName}`;
  model.releaseArmedPetId = undefined;
  persistFormalPetPage(model, storage);
}

export function deployFormalPet(model: FormalPetPageModel, storage: SaveStorage): boolean {
  const roster = getFormalPetPlayer(model).petRoster;
  const changed = setSelectedPetActive(roster);
  model.message = roster.message;
  model.releaseArmedPetId = undefined;
  if (changed) persistFormalPetPage(model, storage);
  return changed;
}

export function restFormalPet(model: FormalPetPageModel, storage: SaveStorage): boolean {
  const roster = getFormalPetPlayer(model).petRoster;
  const changed = restSelectedPet(roster);
  model.message = roster.message;
  model.releaseArmedPetId = undefined;
  if (changed) persistFormalPetPage(model, storage);
  return changed;
}

export function releaseFormalPet(model: FormalPetPageModel, storage: SaveStorage): boolean {
  const roster = getFormalPetPlayer(model).petRoster;
  const selected = getSelectedPet(roster);
  if (!selected) {
    model.message = '没有可放生的宠物';
    return false;
  }
  if (model.releaseArmedPetId !== selected.id) {
    model.releaseArmedPetId = selected.id;
    model.message = `再次点击确认放生 ${selected.displayName}`;
    return false;
  }
  const released = releaseSelectedPet(roster);
  model.releaseArmedPetId = undefined;
  model.message = released ? `已放生 ${released.displayName}` : roster.message;
  clampFormalPetPage(model);
  if (released) persistFormalPetPage(model, storage);
  return Boolean(released);
}

export function useFormalPetConsumable(
  model: FormalPetPageModel,
  storage: SaveStorage,
  fillName: PetConsumableFillName,
  random: PetSkillRandomSource = Math.random,
): boolean {
  const player = getFormalPetPlayer(model);
  if (getStackQuantityByFillName(player.inventoryStore, fillName) <= 0) {
    model.message = `${fillName} 不在当前玩家背包中`;
    return false;
  }
  const result = usePetConsumable(player.petRoster, fillName, random);
  model.message = result.message;
  model.releaseArmedPetId = undefined;
  if (!result.shouldConsume) return false;
  const consumed = consumeStackByFillName(player.inventoryStore, fillName);
  if (!consumed.ok) {
    model.message = consumed.message;
    return false;
  }
  persistFormalPetPage(model, storage);
  return true;
}

export function getFormalPetPlayer(model: FormalPetPageModel): LoadedPlayer1State {
  return model.owner === 'p1' ? model.restored.player1 : model.restored.player2;
}

export function getFormalPetPagePets(model: FormalPetPageModel): readonly PetState[] {
  const start = model.pageIndex * FormalPetPageSize;
  return getFormalPetPlayer(model).petRoster.pets.slice(start, start + FormalPetPageSize);
}

export function getFormalPetPageCount(model: FormalPetPageModel): number {
  return Math.max(1, Math.ceil(getFormalPetPlayer(model).petRoster.pets.length / FormalPetPageSize));
}

export function getSelectedFormalPet(model: FormalPetPageModel): PetState | undefined {
  return getSelectedPet(getFormalPetPlayer(model).petRoster);
}

export function formatFormalPetSummary(model: FormalPetPageModel): string[] {
  const roster = getFormalPetPlayer(model).petRoster;
  const pet = getSelectedPet(roster);
  const active = getActivePet(roster);
  if (!pet) {
    return [
      `${model.owner.toUpperCase()} · 宠物 0/${PetTuning.maxSeats}`,
      '当前没有宠物',
      model.message,
    ];
  }
  const skills = buildPetSkillSlotViews(pet)
    .map((slot) => `${slot.slot}.${slot.isEmpty ? '-' : `${slot.name}(${slot.skillKey})`}`)
    .join('  ');
  return [
    `${model.owner.toUpperCase()} · 宠物 ${roster.pets.length}/${PetTuning.maxSeats} · 出战 ${active?.displayName ?? '无'}`,
    `${pet.displayName} · ${pet.species} F${pet.form} · Lv.${pet.level} · 品质 ${pet.quality}`,
    `HP ${pet.hp}/${pet.maxHp}  MP ${pet.mp}/${pet.maxMp}  ATK ${pet.atk}  DEF ${pet.def}  寿命 ${pet.lifetime}/100`,
    `暴击 +${((pet.critBonusRate ?? 0) * 100).toFixed(2)}%  技伤 +${(pet.skillDamageBonus ?? 0).toFixed(1)}  移速 ${pet.moveSpeed}`,
    `悟 ${pet.perception}  技 ${pet.technique}  战 ${pet.warpower}  资质 HP${pet.hpQuality}/MP${pet.mpQuality}/攻${pet.atkQuality}/防${pet.defQuality}`,
    `八技能槽：${skills}`,
    model.message,
  ];
}

function syncFormalPetPageToSelection(model: FormalPetPageModel): void {
  const roster = getFormalPetPlayer(model).petRoster;
  roster.selectedIndex = roster.pets.length === 0
    ? 0
    : Math.min(roster.pets.length - 1, Math.max(0, roster.selectedIndex));
  model.pageIndex = Math.floor(roster.selectedIndex / FormalPetPageSize);
  clampFormalPetPage(model);
}

function clampFormalPetPage(model: FormalPetPageModel): void {
  model.pageIndex = Math.min(getFormalPetPageCount(model) - 1, Math.max(0, model.pageIndex));
}

function persistFormalPetPage(model: FormalPetPageModel, storage: SaveStorage): void {
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
