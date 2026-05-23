import type { HeroSkillLoadout, SkillBinding } from './HeroSkillSystem';

// ============================================================
// Types
// ============================================================

export type AllSkillName =
  | 'blb' | 'dgq' | 'dj' | 'dzj' | 'hmz' | 'hyjj' | 'hytj' | 'jdy' | 'jdz' | 'jgz'
  | 'jhsj' | 'jrjl' | 'jsp' | 'lybj' | 'lyfb' | 'lys' | 'lysh' | 'lxj' | 'lxuanj' | 'mbyj'
  | 'mds' | 'mlsz' | 'mmw' | 'myhc' | 'pkz' | 'qlj' | 'qsez' | 'rj' | 'sd' | 'sgq'
  | 'shy' | 'sjt' | 'slz' | 'smb' | 'ssp' | 'sx' | 'syzq' | 'tkj' | 'tlj' | 'tmc'
  | 'tjgl' | 'wdww' | 'xbz' | 'xgq' | 'xkjz' | 'xlc' | 'yyb' | 'zq' | 'zz' | 'zznh';

export const SPECIAL_SKILLS: readonly AllSkillName[] = ['sx', 'rj', 'yyb', 'tjgl', 'myhc', 'sd'];
export const UNUPGRADEABLE_SKILLS: readonly AllSkillName[] = ['lybj'];
export const TREE_UPGRADE_COSTS: readonly number[] = [100, 200, 500, 1000, 2000];
export const SKILL_LEARN_LIMIT = 10;
export const MAX_TREE_LEVEL = 5;
export const MAX_PASSIVE_SKILL_LEVEL = 5;

// ============================================================
// Skill tree configurations
// ============================================================

export interface SkillTreeConfig {
  readonly name: string;
  readonly skills: readonly AllSkillName[];
}

export const HERO_SKILL_TREES: Record<number, readonly [SkillTreeConfig, SkillTreeConfig]> = {
  1: [
    { name: '斩系心法', skills: ['slz', 'zz', 'sx', 'qsez', 'hmz'] },
    { name: '火系心法', skills: ['lys', 'hytj', 'lyfb', 'jdy', 'hyjj'] },
  ],
  2: [
    { name: '愈系心法', skills: ['sgq', 'myhc', 'jgz', 'tjgl', 'jhsj'] },
    { name: '水系心法', skills: ['blb', 'xbz', 'shy', 'sjt', 'smb'] },
  ],
  3: [
    { name: '御系心法', skills: ['dj', 'sd', 'rj', 'zznh', 'syzq'] },
    { name: '土系心法', skills: ['ssp', 'jsp', 'dgq', 'xgq', 'tmc'] },
  ],
  4: [
    { name: '毒系心法', skills: ['zq', 'mbyj', 'wdww', 'jdz', 'mds'] },
    { name: '木系心法', skills: ['qlj', 'tkj', 'dzj', 'lybj', 'mmw'] },
  ],
  5: [
    { name: '千刀万刃', skills: ['xlc', 'yyb', 'pkz', 'tlj', 'lysh'] },
    { name: '龙魂的夜宴', skills: ['lxj', 'lxuanj', 'xkjz', 'jrjl', 'mlsz'] },
  ],
};

export function getSkillTreeForHero(heroId: number, treeIndex: number): SkillTreeConfig {
  return HERO_SKILL_TREES[heroId]?.[treeIndex];
}

// ============================================================
// State types
// ============================================================

export interface SkillTreeState {
  treeLevel: number;
  learnedSkills: { skillName: AllSkillName; level: number }[];
}

export interface HeroSkillLearningState {
  heroLevel: number;
  soulCount: number;
  trees: [SkillTreeState, SkillTreeState];
  passiveSkills: [number, number, number, number, number];
}

// ============================================================
// State management
// ============================================================

export function createSkillLearningState(
  heroLevel = 1,
  initialSouls = 5000,
): HeroSkillLearningState {
  return {
    heroLevel,
    soulCount: initialSouls,
    trees: [
      { treeLevel: 0, learnedSkills: [] },
      { treeLevel: 0, learnedSkills: [] },
    ],
    passiveSkills: [0, 0, 0, 0, 0],
  };
}

// ============================================================
// Tree operations
// ============================================================

export function canUpgradeTree(
  state: HeroSkillLearningState,
  treeIndex: number,
): string | true {
  const tree = state.trees[treeIndex];
  if (tree.treeLevel >= MAX_TREE_LEVEL) {
    return 'Tree already max level';
  }
  const cost = TREE_UPGRADE_COSTS[tree.treeLevel];
  if (state.soulCount < cost) {
    return `Need ${cost} souls, have ${state.soulCount}`;
  }
  return true;
}

export function upgradeTree(
  state: HeroSkillLearningState,
  treeIndex: number,
): boolean {
  if (canUpgradeTree(state, treeIndex) !== true) {
    return false;
  }
  const tree = state.trees[treeIndex];
  const cost = TREE_UPGRADE_COSTS[tree.treeLevel];
  state.soulCount -= cost;
  tree.treeLevel += 1;
  return true;
}

// ============================================================
// Skill learning
// ============================================================

export function getTreeUnlockedSkillCount(treeLevel: number): number {
  return Math.min(treeLevel, 5);
}

export function getTotalLearnedSkillCount(state: HeroSkillLearningState): number {
  return state.trees[0].learnedSkills.length + state.trees[1].learnedSkills.length;
}

export function canLearnSkill(
  state: HeroSkillLearningState,
  heroId: number,
  treeIndex: number,
  skillIndex: number,
): string | true {
  const tree = state.trees[treeIndex];
  if (skillIndex >= getTreeUnlockedSkillCount(tree.treeLevel)) {
    return `Tree level ${tree.treeLevel} required`;
  }
  const treeConfig = getSkillTreeForHero(heroId, treeIndex);
  if (!treeConfig) {
    return 'Invalid tree';
  }
  const skillName = treeConfig.skills[skillIndex];
  if (tree.learnedSkills.some((s) => s.skillName === skillName)) {
    return `${skillName} already learned`;
  }
  if (getTotalLearnedSkillCount(state) >= SKILL_LEARN_LIMIT) {
    return 'Skill limit 10 reached';
  }
  return true;
}

export function learnSkill(
  state: HeroSkillLearningState,
  heroId: number,
  treeIndex: number,
  skillIndex: number,
): AllSkillName | undefined {
  if (canLearnSkill(state, heroId, treeIndex, skillIndex) !== true) {
    return undefined;
  }
  const treeConfig = getSkillTreeForHero(heroId, treeIndex);
  if (!treeConfig) {
    return undefined;
  }
  const skillName = treeConfig.skills[skillIndex];
  state.trees[treeIndex].learnedSkills.push({ skillName, level: 1 });
  return skillName;
}

// ============================================================
// Skill upgrade
// ============================================================

export function getSkillMaxLevel(skillName: AllSkillName): number {
  if (UNUPGRADEABLE_SKILLS.includes(skillName)) {
    return 1;
  }
  if (SPECIAL_SKILLS.includes(skillName)) {
    return 9;
  }
  return 18;
}

export function getSkillUpgradeCost(currentLevel: number, isSpecial: boolean): number {
  const base = isSpecial ? 7 : 16;
  return Math.ceil(200 * Math.pow(2560, Math.pow((currentLevel - 1) / base, 0.8)));
}

export function getSkillLevelRequirement(skillName: AllSkillName, currentLevel: number): number {
  if (SPECIAL_SKILLS.includes(skillName)) {
    return (currentLevel) * 10;
  }
  return (currentLevel) * 5;
}

export function findSkillInState(
  state: HeroSkillLearningState,
  skillName: AllSkillName,
): { treeIndex: number; level: number } | undefined {
  for (let t = 0; t < 2; t += 1) {
    const entry = state.trees[t].learnedSkills.find((s) => s.skillName === skillName);
    if (entry) {
      return { treeIndex: t, level: entry.level };
    }
  }
  return undefined;
}

export function canUpgradeSkill(
  state: HeroSkillLearningState,
  skillName: AllSkillName,
): string | true {
  const found = findSkillInState(state, skillName);
  if (!found) {
    return `${skillName} not learned`;
  }
  const currentLevel = found.level;
  const maxLevel = getSkillMaxLevel(skillName);
  if (currentLevel >= maxLevel) {
    return `${skillName} at max level ${maxLevel}`;
  }
  const requiredHeroLevel = getSkillLevelRequirement(skillName, currentLevel);
  if (state.heroLevel < requiredHeroLevel) {
    return `Need hero level ${requiredHeroLevel}`;
  }
  const isSpecial = SPECIAL_SKILLS.includes(skillName);
  const cost = getSkillUpgradeCost(currentLevel, isSpecial);
  if (state.soulCount < cost) {
    return `Need ${cost} souls`;
  }
  return true;
}

export function upgradeSkill(
  state: HeroSkillLearningState,
  skillName: AllSkillName,
): boolean {
  if (canUpgradeSkill(state, skillName) !== true) {
    return false;
  }
  const found = findSkillInState(state, skillName);
  if (!found) {
    return false;
  }
  const entry = state.trees[found.treeIndex].learnedSkills.find(
    (s) => s.skillName === skillName,
  );
  if (!entry) {
    return false;
  }
  const isSpecial = SPECIAL_SKILLS.includes(skillName);
  const cost = getSkillUpgradeCost(entry.level, isSpecial);
  state.soulCount -= cost;
  entry.level += 1;
  return true;
}

// ============================================================
// Binding operations
// ============================================================

export const SkillSlotKeyLabels: Record<string, readonly string[]> = {
  p1: ['Y', 'L', 'U', 'I', 'O'],
  p2: ['8', '3', '4', '5', '6'],
};

const P1_BINDING_ORDER: readonly string[] = ['Y', 'U', 'I', 'O', 'L'];
const P2_BINDING_ORDER: readonly string[] = ['8', '4', '5', '6', '3'];

export function findFirstEmptyBindingSlot(
  loadout: HeroSkillLoadout,
  playerSlot: string,
): number | undefined {
  const order = playerSlot === 'p2' ? P2_BINDING_ORDER : P1_BINDING_ORDER;
  const keyLabels = SkillSlotKeyLabels[playerSlot];
  for (const bindKey of order) {
    const slotIndex = keyLabels.indexOf(bindKey);
    if (slotIndex >= 0 && !loadout.slots[slotIndex]) {
      return slotIndex;
    }
  }
  return undefined;
}

export function assignSkillToSlot(
  loadout: HeroSkillLoadout,
  slotIndex: number,
  skillName: AllSkillName,
  level: number,
): HeroSkillLoadout {
  const newSlots: [
    SkillBinding | null,
    SkillBinding | null,
    SkillBinding | null,
    SkillBinding | null,
    SkillBinding | null,
  ] = [...loadout.slots];
  newSlots[slotIndex] = { skillName, level };
  return { slots: newSlots };
}

// ============================================================
// Passive skill operations
// ============================================================

export function getPassiveSkillMaxLevel(heroLevel: number): number {
  return Math.floor(heroLevel / 5);
}

export function canUpgradePassiveSkill(
  state: HeroSkillLearningState,
  slotIndex: number,
): string | true {
  const currentLevel = state.passiveSkills[slotIndex];
  const maxLevel = Math.min(getPassiveSkillMaxLevel(state.heroLevel), MAX_PASSIVE_SKILL_LEVEL);
  if (currentLevel >= maxLevel) {
    return `Passive max level ${maxLevel}`;
  }
  const cost = (currentLevel + 1) * 5000;
  if (state.soulCount < cost) {
    return `Need ${cost} souls`;
  }
  return true;
}

export function upgradePassiveSkill(
  state: HeroSkillLearningState,
  slotIndex: number,
): boolean {
  if (canUpgradePassiveSkill(state, slotIndex) !== true) {
    return false;
  }
  const currentLevel = state.passiveSkills[slotIndex];
  const cost = (currentLevel + 1) * 5000;
  state.soulCount -= cost;
  state.passiveSkills[slotIndex] = currentLevel + 1;
  return true;
}

// ============================================================
// UI state
// ============================================================

export type SkillPanelTab = 'tree1' | 'tree2' | 'binding' | 'passive';

export type SkillUIState = {
  skillPanelOpen: boolean;
  selectedSlotIndex: number;
  activeTab: SkillPanelTab;
  selectedSkillIndex: number;
  message: string;
};

export function createSkillUIState(): SkillUIState {
  return {
    skillPanelOpen: false,
    selectedSlotIndex: 0,
    activeTab: 'tree1',
    selectedSkillIndex: 0,
    message: '',
  };
}
