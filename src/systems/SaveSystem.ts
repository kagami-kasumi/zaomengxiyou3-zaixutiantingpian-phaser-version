import type { EquipmentDefinition, EquipmentInstance, EquipmentLoadout, EquipmentSlot, EquipmentStats } from './EquipmentSystem';
import { createEmptyEquipmentLoadout } from './EquipmentSystem';
import type { HeroSkillLoadout, SkillBinding } from './HeroSkillSystem';
import type { InventoryCategory, InventoryEntry, InventoryStore } from './InventorySystem';
import {
  createInventoryStore,
  InventoryCategories,
  InventoryStackQuantityLimit,
} from './InventorySystem';
import type { HeroProgressionModel } from './ProgressionSystem';
import { getHeroExperienceToNextLevel, ProgressionTuning } from './ProgressionSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import { PetTuning } from './PetTuning';
import type { PetRoster, PetState } from './PetTypes';
import type { PlayerSlot } from './InputSystem';
import {
  createPartyConfiguration,
  parsePartyConfiguration,
  partyMatchesPlayerHeroes,
  type PartyConfiguration,
} from './PartyConfigurationSystem';
import {
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';
import { HERO_SKILL_TREES, type AllSkillName, type HeroSkillLearningState } from './SkillUISystem';
import { isKnownInventoryResource } from './InventoryResourceCatalog';
import {
  cloneImmortalityFlags,
  createEmptyImmortalityFlags,
  sanitizeImmortalityFlags,
  type ImmortalityFlags,
} from './ImmortalitySystem';

export const GameSaveStorageKey = 'zaixu-tianding.save.v1';
export const GameSaveVersion = 7 as const;

export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type EquipmentSaveEntry = {
  fillName: string;
  instanceId: string;
  strengthLevel?: number;
  baseStatsOverride?: Partial<EquipmentStats>;
  magicWeapon?: {
    level: number;
    element: string;
    growthRate?: number;
  };
};

export type InventorySaveEntry = {
  kind: 'equipment' | 'stack';
  fillName: string;
  instanceId?: string;
  stackId?: string;
  quantity: number;
  strengthLevel?: number;
  baseStatsOverride?: Partial<EquipmentStats>;
  magicWeapon?: EquipmentSaveEntry['magicWeapon'];
};

export type InventorySave = {
  capacityPerCategory: number;
  nextEquipmentInstanceId: number;
  categories: Record<InventoryCategory, InventorySaveEntry[]>;
};

export type PetSave = Omit<PetState, 'skillState' | 'autoBuffState' | 'magicFlowerBuff'>;

export type PlayerSkillLearningSave = {
  heroLevel: number;
  trees: Array<{ treeLevel: number; learnedSkills: Array<{ skillName: string; level: number }> }>;
  passiveSkills: number[];
};

export type PlayerFeatureSave = {
  heroId: number;
  level: number;
  currentExp: number;
  soulCount: number;
  skillLoadout: Array<{ skillName: string; level: number } | null>;
  skillLearning: PlayerSkillLearningSave;
  inventory: InventorySave;
  immortalityFlags: ImmortalityFlags;
  equipment: Record<EquipmentSlot, EquipmentSaveEntry | null>;
  pets: PetSave[];
  selectedPetIndex: number;
};

export type PartyTaskSave = {
  dateKey: string;
  daily: Array<{
    id: number;
    progress: number[];
    isComplete: boolean;
    hasClaimed: boolean;
  }>;
};

export type GameSave = {
  version: typeof GameSaveVersion;
  savedAt: string;
  party: PartyConfiguration;
  player1: PlayerFeatureSave;
  player2: PlayerFeatureSave;
  levelUnlockProgress: LevelUnlockProgress;
  partyTasks?: PartyTaskSave;
};

export type CreateGameSaveInput = {
  party?: PartyConfiguration;
  progression: HeroProgressionModel;
  soulCount?: number;
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
  equipmentLoadout: EquipmentLoadout;
  inventoryStore?: InventoryStore;
  immortalityFlags?: ImmortalityFlags;
  petRoster: PetRoster;
  player2Progression?: HeroProgressionModel;
  player2SoulCount?: number;
  player2SkillLoadout?: HeroSkillLoadout;
  player2SkillLearning?: HeroSkillLearningState;
  player2InventoryStore?: InventoryStore;
  player2ImmortalityFlags?: ImmortalityFlags;
  player2EquipmentLoadout?: EquipmentLoadout;
  player2PetRoster?: PetRoster;
  levelUnlockProgress?: LevelUnlockProgress;
  partyTasks?: PartyTaskSave;
  now?: Date;
};

export type LoadedPlayer1State = {
  progression: HeroProgressionModel;
  soulCount: number;
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
  equipmentLoadout: EquipmentLoadout;
  inventoryStore: InventoryStore;
  immortalityFlags: ImmortalityFlags;
  petRoster: PetRoster;
};

const EquipmentSlots: readonly EquipmentSlot[] = [
  'weapon', 'armor', 'accessory', 'fashion', 'magicWeapon', 'title',
];
const KnownSkillNames = new Set<AllSkillName>(
  Object.values(HERO_SKILL_TREES).flatMap((trees) => trees.flatMap((tree) => tree.skills)),
);

export type LoadedGameState = LoadedPlayer1State & {
  party: PartyConfiguration;
  player1: LoadedPlayer1State;
  player2: LoadedPlayer1State;
  player2PetRoster: PetRoster;
  levelUnlockProgress: LevelUnlockProgress;
};

export function createGameSave(input: CreateGameSaveInput): GameSave {
  const player1 = encodePlayerFeature(input);
  const player2 = encodePlayerFeature({
    progression: input.player2Progression,
    soulCount: input.player2SoulCount,
    skillLoadout: input.player2SkillLoadout,
    skillLearning: input.player2SkillLearning,
    inventoryStore: input.player2InventoryStore,
    immortalityFlags: input.player2ImmortalityFlags,
    equipmentLoadout: input.player2EquipmentLoadout,
    petRoster: input.player2PetRoster,
  });
  const party = input.party === undefined
    ? createPartyConfiguration(1, player1.heroId)
    : parsePartyConfiguration(input.party);
  if (!party || !partyMatchesPlayerHeroes(party, player1.heroId, player2.heroId)) {
    throw new RangeError('PartyConfiguration must be valid and match active player hero snapshots.');
  }
  const partyTasks = sanitizePartyTaskSave(input.partyTasks);
  return {
    version: GameSaveVersion,
    savedAt: (input.now ?? new Date()).toISOString(),
    party,
    player1,
    player2,
    levelUnlockProgress: sanitizeLevelUnlockProgress(input.levelUnlockProgress),
    ...(partyTasks ? { partyTasks } : {}),
  };
}

export function serializeGameSave(save: GameSave): string {
  return JSON.stringify(save);
}

export function parseGameSave(raw: string): GameSave | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== GameSaveVersion || typeof value.savedAt !== 'string' ||
      !isValidPlayerFeatureSave(value.player1) ||
      !isValidPlayerFeatureSave(value.player2) ||
      !isRecord(value.levelUnlockProgress)) return undefined;
    const party = parsePartyConfiguration(value.party);
    if (!party || !partyMatchesPlayerHeroes(party, value.player1.heroId, value.player2.heroId)) {
      return undefined;
    }
    const partyTasks = sanitizePartyTaskSave(value.partyTasks);
    const { partyTasks: _ignoredPartyTasks, ...saveBase } = value as unknown as GameSave;
    return {
      ...saveBase,
      party,
      player1: normalizePlayerFeatureSave(value.player1 as PlayerFeatureSave),
      player2: normalizePlayerFeatureSave(value.player2 as PlayerFeatureSave),
      levelUnlockProgress: sanitizeLevelUnlockProgress(value.levelUnlockProgress),
      ...(partyTasks ? { partyTasks } : {}),
    };
  } catch {
    return undefined;
  }
}

export function saveGame(
  storage: SaveStorage,
  save: GameSave,
  storageKey = GameSaveStorageKey,
): void {
  storage.setItem(storageKey, serializeGameSave(save));
}

export function loadGame(
  storage: SaveStorage,
  storageKey = GameSaveStorageKey,
): GameSave | undefined {
  const raw = storage.getItem(storageKey);
  return raw === null ? undefined : parseGameSave(raw);
}

export function clearGameSave(storage: SaveStorage, storageKey = GameSaveStorageKey): void {
  storage.removeItem(storageKey);
}

export function saveLevelUnlockProgress(
  storage: SaveStorage,
  progress: LevelUnlockProgress,
  now = new Date(),
): boolean {
  const save = loadGame(storage);
  if (!save) return false;
  saveGame(storage, {
    ...save,
    savedAt: now.toISOString(),
    levelUnlockProgress: sanitizeLevelUnlockProgress(progress),
  });
  return true;
}

export function restorePlayer1State(
  save: GameSave,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedPlayer1State {
  return restorePlayerFeatureState(save.player1, equipmentRegistry, 'p1');
}

export function restorePlayer2State(
  save: GameSave,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedPlayer1State {
  return restorePlayerFeatureState(save.player2, equipmentRegistry, 'p2');
}

function restorePlayerFeatureState(
  source: PlayerFeatureSave,
  equipmentRegistry: Record<string, EquipmentDefinition>,
  ownerSlot: PlayerSlot,
): LoadedPlayer1State {
  const heroId = clampInteger(source.heroId, 1, 5);
  const level = clampInteger(source.level, 1, ProgressionTuning.maxLevel);
  const expToNext = getHeroExperienceToNextLevel(level);
  const currentExp = clampInteger(source.currentExp, 0, Math.max(0, expToNext - 1));
  return {
    progression: {
      heroId: heroId as HeroProgressionModel['heroId'],
      level,
      currentExp,
      expToNext,
      lastResult: 'loaded',
    },
    soulCount: source.soulCount,
    skillLoadout: decodeSkillLoadout(source.skillLoadout),
    skillLearning: decodeSkillLearning(source.skillLearning, level),
    equipmentLoadout: decodeEquipmentLoadout(source.equipment, equipmentRegistry),
    inventoryStore: decodeInventoryStore(source.inventory, equipmentRegistry, ownerSlot),
    immortalityFlags: cloneImmortalityFlags(source.immortalityFlags),
    petRoster: decodePetRoster(source.pets, source.selectedPetIndex, ownerSlot),
  };
}

export function restoreGameState(
  save: GameSave,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedGameState {
  const player1 = restorePlayer1State(save, equipmentRegistry);
  const player2 = restorePlayer2State(save, equipmentRegistry);
  return {
    ...player1,
    party: save.party,
    player1,
    player2,
    player2PetRoster: player2.petRoster,
    levelUnlockProgress: sanitizeLevelUnlockProgress(save.levelUnlockProgress),
  };
}

function encodePlayerFeature(input: {
  progression?: HeroProgressionModel;
  soulCount?: number;
  skillLoadout?: HeroSkillLoadout;
  skillLearning?: HeroSkillLearningState;
  inventoryStore?: InventoryStore;
  immortalityFlags?: ImmortalityFlags;
  equipmentLoadout?: EquipmentLoadout;
  petRoster?: PetRoster;
}): PlayerFeatureSave {
  const defaults = createDefaultPlayerFeatureSave();
  return {
    heroId: input.progression?.heroId ?? defaults.heroId,
    level: input.progression?.level ?? defaults.level,
    currentExp: input.progression?.currentExp ?? defaults.currentExp,
    soulCount: requireSafeSoulCount(input.soulCount ?? defaults.soulCount),
    skillLoadout: input.skillLoadout?.slots.map((binding) => binding ? { ...binding } : null) ?? defaults.skillLoadout,
    skillLearning: input.skillLearning ? cloneSkillLearning(input.skillLearning) : defaults.skillLearning,
    inventory: input.inventoryStore ? encodeInventoryStore(input.inventoryStore) : defaults.inventory,
    immortalityFlags: input.immortalityFlags
      ? cloneImmortalityFlags(input.immortalityFlags)
      : defaults.immortalityFlags,
    equipment: input.equipmentLoadout ? encodeEquipmentLoadout(input.equipmentLoadout) : defaults.equipment,
    pets: input.petRoster?.pets.map(encodePet) ?? defaults.pets,
    selectedPetIndex: input.petRoster?.selectedIndex ?? defaults.selectedPetIndex,
  };
}

function createDefaultPlayerFeatureSave(): PlayerFeatureSave {
  return {
    heroId: 1,
    level: 1,
    currentExp: 0,
    soulCount: 0,
    skillLoadout: [null, null, null, null, null],
    skillLearning: {
      heroLevel: 1,
      trees: [{ treeLevel: 0, learnedSkills: [] }, { treeLevel: 0, learnedSkills: [] }],
      passiveSkills: [0, 0, 0, 0, 0],
    },
    inventory: createEmptyInventorySave(),
    immortalityFlags: createEmptyImmortalityFlags(),
    equipment: encodeEquipmentLoadout(createEmptyEquipmentLoadout()),
    pets: [],
    selectedPetIndex: 0,
  };
}

function sanitizePartyTaskSave(value: unknown): PartyTaskSave | undefined {
  if (!isRecord(value) || typeof value.dateKey !== 'string' || !Array.isArray(value.daily)) {
    return undefined;
  }
  const daily: PartyTaskSave['daily'] = [];
  for (const item of value.daily) {
    if (!isRecord(item) || !Number.isInteger(item.id) || !Array.isArray(item.progress)) continue;
    daily.push({
      id: clampInteger(item.id, 1, 43),
      progress: item.progress.map((count) => clampInteger(count, 0, 1_000_000)),
      isComplete: item.isComplete === true,
      hasClaimed: item.hasClaimed === true,
    });
  }
  return { dateKey: value.dateKey, daily };
}

function createEmptyInventorySave(): InventorySave {
  return {
    capacityPerCategory: 125,
    nextEquipmentInstanceId: 1,
    categories: { equipment: [], items: [], fashion: [], skillBooks: [] },
  };
}

function encodeInventoryStore(store: InventoryStore): InventorySave {
  const categories = {} as Record<InventoryCategory, InventorySaveEntry[]>;
  for (const category of InventoryCategories) {
    categories[category] = store.categories[category].map((entry) => ({
      kind: entry.kind,
      fillName: entry.definition.fillName,
      instanceId: entry.kind === 'equipment' ? entry.instanceId : undefined,
      stackId: entry.kind === 'stack' ? entry.stackId : undefined,
      quantity: entry.quantity,
      strengthLevel: entry.kind === 'equipment' ? entry.strengthLevel : undefined,
      baseStatsOverride: entry.kind === 'equipment' ? entry.baseStatsOverride : undefined,
      magicWeapon: entry.kind === 'equipment' ? encodeMagicWeaponState(entry.definition) : undefined,
    }));
  }
  return {
    capacityPerCategory: store.capacityPerCategory,
    nextEquipmentInstanceId: store.nextEquipmentInstanceId,
    categories,
  };
}

function decodeInventoryStore(
  saved: InventorySave,
  registry: Record<string, EquipmentDefinition>,
  ownerSlot: PlayerSlot,
): InventoryStore {
  const store = createInventoryStore(clampInteger(saved?.capacityPerCategory, 1, 500), `${ownerSlot}-eq`);
  store.nextEquipmentInstanceId = clampInteger(saved?.nextEquipmentInstanceId, 1, 1_000_000);
  for (const category of InventoryCategories) {
    const entries = Array.isArray(saved?.categories?.[category]) ? saved.categories[category] : [];
    const restored: InventoryEntry[] = [];
    for (const [index, entry] of entries.entries()) {
      if (!isRecord(entry) || typeof entry.fillName !== 'string') continue;
      const definition = Object.values(registry).find((candidate) => candidate.fillName === entry.fillName);
      if (!definition) continue;
      if (entry.kind === 'equipment') {
        restored.push({
          kind: 'equipment',
          instanceId: typeof entry.instanceId === 'string' ? entry.instanceId : `${ownerSlot}-loaded-${index}`,
          definition: decodeMagicWeaponDefinition(definition, entry),
          quantity: 1,
          ...decodeEquipmentEnhancement(entry),
        });
      }
      else if (entry.kind === 'stack') {
        restored.push({
          kind: 'stack',
          stackId: typeof entry.stackId === 'string' ? entry.stackId : `${ownerSlot}-stack-${index}`,
          definition,
          quantity: clampInteger(entry.quantity, 1, InventoryStackQuantityLimit),
        });
      }
    }
    store.categories[category] = restored.slice(0, store.capacityPerCategory);
  }
  return store;
}

function normalizePlayerFeatureSave(value: PlayerFeatureSave): PlayerFeatureSave {
  return {
    ...value,
    heroId: clampInteger(value.heroId, 1, 5),
    inventory: isValidInventorySave(value.inventory) ? value.inventory : createEmptyInventorySave(),
    immortalityFlags: sanitizeImmortalityFlags(value.immortalityFlags),
  };
}

function encodeEquipmentLoadout(loadout: EquipmentLoadout): Record<EquipmentSlot, EquipmentSaveEntry | null> {
  const result = {} as Record<EquipmentSlot, EquipmentSaveEntry | null>;
  for (const slot of EquipmentSlots) {
    const item = loadout[slot];
    result[slot] = item ? {
      fillName: item.definition.fillName,
      instanceId: item.instanceId,
      strengthLevel: item.strengthLevel,
      baseStatsOverride: item.baseStatsOverride,
      magicWeapon: encodeMagicWeaponState(item.definition),
    } : null;
  }
  return result;
}

function decodeEquipmentLoadout(
  saved: Record<EquipmentSlot, EquipmentSaveEntry | null>,
  registry: Record<string, EquipmentDefinition>,
): EquipmentLoadout {
  const loadout = createEmptyEquipmentLoadout();
  if (!isRecord(saved)) return loadout;
  for (const slot of EquipmentSlots) {
    const entry = saved[slot];
    if (!isRecord(entry) || typeof entry.fillName !== 'string') continue;
    const definition = Object.values(registry).find((candidate) => candidate.fillName === entry.fillName);
    if (!definition) continue;
    const instance: EquipmentInstance = {
      kind: 'equipment',
      instanceId: typeof entry.instanceId === 'string' ? entry.instanceId : `loaded-${slot}-${entry.fillName}`,
      definition: decodeMagicWeaponDefinition(definition, entry),
      quantity: 1,
      ...decodeEquipmentEnhancement(entry),
    };
    loadout[slot] = instance;
  }
  return loadout;
}

function decodeEquipmentEnhancement(value: Record<string, unknown>): Pick<
  EquipmentInstance,
  'strengthLevel' | 'baseStatsOverride'
> {
  const strengthLevel = clampInteger(value.strengthLevel, 0, 7);
  const baseStatsOverride = isRecord(value.baseStatsOverride)
    ? sanitizeEquipmentStatsOverride(value.baseStatsOverride)
    : undefined;
  return {
    strengthLevel: strengthLevel > 0 ? strengthLevel : undefined,
    baseStatsOverride: baseStatsOverride && Object.keys(baseStatsOverride).length > 0
      ? baseStatsOverride
      : undefined,
  };
}

function encodeMagicWeaponState(
  definition: EquipmentDefinition,
): EquipmentSaveEntry['magicWeapon'] | undefined {
  const state = definition.magicWeapon;
  return state ? {
    level: state.level,
    element: state.element,
    growthRate: state.growthRate,
  } : undefined;
}

function decodeMagicWeaponDefinition(
  definition: EquipmentDefinition,
  value: Record<string, unknown>,
): EquipmentDefinition {
  if (!definition.magicWeapon || !isRecord(value.magicWeapon)) return definition;
  const saved = value.magicWeapon;
  const growthRate = typeof saved.growthRate === 'number' && Number.isFinite(saved.growthRate) && saved.growthRate > 0
    ? saved.growthRate
    : definition.magicWeapon.growthRate;
  return {
    ...definition,
    magicWeapon: {
      level: clampInteger(saved.level, 1, 15),
      element: typeof saved.element === 'string' && saved.element.trim() !== ''
        ? saved.element
        : definition.magicWeapon.element,
      ...(growthRate === undefined ? {} : { growthRate }),
    },
  };
}

function sanitizeEquipmentStatsOverride(value: Record<string, unknown>): Partial<EquipmentStats> {
  const result: Partial<EquipmentStats> = {};
  const keys: ReadonlyArray<keyof EquipmentStats> = [
    'maxHp', 'maxMp', 'power', 'defense', 'critPercent', 'missPercent',
    'hpRegen', 'mpRegen', 'lifeStealPercent', 'magicDefensePercent', 'piercePercent', 'shield',
  ];
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === 'number' && Number.isFinite(candidate)) result[key] = candidate;
  }
  return result;
}

function encodePet(pet: PetState): PetSave {
  const { skillState: _skillState, autoBuffState: _autoBuffState, magicFlowerBuff: _magicFlowerBuff, ...persistent } = pet;
  return {
    ...persistent,
    skills: [...pet.skills],
  };
}

function decodePetRoster(
  savedPets: PetSave[],
  selectedIndex: number,
  ownerSlot: PlayerSlot,
): PetRoster {
  const pets = savedPets
    .filter(isRecord)
    .map((value, index) => decodePet(value as unknown as PetSave, index, ownerSlot));
  let activeSeen = false;
  for (const pet of pets) {
    if (pet.isActive && !activeSeen) activeSeen = true;
    else if (pet.isActive) pet.isActive = false;
  }
  return {
    pets,
    selectedIndex: pets.length === 0 ? 0 : clampInteger(selectedIndex, 0, pets.length - 1),
    message: 'Pet save loaded',
  };
}

function decodePet(saved: PetSave, index: number, ownerSlot: PlayerSlot): PetState {
  const maxHp = positiveNumber(saved.maxHp, 1);
  const maxMp = positiveNumber(saved.maxMp, 1);
  const level = clampInteger(saved.level, 1, PetTuning.maxLevel);
  return {
    id: decodePetId(saved.id, index, ownerSlot),
    species: typeof saved.species === 'string' ? saved.species : 'monkey',
    form: clampInteger(saved.form, 1, 4),
    displayName: typeof saved.displayName === 'string' ? saved.displayName : `Pet ${index + 1}`,
    level,
    exp: nonNegativeNumber(saved.exp),
    expToNext: positiveNumber(saved.expToNext, 1),
    hp: clampNumber(saved.hp, 0, maxHp),
    maxHp,
    mp: clampNumber(saved.mp, 0, maxMp),
    maxMp,
    atk: nonNegativeNumber(saved.atk),
    def: nonNegativeNumber(saved.def),
    critBonusRate: clampNumber(saved.critBonusRate, 0, 1),
    skillDamageBonus: nonNegativeNumber(saved.skillDamageBonus),
    moveSpeed: nonNegativeNumber(saved.moveSpeed),
    lifetime: clampNumber(saved.lifetime, 0, 100),
    quality: nonNegativeNumber(saved.quality),
    hpQuality: nonNegativeNumber(saved.hpQuality),
    mpQuality: nonNegativeNumber(saved.mpQuality),
    atkQuality: nonNegativeNumber(saved.atkQuality),
    defQuality: nonNegativeNumber(saved.defQuality),
    perception: nonNegativeNumber(saved.perception),
    technique: nonNegativeNumber(saved.technique),
    warpower: nonNegativeNumber(saved.warpower),
    isActive: saved.isActive === true,
    skills: Array.isArray(saved.skills) ? saved.skills.filter((skill): skill is string => typeof skill === 'string') : [],
    skillState: createPetSkillState(),
  };
}

function decodePetId(value: unknown, index: number, ownerSlot: PlayerSlot): string {
  const id = typeof value === 'string' && value !== '' ? value : `loaded-pet-${index + 1}`;
  return ownerSlot === 'p2' && !id.startsWith('p2-') ? `p2-${id}` : id;
}

function isPlayerSaveBase(value: unknown): value is PlayerFeatureSave {
  return isRecord(value) && Array.isArray(value.pets) &&
    Array.isArray(value.skillLoadout) && isRecord(value.skillLearning);
}

function isValidInventorySave(value: unknown): value is InventorySave {
  return isRecord(value) && isRecord(value.categories);
}

function decodeSkillLoadout(saved: PlayerFeatureSave['skillLoadout']): HeroSkillLoadout {
  const slots = Array.from({ length: 5 }, (_, index): SkillBinding | null => {
    const entry = saved[index];
    if (!isRecord(entry) || !isKnownSkill(entry.skillName)) return null;
    return { skillName: entry.skillName, level: clampInteger(entry.level, 1, 18) };
  });
  return { slots: slots as unknown as HeroSkillLoadout['slots'] };
}

function cloneSkillLearning(state: HeroSkillLearningState): PlayerSkillLearningSave {
  return {
    heroLevel: state.heroLevel,
    trees: state.trees.map((tree) => ({
      treeLevel: tree.treeLevel,
      learnedSkills: tree.learnedSkills.map((skill) => ({ ...skill })),
    })),
    passiveSkills: [...state.passiveSkills],
  };
}

function decodeSkillLearning(
  saved: PlayerSkillLearningSave,
  heroLevel: number,
): HeroSkillLearningState {
  const trees = [0, 1].map((treeIndex) => {
    const tree = saved.trees?.[treeIndex];
    const learned = Array.isArray(tree?.learnedSkills) ? tree.learnedSkills : [];
    return {
      treeLevel: clampInteger(tree?.treeLevel, 0, 5),
      learnedSkills: learned
        .filter((skill) => isRecord(skill) && isKnownSkill(skill.skillName))
        .map((skill) => ({ skillName: skill.skillName as AllSkillName, level: clampInteger(skill.level, 1, 18) })),
    };
  });
  const passive = Array.from({ length: 5 }, (_, index) => clampInteger(saved.passiveSkills?.[index], 0, 5));
  return {
    heroLevel,
    trees: trees as HeroSkillLearningState['trees'],
    passiveSkills: passive as HeroSkillLearningState['passiveSkills'],
  };
}

function isValidPlayerFeatureSave(value: unknown): value is PlayerFeatureSave {
  const candidate = value as PlayerFeatureSave;
  return isPlayerSaveBase(value) &&
    Number.isInteger(candidate.heroId) && candidate.heroId >= 1 && candidate.heroId <= 5 &&
    Number.isInteger(candidate.level) && candidate.level >= 1 && candidate.level <= ProgressionTuning.maxLevel &&
    Number.isInteger(candidate.currentExp) && candidate.currentExp >= 0 &&
    candidate.currentExp < getHeroExperienceToNextLevel(candidate.level) &&
    Number.isSafeInteger(candidate.soulCount) && candidate.soulCount >= 0 &&
    isValidInventorySave(candidate.inventory) &&
    isRecord(candidate.equipment) &&
    Array.isArray(candidate.immortalityFlags) &&
    Number.isInteger(candidate.selectedPetIndex) &&
    !Object.prototype.hasOwnProperty.call(candidate.skillLearning, 'soulCount') &&
    !hasUnknownPlayerItemIdentities(candidate);
}

function hasUnknownPlayerItemIdentities(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (isRecord(value.equipment)) {
    for (const entry of Object.values(value.equipment)) {
      if (isRecord(entry) && typeof entry.fillName === 'string' &&
        !isKnownInventoryResource(entry.fillName)) return true;
    }
  }
  if (!isRecord(value.inventory) || !isRecord(value.inventory.categories)) return false;
  for (const category of InventoryCategories) {
    const entries = value.inventory.categories[category];
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (isRecord(entry) && typeof entry.fillName === 'string' &&
        !isKnownInventoryResource(entry.fillName)) return true;
    }
  }
  return false;
}

function isKnownSkill(value: unknown): value is AllSkillName {
  return typeof value === 'string' && KnownSkillNames.has(value as AllSkillName);
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampInteger(value: unknown, min: number, max: number): number {
  const number = Number.isFinite(value) ? Math.floor(value as number) : min;
  return Math.min(max, Math.max(min, number));
}

function requireSafeSoulCount(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new RangeError('soulCount must be a non-negative safe integer.');
  }
  return value as number;
}

function clampNumber(value: unknown, min: number, max: number): number {
  const number = Number.isFinite(value) ? value as number : min;
  return Math.min(max, Math.max(min, number));
}

function nonNegativeNumber(value: unknown): number {
  return Number.isFinite(value) ? Math.max(0, value as number) : 0;
}

function positiveNumber(value: unknown, fallback: number): number {
  return Number.isFinite(value) && (value as number) > 0 ? value as number : fallback;
}
