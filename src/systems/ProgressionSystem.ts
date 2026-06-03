import type { HeroBaseStats } from './EquipmentSystem';
import type { HeroId } from './HeroNormalAttackSystem';

export type HeroProgressionModel = {
  heroId: HeroId;
  level: number;
  currentExp: number;
  expToNext: number;
  lastResult: string;
};

export type HeroProgressionResult = {
  expBefore: number;
  expAfter: number;
  levelBefore: number;
  levelAfter: number;
  levelsGained: number;
  baseStatsBefore: HeroBaseStats;
  baseStatsAfter: HeroBaseStats;
  appliedExp: number;
};

export const ProgressionTuning = {
  maxLevel: 90,
  maxLevelExpToNext: 999_999_999,
  monster30Experience: 4,
} as const;

export function createHeroProgression(
  heroId: HeroId,
  level = 1,
  currentExp = 0,
): HeroProgressionModel {
  const normalizedLevel = normalizeHeroLevel(level);
  const expToNext = getHeroExperienceToNextLevel(normalizedLevel);
  return {
    heroId,
    level: normalizedLevel,
    currentExp: clampExperience(currentExp, expToNext),
    expToNext,
    lastResult: 'ready',
  };
}

export function setHeroProgressionHero(
  progression: HeroProgressionModel,
  heroId: HeroId,
): void {
  progression.heroId = heroId;
  progression.lastResult = `hero R${heroId}`;
}

export function addHeroExperience(
  progression: HeroProgressionModel,
  amount: number,
): HeroProgressionResult {
  const appliedExp = Math.max(0, Math.floor(amount));
  const levelBefore = progression.level;
  const expBefore = progression.currentExp;
  const baseStatsBefore = getHeroBaseStats(progression.heroId, progression.level);

  if (appliedExp <= 0) {
    progression.lastResult = `+0 exp | Lv.${progression.level}`;
    return createProgressionResult(
      progression,
      levelBefore,
      expBefore,
      baseStatsBefore,
      0,
      appliedExp,
    );
  }

  progression.currentExp += appliedExp;
  let levelsGained = 0;

  while (
    progression.level < ProgressionTuning.maxLevel &&
    progression.currentExp >= progression.expToNext
  ) {
    progression.currentExp -= progression.expToNext;
    progression.level += 1;
    levelsGained += 1;
    progression.expToNext = getHeroExperienceToNextLevel(progression.level);
  }

  if (progression.level >= ProgressionTuning.maxLevel) {
    progression.level = ProgressionTuning.maxLevel;
    progression.expToNext = ProgressionTuning.maxLevelExpToNext;
    progression.currentExp = Math.min(progression.currentExp, progression.expToNext - 1);
  }

  progression.lastResult = levelsGained > 0
    ? `+${appliedExp} exp | Lv.${levelBefore}->${progression.level} (${progression.currentExp}/${progression.expToNext})`
    : `+${appliedExp} exp | Lv.${progression.level} (${progression.currentExp}/${progression.expToNext})`;

  return createProgressionResult(
    progression,
    levelBefore,
    expBefore,
    baseStatsBefore,
    levelsGained,
    appliedExp,
  );
}

export function getHeroExperienceToNextLevel(level: number): number {
  const normalizedLevel = normalizeHeroLevel(level);
  if (normalizedLevel < 7) {
    return 135 + 10 * (normalizedLevel - 1);
  }
  if (normalizedLevel < 13) {
    return 625 + 50 * (normalizedLevel - 7);
  }
  if (normalizedLevel < 19) {
    return 1950 + 100 * (normalizedLevel - 13);
  }
  if (normalizedLevel < 89) {
    return 5000 + 5000 * (normalizedLevel - 19);
  }
  return ProgressionTuning.maxLevelExpToNext;
}

export function getHeroBaseStats(heroId: HeroId, level: number): HeroBaseStats {
  const levelOffset = normalizeHeroLevel(level) - 1;

  switch (heroId) {
    case 1:
      return {
        maxHp: 80 + 50 * levelOffset,
        maxMp: 50 + 20 * levelOffset,
        power: 10 + 5 * levelOffset,
        defense: 2 + 2 * levelOffset,
      };
    case 2:
      return {
        maxHp: 50 + 20 * levelOffset,
        maxMp: 100 + 40 * levelOffset,
        power: 12 + 8 * levelOffset,
        defense: levelOffset,
      };
    case 3:
      return {
        maxHp: 100 + 70 * levelOffset,
        maxMp: 35 + 15 * levelOffset,
        power: 15 + 8 * levelOffset,
        defense: 4 + levelOffset,
      };
    case 4:
      return {
        maxHp: 70 + 30 * levelOffset,
        maxMp: 70 + 30 * levelOffset,
        power: 9 + 4 * levelOffset,
        defense: levelOffset,
      };
    case 5:
      return {
        maxHp: 70 + 49 * levelOffset,
        maxMp: 55 + 24 * levelOffset,
        power: 9 + 6 * levelOffset,
        defense: 2 + 1.5 * levelOffset,
      };
  }
}

export function formatHeroProgression(progression: HeroProgressionModel): string {
  const expText = progression.level >= ProgressionTuning.maxLevel
    ? 'MAX'
    : `${progression.currentExp}/${progression.expToNext}`;
  return `R${progression.heroId} Lv.${progression.level} exp:${expText} | ${progression.lastResult}`;
}

function normalizeHeroLevel(level: number): number {
  return Math.min(
    ProgressionTuning.maxLevel,
    Math.max(1, Math.floor(level)),
  );
}

function clampExperience(value: number, expToNext: number): number {
  return Math.min(
    Math.max(0, Math.floor(value)),
    Math.max(0, expToNext - 1),
  );
}

function createProgressionResult(
  progression: HeroProgressionModel,
  levelBefore: number,
  expBefore: number,
  baseStatsBefore: HeroBaseStats,
  levelsGained: number,
  appliedExp: number,
): HeroProgressionResult {
  return {
    expBefore,
    expAfter: progression.currentExp,
    levelBefore,
    levelAfter: progression.level,
    levelsGained,
    baseStatsBefore,
    baseStatsAfter: getHeroBaseStats(progression.heroId, progression.level),
    appliedExp,
  };
}
