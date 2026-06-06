import {
  spawnPetMonkey2LjProjectile,
  spawnPetMonkey2XjProjectile,
  spawnPetMonkey3LyqProjectile,
  spawnPetMonkey3XjProjectile,
  spawnPetMonkey3LjProjectile,
  spawnPetMonkey4JgaoyiProjectile,
  spawnPetMonkey1XjProjectile,
  spawnPetHorse1SpProjectile,
  spawnPetHorse2BdProjectile,
  spawnPetHorse3BzProjectile,
  spawnPetHorse4TmaoyiExplodeProjectile,
  spawnPetHorse4TmaoyiProjectile,
  type ProjectileModel,
  type ProjectileSystemModel,
} from './ProjectileSystem';

export type PetId = string;

export type PetState = {
  id: PetId;
  species: string;
  form: number;
  displayName: string;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  critBonusRate: number;
  skillDamageBonus: number;
  moveSpeed: number;
  lifetime: number;
  quality: number;
  hpQuality: number;
  mpQuality: number;
  atkQuality: number;
  defQuality: number;
  perception: number;
  technique: number;
  warpower: number;
  isActive: boolean;
  skills: string[];
  magicFlowerBuff?: PetMagicFlowerBuff;
  skillState?: PetSkillState;
  autoBuffState?: PetAutoBuffState;
};

export type PetMagicFlowerBuff = {
  kind: 'magicFlowerAddBuff';
  sourceName: string;
  attackMultiplier: number;
  totalMs: number;
  remainingMs: number;
};

export type PetSkillState = {
  monkey1Xj: PetMonkey1XjSkillState;
  monkey2Lj: PetMonkey2LjSkillState;
  monkey2Xj: PetMonkey2XjSkillState;
  monkey3Lyq: PetMonkey3LyqSkillState;
  monkey3Xj: PetMonkey3XjSkillState;
  monkey3Lj: PetMonkey3LjSkillState;
  monkey4Jgaoyi: PetMonkey4JgaoyiSkillState;
  horse1Sp: PetHorse1SpSkillState;
  horse2Bd: PetHorse2BdSkillState;
  horse3Bz: PetHorse3BzSkillState;
  horse4Tmaoyi: PetHorse4TmaoyiSkillState;
  lastResult: string;
};

export type PetAutoBuffState = {
  sxkb: PetAutoBuffEffectState;
  fsnl: PetAutoBuffEffectState;
  smjc: PetAutoBuffEffectState;
  mfjc: PetAutoBuffEffectState;
  gjjc: PetAutoBuffEffectState;
  fyjc: PetAutoBuffEffectState;
  lastResult: string;
};

export type PetAutoBuffEffectState = {
  counterMs: number;
  active?: PetAutoBuffActiveEffect;
};

export type PetAutoBuffActiveEffect = {
  kind: 'sxkb' | 'fsnl' | 'smjc' | 'mfjc' | 'gjjc' | 'fyjc';
  bonusPower?: number;
  bonusDefense?: number;
  bonusCritRate?: number;
  bonusSkillDamage?: number;
  bonusMaxHp?: number;
  bonusMaxMp?: number;
  totalMs: number;
  remainingMs: number;
};

export type PetAutoBuffOwnerStats = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  power: number;
  defense: number;
};

export type PetAutoBuffUpdateResult = {
  triggered: boolean;
  expired: boolean;
  message: string;
  pet?: PetState;
  mpBefore?: number;
  mpAfter?: number;
  bonusPower?: number;
  bonusDefense?: number;
  bonusCritRate?: number;
  bonusSkillDamage?: number;
  bonusMaxHp?: number;
  bonusMaxMp?: number;
};

export type PetMonkey1XjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey2LjSkillState = {
  cooldownMs: number;
};

export type PetMonkey2XjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey3LyqSkillState = {
  cooldownMs: number;
};

export type PetMonkey3XjSkillState = {
  cooldownMs: number;
};

export type PetMonkey3LjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey4JgaoyiSkillState = {
  cooldownMs: number;
};

export type PetHorse1SpSkillState = {
  cooldownMs: number;
};

export type PetHorse2BdSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetHorse3BzSkillState = {
  cooldownMs: number;
};

export type PetHorse4TmaoyiSkillState = {
  cooldownMs: number;
};

export type PetRoster = {
  pets: PetState[];
  selectedIndex: number;
  message: string;
};

export type PetRuntimeState = 'idle' | 'follow' | 'warp';

export type PetRuntimeModel = {
  petId: PetId;
  runtimeKey: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  state: PetRuntimeState;
};

export type PetFormChange = {
  fromForm: number;
  toForm: number;
  fromDisplayName: string;
  toDisplayName: string;
  level: number;
};

export type CapturableMonsterId =
  | 'Monster70'
  | 'Monster71'
  | 'Monster72'
  | 'Monster73'
  | 'Monster74'
  | 'Monster75'
  | 'Monster76'
  | 'Monster77'
  | 'Monster78';

export type CapturablePetDefinition = {
  monsterId: CapturableMonsterId;
  petName: string;
  displayName: string;
  species: string;
  form: number;
  probability: number;
};

export type CapturablePetTarget = {
  id: string;
  monsterId: CapturableMonsterId;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  removed: boolean;
  feedback: string;
};

export type MagicBottleEffect = {
  x: number;
  y: number;
  width: number;
  height: number;
  facingX: -1 | 1;
  ageMs: number;
};

export type MagicBottleCaptureModel = {
  equippedFillName: 'xhhl';
  soul: number;
  effect?: MagicBottleEffect;
  lastResult: string;
};

export type PetConsumableFillName = 'wphhd' | 'wpcsd' | 'djyys' | 'cwjnxld';

export type PetConsumableResult = {
  ok: boolean;
  shouldConsume: boolean;
  message: string;
  pet?: PetState;
  experience?: PetExperienceResult;
  skillReset?: PetSkillResetResult;
};

export type PetExperienceResult = {
  expBefore: number;
  expAfter: number;
  levelBefore: number;
  levelAfter: number;
  levelsGained: number;
  formChanges: PetFormChange[];
  expToNext: number;
  appliedExp: number;
};

export type MonsterExperienceShareResult = {
  heroExperience: number;
  petExperience: number;
  petResult?: PetExperienceResult;
};

export type PetOwnerSnapshot = {
  x: number;
  y: number;
  facingX: -1 | 1;
};

export type PetSkillTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
};

export type PetSkillCastResult = {
  ok: boolean;
  message: string;
  pet?: PetState;
  target?: PetSkillTarget;
  projectile?: ProjectileModel;
  damage?: number;
  mpBefore?: number;
  mpAfter?: number;
};

export type PetSkillSlotView = {
  slot: number;
  skillKey: string;
  name: string;
  info: string;
  isEmpty: boolean;
  isKnown: boolean;
};

export type PetSkillResetResult = {
  ok: boolean;
  message: string;
  pet: PetState;
  beforeSkills: string[];
  afterSkills: string[];
};

export type PetSkillRandomSource = () => number;

export type PetCounterRandomSource = () => number;

export const PetTuning = {
  maxSeats: 10,
  followMinDistance: 64,
  followOffsetX: 58,
  followOffsetY: 18,
  warpDistance: 1000,
  warpOffsetY: -30,
  magicBottleSoulCost: 5000,
  magicBottleEffectOffsetX: 70,
  magicBottleEffectWidth: 112,
  magicBottleEffectHeight: 86,
  magicBottleEffectLifetimeMs: 2_000,
  petLifetimeRecover: 20,
  petExperienceStoneExp: 30_000,
  maxLevel: 90,
  monkey1XjMpCost: 20,
  monkey1XjCooldownMs: 500,
  monkey1XjDamageMultiplier: 2.6,
  monkey2LjMpCost: 20,
  monkey2LjCooldownMs: 500,
  monkey2LjDamageMultiplier: 4.2,
  monkey2XjMpCost: 20,
  monkey2XjCooldownMs: 500,
  monkey2XjDamageMultiplier: 2.6,
  monkey3LyqMpCost: 20,
  monkey3LyqCooldownMs: 500,
  monkey3LyqDamageMultiplier: 6.8,
  monkey3LyqMaxDistance: 400,
  monkey3XjMpCost: 20,
  monkey3XjCooldownMs: 500,
  monkey3XjDamageMultiplier: 2.6,
  monkey3LjMpCost: 20,
  monkey3LjCooldownMs: 500,
  monkey3LjDamageMultiplier: 4.2,
  monkey4JgaoyiMpCost: 30,
  monkey4JgaoyiCooldownMs: 500,
  monkey4JgaoyiHit5Damage: 0,
  horse1SpMpCost: 20,
  horse1SpCooldownMs: 2_000,
  horse1SpDamageMultiplier: 3.6,
  horse1SpMinDistance: 50,
  horse1SpMaxDistance: 100,
  horse1SpIceMs: 2_000,
  horse2BdMpCost: 20,
  horse2BdCooldownMs: 2_000,
  horse2BdDamageMultiplier: 3.6,
  horse2BdIceMs: 2_000,
  horse3BzMpCost: 20,
  horse3BzCooldownMs: 6_000,
  horse3BzDamageMultiplier: 6.6,
  horse3BzMaxDistance: 250,
  horse3BzIceMs: 2_000,
  horse4TmaoyiMpCost: 30,
  horse4TmaoyiCooldownMs: 8_000,
  horse4TmaoyiHit5Damage: 0,
  horse4TmaoyiIceMsWithBd: 2_400,
  horse4TmaoyiExplosionDelayMsWithBd: 1_000,
  petSkillCritDamageMultiplier: 2,
  skillSlotCount: 8,
  autoBuffFrameMs: 1000 / 24,
  autoBuffInitialDelayFrames: 300,
  autoBuffSxkbRetriggerFrames: 4320,
  autoBuffFsnlRetriggerFrames: 5400,
  autoBuffGjjcRetriggerFrames: 5400,
  autoBuffSmjcRetriggerFrames: 5400,
  autoBuffMfjcRetriggerFrames: 5400,
  autoBuffFyjcRetriggerFrames: 5400,
  autoBuffSxkbMpCost: 20,
  autoBuffFsnlMpCost: 20,
  autoBuffGjjcMpCost: 20,
  autoBuffSmjcMpCost: 20,
  autoBuffMfjcMpCost: 20,
  autoBuffFyjcMpCost: 20,
  qlfjBaseChance: 0.05,
  qlfjFormChanceStep: 0.01,
  qlfjChanceMultiplier: 1.05,
} as const;

export const PetBaseSkillCandidates = [
  'tsml',
  'zrsh',
  'smzf',
  'mfby',
  'qlfj',
  'sxkb',
  'fsnl',
  'smjc',
  'mfjc',
  'gjjc',
  'fyjc',
] as const;

export const PetSkillInfoByKey: Record<string, { name: string; info: string }> = {
  tsml: { name: '天生蛮力', info: '提升宠物攻击' },
  zrsh: { name: '自然守护', info: '提升宠物防御' },
  smzf: { name: '生命祝福', info: '提升宠物生命' },
  mfby: { name: '魔法庇佑', info: '提升宠物魔法' },
  qlfj: { name: '强力反击', info: '被攻击时反击' },
  sxkb: { name: '嗜血狂暴', info: '自动提升宠物暴击' },
  fsnl: { name: '法术能量', info: '自动提升宠物技能伤害' },
  smjc: { name: '生命加成', info: '自动提升主人生命' },
  mfjc: { name: '魔法加成', info: '自动提升主人魔法' },
  gjjc: { name: '攻击加成', info: '自动提升主人攻击' },
  fyjc: { name: '防御加成', info: '自动提升主人防御' },
  xj: { name: '献祭', info: '附近有怪物时自动燃烧造成火焰伤害' },
  lj: { name: '连击', info: '对怪物造成多次伤害' },
  lyq: { name: '烈焰拳', info: '对前方怪物造成火焰伤害' },
  jgaoyi: { name: '金刚奥义', info: '拥有献祭、连击、烈焰拳才能发挥最大威力' },
  sp: { name: '水泡', info: '吐出水泡攻击前方怪物' },
  bd: { name: '冰冻', info: '受击后反击并冰冻怪物' },
  bz: { name: '冰锥', info: '攻击前方较远范围内的怪物' },
  tmaoyi: { name: '天马奥义', info: '拥有水泡、冰冻、冰锥才能发挥最大威力' },
};

const PetHpByLevel = [
  840, 840, 870, 900, 930, 1080, 1350, 1980, 2130, 2250,
  2400, 2580, 2730, 2880, 3030, 3180, 3330, 3480, 3630, 4551,
  5475, 6174, 6873, 7575, 7725, 12000, 16239, 17619, 18600, 19779,
  21000, 22779, 26112, 26541, 26970, 27399, 27828, 28257, 28686, 29115,
  29544, 29973, 30402, 31167, 31917, 32667, 33417, 34167, 34917, 35667,
  36417, 37167, 37917, 38667, 39417, 40167, 40917, 41667, 42417, 43167,
  43917, 44667, 45417, 46191, 48792, 51483, 54174, 56985, 59556, 62247,
  64938, 67629, 70320, 73011, 75702, 78393, 81084, 83775, 86466, 89157,
  91848, 94539, 97230, 99921, 102612, 105303, 107994, 110685, 113376, 116067,
] as const;

const PetDefenseByLevel = [
  7, 13, 19, 25, 31, 37, 43, 48, 50, 52,
  54, 56, 82, 108, 110, 112, 114, 116, 118, 120,
  122, 167, 212, 258, 260, 280, 321, 361, 363, 365,
  385, 405, 425, 445, 465, 485, 505, 525, 545, 567,
  577, 587, 597, 607, 617, 627, 637, 647, 657, 667,
  682, 707, 727, 757, 907, 1257, 1457, 1657, 1937, 2027,
  2115, 2178, 2241, 2304, 2367, 2430, 2493, 2556, 2619, 2682,
  2745, 2808, 2872, 3013, 3154, 3295, 3436, 3577, 3718, 3862,
  4111, 4118, 4120, 4122, 4124, 4501, 4878, 5255, 5632, 5998,
] as const;

const PetSpeciesBaseStats: Record<string, { maxMp: number; atk: number }> = {
  monkey: { maxMp: 150, atk: 20 },
  horse: { maxMp: 250, atk: 25 },
  ufo: { maxMp: 150, atk: 30 },
  mouse: { maxMp: 200, atk: 32 },
  dragon: { maxMp: 175, atk: 25 },
  turtle: { maxMp: 150, atk: 25 },
  tigress: { maxMp: 150, atk: 30 },
  phoenix: { maxMp: 200, atk: 32 },
  roomhorse: { maxMp: 800, atk: 50 },
  rabbit: { maxMp: 200, atk: 30 },
};

export const CapturablePetDefinitions: Record<CapturableMonsterId, CapturablePetDefinition> = {
  Monster70: createCapturablePetDefinition('Monster70', 'horse1', '小马', 'horse', 1, 0.4),
  Monster71: createCapturablePetDefinition('Monster71', 'horse2', '小马', 'horse', 2, 0.7),
  Monster72: createCapturablePetDefinition('Monster72', 'monkey1', '小猴', 'monkey', 1, 0.4),
  Monster73: createCapturablePetDefinition('Monster73', 'monkey2', '小猴', 'monkey', 2, 0.7),
  Monster74: createCapturablePetDefinition('Monster74', 'tigress1', '小虎', 'tigress', 1, 0.4),
  Monster75: createCapturablePetDefinition('Monster75', 'turtle1', '小龟', 'turtle', 1, 0.4),
  Monster76: createCapturablePetDefinition('Monster76', 'phoenix1', '小雀', 'phoenix', 1, 0.4),
  Monster77: createCapturablePetDefinition('Monster77', 'dragon1', '小龙', 'dragon', 1, 0.4),
  Monster78: createCapturablePetDefinition('Monster78', 'rabbit1', '小兔', 'rabbit', 1, 0.4),
};

function createSeedMonkeyPet(params: {
  id: string;
  form: number;
  displayName: string;
  isActive: boolean;
  skills: string[];
}): PetState {
  const qualities = createDefaultPetQualities();
  const stats = getPetBaseStats('monkey', 1, qualities);
  return {
    id: params.id,
    species: 'monkey',
    form: params.form,
    displayName: params.displayName,
    level: 1,
    exp: 0,
    expToNext: getPetExperienceToNextLevel(1),
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mp: stats.maxMp,
    maxMp: stats.maxMp,
    atk: stats.atk,
    def: stats.def,
    critBonusRate: 0,
    skillDamageBonus: 0,
    moveSpeed: 5,
    lifetime: 100,
    quality: 1,
    ...qualities,
    perception: 1,
    technique: 1,
    warpower: 1,
    isActive: params.isActive,
    skills: params.skills,
    skillState: createPetSkillState(),
  };
}

function createSeedHorsePet(params: {
  id: string;
  form: number;
  displayName: string;
  isActive: boolean;
  skills: string[];
}): PetState {
  const qualities = createDefaultPetQualities();
  const stats = getPetBaseStats('horse', 1, qualities);
  return {
    id: params.id,
    species: 'horse',
    form: params.form,
    displayName: params.displayName,
    level: 1,
    exp: 0,
    expToNext: getPetExperienceToNextLevel(1),
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mp: stats.maxMp,
    maxMp: stats.maxMp,
    atk: stats.atk,
    def: stats.def,
    critBonusRate: 0,
    skillDamageBonus: 0,
    moveSpeed: 5,
    lifetime: 100,
    quality: 1,
    ...qualities,
    perception: 1,
    technique: 1,
    warpower: 1,
    isActive: params.isActive,
    skills: params.skills,
    skillState: createPetSkillState(),
  };
}

export function createSeedPetRoster(): PetRoster {
  return {
    pets: [
      createSeedMonkeyPet({
        id: 'pet-monkey-1',
        form: 1,
        displayName: '小猴',
        isActive: true,
        skills: ['tsml', 'xj'],
      }),
      createSeedMonkeyPet({
        id: 'pet-monkey-2',
        form: 2,
        displayName: '小猴 F2',
        isActive: false,
        skills: ['tsml', 'lj', 'xj'],
      }),
      createSeedMonkeyPet({
        id: 'pet-monkey-3',
        form: 3,
        displayName: '小猴 F3',
        isActive: false,
        skills: ['tsml', 'lyq', 'xj', 'lj'],
      }),
      createSeedMonkeyPet({
        id: 'pet-monkey-4',
        form: 4,
        displayName: '小猴 F4',
        isActive: false,
        skills: ['tsml', 'xj', 'lj', 'lyq', 'jgaoyi'],
      }),
      createSeedHorsePet({
        id: 'pet-horse-1',
        form: 1,
        displayName: '小马',
        isActive: false,
        skills: ['tsml', 'sp'],
      }),
      createSeedHorsePet({
        id: 'pet-horse-2',
        form: 2,
        displayName: '小马 F2',
        isActive: false,
        skills: ['tsml', 'sp', 'bd'],
      }),
      createSeedHorsePet({
        id: 'pet-horse-3',
        form: 3,
        displayName: '小马 F3',
        isActive: false,
        skills: ['tsml', 'sp', 'bd', 'bz'],
      }),
      createSeedHorsePet({
        id: 'pet-horse-4',
        form: 4,
        displayName: '小马 F4',
        isActive: false,
        skills: ['tsml', 'sp', 'bd', 'bz', 'tmaoyi'],
      }),
    ],
    selectedIndex: 0,
    message: 'Pet ready',
  };
}

export function createMagicBottleCaptureModel(initialSoul = 8_000): MagicBottleCaptureModel {
  return {
    equippedFillName: 'xhhl',
    soul: initialSoul,
    lastResult: 'xhhl ready',
  };
}

export function encodePetSkillSaveString(skills: readonly string[]): string {
  return skills.join('~');
}

export function decodePetSkillSaveString(value: string): string[] {
  if (value === '') {
    return [];
  }

  return value.split('~');
}

export function getPetSkillDisplay(skillKey: string): { name: string; info: string; isKnown: boolean } {
  const info = PetSkillInfoByKey[skillKey];
  if (!info) {
    return {
      name: skillKey || 'unknown',
      info: 'unknown pet skill',
      isKnown: false,
    };
  }

  return { ...info, isKnown: true };
}

export function buildPetSkillSlotViews(pet: PetState): PetSkillSlotView[] {
  const slots: PetSkillSlotView[] = [];
  for (let index = 0; index < PetTuning.skillSlotCount; index += 1) {
    const skillKey = pet.skills[index] ?? '';
    if (skillKey === '') {
      slots.push({
        slot: index + 1,
        skillKey: '',
        name: '',
        info: '',
        isEmpty: true,
        isKnown: true,
      });
      continue;
    }

    const display = getPetSkillDisplay(skillKey);
    slots.push({
      slot: index + 1,
      skillKey,
      name: display.name,
      info: display.info,
      isEmpty: false,
      isKnown: display.isKnown,
    });
  }

  return slots;
}

export function applyPetSkillSaveString(pet: PetState, value: string): void {
  pet.skills = decodePetSkillSaveString(value);
}

export function resetPetSkillsByLevel(
  pet: PetState,
  random: PetSkillRandomSource = Math.random,
): PetSkillResetResult {
  const beforeSkills = [...pet.skills];
  pet.skills = [];
  const candidates = buildPetSkillCandidatePool(pet);

  for (let level = 2; level <= pet.level; level += 1) {
    tryStudyPetSkillAtLevel(pet, candidates, level, random);
  }

  const message = `${pet.displayName} 技能已重置`;
  return {
    ok: true,
    message,
    pet,
    beforeSkills,
    afterSkills: [...pet.skills],
  };
}

export function getSelectedPet(roster: PetRoster): PetState | undefined {
  return roster.pets[roster.selectedIndex];
}

export function getActivePet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive && pet.lifetime > 0);
}

export function getCurrentPet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive);
}

export function selectPet(roster: PetRoster, direction: 1 | -1): void {
  if (roster.pets.length === 0) {
    roster.selectedIndex = 0;
    roster.message = 'No pets';
    return;
  }

  roster.selectedIndex =
    (roster.selectedIndex + direction + roster.pets.length) % roster.pets.length;
  roster.message = `Selected ${roster.pets[roster.selectedIndex].displayName}`;
}

export function setSelectedPetActive(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  if (selected.hp <= 0) {
    roster.message = `${selected.displayName} needs rest`;
    return false;
  }

  if (selected.lifetime <= 0) {
    roster.message = `${selected.displayName} has no lifetime`;
    return false;
  }

  for (const pet of roster.pets) {
    pet.isActive = pet.id === selected.id;
  }
  roster.message = `${selected.displayName} deployed`;
  return true;
}

export function restSelectedPet(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  selected.isActive = false;
  roster.message = `${selected.displayName} resting`;
  return true;
}

export function toggleSelectedPetActive(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  return selected.isActive ? restSelectedPet(roster) : setSelectedPetActive(roster);
}

export function catchNewPet(
  roster: PetRoster,
  petName: string,
  level = 1,
): PetState | undefined {
  if (roster.pets.length >= PetTuning.maxSeats) {
    roster.message = '宠物栏已满！';
    return undefined;
  }

  const definition = findCapturablePetDefinitionByPetName(petName);
  const pet = createPetStateFromDefinition(
    definition ?? createFallbackPetDefinition(petName),
    level,
    roster.pets.length + 1,
  );
  roster.pets.push(pet);
  roster.selectedIndex = roster.pets.length - 1;
  roster.message = `捕捉成功：${pet.displayName}`;
  return pet;
}

export function markActivePetSkillTriggered(roster: PetRoster): boolean {
  const pet = getActivePet(roster);
  if (!pet) {
    roster.message = 'No active pet skill trigger';
    return false;
  }

  const state = ensurePetSkillState(pet);
  if (pet.species === 'monkey' && pet.form === 2) {
    state.monkey2Xj.releaseReady = true;
  } else if (pet.species === 'monkey' && pet.form === 3) {
    state.monkey3Lj.releaseReady = true;
  } else if (pet.species === 'horse' && pet.form === 2) {
    state.horse2Bd.releaseReady = true;
  } else {
    state.monkey1Xj.releaseReady = true;
  }
  roster.message = `${pet.displayName} skill trigger ready`;
  return true;
}

export function updatePetSkillState(roster: PetRoster, deltaMs: number): void {
  for (const pet of roster.pets) {
    const state = pet.skillState;
    if (!state) {
      continue;
    }

    state.monkey1Xj.cooldownMs = Math.max(0, state.monkey1Xj.cooldownMs - Math.max(0, deltaMs));
    state.monkey2Lj.cooldownMs = Math.max(0, state.monkey2Lj.cooldownMs - Math.max(0, deltaMs));
    state.monkey2Xj.cooldownMs = Math.max(0, state.monkey2Xj.cooldownMs - Math.max(0, deltaMs));
    state.monkey3Lyq.cooldownMs = Math.max(0, state.monkey3Lyq.cooldownMs - Math.max(0, deltaMs));
    state.monkey3Xj.cooldownMs = Math.max(0, state.monkey3Xj.cooldownMs - Math.max(0, deltaMs));
    state.monkey3Lj.cooldownMs = Math.max(0, state.monkey3Lj.cooldownMs - Math.max(0, deltaMs));
    state.monkey4Jgaoyi.cooldownMs = Math.max(0, state.monkey4Jgaoyi.cooldownMs - Math.max(0, deltaMs));
    state.horse1Sp.cooldownMs = Math.max(0, state.horse1Sp.cooldownMs - Math.max(0, deltaMs));
    state.horse2Bd.cooldownMs = Math.max(0, state.horse2Bd.cooldownMs - Math.max(0, deltaMs));
    state.horse3Bz.cooldownMs = Math.max(0, state.horse3Bz.cooldownMs - Math.max(0, deltaMs));
    state.horse4Tmaoyi.cooldownMs = Math.max(0, state.horse4Tmaoyi.cooldownMs - Math.max(0, deltaMs));
  }
}

export function updatePetAutoBuffs(params: {
  roster: PetRoster;
  ownerStats: PetAutoBuffOwnerStats;
  deltaMs: number;
}): PetAutoBuffUpdateResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return {
      triggered: false,
      expired: false,
      message: 'No active pet',
    };
  }

  const state = ensurePetAutoBuffState(pet);
  const deltaMs = Math.max(0, params.deltaMs);
  let expired = false;

  if (updateActivePetAutoBuffEffect(params.roster, pet, state.sxkb, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.fsnl, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.smjc, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.mfjc, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.gjjc, params.ownerStats, deltaMs)) {
    expired = true;
  }
  if (updateActivePetAutoBuffEffect(params.roster, pet, state.fyjc, params.ownerStats, deltaMs)) {
    expired = true;
  }

  state.sxkb.counterMs = Math.max(0, state.sxkb.counterMs - deltaMs);
  state.fsnl.counterMs = Math.max(0, state.fsnl.counterMs - deltaMs);
  state.smjc.counterMs = Math.max(0, state.smjc.counterMs - deltaMs);
  state.mfjc.counterMs = Math.max(0, state.mfjc.counterMs - deltaMs);
  state.gjjc.counterMs = Math.max(0, state.gjjc.counterMs - deltaMs);
  state.fyjc.counterMs = Math.max(0, state.fyjc.counterMs - deltaMs);

  const sxkbResult = tryTriggerPetSxkbAutoBuff(params.roster, pet, state);
  if (sxkbResult) {
    return {
      ...sxkbResult,
      expired,
    };
  }

  const fsnlResult = tryTriggerPetFsnlAutoBuff(params.roster, pet, state);
  if (fsnlResult) {
    return {
      ...fsnlResult,
      expired,
    };
  }

  const smjcResult = tryTriggerPetSmjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (smjcResult) {
    return {
      ...smjcResult,
      expired,
    };
  }

  const mfjcResult = tryTriggerPetMfjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (mfjcResult) {
    return {
      ...mfjcResult,
      expired,
    };
  }

  const gjjcResult = tryTriggerPetGjjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (gjjcResult) {
    return {
      ...gjjcResult,
      expired,
    };
  }

  const fyjcResult = tryTriggerPetFyjcAutoBuff(params.roster, pet, state, params.ownerStats);
  if (fyjcResult) {
    return {
      ...fyjcResult,
      expired,
    };
  }

  return {
    triggered: false,
    expired,
    message: state.lastResult,
    pet,
  };
}

export function requestPetQlfjCounterAttack(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  random?: PetCounterRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  if (!pet.skills.includes('qlfj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned qlfj`, pet);
  }

  if (pet.hp <= 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlfj cannot counter while defeated`, pet);
  }

  const chance = calculatePetQlfjCounterChance(pet);
  const roll = Math.max(0, Math.min(1, params.random?.() ?? Math.random()));
  if (roll > chance) {
    const message = `${pet.displayName} qlfj missed roll:${roll.toFixed(3)} chance:${chance.toFixed(3)}`;
    ensurePetSkillState(pet).lastResult = message;
    params.roster.message = message;
    return {
      ok: false,
      message,
      pet,
      mpBefore: pet.mp,
      mpAfter: pet.mp,
    };
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} qlfj has no target`, pet);
  }

  const damage = pet.atk;
  const message = `${pet.displayName} qlfj counter -> ${target.id} ${damage.toFixed(1)}`;
  ensurePetSkillState(pet).lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    damage,
    mpBefore: pet.mp,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey1XjSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 1) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey1`, pet);
  }

  if (!pet.skills.includes('xj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xj`, pet);
  }

  if (pet.mp < PetTuning.monkey1XjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xj`, pet);
  }

  if (!state.monkey1Xj.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj trigger not ready`, pet);
  }

  if (state.monkey1Xj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj cooling ${Math.ceil(state.monkey1Xj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey1XjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey1XjMpCost);
  state.monkey1Xj.releaseReady = false;
  state.monkey1Xj.cooldownMs = PetTuning.monkey1XjCooldownMs;

  const projectile = spawnPetMonkey1XjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} xj -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey2LjSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey2`, pet);
  }

  if (!pet.skills.includes('lj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned lj`, pet);
  }

  if (pet.mp < PetTuning.monkey2LjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for lj`, pet);
  }

  if (state.monkey2Lj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj cooling ${Math.ceil(state.monkey2Lj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey2LjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey2LjMpCost);
  state.monkey2Lj.cooldownMs = PetTuning.monkey2LjCooldownMs;

  const projectile = spawnPetMonkey2LjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} lj -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey2XjSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey2`, pet);
  }

  if (!pet.skills.includes('xj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xj`, pet);
  }

  if (pet.mp < PetTuning.monkey2XjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xj`, pet);
  }

  if (!state.monkey2Xj.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj trigger not ready`, pet);
  }

  if (state.monkey2Xj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj cooling ${Math.ceil(state.monkey2Xj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey2XjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey2XjMpCost);
  state.monkey2Xj.releaseReady = false;
  state.monkey2Xj.cooldownMs = PetTuning.monkey2XjCooldownMs;

  const projectile = spawnPetMonkey2XjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} xj -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey3LyqSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey3`, pet);
  }

  if (!pet.skills.includes('lyq')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned lyq`, pet);
  }

  if (pet.mp < PetTuning.monkey3LyqMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for lyq`, pet);
  }

  if (state.monkey3Lyq.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lyq cooling ${Math.ceil(state.monkey3Lyq.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lyq has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.monkey3LyqMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lyq target too far ${Math.ceil(distance)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey3LyqDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey3LyqMpCost);
  state.monkey3Lyq.cooldownMs = PetTuning.monkey3LyqCooldownMs;

  const projectile = spawnPetMonkey3LyqProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} lyq -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey3XjSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey3`, pet);
  }

  if (!pet.skills.includes('xj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned xj`, pet);
  }

  if (pet.mp < PetTuning.monkey3XjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for xj`, pet);
  }

  if (state.monkey3Xj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj cooling ${Math.ceil(state.monkey3Xj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} xj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey3XjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey3XjMpCost);
  state.monkey3Xj.cooldownMs = PetTuning.monkey3XjCooldownMs;

  const projectile = spawnPetMonkey3XjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} xj -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey3LjSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey3`, pet);
  }

  if (!pet.skills.includes('lj')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned lj`, pet);
  }

  if (pet.mp < PetTuning.monkey3LjMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for lj`, pet);
  }

  if (!state.monkey3Lj.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj trigger not ready`, pet);
  }

  if (state.monkey3Lj.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj cooling ${Math.ceil(state.monkey3Lj.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} lj has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.monkey3LjDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey3LjMpCost);
  state.monkey3Lj.releaseReady = false;
  state.monkey3Lj.cooldownMs = PetTuning.monkey3LjCooldownMs;

  const projectile = spawnPetMonkey3LjProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} lj -> ${target.id} ${damage.toFixed(1)}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetMonkey4JgaoyiSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'monkey' || pet.form !== 4) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not monkey4`, pet);
  }

  if (!pet.skills.includes('jgaoyi')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned jgaoyi`, pet);
  }

  if (pet.mp < PetTuning.monkey4JgaoyiMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for jgaoyi`, pet);
  }

  if (state.monkey4Jgaoyi.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} jgaoyi cooling ${Math.ceil(state.monkey4Jgaoyi.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} jgaoyi has no target`, pet);
  }

  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.monkey4JgaoyiMpCost);
  state.monkey4Jgaoyi.cooldownMs = PetTuning.monkey4JgaoyiCooldownMs;

  const projectile = spawnPetMonkey4JgaoyiProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  });

  const message = `${pet.displayName} jgaoyi -> ${target.id} hit5`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage: PetTuning.monkey4JgaoyiHit5Damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetHorse1SpSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'horse' || pet.form !== 1) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse1`, pet);
  }

  if (!pet.skills.includes('sp')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned sp`, pet);
  }

  if (pet.mp < PetTuning.horse1SpMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for sp`, pet);
  }

  if (state.horse1Sp.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp cooling ${Math.ceil(state.horse1Sp.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance < PetTuning.horse1SpMinDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp target too close ${Math.floor(distance)}`, pet);
  }
  if (distance > PetTuning.horse1SpMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} sp target too far ${Math.ceil(distance)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.horse1SpDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.horse1SpMpCost);
  state.horse1Sp.cooldownMs = PetTuning.horse1SpCooldownMs;

  const projectile = spawnPetHorse1SpProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} sp -> ${target.id} ${damage.toFixed(1)} ice`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetHorse2BdSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'horse' || pet.form !== 2) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse2`, pet);
  }

  if (!pet.skills.includes('bd')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned bd`, pet);
  }

  if (pet.mp < PetTuning.horse2BdMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for bd`, pet);
  }

  if (!state.horse2Bd.releaseReady) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bd trigger not ready`, pet);
  }

  if (state.horse2Bd.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bd cooling ${Math.ceil(state.horse2Bd.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bd has no target`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.horse2BdDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.horse2BdMpCost);
  state.horse2Bd.releaseReady = false;
  state.horse2Bd.cooldownMs = PetTuning.horse2BdCooldownMs;

  const projectile = spawnPetHorse2BdProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} bd -> ${target.id} ${damage.toFixed(1)} ice`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetHorse3BzSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'horse' || pet.form !== 3) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse3`, pet);
  }

  if (!pet.skills.includes('bz')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned bz`, pet);
  }

  if (pet.mp < PetTuning.horse3BzMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for bz`, pet);
  }

  if (state.horse3Bz.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bz cooling ${Math.ceil(state.horse3Bz.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bz has no target`, pet);
  }

  const distance = getPetSkillDistance(params.runtime, target);
  if (distance > PetTuning.horse3BzMaxDistance) {
    return setPetSkillFailure(params.roster, `${pet.displayName} bz target too far ${Math.ceil(distance)}`, pet);
  }

  const mpBefore = pet.mp;
  const damage = calculatePetSkillDamage(pet, PetTuning.horse3BzDamageMultiplier, params.random);
  pet.mp = Math.max(0, pet.mp - PetTuning.horse3BzMpCost);
  state.horse3Bz.cooldownMs = PetTuning.horse3BzCooldownMs;

  const projectile = spawnPetHorse3BzProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, damage);

  const message = `${pet.displayName} bz -> ${target.id} ${damage.toFixed(1)} ice`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestPetHorse4TmaoyiSkill(params: {
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: readonly PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet) {
    return setPetSkillFailure(params.roster, 'No active pet');
  }

  const state = ensurePetSkillState(pet);
  if (pet.species !== 'horse' || pet.form !== 4) {
    return setPetSkillFailure(params.roster, `${pet.displayName} is not horse4`, pet);
  }

  if (!pet.skills.includes('tmaoyi')) {
    return setPetSkillFailure(params.roster, `${pet.displayName} has not learned tmaoyi`, pet);
  }

  if (pet.mp < PetTuning.horse4TmaoyiMpCost) {
    return setPetSkillFailure(params.roster, `${pet.displayName} MP not enough for tmaoyi`, pet);
  }

  if (state.horse4Tmaoyi.cooldownMs > 0) {
    return setPetSkillFailure(params.roster, `${pet.displayName} tmaoyi cooling ${Math.ceil(state.horse4Tmaoyi.cooldownMs)}ms`, pet);
  }

  const target = selectPetSkillTarget(params.runtime, params.targets);
  if (!target) {
    return setPetSkillFailure(params.roster, `${pet.displayName} tmaoyi has no target`, pet);
  }

  const hasSp = pet.skills.includes('sp');
  const hasBd = pet.skills.includes('bd');
  const hasBz = pet.skills.includes('bz');
  const explosionDamage = hasBz
    ? calculatePetSkillDamage(pet, PetTuning.horse3BzDamageMultiplier, params.random)
    : undefined;
  const mpBefore = pet.mp;
  pet.mp = Math.max(0, pet.mp - PetTuning.horse4TmaoyiMpCost);
  state.horse4Tmaoyi.cooldownMs = PetTuning.horse4TmaoyiCooldownMs;

  const projectile = spawnPetHorse4TmaoyiProjectile(params.projectiles, {
    sourceId: pet.id,
    x: target.x,
    y: target.y,
    facingX: getPetSkillFacing(params.runtime, target),
  }, {
    targetId: target.id,
    tracksTarget: hasSp,
    magicIceMs: hasBd ? PetTuning.horse4TmaoyiIceMsWithBd : undefined,
    explosionDelayMs: hasBd && hasBz ? PetTuning.horse4TmaoyiExplosionDelayMsWithBd : undefined,
    explosionDamage,
  });

  if (hasBz && explosionDamage !== undefined) {
    spawnPetHorse4TmaoyiExplodeProjectile(params.projectiles, {
      sourceId: pet.id,
      x: target.x,
      y: target.y,
      facingX: getPetSkillFacing(params.runtime, target),
    }, explosionDamage);
  }

  const comboText = `${hasSp ? 'sp-track' : 'drop'}${hasBd ? '+bd-ice' : ''}${hasBz ? '+bz-explode' : ''}`;
  const message = `${pet.displayName} tmaoyi -> ${target.id} ${comboText}`;
  state.lastResult = message;
  params.roster.message = message;
  return {
    ok: true,
    message,
    pet,
    target,
    projectile,
    damage: PetTuning.horse4TmaoyiHit5Damage,
    mpBefore,
    mpAfter: pet.mp,
  };
}

export function requestMagicBottleCapture(params: {
  model: MagicBottleCaptureModel;
  owner: PetOwnerSnapshot;
  inputMagicWeapon: boolean;
  previousInputMagicWeapon: boolean;
}): boolean {
  if (!params.inputMagicWeapon || params.previousInputMagicWeapon) {
    return false;
  }

  if (params.model.soul < PetTuning.magicBottleSoulCost) {
    params.model.lastResult = '灵魂不足5000，无法捕捉！';
    params.model.effect = undefined;
    return false;
  }

  params.model.effect = {
    x: params.owner.x + params.owner.facingX * PetTuning.magicBottleEffectOffsetX,
    y: params.owner.y - 54,
    width: PetTuning.magicBottleEffectWidth,
    height: PetTuning.magicBottleEffectHeight,
    facingX: params.owner.facingX,
    ageMs: 0,
  };
  params.model.lastResult = '宣花葫芦投掷';
  return true;
}

export function updateMagicBottleCapture(
  model: MagicBottleCaptureModel,
  deltaMs: number,
): void {
  if (!model.effect) {
    return;
  }

  model.effect.ageMs += deltaMs;
  if (model.effect.ageMs >= PetTuning.magicBottleEffectLifetimeMs) {
    model.effect = undefined;
    model.lastResult = '宣花葫芦待机';
  }
}

export function resolveMagicBottleCaptureHit(params: {
  model: MagicBottleCaptureModel;
  roster: PetRoster;
  targets: readonly CapturablePetTarget[];
  random?: () => number;
}): CapturablePetTarget | undefined {
  const effect = params.model.effect;
  if (!effect) {
    return undefined;
  }

  const target = params.targets.find((candidate) =>
    !candidate.removed && rectanglesOverlap(effect, candidate)
  );
  if (!target) {
    return undefined;
  }

  const definition = CapturablePetDefinitions[target.monsterId];
  params.model.soul = Math.max(0, params.model.soul - PetTuning.magicBottleSoulCost);
  params.model.effect = undefined;

  if ((params.random ?? Math.random)() > definition.probability) {
    target.feedback = '捕捉失败！';
    params.model.lastResult = `捕捉失败！${definition.petName}`;
    return target;
  }

  const pet = catchNewPet(params.roster, definition.petName, target.level);
  if (!pet) {
    target.feedback = '宠物栏已满！';
    params.model.lastResult = '宠物栏已满！';
    return target;
  }

  target.removed = true;
  target.feedback = '捕捉成功！';
  params.model.lastResult = `捕捉成功！${pet.displayName}`;
  return target;
}

export function isPetConsumableFillName(fillName: string): fillName is PetConsumableFillName {
  return fillName === 'wphhd' || fillName === 'wpcsd' || fillName === 'djyys' || fillName === 'cwjnxld';
}

export function usePetConsumable(
  roster: PetRoster,
  fillName: PetConsumableFillName,
  random: PetSkillRandomSource = Math.random,
): PetConsumableResult {
  const pet = getCurrentPet(roster);
  if (!pet) {
    const message = '没有出战宠物，不能使用宠物道具';
    roster.message = message;
    return { ok: false, shouldConsume: false, message };
  }

  if (fillName === 'wpcsd') {
    const before = pet.lifetime;
    pet.lifetime = Math.min(100, pet.lifetime + PetTuning.petLifetimeRecover);
    const message = `${pet.displayName} 寿命 ${before}->${pet.lifetime}`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet };
  }

  if (fillName === 'wphhd') {
    pet.hp = pet.maxHp;
    pet.mp = pet.maxMp;
    pet.lifetime = Math.max(1, pet.lifetime);
    const message = `${pet.displayName} 状态已恢复`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet };
  }

  if (fillName === 'djyys') {
    const experience = addPetExperience(pet, PetTuning.petExperienceStoneExp);
    const message = experience.levelsGained > 0
      ? `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp} Lv.${experience.levelBefore}->${experience.levelAfter}`
      : `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp}`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet, experience };
  }

  const skillReset = resetPetSkillsByLevel(pet, random);
  roster.message = skillReset.message;
  return {
    ok: true,
    shouldConsume: true,
    message: skillReset.message,
    pet,
    skillReset,
  };
}

export function awardMonsterExperienceWithCurrentPet(
  roster: PetRoster,
  monsterExperience: number,
): MonsterExperienceShareResult {
  const activePet = getCurrentPet(roster);
  const normalizedExperience = Math.max(0, Math.floor(monsterExperience));
  if (!activePet) {
    return {
      heroExperience: normalizedExperience,
      petExperience: 0,
    };
  }

  const sharedExperience = Math.floor(normalizedExperience * 0.6);
  const petResult = addPetExperience(activePet, sharedExperience);
  roster.message = petResult.levelsGained > 0
    ? `${activePet.displayName} 获得 ${sharedExperience} 经验 Lv.${petResult.levelBefore}->${petResult.levelAfter}`
    : `${activePet.displayName} 获得 ${sharedExperience} 经验`;

  return {
    heroExperience: sharedExperience,
    petExperience: sharedExperience,
    petResult,
  };
}

export function addPetExperience(pet: PetState, amount: number): PetExperienceResult {
  const appliedExp = Math.max(0, Math.floor(amount));
  const levelBefore = pet.level;
  const expBefore = pet.exp;
  const formChanges: PetFormChange[] = [];

  pet.expToNext = getPetExperienceToNextLevel(pet.level);
  if (appliedExp <= 0) {
    return createPetExperienceResult(pet, levelBefore, expBefore, 0, appliedExp, formChanges);
  }

  pet.exp += appliedExp;
  let levelsGained = 0;

  while (pet.level < PetTuning.maxLevel && pet.exp >= pet.expToNext) {
    pet.exp -= pet.expToNext;
    pet.level += 1;
    levelsGained += 1;
    const formChange = updatePetFormForLevel(pet);
    if (formChange) {
      formChanges.push(formChange);
    }
    refreshPetStatsForLevel(pet);
    pet.expToNext = getPetExperienceToNextLevel(pet.level);
  }

  if (pet.level >= PetTuning.maxLevel) {
    pet.level = PetTuning.maxLevel;
    pet.expToNext = Number.POSITIVE_INFINITY;
    pet.exp = Math.max(0, pet.exp);
  }

  return createPetExperienceResult(pet, levelBefore, expBefore, levelsGained, appliedExp, formChanges);
}

export function getPetExperienceToNextLevel(level: number): number {
  const normalizedLevel = normalizePetLevel(level);
  if (normalizedLevel <= 10) {
    return normalizedLevel * 50;
  }

  return (normalizedLevel + 1) * (normalizedLevel + 1) * (5 + (normalizedLevel - 10) * 2);
}

export function getPetBaseStats(
  species: string,
  level: number,
  qualities: {
    mpQuality: number;
    atkQuality: number;
  },
): Pick<PetState, 'maxHp' | 'maxMp' | 'atk' | 'def'> {
  const normalizedLevel = normalizePetLevel(level);
  const levelIndex = normalizedLevel - 1;
  const speciesBase = PetSpeciesBaseStats[species] ?? PetSpeciesBaseStats.monkey;

  return {
    maxHp: PetHpByLevel[levelIndex] ?? PetHpByLevel[PetHpByLevel.length - 1],
    maxMp: speciesBase.maxMp + qualities.mpQuality * 0.08 * levelIndex,
    atk: speciesBase.atk + qualities.atkQuality * 0.015 * levelIndex,
    def: Math.trunc((PetDefenseByLevel[levelIndex] ?? PetDefenseByLevel[PetDefenseByLevel.length - 1]) * 0.9),
  };
}

export function refreshPetStatsForLevel(pet: PetState): void {
  const stats = getPetBaseStats(pet.species, pet.level, pet);
  pet.maxHp = stats.maxHp;
  pet.hp = stats.maxHp;
  pet.maxMp = stats.maxMp;
  pet.mp = stats.maxMp;
  pet.atk = stats.atk;
  pet.def = stats.def;
}

export function createPetRuntime(
  pet: PetState,
  owner: PetOwnerSnapshot,
): PetRuntimeModel {
  return {
    petId: pet.id,
    runtimeKey: getPetRuntimeKey(pet),
    x: owner.x - owner.facingX * PetTuning.followOffsetX,
    y: owner.y + PetTuning.warpOffsetY,
    facingX: owner.facingX,
    state: 'idle',
  };
}

export function syncPetRuntimeWithRoster(
  roster: PetRoster,
  runtime: PetRuntimeModel | undefined,
  owner: PetOwnerSnapshot,
): PetRuntimeModel | undefined {
  const activePet = getActivePet(roster);
  if (!activePet) {
    return undefined;
  }

  if (!runtime || runtime.petId !== activePet.id || runtime.runtimeKey !== getPetRuntimeKey(activePet)) {
    return createPetRuntime(activePet, owner);
  }

  return runtime;
}

export function updatePetRuntime(
  runtime: PetRuntimeModel,
  pet: PetState,
  owner: PetOwnerSnapshot,
  deltaMs: number,
): void {
  const desiredX = owner.x - owner.facingX * PetTuning.followOffsetX;
  const desiredY = owner.y - PetTuning.followOffsetY;
  const dx = desiredX - runtime.x;
  const dy = desiredY - runtime.y;
  const distance = Math.hypot(dx, dy);

  runtime.facingX = dx < 0 ? -1 : dx > 0 ? 1 : owner.facingX;

  if (distance >= PetTuning.warpDistance) {
    runtime.x = owner.x;
    runtime.y = owner.y + PetTuning.warpOffsetY;
    runtime.state = 'warp';
    return;
  }

  if (distance <= PetTuning.followMinDistance) {
    runtime.state = 'idle';
    return;
  }

  const speedPxPerSecond = pet.moveSpeed * 90;
  const step = Math.min(distance, speedPxPerSecond * (deltaMs / 1000));
  runtime.x += (dx / distance) * step;
  runtime.y += (dy / distance) * step;
  runtime.state = 'follow';
}

export function applyPetMagicFlowerBuff(
  pet: PetState,
  buff: PetMagicFlowerBuff,
): void {
  pet.magicFlowerBuff = {
    ...buff,
    attackMultiplier: Math.max(1, buff.attackMultiplier),
    totalMs: Math.max(0, buff.totalMs),
    remainingMs: Math.max(0, buff.remainingMs),
  };
}

export function clearPetMagicFlowerBuff(pet: PetState): void {
  pet.magicFlowerBuff = undefined;
}

export function buildPetPanelLines(roster: PetRoster): string[] {
  const lines: string[] = [];
  const selected = getSelectedPet(roster);
  const active = getActivePet(roster);

  lines.push(`══ PETS ${roster.pets.length}/${PetTuning.maxSeats} ══`);
  lines.push(`Active: ${active ? active.displayName : '-'}`);
  lines.push(`Message: ${roster.message}`);
  lines.push('');
  lines.push('List');

  if (roster.pets.length === 0) {
    lines.push('  - empty -');
  } else {
    for (let i = 0; i < roster.pets.length; i += 1) {
      const pet = roster.pets[i];
      const pointer = i === roster.selectedIndex ? '▶' : ' ';
      const activeMark = pet.isActive ? '(出战)' : '';
      lines.push(
        `${pointer}${pet.displayName}${activeMark} F${pet.form} Lv.${pet.level} HP ${pet.hp}/${pet.maxHp} Life ${pet.lifetime}/100`,
      );
    }
  }

  lines.push('');
  lines.push('Selected');
  if (selected) {
    lines.push(`Species: ${selected.species}${selected.form}  Quality:${selected.quality}`);
    lines.push(`MP ${selected.mp}/${selected.maxMp}  ATK ${selected.atk}  DEF ${selected.def}  CRIT +${((selected.critBonusRate ?? 0) * 100).toFixed(2)}%  SKILL +${(selected.skillDamageBonus ?? 0).toFixed(1)}`);
    lines.push(`EXP ${selected.exp}/${formatPetNextExperience(selected)}`);
    lines.push(`悟 ${selected.perception}  技 ${selected.technique}  战 ${selected.warpower}`);
    lines.push(`Skills: ${selected.skills.length > 0 ? selected.skills.join(', ') : '-'}`);
    for (const slot of buildPetSkillSlotViews(selected)) {
      lines.push(
        `Slot ${slot.slot}: ${slot.isEmpty ? '-' : `${slot.skillKey} ${slot.name}${slot.isKnown ? '' : ' (unknown)'}`}`,
      );
    }
    const skillState = selected.skillState;
    if (skillState) {
      lines.push(`XJ ready:${skillState.monkey1Xj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey1Xj.cooldownMs)}ms`);
      lines.push(`LJ cd:${Math.ceil(skillState.monkey2Lj.cooldownMs)}ms`);
      lines.push(`M2 XJ ready:${skillState.monkey2Xj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey2Xj.cooldownMs)}ms`);
      lines.push(`M3 LYQ cd:${Math.ceil(skillState.monkey3Lyq.cooldownMs)}ms`);
      lines.push(`M3 XJ cd:${Math.ceil(skillState.monkey3Xj.cooldownMs)}ms`);
      lines.push(`M3 LJ ready:${skillState.monkey3Lj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey3Lj.cooldownMs)}ms`);
      lines.push(`M4 JGAOYI cd:${Math.ceil(skillState.monkey4Jgaoyi.cooldownMs)}ms`);
      lines.push(`H1 SP cd:${Math.ceil(skillState.horse1Sp.cooldownMs)}ms`);
      lines.push(`H2 BD ready:${skillState.horse2Bd.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.horse2Bd.cooldownMs)}ms`);
      lines.push(`H3 BZ cd:${Math.ceil(skillState.horse3Bz.cooldownMs)}ms`);
      lines.push(`H4 TMAOYI cd:${Math.ceil(skillState.horse4Tmaoyi.cooldownMs)}ms`);
      lines.push(`Last skill: ${skillState.lastResult}`);
    }
    const autoBuffState = selected.autoBuffState;
    if (autoBuffState) {
      const sxkbActive = autoBuffState.sxkb.active;
      const fsnlActive = autoBuffState.fsnl.active;
      const smjcActive = autoBuffState.smjc.active;
      const mfjcActive = autoBuffState.mfjc.active;
      const gjjcActive = autoBuffState.gjjc.active;
      const fyjcActive = autoBuffState.fyjc.active;
      lines.push(
        `SXKB ${sxkbActive ? `+${((sxkbActive.bonusCritRate ?? 0) * 100).toFixed(2)}% ${formatPetAutoBuffMs(sxkbActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.sxkb.counterMs)}`}`,
      );
      lines.push(
        `FSNL ${fsnlActive ? `+${(fsnlActive.bonusSkillDamage ?? 0).toFixed(1)} ${formatPetAutoBuffMs(fsnlActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.fsnl.counterMs)}`}`,
      );
      lines.push(
        `SMJC ${smjcActive ? `+${(smjcActive.bonusMaxHp ?? 0).toFixed(1)} ${formatPetAutoBuffMs(smjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.smjc.counterMs)}`}`,
      );
      lines.push(
        `MFJC ${mfjcActive ? `+${(mfjcActive.bonusMaxMp ?? 0).toFixed(1)} ${formatPetAutoBuffMs(mfjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.mfjc.counterMs)}`}`,
      );
      lines.push(
        `GJJC ${gjjcActive ? `+${(gjjcActive.bonusPower ?? 0).toFixed(1)} ${formatPetAutoBuffMs(gjjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.gjjc.counterMs)}`}`,
      );
      lines.push(
        `FYJC ${fyjcActive ? `+${(fyjcActive.bonusDefense ?? 0).toFixed(1)} ${formatPetAutoBuffMs(fyjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.fyjc.counterMs)}`}`,
      );
      lines.push(`Last auto: ${autoBuffState.lastResult}`);
    }
  } else {
    lines.push('-');
  }

  lines.push('');
  lines.push('[↑/↓] select  [Enter] 出战/休息  [B] close');
  return lines;
}

function createCapturablePetDefinition(
  monsterId: CapturableMonsterId,
  petName: string,
  displayName: string,
  species: string,
  form: number,
  probability: number,
): CapturablePetDefinition {
  return { monsterId, petName, displayName, species, form, probability };
}

function findCapturablePetDefinitionByPetName(
  petName: string,
): CapturablePetDefinition | undefined {
  return Object.values(CapturablePetDefinitions).find((definition) =>
    definition.petName === petName
  );
}

function createFallbackPetDefinition(petName: string): CapturablePetDefinition {
  const form = Number.parseInt(petName.match(/\d+$/)?.[0] ?? '1', 10);
  const species = petName.replace(/\d+$/, '') || petName;
  return createCapturablePetDefinition('Monster72', petName, petName, species, form, 1);
}

function createPetStateFromDefinition(
  definition: CapturablePetDefinition,
  level: number,
  serial: number,
): PetState {
  const normalizedLevel = Math.max(1, Math.floor(level));
  const qualities = createDefaultPetQualities();
  const stats = getPetBaseStats(definition.species, normalizedLevel, qualities);

  return {
    id: `pet-${definition.petName}-${serial}`,
    species: definition.species,
    form: definition.form,
    displayName: definition.displayName,
    level: normalizedLevel,
    exp: 0,
    expToNext: getPetExperienceToNextLevel(normalizedLevel),
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mp: stats.maxMp,
    maxMp: stats.maxMp,
    atk: stats.atk,
    def: stats.def,
    critBonusRate: 0,
    skillDamageBonus: 0,
    moveSpeed: 5,
    lifetime: 100,
    quality: normalizedLevel === 1 ? 1 : 2,
    ...qualities,
    perception: 1,
    technique: 1,
    warpower: 1,
    isActive: false,
    skills: ['tsml'],
    skillState: createPetSkillState(),
  };
}

function buildPetSkillCandidatePool(pet: PetState): string[] {
  const candidates: string[] = [...PetBaseSkillCandidates];
  candidates.push(...getPetFormSkillCandidates(pet.species, pet.form));
  return candidates.filter((skillKey, index) =>
    candidates.indexOf(skillKey) === index && !pet.skills.includes(skillKey)
  );
}

function getPetFormSkillCandidates(species: string, form: number): string[] {
  if (species === 'monkey') {
    if (form <= 1) {
      return ['xj'];
    }
    if (form === 2) {
      return ['xj', 'lj'];
    }
    if (form === 3) {
      return ['xj', 'lj', 'lyq'];
    }
    return ['xj', 'lj', 'lyq', 'jgaoyi'];
  }

  if (species === 'horse') {
    if (form <= 1) {
      return ['sp'];
    }
    if (form === 2) {
      return ['sp', 'bd'];
    }
    if (form === 3) {
      return ['sp', 'bd', 'bz'];
    }
    return ['sp', 'bd', 'bz', 'tmaoyi'];
  }

  return [];
}

function tryStudyPetSkillAtLevel(
  pet: PetState,
  candidates: string[],
  level: number,
  random: PetSkillRandomSource,
): void {
  if ((level + 1) % 3 !== 0) {
    return;
  }

  if (pet.skills.length >= pet.perception || candidates.length === 0) {
    return;
  }

  if (random() > 0.4) {
    return;
  }

  const index = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)));
  const [skillKey] = candidates.splice(index, 1);
  if (skillKey && !pet.skills.includes(skillKey)) {
    pet.skills.push(skillKey);
  }
}

function createPetSkillState(): PetSkillState {
  return {
    monkey1Xj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey2Lj: {
      cooldownMs: 0,
    },
    monkey2Xj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey3Lyq: {
      cooldownMs: 0,
    },
    monkey3Xj: {
      cooldownMs: 0,
    },
    monkey3Lj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey4Jgaoyi: {
      cooldownMs: 0,
    },
    horse1Sp: {
      cooldownMs: 0,
    },
    horse2Bd: {
      releaseReady: false,
      cooldownMs: 0,
    },
    horse3Bz: {
      cooldownMs: 0,
    },
    horse4Tmaoyi: {
      cooldownMs: 0,
    },
    lastResult: 'pet skill ready',
  };
}

function createPetAutoBuffState(): PetAutoBuffState {
  return {
    sxkb: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    fsnl: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    smjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    mfjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    gjjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    fyjc: {
      counterMs: petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames),
    },
    lastResult: 'pet auto buff ready',
  };
}

function ensurePetSkillState(pet: PetState): PetSkillState {
  pet.skillState ??= createPetSkillState();
  return pet.skillState;
}

function ensurePetAutoBuffState(pet: PetState): PetAutoBuffState {
  pet.autoBuffState ??= createPetAutoBuffState();
  const initialCounterMs = petAutoBuffFramesToMs(PetTuning.autoBuffInitialDelayFrames);
  pet.autoBuffState.sxkb ??= { counterMs: initialCounterMs };
  pet.autoBuffState.fsnl ??= { counterMs: initialCounterMs };
  pet.autoBuffState.smjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.mfjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.gjjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.fyjc ??= { counterMs: initialCounterMs };
  pet.autoBuffState.lastResult ??= 'pet auto buff ready';
  return pet.autoBuffState;
}

function updateActivePetAutoBuffEffect(
  roster: PetRoster,
  pet: PetState,
  effect: PetAutoBuffEffectState,
  ownerStats: PetAutoBuffOwnerStats,
  deltaMs: number,
): boolean {
  const active = effect.active;
  if (!active) {
    return false;
  }

  active.remainingMs -= deltaMs;
  if (active.remainingMs > 0) {
    return false;
  }

  const state = ensurePetAutoBuffState(pet);
  if (active.kind === 'sxkb') {
    const bonusCritRate = active.bonusCritRate ?? 0;
    pet.critBonusRate = Math.max(0, (pet.critBonusRate ?? 0) - bonusCritRate);
    const message = `${pet.displayName} sxkb expired -${(bonusCritRate * 100).toFixed(2)}% crit`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'fsnl') {
    const bonusSkillDamage = active.bonusSkillDamage ?? 0;
    pet.skillDamageBonus = Math.max(0, (pet.skillDamageBonus ?? 0) - bonusSkillDamage);
    const message = `${pet.displayName} fsnl expired -${bonusSkillDamage.toFixed(1)} skill damage`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'smjc') {
    const bonusMaxHp = active.bonusMaxHp ?? 0;
    const ratio = ownerStats.maxHp > 0 ? ownerStats.hp / ownerStats.maxHp : 0;
    ownerStats.maxHp = Math.max(1, ownerStats.maxHp - bonusMaxHp);
    ownerStats.hp = Math.min(ownerStats.maxHp, ownerStats.maxHp * ratio);
    const message = `${pet.displayName} smjc expired -${bonusMaxHp.toFixed(1)} maxHp`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'mfjc') {
    const bonusMaxMp = active.bonusMaxMp ?? 0;
    const ratio = ownerStats.maxMp > 0 ? ownerStats.mp / ownerStats.maxMp : 0;
    ownerStats.maxMp = Math.max(1, ownerStats.maxMp - bonusMaxMp);
    ownerStats.mp = Math.min(ownerStats.maxMp, ownerStats.maxMp * ratio);
    const message = `${pet.displayName} mfjc expired -${bonusMaxMp.toFixed(1)} maxMp`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  if (active.kind === 'fyjc') {
    const bonusDefense = active.bonusDefense ?? 0;
    ownerStats.defense -= bonusDefense;
    const message = `${pet.displayName} fyjc expired -${bonusDefense.toFixed(1)} defense`;
    effect.active = undefined;
    state.lastResult = message;
    roster.message = message;
    return true;
  }

  const bonusPower = active.bonusPower ?? 0;
  ownerStats.power -= bonusPower;
  const message = `${pet.displayName} gjjc expired -${bonusPower.toFixed(1)} power`;
  effect.active = undefined;
  state.lastResult = message;
  roster.message = message;
  return true;
}

function tryTriggerPetSxkbAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
): PetAutoBuffUpdateResult | undefined {
  const sxkb = state.sxkb;
  if (sxkb.active || sxkb.counterMs > 0 || !pet.skills.includes('sxkb')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffSxkbMpCost) {
    const message = `${pet.displayName} sxkb MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusCritRate = calculatePetSxkbCritBonusRate(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffSxkbMpCost);
  pet.critBonusRate = (pet.critBonusRate ?? 0) + bonusCritRate;
  sxkb.active = {
    kind: 'sxkb',
    bonusCritRate,
    totalMs,
    remainingMs: totalMs,
  };
  sxkb.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffSxkbRetriggerFrames);

  const message = `${pet.displayName} sxkb +${(bonusCritRate * 100).toFixed(2)}% crit`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusCritRate,
  };
}

function tryTriggerPetFsnlAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
): PetAutoBuffUpdateResult | undefined {
  const fsnl = state.fsnl;
  if (fsnl.active || fsnl.counterMs > 0 || !pet.skills.includes('fsnl')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffFsnlMpCost) {
    const message = `${pet.displayName} fsnl MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusSkillDamage = calculatePetFsnlSkillDamageBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffFsnlMpCost);
  pet.skillDamageBonus = (pet.skillDamageBonus ?? 0) + bonusSkillDamage;
  fsnl.active = {
    kind: 'fsnl',
    bonusSkillDamage,
    totalMs,
    remainingMs: totalMs,
  };
  fsnl.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffFsnlRetriggerFrames);

  const message = `${pet.displayName} fsnl +${bonusSkillDamage.toFixed(1)} skill damage`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusSkillDamage,
  };
}

function tryTriggerPetSmjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const smjc = state.smjc;
  if (smjc.active || smjc.counterMs > 0 || !pet.skills.includes('smjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffSmjcMpCost) {
    const message = `${pet.displayName} smjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusMaxHp = calculatePetSmjcMaxHpBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  const ratio = ownerStats.maxHp > 0 ? ownerStats.hp / ownerStats.maxHp : 0;
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffSmjcMpCost);
  ownerStats.maxHp += bonusMaxHp;
  ownerStats.hp = Math.min(ownerStats.maxHp, ownerStats.maxHp * ratio);
  smjc.active = {
    kind: 'smjc',
    bonusMaxHp,
    totalMs,
    remainingMs: totalMs,
  };
  smjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffSmjcRetriggerFrames);

  const message = `${pet.displayName} smjc +${bonusMaxHp.toFixed(1)} maxHp`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusMaxHp,
  };
}

function tryTriggerPetMfjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const mfjc = state.mfjc;
  if (mfjc.active || mfjc.counterMs > 0 || !pet.skills.includes('mfjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffMfjcMpCost) {
    const message = `${pet.displayName} mfjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusMaxMp = calculatePetMfjcMaxMpBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  const ratio = ownerStats.maxMp > 0 ? ownerStats.mp / ownerStats.maxMp : 0;
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffMfjcMpCost);
  ownerStats.maxMp += bonusMaxMp;
  ownerStats.mp = Math.min(ownerStats.maxMp, ownerStats.maxMp * ratio);
  mfjc.active = {
    kind: 'mfjc',
    bonusMaxMp,
    totalMs,
    remainingMs: totalMs,
  };
  mfjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffMfjcRetriggerFrames);

  const message = `${pet.displayName} mfjc +${bonusMaxMp.toFixed(1)} maxMp`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusMaxMp,
  };
}

function tryTriggerPetGjjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const gjjc = state.gjjc;
  if (gjjc.active || gjjc.counterMs > 0 || !pet.skills.includes('gjjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffGjjcMpCost) {
    const message = `${pet.displayName} gjjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusPower = calculatePetGjjcPowerBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffGjjcMpCost);
  ownerStats.power += bonusPower;
  gjjc.active = {
    kind: 'gjjc',
    bonusPower,
    totalMs,
    remainingMs: totalMs,
  };
  gjjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffGjjcRetriggerFrames);

  const message = `${pet.displayName} gjjc +${bonusPower.toFixed(1)} power`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusPower,
  };
}

function tryTriggerPetFyjcAutoBuff(
  roster: PetRoster,
  pet: PetState,
  state: PetAutoBuffState,
  ownerStats: PetAutoBuffOwnerStats,
): PetAutoBuffUpdateResult | undefined {
  const fyjc = state.fyjc;
  if (fyjc.active || fyjc.counterMs > 0 || !pet.skills.includes('fyjc')) {
    return undefined;
  }

  if (pet.mp < PetTuning.autoBuffFyjcMpCost) {
    const message = `${pet.displayName} fyjc MP not enough`;
    state.lastResult = message;
    roster.message = message;
    return {
      triggered: false,
      expired: false,
      message,
      pet,
    };
  }

  const mpBefore = pet.mp;
  const bonusDefense = calculatePetFyjcDefenseBonus(pet);
  const totalMs = calculatePetAutoBuffDurationMs(pet);
  pet.mp = Math.max(0, pet.mp - PetTuning.autoBuffFyjcMpCost);
  ownerStats.defense += bonusDefense;
  fyjc.active = {
    kind: 'fyjc',
    bonusDefense,
    totalMs,
    remainingMs: totalMs,
  };
  fyjc.counterMs = petAutoBuffFramesToMs(PetTuning.autoBuffFyjcRetriggerFrames);

  const message = `${pet.displayName} fyjc +${bonusDefense.toFixed(1)} defense`;
  state.lastResult = message;
  roster.message = message;
  return {
    triggered: true,
    expired: false,
    message,
    pet,
    mpBefore,
    mpAfter: pet.mp,
    bonusDefense,
  };
}

function calculatePetSxkbCritBonusRate(pet: PetState): number {
  return pet.form * 0.07 * pet.technique * 0.27 * 1.05;
}

function calculatePetFsnlSkillDamageBonus(pet: PetState): number {
  return pet.form * 30 * pet.technique * 1.05;
}

function calculatePetSkillDamage(
  pet: PetState,
  multiplier: number,
  random: PetSkillRandomSource = Math.random,
): number {
  const baseDamage = pet.atk * multiplier + Math.max(0, pet.skillDamageBonus ?? 0);
  const critRate = Math.max(0, Math.min(1, pet.critBonusRate ?? 0));
  if (critRate <= 0) {
    return baseDamage;
  }

  return random() <= critRate ? baseDamage * PetTuning.petSkillCritDamageMultiplier : baseDamage;
}

function calculatePetSmjcMaxHpBonus(pet: PetState): number {
  return pet.form * 70 * pet.technique * 1.05;
}

function calculatePetMfjcMaxMpBonus(pet: PetState): number {
  return pet.form * 70 * pet.technique * 1.05;
}

function calculatePetGjjcPowerBonus(pet: PetState): number {
  return pet.form * 6 * pet.technique * 1.05;
}

function calculatePetFyjcDefenseBonus(pet: PetState): number {
  return pet.form * 5 * pet.technique * 1.05;
}

function calculatePetQlfjCounterChance(pet: PetState): number {
  return Math.max(0, Math.min(1, (
    PetTuning.qlfjBaseChance + pet.form * PetTuning.qlfjFormChanceStep
  ) * pet.warpower * PetTuning.qlfjChanceMultiplier));
}

function calculatePetAutoBuffDurationMs(pet: PetState): number {
  const seconds = (30 + pet.form * 5) * pet.warpower / 2 * 0.6;
  return Math.max(0, seconds * 1000);
}

function petAutoBuffFramesToMs(frames: number): number {
  return Math.max(0, frames * PetTuning.autoBuffFrameMs);
}

function setPetSkillFailure(
  roster: PetRoster,
  message: string,
  pet?: PetState,
): PetSkillCastResult {
  if (pet) {
    ensurePetSkillState(pet).lastResult = message;
  }
  roster.message = message;
  return { ok: false, message, pet };
}

function selectPetSkillTarget(
  runtime: PetRuntimeModel | undefined,
  targets: readonly PetSkillTarget[],
): PetSkillTarget | undefined {
  const aliveTargets = targets.filter((target) => target.isAlive);
  if (aliveTargets.length === 0) {
    return undefined;
  }

  if (!runtime) {
    return aliveTargets[0];
  }

  return aliveTargets.reduce((nearest, target) => {
    const nearestDistance = Math.hypot(nearest.x - runtime.x, nearest.y - runtime.y);
    const targetDistance = Math.hypot(target.x - runtime.x, target.y - runtime.y);
    return targetDistance < nearestDistance ? target : nearest;
  });
}

function getPetSkillDistance(
  runtime: PetRuntimeModel | undefined,
  target: PetSkillTarget,
): number {
  if (!runtime) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.hypot(target.x - runtime.x, target.y - runtime.y);
}

function getPetSkillFacing(
  runtime: PetRuntimeModel | undefined,
  target: PetSkillTarget,
): -1 | 1 {
  if (!runtime) {
    return 1;
  }
  return target.x < runtime.x ? -1 : 1;
}

function updatePetFormForLevel(pet: PetState): PetFormChange | undefined {
  const nextForm = getNextPetFormForLevel(pet.form, pet.level);
  if (nextForm === pet.form) {
    return undefined;
  }

  const previousForm = pet.form;
  const previousDisplayName = pet.displayName;
  pet.form = nextForm;
  pet.displayName = formatPetDisplayNameForForm(pet.displayName, nextForm);

  return {
    fromForm: previousForm,
    toForm: nextForm,
    fromDisplayName: previousDisplayName,
    toDisplayName: pet.displayName,
    level: pet.level,
  };
}

function getNextPetFormForLevel(currentForm: number, level: number): number {
  if (currentForm === 1 && level >= 16 && level < 30) {
    return 2;
  }
  if (currentForm === 2 && level > 30) {
    return 3;
  }
  return currentForm;
}

function formatPetDisplayNameForForm(displayName: string, form: number): string {
  return displayName.replace(/\s*F[123]$/, '') + ` F${form}`;
}

function getPetRuntimeKey(pet: PetState): string {
  return `${pet.id}:${pet.species}:${pet.form}`;
}

function createDefaultPetQualities(): Pick<PetState, 'hpQuality' | 'mpQuality' | 'atkQuality' | 'defQuality'> {
  return {
    hpQuality: 1,
    mpQuality: 1,
    atkQuality: 1,
    defQuality: 1,
  };
}

function normalizePetLevel(level: number): number {
  return Math.min(
    PetTuning.maxLevel,
    Math.max(1, Math.floor(level)),
  );
}

function createPetExperienceResult(
  pet: PetState,
  levelBefore: number,
  expBefore: number,
  levelsGained: number,
  appliedExp: number,
  formChanges: PetFormChange[],
): PetExperienceResult {
  return {
    expBefore,
    expAfter: pet.exp,
    levelBefore,
    levelAfter: pet.level,
    levelsGained,
    formChanges,
    expToNext: pet.expToNext,
    appliedExp,
  };
}

function formatPetNextExperience(pet: PetState): string {
  return Number.isFinite(pet.expToNext) ? String(pet.expToNext) : 'MAX';
}

function formatPetAutoBuffMs(value: number): string {
  return `${Math.max(0, value / 1000).toFixed(1)}s`;
}

function rectanglesOverlap(
  effect: MagicBottleEffect,
  target: CapturablePetTarget,
): boolean {
  const effectLeft = effect.x - effect.width / 2;
  const effectRight = effect.x + effect.width / 2;
  const effectTop = effect.y - effect.height / 2;
  const effectBottom = effect.y + effect.height / 2;
  const targetLeft = target.x - target.width / 2;
  const targetRight = target.x + target.width / 2;
  const targetTop = target.y - target.height / 2;
  const targetBottom = target.y + target.height / 2;

  return effectLeft <= targetRight &&
    effectRight >= targetLeft &&
    effectTop <= targetBottom &&
    effectBottom >= targetTop;
}
