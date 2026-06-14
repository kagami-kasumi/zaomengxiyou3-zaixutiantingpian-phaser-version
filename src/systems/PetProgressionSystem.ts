import {
  PetBaseSkillCandidates,
  PetDefenseByLevel,
  PetHpByLevel,
  PetSpeciesBaseStats,
  PetTuning,
} from './PetTuning';
import type {
  PetExperienceResult,
  PetFormChange,
  PetSkillRandomSource,
  PetSkillResetResult,
  PetState,
} from './PetTypes';

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

export function createDefaultPetQualities(): Pick<PetState, 'hpQuality' | 'mpQuality' | 'atkQuality' | 'defQuality'> {
  return {
    hpQuality: 1,
    mpQuality: 1,
    atkQuality: 1,
    defQuality: 1,
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

  if (species === 'dragon') {
    if (form <= 1) {
      return ['fs'];
    }
    if (form === 2) {
      return ['fs', 'sdcc'];
    }
    if (form === 3) {
      return ['fs', 'sdcc', 'ltwj'];
    }
    return ['fs', 'sdcc', 'ltwj', 'qlaoyi'];
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
