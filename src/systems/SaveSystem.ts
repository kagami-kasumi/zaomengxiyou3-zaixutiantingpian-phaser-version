import type { EquipmentDefinition, EquipmentInstance, EquipmentLoadout, EquipmentSlot } from './EquipmentSystem';
import { createEmptyEquipmentLoadout } from './EquipmentSystem';
import type { HeroSkillLoadout, SkillBinding } from './HeroSkillSystem';
import type { HeroProgressionModel } from './ProgressionSystem';
import { getHeroExperienceToNextLevel, ProgressionTuning } from './ProgressionSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import { PetTuning } from './PetTuning';
import type { PetRoster, PetState } from './PetTypes';
import type { PlayerSlot } from './InputSystem';
import {
  createDefaultLevelUnlockProgress,
  sanitizeLevelUnlockProgress,
  type LevelUnlockProgress,
} from './Stage11FlowSystem';
import { HERO_SKILL_TREES, type AllSkillName, type HeroSkillLearningState } from './SkillUISystem';

export const GameSaveStorageKey = 'zaixu-tianding.save.v1';
export const GameSaveVersion = 3 as const;
export const PreviousGameSaveVersion = 2 as const;
export const LegacyGameSaveVersion = 1 as const;

export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type EquipmentSaveEntry = {
  fillName: string;
  instanceId: string;
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
  version: typeof PreviousGameSaveVersion;
  savedAt: string;
  player1: Player1SaveV1;
  player2: PlayerPetSaveV2;
};

export type GameSaveV3 = {
  version: typeof GameSaveVersion;
  savedAt: string;
  player1: Player1SaveV1;
  player2: PlayerPetSaveV2;
  levelUnlockProgress: LevelUnlockProgress;
};

export type CreateGameSaveInput = {
  progression: HeroProgressionModel;
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
  equipmentLoadout: EquipmentLoadout;
  petRoster: PetRoster;
  player2PetRoster?: PetRoster;
  levelUnlockProgress?: LevelUnlockProgress;
  now?: Date;
};

export type LoadedPlayer1State = {
  progression: HeroProgressionModel;
  skillLoadout: HeroSkillLoadout;
  skillLearning: HeroSkillLearningState;
  equipmentLoadout: EquipmentLoadout;
  petRoster: PetRoster;
};

const EquipmentSlots: readonly EquipmentSlot[] = [
  'weapon', 'armor', 'accessory', 'fashion', 'magicWeapon', 'title',
];
const KnownSkillNames = new Set<AllSkillName>(
  Object.values(HERO_SKILL_TREES).flatMap((trees) => trees.flatMap((tree) => tree.skills)),
);

export type LoadedGameState = LoadedPlayer1State & {
  player2PetRoster: PetRoster;
  levelUnlockProgress: LevelUnlockProgress;
};

export function createGameSave(input: CreateGameSaveInput): GameSaveV3 {
  return {
    version: GameSaveVersion,
    savedAt: (input.now ?? new Date()).toISOString(),
    player1: {
      heroId: input.progression.heroId,
      level: input.progression.level,
      currentExp: input.progression.currentExp,
      skillLoadout: input.skillLoadout.slots.map((binding) => binding ? { ...binding } : null),
      skillLearning: cloneSkillLearning(input.skillLearning),
      equipment: encodeEquipmentLoadout(input.equipmentLoadout),
      pets: input.petRoster.pets.map(encodePet),
      selectedPetIndex: input.petRoster.selectedIndex,
    },
    player2: encodePlayerPetRoster(input.player2PetRoster),
    levelUnlockProgress: sanitizeLevelUnlockProgress(input.levelUnlockProgress),
  };
}

export function serializeGameSave(save: GameSaveV3): string {
  return JSON.stringify(save);
}

export function parseGameSave(raw: string): GameSaveV3 | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || typeof value.savedAt !== 'string' || !isValidPlayer1Save(value.player1)) {
      return undefined;
    }
    if (value.version === LegacyGameSaveVersion) {
      return {
        version: GameSaveVersion,
        savedAt: value.savedAt,
        player1: value.player1 as Player1SaveV1,
        player2: { pets: [], selectedPetIndex: 0 },
        levelUnlockProgress: createDefaultLevelUnlockProgress(),
      };
    }
    if (value.version === PreviousGameSaveVersion) {
      if (!isValidPlayerPetSave(value.player2)) return undefined;
      return {
        version: GameSaveVersion,
        savedAt: value.savedAt,
        player1: value.player1 as Player1SaveV1,
        player2: value.player2,
        levelUnlockProgress: createDefaultLevelUnlockProgress(),
      };
    }
    if (value.version !== GameSaveVersion || !isValidPlayerPetSave(value.player2)) return undefined;
    return {
      ...(value as unknown as GameSaveV3),
      levelUnlockProgress: sanitizeLevelUnlockProgress(value.levelUnlockProgress),
    };
  } catch {
    return undefined;
  }
}

export function saveGame(storage: SaveStorage, save: GameSaveV3): void {
  storage.setItem(GameSaveStorageKey, serializeGameSave(save));
}

export function loadGame(storage: SaveStorage): GameSaveV3 | undefined {
  const raw = storage.getItem(GameSaveStorageKey);
  return raw === null ? undefined : parseGameSave(raw);
}

export function clearGameSave(storage: SaveStorage): void {
  storage.removeItem(GameSaveStorageKey);
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
  save: GameSaveV3,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedPlayer1State {
  const source = save.player1;
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
    petRoster: decodePetRoster(source.pets, source.selectedPetIndex, 'p1'),
  };
}

export function restoreGameState(
  save: GameSaveV3,
  equipmentRegistry: Record<string, EquipmentDefinition>,
): LoadedGameState {
  return {
    ...restorePlayer1State(save, equipmentRegistry),
    player2PetRoster: decodePetRoster(
      save.player2.pets,
      save.player2.selectedPetIndex,
      'p2',
    ),
    levelUnlockProgress: sanitizeLevelUnlockProgress(save.levelUnlockProgress),
  };
}

function encodePlayerPetRoster(roster?: PetRoster): PlayerPetSaveV2 {
  return {
    pets: roster?.pets.map(encodePet) ?? [],
    selectedPetIndex: roster?.selectedIndex ?? 0,
  };
}

function encodeEquipmentLoadout(loadout: EquipmentLoadout): Record<EquipmentSlot, EquipmentSaveEntry | null> {
  const result = {} as Record<EquipmentSlot, EquipmentSaveEntry | null>;
  for (const slot of EquipmentSlots) {
    const item = loadout[slot];
    result[slot] = item ? { fillName: item.definition.fillName, instanceId: item.instanceId } : null;
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
      definition,
      quantity: 1,
    };
    loadout[slot] = instance;
  }
  return loadout;
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
