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
import {
  HERO_SKILL_TREES,
  SkillSlotKeyLabels,
  assignSkillToSlot,
  canLearnSkill,
  canUpgradePassiveSkill,
  canUpgradeSkill,
  canUpgradeTree,
  findSkillInState,
  getSkillMaxLevel,
  learnSkill,
  upgradePassiveSkill,
  upgradeSkill,
  upgradeTree,
  type AllSkillName,
  type SkillPanelTab,
} from './SkillUISystem';
import { createSeedEquipmentRegistry } from './EquipmentSystem';

export type FormalSkillPageModel = {
  owner: PlayerSlot;
  activeTab: SkillPanelTab;
  selectedSkillIndex: number;
  selectedSlotIndex: number;
  bindingReturnTab: 'tree1' | 'tree2';
  message: string;
  sourceSave: GameSaveV4;
  restored: LoadedGameState;
};

export function createFormalSkillPage(
  storage: SaveStorage,
  owner: PlayerSlot,
): FormalSkillPageModel | undefined {
  const save = loadActiveGame(storage);
  if (!save) return undefined;
  return {
    owner,
    activeTab: 'tree1',
    selectedSkillIndex: 0,
    selectedSlotIndex: 0,
    bindingReturnTab: 'tree1',
    message: '选择心法或技能；所有成功操作会立即保存当前槽',
    sourceSave: save,
    restored: restoreGameState(save, createSeedEquipmentRegistry()),
  };
}

export function setFormalSkillOwner(model: FormalSkillPageModel, owner: PlayerSlot): void {
  model.owner = owner;
  model.activeTab = 'tree1';
  model.selectedSkillIndex = 0;
  model.selectedSlotIndex = 0;
  model.message = `已切换 ${owner.toUpperCase()}`;
}

export function selectFormalSkillTab(model: FormalSkillPageModel, tab: SkillPanelTab): void {
  model.activeTab = tab;
  model.selectedSkillIndex = 0;
  model.message = tab === 'binding' ? '选择已学技能和目标槽位' : tab === 'passive' ? '选择被动槽位升级' : '选择心法或技能';
}

export function selectFormalSkill(model: FormalSkillPageModel, index: number): void {
  const count = model.activeTab === 'binding' ? getFormalLearnedSkills(model).length : 5;
  model.selectedSkillIndex = count === 0 ? 0 : Math.min(count - 1, Math.max(0, index));
}

export function selectFormalSkillSlot(model: FormalSkillPageModel, index: number): void {
  model.selectedSlotIndex = Math.min(4, Math.max(0, index));
}

export function openFormalSkillBinding(model: FormalSkillPageModel, skillName: AllSkillName): boolean {
  const learnedIndex = getFormalLearnedSkills(model).findIndex((entry) => entry.skillName === skillName);
  if (learnedIndex < 0) return false;
  if (model.activeTab === 'tree1' || model.activeTab === 'tree2') {
    model.bindingReturnTab = model.activeTab;
  }
  model.activeTab = 'binding';
  model.selectedSkillIndex = learnedIndex;
  model.selectedSlotIndex = 0;
  return true;
}

export function commitFormalSkillBinding(
  model: FormalSkillPageModel,
  storage: SaveStorage,
): boolean {
  const saved = bindFormalSkill(model, storage);
  model.activeTab = model.bindingReturnTab;
  model.selectedSkillIndex = 0;
  return saved;
}

export function upgradeFormalSkillTree(model: FormalSkillPageModel, storage: SaveStorage): boolean {
  const treeIndex = getActiveTreeIndex(model);
  if (treeIndex === undefined) {
    model.message = '请先选择一棵主动心法';
    return false;
  }
  const state = getFormalSkillPlayer(model).skillLearning;
  const check = canUpgradeTree(state, treeIndex);
  if (check !== true) {
    model.message = formatSkillRuleFeedback(check);
    return false;
  }
  upgradeTree(state, treeIndex);
  model.message = `${HERO_SKILL_TREES[getFormalSkillPlayer(model).progression.heroId][treeIndex].name} 已升至 ${state.trees[treeIndex].treeLevel} 级`;
  persistFormalSkillPage(model, storage);
  return true;
}

export function learnFormalSkill(model: FormalSkillPageModel, storage: SaveStorage): boolean {
  const treeIndex = getActiveTreeIndex(model);
  if (treeIndex === undefined) {
    model.message = '被动与绑定页不能学习主动技能';
    return false;
  }
  const player = getFormalSkillPlayer(model);
  const check = canLearnSkill(
    player.skillLearning,
    player.progression.heroId,
    treeIndex,
    model.selectedSkillIndex,
  );
  if (check !== true) {
    model.message = formatSkillRuleFeedback(check);
    return false;
  }
  const learned = learnSkill(
    player.skillLearning,
    player.progression.heroId,
    treeIndex,
    model.selectedSkillIndex,
  );
  if (!learned) return false;
  model.message = `已学习 ${learned} Lv.1`;
  persistFormalSkillPage(model, storage);
  return true;
}

export function upgradeFormalSkill(model: FormalSkillPageModel, storage: SaveStorage): boolean {
  const skillName = getSelectedFormalSkillName(model);
  if (!skillName) {
    model.message = '当前没有可升级技能';
    return false;
  }
  const state = getFormalSkillPlayer(model).skillLearning;
  const check = canUpgradeSkill(state, skillName);
  if (check !== true) {
    model.message = formatSkillRuleFeedback(check);
    return false;
  }
  upgradeSkill(state, skillName);
  const level = findSkillInState(state, skillName)?.level ?? 1;
  syncBindingLevel(getFormalSkillPlayer(model), skillName, level);
  model.message = `${skillName} 已升至 Lv.${level}`;
  persistFormalSkillPage(model, storage);
  return true;
}

export function bindFormalSkill(model: FormalSkillPageModel, storage: SaveStorage): boolean {
  const player = getFormalSkillPlayer(model);
  const learned = getFormalLearnedSkills(model)[model.selectedSkillIndex];
  if (!learned) {
    model.message = '没有已学主动技能可绑定';
    return false;
  }
  player.skillLoadout = assignSkillToSlot(
    player.skillLoadout,
    model.selectedSlotIndex,
    learned.skillName,
    learned.level,
  );
  const key = SkillSlotKeyLabels[model.owner][model.selectedSlotIndex];
  model.message = `${learned.skillName} Lv.${learned.level} 已绑定 ${key}`;
  persistFormalSkillPage(model, storage);
  return true;
}

export function upgradeFormalPassiveSkill(model: FormalSkillPageModel, storage: SaveStorage): boolean {
  const state = getFormalSkillPlayer(model).skillLearning;
  const check = canUpgradePassiveSkill(state, model.selectedSkillIndex);
  if (check !== true) {
    model.message = formatSkillRuleFeedback(check);
    return false;
  }
  upgradePassiveSkill(state, model.selectedSkillIndex);
  model.message = `被动 ${model.selectedSkillIndex + 1} 已升至 Lv.${state.passiveSkills[model.selectedSkillIndex]}`;
  persistFormalSkillPage(model, storage);
  return true;
}

export function getFormalSkillPlayer(model: FormalSkillPageModel): LoadedPlayer1State {
  return model.owner === 'p1' ? model.restored.player1 : model.restored.player2;
}

export function getFormalLearnedSkills(
  model: FormalSkillPageModel,
): ReadonlyArray<{ skillName: AllSkillName; level: number }> {
  const state = getFormalSkillPlayer(model).skillLearning;
  return [...state.trees[0].learnedSkills, ...state.trees[1].learnedSkills];
}

export function getSelectedFormalSkillName(model: FormalSkillPageModel): AllSkillName | undefined {
  if (model.activeTab === 'binding') {
    return getFormalLearnedSkills(model)[model.selectedSkillIndex]?.skillName;
  }
  const treeIndex = getActiveTreeIndex(model);
  if (treeIndex === undefined) return undefined;
  const heroId = getFormalSkillPlayer(model).progression.heroId;
  return HERO_SKILL_TREES[heroId]?.[treeIndex]?.skills[model.selectedSkillIndex];
}

export function formatFormalSkillSummary(model: FormalSkillPageModel): string[] {
  const player = getFormalSkillPlayer(model);
  const learning = player.skillLearning;
  const skillName = getSelectedFormalSkillName(model);
  const level = skillName ? findSkillInState(learning, skillName)?.level : undefined;
  return [
    `${model.owner.toUpperCase()} · 英雄 ${player.progression.heroId} · Lv.${player.progression.level} · 灵魂 ${learning.soulCount}`,
    skillName ? `${skillName} · ${level ? `Lv.${level}/${getSkillMaxLevel(skillName)}` : '未学习'}` : '当前未选择技能',
    `五槽：${player.skillLoadout.slots.map((binding, index) => `${SkillSlotKeyLabels[model.owner][index]}=${binding?.skillName ?? '空'}`).join('  ')}`,
    model.message,
  ];
}

function getActiveTreeIndex(model: FormalSkillPageModel): 0 | 1 | undefined {
  if (model.activeTab === 'tree1') return 0;
  if (model.activeTab === 'tree2') return 1;
  return undefined;
}

function syncBindingLevel(player: LoadedPlayer1State, skillName: AllSkillName, level: number): void {
  const slots = player.skillLoadout.slots.map((binding) =>
    binding?.skillName === skillName ? { skillName, level } : binding,
  );
  player.skillLoadout = { slots: [
    slots[0] ?? null,
    slots[1] ?? null,
    slots[2] ?? null,
    slots[3] ?? null,
    slots[4] ?? null,
  ] };
}

function persistFormalSkillPage(model: FormalSkillPageModel, storage: SaveStorage): void {
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

function formatSkillRuleFeedback(message: string): string {
  return message
    .replace('Tree already max level', '心法已满级')
    .replace('Skill limit 10 reached', '已达到 10 个技能上限')
    .replace('already learned', '已学习')
    .replace('not learned', '尚未学习')
    .replace('Need hero level', '需要英雄等级')
    .replace('Need', '需要')
    .replace('souls', '灵魂')
    .replace('have', '当前')
    .replace('at max level', '已达上限')
    .replace('Tree level', '需要心法等级')
    .replace('required', '');
}
