import heroProgressionCatalog from '../../docs/reverse-engineering/reference/hero-progression-catalog-1.1.json';
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
  maxLevel: heroProgressionCatalog.experienceCurve.maxLevel,
  maxLevelExpToNext: heroProgressionCatalog.experienceCurve.sentinelExpToNext,
  monster30Experience: 4,
} as const;

const experienceByLevel = new Map(
  heroProgressionCatalog.experienceCurve.levels.map((entry) => [entry.level, entry.expToNext]),
);
const statsByHeroAndLevel = new Map(
  heroProgressionCatalog.roles.flatMap((role) => role.levels.map((entry) => [
    `${role.heroId}:${entry.level}`,
    entry,
  ] as const)),
);

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

  const proposedTotal = progression.currentExp + appliedExp;
  if (
    progression.level >= ProgressionTuning.maxLevel &&
    proposedTotal >= ProgressionTuning.maxLevelExpToNext
  ) {
    progression.lastResult = `+${appliedExp} exp ignored | Lv.${progression.level} MAX`;
    return createProgressionResult(
      progression,
      levelBefore,
      expBefore,
      baseStatsBefore,
      0,
      appliedExp,
    );
  }

  progression.currentExp = proposedTotal;
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
  const expToNext = experienceByLevel.get(normalizedLevel);
  if (expToNext === undefined) throw new RangeError(`Missing progression level ${normalizedLevel}.`);
  return expToNext;
}

export function getHeroBaseStats(heroId: HeroId, level: number): HeroBaseStats {
  const normalizedLevel = normalizeHeroLevel(level);
  const entry = statsByHeroAndLevel.get(`${heroId}:${normalizedLevel}`);
  if (!entry) throw new RangeError(`Missing progression stats for R${heroId} Lv.${normalizedLevel}.`);
  return {
    maxHp: entry.maxHp,
    maxMp: entry.maxMp,
    power: entry.power,
    defense: entry.defense,
  };
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
