import {
  spawnPetMonkey2LjProjectile,
  spawnPetMonkey1XjProjectile,
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
  lastResult: string;
};

export type PetMonkey1XjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey2LjSkillState = {
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

export type PetConsumableFillName = 'wphhd' | 'wpcsd' | 'djyys';

export type PetConsumableResult = {
  ok: boolean;
  shouldConsume: boolean;
  message: string;
  pet?: PetState;
  experience?: PetExperienceResult;
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
} as const;

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
        skills: ['tsml', 'lj'],
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

  ensurePetSkillState(pet).monkey1Xj.releaseReady = true;
  roster.message = `${pet.displayName} xj trigger ready`;
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
  }
}

export function requestPetMonkey1XjSkill(params: {
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
  const damage = pet.atk * PetTuning.monkey1XjDamageMultiplier;
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
  const damage = pet.atk * PetTuning.monkey2LjDamageMultiplier;
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
  return fillName === 'wphhd' || fillName === 'wpcsd' || fillName === 'djyys';
}

export function usePetConsumable(
  roster: PetRoster,
  fillName: PetConsumableFillName,
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

  const experience = addPetExperience(pet, PetTuning.petExperienceStoneExp);
  const message = experience.levelsGained > 0
    ? `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp} Lv.${experience.levelBefore}->${experience.levelAfter}`
    : `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp}`;
  roster.message = message;
  return { ok: true, shouldConsume: true, message, pet, experience };
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
    lines.push(`MP ${selected.mp}/${selected.maxMp}  ATK ${selected.atk}  DEF ${selected.def}`);
    lines.push(`EXP ${selected.exp}/${formatPetNextExperience(selected)}`);
    lines.push(`悟 ${selected.perception}  技 ${selected.technique}  战 ${selected.warpower}`);
    lines.push(`Skills: ${selected.skills.length > 0 ? selected.skills.join(', ') : '-'}`);
    const skillState = selected.skillState;
    if (skillState) {
      lines.push(`XJ ready:${skillState.monkey1Xj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey1Xj.cooldownMs)}ms`);
      lines.push(`LJ cd:${Math.ceil(skillState.monkey2Lj.cooldownMs)}ms`);
      lines.push(`Last skill: ${skillState.lastResult}`);
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

function createPetSkillState(): PetSkillState {
  return {
    monkey1Xj: {
      releaseReady: false,
      cooldownMs: 0,
    },
    monkey2Lj: {
      cooldownMs: 0,
    },
    lastResult: 'pet skill ready',
  };
}

function ensurePetSkillState(pet: PetState): PetSkillState {
  pet.skillState ??= createPetSkillState();
  return pet.skillState;
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
