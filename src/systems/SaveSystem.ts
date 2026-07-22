import type { EquipmentDefinition, EquipmentInstance, EquipmentLoadout, EquipmentSlot, EquipmentStats } from './EquipmentSystem';
import { createEmptyEquipmentLoadout } from './EquipmentSystem';
import type { HeroSkillLoadout, SkillBinding } from './HeroSkillSystem';
import type { InventoryCategory, InventoryEntry, InventoryStore } from './InventorySystem';
import { createInventoryStore, InventoryCategories } from './InventorySystem';
import type { HeroProgressionModel } from './ProgressionSystem';
import { getHeroExperienceToNextLevel, ProgressionTuning } from './ProgressionSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import { PetTuning } from './PetTuning';
import type { PetRoster, PetState } from './PetTypes';
import type { PlayerSlot } from './InputSystem';
import {
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';
import { HERO_SKILL_TREES, type AllSkillName, type HeroSkillLearningState } from './SkillUISystem';

export const GameSaveStorageKey = 'zaixu-tianding.save.v1';
export const GameSaveVersion = 4 as const;
export const PreviousGameSaveVersion = 3 as const;
export const PetOwnerGameSaveVersion = 2 as const;
export const LegacyGameSaveVersion = 1 as const;

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

export type InventorySaveV4 = {
  capacityPerCategory: number;
  nextEquipmentInstanceId: number;
  categories: Record<InventoryCategory, InventorySaveEntry[]>;
};

export type PetSaveV1 = Omit<PetState, 'skillState' | 'autoBuffState' | 'magicFlowerBuff'>;

export type Player1SaveV1 = {
  heroId: number;
  level: number;
  currentExp: number;
  skillLoadout: Array<{ skillName: string; level: number } | null>;
  skillLearning: {
    heroLevel: number;
    soulCount: number;
    trees: Array<{ treeLevel: number; learnedSkills: Array<{ skillName: string; level: number }> }>;
    passiveSkills: number[];
  };
  equipment: Record<EquipmentSlot, EquipmentSaveEntry | null>;
  pets: PetSaveV1[];
  selectedPetIndex: number;
};

export type GameSaveV1 = {
  version: typeof LegacyGameSaveVersion;
  savedAt: string;
  player1: Player1SaveV1;
};

export type PlayerPetSaveV2 = {
  pets: PetSaveV1[];
  selectedPetIndex: number;
};

export type GameSaveV2 = {
  version: typeof PetOwnerGameSaveVersion;
  savedAt: string;
  player1: Player1SaveV1;
  player2: PlayerPetSaveV2;
};

export type GameSaveV3 = {
  version: typeof PreviousGameSaveVersion;
  savedAt: string;
  player1: Player1SaveV1;
  player2: PlayerPetSaveV2;
  levelUnlockProgress: LevelUnlockProgress;
};

export type PlayerFeatureSaveV4 = Player1SaveV1 & { inventory: InventorySaveV4 };

export type GameSaveV4 = {
  version: typeof GameSaveVersion;
  savedAt: string;
  player1: PlayerFeatureSaveV4;
  player2: PlayerFeatureSaveV4;
  levelUnlockProgress: LevelUnlockProgress;
};

export type CreateGameSaveInput = {
  progression: HeroProgressionModel;
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
  equipmentLoadout: EquipmentLoadout;
  inventoryStore?: InventoryStore;
  petRoster: PetRoster;
  player2Progression?: HeroProgressionModel;
  player2SkillLoadout?: HeroSkillLoadout;
  player2SkillLearning?: HeroSkillLearningState;
  player2InventoryStore?: InventoryStore;
  player2EquipmentLoadout?: EquipmentLoadout;
  player2PetRoster?: PetRoster;
  levelUnlockProgress?: LevelUnlockProgress;
  now?: Date;
};

export type LoadedPlayer1State = {
  progression: HeroProgressionModel;
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
  equipmentLoadout: EquipmentLoadout;
  inventoryStore: InventoryStore;
  petRoster: PetRoster;
};

const EquipmentSlots: readonly EquipmentSlot[] = [
  'weapon', 'armor', 'accessory', 'fashion', 'magicWeapon', 'title',
];
const KnownSkillNames = new Set<AllSkillName>(
  Object.values(HERO_SKILL_TREES).flatMap((trees) => trees.flatMap((tree) => tree.skills)),
);

export type LoadedGameState = LoadedPlayer1State & {
  player1: LoadedPlayer1State;
  player2: LoadedPlayer1State;
  player2PetRoster: PetRoster;
  levelUnlockProgress: LevelUnlockProgress;
};

export function createGameSave(input: CreateGameSaveInput): GameSaveV4 {
  return {
    version: GameSaveVersion,
    savedAt: (input.now ?? new Date()).toISOString(),
    player1: encodePlayerFeature(input),
    player2: encodePlayerFeature({
      progression: input.player2Progression,
      skillLoadout: input.player2SkillLoadout,
      skillLearning: input.player2SkillLearning,
      inventoryStore: input.player2InventoryStore,
      equipmentLoadout: input.player2EquipmentLoadout,
      petRoster: input.player2PetRoster,
    }),
    levelUnlockProgress: sanitizeLevelUnlockProgress(input.levelUnlockProgress),
  };
}

export function serializeGameSave(save: GameSaveV4): string {
  return JSON.stringify(save);
}

export function parseGameSave(raw: string): GameSaveV4 | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || typeof value.savedAt !== 'string' || !isValidPlayer1Save(value.player1)) {
      return undefined;
    }
    if (value.version === LegacyGameSaveVersion) {
      return migrateLegacySave(value.savedAt, value.player1 as Player1SaveV1);
    }
    if (value.version === PetOwnerGameSaveVersion) {
      if (!isValidPlayerPetSave(value.player2)) return undefined;
      return migrateLegacySave(value.savedAt, value.player1 as Player1SaveV1, value.player2);
    }
    if (value.version === PreviousGameSaveVersion) {
      if (!isValidPlayerPetSave(value.player2)) return undefined;
      return migrateLegacySave(value.savedAt, value.player1 as Player1SaveV1, value.player2, value.levelUnlockProgress);
    }
    if (value.version !== GameSaveVersion || !isValidPlayer1Save(value.player2)) return undefined;
    return {
      ...(value as unknown as GameSaveV4),
      player1: sanitizePlayerFeatureSave(value.player1 as PlayerFeatureSaveV4),
      player2: sanitizePlayerFeatureSave(value.player2 as PlayerFeatureSaveV4),
      levelUnlockProgress: sanitizeLevelUnlockProgress(value.levelUnlockProgress),
    };
  } catch {
    return undefined;
  }
}

export function saveGame(
  storage: SaveStorage,
  save: GameSaveV4,
  storageKey = GameSaveStorageKey,
): void {
  storage.setItem(storageKey, serializeGameSave(save));
}

export function loadGame(
  storage: SaveStorage,
  storageKey = GameSaveStorageKey,
): GameSaveV4 | undefined {
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
  save: GameSaveV4,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedPlayer1State {
  return restorePlayerFeatureState(save.player1, equipmentRegistry, 'p1');
}

export function restorePlayer2State(
  save: GameSaveV4,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedPlayer1State {
  return restorePlayerFeatureState(save.player2, equipmentRegistry, 'p2');
}

function restorePlayerFeatureState(
  source: PlayerFeatureSaveV4,
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
    skillLoadout: decodeSkillLoadout(source.skillLoadout),
    skillLearning: decodeSkillLearning(source.skillLearning, level),
    equipmentLoadout: decodeEquipmentLoadout(source.equipment, equipmentRegistry),
    inventoryStore: decodeInventoryStore(source.inventory, equipmentRegistry, ownerSlot),
    petRoster: decodePetRoster(source.pets, source.selectedPetIndex, ownerSlot),
  };
}

export function restoreGameState(
  save: GameSaveV4,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedGameState {
  const player1 = restorePlayer1State(save, equipmentRegistry);
  const player2 = restorePlayer2State(save, equipmentRegistry);
  return {
    ...player1,
    player1,
    player2,
    player2PetRoster: player2.petRoster,
    levelUnlockProgress: sanitizeLevelUnlockProgress(save.levelUnlockProgress),
  };
}

function encodePlayerFeature(input: {
  progression?: HeroProgressionModel;
  skillLoadout?: HeroSkillLoadout;
  skillLearning?: HeroSkillLearningState;
  inventoryStore?: InventoryStore;
  equipmentLoadout?: EquipmentLoadout;
  petRoster?: PetRoster;
}): PlayerFeatureSaveV4 {
  const defaults = createDefaultPlayerFeatureSave();
  return {
    heroId: input.progression?.heroId ?? defaults.heroId,
    level: input.progression?.level ?? defaults.level,
    currentExp: input.progression?.currentExp ?? defaults.currentExp,
    skillLoadout: input.skillLoadout?.slots.map((binding) => binding ? { ...binding } : null) ?? defaults.skillLoadout,
    skillLearning: input.skillLearning ? cloneSkillLearning(input.skillLearning) : defaults.skillLearning,
    inventory: input.inventoryStore ? encodeInventoryStore(input.inventoryStore) : defaults.inventory,
    equipment: input.equipmentLoadout ? encodeEquipmentLoadout(input.equipmentLoadout) : defaults.equipment,
    pets: input.petRoster?.pets.map(encodePet) ?? defaults.pets,
    selectedPetIndex: input.petRoster?.selectedIndex ?? defaults.selectedPetIndex,
  };
}

function createDefaultPlayerFeatureSave(): PlayerFeatureSaveV4 {
  return {
    heroId: 1,
    level: 1,
    currentExp: 0,
    skillLoadout: [null, null, null, null, null],
    skillLearning: {
      heroLevel: 1,
      soulCount: 0,
      trees: [{ treeLevel: 0, learnedSkills: [] }, { treeLevel: 0, learnedSkills: [] }],
      passiveSkills: [0, 0, 0, 0, 0],
    },
    inventory: createEmptyInventorySave(),
    equipment: encodeEquipmentLoadout(createEmptyEquipmentLoadout()),
    pets: [],
    selectedPetIndex: 0,
  };
}

function migrateLegacySave(
  savedAt: string,
  player1: Player1SaveV1,
  player2?: PlayerPetSaveV2,
  levelUnlockProgress?: LevelUnlockProgress,
): GameSaveV4 {
  return {
    version: GameSaveVersion,
    savedAt,
    player1: { ...player1, inventory: createEmptyInventorySave() },
    player2: {
      ...createDefaultPlayerFeatureSave(),
      pets: player2?.pets ?? [],
      selectedPetIndex: player2?.selectedPetIndex ?? 0,
    },
    levelUnlockProgress: sanitizeLevelUnlockProgress(levelUnlockProgress),
  };
}

function createEmptyInventorySave(): InventorySaveV4 {
  return {
    capacityPerCategory: 125,
    nextEquipmentInstanceId: 1,
    categories: { equipment: [], items: [], fashion: [], skillBooks: [] },
  };
}

function encodeInventoryStore(store: InventoryStore): InventorySaveV4 {
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
  saved: InventorySaveV4,
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
        restored.push({ kind: 'stack', stackId: typeof entry.stackId === 'string' ? entry.stackId : `${ownerSlot}-stack-${index}`, definition, quantity: clampInteger(entry.quantity, 1, 999_999) });
      }
    }
    store.categories[category] = restored.slice(0, store.capacityPerCategory);
  }
  return store;
}

function sanitizePlayerFeatureSave(value: PlayerFeatureSaveV4): PlayerFeatureSaveV4 {
  return {
    ...value,
    inventory: isValidInventorySave(value.inventory) ? value.inventory : createEmptyInventorySave(),
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

function encodePet(pet: PetState): PetSaveV1 {
  const { skillState: _skillState, autoBuffState: _autoBuffState, magicFlowerBuff: _magicFlowerBuff, ...persistent } = pet;
  return {
    ...persistent,
    skills: [...pet.skills],
  };
}

function decodePetRoster(
  savedPets: PetSaveV1[],
  selectedIndex: number,
  ownerSlot: PlayerSlot,
): PetRoster {
  const pets = savedPets
    .filter(isRecord)
    .map((value, index) => decodePet(value as unknown as PetSaveV1, index, ownerSlot));
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

function decodePet(saved: PetSaveV1, index: number, ownerSlot: PlayerSlot): PetState {
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

function isValidPlayer1Save(value: unknown): value is Player1SaveV1 {
  return isRecord(value) && Array.isArray(value.pets) &&
    Array.isArray(value.skillLoadout) && isRecord(value.skillLearning);
}

function isValidPlayerPetSave(value: unknown): value is PlayerPetSaveV2 {
  return isRecord(value) && Array.isArray(value.pets) &&
    Number.isFinite(value.selectedPetIndex);
}

function isValidInventorySave(value: unknown): value is InventorySaveV4 {
  return isRecord(value) && isRecord(value.categories);
}

function decodeSkillLoadout(saved: Player1SaveV1['skillLoadout']): HeroSkillLoadout {
  const slots = Array.from({ length: 5 }, (_, index): SkillBinding | null => {
    const entry = saved[index];
    if (!isRecord(entry) || !isKnownSkill(entry.skillName)) return null;
    return { skillName: entry.skillName, level: clampInteger(entry.level, 1, 18) };
  });
  return { slots: slots as unknown as HeroSkillLoadout['slots'] };
}

function cloneSkillLearning(state: HeroSkillLearningState): Player1SaveV1['skillLearning'] {
  return {
    heroLevel: state.heroLevel,
    soulCount: state.soulCount,
    trees: state.trees.map((tree) => ({
      treeLevel: tree.treeLevel,
      learnedSkills: tree.learnedSkills.map((skill) => ({ ...skill })),
    })),
    passiveSkills: [...state.passiveSkills],
  };
}

function decodeSkillLearning(saved: Player1SaveV1['skillLearning'], heroLevel: number): HeroSkillLearningState {
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
    soulCount: nonNegativeNumber(saved.soulCount),
    trees: trees as HeroSkillLearningState['trees'],
    passiveSkills: passive as HeroSkillLearningState['passiveSkills'],
  };
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
